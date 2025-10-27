import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Class } from 'src/db/models/class.entity';
import { Subject } from 'src/db/models/subject.entity';
import { ClassSubject } from 'src/db/models/class-subject.entity';
import { ClassStudent } from 'src/db/models/class-student.entity';
import { Student } from 'src/db/models/student.entity';
import { RegisterSubjectDto, RegisterStudentDto } from './dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(ClassSubject)
    private classSubjectRepository: Repository<ClassSubject>,
    @InjectRepository(ClassStudent)
    private classStudentRepository: Repository<ClassStudent>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private configService: ConfigService,
  ) {}

  async registerSubject(
    registerSubjectDto: RegisterSubjectDto,
  ): Promise<ClassSubject> {
    const { classId, subjectId } = registerSubjectDto;

    // Check if class exists
    const classEntity = await this.classRepository.findOne({
      where: { classId },
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Check if subject exists
    const subjectEntity = await this.subjectRepository.findOne({
      where: { subjectId },
    });
    if (!subjectEntity) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    // Check if this class-subject combination already exists
    const existingClassSubject = await this.classSubjectRepository.findOne({
      where: { classId, subjectId },
    });
    if (existingClassSubject) {
      throw new BadRequestException(
        `Subject ${subjectEntity.subjectName} is already registered for class ${classEntity.className}`,
      );
    }

    // Create new class-subject relationship
    const classSubject = this.classSubjectRepository.create({
      classId,
      subjectId,
    });

    return await this.classSubjectRepository.save(classSubject);
  }

  async registerStudent(
    registerStudentDto: RegisterStudentDto,
  ): Promise<ClassStudent> {
    const { classId, studentId } = registerStudentDto;

    // Check if class exists
    const classEntity = await this.classRepository.findOne({
      where: { classId },
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Check if student exists
    const studentEntity = await this.studentRepository.findOne({
      where: { studentId },
    });
    if (!studentEntity) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Check if this class-student combination already exists
    const existingClassStudent = await this.classStudentRepository.findOne({
      where: { classId, studentId },
    });
    if (existingClassStudent) {
      throw new BadRequestException(
        `Student with ID ${studentId} is already registered for class ${classEntity.className}`,
      );
    }

    // Check maximum student limit
    const maxStudentsPerClass = this.configService.get<number>(
      'MAX_STUDENTS_PER_CLASS',
      30, // default value
    );

    const currentStudentCount = await this.classStudentRepository.count({
      where: { classId },
    });

    if (currentStudentCount >= maxStudentsPerClass) {
      throw new BadRequestException(
        `Class ${classEntity.className} has reached the maximum student limit of ${maxStudentsPerClass}`,
      );
    }

    // Create new class-student relationship
    const classStudent = this.classStudentRepository.create({
      classId,
      studentId,
    });

    return await this.classStudentRepository.save(classStudent);
  }
}
