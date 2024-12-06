import { get_cache, set_cache } from "@/lib/cache-client";
import { parseWithZod } from "@conform-to/zod";
import { json } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { format, isToday } from "date-fns";
import { z } from "zod";

const cache_key = `todos-key`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getTimestamp = (date: Date) => {
  return date.getTime(); // Mengembalikan timestamp dalam milidetik
};

function get_formatted_date(timestamp: number | null) {
  const currentDate = timestamp ? new Date(parseInt(timestamp)) : new Date();
  currentDate.setHours(0, 1, 0, 0);

  return {
    key: format(currentDate, "yyyy-MM-dd"),
    q: format(currentDate, "EEEE, dd MMM yyyy"),
    timestamp: getTimestamp(currentDate),
    is_today: isToday(currentDate),
  };
}

const generateTaskId = async () => {
  return Date.now();
};

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
  category: z
    .string()
    .optional()
    .transform((value) => value ?? ""),
});

const TaskFormSchema = z.object({
  status: z
    .enum(["draft", "paused", "progress", "done", "cancel"])
    .default("draft"),
  title: EmptyString,
  category: EmptyString,
  start_at: z.string().nullable().default(null), // Nullable, set when task is completed
  total_time: z.number().default(0),
  target_sessions: z.number().default(0),
  completed_sessions: z.number().default(0),
  end_at: z.string().nullable().default(null), // Nullable, set when task is completed
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

const FormActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("add-task"),
    ...TaskFormSchema.shape,
  }),
  z.object({
    intent: z.literal("add-sub-task"),
    id: z.coerce.number(),
    sub_tasks: z.string(),
  }),
  z.object({
    intent: z.literal("update-task"),
    id: z.coerce.number(),
    ...TaskFormSchema.shape,
  }),
  z.object({
    intent: z.literal("copy-task"),
    id: z.string(),
  }),
  z.object({
    intent: z.literal("mark-done-task"),
    id: z.string(),
  }),
  z.object({
    intent: z.literal("delete-task"),
    id: z.coerce.number(),
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
    intent: z.literal("update-target-task-session"),
    id: z.number(),
    target_sessions: z.number(),
  }),
  z.object({
    intent: z.literal("update-complete-task-session"),
    id: z.number(),
    completedAt: z.string(),
  }),
]);

import { faker } from "@faker-js/faker";

// Fungsi untuk membuat satu todo
const generateTodo = (date) => {
  const numSessions = faker.number.int({ min: 1, max: 5 }); // Jumlah sesi per todo
  const sessions = Array.from({ length: numSessions }, () => ({
    date: faker.date
      .between({ from: `${date}T00:00:00Z`, to: `${date}T23:59:59Z` })
      .toISOString(),
    time: faker.number.int({ min: 1000, max: 3600000 }), // Waktu antara 1 detik hingga 1 jam
  }));

  return {
    id: faker.number.int(),
    total_time: sessions.reduce((total, session) => total + session.time, 0),
    end_at: null,
    target_sessions: faker.number.int({ min: 1, max: 8 }),
    completed_sessions: faker.number.int({ min: 0, max: sessions.length }),
    sessions,
    status: faker.helpers.arrayElement(["paused", "completed"]),
    title: faker.lorem.words(2),
    columnId: faker.helpers.arrayElement(["done", "todo"]),
    category: faker.helpers.arrayElement(["work", "personal", "health"]),
    start_at: null,
    sub_tasks: Array.from(
      { length: faker.number.int({ min: 1, max: 3 }) },
      () => ({
        id: faker.string.uuid(),
        checked: faker.datatype.boolean(),
        title: faker.lorem.words(3),
      }),
    ),
    created_at: faker.date
      .between({ from: `${date}T00:00:00Z`, to: `${date}T06:00:00Z` })
      .toISOString(),
    updatedAt: faker.date
      .between({ from: `${date}T06:00:00Z`, to: `${date}T23:59:59Z` })
      .toISOString(),
  };
};

// Fungsi untuk membuat data berdasarkan tanggal
const generate_todos_by_date = (startDate, numDays) => {
  const data = {};
  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const date_key = currentDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
    const numTodos = faker.number.int({ min: 1, max: 5 }); // Jumlah todo per hari
    data[date_key] = Array.from({ length: numTodos }, () =>
      generateTodo(date_key),
    );
  }
  return data;
};

