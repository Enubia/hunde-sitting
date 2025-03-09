import type { Kysely } from 'kysely';

import { sql } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
    // up migration code goes here...
    // note: up migrations are mandatory. you must implement this function.
    // For more info, see: https://kysely.dev/docs/migrations
    await db.schema
        .createTable('users')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('email', 'text', col => col.unique())
        .addColumn('created_at', 'timestamp', col =>
            col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamp', col =>
            col.defaultTo(sql`now()`).notNull())
        .execute();

    await db.schema
        .createTable('posts')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('title', 'text')
        .addColumn('content', 'text')
        .addColumn('user_id', 'integer', col =>
            col.references('users.id').notNull())
        .addColumn('created_at', 'timestamp', col =>
            col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamp', col =>
            col.defaultTo(sql`now()`).notNull())
        .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
    // down migration code goes here...
    // note: down migrations are optional. you can safely delete this function.
    // For more info, see: https://kysely.dev/docs/migrations

    await db.schema.dropTable('users').execute();
    await db.schema.dropTable('posts').execute();
}
