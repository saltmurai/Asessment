import {
  IsEmail,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterStudentsDto {
  @IsEmail({}, { message: 'Teacher must be a valid email address' })
  @IsNotEmpty({ message: 'Teacher email is required' })
  teacher: string;

  @IsArray({ message: 'Students must be an array' })
  @ArrayMinSize(1, { message: 'At least one student email is required' })
  @IsEmail(
    {},
    { each: true, message: 'Each student must be a valid email address' },
  )
  students: string[];
}

export class SuspendStudentDto {
  @IsEmail({}, { message: 'Student must be a valid email address' })
  @IsNotEmpty({ message: 'Student email is required' })
  student: string;
}

export class RetrieveNotificationsDto {
  @IsEmail({}, { message: 'Teacher must be a valid email address' })
  @IsNotEmpty({ message: 'Teacher email is required' })
  teacher: string;

  @IsString({ message: 'Notification must be a string' })
  @IsNotEmpty({ message: 'Notification text is required' })
  notification: string;
}

export class CommonStudentsQueryDto {
  @Transform(({ value }) => {
    const teachers = Array.isArray(value) ? value : [value];
    // Remove duplicates
    return [...new Set(teachers)] as string[];
  })
  @IsArray({ message: 'Teacher parameter must be an array of email addresses' })
  @ArrayMinSize(1, { message: 'At least one teacher email is required' })
  @IsEmail(
    {},
    { each: true, message: 'Each teacher must be a valid email address' },
  )
  teacher: string[];
}

// Response DTOs
export class StudentsResponseDto {
  students: string[];
}

export class RecipientsResponseDto {
  recipients: string[];
}

export class ErrorResponseDto {
  message: string;
}
