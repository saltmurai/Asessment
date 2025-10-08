import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teachers.service';
import { Teacher } from '../db/models/teacher.entity';
import { TeacherRepository } from '../db/repositories/teacher.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher])],
  providers: [TeachersService, TeacherRepository],
  exports: [TeachersService],
})
export class TeachersModule {}
