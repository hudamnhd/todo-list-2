import { getCache, setCache } from "@/lib/cache-client";
import { json } from "react-router-dom";
import { validateForm } from "@/lib/validation-data";
import { toast } from "@/components/ui/use-toast";

import { z } from "zod";

const cacheKey = `tasks`;

const generateTaskId = async () => {
  let taskIdCounter = 1;
  const cachedData = (await getCache(cacheKey)) as { id: string }[] | null;

  if (cachedData && cachedData.length > 0) {
    const lastTask = cachedData[cachedData.length - 1];

    const lastIdNumber = parseInt(lastTask.id, 10);

    taskIdCounter = lastIdNumber + 1;
  }

  return `${String(taskIdCounter).padStart(4, "0")}`;
};

const FormActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("add-task"),
    title: z.string(),
    notes: z.string(),
    status: z.enum(["draft", "progress", "done", "cancel"]).default("draft"),
    label: z
      .enum(["bug", "feature", "documentation", "enhancement"])
      .default("feature"),
    priority: z.enum(["high", "medium", "low"]).default("medium"),
    createdAt: z.string().default(() => new Date().toISOString()),
    updatedAt: z.string().nullable().default(null),
    startAt: z.string().nullable().default(null),
    completedAt: z.string().nullable().default(null),
  }),
  z.object({
    intent: z.literal("update-task"),
    id: z.string(),
    title: z.string(),
    notes: z.string(),
    status: z.enum(["draft", "progress", "done", "cancel"]),
    label: z.enum(["bug", "feature", "documentation", "enhancement"]),
    priority: z.enum(["high", "medium", "low"]),
    updatedAt: z.string().default(() => new Date().toISOString()),
  }),
  z.object({
    intent: z.literal("copy-task"),
    id: z.string(),
  }),
  z.object({
    intent: z.literal("delete-task"),
    ids: z.string(),
  }),
  z.object({
    intent: z.literal("update-label-task"),
    id: z.string(),
    label: z.string(),
  }),
  z.object({
    intent: z.literal("update-status-task"),
    id: z.string(),
    status: z.string(),
  }),
  z.object({
    intent: z.literal("update-priority-task"),
    id: z.string(),
    priority: z.string(),
  }),
]);

import { faker } from "@faker-js/faker";

type TaskStatus = "todo" | "in-progress" | "done";
type TaskLabel = "bug" | "feature" | "documentation" | "enhancement";
type TaskPriority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  label: TaskLabel;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  startAt: string;
  completedAt: string | null;
}

const generateTasks = (count: number): Task[] => {
  const statuses: TaskStatus[] = ["todo", "in-progress", "done"];
  const labels: TaskLabel[] = [
    "bug",
    "feature",
    "documentation",
    "enhancement",
  ];
  const status: TaskStatus[] = ["draft", "done", "cancel"];
  const priorities: TaskPriority[] = ["high", "medium", "low"];

  const tasks: Task[] = [];

  for (let i = 1; i <= count; i++) {
    const now = new Date();

    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(now.getMonth() - 10); // Rentang mulai 4 bulan yang lalu
    const startAt = faker.date.between({ from: fourMonthsAgo, to: now });
    const completedAt =
      faker.helpers.arrayElement(statuses) === "done"
        ? faker.date.between({ from: startAt, to: now })
        : null;

    tasks.push({
      id: `${String(i).padStart(4, "0")}`,
      title: faker.lorem.words(3), // Random title
      notes: faker.lorem.sentence(), // Random notes
      status: faker.helpers.arrayElement(status),
      label: faker.helpers.arrayElement(labels),
      priority: faker.helpers.arrayElement(priorities),
      createdAt: startAt.toISOString(),
      updatedAt: now.toISOString(),
      startAt: startAt.toISOString(),
      completedAt: completedAt ? completedAt.toISOString() : null,
    });
  }

  return tasks;
};

export const loader = async () => {
  // setCache(cacheKey, generateTasks(100));
  const cachedData = (await getCache(cacheKey)) as {} | null;
  if (cachedData) {
    if (Array.isArray(cachedData)) {
      return cachedData.reverse();
    }
    return cachedData;
  }
  return [];
};

export const loaderTaskId = async ({ params }) => {
  const cacheKey = `tasks`;
  const cachedData = (await getCache(cacheKey)) as {} | null;
  if (cachedData) {
    const task = cachedData.find((d) => d.id === params.id);
    if (!task) return null;
    return task;
  }
  return null;
};

function parseStringify(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn("DEBUGPRINT[11]: tasks.ts:157: error=", error);
    return null;
  }
}

type ToastAction = "add" | "delete" | "update" | "start" | "error";

