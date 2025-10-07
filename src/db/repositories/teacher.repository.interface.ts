import { Teacher } from '../models/teacher.entity';

export interface ITeacherRepository {
  findByEmail(email: string): Promise<Teacher | null>;
  findByEmails(emails: string[]): Promise<Teacher[]>;
  create(email: string): Promise<Teacher>;
  findOrCreate(email: string): Promise<Teacher>;
}
