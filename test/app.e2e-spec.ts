/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { randEmail } from '@ngneat/falso';

describe('API E2E Tests', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Set up validation pipe to match the main application
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /register', () => {
    it('should register students to a teacher successfully', async () => {
      const teacherEmail = randEmail();
      const studentEmails = [randEmail(), randEmail()];

      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: studentEmails,
        })
        .expect(204);
    });

    it('should register a single student to a teacher', async () => {
      const teacherEmail = randEmail();
      const studentEmail = randEmail();

      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: [studentEmail],
        })
        .expect(204);
    });

    it('should handle registering the same student to multiple teachers', async () => {
      const teacher1Email = randEmail();
      const teacher2Email = randEmail();
      const studentEmail = randEmail();

      // Register student to first teacher
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacher1Email,
          students: [studentEmail],
        })
        .expect(204);

      // Register same student to second teacher
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacher2Email,
          students: [studentEmail],
        })
        .expect(204);
    });

    it('should return 400 for invalid teacher email', async () => {
      const studentEmail = randEmail();

      const response = await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: 'invalid-email',
          students: [studentEmail],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid student email', async () => {
      const teacherEmail = randEmail();

      const response = await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: ['invalid-email'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for empty students array', async () => {
      const teacherEmail = randEmail();

      const response = await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: [],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing teacher field', async () => {
      const studentEmail = randEmail();

      const response = await request(app.getHttpServer())
        .post('/register')
        .send({
          students: [studentEmail],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing students field', async () => {
      const teacherEmail = randEmail();

      const response = await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /commonstudents', () => {
    it('should return students for a single teacher', async () => {
      const teacherEmail = randEmail();
      const studentEmails = [randEmail(), randEmail(), randEmail()];

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: studentEmails,
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/commonstudents?teacher=${encodeURIComponent(teacherEmail)}`)
        .expect(200);

      expect(response.body).toHaveProperty('students');
      expect(response.body.students).toContain(studentEmails[0]);
      expect(response.body.students).toContain(studentEmails[1]);
      expect(response.body.students).toContain(studentEmails[2]);
      expect(response.body.students.length).toBeGreaterThanOrEqual(3);
    });

    it('should return common students for multiple teachers', async () => {
      const teacher1Email = randEmail();
      const teacher2Email = randEmail();
      const commonStudent1 = randEmail();
      const commonStudent2 = randEmail();
      const uniqueStudent1 = randEmail();
      const uniqueStudent2 = randEmail();

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacher1Email,
          students: [commonStudent1, commonStudent2, uniqueStudent1],
        })
        .expect(204);

      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacher2Email,
          students: [commonStudent1, commonStudent2, uniqueStudent2],
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(
          `/commonstudents?teacher=${encodeURIComponent(
            teacher1Email,
          )}&teacher=${encodeURIComponent(teacher2Email)}`,
        )
        .expect(200);

      expect(response.body).toHaveProperty('students');
      expect(response.body.students).toContain(commonStudent1);
      expect(response.body.students).toContain(commonStudent2);
      expect(response.body.students).not.toContain(uniqueStudent1);
      expect(response.body.students).not.toContain(uniqueStudent2);
    });

    it('should return empty array for non-existent teacher', async () => {
      const nonExistentTeacher = randEmail();

      const response = await request(app.getHttpServer())
        .get(
          `/commonstudents?teacher=${encodeURIComponent(nonExistentTeacher)}`,
        )
        .expect(200);

      expect(response.body).toHaveProperty('students');
      expect(response.body.students).toHaveLength(0);
    });

    it('should return 400 when no teacher parameter is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/commonstudents')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle multiple teachers with some non-existent ones', async () => {
      const existingTeacher = randEmail();
      const nonExistentTeacher = randEmail();
      const studentEmail = randEmail();

      // Register student to existing teacher
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: existingTeacher,
          students: [studentEmail],
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(
          `/commonstudents?teacher=${encodeURIComponent(
            existingTeacher,
          )}&teacher=${encodeURIComponent(nonExistentTeacher)}`,
        )
        .expect(200);

      expect(response.body).toHaveProperty('students');
      expect(response.body.students).toHaveLength(0); // No common students since one teacher doesn't exist
    });
  });

  describe('POST /suspend', () => {
    it('should suspend a student successfully', async () => {
      const teacherEmail = randEmail();
      const studentEmail = randEmail();

      // Register a student first
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: [studentEmail],
        })
        .expect(204);

      await request(app.getHttpServer())
        .post('/suspend')
        .send({
          student: studentEmail,
        })
        .expect(204);
    });

    it('should return 400 for invalid student email', async () => {
      const response = await request(app.getHttpServer())
        .post('/suspend')
        .send({
          student: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing student field', async () => {
      const response = await request(app.getHttpServer())
        .post('/suspend')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle suspending non-existent student', async () => {
      const nonExistentStudent = randEmail();

      const response = await request(app.getHttpServer())
        .post('/suspend')
        .send({
          student: nonExistentStudent,
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /retrievefornotifications', () => {
    it('should return recipients including mentioned students', async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: registeredStudents,
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacherEmail,
          notification: `Hello students! @${registeredStudents[1]} @${registeredStudents[2]}`,
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).toContain(registeredStudents[0]);
      expect(response.body.recipients).toContain(registeredStudents[1]);
      expect(response.body.recipients).toContain(registeredStudents[2]);
      expect(response.body.recipients.length).toBeGreaterThanOrEqual(3);
    });

    it('should return only registered students when no mentions', async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: registeredStudents,
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacherEmail,
          notification: 'Hey everybody',
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).toContain(registeredStudents[0]);
      expect(response.body.recipients).toContain(registeredStudents[1]);
      expect(response.body.recipients).toContain(registeredStudents[2]);
      expect(response.body.recipients.length).toBeGreaterThanOrEqual(3);
    });

    it('should include mentioned students not registered to teacher', async () => {
      const teacher1Email = randEmail();
      const teacher2Email = randEmail();
      const registeredStudent = randEmail();
      const mentionedStudent = randEmail();

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacher1Email,
          students: [registeredStudent],
        })
        .expect(204);

      // Register mentioned student to different teacher
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacher2Email,
          students: [mentionedStudent],
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacher1Email,
          notification: `Hello @${mentionedStudent}`,
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).toContain(registeredStudent);
      expect(response.body.recipients).toContain(mentionedStudent);
    });

    it('should exclude suspended students from notifications', async () => {
      const teacherEmail = randEmail();
      const student1 = randEmail();
      const student2 = randEmail();
      const student3 = randEmail();

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: [student1, student2, student3],
        })
        .expect(204);

      // Suspend a student
      await request(app.getHttpServer())
        .post('/suspend')
        .send({
          student: student1,
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacherEmail,
          notification: 'Hey everybody',
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).not.toContain(student1);
      expect(response.body.recipients).toContain(student2);
      expect(response.body.recipients).toContain(student3);
    });

    it('should exclude suspended students even when mentioned', async () => {
      const teacherEmail = randEmail();
      const student1 = randEmail();
      const student2 = randEmail();
      const student3 = randEmail();

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: [student1, student2, student3],
        })
        .expect(204);

      // Suspend a student
      await request(app.getHttpServer())
        .post('/suspend')
        .send({
          student: student1,
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacherEmail,
          notification: `Hello @${student1}`,
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).not.toContain(student1);
      expect(response.body.recipients).toContain(student2);
      expect(response.body.recipients).toContain(student3);
    });

    it('should handle notifications from teachers with no registered students', async () => {
      const newTeacherEmail = randEmail();

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: newTeacherEmail,
          notification: 'Hello everyone!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).toHaveLength(0);
    });

    it('should handle notifications with mentioned non-existent students', async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];
      const nonExistentStudent = randEmail();

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: registeredStudents,
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacherEmail,
          notification: `Hello @${nonExistentStudent}`,
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).toContain(registeredStudents[0]);
      expect(response.body.recipients).toContain(registeredStudents[1]);
      expect(response.body.recipients).toContain(registeredStudents[2]);
      expect(response.body.recipients).not.toContain(nonExistentStudent);
      expect(response.body.recipients.length).toBeGreaterThanOrEqual(3);
    });

    it('should return 400 for invalid teacher email', async () => {
      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: 'invalid-email',
          notification: 'Hello everyone!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing notification field', async () => {
      const teacherEmail = randEmail();

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacherEmail,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle complex notification with multiple mentions', async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];
      const mentionedStudent = randEmail();

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: registeredStudents,
        })
        .expect(204);

      // Register mentioned student to a different teacher
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: randEmail(),
          students: [mentionedStudent],
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacherEmail,
          notification: `Hey @${registeredStudents[1]} and @${mentionedStudent}, please check @${registeredStudents[2]}'s work!`,
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).toContain(registeredStudents[0]); // registered
      expect(response.body.recipients).toContain(registeredStudents[1]); // registered + mentioned
      expect(response.body.recipients).toContain(registeredStudents[2]); // registered + mentioned
      expect(response.body.recipients).toContain(mentionedStudent); // mentioned only
    });

    it('should not include duplicate recipients', async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];

      // Set up test data
      await request(app.getHttpServer())
        .post('/register')
        .send({
          teacher: teacherEmail,
          students: registeredStudents,
        })
        .expect(204);

      const response = await request(app.getHttpServer())
        .post('/retrievefornotifications')
        .send({
          teacher: teacherEmail,
          notification: `Hello @${registeredStudents[0]} @${registeredStudents[0]}`, // duplicate mention
        })
        .expect(200);

      expect(response.body).toHaveProperty('recipients');

      // Count occurrences of the duplicated student
      const duplicateCount = (response.body.recipients as string[]).filter(
        (email: string) => email === registeredStudents[0],
      ).length;
      expect(duplicateCount).toBe(1); // Should appear only once

      expect(response.body.recipients).toContain(registeredStudents[0]);
      expect(response.body.recipients).toContain(registeredStudents[1]);
      expect(response.body.recipients).toContain(registeredStudents[2]);
      expect(response.body.recipients.length).toBeGreaterThanOrEqual(3);
    });
  });
});
