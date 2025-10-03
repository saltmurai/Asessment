CREATE TABLE `students` (
	`student_id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`is_suspended` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_student_id` PRIMARY KEY(`student_id`),
	CONSTRAINT `students_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `teacher_students` (
	`teacher_id` int NOT NULL,
	`student_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `teacher_students_teacher_id_student_id_pk` PRIMARY KEY(`teacher_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`teacher_id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teachers_teacher_id` PRIMARY KEY(`teacher_id`),
	CONSTRAINT `teachers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `teacher_students` ADD CONSTRAINT `teacher_students_teacher_id_teachers_teacher_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`teacher_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_students` ADD CONSTRAINT `teacher_students_student_id_students_student_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE no action ON UPDATE no action;