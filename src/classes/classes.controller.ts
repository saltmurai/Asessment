import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { RegisterSubjectDto, RegisterStudentDto } from './dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('registerSubject')
  @HttpCode(HttpStatus.CREATED)
  async registerSubject(@Body() registerSubjectDto: RegisterSubjectDto) {
    const result =
      await this.classesService.registerSubject(registerSubjectDto);
    return {
      message: 'Subject registered to class successfully',
      data: result,
    };
  }

  @Post('registerStudent')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
    const result =
      await this.classesService.registerStudent(registerStudentDto);
    return {
      message: 'Student registered to class successfully',
      data: result,
    };
  }
}
