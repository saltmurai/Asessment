import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { StudentRepository } from '../db/repositories/student.repository';
import { TeacherRepository } from '../db/repositories/teacher.repository';
import { Student } from '../db/models/student.entity';
import { extractMentionedEmails } from '../utils';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly teacherRepository: TeacherRepository,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findOrCreateTeacher(
    teacherEmail: string,
    entityManager?: EntityManager,
  ): Promise<{ teacherId: number }> {
    if (!teacherEmail) {
      throw new BadRequestException('Teacher email is required');
    }

    const teacherRepo = this.teacherRepository.getRepository(entityManager);

    let teacher = await teacherRepo.findOne({
      where: { email: teacherEmail },
    });

    if (!teacher) {
      teacher = teacherRepo.create({ email: teacherEmail });
      teacher = await teacherRepo.save(teacher);
    }

    return { teacherId: teacher.teacherId };
  }

  async registerStudents(
    teacherEmail: string,
    studentEmails: string[],
  ): Promise<void> {
    if (!teacherEmail) {
      throw new BadRequestException('Teacher email is required');
    }

    if (!studentEmails || studentEmails.length === 0) {
      throw new BadRequestException('At least one student email is required');
    }

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      // 1. Find or create the teacher
      const teacher = await this.findOrCreateTeacher(
        teacherEmail,
        transactionalEntityManager,
      );

      const teacherRepo = this.teacherRepository.getRepository(
        transactionalEntityManager,
      );
      const studentRepo = this.studentRepository.getRepository(
        transactionalEntityManager,
      );

      // Load the teacher with students relationship
      const teacherEntity = await teacherRepo.findOne({
        where: { teacherId: teacher.teacherId },
        relations: ['students'],
      });

      if (!teacherEntity) {
        throw new NotFoundException('Teacher not found');
      }

      // 2. Find or create students
      const students: Student[] = [];

      for (const studentEmail of studentEmails) {
        let student = await studentRepo.findOne({
          where: { email: studentEmail },
        });

        if (!student) {
          student = studentRepo.create({
            email: studentEmail,
            isSuspended: 0,
          });
          student = await studentRepo.save(student);
        }

        students.push(student);
      }

      // 3. Create teacher-student relationships
      // Get existing student IDs to avoid duplicates
      const existingStudentIds = new Set(
        teacherEntity.students.map((s) => s.studentId),
      );

      // Add only new students to the relationship
      const newStudents = students.filter(
        (student) => !existingStudentIds.has(student.studentId),
      );

      if (newStudents.length > 0) {
        teacherEntity.students.push(...newStudents);
        await teacherRepo.save(teacherEntity);
      }
    });
  }

  async getCommonStudents(teacherEmails: string[]): Promise<string[]> {
    if (!teacherEmails || teacherEmails.length === 0) {
      throw new BadRequestException('At least one teacher email is required');
    }

    // First, get the teachers for the provided emails
    const teachers = await this.teacherRepository.findByEmails(teacherEmails);

    // If any teacher doesn't exist, return empty array
    // because students must be registered to ALL teachers
    if (teachers.length !== teacherEmails.length) {
      return [];
    }

    const teacherIds = teachers.map((t) => t.teacherId);

    if (teacherIds.length === 1) {
      const students =
        await this.studentRepository.findByTeacherAndNotSuspended(
          teacherIds[0],
        );
      return students.map((s) => s.email);
    }
    const commonStudents =
      await this.studentRepository.findRegisteredToAllTeachers(teacherIds);

    return commonStudents.map((s) => s.email);
  }

  async suspendStudent(studentEmail: string): Promise<void> {
    if (!studentEmail) {
      throw new BadRequestException('Student email is required');
    }

    const student = await this.studentRepository.findByEmail(studentEmail);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.studentRepository.suspend(student.studentId);
  }

  async getNotificationRecipients(
    teacherEmail: string,
    notificationText: string,
  ): Promise<string[]> {
    const mentionedEmails = extractMentionedEmails(notificationText);

    const teacher = await this.findOrCreateTeacher(teacherEmail);

    const recipients = new Set<string>();

    const registeredStudents =
      await this.studentRepository.findByTeacherAndNotSuspended(
        teacher.teacherId,
      );

    registeredStudents.forEach((student) => recipients.add(student.email));

    if (mentionedEmails.length > 0) {
      const mentionedStudents =
        await this.studentRepository.findMentionedAndNotSuspended(
          mentionedEmails,
        );

      mentionedStudents.forEach((student) => recipients.add(student.email));
    }

    // Convert Set to Array and return
    return Array.from(recipients);
  }
}
