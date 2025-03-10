import type { Kysely } from 'kysely';

import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('revisions')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('table_name', 'varchar(100)', col => col.notNull())
        .addColumn('record_id', 'text', col => col.notNull())
        .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('set null'))
        .addColumn('action', sql`action_name`, col => col.notNull())
        .addColumn('old_values', 'jsonb')
        .addColumn('new_values', 'jsonb')
        .addColumn('changed_fields', sql`text[]`)
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute();

    await sql`
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
                current_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::INT;
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
                record_identifier,
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
    `.execute(db);

    await sql`
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
    `.execute(db);

    await sql`
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
    `.execute(db);

    await sql`
        CREATE OR REPLACE FUNCTION update_users_on_group_change()
        RETURNS TRIGGER AS $$
        DECLARE
            user_id_val INT;
        BEGIN
            -- Skip if permissions didn't change
            IF NEW.permissions = OLD.permissions THEN
                RETURN NULL;
            END IF;
            
            -- Update all users in this group by refreshing their permissions
            FOR user_id_val IN 
                SELECT user_id 
                FROM user_group_memberships 
                WHERE group_id = NEW.id
            LOOP
                PERFORM update_user_permissions(user_id_val);
            END LOOP;
            
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db);

    await sql`
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
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`
        DROP FUNCTION IF EXISTS update_user_permissions(INT) CASCADE;
        DROP FUNCTION IF EXISTS update_users_on_group_change() CASCADE;
        DROP FUNCTION IF EXISTS update_user_permissions_from_groups() CASCADE;
        DROP FUNCTION IF EXISTS generate_default_permissions(permission_level) CASCADE;
        DROP FUNCTION IF EXISTS validate_permissions_jsonb(JSONB) CASCADE;
        DROP FUNCTION IF EXISTS update_location() CASCADE;
        DROP FUNCTION IF EXISTS record_revision() CASCADE;
    `.execute(db);

    await db.schema.dropTable('revisions').ifExists().execute();
}
