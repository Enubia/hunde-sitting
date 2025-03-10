import type { Kysely, UnknownRow } from 'kysely';

import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    // Create enum types first
    await sql`
    CREATE TYPE auth_provider AS ENUM ('google', 'facebook', 'apple', 'github');
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
    CREATE TYPE service_type AS ENUM ('dog_walking', 'overnight_stay', 'daycare', 'boarding', 'training', 'grooming', 'vet_visits', 'pet_taxi');
    CREATE TYPE size_category AS ENUM ('tiny', 'small', 'medium', 'large', 'giant');
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected');
    CREATE TYPE location_type AS ENUM ('sitter_home', 'client_home', 'park', 'other');
    CREATE TYPE sex AS ENUM ('male', 'female');
    CREATE TYPE vaccination_status AS ENUM ('fully_vaccinated', 'partially_vaccinated', 'not_vaccinated', 'unknown');
    `.execute(db);

    // Create the users table
    await db.schema
        .createTable('users')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('email', 'varchar(255)', col => col.unique().notNull())
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('avatar_url', 'text')
        .addColumn('phone', 'varchar(50)')
        .addColumn('bio', 'text')
        .addColumn('address', 'text')
        .addColumn('city', 'varchar(100)')
        .addColumn('state', 'varchar(100)')
        .addColumn('postal_code', 'varchar(20)')
        .addColumn('country', 'varchar(100)')
        .addColumn('latitude', 'decimal(10, 8)')
        .addColumn('longitude', 'decimal(11, 8)')
        .addColumn('is_active', 'boolean', col => col.defaultTo(true).notNull())
        .addColumn('is_email_verified', 'boolean', col => col.defaultTo(false).notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Add PostGIS support
    await sql`
    CREATE EXTENSION IF NOT EXISTS postgis;
    ALTER TABLE users ADD COLUMN location geography(POINT);
    
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
    `.execute(db);

    // Create oauth_accounts table
    await db.schema
        .createTable('oauth_accounts')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('provider', sql`auth_provider`, col => col.notNull())
        .addColumn('provider_user_id', 'varchar(255)', col => col.notNull())
        .addColumn('access_token', 'text')
        .addColumn('refresh_token', 'text')
        .addColumn('expires_at', 'timestamptz')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addUniqueConstraint('oauth_provider_user_id_unique', ['provider', 'provider_user_id'])
        .execute();

    // Create sitters table
    await db.schema
        .createTable('sitters')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('verification_status', sql`verification_status`, col => col.defaultTo('pending').notNull())
        .addColumn('bio', 'text')
        .addColumn('years_experience', 'integer')
        .addColumn('hourly_rate', 'decimal(10, 2)')
        .addColumn('daily_rate', 'decimal(10, 2)')
        .addColumn('is_available', 'boolean', col => col.defaultTo(true).notNull())
        .addColumn('can_host_at_home', 'boolean', col => col.defaultTo(false).notNull())
        .addColumn('max_dogs_at_once', 'integer', col => col.defaultTo(1).notNull())
        .addColumn('service_radius_km', 'decimal(8, 2)')
        .addColumn('last_location_update', 'timestamptz')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Create sitter_services table
    await db.schema
        .createTable('sitter_services')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('service_name', sql`service_type`, col => col.notNull())
        .addColumn('description', 'text')
        .addColumn('price', 'decimal(10, 2)')
        .addColumn('is_available', 'boolean', col => col.defaultTo(true).notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Create dog_breeds table
    await db.schema
        .createTable('dog_breeds')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'varchar(100)', col => col.unique().notNull())
        .addColumn('size_category', sql`size_category`, col => col.notNull())
        .addColumn('special_care_requirements', 'text')
        .addColumn('requires_certificate', 'boolean', col => col.defaultTo(false).notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Create dogs table
    await db.schema
        .createTable('dogs')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('owner_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar(100)', col => col.notNull())
        .addColumn('breed_id', 'integer', col => col.references('dog_breeds.id').onDelete('set null'))
        .addColumn('mixed_breed', 'boolean', col => col.defaultTo(false).notNull())
        .addColumn('age_years', 'integer')
        .addColumn('age_months', 'integer')
        .addColumn('weight_kg', 'decimal(5, 2)')
        .addColumn('sex', sql`sex`)
        .addColumn('is_neutered', 'boolean')
        .addColumn('special_needs', 'text')
        .addColumn('medical_conditions', 'text')
        .addColumn('vaccination_status', sql`vaccination_status`, col => col.defaultTo('unknown').notNull())
        .addColumn('temperament', 'text')
        .addColumn('photo_url', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Create sitter_certificates table
    await db.schema
        .createTable('sitter_certificates')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('certificate_name', 'varchar(255)', col => col.notNull())
        .addColumn('issuing_organization', 'varchar(255)', col => col.notNull())
        .addColumn('issue_date', 'date')
        .addColumn('expiration_date', 'date')
        .addColumn('certificate_file_path', 'text')
        .addColumn('verification_status', sql`verification_status`, col => col.defaultTo('pending').notNull())
        .addColumn('admin_notes', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Create sitter_breed_specialties table with composite primary key
    await db.schema
        .createTable('sitter_breed_specialties')
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('breed_id', 'integer', col => col.references('dog_breeds.id').onDelete('cascade').notNull())
        .addColumn('experience_years', 'integer', col => col.defaultTo(0).notNull())
        .addColumn('additional_notes', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addPrimaryKeyConstraint('sitter_breed_specialties_pkey', ['sitter_id', 'breed_id'])
        .execute();

    // Create bookings table
    await db.schema
        .createTable('bookings')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('client_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('dog_id', 'integer', col => col.references('dogs.id').onDelete('cascade').notNull())
        .addColumn('service_id', 'integer', col => col.references('sitter_services.id').onDelete('set null'))
        .addColumn('status', sql`booking_status`, col => col.defaultTo('pending').notNull())
        .addColumn('start_date', 'timestamptz', col => col.notNull())
        .addColumn('end_date', 'timestamptz', col => col.notNull())
        .addColumn('location_type', sql`location_type`, col => col.notNull())
        .addColumn('location_address', 'text')
        .addColumn('special_instructions', 'text')
        .addColumn('total_price', 'decimal(10, 2)')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Create reviews table
    await db.schema
        .createTable('reviews')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('booking_id', 'integer', col => col.references('bookings.id').onDelete('set null'))
        .addColumn('reviewer_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('reviewee_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('rating', 'integer', col => col.notNull().check(sql`rating BETWEEN 1 AND 5`))
        .addColumn('comment', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Create availability table
    await db.schema
        .createTable('availability')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('day_of_week', 'integer', col => col.notNull().check(sql`day_of_week BETWEEN 0 AND 6`))
        .addColumn('start_time', 'time', col => col.notNull())
        .addColumn('end_time', 'time', col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addCheckConstraint('valid_time_range', sql`start_time < end_time`)
        .execute();

    // Create unavailable_dates table
    await db.schema
        .createTable('unavailable_dates')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('start_date', 'timestamptz', col => col.notNull())
        .addColumn('end_date', 'timestamptz', col => col.notNull())
        .addColumn('reason', 'varchar(255)')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addCheckConstraint('valid_date_range', sql`start_date < end_date`) // Fixed from start_time to start_date
        .execute();

    // Create indexes for performance optimization
    await db.schema.createIndex('idx_sitters_verification_status').on('sitters').column('verification_status').execute();
    await db.schema.createIndex('idx_bookings_status').on('bookings').column('status').execute();
    await db.schema.createIndex('idx_bookings_date_range').on('bookings').columns(['start_date', 'end_date']).execute();
    await db.schema.createIndex('idx_users_email').on('users').column('email').execute();
    await db.schema.createIndex('idx_oauth_provider_user_id').on('oauth_accounts').columns(['provider', 'provider_user_id']).execute();
    await db.schema.createIndex('idx_sitters_user_id').on('sitters').column('user_id').execute();
    await db.schema.createIndex('idx_users_location').on('users').using('gist').column('location').execute();

    // Add user groups and permissions system
    await sql`
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
        'oauth_accounts',
        'user_groups',
        'user_group_memberships',
        'group_permissions',
        'user_permissions',
        'revisions',
        'sitter_breed_specialties'
    );
    
    CREATE TYPE action_name AS ENUM ('INSERT', 'UPDATE', 'DELETE');
    `.execute(db);

    await sql`
    CREATE TYPE user_group_name AS ENUM ('administrators', 'moderators');
    `.execute(db);

    // Create user_groups table
    await db.schema
        .createTable('user_groups')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', sql`user_group_name`, col => col.notNull())
        .addColumn('description', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    // Create user_group_memberships table with composite primary key
    await db.schema
        .createTable('user_group_memberships')
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('group_id', 'integer', col => col.references('user_groups.id').onDelete('cascade').notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addPrimaryKeyConstraint('user_group_memberships_pkey', ['user_id', 'group_id'])
        .execute();

    // Create group_permissions table
    await db.schema
        .createTable('group_permissions')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('group_id', 'integer', col => col.references('user_groups.id').onDelete('cascade').notNull())
        .addColumn('resource', sql`resource_name`, col => col.notNull())
        .addColumn('permission', sql`permission_level`, col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addUniqueConstraint('group_permissions_group_resource_unique', ['group_id', 'resource'])
        .execute();

    // Create user_permissions table
    await db.schema
        .createTable('user_permissions')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('resource', sql`resource_name`, col => col.notNull())
        .addColumn('permission', sql`permission_level`, col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addUniqueConstraint('user_permissions_user_resource_unique', ['user_id', 'resource'])
        .execute();

    // Create revisions table for change tracking with TEXT record_id (to handle composite keys)
    await db.schema
        .createTable('revisions')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('table_name', 'varchar(100)', col => col.notNull())
        .addColumn('record_id', 'text', col => col.notNull()) // Using text for all IDs, including composite keys
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('set null'))
        .addColumn('action', sql`action_name`, col => col.notNull())
        .addColumn('old_values', 'jsonb')
        .addColumn('new_values', 'jsonb')
        .addColumn('changed_fields', sql`text[]`)
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    await db.schema.createIndex('idx_revisions_table_record').on('revisions').columns(['table_name', 'record_id']).execute();
    await db.schema.createIndex('idx_revisions_user_id').on('revisions').column('user_id').execute();
    await db.schema.createIndex('idx_revisions_created_at').on('revisions').column('created_at').execute();
    await db.schema.createIndex('idx_revisions_changed_fields').on('revisions').using('gin').column('changed_fields').execute();

    // Create the revision function that handles composite keys
    await sql`
    CREATE OR REPLACE FUNCTION record_revision()
    RETURNS TRIGGER AS $$
    DECLARE
        old_values JSONB := NULL;
        new_values JSONB := NULL;
        changed_fields TEXT[] := ARRAY[]::TEXT[];
        current_user_id INTEGER;
        record_identifier TEXT;
    BEGIN
        -- Try to get current user ID from application context
        BEGIN
            current_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER;
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
            record_identifier, -- Now using our composite key string when needed
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
    `.execute(db);

    // Add triggers to all tables for revision tracking
    const tables = [
        'users',
        'sitters',
        'bookings',
        'dogs',
        'sitter_certificates',
        'sitter_services',
        'dog_breeds',
        'reviews',
        'availability',
        'unavailable_dates',
        'oauth_accounts',
        'sitter_breed_specialties',
        'user_groups',
        'user_group_memberships',
        'group_permissions',
        'user_permissions',
    ];

    for (const table of tables) {
        await sql`
        CREATE TRIGGER ${sql.raw(`${table}_revision`)}
        AFTER INSERT OR UPDATE OR DELETE ON ${sql.raw(`"${table}"`)}
        FOR EACH ROW EXECUTE FUNCTION record_revision()
        `.execute(db);
    }

    // Insert default user groups
    await db.insertInto('user_groups')
        .values([
            { name: 'administrators', description: 'Users with unrestricted access to all system functions' },
            { name: 'moderators', description: 'Users with access to moderate content and users' },
        ])
        .execute();

    // Get the IDs of the groups we just created
    const adminGroup = await db
        .selectFrom('user_groups')
        .select('id')
        .where('name', '=', 'administrators')
        .executeTakeFirst();

    const moderatorGroup = await db
        .selectFrom('user_groups')
        .select('id')
        .where('name', '=', 'moderators')
        .executeTakeFirst();

    // Get available resources
    const resources = await sql`SELECT unnest(enum_range(NULL::resource_name)) as resource`.execute(db);

    // Add admin permissions for administrators (access to everything)
    for (const row of resources.rows) {
        await db.insertInto('group_permissions')
            .values({
                group_id: adminGroup!.id,
                resource: (row as UnknownRow).resource as string,
                permission: 'admin',
            })
            .execute();
    }

    // Add moderator permissions
    const moderatorResources = [
        'users',
        'sitters',
        'bookings',
        'dog_breeds',
        'reviews',
        'sitter_services',
        'availability',
        'unavailable_dates',
        'sitter_certificates',
    ];

    for (const resource of moderatorResources) {
        await db.insertInto('group_permissions')
            .values({
                group_id: moderatorGroup!.id,
                resource: resource as any,
                permission: 'admin',
            })
            .execute();
    }
}

export async function down(db: Kysely<any>): Promise<void> {
    // Drop all tables in reverse order to avoid foreign key constraints
    // The order is crucial to avoid dependency conflicts
    const tables = [
        // First drop tables with foreign keys to other tables
        'user_permissions',
        'group_permissions',
        'user_group_memberships',
        'revisions',
        'reviews', // has references to bookings and users
        'bookings', // has references to dogs, sitters, users, and services
        'sitter_breed_specialties', // has references to dog_breeds and sitters
        'unavailable_dates', // has reference to sitters
        'availability', // has reference to sitters
        'sitter_certificates', // has reference to sitters
        'sitter_services', // has reference to sitters
        'dogs', // has references to users and dog_breeds

        // Next drop tables that are referenced by other tables (but don't have foreign keys themselves)
        'dog_breeds',
        'sitters', // references users
        'oauth_accounts', // references users

        // Finally drop base tables that don't reference other tables
        'user_groups',
        'users',
    ];

    // Disable triggers temporarily to avoid revision tracking during drops
    await sql`SET session_replication_role = 'replica'`.execute(db);

    try {
        for (const table of tables) {
            await db.schema.dropTable(table).ifExists().execute();
        }

        // Drop function and trigger
        await sql`DROP FUNCTION IF EXISTS update_location CASCADE`.execute(db);
        await sql`DROP FUNCTION IF EXISTS record_revision CASCADE`.execute(db);

        // Drop enum types
        const enums = [
            'user_group_name',
            'action_name',
            'resource_name',
            'permission_level',
            'vaccination_status',
            'sex',
            'location_type',
            'booking_status',
            'size_category',
            'service_type',
            'verification_status',
            'auth_provider',
        ];

        for (const enumType of enums) {
            await sql`DROP TYPE IF EXISTS ${sql.raw(enumType)} CASCADE`.execute(db);
        }

        // Drop PostGIS extension
        // await sql`DROP EXTENSION IF EXISTS postgis CASCADE`.execute(db);
        // Don't drop postgis extension as it might be used by other databases
    } finally {
        // Re-enable triggers
        await sql`SET session_replication_role = 'origin'`.execute(db);
    }
}
