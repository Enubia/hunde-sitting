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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
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
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider auth_provider NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id)
);

CREATE TABLE sitters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    bio TEXT,
    years_experience INTEGER,
    hourly_rate DECIMAL(10, 2),
    daily_rate DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT TRUE,
    can_host_at_home BOOLEAN DEFAULT FALSE,
    max_dogs_at_once INTEGER DEFAULT 1,
    service_radius_km DECIMAL(8, 2),
    last_location_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sitter_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    sitter_id UUID NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    service_name service_type NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sitter_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    sitter_id UUID NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    certificate_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiration_date DATE,
    certificate_file_path TEXT,
    verification_status verification_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dog_breeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) UNIQUE NOT NULL,
    size_category size_category NOT NULL,
    special_care_requirements TEXT,
    requires_certificate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sitter_breed_specialties (
    sitter_id UUID NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    breed_id UUID NOT NULL REFERENCES dog_breeds (id) ON DELETE CASCADE,
    experience_years INTEGER DEFAULT 0,
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sitter_id, breed_id)
);

CREATE TABLE dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    owner_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    breed_id UUID REFERENCES dog_breeds (id) ON DELETE SET NULL,
    mixed_breed BOOLEAN DEFAULT FALSE,
    age_years INTEGER,
    age_months INTEGER,
    weight_kg DECIMAL(5, 2),
    sex sex,
    is_neutered BOOLEAN,
    special_needs TEXT,
    medical_conditions TEXT,
    vaccination_status vaccination_status DEFAULT 'unknown',
    temperament TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    client_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    sitter_id UUID NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES dogs (id) ON DELETE CASCADE,
    service_id UUID REFERENCES sitter_services (id) ON DELETE SET NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location_type location_type NOT NULL,
    location_address TEXT,
    special_instructions TEXT,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    booking_id UUID REFERENCES bookings (id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    sitter_id UUID NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TABLE unavailable_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    sitter_id UUID NOT NULL REFERENCES sitters (id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (start_date < end_date)
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role admin_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
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

-- Update existing users to set their location based on lat/long
UPDATE users
SET
    location = ST_SetSRID (
        ST_MakePoint (longitude, latitude),
        4326
    )::geography
WHERE
    latitude IS NOT NULL
    AND longitude IS NOT NULL;

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