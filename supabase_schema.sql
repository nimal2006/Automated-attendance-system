-- SQL Script to set up Supabase Tables for AI Face Recognition Attendance System

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  subject TEXT,
  phone TEXT,
  class_id BIGINT
);

-- 3. Parents Table
CREATE TABLE IF NOT EXISTS parents (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  phone TEXT,
  address TEXT
);

-- 4. Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE NOT NULL,
  teacher_id BIGINT REFERENCES teachers(id)
);

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  class_id BIGINT REFERENCES classes(id),
  parent_id BIGINT REFERENCES parents(id),
  attendance_percentage NUMERIC DEFAULT 0,
  image_path TEXT,
  face_encoding TEXT, -- Store as JSON string of 128 floats
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id BIGINT REFERENCES students(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL,
  method TEXT,
  marked_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- 7. Marks Table
CREATE TABLE IF NOT EXISTS marks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id BIGINT REFERENCES students(id),
  subject TEXT NOT NULL,
  marks NUMERIC NOT NULL,
  max_marks NUMERIC NOT NULL,
  exam_name TEXT,
  date DATE
);

-- 8. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  parent_id BIGINT REFERENCES parents(id),
  student_id BIGINT REFERENCES students(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Pending',
  approved_by BIGINT REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Anticheat Logs Table
CREATE TABLE IF NOT EXISTS anticheat_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id BIGINT REFERENCES students(id),
  type TEXT NOT NULL,
  evidence_path TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) is recommended in production, 
-- but for this setup we assume the Service Role Key or public access is used as per the user's simple request.