function getToastMessage(
  action: ToastAction,
  taskTitle: string,
  errorMessage?: string,
) {
  switch (action) {
    case "add":
      return {
        title: "Task Added",
        description: `The task "${taskTitle}" has been successfully added.`,
      };
    case "delete":
      return {
        title: "Task Deleted",
        description: `The task "${taskTitle}" has been successfully deleted.`,
      };
    case "update":
      return {
        title: "Task Updated",
        description: `The task "${taskTitle}" has been successfully updated.`,
      };
    case "copy":
      return {
        title: "Task Duplicated",
        description: `The task "${taskTitle}" has been successfully duplicated.`,
      };
    case "start":
      return {
        title: "Task Started",
        description: `The task "${taskTitle}" has been started.`,
      };
    case "error":
      return {
        title: "Error",
        description: errorMessage || "An unexpected error occurred.",
      };
    default:
      return {
        title: "Unknown Action",
        description: "No description available for this action.",
      };
  }
}

export const action = async ({ request }) => {
  const {
    success,
    data: submission,
    error,
  } = await validateForm(request, FormActionSchema);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // return json({
  //   success,
  //   submission,
  //   error,
  // });
  if (success) {
    const cacheKey = `tasks`;
    const cachedData = (await getCache(cacheKey)) as {} | null;
    switch (submission.intent) {
      case "add-task": {
        await delay(1000);
        const { intent, ...data } = submission;
        const payload = {
          id: await generateTaskId(),
          ...data,
        };
        if (cachedData) {
          await setCache(cacheKey, [...cachedData, payload]);
        } else {
          await setCache(cacheKey, [payload]);
        }

        const toastMessage = getToastMessage("add", submission.title);
        toast(toastMessage);
        return { success, submission };
      }
      case "update-task": {
        await delay(1000);
        const { intent, ...data } = submission;
        const indexData = cachedData.findIndex((d) => d.id === submission.id);
        if (indexData !== -1) {
          const originalData = cachedData[indexData];
          const mergeData = { ...originalData, ...data };
          cachedData[indexData] = mergeData;
          await setCache(cacheKey, [...cachedData]);

          const toastMessage = getToastMessage("update", submission.title);
          toast(toastMessage);

          return { success, submission };
        } else {
          return { success: false, submission };
        }
      }
      case "update-status-task":
      case "update-priority-task":
      case "update-label-task": {
        const { intent, ...data } = submission;
        const indexData = cachedData.findIndex((d) => d.id === submission.id);
        const filterStatus = cachedData.filter((d) => d.status === "progress");

        if (submission?.status === "progress" && filterStatus.length > 0) {
          toast({
            title: "Please complete " + filterStatus[0].id,
            description: filterStatus[0].id + " still progress",
          });

          return {
            success: false,
            message: "Masih ada yang belum selesai",
          };
        }

        if (indexData !== -1) {
          const originalData = cachedData[indexData];
          let mergeData = {
            ...originalData,
            ...data,
            updatedAt: new Date().toISOString(),
          };

          if (submission?.status === "done") {
            mergeData = {
              ...originalData,
              ...data,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          if (submission?.status === "progress") {
            mergeData = {
              ...originalData,
              ...data,
              startAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }

          cachedData[indexData] = mergeData;
          await setCache(cacheKey, [...cachedData]);

          const toastMessage = getToastMessage("update", originalData.title);
          toast(toastMessage);

          return { success, submission };
        } else {
          const toastMessage = getToastMessage(
            "error",
            "",
            "Failed to update task.",
          );
          toast(toastMessage);
          return { success: false, submission };
        }
      }
      case "copy-task": {
        const { intent, ...data } = submission;
        const indexData = cachedData.findIndex((d) => d.id === submission.id);
        if (indexData !== -1) {
          const originalData = cachedData[indexData];
          const newData = {
            ...originalData,
            status: "draft",
            createdAt: new Date().toISOString(),
            startAt: null,
            updatedAt: null,
            completedAt: null,
            id: await generateTaskId(),
          };
          await setCache(cacheKey, [...cachedData, newData]);

          const toastMessage = getToastMessage("copy", submission.title);
          toast(toastMessage);

          return json({ success, submission });
        } else {
          const toastMessage = getToastMessage(
            "error",
            "",
            "Failed to copy task.",
          );
          toast(toastMessage);
          return { success: false, submission };
        }
      }
      case "delete-task": {
        await delay(1000);
        const ids = parseStringify(submission.ids);
        if (!ids) return json({ success: false });
        const filteredData = cachedData.filter(
          (item) => !ids.includes(item.id),
        );
        await setCache(cacheKey, [...filteredData]);

        toast({
          title: "Task Deleted",
          description: `Success delete ${ids.length}  ${ids?.length === 1 ? "task" : "tasks"}  from our database`,
        });
        return { success, submission, message: "Success delete task" };
      }
    }
  } else {
    const toastMessage = getToastMessage("error", "", "Failed operation.");
    toast(toastMessage);

    console.warn("DEBUGPRINT[16]: tasks.ts:378: error=", error);
    return json({ success, error });
  }
  return null;
};
