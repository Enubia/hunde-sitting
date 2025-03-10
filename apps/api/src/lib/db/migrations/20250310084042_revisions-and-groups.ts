import type { Kysely } from 'kysely';

import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    // Create permission level enum
    await sql`CREATE TYPE permission_level AS ENUM ('read', 'write', 'admin')`.execute(db);

    // Create resource_name enum with all tables
    await sql`CREATE TYPE resource_name AS ENUM (
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
    )`.execute(db);

    // Create action_name enum
    await sql`CREATE TYPE action_name AS ENUM ('INSERT', 'UPDATE', 'DELETE')`.execute(db);

    // Create user_groups table
    await db.schema
        .createTable('user_groups')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('name', 'varchar(100)', col => col.notNull().unique())
        .addColumn('description', 'text')
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create user_group_memberships table
    await db.schema
        .createTable('user_group_memberships')
        .addColumn('user_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('group_id', 'uuid', col => col.notNull().references('user_groups.id').onDelete('cascade'))
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addPrimaryKeyConstraint('user_group_memberships_pkey', ['user_id', 'group_id'])
        .execute();

    // Create group_permissions table
    await db.schema
        .createTable('group_permissions')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('group_id', 'uuid', col => col.notNull().references('user_groups.id').onDelete('cascade'))
        .addColumn('resource', sql`resource_name`, col => col.notNull())
        .addColumn('permission', sql`permission_level`, col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addUniqueConstraint('group_permissions_unique', ['group_id', 'resource'])
        .execute();

    // Create user_permissions table
    await db.schema
        .createTable('user_permissions')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('user_id', 'uuid', col => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('resource', sql`resource_name`, col => col.notNull())
        .addColumn('permission', sql`permission_level`, col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addUniqueConstraint('user_permissions_unique', ['user_id', 'resource'])
        .execute();

    // Create revisions table
    await db.schema
        .createTable('revisions')
        .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('table_name', 'varchar(100)', col => col.notNull())
        .addColumn('record_id', 'uuid', col => col.notNull())
        .addColumn('user_id', 'uuid', col => col.references('users.id').onDelete('set null'))
        .addColumn('action', sql`action_name`, col => col.notNull())
        .addColumn('old_values', 'jsonb')
        .addColumn('new_values', 'jsonb')
        .addColumn('changed_fields', sql`text[]`)
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Create indexes for revisions table
    await db.schema.createIndex('idx_revisions_table_record').on('revisions').columns(['table_name', 'record_id']).execute();
    await db.schema.createIndex('idx_revisions_user_id').on('revisions').column('user_id').execute();
    await db.schema.createIndex('idx_revisions_created_at').on('revisions').column('created_at').execute();
    await db.schema.createIndex('idx_revisions_changed_fields').on('revisions').using('gin').column('changed_fields').execute();

    // Create record_revision function
    await sql`
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

    // Create triggers for all tables
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
        'admin_users',
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
        AFTER INSERT OR UPDATE OR DELETE ON ${sql.raw(table)}
        FOR EACH ROW EXECUTE FUNCTION record_revision()
        `.execute(db);
    }

    // Insert default user groups
    await sql`
    INSERT INTO user_groups (name, description)
    VALUES 
        ('administrators', 'Full access to all resources'),
        ('moderators', 'Can review and moderate content'),
        ('sitters', 'Dog sitters with access to their own data and bookings'),
        ('clients', 'Pet owners with access to their own data and bookings')
    `.execute(db);

    // Set up permissions for administrators (full access to ALL tables)
    await sql`
    INSERT INTO group_permissions (group_id, resource, permission)
    SELECT 
        (SELECT id FROM user_groups WHERE name = 'administrators'),
        resource,
        'admin'::permission_level
    FROM unnest(enum_range(NULL::resource_name)) as resource
    `.execute(db);

    // Moderator permissions - write access to most tables
    await sql`
    INSERT INTO group_permissions (group_id, resource, permission)
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
    ]::resource_name[]) as resource
    `.execute(db);

    // Moderator permissions - read access to some tables
    await sql`
    INSERT INTO group_permissions (group_id, resource, permission)
    SELECT 
        (SELECT id FROM user_groups WHERE name = 'moderators'),
        resource,
        'read'::permission_level
    FROM unnest(ARRAY[
        'users',
        'revisions'
    ]::resource_name[]) as resource
    `.execute(db);

    // Set up basic permissions for sitters
    await sql`
    INSERT INTO group_permissions (group_id, resource, permission)
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
    ]::resource_name[]) as resource
    `.execute(db);

    // Set up basic permissions for clients
    await sql`
    INSERT INTO group_permissions (group_id, resource, permission)
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
    ]::resource_name[]) as resource
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    // Drop triggers first
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
        'admin_users',
        'oauth_accounts',
        'sitter_breed_specialties',
        'user_groups',
        'user_group_memberships',
        'group_permissions',
        'user_permissions',
    ];

    for (const table of tables) {
        await sql`DROP TRIGGER IF EXISTS ${sql.raw(`${table}_revision`)} ON ${sql.raw(table)}`.execute(db);
    }

    // Drop function
    await sql`DROP FUNCTION IF EXISTS record_revision()`.execute(db);

    // Drop tables in reverse order of dependencies
    await db.schema.dropTable('user_permissions').ifExists().execute();
    await db.schema.dropTable('group_permissions').ifExists().execute();
    await db.schema.dropTable('user_group_memberships').ifExists().execute();
    await db.schema.dropTable('user_groups').ifExists().execute();
    await db.schema.dropTable('revisions').ifExists().execute();

    // Drop enum types
    await sql`DROP TYPE IF EXISTS permission_level CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS resource_name CASCADE`.execute(db);
    await sql`DROP TYPE IF EXISTS action_name CASCADE`.execute(db);
}
