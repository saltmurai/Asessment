import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TeacherRepository } from '../db/repositories/teacher.repository';

@Injectable()
export class TeachersService {
  constructor(private readonly teacherRepository: TeacherRepository) {}

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
}
