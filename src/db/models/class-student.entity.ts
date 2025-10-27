import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Class } from './class.entity';
import { Student } from './student.entity';

@Entity('class_students')
@Unique(['classId', 'studentId'])
export class ClassStudent {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
