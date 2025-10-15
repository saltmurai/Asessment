import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { StudentRepository } from '../db/repositories/student.repository';
import { TeacherRepository } from '../db/repositories/teacher.repository';
import { TeachersService } from '../teachers/teachers.service';
import { Student } from '../db/models/student.entity';
import { extractMentionedEmails } from '../utils';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly teacherRepository: TeacherRepository,
    private readonly teachersService: TeachersService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

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
      const teacher = await this.teachersService.findOrCreateTeacher(
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

      // Check if any students are already registered
      const alreadyRegistered = students.filter((student) =>
        existingStudentIds.has(student.studentId),
      );

      if (alreadyRegistered.length > 0) {
        const alreadyRegisteredEmails = alreadyRegistered.map((s) => s.email);
        throw new BadRequestException(
          `Students already registered to this teacher: ${alreadyRegisteredEmails.join(', ')}`,
        );
      }

      // Add students to the relationship
      teacherEntity.students.push(...students);
      await teacherRepo.save(teacherEntity);
    });
  }

  async getCommonStudents(teacherEmails: string[]): Promise<string[]> {
    if (!teacherEmails || teacherEmails.length === 0) {
      throw new BadRequestException('At least one teacher email is required');
    }

    const teachers = await this.teacherRepository.findByEmails(teacherEmails);

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

    const teacher =
      await this.teachersService.findOrCreateTeacher(teacherEmail);

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

    return Array.from(recipients);
  }
}
