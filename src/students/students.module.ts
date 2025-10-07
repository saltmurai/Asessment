import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from '../db/models/student.entity';
import { Teacher } from '../db/models/teacher.entity';
import { StudentRepository } from '../db/repositories/student.repository';
import { TeacherRepository } from '../db/repositories/teacher.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Teacher])],
  controllers: [StudentsController],
  providers: [StudentsService, StudentRepository, TeacherRepository],
  exports: [StudentsService, StudentRepository, TeacherRepository],
})
export class StudentsModule {}
