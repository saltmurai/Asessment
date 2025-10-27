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
import { Subject } from './subject.entity';

@Entity('class_subjects')
@Unique(['classId', 'subjectId'])
export class ClassSubject {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ name: 'subject_id' })
  subjectId: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