// Contoh penggunaan
const calculateTotalSessionTime = (data) => {
  const result = {};
  for (const [date, todos] of Object.entries(data)) {
    result[date] = todos.reduce((total, todo) => {
      const sessionTime = todo.sessions.reduce(
        (sum, session) => sum + session.time,
        0,
      );
      return total + sessionTime;
    }, 0);
  }
  return result;
};

const findTodosByStatusWithReduce = (data, status) => {
  const todosWithStatus = Object.values(data).reduce((acc, todos) => {
    const filteredTodos = todos.filter((todo) => todo.status === status);
    return acc.concat(filteredTodos);
  }, []);

  return todosWithStatus.length > 0 ? todosWithStatus[0] : null;
};

const calculateGlobalSessionCount = (data) => {
  const result = {};

  for (const [date, todos] of Object.entries(data)) {
    // Menghitung total sesi untuk setiap tanggal
    const totalSessionsForDate = todos.reduce((total, todo) => {
      return total + todo.sessions.length; // Menambahkan jumlah sesi dari setiap todo
    }, 0);

    // Menyimpan total sesi untuk setiap tanggal
    result[date] = totalSessionsForDate;
  }

  return result;
};

import { eachDayOfInterval, getDay } from "date-fns";

const calculateStreak = (data) => {
  // Ambil semua tanggal dari data dan urutkan
  const sortedDates = Object.keys(data).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  if (sortedDates.length === 0) return { current_streak: 0, longest_streak: 0 };

  const startDate = new Date(sortedDates[0]);
  const endDate = new Date(sortedDates[sortedDates.length - 1]);

  // Ambil semua hari dari tanggal awal hingga akhir
  const allDays = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (date) => ({
      formatted: format(date, "yyyy-MM-dd"),
      dayOfWeek: getDay(date), // Dapatkan hari dalam angka (0 = Minggu, 6 = Sabtu)
    }),
  );

  let current_streak = 0;
  let longest_streak = 0;

  for (const { formatted, dayOfWeek } of allDays) {
    if (data[formatted]) {
      // Jika tanggal ada di data, cek apakah ada sesi aktif
      const hasActiveSessions = data[formatted].some(
        (todo) => todo.sessions.length > 0,
      );
      if (hasActiveSessions) {
        current_streak++; // Tambah streak jika aktif
        longest_streak = Math.max(longest_streak, current_streak);
      } else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Reset streak jika tidak aktif, kecuali hari Sabtu (6) atau Minggu (0)
        current_streak = 0;
      }
    } else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Reset streak jika tanggal tidak ada, kecuali akhir pekan
      current_streak = 0;
    }
  }

  return {
    current_streak,
    longest_streak,
  };
};

const statusOrder = {
  progress: 1,
  paused: 2,
  draft: 3,
  done: 4,
  cancel: 5,
};

function sort_by_tatus(data) {
  const sorted_data = data.sort((a, b) => {
    // Ambil status untuk masing-masing data, jika status tidak ada, set default ke 'unknown'
    const statusA = a.status || "unknown";
    const statusB = b.status || "unknown";

    // Jika status tidak valid, letakkan di bawah (di urutan akhir)
    const orderA = statusOrder[statusA] || 999; // 999 adalah nilai default untuk 'unknown'
    const orderB = statusOrder[statusB] || 999;

    // Bandingkan berdasarkan urutan
    return orderA - orderB;
  });

  return sorted_data;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const day = url.searchParams.get("day");

  const date_key = get_formatted_date(day);
  // const testData = generate_todos_by_date("2024-11-22", 7); // Data untuk 7 hari mulai dari 1 Desember 2024
  // const testData1 = generate_todos_by_date("2024-11-30", 7); // Data untuk 7 hari mulai dari 1 Desember 2024

  const cached_data = (await get_cache(cache_key)) as {
    [key: string]: any;
  } | null;

  // await set_cache(cache_key, { ...testData, ...testData1 });
  // const filteredData = cached_data[date_key.key].filter(
  //   (item) => !ids.includes(item.id),
  // );
  //
  // await set_cache(cache_key, {
  //   ...cached_data,
  //   [date_key.key]: [...filteredData], // Menyimpan data berdasarkan tanggal
  // });
  // return;
  if (cached_data) {
    return {
      datas: { ...cached_data },
      data: [
        ...(cached_data[date_key.key]
          ? sort_by_tatus(cached_data[date_key.key].reverse())
          : []),
      ],
      active_task: findTodosByStatusWithReduce(cached_data, "progress"),
      total_sessions: calculateGlobalSessionCount(cached_data),
      streak_data: calculateStreak(cached_data),
      date: date_key,
    };
  }
  return { data: [], date: date_key };
};

