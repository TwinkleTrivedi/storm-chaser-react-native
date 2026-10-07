import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Schema version 1 stores storm reports.
 * Statements are idempotent so a retry after a partial failure is safe.
 * storm_type values must stay in sync with STORM_TYPES in storm.types.ts.
 */
const MIGRATIONS: { id: number; sql: string }[] = [
  {
    id: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS storms (
        id TEXT PRIMARY KEY NOT NULL,
        photo_uri TEXT NOT NULL,
        weather_conditions TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        captured_at TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        storm_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'local',
        CHECK (sync_status IN ('local', 'pending', 'synced')),
        CHECK (
          storm_type IN (
            'thunderstorm',
            'supercell',
            'tornado',
            'hail',
            'flash-flood',
            'derecho',
            'winter-storm',
            'tropical',
            'other'
          )
        )
      );
      CREATE INDEX IF NOT EXISTS storms_captured_at ON storms (captured_at);
    `,
  },
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = await db.getAllAsync<{ id: number }>('SELECT id FROM schema_migrations');
  const appliedIds = new Set(applied.map((row) => row.id));

  for (const migration of MIGRATIONS) {
    if (appliedIds.has(migration.id)) {
      continue;
    }
    await db.execAsync(migration.sql);
    await db.runAsync('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)', [
      migration.id,
      new Date().toISOString(),
    ]);
  }
}
