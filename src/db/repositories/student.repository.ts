import { Injectable } from '@nestjs/common';
import { Repository, In, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../models/student.entity';
import { IStudentRepository } from './student.repository.interface';

@Injectable()
export class StudentRepository implements IStudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async findByEmail(email: string): Promise<Student | null> {
    return this.studentRepo.findOne({
      where: { email },
    });
  }

  async findByEmails(emails: string[]): Promise<Student[]> {
    return this.studentRepo.find({
      where: { email: In(emails) },
    });
  }

  async create(email: string, isSuspended: number = 0): Promise<Student> {
    const student = this.studentRepo.create({
      email,
      isSuspended,
    });
    return this.studentRepo.save(student);
  }

  async findOrCreate(email: string, isSuspended: number = 0): Promise<Student> {
    let student = await this.findByEmail(email);
    if (!student) {
      student = await this.create(email, isSuspended);
    }
    return student;
  }

  async suspend(studentId: number): Promise<void> {
    await this.studentRepo.update(studentId, { isSuspended: 1 });
  }

  async findRegisteredToAllTeachers(teacherIds: number[]): Promise<Student[]> {
    // Find students who are registered to ALL specified teachers
    const query = this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.teachers', 'teacher')
      .where('teacher.teacherId IN (:...teacherIds)', { teacherIds })
      .groupBy('student.studentId')
      .having('COUNT(DISTINCT teacher.teacherId) = :count', {
        count: teacherIds.length,
      });

    return query.getMany();
  }

  async findByTeacherAndNotSuspended(teacherId: number): Promise<Student[]> {
    return this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.teachers', 'teacher')
      .where('teacher.teacherId = :teacherId', { teacherId })
      .andWhere('student.isSuspended = :isSuspended', { isSuspended: 0 })
      .getMany();
  }

  async findMentionedAndNotSuspended(emails: string[]): Promise<Student[]> {
    return this.studentRepo.find({
      where: {
        email: In(emails),
        isSuspended: 0,
      },
    });
  }

  // Method to work with transactions
  getRepository(entityManager?: EntityManager): Repository<Student> {
    return entityManager
      ? entityManager.getRepository(Student)
      : this.studentRepo;
  }
}
