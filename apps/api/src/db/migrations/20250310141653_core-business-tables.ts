import type { Kysely } from 'kysely';

import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
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

    await db.schema
        .createTable('dog_breeds')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'varchar(100)', col => col.unique().notNull())
        .addColumn('size_category', sql`size_category`, col => col.notNull())
        .addColumn('requires_certificate', 'boolean', col => col.defaultTo(false).notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    await db.schema
        .createTable('sitter_breed_specialties')
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('breed_id', 'integer', col => col.references('dog_breeds.id').onDelete('cascade').notNull())
        .addColumn('experience_years', 'integer', col => col.defaultTo(0).notNull())
        .addColumn('additional_notes', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addPrimaryKeyConstraint('sitter_breed_specialties_pkey', ['sitter_id', 'breed_id'])
        .execute();

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
        .addColumn('sex', sql`sex`, col => col.notNull())
        .addColumn('is_neutered', 'boolean')
        .addColumn('medical_conditions', 'text')
        .addColumn('special_care_requirements', 'text')
        .addColumn('vaccination_status', sql`vaccination_status`, col => col.defaultTo('unknown').notNull())
        .addColumn('temperament', 'text')
        .addColumn('photo_url', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

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

    await db.schema
        .createTable('unavailable_dates')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('sitter_id', 'integer', col => col.references('sitters.id').onDelete('cascade').notNull())
        .addColumn('start_date', 'timestamptz', col => col.notNull())
        .addColumn('end_date', 'timestamptz', col => col.notNull())
        .addColumn('reason', 'varchar(255)')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addCheckConstraint('valid_date_range', sql`start_date < end_date`)
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
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
}
