-- User group and permission system
CREATE TYPE permission_level AS ENUM ('read', 'write', 'admin');

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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Link users to groups (many-to-many)
CREATE TABLE user_group_memberships (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES user_groups (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id)
);

-- Permissions by group
CREATE TABLE group_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    group_id UUID NOT NULL REFERENCES user_groups (id) ON DELETE CASCADE,
    resource resource_name NOT NULL,
    permission permission_level NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, resource)
);

-- Individual user permissions (override group permissions)
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    resource resource_name NOT NULL,
    permission permission_level NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, resource)
);

-- Revision tracking table - records changes to any entity
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    user_id UUID REFERENCES users (id) ON DELETE SET NULL, -- Who made the change
    action action_name NOT NULL,
    old_values JSONB, -- Previous values in case of update/delete
    new_values JSONB, -- New values in case of insert/update
    changed_fields TEXT [], -- Array of field names that were changed (for quick filtering)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
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
    current_user_id UUID;
BEGIN
    -- Try to get current user ID from application context
    -- This assumes your application sets this value using SET LOCAL
    BEGIN
        current_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '');
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
        CASE 
            WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN (new_values->>'id')::UUID
            ELSE (old_values->>'id')::UUID
        END,
        current_user_id,
        TG_OP,
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
        'administrators',
        'Full access to all resources'
    ),
    (
        'moderators',
        'Can review and moderate content'
    ),
    (
        'sitters',
        'Dog sitters with access to their own data and bookings'
    ),
    (
        'clients',
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
            name = 'administrators'
    ),
    resource,
    'admin'::permission_level
FROM unnest(enum_range(NULL::resource_name)) as resource;

-- Moderator permissions - write access to most tables, but only read access to some
-- and NO access to admin_users and oauth_accounts
INSERT INTO
    group_permissions (
        group_id,
        resource,
        permission
    )
-- First, give write access to these resources
SELECT 
    (SELECT id FROM user_groups WHERE name = 'moderators'),
    resource,
    'write'::permission_level
FROM unnest(ARRAY[
    'sitters',
    'sitter_certificates',
    'sitter_services',
    'availability',
    'unavailable_dates',
    'dog_breeds',
    'reviews',
    'dogs',
    'bookings',
    'sitter_breed_specialties'
]::resource_name[]) as resource;

-- Now, give read-only access to these resources
INSERT INTO
    group_permissions (
        group_id,
        resource,
        permission
    )
SELECT 
    (SELECT id FROM user_groups WHERE name = 'moderators'),
    resource,
    'read'::permission_level
FROM unnest(ARRAY[
    'users',
    'revisions'
]::resource_name[]) as resource;

-- Set up basic permissions for sitters
INSERT INTO
    group_permissions (
        group_id,
        resource,
        permission
    )
SELECT 
    (SELECT id FROM user_groups WHERE name = 'sitters'),
    resource,
    'read'::permission_level
FROM unnest(ARRAY[
    'users',
    'sitters',
    'bookings',
    'dog_breeds',
    'reviews'
]::resource_name[]) as resource;

-- Set up basic permissions for clients
INSERT INTO
    group_permissions (
        group_id,
        resource,
        permission
    )
SELECT 
    (SELECT id FROM user_groups WHERE name = 'clients'),
    resource,
    'read'::permission_level
FROM unnest(ARRAY[
    'users',
    'sitters',
    'bookings',
    'dog_breeds',
    'reviews',
    'sitter_services',
    'availability',
    'unavailable_dates',
    'sitter_certificates'
]::resource_name[]) as resource;