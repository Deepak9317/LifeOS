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

export const signupSchema = authSchema.extend({
  name: z.string().trim().min(2, "Enter your full name.").max(80, "Use 80 characters or less.")
});

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name.").max(80, "Use 80 characters or less."),
  timezone: z.string().trim().min(2).max(80).optional().nullable(),
  country_code: z.string().trim().min(2).max(8).optional().nullable(),
  hidden_clock_pages: z.array(z.string().trim().min(1).max(40)).max(20).optional()
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Enter your current password."),
    newPassword: z.string().min(8, "Password must be at least 8 characters.").max(72),
    confirmPassword: z.string().min(8, "Confirm your new password.")
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const passwordResetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters.").max(72),
    confirmPassword: z.string().min(8, "Confirm your new password.")
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
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

const budgetAmountSchema = z.coerce
  .number({ message: "Enter a valid amount." })
  .positive("Amount must be greater than zero.")
  .max(1000000000, "Amount is too large.");

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

const budgetEntryShape = {
  title: z.string().trim().min(1, "Entry title is required.").max(120),
  amount: budgetAmountSchema,
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1, "Category is required.").max(40),
  entryDate: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) =>
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isNaN(new Date(value).getTime()),
      "Use a valid date."
    )
};

export const budgetEntrySchema = z.object({
  ...budgetEntryShape
});

export const budgetEntryUpdateSchema = z.object(budgetEntryShape).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update."
);

export const budgetSettingsSchema = z.object({
  monthlyBudget: z.coerce
    .number({ message: "Enter a valid monthly budget." })
    .min(0, "Monthly budget cannot be negative.")
    .max(1000000000, "Monthly budget is too large."),
  currencyCode: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code.")
    .transform((value) => value.toUpperCase())
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type BudgetEntryInput = z.infer<typeof budgetEntrySchema>;
export type BudgetEntryUpdateInput = z.infer<typeof budgetEntryUpdateSchema>;
export type BudgetSettingsInput = z.infer<typeof budgetSettingsSchema>;
