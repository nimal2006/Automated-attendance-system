import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Create static folders
export const uploadDir = path.join(process.cwd(), 'static/uploads/faces');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dwuidfkmzvvccavkrarz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWlkZmttenZ2Y2NhdmtyYXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDcyMTEsImV4cCI6MjA5MzEyMzIxMX0.f2Z6jHNyYF0UTNavmZipeqJ29NjS1MTOYjT2YUgrLxs';

// Ensure URL is valid for Supabase
if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  // If it's probably just the project ref (e.g. fwuidf...)
  if (!supabaseUrl.includes('.')) {
    supabaseUrl = `https://${supabaseUrl}.supabase.co`;
  } else {
    supabaseUrl = `https://${supabaseUrl}`;
  }
}

try {
  new URL(supabaseUrl);
} catch (e) {
  // Fall back to default if totally malformed
  supabaseUrl = 'https://dwuidfkmzvvccavkrarz.supabase.co';
}

if (!supabaseUrl) {
  console.warn('MISSING VITE_SUPABASE_URL. Supabase functionality will be disabled.');
}

let _supabaseClient: any = null;
export const supabase: import('@supabase/supabase-js').SupabaseClient = new Proxy({}, {
  get(target, prop) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("MISSING Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings.");
    }
    if (!_supabaseClient) {
      _supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
    const val = _supabaseClient[prop];
    if (typeof val === 'function') {
      return val.bind(_supabaseClient);
    }
    return val;
  }
}) as any;

// Deprecated SQLite connection (for local dev without supabase config)
import Database from 'better-sqlite3';
const dbFile = 'database.db';
export const db = new Database(dbFile);

export function initDb() {
  // SQLite init (remains for backward compatibility)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      full_name TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject TEXT,
      phone TEXT,
      class_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      phone TEXT,
      address TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      teacher_id INTEGER,
      FOREIGN KEY(teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      roll_number TEXT UNIQUE,
      class_id INTEGER,
      parent_id INTEGER,
      attendance_percentage REAL DEFAULT 0,
      image_path TEXT,
      face_encoding TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(class_id) REFERENCES classes(id),
      FOREIGN KEY(parent_id) REFERENCES parents(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      date TEXT,
      time TEXT,
      status TEXT,
      method TEXT,
      marked_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, date),
      FOREIGN KEY(student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      subject TEXT,
      marks INTEGER,
      max_marks INTEGER,
      exam_name TEXT,
      date TEXT,
      FOREIGN KEY(student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      student_id INTEGER,
      start_date TEXT,
      end_date TEXT,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      approved_by INTEGER,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(parent_id) REFERENCES parents(id),
      FOREIGN KEY(student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS anticheat_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      type TEXT,
      evidence_path TEXT,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}
