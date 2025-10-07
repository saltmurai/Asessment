import { Injectable } from '@nestjs/common';
import { Repository, In, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from '../models/teacher.entity';
import { ITeacherRepository } from './teacher.repository.interface';

@Injectable()
export class TeacherRepository implements ITeacherRepository {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
  ) {}

  async findByEmail(email: string): Promise<Teacher | null> {
    return this.teacherRepo.findOne({
      where: { email },
    });
  }

  async findByEmails(emails: string[]): Promise<Teacher[]> {
    return this.teacherRepo.find({
      where: { email: In(emails) },
    });
  }

  async create(email: string): Promise<Teacher> {
    const teacher = this.teacherRepo.create({ email });
    return this.teacherRepo.save(teacher);
  }

  async findOrCreate(email: string): Promise<Teacher> {
    let teacher = await this.findByEmail(email);
    if (!teacher) {
      teacher = await this.create(email);
    }
    return teacher;
  }

  // Method to work with transactions
  getRepository(entityManager?: EntityManager): Repository<Teacher> {
    return entityManager
      ? entityManager.getRepository(Teacher)
      : this.teacherRepo;
  }
}
