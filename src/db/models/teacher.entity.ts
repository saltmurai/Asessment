import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Student } from './student.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn({ name: 'teacher_id' })
  teacherId: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Student, (student) => student.teachers)
  @JoinTable({
    name: 'teacher_students',
    joinColumn: {
      name: 'teacher_id',
      referencedColumnName: 'teacherId',
    },
    inverseJoinColumn: {
      name: 'student_id',
      referencedColumnName: 'studentId',
    },
  })
  students: Student[];
}
