import type { Kysely } from 'kysely';

import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    // Enable PostGIS extension
    await sql`CREATE EXTENSION IF NOT EXISTS postgis`.execute(db);

    // Create enum types for categorical fields
    await sql`CREATE TYPE auth_provider AS ENUM ('google', 'facebook', 'apple', 'github')`.execute(db);
    await sql`CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected')`.execute(db);
    await sql`CREATE TYPE service_type AS ENUM ('dog_walking', 'overnight_stay', 'daycare', 'boarding', 'training', 'grooming', 'vet_visits', 'pet_taxi')`.execute(db);
    await sql`CREATE TYPE size_category AS ENUM ('tiny', 'small', 'medium', 'large', 'giant')`.execute(db);
    await sql`CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected')`.execute(db);
    await sql`CREATE TYPE location_type AS ENUM ('sitter_home', 'client_home', 'park', 'other')`.execute(db);
    await sql`CREATE TYPE sex AS ENUM ('male', 'female')`.execute(db);
    await sql`CREATE TYPE admin_role AS ENUM ('admin', 'super_admin')`.execute(db);
    await sql`CREATE TYPE vaccination_status AS ENUM ('fully_vaccinated', 'partially_vaccinated', 'not_vaccinated', 'unknown')`.execute(db);

    // Create users table
    await db.schema
        .createTable('users')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('email', 'varchar(255)', col => col.notNull().unique())
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
        .addColumn('is_active', 'boolean', col => col.notNull().defaultTo(true))
        .addColumn('is_email_verified', 'boolean', col => col.notNull().defaultTo(false))
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Add location column to users table
    await sql`ALTER TABLE users ADD COLUMN location geography(POINT)`.execute(db);

    // Create oauth_accounts table
    await db.schema
        .createTable('oauth_accounts')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('user_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('provider', sql`auth_provider`, col => col.notNull())
        .addColumn('provider_user_id', 'varchar(255)', col => col.notNull())
        .addColumn('access_token', 'text')
        .addColumn('refresh_token', 'text')
        .addColumn('expires_at', 'timestamptz')
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addUniqueConstraint('oauth_provider_unique', ['provider', 'provider_user_id'])
        .execute();

    // Create sitters table
    await db.schema
        .createTable('sitters')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('user_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('verification_status', sql`verification_status`, col => col.notNull().defaultTo('pending'))
        .addColumn('bio', 'text')
        .addColumn('years_experience', 'integer')
        .addColumn('hourly_rate', 'decimal(10, 2)')
        .addColumn('daily_rate', 'decimal(10, 2)')
        .addColumn('is_available', 'boolean', col => col.notNull().defaultTo(true))
        .addColumn('can_host_at_home', 'boolean', col => col.notNull().defaultTo(false))
        .addColumn('max_dogs_at_once', 'integer', col => col.notNull().defaultTo(1))
        .addColumn('service_radius_km', 'decimal(8, 2)')
        .addColumn('last_location_update', 'timestamptz')
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create sitter_services table
    await db.schema
        .createTable('sitter_services')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('sitter_id', 'uuid', col => col.notNull().references('sitters.id').onDelete('cascade'))
        .addColumn('service_name', sql`service_type`, col => col.notNull())
        .addColumn('description', 'text')
        .addColumn('price', 'decimal(10, 2)')
        .addColumn('is_available', 'boolean', col => col.notNull().defaultTo(true))
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create sitter_certificates table
    await db.schema
        .createTable('sitter_certificates')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('sitter_id', 'uuid', col => col.notNull().references('sitters.id').onDelete('cascade'))
        .addColumn('certificate_name', 'varchar(255)', col => col.notNull())
        .addColumn('issuing_organization', 'varchar(255)', col => col.notNull())
        .addColumn('issue_date', 'date')
        .addColumn('expiration_date', 'date')
        .addColumn('certificate_file_path', 'text')
        .addColumn('verification_status', sql`verification_status`, col => col.notNull().defaultTo('pending'))
        .addColumn('admin_notes', 'text')
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create dog_breeds table
    await db.schema
        .createTable('dog_breeds')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('name', 'varchar(100)', col => col.notNull().unique())
        .addColumn('size_category', sql`size_category`, col => col.notNull())
        .addColumn('special_care_requirements', 'text')
        .addColumn('requires_certificate', 'boolean', col => col.notNull().defaultTo(false))
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create sitter_breed_specialties table
    await db.schema
        .createTable('sitter_breed_specialties')
        .addColumn('sitter_id', 'uuid', col => col.notNull().references('sitters.id').onDelete('cascade'))
        .addColumn('breed_id', 'uuid', col => col.notNull().references('dog_breeds.id').onDelete('cascade'))
        .addColumn('experience_years', 'integer', col => col.notNull().defaultTo(0))
        .addColumn('additional_notes', 'text')
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addPrimaryKeyConstraint('sitter_breed_specialties_pk', ['sitter_id', 'breed_id'])
        .execute();

    // Create dogs table
    await db.schema
        .createTable('dogs')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('owner_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('name', 'varchar(100)', col => col.notNull())
        .addColumn('breed_id', 'uuid', col => col.references('dog_breeds.id').onDelete('set null'))
        .addColumn('mixed_breed', 'boolean', col => col.notNull().defaultTo(false))
        .addColumn('age_years', 'integer')
        .addColumn('age_months', 'integer')
        .addColumn('weight_kg', 'decimal(5, 2)')
        .addColumn('sex', sql`sex`)
        .addColumn('is_neutered', 'boolean')
        .addColumn('special_needs', 'text')
        .addColumn('medical_conditions', 'text')
        .addColumn('vaccination_status', sql`vaccination_status`, col => col.notNull().defaultTo('unknown'))
        .addColumn('temperament', 'text')
        .addColumn('photo_url', 'text')
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create bookings table
    await db.schema
        .createTable('bookings')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('client_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('sitter_id', 'uuid', col => col.notNull().references('sitters.id').onDelete('cascade'))
        .addColumn('dog_id', 'uuid', col => col.notNull().references('dogs.id').onDelete('cascade'))
        .addColumn('service_id', 'uuid', col => col.references('sitter_services.id').onDelete('set null'))
        .addColumn('status', sql`booking_status`, col => col.notNull().defaultTo('pending'))
        .addColumn('start_date', 'timestamptz', col => col.notNull())
        .addColumn('end_date', 'timestamptz', col => col.notNull())
        .addColumn('location_type', sql`location_type`, col => col.notNull())
        .addColumn('location_address', 'text')
        .addColumn('special_instructions', 'text')
        .addColumn('total_price', 'decimal(10, 2)')
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create reviews table
    await db.schema
        .createTable('reviews')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('booking_id', 'uuid', col => col.references('bookings.id').onDelete('set null'))
        .addColumn('reviewer_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('reviewee_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('rating', 'integer', col => col.notNull().check(sql`rating BETWEEN 1 AND 5`))
        .addColumn('comment', 'text')
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create availability table
    await db.schema
        .createTable('availability')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('sitter_id', 'uuid', col => col.notNull().references('sitters.id').onDelete('cascade'))
        .addColumn('day_of_week', 'integer', col => col.notNull().check(sql`day_of_week BETWEEN 0 AND 6`))
        .addColumn('start_time', 'time', col => col.notNull())
        .addColumn('end_time', 'time', col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addCheckConstraint('valid_time_range', sql`start_time < end_time`)
        .execute();

    // Create unavailable_dates table
    await db.schema
        .createTable('unavailable_dates')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('sitter_id', 'uuid', col => col.notNull().references('sitters.id').onDelete('cascade'))
        .addColumn('start_date', 'timestamptz', col => col.notNull())
        .addColumn('end_date', 'timestamptz', col => col.notNull())
        .addColumn('reason', 'varchar(255)')
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addCheckConstraint('valid_date_range', sql`start_date < end_date`)
        .execute();

    // Create admin_users table
    await db.schema
        .createTable('admin_users')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('user_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('role', sql`admin_role`, col => col.notNull().defaultTo('admin'))
        .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create indexes
    await db.schema.createIndex('idx_sitters_verification_status').on('sitters').column('verification_status').execute();
    await db.schema.createIndex('idx_bookings_status').on('bookings').column('status').execute();
    await db.schema.createIndex('idx_bookings_date_range').on('bookings').columns(['start_date', 'end_date']).execute();
    await db.schema.createIndex('idx_users_email').on('users').column('email').execute();
    await db.schema.createIndex('idx_oauth_provider_user_id').on('oauth_accounts').columns(['provider', 'provider_user_id']).execute();
    await db.schema.createIndex('idx_sitters_user_id').on('sitters').column('user_id').execute();

    // Create spatial index
    await sql`CREATE INDEX idx_users_location ON users USING GIST (location)`.execute(db);

    // Create update_location function and trigger
    await sql`
        CREATE OR REPLACE FUNCTION update_location()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db);

    await sql`
        CREATE TRIGGER update_user_location
        BEFORE INSERT OR UPDATE OF latitude, longitude ON users
        FOR EACH ROW
        WHEN (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
        EXECUTE FUNCTION update_location();
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    // Drop triggers first
    await sql`DROP TRIGGER IF EXISTS update_user_location ON users`.execute(db);

    // Drop functions
    await sql`DROP FUNCTION IF EXISTS update_location()`.execute(db);

    // Drop tables in reverse order of dependencies
    await db.schema.dropTable('admin_users').ifExists().execute();
    await db.schema.dropTable('unavailable_dates').ifExists().execute();
    await db.schema.dropTable('availability').ifExists().execute();
    await db.schema.dropTable('reviews').ifExists().execute();
    await db.schema.dropTable('bookings').ifExists().execute();
    await db.schema.dropTable('dogs').ifExists().execute();
    await db.schema.dropTable('sitter_breed_specialties').ifExists().execute();
    await db.schema.dropTable('dog_breeds').ifExists().execute();
    await db.schema.dropTable('sitter_certificates').ifExists().execute();
    await db.schema.dropTable('sitter_services').ifExists().execute();
    await db.schema.dropTable('sitters').ifExists().execute();
    await db.schema.dropTable('oauth_accounts').ifExists().execute();
    await db.schema.dropTable('users').ifExists().execute();

    // Drop enum types
    await sql`DROP TYPE IF EXISTS auth_provider CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS verification_status CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS service_type CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS size_category CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS booking_status CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS location_type CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS sex CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS admin_role CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS vaccination_status CASCADE`.execute(db);
}
