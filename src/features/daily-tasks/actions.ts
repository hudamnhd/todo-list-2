// actions.ts

import { z } from "zod";
const EmptyString = z
  .string()
  .optional()
  .transform((value) => value ?? "");

const SubTaskSchema = z.object({
  id: z.coerce.number(),
  checked: z
    .string()
    .default("off")
    .transform((value) => (value === "on" ? true : false)),
  title: EmptyString,
  category: z.object({ label: EmptyString, color: EmptyString }),
});

const TaskSchema = z.object({
  id: z.number(),
  status: z
    .enum(["draft", "paused", "progress", "done", "cancel"])
    .default("draft"),
  title: EmptyString,
  category: z.object({ label: EmptyString, color: EmptyString }),
  start_at: z.string().nullable().default(null), // Nullable, set when task is completed
  total_time: z.number().default(0),
  target_sessions: z.number().default(0),
  completed_sessions: z.number().default(0),
  end_at: z.string().nullable().default(null), // Nullable, set when task is completed
  updated_at: z.string().nullable().default(null), // Nullable, set when task is completed
  created_at: z.string(),
  sessions: z
    .array(
      z.object({
        date: z.string(),
        time: z.number(),
      }),
    )
    .default([]),
  sub_tasks: z.array(SubTaskSchema).default([]),
});

export type Task = z.infer<typeof TaskSchema>;
export type SubTask = z.infer<typeof SubTaskSchema>;

export interface AddTaskAction {
  type: "ADD_TASK";
  payload: { key?: number };
}

export interface AddSubTaskAction {
  type: "ADD_SUB_TASK";
  payload: { id: number; key?: number };
}

export interface DeleteSubTaskAction {
  type: "DELETE_SUB_TASK";
  payload: { sub_task_id: number; id: number; key?: number };
}

export interface UpdateSubTaskAction {
  type: "UPDATE_SUB_TASK";
  payload: {
    sub_task_id: number;
    id: number;
    key?: number;
    updated_sub_task: any;
  };
}

export interface UpdateTaskAction {
  type: "UPDATE_TASK";
  payload: {
    id: number;
    key?: number;
    updated_task: any;
  };
}

export interface DeleteTaskAction {
  type: "DELETE_TASK";
  payload: { id: number; key?: number };
}

export interface SetTasksAction {
  type: "SET_TASKS";
  payload: Task[];
}

export type TaskActionTypes =
  | AddTaskAction
  | AddSubTaskAction
  | DeleteSubTaskAction
  | UpdateSubTaskAction
  | UpdateTaskAction
  | SetTasksAction
  | DeleteTaskAction;

export const addTask = ({ key }: { key?: number }): AddTaskAction => {
  return {
    type: "ADD_TASK",
    payload: { key },
  };
};

export const addSubTask = ({
  id,
  key,
}: { id: number; key?: number }): AddSubTaskAction => {
  return {
    type: "ADD_SUB_TASK",
    payload: { id, key },
  };
};

export const updateSubTask = ({
  sub_task_id,
  id,
  key,
  updated_sub_task,
}: {
  sub_task_id: number;
  id: number;
  key?: number;
  updated_sub_task: any;
}): UpdateSubTaskAction => {
  return {
    type: "UPDATE_SUB_TASK",
    payload: { sub_task_id, id, key, updated_sub_task },
  };
};

export const deleteSubTask = ({
  sub_task_id,
  id,
  key,
}: { sub_task_id: number; id: number; key?: number }): DeleteSubTaskAction => {
  return {
    type: "DELETE_SUB_TASK",
    payload: { sub_task_id, id, key },
  };
};

export const updateTask = ({
  id,
  key,
  updated_task,
}: {
  id: number;
  key?: number;
  updated_task: any;
}): UpdateTaskAction => {
  return {
    type: "UPDATE_TASK",
    payload: { id, key, updated_task },
  };
};

export const deleteTask = ({
  id,
  key,
}: { id: number; key?: number }): DeleteTaskAction => {
  return {
    type: "DELETE_TASK",
    payload: { id, key },
  };
};

export const setTasks = (todos: Task[]): SetTasksAction => ({
  type: "SET_TASKS",
  payload: todos,
});
