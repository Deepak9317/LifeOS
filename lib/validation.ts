import { z } from "zod";

const dueDateSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .nullable()
  .refine(
    (value) =>
      value === undefined ||
      value === null ||
      value === "" ||
      !Number.isNaN(new Date(value).getTime()),
    "Use a valid due date."
  );

export const authSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or less.")
});

const taskShape = {
  title: z.string().trim().min(1, "Task title is required.").max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  dueDate: dueDateSchema,
  priority: z.enum(["low", "medium", "high"]),
  completed: z.boolean().optional()
};

export const taskSchema = z.object({
  ...taskShape,
  priority: taskShape.priority.default("medium")
});

export const taskUpdateSchema = z.object(taskShape).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update."
);

const noteShape = {
  title: z.string().trim().max(120).optional().nullable(),
  content: z.string().trim().max(5000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(24)).max(10).optional()
};

export const noteSchema = z
  .object({
    ...noteShape,
    tags: noteShape.tags.default([])
  })
  .refine(
    (value) => Boolean(value.title?.trim() || value.content?.trim()),
    "A note needs a title or content."
  );

export const noteUpdateSchema = z.object(noteShape).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update."
);

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
