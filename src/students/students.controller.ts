import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
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
    await this.studentsService.registerStudents(
      registerDto.teacher,
      registerDto.students,
    );
  }

  @Get('commonstudents')
  @HttpCode(HttpStatus.OK)
  async getCommonStudents(
    @Query() query: CommonStudentsQueryDto,
  ): Promise<StudentsResponseDto> {
    const students = await this.studentsService.getCommonStudents(
      query.teacher,
    );
    return { students };
  }

  @Post('suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendStudent(@Body() suspendDto: SuspendStudentDto): Promise<void> {
    await this.studentsService.suspendStudent(suspendDto.student);
  }

  @Post('retrievefornotifications')
  @HttpCode(HttpStatus.OK)
  async retrieveForNotifications(
    @Body() notificationDto: RetrieveNotificationsDto,
  ): Promise<RecipientsResponseDto> {
    const recipients = await this.studentsService.getNotificationRecipients(
      notificationDto.teacher,
      notificationDto.notification,
    );
    return { recipients };
  }
}
