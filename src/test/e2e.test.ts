import { describe, it, expect } from "vitest";
import app from "../index.js";
import { randEmail } from "@ngneat/falso";

describe("API E2E Tests", () => {
  describe("POST /api/register", () => {
    it("should register students to a teacher successfully", async () => {
      const teacherEmail = randEmail();
      const studentEmails = [randEmail(), randEmail()];

      const res = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: studentEmails,
        }),
      });

      expect(res.status).toBe(204);
    });

    it("should register a single student to a teacher", async () => {
      const teacherEmail = randEmail();
      const studentEmail = randEmail();

      const res = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: [studentEmail],
        }),
      });

      expect(res.status).toBe(204);
    });

    it("should handle registering the same student to multiple teachers", async () => {
      const teacher1Email = randEmail();
      const teacher2Email = randEmail();
      const studentEmail = randEmail();

      // Register student to first teacher
      const res1 = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacher1Email,
          students: [studentEmail],
        }),
      });

      expect(res1.status).toBe(204);

      // Register same student to second teacher
      const res2 = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacher2Email,
          students: [studentEmail],
        }),
      });

      expect(res2.status).toBe(204);
    });

    it("should return 400 for invalid teacher email", async () => {
      const studentEmail = randEmail();

      const res = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: "invalid-email",
          students: [studentEmail],
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should return 400 for invalid student email", async () => {
      const teacherEmail = randEmail();

      const res = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: ["invalid-email"],
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should return 400 for empty students array", async () => {
      const teacherEmail = randEmail();

      const res = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: [],
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should return 400 for missing teacher field", async () => {
      const studentEmail = randEmail();

      const res = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          students: [studentEmail],
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should return 400 for missing students field", async () => {
      const teacherEmail = randEmail();

      const res = await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });
  });

  describe("GET /api/commonstudents", () => {
    it("should return students for a single teacher", async () => {
      const teacherEmail = randEmail();
      const studentEmails = [randEmail(), randEmail(), randEmail()];

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: studentEmails,
        }),
      });

      const res = await app.request(
        `/api/commonstudents?teacher=${encodeURIComponent(teacherEmail)}`
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("students");
      expect(body.students).toContain(studentEmails[0]);
      expect(body.students).toContain(studentEmails[1]);
      expect(body.students).toContain(studentEmails[2]);
      expect(body.students.length).toBeGreaterThanOrEqual(3);
    });

    it("should return common students for multiple teachers", async () => {
      const teacher1Email = randEmail();
      const teacher2Email = randEmail();
      const commonStudent1 = randEmail();
      const commonStudent2 = randEmail();
      const uniqueStudent1 = randEmail();
      const uniqueStudent2 = randEmail();

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacher1Email,
          students: [commonStudent1, commonStudent2, uniqueStudent1],
        }),
      });

      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacher2Email,
          students: [commonStudent1, commonStudent2, uniqueStudent2],
        }),
      });

      const res = await app.request(
        `/api/commonstudents?teacher=${encodeURIComponent(
          teacher1Email
        )}&teacher=${encodeURIComponent(teacher2Email)}`
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("students");
      expect(body.students).toContain(commonStudent1);
      expect(body.students).toContain(commonStudent2);
      expect(body.students).not.toContain(uniqueStudent1);
      expect(body.students).not.toContain(uniqueStudent2);
    });

    it("should return empty array for non-existent teacher", async () => {
      const nonExistentTeacher = randEmail();

      const res = await app.request(
        `/api/commonstudents?teacher=${encodeURIComponent(nonExistentTeacher)}`
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("students");
      expect(body.students).toHaveLength(0);
    });

    it("should return 400 when no teacher parameter is provided", async () => {
      const res = await app.request("/api/commonstudents");

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should handle multiple teachers with some non-existent ones", async () => {
      const existingTeacher = randEmail();
      const nonExistentTeacher = randEmail();
      const studentEmail = randEmail();

      // Register student to existing teacher
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: existingTeacher,
          students: [studentEmail],
        }),
      });

      const res = await app.request(
        `/api/commonstudents?teacher=${encodeURIComponent(
          existingTeacher
        )}&teacher=${encodeURIComponent(nonExistentTeacher)}`
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("students");
      expect(body.students).toHaveLength(0); // No common students since one teacher doesn't exist
    });
  });

  describe("POST /api/suspend", () => {
    it("should suspend a student successfully", async () => {
      const teacherEmail = randEmail();
      const studentEmail = randEmail();

      // Register a student first
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: [studentEmail],
        }),
      });

      const res = await app.request("/api/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: studentEmail,
        }),
      });

      expect(res.status).toBe(204);
    });

    it("should return 400 for invalid student email", async () => {
      const res = await app.request("/api/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: "invalid-email",
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should return 400 for missing student field", async () => {
      const res = await app.request("/api/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should handle suspending non-existent student", async () => {
      const nonExistentStudent = randEmail();

      const res = await app.request("/api/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: nonExistentStudent,
        }),
      });

      expect(res.status).toBe(500); // Service throws error for non-existent student
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });
  });

  describe("POST /api/retrievefornotifications", () => {
    it("should return recipients including mentioned students", async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: registeredStudents,
        }),
      });

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          notification: `Hello students! @${registeredStudents[1]} @${registeredStudents[2]}`,
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");
      expect(body.recipients).toContain(registeredStudents[0]);
      expect(body.recipients).toContain(registeredStudents[1]);
      expect(body.recipients).toContain(registeredStudents[2]);
      expect(body.recipients.length).toBeGreaterThanOrEqual(3);
    });

    it("should return only registered students when no mentions", async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: registeredStudents,
        }),
      });

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          notification: "Hey everybody",
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");
      expect(body.recipients).toContain(registeredStudents[0]);
      expect(body.recipients).toContain(registeredStudents[1]);
      expect(body.recipients).toContain(registeredStudents[2]);
      expect(body.recipients.length).toBeGreaterThanOrEqual(3);
    });

    it("should include mentioned students not registered to teacher", async () => {
      const teacher1Email = randEmail();
      const teacher2Email = randEmail();
      const registeredStudent = randEmail();
      const mentionedStudent = randEmail();

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacher1Email,
          students: [registeredStudent],
        }),
      });

      // Register mentioned student to different teacher
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacher2Email,
          students: [mentionedStudent],
        }),
      });

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacher1Email,
          notification: `Hello @${mentionedStudent}`,
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");
      expect(body.recipients).toContain(registeredStudent);
      expect(body.recipients).toContain(mentionedStudent);
    });

    it("should exclude suspended students from notifications", async () => {
      const teacherEmail = randEmail();
      const student1 = randEmail();
      const student2 = randEmail();
      const student3 = randEmail();

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: [student1, student2, student3],
        }),
      });

      // Suspend a student
      await app.request("/api/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: student1,
        }),
      });

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          notification: "Hey everybody",
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");
      expect(body.recipients).not.toContain(student1);
      expect(body.recipients).toContain(student2);
      expect(body.recipients).toContain(student3);
    });

    it("should exclude suspended students even when mentioned", async () => {
      const teacherEmail = randEmail();
      const student1 = randEmail();
      const student2 = randEmail();
      const student3 = randEmail();

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: [student1, student2, student3],
        }),
      });

      // Suspend a student
      await app.request("/api/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: student1,
        }),
      });

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          notification: `Hello @${student1}`,
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");
      expect(body.recipients).not.toContain(student1);
      expect(body.recipients).toContain(student2);
      expect(body.recipients).toContain(student3);
    });

    it("should handle notifications from teachers with no registered students", async () => {
      const newTeacherEmail = randEmail();

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: newTeacherEmail,
          notification: "Hello everyone!",
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");
      expect(body.recipients).toHaveLength(0);
    });

    it("should handle notifications with mentioned non-existent students", async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];
      const nonExistentStudent = randEmail();

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: registeredStudents,
        }),
      });

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          notification: `Hello @${nonExistentStudent}`,
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");
      expect(body.recipients).toContain(registeredStudents[0]);
      expect(body.recipients).toContain(registeredStudents[1]);
      expect(body.recipients).toContain(registeredStudents[2]);
      expect(body.recipients).not.toContain(nonExistentStudent);
      expect(body.recipients.length).toBeGreaterThanOrEqual(3);
    });

    it("should return 400 for invalid teacher email", async () => {
      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: "invalid-email",
          notification: "Hello everyone!",
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should return 400 for missing notification field", async () => {
      const teacherEmail = randEmail();

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should return 400 for empty notification text", async () => {
      const teacherEmail = randEmail();

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          notification: "",
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    it("should handle complex notification with multiple mentions", async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];
      const mentionedStudent = randEmail();

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: registeredStudents,
        }),
      });

      // Register mentioned student to a different teacher
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: randEmail(),
          students: [mentionedStudent],
        }),
      });

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          notification: `Hey @${registeredStudents[1]} and @${mentionedStudent}, please check @${registeredStudents[2]}'s work!`,
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");
      expect(body.recipients).toContain(registeredStudents[0]); // registered
      expect(body.recipients).toContain(registeredStudents[1]); // registered + mentioned
      expect(body.recipients).toContain(registeredStudents[2]); // registered + mentioned
      expect(body.recipients).toContain(mentionedStudent); // mentioned only
    });

    it("should not include duplicate recipients", async () => {
      const teacherEmail = randEmail();
      const registeredStudents = [randEmail(), randEmail(), randEmail()];

      // Set up test data
      await app.request("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          students: registeredStudents,
        }),
      });

      const res = await app.request("/api/retrievefornotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacherEmail,
          notification: `Hello @${registeredStudents[0]} @${registeredStudents[0]}`, // duplicate mention
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("recipients");

      // Count occurrences of the duplicated student
      const duplicateCount = body.recipients.filter(
        (email: string) => email === registeredStudents[0]
      ).length;
      expect(duplicateCount).toBe(1); // Should appear only once

      expect(body.recipients).toContain(registeredStudents[0]);
      expect(body.recipients).toContain(registeredStudents[1]);
      expect(body.recipients).toContain(registeredStudents[2]);
      expect(body.recipients.length).toBeGreaterThanOrEqual(3);
    });
  });
});
