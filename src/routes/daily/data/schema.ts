import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
  status: z.enum(["draft", "progress", "done", "cancel"]),
  label: z.enum(["bug", "feature", "documentation", "enhancement"]),
  priority: z.enum(["high", "medium", "low"]),
  created_at: z.string(),
  updatedAt: z.string().nullable(),
  start_at: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export type Task = z.infer<typeof taskSchema>;
