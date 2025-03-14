import type { Kysely } from 'kysely';

import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await sql`
        CREATE TYPE auth_provider AS ENUM ('google', 'facebook', 'apple', 'github');
        CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
        CREATE TYPE service_type AS ENUM ('dog_walking', 'overnight_stay', 'daycare', 'boarding', 'training', 'grooming', 'vet_visits', 'pet_taxi');
        CREATE TYPE size_category AS ENUM ('tiny', 'small', 'medium', 'large', 'giant');
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected');
        CREATE TYPE location_type AS ENUM ('sitter_home', 'client_home', 'park', 'other');
        CREATE TYPE sex AS ENUM ('male', 'female');
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
            'oauth_accounts',
            'user_groups',
            'user_group_memberships',
            'revisions',
            'sitter_breed_specialties'
        );
    `.execute(db);

    await sql`CREATE EXTENSION IF NOT EXISTS postgis`.execute(db);

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
        .addColumn('location', sql`geography(POINT)`)
        .addColumn('is_active', 'boolean', col => col.defaultTo(true).notNull())
        .addColumn('is_email_verified', 'boolean', col => col.defaultTo(false).notNull())
        .addColumn('permissions', 'jsonb', col => col.defaultTo('{}').notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

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

    await db.schema
        .createTable('user_groups')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'varchar(100)', col => col.notNull())
        .addColumn('description', 'text')
        .addColumn('permissions', 'jsonb', col => col.defaultTo('{}').notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    await db.schema
        .createTable('user_group_memberships')
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
        .addColumn('group_id', 'integer', col => col.references('user_groups.id').onDelete('cascade').notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addPrimaryKeyConstraint('user_group_memberships_pkey', ['user_id', 'group_id'])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('user_group_memberships').ifExists().execute();
    await db.schema.dropTable('user_groups').ifExists().execute();
    await db.schema.dropTable('oauth_accounts').ifExists().execute();
    await db.schema.dropTable('users').ifExists().execute();

    const enums = [
        'resource_name',
        'permission_level',
        'action_name',
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

    // await sql`DROP EXTENSION IF EXISTS postgis`.execute(db);
}
