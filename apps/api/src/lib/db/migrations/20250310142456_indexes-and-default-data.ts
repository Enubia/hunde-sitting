import type { Kysely } from 'kysely';

import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createIndex('idx_sitters_verification_status')
        .on('sitters')
        .column('verification_status')
        .execute();

    await db.schema
        .createIndex('idx_bookings_status')
        .on('bookings')
        .column('status')
        .execute();

    await db.schema
        .createIndex('idx_bookings_date_range')
        .on('bookings')
        .columns(['start_date', 'end_date'])
        .execute();

    await db.schema
        .createIndex('idx_users_email')
        .on('users')
        .column('email')
        .execute();

    await db.schema
        .createIndex('idx_users_location')
        .on('users')
        .using('GIST')
        .column('location')
        .execute();

    await db.schema
        .createIndex('idx_sitters_user_id')
        .on('sitters')
        .column('user_id')
        .execute();

    await db.schema
        .createIndex('idx_oauth_provider_user_id')
        .on('oauth_accounts')
        .columns(['provider', 'provider_user_id'])
        .execute();

    await db.schema
        .createIndex('idx_revisions_table_record')
        .on('revisions')
        .columns(['table_name', 'record_id'])
        .execute();

    await db.schema
        .createIndex('idx_revisions_user_id')
        .on('revisions')
        .column('user_id')
        .execute();

    await db.schema
        .createIndex('idx_revisions_created_at')
        .on('revisions')
        .column('created_at')
        .execute();

    await db.schema
        .createIndex('idx_revisions_changed_fields')
        .on('revisions')
        .using('gin')
        .column('changed_fields')
        .execute();

    await sql`
        CREATE TRIGGER update_user_location
        BEFORE INSERT OR UPDATE OF latitude, longitude ON users
        FOR EACH ROW
        WHEN (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
        EXECUTE FUNCTION update_location();
    `.execute(db);

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
    ];

    for (const table of tables) {
        await sql`
            CREATE TRIGGER ${sql.raw(`${table}_revision`)}
            AFTER INSERT OR UPDATE OR DELETE ON ${sql.raw(table)}
            FOR EACH ROW EXECUTE FUNCTION record_revision();
        `.execute(db);
    }

    await sql`
        CREATE TRIGGER update_user_permissions_on_membership_change
        AFTER INSERT OR UPDATE OR DELETE ON user_group_memberships
        FOR EACH ROW EXECUTE FUNCTION update_user_permissions_from_groups();

        CREATE TRIGGER update_users_on_group_permission_change
        AFTER UPDATE OF permissions ON user_groups
        FOR EACH ROW EXECUTE FUNCTION update_users_on_group_change();
    `.execute(db);

    await sql`
        INSERT INTO
        user_groups (name, description, permissions)
        VALUES 
        (
            'administrator',
            'Full access to all resources',
            generate_default_permissions('admin'::permission_level)
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
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.deleteFrom('user_groups')
        .where('name', 'in', ['administrator', 'moderator'])
        .execute();

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
    ];

    for (const table of tables) {
        await sql`DROP TRIGGER IF EXISTS ${sql.raw(`${table}_revision`)} ON ${sql.raw(table)}`.execute(db);
    }

    await sql`
        DROP TRIGGER IF EXISTS update_user_permissions_on_membership_change ON user_group_memberships;
        DROP TRIGGER IF EXISTS update_users_on_group_permission_change ON user_groups;
        DROP TRIGGER IF EXISTS update_user_location ON users;
    `.execute(db);

    await db.schema.dropIndex('idx_sitters_verification_status').execute();
    await db.schema.dropIndex('idx_bookings_status').execute();
    await db.schema.dropIndex('idx_bookings_date_range').execute();
    await db.schema.dropIndex('idx_users_email').execute();
    await db.schema.dropIndex('idx_users_location').execute();
    await db.schema.dropIndex('idx_sitters_user_id').execute();
    await db.schema.dropIndex('idx_oauth_provider_user_id').execute();
    await db.schema.dropIndex('idx_revisions_table_record').execute();
    await db.schema.dropIndex('idx_revisions_user_id').execute();
    await db.schema.dropIndex('idx_revisions_created_at').execute();
    await db.schema.dropIndex('idx_revisions_changed_fields').execute();
}