export const loaderTodoId = async ({ request, params }) => {
  const url = new URL(request.url);
  const day = url.searchParams.get("day");

  const date_key = get_formatted_date(day);

  const cached_data = (await get_cache(cache_key)) as {
    [key: string]: any;
  } | null;

  if (cached_data && cached_data[date_key.key]) {
    const task = cached_data[date_key.key].find(
      (d) => d.id === parseInt(params.id),
    );
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
  const formData = await request.formData();
  const validation = parseWithZod(formData, { schema: FormActionSchema });
  console.warn("DEBUGPRINT[3]: tasks.ts:378: validation=", validation);
  const success = validation.status === "success";
  const url = new URL(request.url);
  const day = url.searchParams.get("day");

  const date_key = get_formatted_date(day);
  const formatted_date = date_key.key;
  // return json({
  //   success,
  //   submission,
  //   error,
  // });
  if (success) {
    const submission = validation.value;
    const cached_data = (await get_cache(cache_key)) as {} | null;
    switch (submission.intent) {
      case "add-task": {
        const { intent, ...data } = submission;

        const payload = {
          id: await generateTaskId(),
          ...data,
          created_at: new Date().toISOString(),
        };

        if (cached_data) {
          const existing_data = cached_data[formatted_date] || [];
          existing_data.push(payload);
          await set_cache(cache_key, {
            ...cached_data,
            [formatted_date]: existing_data, // Menyimpan data berdasarkan tanggal
          });
        } else {
          // Jika tidak ada cache, buat objek dengan tanggal sebagai key
          await set_cache(cache_key, {
            [formatted_date]: [payload],
          });
        }

        return { success, submission };
      }
      case "add-sub-task": {
        const indexData = cached_data[formatted_date].findIndex(
          (d) => d.id === submission.id,
        );
        if (indexData !== -1) {
          const { intent, ...data } = submission;
          const parseData = JSON.parse(data.sub_tasks);
          const sub_tasks = SubTaskSchema.parse(parseData);
          const original_data = cached_data[formatted_date][indexData];
          const oldSubTasks = original_data?.sub_tasks || [];
          const merge_data = {
            ...original_data,
            sub_tasks: [...oldSubTasks, sub_tasks],
            updatedAt: new Date(),
          };

          cached_data[formatted_date][indexData] = merge_data;
          await set_cache(cache_key, {
            ...cached_data,
          });

          return { success, submission };
        } else {
          return { success: false, submission };
        }
      }
      case "update-task": {
        const indexData = cached_data[formatted_date].findIndex(
          (d) => d.id === submission.id,
        );
        if (indexData !== -1) {
          const { intent, ...data } = submission;
          const original_data = cached_data[formatted_date][indexData];
          const merge_data = {
            ...original_data,
            ...data,
            total_time: data?.total_time ?? 0,
            updatedAt: new Date(),
          };

          cached_data[formatted_date][indexData] = merge_data;
          await set_cache(cache_key, {
            ...cached_data,
          });

          return { success, submission };
        } else {
          return { success: false, submission };
        }
      }
      case "update-status-task": {
        const { intent, ...data } = submission;
        const indexData = cached_data[formatted_date].findIndex(
          (d) => d.id === parseInt(submission.id),
        );
        const filterStatus = cached_data[formatted_date].filter(
          (d) => d.status === "progress",
        );

        if (submission?.status === "progress" && filterStatus.length > 0) {
          toast({
            title: "Please complete " + filterStatus[0].title,
            description: filterStatus[0].title + " still progress",
          });

          return {
            success: false,
            message: "Masih ada yang belum selesai",
          };
        }

        if (indexData !== -1) {
          const original_data = cached_data[formatted_date][indexData];
          let merge_data = {
            updatedAt: new Date().toISOString(),
          };

          if (submission?.status === "done") {
            const todo = original_data;
            const manualTime = undefined;
            const elapsedTime = todo.start_at ? Date.now() - todo.start_at : 0; // Hitung waktu berjalan jika aktif
            merge_data = {
              ...todo,
              total_time:
                manualTime !== undefined
                  ? manualTime
                  : todo.total_time + elapsedTime, // Gunakan waktu manual jika ada
              start_at: null, // Timer berhenti
              status: "done", // Tandai selesai
            };
          }
          if (submission?.status === "pause") {
            const todo = original_data;
            const elapsedTime = todo.start_at
              ? Date.now() - new Date(todo.start_at)
              : 0;
            const newTotalTime = todo.total_time + elapsedTime;

            merge_data = {
              ...todo,
              status: "paused",
              total_time: newTotalTime,
              start_at: null,
            };
          }
          if (submission?.status === "progress") {
            merge_data = {
              ...original_data,
              status: "progress",
              start_at: new Date().toISOString(),
            };
          }

          cached_data[formatted_date][indexData] = merge_data;
          await set_cache(cache_key, {
            ...cached_data,
          });

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
      case "update-target-task-session": {
        const { intent, ...data } = submission;
        const indexData = cached_data[formatted_date].findIndex(
          (d) => d.id === submission.id,
        );

        const todos = cached_data[formatted_date];
        const totalTargetSessions = todos?.reduce(
          (sum, todo) => sum + todo.target_sessions,
          0,
        );
        const isCalculate =
          totalTargetSessions + submission.target_sessions > 16;
        if (isCalculate) {
          toast({
            title: "Maximal 16 sessions perday",
            description: "Maximal 16 sessions perday",
          });

          return {
            success: false,
            message: "Maximal 16 sessions perday",
          };
        }

        if (indexData !== -1) {
          const original_data = cached_data[formatted_date][indexData];
          let merge_data = {
            ...original_data,
            updatedAt: new Date().toISOString(),
            target_sessions: data.target_sessions,
          };

          cached_data[formatted_date][indexData] = merge_data;
          await set_cache(cache_key, {
            ...cached_data,
          });

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
      case "update-complete-task-session": {
        const { intent, ...data } = submission;
        const indexData = cached_data[formatted_date].findIndex(
          (d) => d.id === submission.id,
        );

        if (indexData !== -1) {
          const original_data = cached_data[formatted_date][indexData];

          const sessionData = original_data.sessions || [];

          const todo = original_data;
          const elapsedTime = todo.start_at
            ? Date.now() - new Date(todo.start_at)
            : 0;
          const newTotalTime = todo.total_time + elapsedTime;
          sessionData.push({ date: data.completedAt, time: newTotalTime });

          let merge_data = {
            ...original_data,
            updatedAt: new Date().toISOString(),
            sessions: sessionData,
            status: "draft",
            total_time: 0,
            start_at: null,
          };

          cached_data[formatted_date][indexData] = merge_data;
          await set_cache(cache_key, {
            ...cached_data,
          });

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
        const indexData = cached_data.findIndex((d) => d.id === submission.id);
        if (indexData !== -1) {
          const original_data = cached_data[indexData];
          const newData = {
            ...original_data,
            status: "draft",
            created_at: new Date().toISOString(),
            start_at: null,
            updatedAt: null,
            completedAt: null,
            id: await generateTaskId(),
          };
          await set_cache(cache_key, [...cached_data, newData]);

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
        const filteredData = cached_data[formatted_date].filter(
          (item) => item.id !== submission.id,
        );

        await set_cache(cache_key, {
          ...cached_data,
          [formatted_date]: [...filteredData], // Menyimpan data berdasarkan tanggal
        });

        return { success, submission, message: "Success delete task" };
      }
      case "delete-sub-task": {
        const filteredData = cached_data[formatted_date].filter(
          (item) => item.id !== submission.id,
        );

        await set_cache(cache_key, {
          ...cached_data,
          [formatted_date]: [...filteredData], // Menyimpan data berdasarkan tanggal
        });

        return { success, submission, message: "Success delete task" };
      }
    }
  } else {
    const toastMessage = getToastMessage("error", "", "Failed operation.");
    toast(toastMessage);

    return json({ success, validation });
  }
  return null;
};
