import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassStudent } from 'src/db/models/class-student.entity';
import { ClassSubject } from 'src/db/models/class-subject.entity';
import { Class } from 'src/db/models/class.entity';
import { Subject } from 'src/db/models/subject.entity';
import { Student } from 'src/db/models/student.entity';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      ClassSubject,
      ClassStudent,
      Subject,
      Student,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService, ConfigService],
})
export class ClassesModule {}
