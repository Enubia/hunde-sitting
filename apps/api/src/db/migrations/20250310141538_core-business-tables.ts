import type { Kysely } from 'kysely';

import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    // #region types

    await sql`
        CREATE TYPE auth_provider AS ENUM ('google', 'facebook', 'apple');
        CREATE TYPE user_type AS ENUM ('admin', 'reviewer');
        CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
        CREATE TYPE service_type AS ENUM ('dog_walking', 'overnight_stay', 'daycare', 'boarding', 'training', 'grooming', 'vet_visits', 'pet_taxi');
        CREATE TYPE size_category AS ENUM ('tiny', 'small', 'medium', 'large', 'giant');
        CREATE TYPE vaccination_status AS ENUM ('fully_vaccinated', 'partially_vaccinated', 'not_vaccinated', 'unknown');
        CREATE TYPE location_type AS ENUM ('sitter_home', 'client_home', 'park', 'other');
        CREATE TYPE sex AS ENUM ('male', 'female');
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
    `.execute(db);

    // #endregion types

    // #region tables

    await db.schema
        .createTable('users')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('email', 'varchar(255)', col => col.notNull())
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('is_active', 'boolean', col => col.defaultTo(false))
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addUniqueConstraint('users_email_unique', ['email'])
        .execute();

    await db.schema
        .createTable('registration_data')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('avatar_url', 'text')
        .addColumn('phone', 'varchar(50)', col => col.notNull())
        .addColumn('bio', 'text')
        .addColumn('address', 'text', col => col.notNull())
        .addColumn('city', 'varchar(100)', col => col.notNull())
        .addColumn('state', 'varchar(100)', col => col.notNull())
        .addColumn('postal_code', 'varchar(20)', col => col.notNull())
        .addColumn('country', 'varchar(100)', col => col.notNull())
        .addUniqueConstraint('registration_data_user_id_unique', ['user_id'])
        .execute();

    await db.schema
        .createTable('email_verification_tokens')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('token', 'uuid', col => col.defaultTo(sql`gen_random_uuid()`))
        .addColumn('verified', 'boolean', col => col.defaultTo(false))
        .addColumn('expires_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP + INTERVAL '1 hour'`))
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addUniqueConstraint('email_verification_tokens_token_unique', ['token'])
        .execute();

    await db.schema
        .createTable('oauth_accounts')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('provider', sql`auth_provider`, col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addUniqueConstraint('oauth_provider_user_id_unique', ['provider', 'user_id'])
        .execute();

    // only used in backoffice, normal users/sitters don't have a group assigned
    await db.schema
        .createTable('user_groups')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('type', sql`user_type`, col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    await db.schema
        .createTable('sitters')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('verification_status', sql`verification_status`, col => col.defaultTo('pending'))
        .addColumn('bio', 'text')
        .addColumn('years_experience', 'smallint')
        .addColumn('hourly_rate', 'decimal(10, 2)', col => col.check(sql`hourly_rate >= 0`))
        .addColumn('daily_rate', 'decimal(10, 2)', col => col.check(sql`daily_rate >= 0`))
        .addColumn('is_available', 'boolean', col => col.defaultTo(true))
        .addColumn('can_host_at_home', 'boolean', col => col.defaultTo(false))
        .addColumn('max_dogs_at_once', 'smallint', col => col.defaultTo(1))
        .addColumn('service_radius_km', 'decimal(8, 2)')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addUniqueConstraint('sitters_user_id_unique', ['user_id'])
        .execute();

    await db.schema
        .createTable('sitter_services')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('description', 'text')
        .addColumn('price', 'decimal(10, 2)')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    await db.schema
        .createTable('sitter_service_names')
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade'))
        .addColumn('name', sql`service_type`)
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addPrimaryKeyConstraint('sitter_service_names_pkey', ['sitter_id', 'name'])
        .execute();

    await db.schema
        .createTable('sitter_certificates')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('certificate_name', 'varchar(255)', col => col.notNull())
        .addColumn('issuing_organization', 'varchar(255)', col => col.notNull())
        .addColumn('issue_date', 'date')
        .addColumn('expiration_date', 'date')
        .addColumn('certificate_file_url', 'text')
        .addColumn('verification_status', sql`verification_status`, col => col.defaultTo('pending'))
        .addColumn('admin_notes', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    await db.schema
        .createTable('dog_breeds')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'varchar(100)', col => col.unique().notNull())
        .addColumn('size_category', sql`size_category`, col => col.notNull())
        .addColumn('requires_certificate', 'boolean', col => col.defaultTo(false))
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    await db.schema
        .createTable('sitter_breed_specialties')
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade'))
        .addColumn('breed_id', 'integer', col => col.references('dog_breeds.id').onDelete('cascade'))
        .addColumn('experience_years', 'integer', col => col.defaultTo(0))
        .addColumn('additional_notes', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        // same as unique but also adds not null constraint
        .addPrimaryKeyConstraint('sitter_breed_specialties_pkey', ['sitter_id', 'breed_id'])
        .execute();

    await db.schema
        .createTable('dogs')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('owner_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar(100)', col => col.notNull())
        .addColumn('breed_id', 'integer', col => col.references('dog_breeds.id').onDelete('set null'))
        .addColumn('mixed_breed', 'boolean', col => col.defaultTo(false))
        .addColumn('age_years', 'integer')
        .addColumn('age_months', 'integer')
        .addColumn('weight_kg', 'decimal(5, 2)')
        .addColumn('sex', sql`sex`, col => col.notNull())
        .addColumn('is_neutered', 'boolean')
        .addColumn('medical_conditions', 'text')
        .addColumn('special_care_requirements', 'text')
        .addColumn('vaccination_status', sql`vaccination_status`, col => col.defaultTo('unknown'))
        .addColumn('photo_url', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    await db.schema
        .createTable('bookings')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('client_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('service_id', 'integer', col => col.references('sitter_services.id').onDelete('set null'))
        .addColumn('status', sql`booking_status`, col => col.defaultTo('pending').notNull())
        .addColumn('canceled_by', 'integer', col => col.references('users.id').onDelete('set null'))
        .addColumn('start_date', 'timestamptz', col => col.notNull())
        .addColumn('end_date', 'timestamptz', col => col.notNull())
        .addColumn('location_type', sql`location_type`, col => col.notNull())
        .addColumn('location_address', 'text')
        .addColumn('special_instructions', 'text')
        .addColumn('total_price', 'decimal(10, 2)')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addCheckConstraint('valid_date_range', sql`start_date < end_date`)
        .addCheckConstraint('client_not_sitter', sql`client_id <> sitter_id`)
        .execute();

    await db.schema
        .createTable('booking_dogs')
        .addColumn('booking_id', 'integer', col => col.references('bookings.id').onDelete('cascade'))
        .addColumn('dog_id', 'integer', col => col.references('dogs.id').onDelete('cascade'))
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addPrimaryKeyConstraint('booking_dogs_pkey', ['booking_id', 'dog_id'])
        .execute();

    await db.schema
        .createTable('reviews')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('reviewer_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('sitter_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('rating', 'integer', col => col.notNull().check(sql`rating BETWEEN 1 AND 5`))
        .addColumn('comment', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addCheckConstraint('reviewer_not_sitter', sql`reviewer_id <> sitter_id`)
        .execute();

    await db.schema
        .createTable('availability')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('day_of_week', 'integer', col => col.notNull().check(sql`day_of_week BETWEEN 0 AND 6`))
        .addColumn('start_time', 'time', col => col.notNull())
        .addColumn('end_time', 'time', col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        // ensures that a sitter can only have one availability for a given day
        // what if a sitter is just walking dogs and can have multiple walks in a day?
        // .addUniqueConstraint('availability_sitter_id_day_of_week_unique', ['sitter_id', 'day_of_week'])
        .addCheckConstraint('valid_time_range', sql`start_time < end_time`)
        .execute();

    await db.schema
        .createTable('unavailable_dates')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('start_date', 'timestamptz', col => col.notNull())
        .addColumn('end_date', 'timestamptz', col => col.notNull())
        .addColumn('reason', 'varchar(255)')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addCheckConstraint('valid_date_range', sql`start_date < end_date`)
        .execute();

    // #endregion tables

    // #region indexes

    await db.schema.createIndex('idx_users_email').on('users').column('email').execute();

    await db.schema.createIndex('idx_registration_data_user_id').on('registration_data').column('user_id').execute();
    await db.schema.createIndex('idx_registration_data_location').on('registration_data').columns(['city', 'state', 'postal_code']).execute();

    await db.schema.createIndex('idx_email_verification_tokens_token').on('email_verification_tokens').columns(['token']).execute();
    await db.schema.createIndex('idx_email_verification_tokens_user_id').on('email_verification_tokens').column('user_id').execute();
    await db.schema.createIndex('idx_oauth_user_id').on('oauth_accounts').columns(['user_id']).execute();
    await db.schema.createIndex('idx_oauth_provider').on('oauth_accounts').column('provider').execute();

    await db.schema.createIndex('idx_user_groups_user_id').on('user_groups').column('user_id').execute();
    await db.schema.createIndex('idx_user_groups_type').on('user_groups').column('type').execute();

    await db.schema.createIndex('idx_sitters_user_id').on('sitters').column('user_id').execute();

    await db.schema.createIndex('idx_sitter_services_sitter_id').on('sitter_services').column('sitter_id').execute();

    await db.schema.createIndex('idx_sitter_breed_specialties_sitter_id').on('sitter_breed_specialties').column('sitter_id').execute();
    await db.schema.createIndex('idx_sitter_breed_specialties_breed_id').on('sitter_breed_specialties').column('breed_id').execute();
    await db.schema.createIndex('idx_dogs_owner_id').on('dogs').column('owner_id').execute();

    await db.schema.createIndex('idx_bookings_client_id').on('bookings').column('client_id').execute();
    await db.schema.createIndex('idx_bookings_sitter_id').on('bookings').column('sitter_id').execute();
    await db.schema.createIndex('idx_bookings_service_id').on('bookings').column('service_id').execute();
    await db.schema.createIndex('idx_bookings_canceled_by').on('bookings').column('canceled_by').execute();
    await db.schema.createIndex('idx_bookings_status').on('bookings').column('status').execute();
    await db.schema.createIndex('idx_bookings_sitter_dates').on('bookings').columns(['sitter_id', 'start_date', 'end_date']).execute();

    await db.schema.createIndex('idx_reviews_reviewer_id').on('reviews').column('reviewer_id').execute();
    await db.schema.createIndex('idx_reviews_sitter_id').on('reviews').column('sitter_id').execute();

    await db.schema.createIndex('idx_availability_sitter_id').on('availability').column('sitter_id').execute();

    await db.schema.createIndex('idx_unavailable_dates_sitter_id').on('unavailable_dates').column('sitter_id').execute();

    // #endregion indexes
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropIndex('idx_unavailable_dates_sitter_id').on('unavailable_dates').execute();

    await db.schema.dropIndex('idx_availability_sitter_id').on('availability').execute();

    await db.schema.dropIndex('idx_reviews_sitter_id').on('reviews').execute();
    await db.schema.dropIndex('idx_reviews_reviewer_id').on('reviews').execute();

    await db.schema.dropIndex('idx_bookings_sitter_dates').on('bookings').execute();
    await db.schema.dropIndex('idx_bookings_status').on('bookings').execute();
    await db.schema.dropIndex('idx_bookings_canceled_by').on('bookings').execute();
    await db.schema.dropIndex('idx_bookings_service_id').on('bookings').execute();
    await db.schema.dropIndex('idx_bookings_sitter_id').on('bookings').execute();
    await db.schema.dropIndex('idx_bookings_client_id').on('bookings').execute();

    await db.schema.dropIndex('idx_dogs_owner_id').on('dogs').execute();

    await db.schema.dropIndex('idx_sitter_breed_specialties_breed_id').on('sitter_breed_specialties').execute();
    await db.schema.dropIndex('idx_sitter_breed_specialties_sitter_id').on('sitter_breed_specialties').execute();

    await db.schema.dropIndex('idx_sitter_services_service_name').on('sitter_services').execute();
    await db.schema.dropIndex('idx_sitter_services_sitter_id').on('sitter_services').execute();

    await db.schema.dropIndex('idx_sitters_user_id').on('sitters').execute();

    await db.schema.dropIndex('idx_user_groups_type').on('user_groups').execute();

    await db.schema.dropIndex('idx_oauth_provider').on('oauth_accounts').execute();
    await db.schema.dropIndex('idx_oauth_user_id').on('oauth_accounts').execute();

    await db.schema.dropIndex('idx_email_verification_tokens_user_id').on('email_verification_tokens').execute();
    await db.schema.dropIndex('idx_email_verification_tokens_token').on('email_verification_tokens').execute();

    await db.schema.dropIndex('idx_registration_data_location').on('registration_data').execute();
    await db.schema.dropIndex('idx_registration_data_user_id').on('registration_data').execute();

    await db.schema.dropIndex('idx_users_email').on('users').execute();

    await db.schema.dropTable('unavailable_dates').ifExists().execute();
    await db.schema.dropTable('availability').ifExists().execute();
    await db.schema.dropTable('reviews').ifExists().execute();
    await db.schema.dropTable('booking_dogs').ifExists().execute();
    await db.schema.dropTable('bookings').ifExists().execute();
    await db.schema.dropTable('dogs').ifExists().execute();
    await db.schema.dropTable('sitter_breed_specialties').ifExists().execute();
    await db.schema.dropTable('dog_breeds').ifExists().execute();
    await db.schema.dropTable('sitter_certificates').ifExists().execute();
    await db.schema.dropTable('sitter_services').ifExists().execute();
    await db.schema.dropTable('sitters').ifExists().execute();
    await db.schema.dropTable('user_groups').ifExists().execute();
    await db.schema.dropTable('oauth_accounts').ifExists().execute();
    await db.schema.dropTable('email_verification_tokens').ifExists().execute();
    await db.schema.dropTable('registration_data').ifExists().execute();
    await db.schema.dropTable('users').ifExists().execute();

    await sql`DROP TYPE IF EXISTS booking_status CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS sex CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS location_type CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS vaccination_status CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS size_category CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS service_type CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS verification_status CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS user_type CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS auth_provider CASCADE`.execute(db);
}
