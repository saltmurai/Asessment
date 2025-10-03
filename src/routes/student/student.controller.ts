import { Hono } from "hono";
import {
  getCommonStudents,
  registerStudents,
  suspendStudent,
  getNotificationRecipients,
} from "./student.service.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

const commonStudentsQuerySchema = z.object({
  teacher: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .refine((teachers) => teachers.length > 0, {
      message: "At least one teacher parameter is required",
    }),
});

const registerStudentsBodySchema = z.object({
  teacher: z
    .email("Invalid teacher email format")
    .min(1, "Teacher email is required"),
  students: z
    .array(z.email("Invalid student email format"))
    .min(1, "At least one student email is required")
    .max(100, "Cannot register more than 100 students at once"), // limit for practicality
});

const suspendStudentBodySchema = z.object({
  student: z
    .string()
    .email("Invalid student email format")
    .min(1, "Student email is required"),
});

const retrieveForNotificationsBodySchema = z.object({
  teacher: z
    .string()
    .email("Invalid teacher email format")
    .min(1, "Teacher email is required"),
  notification: z.string().min(1, "Notification text is required"),
});

app.get(
  "/commonstudents",
  zValidator("query", commonStudentsQuerySchema),
  async (c) => {
    const { teacher: teacherParams } = c.req.valid("query");

    const students = await getCommonStudents(teacherParams);

    return c.json(
      {
        students: students,
      },
      200
    );
  }
);

app.post(
  "/register",
  zValidator("json", registerStudentsBodySchema),
  async (c) => {
    const { teacher, students } = c.req.valid("json");
    await registerStudents(teacher, students);
    return c.newResponse(null, 204);
  }
);

app.post(
  "/suspend",
  zValidator("json", suspendStudentBodySchema),
  async (c) => {
    const { student } = c.req.valid("json");
    await suspendStudent(student);
    return c.newResponse(null, 204);
  }
);

app.post(
  "/retrievefornotifications",
  zValidator("json", retrieveForNotificationsBodySchema),
  async (c) => {
    const { teacher, notification } = c.req.valid("json");
    const recipients = await getNotificationRecipients(teacher, notification);

    return c.json(
      {
        recipients: recipients,
      },
      200
    );
  }
);

export { app };
