import { Student } from '../models/student.entity';

export interface IStudentRepository {
  findByEmail(email: string): Promise<Student | null>;
  findByEmails(emails: string[]): Promise<Student[]>;
  create(email: string, isSuspended?: number): Promise<Student>;
  findOrCreate(email: string, isSuspended?: number): Promise<Student>;
  suspend(studentId: number): Promise<void>;
  findRegisteredToAllTeachers(teacherIds: number[]): Promise<Student[]>;
  findByTeacherAndNotSuspended(teacherId: number): Promise<Student[]>;
  findMentionedAndNotSuspended(emails: string[]): Promise<Student[]>;
}
