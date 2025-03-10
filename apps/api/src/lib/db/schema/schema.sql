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

CREATE TYPE action_name AS ENUM ('INSERT', 'UPDATE', 'DELETE');

CREATE TYPE permission_level AS ENUM ('read', 'write', 'admin');

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
    permissions JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT validate_user_permissions CHECK (
        validate_permissions_jsonb (permissions)
    )
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

CREATE TRIGGER sitter_breed_specialties_revision
AFTER INSERT OR UPDATE OR DELETE ON sitter_breed_specialties
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TABLE user_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT validate_user_group_permissions CHECK (
        validate_permissions_jsonb (permissions)
    )
);

CREATE TABLE user_group_memberships (
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES user_groups (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, group_id)
);

-- Function to generate a default permissions JSONB based on resource enum
CREATE OR REPLACE FUNCTION generate_default_permissions(level permission_level)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}'::JSONB;
    res resource_name;
BEGIN
    FOR res IN SELECT unnest(enum_range(NULL::resource_name)) LOOP
        result := result || jsonb_build_object(res::text, level::text);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate permissions JSONB against resource_name enum
CREATE OR REPLACE FUNCTION validate_permissions_jsonb(permissions JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    key TEXT;
    value TEXT;
    valid_resources TEXT[] := (SELECT array_agg(e::text) FROM unnest(enum_range(NULL::resource_name)) e);
    valid_levels TEXT[] := (SELECT array_agg(e::text) FROM unnest(enum_range(NULL::permission_level)) e);
BEGIN
    -- Check each key in the JSON
    FOR key, value IN SELECT * FROM jsonb_each_text(permissions) LOOP
        -- Key must be a valid resource name
        IF NOT key = ANY(valid_resources) THEN
            RAISE EXCEPTION 'Invalid resource name: %', key;
        END IF;
        
        -- Value must be a valid permission level
        IF NOT value = ANY(valid_levels) THEN
            RAISE EXCEPTION 'Invalid permission level: %', value;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Updated function to merge user permissions from their groups using enum types
CREATE OR REPLACE FUNCTION update_user_permissions_from_groups()
RETURNS TRIGGER AS $$
DECLARE
    user_id_val INT;
    merged_perms JSONB := '{}'::JSONB;
    res resource_name;
    max_level permission_level;
BEGIN
    -- Determine which user_id we need to update
    IF TG_OP = 'DELETE' THEN
        user_id_val := OLD.user_id;
    ELSE
        user_id_val := NEW.user_id;
    END IF;
    
    -- For each possible resource, find the highest permission level
    FOR res IN SELECT unnest(enum_range(NULL::resource_name)) LOOP
        -- Get the maximum permission for this resource from all user's groups
        SELECT 
            CASE
                WHEN bool_or(perm_value = 'admin') THEN 'admin'::permission_level
                WHEN bool_or(perm_value = 'write') THEN 'write'::permission_level
                WHEN bool_or(perm_value = 'read') THEN 'read'::permission_level
                ELSE NULL
            END INTO max_level
        FROM (
            SELECT (ug.permissions->>res::text)::permission_level AS perm_value
            FROM user_groups ug
            JOIN user_group_memberships ugm ON ug.id = ugm.group_id
            WHERE ugm.user_id = user_id_val
            AND ug.permissions ? res::text
        ) AS perms
        WHERE perm_value IS NOT NULL;
        
        -- Add to merged permissions if we found a permission
        IF max_level IS NOT NULL THEN
            merged_perms := merged_perms || jsonb_build_object(res::text, max_level::text);
        END IF;
    END LOOP;
    
    -- Update the user's permissions
    UPDATE users u
    SET permissions = merged_perms
    WHERE u.id = user_id_val;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Updated function to handle group permission changes
CREATE OR REPLACE FUNCTION update_users_on_group_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip if permissions didn't change
    IF NEW.permissions = OLD.permissions THEN
        RETURN NULL;
    END IF;
    
    -- Update all users in this group by refreshing their permissions
    -- We do this by calling our update function for each membership
    FOR user_id_val IN 
        SELECT user_id 
        FROM user_group_memberships 
        WHERE group_id = NEW.id
    LOOP
        -- Get any membership for this user
        PERFORM update_user_permissions(user_id_val);
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update a user's permissions
CREATE OR REPLACE FUNCTION update_user_permissions(user_id_val INT)
RETURNS VOID AS $$
DECLARE
    merged_perms JSONB := '{}'::JSONB;
    res resource_name;
    max_level permission_level;
BEGIN
    -- For each possible resource, find the highest permission level
    FOR res IN SELECT unnest(enum_range(NULL::resource_name)) LOOP
        -- Get the maximum permission for this resource from all user's groups
        SELECT 
            CASE
                WHEN bool_or(perm_value = 'admin') THEN 'admin'::permission_level
                WHEN bool_or(perm_value = 'write') THEN 'write'::permission_level
                WHEN bool_or(perm_value = 'read') THEN 'read'::permission_level
                ELSE NULL
            END INTO max_level
        FROM (
            SELECT (ug.permissions->>res::text)::permission_level AS perm_value
            FROM user_groups ug
            JOIN user_group_memberships ugm ON ug.id = ugm.group_id
            WHERE ugm.user_id = user_id_val
            AND ug.permissions ? res::text
        ) AS perms
        WHERE perm_value IS NOT NULL;
        
        -- Add to merged permissions if we found a permission
        IF max_level IS NOT NULL THEN
            merged_perms := merged_perms || jsonb_build_object(res::text, max_level::text);
        END IF;
    END LOOP;
    
    -- Update the user's permissions
    UPDATE users u
    SET permissions = merged_perms
    WHERE u.id = user_id_val;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_permissions_on_membership_change
AFTER INSERT OR UPDATE OR DELETE ON user_group_memberships
FOR EACH ROW EXECUTE FUNCTION update_user_permissions_from_groups();

CREATE TRIGGER update_users_on_group_permission_change
AFTER UPDATE OF permissions ON user_groups
FOR EACH ROW EXECUTE FUNCTION update_users_on_group_change();

-- Add the default groups with permissions from the enum types
INSERT INTO
    user_groups (
        name,
        description,
        permissions
    )
VALUES (
        'administrator',
        'Full access to all resources',
        generate_default_permissions ('admin'::permission_level)
    ),
    (
        'moderator',
        'Can review and moderate content',
        jsonb_build_object(
            'users'::resource_name::text, 'read'::permission_level::text,
            'sitters'::resource_name::text, 'write'::permission_level::text,
            'dogs'::resource_name::text, 'write'::permission_level::text,
            'bookings'::resource_name::text, 'write'::permission_level::text,
            'reviews'::resource_name::text, 'write'::permission_level::text,
            'dog_breeds'::resource_name::text, 'write'::permission_level::text,
            'sitter_certificates'::resource_name::text, 'write'::permission_level::text,
            'sitter_services'::resource_name::text, 'write'::permission_level::text,
            'availability'::resource_name::text, 'write'::permission_level::text,
            'unavailable_dates'::resource_name::text, 'write'::permission_level::text,
            'sitter_breed_specialties'::resource_name::text, 'write'::permission_level::text,
            'revisions'::resource_name::text, 'read'::permission_level::text
        )
    );

CREATE TRIGGER user_groups_revision
AFTER INSERT OR UPDATE OR DELETE ON user_groups
FOR EACH ROW EXECUTE FUNCTION record_revision();

CREATE TRIGGER user_group_memberships_revision
AFTER INSERT OR UPDATE OR DELETE ON user_group_memberships
FOR EACH ROW EXECUTE FUNCTION record_revision();

-- Sitter and Clients don't need permissions
-- they can't change other users' data
-- and are managed by the application