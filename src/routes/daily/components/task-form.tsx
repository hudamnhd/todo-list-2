import { Field, FieldError } from "@/components/conform/field";
import { CheckboxConform } from "@/components/conform/checkbox";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  PlusIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";

import { useSearchParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm, useField } from "@conform-to/react";
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
  useSubmit,
  useLoaderData,
  Form,
  useNavigate,
  useNavigation,
} from "react-router-dom";

const TaskSchema = z.object({
  id: z.string().optional(),
  intent: z.string(),
  status: z.string().optional(),
  title: z
    .string({ required_error: "Title is required" })
    .min(5, { message: "Title must be at least 5 characters long" }),
  category: z
    .string({ required_error: "category is required" })
    .min(3, { message: "category must be at least 3 characters long" }),
  start_at: z.string().nullable().default(null), // Nullable, set when task is completed
  end_at: z.string().nullable().default(null), // Nullable, set when task is completed
  pausedTimes: z.array(z.string()),
  total_time: z.number().optional(),
  sub_tasks: z
    .array(
      z.object({
        id: z.string(),
        checked: z
          .string()
          .transform((value) => (value === "on" ? true : false)),
        title: z
          .string({ required_error: "Title is required" })
          .min(5, { message: "Title must be at least 5 characters long" }),
      }),
    )
    .optional(),
});

type TaskFormProps = {
  children: ReactNode;
  task?: z.infer<typeof TaskSchema>; // Optional task prop for editing
};

const TaskForm: React.FC<TaskFormProps> = ({ children }) => {
  const task = useLoaderData();
  let [searchParams, setSearchParams] = useSearchParams();

  const day = searchParams.get("day");

  const transformedSubTasks =
    task?.sub_tasks?.length > 0
      ? task.sub_tasks.map((subTask) => ({
          ...subTask,
          checked: subTask.checked ? "on" : "off", // Transformasi boolean ke "on"/"off"
        }))
      : [];
  const initialValue = task
    ? {
        id: task.id,
        title: task.title,
        status: task.status,
        category: task.category,
        sub_tasks: transformedSubTasks,
        start_at: task.start_at,
        total_time: task.total_time,
        pausedTimes: task.pausedTimes,
      }
    : {
        title: "Main Todo",
        status: "draft",
        category: "work",
        sub_tasks: [],
        start_at: null,
        total_time: 0,
        pausedTimes: [],
      };
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isPending = navigation.state !== "idle";
  const [form, fields] = useForm({
    id: "create-task",
    defaultValue: initialValue,
    onValidate({ formData }) {
      console.warn("XX", parseWithZod(formData, { schema: TaskSchema }));
      return parseWithZod(formData, { schema: TaskSchema });
    },
    shouldRevalidate: "onSubmit",

    onSubmit(event) {
      event.preventDefault(); // Mencegah submit default
      const formData = new FormData(event.currentTarget); // Ambil form data manual
      submit(formData, {
        method: "POST",
        action: `/daily?day=${day}`,
      });
    },
  });

  const sub_tasks = fields.sub_tasks.getFieldList();

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
        <Form
          id={form.id}
          method="POST"
          action="/daily"
          onSubmit={form.onSubmit}
        >
          {task && <InputConform meta={fields.id} type="hidden" />}
          {task && <InputConform meta={fields.status} type="hidden" />}
          <InputConform
            meta={fields.intent}
            type="hidden"
            defaultValue={task ? "update-task" : "add-task"}
          />
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
              <Label htmlFor={fields.category.id}>Category</Label>
              <InputConform
                placeholder="Category"
                meta={fields.category}
                type="text"
              />
              {fields.category.errors && (
                <FieldError>{fields.category.errors}</FieldError>
              )}
            </Field>
            <Field>
              <Label htmlFor={fields.sub_tasks.id}>Subtask</Label>
              <ul>
                {sub_tasks.map((todo, index) => {
                  const todoFields = todo.getFieldset();
                  return (
                    <li key={todo.key}>
                      <div
                        style={{ animationDelay: `${index * 0.07}s` }}
                        className="animate-roll-reveal [animation-fill-mode:backwards] flex items-center gap-x-1.5 mb-2"
                      >
                        <CheckboxConform
                          meta={todoFields.checked}
                          defaultChecked={
                            todoFields.checked.initialValue === "on"
                          }
                          defaultValue={
                            todoFields.checked.initialValue ?? "off"
                          }
                        />

                        <InputConform
                          placeholder="Sub Title"
                          meta={todoFields.title}
                          type="text"
                        />
                        <InputConform meta={todoFields.id} type="hidden" />

                        <Button
                          size="icon"
                          {...form.reorder.getButtonProps({
                            name: fields.sub_tasks.name,
                            from: index,
                            to: 0,
                          })}
                        >
                          <ArrowUpIcon />
                        </Button>
                        <Button
                          size="icon"
                          {...form.remove.getButtonProps({
                            name: fields.sub_tasks.name,
                            index,
                          })}
                        >
                          <Cross1Icon />
                        </Button>
                      </div>
                      {todoFields.title.errors && (
                        <FieldError>{todoFields.title.errors}</FieldError>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Field>

            <Button
              size="icon"
              {...form.insert.getButtonProps({
                name: fields.sub_tasks.name,
                defaultValue: {
                  id: Date.now().toString(), // Default ID unik
                  title: "Default Title",
                  checked: "off",
                },
              })}
            >
              <PlusIcon />
            </Button>
            <div className="grid mt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner className="h-5 w-5 text-white mr-1.5" />}{" "}
                {task ? "Save" : "Create"} task
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
