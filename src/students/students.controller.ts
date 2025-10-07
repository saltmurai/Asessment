import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import {
  RegisterStudentsDto,
  SuspendStudentDto,
  RetrieveNotificationsDto,
  CommonStudentsQueryDto,
  StudentsResponseDto,
  RecipientsResponseDto,
} from './dto';

@Controller()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerStudents(
    @Body() registerDto: RegisterStudentsDto,
  ): Promise<void> {
    try {
      await this.studentsService.registerStudents(
        registerDto.teacher,
        registerDto.students,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to register students',
      });
    }
  }

  @Get('commonstudents')
  @HttpCode(HttpStatus.OK)
  async getCommonStudents(
    @Query() query: CommonStudentsQueryDto,
  ): Promise<StudentsResponseDto> {
    try {
      const students = await this.studentsService.getCommonStudents(
        query.teacher,
      );
      return { students };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to retrieve common students',
      });
    }
  }

  @Post('suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendStudent(@Body() suspendDto: SuspendStudentDto): Promise<void> {
    try {
      await this.studentsService.suspendStudent(suspendDto.student);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to suspend student',
      });
    }
  }

  @Post('retrievefornotifications')
  @HttpCode(HttpStatus.OK)
  async retrieveForNotifications(
    @Body() notificationDto: RetrieveNotificationsDto,
  ): Promise<RecipientsResponseDto> {
    try {
      const recipients = await this.studentsService.getNotificationRecipients(
        notificationDto.teacher,
        notificationDto.notification,
      );
      return { recipients };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to retrieve notification recipients',
      });
    }
  }
}
