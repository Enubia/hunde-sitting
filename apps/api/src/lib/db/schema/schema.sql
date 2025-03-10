-- Create enum types for categorical fields
CREATE TYPE auth_provider AS ENUM ('google', 'facebook', 'apple', 'github');

CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE service_type AS ENUM ('dog_walking', 'overnight_stay', 'daycare', 'boarding', 'training', 'grooming', 'vet_visits', 'pet_taxi');

CREATE TYPE size_category AS ENUM ('tiny', 'small', 'medium', 'large', 'giant');

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected');

CREATE TYPE location_type AS ENUM ('sitter_home', 'client_home', 'park', 'other');

CREATE TYPE sex AS ENUM ('male', 'female');

CREATE TYPE admin_role AS ENUM ('admin', 'super_admin');

CREATE TYPE vaccination_status AS ENUM ('fully_vaccinated', 'partially_vaccinated', 'not_vaccinated', 'unknown');

-- Now create tables with the enum types
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    bio TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE oauth_accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider auth_provider NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (provider, provider_user_id)
);

CREATE TABLE sitters (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    bio TEXT,
    years_experience INTEGER,
    hourly_rate DECIMAL(10, 2),
    daily_rate DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    can_host_at_home BOOLEAN DEFAULT FALSE NOT NULL,
    max_dogs_at_once INTEGER DEFAULT 1 NOT NULL,
    service_radius_km DECIMAL(8, 2),
    last_location_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE sitter_services (
    id SERIAL PRIMARY KEY,
    sitter_id INT NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    service_name service_type NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE sitter_certificates (
    id SERIAL PRIMARY KEY,
    sitter_id INT NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    certificate_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiration_date DATE,
    certificate_file_path TEXT,
    verification_status verification_status DEFAULT 'pending' NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE dog_breeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    size_category size_category NOT NULL,
    special_care_requirements TEXT,
    requires_certificate BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE sitter_breed_specialties (
    sitter_id INT NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    breed_id INT NOT NULL REFERENCES dog_breeds (id) ON DELETE CASCADE,
    experience_years INTEGER DEFAULT 0 NOT NULL,
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (sitter_id, breed_id)
);

CREATE TABLE dogs (
    id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    breed_id INT REFERENCES dog_breeds (id) ON DELETE SET NULL,
    mixed_breed BOOLEAN DEFAULT FALSE NOT NULL,
    age_years INTEGER,
    age_months INTEGER,
    weight_kg DECIMAL(5, 2),
    sex sex,
    is_neutered BOOLEAN,
    special_needs TEXT,
    medical_conditions TEXT,
    vaccination_status vaccination_status DEFAULT 'unknown' NOT NULL,
    temperament TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    sitter_id INT NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    dog_id INT NOT NULL REFERENCES dogs (id) ON DELETE CASCADE,
    service_id INT REFERENCES sitter_services (id) ON DELETE SET NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location_type location_type NOT NULL,
    location_address TEXT,
    special_instructions TEXT,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings (id) ON DELETE SET NULL,
    reviewer_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reviewee_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE availability (
    id SERIAL PRIMARY KEY,
    sitter_id INT NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TABLE unavailable_dates (
    id SERIAL PRIMARY KEY,
    sitter_id INT NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_date_range CHECK (start_date < end_date)
);

-- Create indexes
CREATE INDEX idx_sitters_verification_status ON sitters (verification_status);

CREATE INDEX idx_bookings_status ON bookings (status);

CREATE INDEX idx_bookings_date_range ON bookings (start_date, end_date);

CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_oauth_provider_user_id ON oauth_accounts (provider, provider_user_id);

CREATE INDEX idx_sitters_user_id ON sitters (user_id);

-- First, enable the PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Then add a geography column to the users table
ALTER TABLE users ADD COLUMN location geography (POINT);

-- Create a spatial index for efficient geo-queries
CREATE INDEX idx_users_location ON users USING GIST (location);

-- Create a function to update the geography point whenever lat/long are updated
CREATE OR REPLACE FUNCTION update_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON users
FOR EACH ROW
WHEN (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
EXECUTE FUNCTION update_location();

-- revisions and groups

-- User group and permission system
CREATE TYPE permission_level AS ENUM ('read', 'write', 'admin');

CREATE TYPE user_group_name AS ENUM ('administrators', 'moderators');

-- Update resource_name enum to include all tables
CREATE TYPE resource_name AS ENUM (
    'users', 
    'sitters', 
    'dogs', 
    'bookings', 
    'reviews', 
    'dog_breeds', 
    'sitter_certificates', 
    'sitter_services',
    'availability',
    'unavailable_dates',
    'admin_users',
    'oauth_accounts',
    'user_groups',
    'user_group_memberships',
    'group_permissions',
    'user_permissions',
    'revisions',
    'sitter_breed_specialties'
);

CREATE TYPE action_name AS ENUM ('INSERT', 'UPDATE', 'DELETE');

CREATE TABLE user_groups (
    id SERIAL PRIMARY KEY,
    name user_group_name NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Link users to groups (many-to-many)
CREATE TABLE user_group_memberships (
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES user_groups (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, group_id)
);

-- Permissions by group
CREATE TABLE group_permissions (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES user_groups (id) ON DELETE CASCADE,
    resource resource_name NOT NULL,
    permission permission_level NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (group_id, resource)
);

-- Individual user permissions (override group permissions)
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    resource resource_name NOT NULL,
    permission permission_level NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (user_id, resource)
);

-- Revision tracking table - records changes to any entity
CREATE TABLE revisions (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id TEXT NOT NULL, -- Changed to TEXT to allow for composite key string representations
    user_id INT REFERENCES users (id) ON DELETE SET NULL,
    action action_name NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT [],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for revisions table to improve query performance
CREATE INDEX idx_revisions_table_record ON revisions (table_name, record_id);

CREATE INDEX idx_revisions_user_id ON revisions (user_id);

CREATE INDEX idx_revisions_created_at ON revisions (created_at);

CREATE INDEX idx_revisions_changed_fields ON revisions USING GIN (changed_fields);

-- Function to create a revision record
CREATE OR REPLACE FUNCTION record_revision()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB := NULL;
    new_values JSONB := NULL;
    changed_fields TEXT[] := ARRAY[]::TEXT[];
    current_user_id INT; 
    record_identifier TEXT;
BEGIN
    -- Try to get current user ID from application context
    BEGIN
        current_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::INT;  -- Now parse as INT
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    -- Handle different operations
    IF TG_OP = 'INSERT' THEN
        new_values := to_jsonb(NEW);
        
        -- All fields are changed in INSERT
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(new_values);

    ELSIF TG_OP = 'UPDATE' THEN
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        
        -- Only include fields that actually changed
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(new_values)
        WHERE new_values->key IS DISTINCT FROM old_values->key;

        -- Skip if nothing actually changed
        IF array_length(changed_fields, 1) IS NULL THEN
            RETURN NULL;
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        old_values := to_jsonb(OLD);
        
        -- All fields are "changed" in DELETE
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_values);
    END IF;

    -- Determine record identifier based on the table structure
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- For tables with a regular 'id' column
        IF new_values ? 'id' THEN
            record_identifier := new_values->>'id';
        -- For user_group_memberships table (composite key)
        ELSIF TG_TABLE_NAME = 'user_group_memberships' THEN
            record_identifier := CONCAT(new_values->>'user_id', ':', new_values->>'group_id');
        -- For sitter_breed_specialties table (composite key)
        ELSIF TG_TABLE_NAME = 'sitter_breed_specialties' THEN
            record_identifier := CONCAT(new_values->>'sitter_id', ':', new_values->>'breed_id');
        -- Other composite key tables can be added here
        ELSE
            record_identifier := 'unknown-' || md5(new_values::text);
        END IF;
    ELSE -- DELETE operation
        -- For tables with a regular 'id' column
        IF old_values ? 'id' THEN
            record_identifier := old_values->>'id';
        -- For user_group_memberships table (composite key)
        ELSIF TG_TABLE_NAME = 'user_group_memberships' THEN
            record_identifier := CONCAT(old_values->>'user_id', ':', old_values->>'group_id');
        -- For sitter_breed_specialties table (composite key)
        ELSIF TG_TABLE_NAME = 'sitter_breed_specialties' THEN
            record_identifier := CONCAT(old_values->>'sitter_id', ':', old_values->>'breed_id');
        -- Other composite key tables can be added here
        ELSE
            record_identifier := 'unknown-' || md5(old_values::text);
        END IF;
    END IF;

    -- Insert the revision record
    INSERT INTO revisions(
        table_name, 
        record_id, 
        user_id, 
        action, 
        old_values, 
        new_values,
        changed_fields
    ) VALUES (
        TG_TABLE_NAME,
        record_identifier, -- Now using text for all record IDs
        current_user_id,
        TG_OP::action_name,
        old_values,
        new_values,
        changed_fields
    );

    -- Return the appropriate value based on the operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to the tables you want to track changes for
CREATE TRIGGER users_revision
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER sitters_revision
AFTER INSERT OR UPDATE OR DELETE ON sitters
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER bookings_revision
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER dogs_revision
AFTER INSERT OR UPDATE OR DELETE ON dogs
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER sitter_certificates_revision
AFTER INSERT OR UPDATE OR DELETE ON sitter_certificates
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER sitter_services_revision
AFTER INSERT OR UPDATE OR DELETE ON sitter_services
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER dog_breeds_revision
AFTER INSERT OR UPDATE OR DELETE ON dog_breeds
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER reviews_revision
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER availability_revision
AFTER INSERT OR UPDATE OR DELETE ON availability
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER unavailable_dates_revision
AFTER INSERT OR UPDATE OR DELETE ON unavailable_dates
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER admin_users_revision
AFTER INSERT OR UPDATE OR DELETE ON admin_users
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER oauth_accounts_revision
AFTER INSERT OR UPDATE OR DELETE ON oauth_accounts
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER user_groups_revision
AFTER INSERT OR UPDATE OR DELETE ON user_groups
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER user_group_memberships_revision
AFTER INSERT OR UPDATE OR DELETE ON user_group_memberships
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER group_permissions_revision
AFTER INSERT OR UPDATE OR DELETE ON group_permissions
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER user_permissions_revision
AFTER INSERT OR UPDATE OR DELETE ON user_permissions
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER sitter_breed_specialties_revision
AFTER INSERT OR UPDATE OR DELETE ON sitter_breed_specialties
FOR EACH ROW EXECUTE FUNCTION record_revision();

-- Insert default user groups
INSERT INTO
    user_groups (name, description)
VALUES (
        'administrator',
        'Full access to all resources'
    ),
    (
        'moderator',
        'Can review and moderate content'
    ),
    (
        'sitter',
        'Dog sitters with access to their own data and bookings'
    ),
    (
        'client',
        'Pet owners with access to their own data and bookings'
    );

-- Set up permissions for administrators (full access to ALL tables)
INSERT INTO
    group_permissions (
        group_id,
        resource,
        permission
    )
SELECT (
        SELECT id
        FROM user_groups
        WHERE
            name = 'administrator'
    ), resource, 'admin'::permission_level
FROM unnest(
        enum_range(NULL::resource_name)
    ) as resource;

-- Moderator permissions - write access to most tables, but only read access to some
-- and NO access to admin_users and oauth_accounts
INSERT INTO
    group_permissions (
        group_id,
        resource,
        permission
    )
    -- First, give write access to these resources
SELECT (
        SELECT id
        FROM user_groups
        WHERE
            name = 'moderator'
    ), resource, 'write'::permission_level
FROM unnest(
        ARRAY[
            'sitters', 'sitter_certificates', 'sitter_services', 'availability', 'unavailable_dates', 'dog_breeds', 'reviews', 'dogs', 'bookings', 'sitter_breed_specialties'
        ]::resource_name[]
    ) as resource;

-- Now, give read-only access to these resources
INSERT INTO
    group_permissions (
        group_id,
        resource,
        permission
    )
SELECT (
        SELECT id
        FROM user_groups
        WHERE
            name = 'moderator'
    ), resource, 'read'::permission_level
FROM unnest(
        ARRAY['users',]::resource_name[]
    ) as resource;

-- Sitter and Clients don't need permissions
-- they can't change other users' data
-- and are managed by the application