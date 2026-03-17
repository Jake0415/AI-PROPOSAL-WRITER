import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from './schema';

const DB_PATH = path.join(process.cwd(), 'data', 'db', 'aiprowriter.db');

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const sqlite = new Database(DB_PATH);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    _db = drizzle(sqlite, { schema });
  }
  return _db;
}

export function initializeDb() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'uploaded',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rfp_files (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      raw_text TEXT NOT NULL DEFAULT '',
      uploaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rfp_analyses (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      overview TEXT NOT NULL DEFAULT '{}',
      requirements TEXT NOT NULL DEFAULT '[]',
      evaluation_criteria TEXT NOT NULL DEFAULT '[]',
      scope TEXT NOT NULL DEFAULT '{}',
      constraints TEXT NOT NULL DEFAULT '{}',
      keywords TEXT NOT NULL DEFAULT '[]',
      analyzed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS proposal_directions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      candidates TEXT NOT NULL DEFAULT '[]',
      selected_index INTEGER DEFAULT -1,
      custom_notes TEXT DEFAULT '',
      confirmed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS proposal_strategies (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      competitive_strategy TEXT NOT NULL DEFAULT '',
      differentiators TEXT NOT NULL DEFAULT '[]',
      key_messages TEXT NOT NULL DEFAULT '[]',
      custom_notes TEXT DEFAULT '',
      confirmed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS proposal_outlines (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      sections TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS proposal_sections (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      outline_id TEXT NOT NULL REFERENCES proposal_outlines(id),
      section_path TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      diagrams TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending',
      generated_at TEXT,
      edited_at TEXT
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      uploaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS output_files (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      template_id TEXT,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );
  `);

  sqlite.close();
}
