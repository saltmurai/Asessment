import {
  mysqlTable,
  serial,
  text,
  varchar,
  int,
  bigint,
  timestamp,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// Teachers table
export const teachers = mysqlTable("teachers", {
  teacherId: int("teacher_id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Students table
export const students = mysqlTable("students", {
  studentId: int("student_id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isSuspended: int("is_suspended").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Junction table for many-to-many relationship between teachers and students
export const teacherStudents = mysqlTable(
  "teacher_students",
  {
    teacherId: int("teacher_id")
      .notNull()
      .references(() => teachers.teacherId),
    studentId: int("student_id")
      .notNull()
      .references(() => students.studentId),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teacherId, table.studentId] }),
  })
);
