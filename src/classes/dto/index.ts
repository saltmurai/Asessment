import { IsNotEmpty, IsNumber } from 'class-validator';

export class RegisterSubjectDto {
  @IsNumber({}, { message: 'Class ID must be a number' })
  @IsNotEmpty({ message: 'Class ID is required' })
  classId: number;

  @IsNumber({}, { message: 'Subject ID must be a number' })
  @IsNotEmpty({ message: 'Subject ID is required' })
  subjectId: number;
}

export class RegisterStudentDto {
  @IsNumber({}, { message: 'Class ID must be a number' })
  @IsNotEmpty({ message: 'Class ID is required' })
  classId: number;

  @IsNumber({}, { message: 'Student ID must be a number' })
  @IsNotEmpty({ message: 'Student ID is required' })
  studentId: number;
}
