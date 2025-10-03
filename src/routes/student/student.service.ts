import { eq, inArray, and, sql, or } from "drizzle-orm";
import { db } from "../../db/config.js";
import { teachers, students, teacherStudents } from "../../db/schema.js";
import { extractMentionedEmails } from "../../utils/index.js";

export async function findOrCreateTeacher(
  teacherEmail: string,
  tx?: any
): Promise<{ teacherId: number }> {
  if (!teacherEmail) {
    throw new Error("Teacher email is required");
  }

  const dbClient = tx || db;

  // Try to find existing teacher
  let teacher;
  const teacherRecord = await dbClient
    .select({ teacherId: teachers.teacherId })
    .from(teachers)
    .where(eq(teachers.email, teacherEmail));

  teacher = teacherRecord[0];

  if (!teacher) {
    // Create teacher if doesn't exist
    const [newTeacher] = await dbClient
      .insert(teachers)
      .values({ email: teacherEmail });
    teacher = { teacherId: newTeacher.insertId };
  }

  return teacher;
}

export async function registerStudents(
  teacherEmail: string,
  studentEmails: string[]
): Promise<void> {
  if (!teacherEmail) {
    throw new Error("Teacher email is required");
  }

  if (!studentEmails || studentEmails.length === 0) {
    throw new Error("At least one student email is required");
  }

  // Start a transaction to ensure data consistency
  await db.transaction(async (tx) => {
    // 1. Find or create the teacher
    const teacher = await findOrCreateTeacher(teacherEmail, tx);

    // 2. Find or create students
    const studentIds: number[] = [];

    for (const studentEmail of studentEmails) {
      let student = await tx
        .select({ studentId: students.studentId })
        .from(students)
        .where(eq(students.email, studentEmail))
        .then((result) => result[0]);

      if (!student) {
        // Create student if doesn't exist
        const [newStudent] = await tx
          .insert(students)
          .values({ email: studentEmail, isSuspended: 0 });
        student = { studentId: newStudent.insertId };
      }

      studentIds.push(student.studentId);
    }

    // 3. Create teacher-student relationships (ignore duplicates)
    const relationships = studentIds.map((studentId) => ({
      teacherId: teacher.teacherId,
      studentId: studentId,
    }));

    // Insert relationships, handling duplicates gracefully
    if (relationships.length > 0) {
      for (const relationship of relationships) {
        try {
          await tx.insert(teacherStudents).values(relationship);
        } catch (error) {
          // Ignore duplicate key errors (relationship already exists)
          if (!(error as any)?.message?.includes("Duplicate entry")) {
            throw error;
          }
        }
      }
    }
  });
}

export async function getCommonStudents(
  teacherEmails: string[]
): Promise<string[]> {
  console.log("Teacher Emails:", teacherEmails);
  if (!teacherEmails || teacherEmails.length === 0) {
    throw new Error("At least one teacher email is required");
  }

  // First, get the teacher IDs for the provided emails
  const teacherRecords = await db
    .select({
      teacherId: teachers.teacherId,
      email: teachers.email,
    })
    .from(teachers)
    .where(inArray(teachers.email, teacherEmails));

  // If any teacher doesn't exist, return empty array
  // because students must be registered to ALL teachers
  if (teacherRecords.length !== teacherEmails.length) {
    return [];
  }

  const teacherIds = teacherRecords.map((t) => t.teacherId);

  // For a single teacher, get all their students
  if (teacherIds.length === 1) {
    const result = await db
      .select({
        email: students.email,
      })
      .from(students)
      .innerJoin(
        teacherStudents,
        eq(students.studentId, teacherStudents.studentId)
      )
      .where(eq(teacherStudents.teacherId, teacherIds[0]));

    return result.map((s) => s.email);
  }

  // For multiple teachers, find students registered to ALL of them
  // This is a bit more complex - we need students that appear in ALL teacher-student relationships
  const studentCounts = await db
    .select({
      studentId: teacherStudents.studentId,
      email: students.email,
    })
    .from(teacherStudents)
    .innerJoin(students, eq(teacherStudents.studentId, students.studentId))
    .where(inArray(teacherStudents.teacherId, teacherIds))
    .groupBy(teacherStudents.studentId, students.email)
    .having(
      sql`COUNT(DISTINCT ${teacherStudents.teacherId}) = ${teacherIds.length}`
    );

  return studentCounts.map((s) => s.email);
}

export async function suspendStudent(studentEmail: string): Promise<void> {
  if (!studentEmail) {
    throw new Error("Student email is required");
  }

  // Find the student by email
  const student = await db
    .select({ studentId: students.studentId })
    .from(students)
    .where(eq(students.email, studentEmail))
    .then((result) => result[0]);

  if (!student) {
    throw new Error("Student not found");
  }

  // Update the student's suspended status
  await db
    .update(students)
    .set({ isSuspended: 1 })
    .where(eq(students.studentId, student.studentId));
}

export async function getNotificationRecipients(
  teacherEmail: string,
  notificationText: string
): Promise<string[]> {
  if (!teacherEmail) {
    throw new Error("Teacher email is required");
  }

  if (!notificationText) {
    throw new Error("Notification text is required");
  }

  // Extract mentioned emails from the notification
  const mentionedEmails = extractMentionedEmails(notificationText);

  // Find or create the teacher
  const teacher = await findOrCreateTeacher(teacherEmail);

  const recipients = new Set<string>();

  // Get students registered to this teacher (teacher now always exists)
  const registeredStudents = await db
    .select({ email: students.email })
    .from(students)
    .innerJoin(
      teacherStudents,
      eq(students.studentId, teacherStudents.studentId)
    )
    .where(
      and(
        eq(teacherStudents.teacherId, teacher.teacherId),
        eq(students.isSuspended, 0) // Not suspended
      )
    );

  registeredStudents.forEach((student) => recipients.add(student.email));

  // Get mentioned students (if they exist and are not suspended)
  if (mentionedEmails.length > 0) {
    const mentionedStudents = await db
      .select({ email: students.email })
      .from(students)
      .where(
        and(
          inArray(students.email, mentionedEmails),
          eq(students.isSuspended, 0) // Not suspended
        )
      );

    mentionedStudents.forEach((student) => recipients.add(student.email));
  }

  // Convert Set to Array and return
  return Array.from(recipients);
}
