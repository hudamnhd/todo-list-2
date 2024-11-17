import { Field, FieldError } from "@/components/conform/field";
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { InputConform } from "@/components/conform/input";
import { RadioGroupConform } from "@/components/conform/radio-group";
import { SelectConform } from "@/components/conform/select";
import { TextareaConform } from "@/components/conform/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  useActionData,
  useLoaderData,
  Form,
  useNavigate,
  useNavigation,
} from "react-router-dom";

const TaskSchema = z.object({
  id: z.string(),
  title: z
    .string({ required_error: "Title is required" })
    .min(5, { message: "Title must be at least 5 characters long" }),
  notes: z
    .string({ required_error: "Notes is required" })
    .min(10, "Notes must be at least 10 characters"),
  label: z.enum(["bug", "feature", "documentation", "enhancement"], {
    required_error: "You must select an label type",
  }),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "You must select an priority type",
  }),
  createdAt: z
    .string()
    .optional()
    .default(() => new Date().toISOString()), // Default current date
  updatedAt: z.string().default(() => new Date().toISOString()), // Default current date
  completedAt: z.string().nullable().default(null), // Nullable, set when task is completed
});

type TaskFormProps = {
  children: ReactNode;
  task?: z.infer<typeof TaskSchema>; // Optional task prop for editing
};

const TaskForm: React.FC<TaskFormProps> = ({ children }) => {
  const task = useLoaderData();
  const initialValue = task
    ? {
        id: task.id,
        title: task.title,
        notes: task.notes,
        status: task.status,
        label: task.label,
        priority: task.priority,
      }
    : null;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isPending = navigation.state !== "idle";
  const [form, fields] = useForm({
    id: "create-task",
    defaultValue: initialValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: TaskSchema });
    },
    shouldRevalidate: "onSubmit",
  });

  return (
    <Dialog open={true} onOpenChange={() => navigate(-1)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            {task ? "Edit" : "Create"} an {task ? "TASK-" + task.id : "task"}
          </DialogTitle>
          <DialogDescription>
            Enter your data below to {task ? "edit" : "create"} your task
          </DialogDescription>
        </DialogHeader>
        <Form id={form.id} method="POST" action="/tasks">
          {task && <InputConform meta={fields.id} type="hidden" />}
          {task && <InputConform meta={fields.status} type="hidden" />}
          <div className="grid gap-4">
            <Field>
              <Label htmlFor={fields.title.id}>Title</Label>
              <InputConform
                placeholder="Title"
                meta={fields.title}
                type="text"
              />
              {fields.title.errors && (
                <FieldError>{fields.title.errors}</FieldError>
              )}
            </Field>
            <Field>
              <Label htmlFor={fields.notes.id}>Notes</Label>
              <TextareaConform placeholder="Notes" meta={fields.notes} />
              {fields.notes.errors && (
                <FieldError>{fields.notes.errors}</FieldError>
              )}
            </Field>
            <Field>
              <Label htmlFor={fields.label.id}>Label</Label>
              <RadioGroupConform
                meta={fields.label}
                items={[
                  { value: "bug", label: "Bug" },
                  { value: "feature", label: "Feature" },
                  { value: "documentation", label: "Documentation" },
                  { value: "enhancement", label: "Enhancement" },
                ]}
              />
              {fields.label.errors && (
                <FieldError>{fields.label.errors}</FieldError>
              )}
            </Field>
            <Field>
              <Label htmlFor={fields.priority.id}>Priority</Label>
              <SelectConform
                placeholder="Select a priority"
                meta={fields.priority}
                items={[
                  { value: "low", name: "Low" },
                  { value: "medium", name: "Medium" },
                  { value: "high", name: "High" },
                ]}
              />
              {fields.priority.errors && (
                <FieldError>{fields.priority.errors}</FieldError>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                name="intent"
                value={task ? "update-task" : "add-task"}
                type="submit"
                disabled={isPending}
              >
                {isPending && <Spinner className="h-5 w-5 text-white mr-1.5" />}{" "}
                {task ? "Save" : "Create"} task
              </Button>
              <Button type="reset" variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
