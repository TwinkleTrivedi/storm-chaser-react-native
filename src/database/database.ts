import * as SQLite from 'expo-sqlite';

import { migrate } from '@/database/migrations';
import { AppError } from '@/utils/errors';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    const db = await SQLite.openDatabaseAsync('stormchaser.db');
    await migrate(db);
    return db;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    throw new AppError('storage', `Local storage could not be opened. ${message}`);
  }
}

/** Shared database handle. A failed open is forgotten so the next call can retry. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}
