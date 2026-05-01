import bcrypt from 'bcryptjs';
import { db } from './db.ts';

export function seed() {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as any;
  if (userCount.count > 0) return;

  console.log('Seeding demo data...');

  const insertUser = db.prepare('INSERT INTO users (username, password, role, full_name, email) VALUES (?, ?, ?, ?, ?)');
  const hashedPw = bcrypt.hashSync('admin123', 10);
  const teacherPw = bcrypt.hashSync('teacher123', 10);
  const parentPw = bcrypt.hashSync('parent123', 10);

  insertUser.run('admin', hashedPw, 'admin', 'System Admin', 'admin@school.tn.gov.in');
  insertUser.run('teacher1', teacherPw, 'teacher', 'Muthu Kumar', 'muthu@school.tn.gov.in');
  insertUser.run('teacher2', teacherPw, 'teacher', 'Selvi Raman', 'selvi@school.tn.gov.in');
  insertUser.run('parent1', parentPw, 'parent', 'Ganesan P', 'ganesan@gmail.com');

  // Teachers
  db.prepare('INSERT INTO teachers (user_id, subject, phone, class_id) VALUES (?, ?, ?, ?)').run(2, 'Mathematics', '+919876543210', 1);
  db.prepare('INSERT INTO teachers (user_id, subject, phone, class_id) VALUES (?, ?, ?, ?)').run(3, 'Tamil', '+919876543211', 2);

  // Parents
  db.prepare('INSERT INTO parents (user_id, phone, address) VALUES (?, ?, ?)').run(4, '8778614984', 'Main St, Madurai');

  // Classes
  db.prepare('INSERT INTO classes (name, teacher_id) VALUES (?, ?)').run('Standard 10-A', 1);
  db.prepare('INSERT INTO classes (name, teacher_id) VALUES (?, ?)').run('Standard 10-B', 2);

  // Students
  const insertStudent = db.prepare('INSERT INTO students (full_name, roll_number, class_id, parent_id) VALUES (?, ?, ?, ?)');
  insertStudent.run('Rahul G', '10A01', 1, 1);
  insertStudent.run('Anu G', '10A02', 1, 1);

  // Marks
  db.prepare('INSERT INTO marks (student_id, subject, marks, max_marks, exam_name, date) VALUES (?, ?, ?, ?, ?, ?)')
    .run(1, 'Mathematics', 85, 100, 'Quarterly', '2024-03-20');
}
