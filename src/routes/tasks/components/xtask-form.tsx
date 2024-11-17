import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import {
  useActionData,
  useLoaderData,
  Form,
  useNavigate,
} from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";

// Helper function to generate unique task ID
let taskIdCounter = 1;
const generateTaskId = () => `TASK-${String(taskIdCounter++).padStart(4, "0")}`;

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["draft", "progress", "done", "cancel"]).default("draft"),
  label: z
    .enum(["bug", "feature", "documentation", "enhancement"])
    .default("feature"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  createdAt: z.string().default(() => new Date().toISOString()), // Default current date
  updatedAt: z.string().default(() => new Date().toISOString()), // Default current date
  completedAt: z.string().nullable().default(null), // Nullable, set when task is completed
});

// Function to create a new task with default values
const createTask = (taskData: Partial<z.infer<typeof taskSchema>>) => {
  return taskSchema.safeParse(taskData);
};
type TaskFormProps = {
  children: ReactNode;
  task?: z.infer<typeof taskSchema>; // Optional task prop for editing
};

const TaskForm: React.FC<TaskFormProps> = ({ children }) => {
  const task = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => {
    if (actionData?.success) {
      setOpen(false);
    }
  }, [actionData]);

  return (
    <Dialog open={true} onOpenChange={() => navigate(-1)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{task ? "Edit" : "Create"} an task</DialogTitle>
          <DialogDescription>
            Enter your data below to {task ? "edit" : "create"} your task
          </DialogDescription>
        </DialogHeader>
        <Form method="POST" action="/tasks">
          {task && <Input defaultValue={task?.id} name="id" type="hidden" />}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                defaultValue={task?.title}
                id="title"
                name="title"
                type="text"
                placeholder="Title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                defaultValue={task?.notes}
                name="notes"
                id="notes"
                placeholder="Notes"
              />
            </div>

            {/* Status Select */}
            {/*<div className="grid gap-2">
							<Label className="block">Label</Label>
							<Select defaultValue={task?.status} name="status">
								<SelectTrigger>
									<SelectValue placeholder="Select Status" />
								</SelectTrigger>
								<SelectContent>
									{["draft", "progress", "done", "cancel"].map((label) => (
										<SelectItem
											key={label}
											value={label}
											className="capitalize"
										>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>*/}

            {/* Label Select */}
            <div className="grid gap-2">
              <Label className="block">Label</Label>
              <Select defaultValue={task?.label} name="label">
                <SelectTrigger>
                  <SelectValue placeholder="Select Label" />
                </SelectTrigger>
                <SelectContent>
                  {["bug", "feature", "documentation", "enhancement"].map(
                    (label) => (
                      <SelectItem
                        key={label}
                        value={label}
                        className="capitalize"
                      >
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Select */}
            <div className="grid gap-2">
              <Label className="block">Priority</Label>
              <Select defaultValue={task?.priority} name="priority">
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high"].map((label) => (
                    <SelectItem
                      key={label}
                      value={label}
                      className="capitalize"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button
              name="intent"
              value={task ? "update-task" : "add-task"}
              type="submit"
              className="w-full"
            >
              {task ? "Save" : "Create"} task
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
