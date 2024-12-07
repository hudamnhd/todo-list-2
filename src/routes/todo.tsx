import { RenderTracker } from "@/components/render-tracker.tsx";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import store, { initial_daily_tasks } from "@/store/store";
import {
  addTask,
  addSubTask,
  updateTask,
  deleteTask,
  deleteSubTask,
  updateSubTask,
  updateSessionTask,
  updateTasksColumn,
  Task,
  setTasks,
} from "@/features/daily-tasks/actions";
import { faker } from "@faker-js/faker";
import { get_cache, set_cache } from "@/lib/cache-client";

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
    // total_time: sessions.reduce((total, session) => total + session.time, 0),
    total_time: 0,
    end_at: null,
    target_sessions: faker.number.int({ min: 1, max: 8 }),
    completed_sessions: faker.number.int({ min: 0, max: sessions.length }),
    sessions,
    status: faker.helpers.arrayElement(["paused", "completed"]),
    title: faker.lorem.words(2),
    columnId: faker.helpers.arrayElement(["done", "todo"]),
    category: {
      label: faker.helpers.arrayElement(["General"]),
      color: faker.helpers.arrayElement(["#9ca3af"]),
    },
    start_at: null,
    sub_tasks: Array.from(
      { length: faker.number.int({ min: 1, max: 3 }) },
      () => ({
        id: faker.number.int(),
        checked: faker.datatype.boolean(),
        title: faker.lorem.words(3),
        category: {
          label: faker.helpers.arrayElement(["General"]),
          color: faker.helpers.arrayElement(["#9ca3af"]),
        },
      }),
    ),
    created_at: faker.date
      .between({ from: `${date}T00:00:00Z`, to: `${date}T06:00:00Z` })
      .toISOString(),
    updated_at: faker.date
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

let initial_data = true;
async function load_data_daily_tasks() {
  const spinner = document.getElementById("initial-loading");
  if (spinner) {
    spinner.style.display = "flex";
  }
  const initialTasks = await initial_daily_tasks();
  // const cache_log = await get_cache("log-daily-tasks");

  // const testData = generate_todos_by_date("2024-11-22", 30); // Data untuk 7 hari mulai dari 1 Desember 2024
  // store.dispatch(setTasks(testData));
  //
  // if (spinner) {
  //   spinner.style.display = "none";
  // }
  // initial_data = false;
  // return;
  try {
    if (initialTasks) {
      store.dispatch(setTasks(initialTasks));
    } else {
      store.dispatch(setTasks({}));
    }
  } catch (error) {
    console.warn("DEBUGPRINT[2]: todo.tsx:81: error=", error);
  } finally {
    if (spinner) {
      spinner.style.display = "none";
    }
    initial_data = false;
  }
}

const findTodosByStatusWithReduce = (data, status: string) => {
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
const TodoNavigator = ({ data }) => {
  const [day_timestamp, set_day_timestamp] = useState<number | undefined>();
  const date_key = get_formatted_date(day_timestamp);
  // Fungsi untuk mendapatkan task berdasarkan tanggal
  const todos = data[date_key.key] || [];

  // Fungsi untuk navigasi ke tanggal berikutnya
  const goToNextDate = () => {
    set_day_timestamp(date_key.timestamp + 86400000);
  };

  // Fungsi untuk navigasi ke tanggal sebelumnya
  const goToPreviousDate = () => {
    set_day_timestamp(date_key.timestamp - 86400000);
  };

  const active_task = findTodosByStatusWithReduce(data, "progress");
  const all_session = calculateGlobalSessionCount(data);
  const streak_data = calculateStreak(data);

  return (
    <div>
      <div>
        <TaskApp
          todos={todos}
          goToNextDate={goToNextDate}
          goToPreviousDate={goToPreviousDate}
          date={date_key}
          active_task={active_task}
          all_session={all_session}
          streak_data={streak_data}
        />
        <KanbanBoard
          tasks={todos}
          goToNextDate={goToNextDate}
          goToPreviousDate={goToPreviousDate}
          date={date_key}
          active_task={active_task}
          all_session={all_session}
          streak_data={streak_data}
        />
        {/*<Debug data={todos} />*/}
      </div>
    </div>
  );
};

const TaskFirst = () => {
  const todos = useAppSelector((state) => state.tasks.tasks);

  React.useEffect(() => {
    load_data_daily_tasks();
    askNotificationPermission();
  }, []);

  if (!initial_data)
    return (
      <div className="relative inset-0  min-h-screen overflow-y-auto w-full bg-gray-200 dark:bg-gradient-to-tl dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto max-w-3xl w-full rounded-base p-3 bg-gray-200 dark:bg-gradient-to-tl dark:from-gray-950 dark:to-gray-900">
          <TodoNavigator data={todos} />
        </main>
      </div>
    );
};

export default TaskFirst;

// import React, { useState } from "react";

// Tipe untuk data task dan sub-task
type Category = {
  label: string;
  color: string;
};

type SubTask = {
  id: number;
  checked: boolean;
  title: string;
  category: Category;
};

type Task = {
  id: number;
  status: string;
  title: string;
  category: Category;
  start_at: string | null;
  total_time: number;
  target_sessions: number;
  completed_sessions: number;
  end_at: string | null;
  sessions: any[];
  sub_tasks: SubTask[];
  created_at: string;
  updated_at: string;
};

type TaskProps = {
  taskData: Record<string, Task[]>;
};

function get_formatted_date(timestamp?: number | null) {
  const currentDate = timestamp ? new Date(timestamp) : new Date();
  currentDate.setHours(0, 1, 0, 0);

  return {
    key: format(currentDate, "yyyy-MM-dd"),
    q: format(currentDate, "EEEE, dd MMM yyyy"),
    timestamp: currentDate.getTime(),
    is_today: isToday(currentDate),
  };
}
const TaskList: React.FC<TaskProps> = ({ todos }) => {
  const dispatch = useAppDispatch();

  return (
    <div className="ring-2 p-3 rounded-md">
      {todos.map((task) => (
        <div key={task.id} style={{ marginBottom: "20px" }}>
          <button
            className="text-sm bg-red-600 text-white mx-1 rounded-md px-3 py-1 "
            onClick={() => dispatch(deleteTask({ id: task.id }))}
          >
            Delete
          </button>
          <textarea
            className="border border-blue-500 p-3"
            defaultValue={task.title}
            placeholder="Untitled Task"
            onBlur={(e) => {
              dispatch(
                updateTask({
                  id: task.id,
                  updated_task: {
                    title: e.target.value,
                  },
                }),
              );
            }}
          />
          <h3>{task.title || "Untitled Task"}</h3>
          <div>Status: {task.status}</div>
          <div>Start: {task.start_at ? task.start_at : "N/A"}</div>
          <div>End: {task.end_at ? task.end_at : "N/A"}</div>

          <h4>Sub-Tasks</h4>
          {task.sub_tasks.length === 0 ? (
            <p>No sub-tasks</p>
          ) : (
            <ul>
              {task.sub_tasks.map((subTask, index) => (
                <li
                  style={{ animationDelay: `${index * 0.03}s` }}
                  key={subTask.id}
                  className=" animate-slide-bottom [animation-fill-mode:backwards]"
                >
                  <input
                    type="checkbox"
                    defaultChecked={subTask.checked}
                    onChange={(e) => {
                      dispatch(
                        updateSubTask({
                          id: task.id,
                          sub_task_id: subTask.id,
                          updated_sub_task: {
                            checked: e.target.checked,
                          },
                        }),
                      );
                    }}
                  />

                  <textarea
                    className="border border-blue-500 p-3"
                    defaultValue={subTask.title}
                    placeholder="Untitled Sub-Task"
                    onBlur={(e) => {
                      dispatch(
                        updateSubTask({
                          id: task.id,
                          sub_task_id: subTask.id,
                          updated_sub_task: {
                            title: e.target.value,
                          },
                        }),
                      );
                    }}
                  />
                  <button
                    className="text-sm bg-red-600 text-white mx-1 rounded-md px-3 py-1 "
                    onClick={() =>
                      dispatch(
                        deleteSubTask({
                          id: task.id,
                          sub_task_id: subTask.id,
                        }),
                      )
                    }
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            className="text-sm bg-red-600 text-white mx-1 rounded-md px-3 py-1 "
            onClick={() => dispatch(addSubTask({ id: task.id }))}
          >
            Add Sub-Task
          </button>
        </div>
      ))}
    </div>
  );
};

import {
  AlertDialogProvider,
  useAlert,
  useConfirm,
  usePrompt,
} from "@/components/ui/alert-dialog-provider.tsx";
import {
  ChevronsUpDown,
  EllipsisVertical,
  ChartLine,
  Activity,
  Trees,
  Plus,
  Coffee,
  Flame,
  Badge as BadgeIcon,
  Play,
  Pause,
  Rocket,
  X,
  GripVertical,
  ArrowRight,
  Crosshair,
  Circle,
  ListPlus,
  Trash2,
  CircleCheckBig,
  Squircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { cn } from "@/lib/utils";

import { Blockquote, BlockquoteAuthor } from "@/components/ui/blockquote";

const BlockquoteDemo = () => {
  return (
    <Blockquote>
      Happiness lies not in the mere possession of money; it lies in the joy of
      achievement, in the thrill of creative effort.
      <BlockquoteAuthor>Franklin Roosevelt</BlockquoteAuthor>
    </Blockquote>
  );
};

import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
// import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// import { askNotificationPermission } from "./components/notifications";
import { Debug } from "@/components/debug";
import { Form, Outlet } from "react-router-dom";
import { useFetcher } from "react-router-dom";
import {
  useLoaderData,
  useSubmit,
  useNavigate,
  useNavigation,
} from "react-router-dom";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";

function AddTodo({ count, date_key }: { count: number }) {
  const dispatch = useAppDispatch();
  return (
    <Button
      onClick={() => dispatch(addTask({ key: date_key }))}
      className="px-2 bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white"
    >
      <ListPlus />
      {count}
    </Button>
  );
}

function TestCombo() {
  const initialCategories = [{ label: "Work", value: "Work" }];

  const [categories, setCategories] =
    useState<{ label: string; value: string }[]>(initialCategories);
  const [value, setValue] = useState<string>("");
  const [open, setOpen] = useState(false);

  // Menyimpan kategori ke localStorage saat ada perubahan
  useEffect(() => {
    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Menyimpan kategori yang telah diubah ke localStorage
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("categories", JSON.stringify(categories));
    }
  }, [categories]);

  const addCategory = (category: string) => {
    if (category && !categories.some((cat) => cat.value === category)) {
      const newCategory = { label: category, value: category.toLowerCase() };
      setCategories([...categories, newCategory]);
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter((cat) => cat.value !== category));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      addCategory(value.trim()); // Menambahkan kategori jika ada input
    }
  };
  return (
    <>
      {/*<Combobox
        mode="single" //single or multiple
        options={categories}
        placeholder="Select option..."
        selected={value} // string or array
        onChange={(value) => setValue(value)}
        onCreate={(value) => {
          addCategory(value);
        }}
      />*/}
      <Combobox
        mode="multiple" //single or multiple
        options={categories}
        placeholder="Select option..."
        selected={[value]} // string or array
        onChange={(value) => setValue(value)}
        onCreate={(value) => {
          addCategory(value);
        }}
      />
    </>
  );
}

import MultipleSelector, { Option } from "@/components/ui/multiple-selector";

const frameworks: Option[] = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
    disable: true,
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "angular",
    label: "Angular",
  },
  {
    value: "vue",
    label: "Vue.js",
  },
  {
    value: "react",
    label: "React",
  },
  {
    value: "ember",
    label: "Ember.js",
  },
  {
    value: "gatsby",
    label: "Gatsby",
  },
  {
    value: "eleventy",
    label: "Eleventy",
    disable: true,
  },
  {
    value: "solid",
    label: "SolidJS",
  },
  {
    value: "preact",
    label: "Preact",
  },
  {
    value: "qwik",
    label: "Qwik",
  },
  {
    value: "alpine",
    label: "Alpine.js",
  },
  {
    value: "lit",
    label: "Lit",
  },
];

function SelectDemoMulti() {
  return (
    <div className="space-y-2">
      <Label>Multiselect</Label>
      <MultipleSelector
        commandProps={{
          label: "Select frameworks",
        }}
        value={frameworks.slice(0, 2)}
        defaultOptions={frameworks}
        placeholder="Select frameworks"
        hideClearAllButton
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
      />
      <p
        className="mt-2 text-xs text-muted-foreground"
        role="region"
        aria-live="polite"
      >
        Inspired by{" "}
        <a
          className="underline hover:text-foreground"
          href="https://shadcnui-expansions.typeart.cc/docs/multiple-selector"
          target="_blank"
          rel="noopener nofollow"
        >
          shadcn/ui expansions
        </a>
      </p>
    </div>
  );
}
// Daftar warna Tailwind yang umum
const colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "indigo",
  "gray",
  "rose",
  "amber",
  "lime",
  "teal",
  "emerald",
  "cyan",
  "violet",
  "fuchsia",
];

const ColorPalette = () => {
  return (
    <div className="p-4 grid grid-cols-4 gap-4">
      {colors.map((color) => (
        <div key={color} className="flex flex-col items-center">
          <div className={cn("w-20 h-20 rounded-lg", "bg-" + color + "-200")} />
          <div className="text-xs mt-2">text-{color}-200</div>
        </div>
      ))}
      {colors.map((color) => (
        <div key={color} className="flex flex-col items-center">
          <div className={cn("w-20 h-20 rounded-lg", "bg-" + color + "-100")} />
          <div className="text-xs mt-2">text-{color}-100</div>
        </div>
      ))}
    </div>
  );
};

import { useState, useRef } from "react";

import { useEffect } from "react";
import { Check, Sun, Moon, Monitor } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/custom/theme-provider.tsx";
// import { Button } from "@/components/ui/button";

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = theme === "dark" ? "#020817" : "#fff";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    metaThemeColor && metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" className="px-2">
          <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        {/*<div className="rounded-lg bg-green-500 bg-gradient-to-tr from-yellow-200 via-yellow-200/50 to-yellow-100/50 p-2 text-black shadow hover:via-yellow-300/60 hover:to-yellow-200/50"></div>*/}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          Light{" "}
          <Check
            size={14}
            className={cn("ml-auto", theme !== "light" && "hidden")}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
          <Check
            size={14}
            className={cn("ml-auto", theme !== "dark" && "hidden")}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="h-4 w-4 mr-2" />
          System
          <Check
            size={14}
            className={cn("ml-auto", theme !== "system" && "hidden")}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const formatFocusTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hrs ${minutes} mins`;
  } else {
    return `${minutes} mins`;
  }
};

const TaskApp = ({
  todos,
  date,
  goToNextDate,
  goToPreviousDate,
  streak_data,
  all_session,
  active_task,
}) => {
  const totalTargetSessions = todos?.reduce(
    (sum, todo) => sum + todo.target_sessions,
    0,
  );

  // Fungsi untuk menghitung total sesi dari seluruh todos
  const calculateTotalSessions = (todos: Array<{ sessions: Array<any> }>) => {
    return todos.reduce(
      (total_sessions, todo) => total_sessions + todo.sessions.length,
      0,
    );
  };

  const total_sessions = calculateTotalSessions(todos);
  const calculateTotalTime = (
    todos: Array<{ sessions: Array<{ time: number }> }>,
  ) => {
    return todos.reduce((total_time, todo) => {
      // Jumlahkan time dari setiap session di todo
      const sessionTime = todo.sessions.reduce(
        (sessionTotal, session) => sessionTotal + session?.time || 0,
        0,
      );
      return total_time + sessionTime; // Tambahkan session time ke total
    }, 0);
  };

  // Menghitung total waktu dari semua todo
  const total_time = calculateTotalTime(todos);

  return (
    <div className="">
      <pre className="hidden text-sm max-h-[30vh] overflow-y-auto border-2 shadow-light">
        {JSON.stringify(todos, null, 2)}
      </pre>
      {/*<RenderTracker name="TASK APP" stateName={totalTargetSessions} />*/}
      <section className="relative mx-auto flex w-full items-center">
        <div className="ml-auto flex items-center gap-2">
          <AddTodo count={todos.length} date_key={date.timestamp} />
          {/*<Popover>
            <PopoverTrigger className="flex rounded-lg bg-green-400 p-2 text-green-100 transition-all duration-500 ease-in-out">
              <ChartLine />
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-2xl">
              <List03 />
            </PopoverContent>
          </Popover>*/}
          {/*<Popover>
            <PopoverTrigger className="flex rounded-lg bg-red-400 p-2 text-red-100 transition-all duration-500 ease-in-out">
              <Activity />
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-3xl w-auto">
              <Card05 />
            </PopoverContent>
          </Popover>*/}
          <Popover>
            <PopoverTrigger className="flex items-center rounded-lg bg-orange-400 p-2 text-orange-100 transition-all duration-500 ease-in-out text-sm">
              <Flame />
              <span>{streak_data?.current_streak}</span>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <CalendarWeek
                total_sessions={all_session}
                streak_data={streak_data}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className="rounded-lg bg-green-500 bg-gradient-to-tr from-yellow-200 via-yellow-200/50 to-yellow-100/50 p-2 text-black shadow hover:via-yellow-300/60 hover:to-yellow-200/50">
              <Trees />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-1 rounded-lg">
              <CalendarYears total_sessions={all_session} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className="flex items-center bg-gradient-to-tr from-yellow-200 to-yellow-400 text-yellow-900 shadow-sm hover:from-yellow-100 hover:to-yellow-400 rounded-lg p-2">
              <BadgeIcon />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-1 rounded-lg">
              <WeeklyBadge total_sessions={total_sessions} />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger className="rounded-lg lg p-1.5">
              <FocusDisplay total_sessions={total_sessions} isBtn={true} />
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <CalendarMonth total_sessions={all_session} />
            </PopoverContent>
          </Popover>
          <ThemeSwitch />
        </div>
      </section>

      <TodoTimer todos={todos} date={date} active_task={active_task} />
      <div>
        <div
          style={{ animationDelay: `0.1s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] flex flex-col items-end"
        >
          <div className="flex items-center gap-x-1 text-sm">
            {date.q}
            {date.is_today && <strong>(Today)</strong>}
          </div>
        </div>
        <div
          style={{ animationDelay: `0.1s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] ml-auto flex w-full items-center  bg-gradient-to-l from-gray-100 via-gray-100/80 to-gray-100/0 py-2 pr-2 dark:from-gray-700 mb-3 mt-1 rounded-md"
          id="date-navigation"
        >
          <div className="mb-1 mt-3 flex justify-end">
            <div className="text-xs md:text-sm ml-3">
              Total focus time: <strong>{formatFocusTime(total_time)}</strong>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={goToPreviousDate}
              variant="outline"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={goToNextDate}
              variant="outline"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ProgressBarIndicator
          totalTargetSessions={totalTargetSessions}
          total_sessions={total_sessions}
        />
        <ContainerList todos={todos} active_task={active_task} date={date} />
      </div>
    </div>
  );
};

const ProgressBarIndicator = ({ totalTargetSessions, total_sessions }) => {
  return (
    <React.Fragment>
      <div
        style={{ animationDelay: `0.1s` }}
        className="animate-roll-reveal [animation-fill-mode:backwards] mb-3 text-sm rounded-l  transition-all duration-500 ease-in-out"
      >
        <div className="relative h-8 w-full rounded-l bg-gray-300 dark:bg-gray-600 dark:text-white">
          <div className="flex h-8 items-center justify-end gap-1 px-2">
            Max 16
            <Rocket className="h-6 w-6 animate-pulse" />
          </div>
          <div
            className="absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden rounded-l bg-gray-400 px-2 text-white transition-all duration-500 ease-in-out"
            style={{
              width: `${(totalTargetSessions > 16 ? 16 / 16 : totalTargetSessions / 16) * 100}%`,
            }}
          >
            {totalTargetSessions}
            <Crosshair className="h-5 w-5 animate-pulse" />
          </div>
          <div
            className="absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden bg-green-400 px-2 text-gray-600 rounded-l transition-all duration-500 ease-in-out"
            style={{
              width: `${(total_sessions > 16 ? 16 / 16 : total_sessions / 16) * 100}%`,
            }}
          >
            <div
              className="flex shrink-0 items-center gap-1 text-sm"
              style={{ opacity: 1 }}
            >
              <Circle className="h-5 w-5" />
              {total_sessions} sesi
              <ArrowRight className=" ml-2 h-5 w-5 bounce-left-right" />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const ContainerList = ({ todos, date, active_task }) => {
  return (
    <React.Fragment>
      {todos.length > 0 ? (
        <React.Fragment>
          {/*<TodoView todos={todos} date={date} active_task={active_task} />*/}
        </React.Fragment>
      ) : (
        <EmptyTodo date={date} />
      )}
    </React.Fragment>
  );
};

const EmptyTodo = ({ date }) => {
  const dispatch = useAppDispatch();
  return (
    <div className="">
      <p className="text-center text-gray-600 leading-relaxed ">
        No task in {date.q}
      </p>
      <Button
        onClick={() => dispatch(addTask({ key: date.timestamp }))}
        variant="link"
      >
        <Plus className="h-7 w-7" /> Add Task
      </Button>
    </div>
  );
};

const TodoView = ({ todos, date, active_task }) => {
  return (
    <div className="grid gap-1">
      {todos.map((todo, index) => {
        return (
          <TodoForm
            key={todo.id}
            index={index}
            task={todo}
            date={date}
            active_task={active_task}
          />
        );
      })}
    </div>
  );
};

const TWENTY_FIVE_MINUTES = 25 * 60 * 1000; // 25 menit dalam milidetik
const radius = 40; // Radius lingkaran
const circumference = 2 * Math.PI * radius; // Keliling lingkaran

import { useBeforeUnload } from "react-router-dom";

function askNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
    } else {
      console.log("Notification permission denied.");
    }
  });
}

function showNotification(title: string, description: string) {
  if (Notification.permission === "granted") {
    const options: NotificationOptions = {
      body: description,
      // icon: "/path/to/icon.png",
    };
    new Notification(title, options);
  } else {
    console.log("Notification permission not granted.");
  }
}

const TodoTimer = ({
  todos,
  date,
  active_task,
}: { todos: Task[]; date: any; active_task: Task }) => {
  const dispatch = useAppDispatch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  let progress = 0;

  const pauseTodo = todos.find((todo) => todo.status === "paused");

  useBeforeUnload(
    React.useCallback(() => {
      const elapsedTime = active_task.start_at
        ? Date.now() - new Date(active_task.start_at).getTime()
        : 0;
      const newTotalTime = active_task.total_time + elapsedTime;

      dispatch(
        updateTask({
          id: active_task.id,
          key: date.timestamp,
          updated_task: {
            status: "paused",
            start_at: null,
            total_time: newTotalTime,
          },
        }),
      );
    }, [active_task]),
  );

  useEffect(() => {
    if (active_task) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          const elapsedTime = active_task.start_at
            ? Date.now() - new Date(active_task.start_at).getTime()
            : 0;
          const newTotalTime = active_task?.total_time + elapsedTime;

          const updatedTotalTime = newTotalTime;

          // Menghitung progress (berapa banyak lingkaran yang terisi)
          progress = Math.min(
            (updatedTotalTime / TWENTY_FIVE_MINUTES) * circumference,
            circumference,
          );

          const timer = new Date(updatedTotalTime || active_task?.total_time)
            .toISOString()
            .substr(14, 5);

          // Update tampilan progress menggunakan getElementById
          const circleElement = document.getElementById("progress-circle");

          if (circleElement) {
            // Update strokeDashoffset langsung
            circleElement.setAttribute(
              "stroke-dashoffset",
              (circumference - progress).toString(),
            );
          }

          const timerFields = document.querySelectorAll(".todo-progress");
          for (const timerField of timerFields) {
            if (timerField instanceof HTMLDivElement) {
              timerField.innerHTML = timer;
            }
          }

          document.title = `${timer} ${active_task.title ? active_task.title.slice(0, 10) : "Untitled"}`;

          // Cek apakah timer sudah mencapai 25 menit
          if (updatedTotalTime >= TWENTY_FIVE_MINUTES) {
            clearInterval(timerRef.current); // Berhenti menjalankan timer
            const notif = {
              title: "Saatnya istirahat",
              description: active_task.title + " has completed",
            };
            showNotification(notif.title, notif.description);

            const todo = active_task as Task;
            const sessionData = todo.sessions ? [...todo.sessions] : []; // Copy the old sessions array, or start with an empty array
            const elapsedTime = todo.start_at
              ? Date.now() - new Date(todo.start_at).getTime()
              : 0;
            const newTotalTime = todo.total_time + elapsedTime;

            // Add the new session to the copied array
            sessionData.push({
              date: new Date().toISOString(),
              time: newTotalTime as number,
            });

            dispatch(
              updateSessionTask({
                id: active_task.id as number,
                key: date.timestamp as number,
                updated_session_task: sessionData,
              }),
            );
          }
        }, 1000); // Timer berjalan setiap detik
      }
    } else {
      // Clear timer jika tidak ada active todo
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        document.title = "Todo";
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        document.title = "Todo";
      }
    };
  }, [todos]); // Update setiap todos berubah

  return (
    <div className="flex items-start justify-between gap-x-3 pt-4 px-4 md:gap-x-5 mt-5 min-h-[152px]">
      <div className="flex items-start gap-6 md:gap-8">
        <div
          style={{ animationDelay: `0.05s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] w-[90px] rounded-full bg-white dark:bg-white/40 backdrop-blur-md text-text dark:text-darkText shadow"
        >
          <div className="relative">
            <div className="absolute flex h-full w-full justify-center">
              <div className="flex flex-col justify-center">
                <button className="z-10 mx-auto cursor-pointer text-green-500 hidden">
                  <Coffee />
                </button>
                {(pauseTodo || active_task) && (
                  <button
                    onClick={
                      active_task
                        ? () => {
                            const elapsedTime = active_task.start_at
                              ? Date.now() -
                                new Date(active_task.start_at).getTime()
                              : 0;
                            const newTotalTime =
                              active_task.total_time + elapsedTime;

                            dispatch(
                              updateTask({
                                id: active_task.id,
                                key: date.timestamp,
                                updated_task: {
                                  status: "paused",
                                  start_at: null,
                                  total_time: newTotalTime,
                                },
                              }),
                            );
                          }
                        : () =>
                            dispatch(
                              updateTask({
                                id: pauseTodo?.id,
                                key: date.timestamp,
                                updated_task: {
                                  start_at: new Date().toISOString(),
                                  status: "progress",
                                },
                              }),
                            )
                    }
                    style={{ animationDelay: `0.1s` }}
                    className={`transition-all duration-500 ease-in-out animate-roll-reveal [animation-fill-mode:backwards] z-10 ${active_task ? "text-orange-300" : "text-green-500"} mx-auto`}
                  >
                    {active_task ? (
                      <Pause
                        style={{ animationDelay: `0.3s` }}
                        className={cn(
                          "h-6 w-6",
                          active_task &&
                            "animate-roll-reveal [animation-fill-mode:backwards]",
                        )}
                      />
                    ) : (
                      pauseTodo && (
                        <Play
                          className={cn(
                            "h-6 w-6",
                            !active_task &&
                              "animate-slide-top [animation-fill-mode:backwards]",
                          )}
                        />
                      )
                    )}
                  </button>
                )}
                <div
                  style={{ animationDelay: `0.1s` }}
                  className="animate-roll-reveal [animation-fill-mode:backwards] todo-progress mx-auto flex justify-center font-bold"
                >
                  00:00
                </div>
              </div>
            </div>
            <div
              style={{ animationDelay: `0.1s` }}
              className="animate-roll-reveal [animation-fill-mode:backwards] text-green-400"
            >
              <svg
                width={90}
                height={90}
                xmlns="http://www.w3.org/2000/svg"
                className="-rotate-90"
              >
                <circle
                  cx={45}
                  cy={45}
                  r={40}
                  fill="none"
                  className="stroke-[#E0E7F1] dark:stroke-[#2c312b]"
                  strokeWidth={5}
                  strokeDasharray="251.32741228718345"
                />
                <circle
                  id="progress-circle" // ID untuk mempermudah akses
                  cx={45}
                  cy={45}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={5}
                  strokeDasharray={circumference}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />
              </svg>
            </div>
          </div>
        </div>

        {active_task && (
          <div
            style={{ animationDelay: `0.05s` }}
            className="animate-roll-reveal [animation-fill-mode:backwards] relative w-full"
          >
            <div className="font-bold md:text-xl line-clamp-1 max-w-[200px]">
              {active_task?.title !== "" ? active_task.title : "Untitled"}
            </div>
            <div className="h-3">
              <div className="absolute flex gap-1">
                {new Array(16).fill(null).map((_, index) => (
                  <button
                    onClick={() => {
                      dispatch(
                        updateTask({
                          id: active_task.id,
                          key: date.timestamp,
                          updated_task: {
                            target_sessions: index + 1,
                          },
                        }),
                      );
                    }}
                    key={index} // Gunakan key untuk identifikasi unik
                    type="button"
                    style={{ animationDelay: `${index * 0.03}s` }}
                    className={cn(
                      "h-3 w-3 shrink-0 cursor-pointer rounded-full ",
                      active_task?.sessions?.length >= index + 1
                        ? "bg-green-400"
                        : active_task?.target_sessions >= index + 1
                          ? "bg-gray-400"
                          : "bg-gray-200 hidden group-hover:block  transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="mt-1 text-sm">
              {active_task?.sessions?.length} dari{" "}
              {active_task?.target_sessions} target sesi
            </div>
            <div className="mt-3 flex w-full flex-col gap-2 pr-14 md:flex-row md:items-center md:pr-0">
              <button
                onClick={() =>
                  dispatch(
                    updateTask({
                      id: active_task.id,
                      key: date.timestamp,
                      updated_task: {
                        status: "done",
                        end_at: new Date().toISOString(),
                      },
                    }),
                  )
                }
                className="items-center justify-center rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex h-auto gap-1 p-1 py-1 text-sm bg-green-400 text-white hover:bg-green-500"
              >
                <Check className="h5 w-5" />
                Mark as Done
              </button>
              <button className="hidden items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md flex h-auto gap-1 p-1 py-1 text-sm bg-transparent text-foreground hover:bg-red-600 hover:text-white">
                <div className="mr-1 px-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-ban"
                  >
                    <circle cx={12} cy={12} r={10} />
                    <path d="m4.9 4.9 14.2 14.2" />
                  </svg>
                </div>
                Cancel
              </button>
            </div>
            <div className="flex gap-2 invisible">
              <button
                className="items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-destructive-foreground flex h-auto gap-1 bg-orange-600 px-2 py-1 hover:bg-orange-500"
                data-testid="break-5-mins"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-coffee"
                >
                  <path d="M10 2v2" />
                  <path d="M14 2v2" />
                  <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
                  <path d="M6 2v2" />
                </svg>
                5 mins
              </button>
              <button
                className="items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-destructive-foreground flex h-auto gap-1 bg-orange-600 px-2 py-1 hover:bg-orange-500"
                data-testid="break-15-mins"
              >
                <div className="flex gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-coffee"
                  >
                    <path d="M10 2v2" />
                    <path d="M14 2v2" />
                    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
                    <path d="M6 2v2" />
                  </svg>
                </div>
                15 mins
              </button>
            </div>
          </div>
        )}
      </div>

      {active_task ? (
        <div
          style={{ animationDelay: `0.3s` }}
          className={cn(
            "sm:block hidden relative w-[80px]",
            active_task &&
              "animate-roll-reveal [animation-fill-mode:backwards]",
          )}
        >
          <img src="/rocket.gif" alt="Rocket" className="animate-pulse" />
        </div>
      ) : (
        <div
          style={{ animationDelay: `0.1s` }}
          className={cn(
            "sm:block hidden relative w-[80px]",
            !active_task && "animate-slide-top [animation-fill-mode:backwards]",
          )}
        >
          <img src="/sleep.gif" />
        </div>
      )}
    </div>
  );
};

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isWeekend,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";

const CalendarMonth = ({ total_sessions }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Fungsi untuk memperbarui kalender
  const updateCalendar = () => {
    // Menghitung tanggal mulai dan akhir bulan di waktu lokal
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);

    // Mengambil semua hari dalam bulan ini
    const days = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth,
    });

    // Menghitung hari pertama bulan ini
    const firstDayOfMonth = getDay(startOfCurrentMonth);

    // Menyesuaikan hari pertama kalender, agar selalu dimulai dari Senin
    // Jika firstDayOfMonth adalah 0 (Minggu), kita anggap sebagai 7 (Sabtu),
    // dan kita sesuaikan paddingnya.
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Menambahkan padding untuk hari-hari sebelum tanggal 1 bulan
    const paddedDays = Array(adjustedFirstDay).fill(null).concat(days);

    setDaysInMonth(paddedDays);
  };

  // Update kalender saat currentMonth berubah
  useEffect(() => {
    updateCalendar();
  }, [currentMonth]);

  // Menangani navigasi bulan berikutnya dan sebelumnya
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <div className="bg-background">
      <div className="flex justify-start items-center gap-3 items-center mb-4">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          onClick={handlePreviousMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleNextMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-10">
        <div className="w-full grid grid-cols-7 items-center justify-center gap-3">
          {/* Header hari (Senin, Selasa, Rabu, dll.) */}
          <div className="rounded-t border-b text-center font-bold">Mo</div>
          <div className="rounded-t border-b text-center font-bold">Tu</div>
          <div className="rounded-t border-b text-center font-bold">We</div>
          <div className="rounded-t border-b text-center font-bold">Th</div>
          <div className="rounded-t border-b text-center font-bold">Fr</div>
          <div className="rounded-t border-b text-center font-bold">Sa</div>
          <div className="rounded-t border-b text-center font-bold">Su</div>

          {daysInMonth.map((day, index) => {
            const dataKey = day ? format(day, "yyyy-MM-dd") : null;
            const sessions = total_sessions[dataKey] || 0;
            return (
              <div
                key={index}
                className={`rounded-lg cursor-pointer
            ${day ? "" : "bg-transparent"}  // Handle empty cells
            ${isToday(day) ? "" : ""}
            ${isWeekend(day) ? "" : ""}`}
              >
                <div className="text-center">{day ? format(day, "d") : ""}</div>
                {day && (
                  <button data-state="closed">
                    <FocusDisplay total_sessions={sessions} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="w-full max-w-[240px] rounded bg-gray-50 p-5 dark:bg-gray-800">
          <div className="">Perisai fokus</div>
          <hr className="my-3" />
          <FocusList />
        </div>
      </div>
    </div>
  );
};

const CalendarWeek = ({ total_sessions, streak_data }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Fungsi untuk memperbarui kalender

  const updateCalendar = () => {
    // Tanggal hari ini
    const today = new Date();

    // Awal dan akhir minggu ini
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Senin sebagai awal minggu
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });

    // Awal dan akhir minggu lalu
    const startOfLastWeek = startOfWeek(subWeeks(today, 1), {
      weekStartsOn: 1,
    });
    const endOfLastWeek = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

    // Mengambil semua hari dari minggu lalu dan minggu ini
    const lastWeekDays = eachDayOfInterval({
      start: startOfLastWeek,
      end: endOfLastWeek,
    });

    const thisWeekDays = eachDayOfInterval({
      start: startOfThisWeek,
      end: endOfThisWeek,
    });

    // Gabungkan minggu lalu dan minggu ini
    const twoWeeksDays = [...lastWeekDays, ...thisWeekDays];

    // Update state dengan 2 minggu tersebut
    setDaysInMonth(twoWeeksDays);
  };

  // Update kalender saat currentMonth berubah
  useEffect(() => {
    updateCalendar();
  }, [currentMonth]);

  const today = format(new Date(), "yyyy-MM-dd");
  const todays = total_sessions[today] || 0;
  return (
    <div className="bg-background">
      <div className="flex gap-10">
        <div>
          <div className="flex items-center py-5">
            <div>
              <div className="text-xl">
                {streak_data?.current_streak} day streak
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-400">
                Your longest streak is {streak_data?.longest_streak} days
              </div>
            </div>
            <div className="ml-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={84}
                height={84}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-flame-kindling text-orange-400"
              >
                <path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z" />
                <path d="m5 22 14-4" />
                <path d="m5 18 14 4" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-7 justify-center gap-5 rounded-lg bg-orange-400 p-2 px-3 text-white">
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
            <div>Su</div>

            {daysInMonth.map((day, index) => {
              const dataKey = day ? format(day, "yyyy-MM-dd") : null;
              const sessions = total_sessions[dataKey] || 0;
              const isNow = new Date() >= day;

              const _day = day ? format(day, "d") : "";
              return (
                <React.Fragment key={index}>
                  <div className="group flex flex-col items-center gap-y-2 relative transition-all duration-500 ease-in-out">
                    <div
                      key={index}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        sessions > 0
                          ? " bg-green-500 text-white"
                          : " bg-red-500 text-white",
                        isWeekend(day) && sessions === 0
                          ? " bg-gray-300 text-black"
                          : isWeekend(day) && sessions > 0
                            ? "bg-green-600 text-white"
                            : "",
                        !isNow && " bg-background text-foreground",
                      )}
                    >
                      <span className="group-hover:block hidden">{_day}</span>
                      {isNow && (
                        <span className="group-hover:hidden">
                          {sessions > 0 ? <Check /> : <X />}
                        </span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            *Weekend is not affecting streak calculation
          </div>
        </div>
      </div>
    </div>
  );
};

const FocusDisplay = ({ total_sessions, isBtn }) => {
  return <div>{getFocusComponent(total_sessions, isBtn)}</div>;
};

// Tipe data untuk log aktivitas
interface GlobalActivityLog {
  timestamp: string;
  action:
    | "created"
    | "started"
    | "paused"
    | "resumed"
    | "completed"
    | "deleted"
    | "edited";
  taskId: number;
  taskTitle?: string;
  details?: string;
}

// Tipe data untuk task
// interface Task {
//   id: number;
//   title: string;
//   status: "paused" | "running" | "completed" | "deleted";
//   category: string;
//   start_at?: string;
//   end_at?: string;
//   updated_at?: string;
// }

// const TaskManager = () => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [activityLogs, setActivityLogs] = useState<GlobalActivityLog[]>([]);
//
//   // Menambahkan log aktivitas
//   const addActivityLog = (
//     action:
//       | "created"
//       | "started"
//       | "paused"
//       | "resumed"
//       | "completed"
//       | "deleted"
//       | "edited",
//     taskId: number,
//     taskTitle?: string,
//     details?: string,
//   ) => {
//     const newLog: GlobalActivityLog = {
//       timestamp: new Date().toISOString(),
//       action,
//       taskId,
//       taskTitle,
//       details,
//     };
//     setActivityLogs((prevLogs) => [...prevLogs, newLog]);
//   };
//
//   // Membuat task baru
//   const createTask = (title: string, category: string) => {
//     const newTask: Task = {
//       id: Date.now(),
//       title,
//       status: "paused",
//       category,
//     };
//     setTasks((prevTasks) => [...prevTasks, newTask]);
//     addActivityLog("created", newTask.id, newTask.title);
//   };
//
//   // Memulai task
//   const startTask = (taskId: number) => {
//     const updatedTasks = tasks.map((task) =>
//       task.id === taskId
//         ? { ...task, status: "running", start_at: new Date().toISOString() }
//         : task,
//     );
//     setTasks(updatedTasks);
//     addActivityLog(
//       "started",
//       taskId,
//       updatedTasks.find((task) => task.id === taskId)?.title || "",
//     );
//   };
//
//   // Menunda task (pause)
//   const pauseTask = (taskId: number) => {
//     const updatedTasks = tasks.map((task) =>
//       task.id === taskId
//         ? { ...task, status: "paused", end_at: new Date().toISOString() }
//         : task,
//     );
//     setTasks(updatedTasks);
//     addActivityLog(
//       "paused",
//       taskId,
//       updatedTasks.find((task) => task.id === taskId)?.title || "",
//     );
//   };
//
//   // Melanjutkan task (resume)
//   const resumeTask = (taskId: number) => {
//     const updatedTasks = tasks.map((task) =>
//       task.id === taskId
//         ? { ...task, status: "running", start_at: new Date().toISOString() }
//         : task,
//     );
//     setTasks(updatedTasks);
//     addActivityLog(
//       "resumed",
//       taskId,
//       updatedTasks.find((task) => task.id === taskId)?.title || "",
//     );
//   };
//
//   // Menyelesaikan task
//   const completeTask = (taskId: number) => {
//     const updatedTasks = tasks.map((task) =>
//       task.id === taskId
//         ? { ...task, status: "completed", end_at: new Date().toISOString() }
//         : task,
//     );
//     setTasks(updatedTasks);
//     addActivityLog(
//       "completed",
//       taskId,
//       updatedTasks.find((task) => task.id === taskId)?.title || "",
//     );
//   };
//
//   // Menghapus task
//   const deleteTask = (taskId: number) => {
//     const updatedTasks = tasks.filter((task) => task.id !== taskId);
//     setTasks(updatedTasks);
//     addActivityLog("deleted", taskId, "", "Task deleted");
//   };
//
//   // Mengedit task
//   const editTask = (taskId: number, newTitle: string) => {
//     const updatedTasks = tasks.map((task) =>
//       task.id === taskId
//         ? { ...task, title: newTitle, updated_at: new Date().toISOString() }
//         : task,
//     );
//     setTasks(updatedTasks);
//     addActivityLog("edited", taskId, newTitle);
//   };
//
//   return (
//     <div>
//       <h1>Task Manager with Activity Log</h1>
//
//       <button onClick={() => createTask("New Task", "work")}>
//         Create New Task
//       </button>
//
//       <div>
//         <h2>Tasks</h2>
//         {tasks.map((task) => (
//           <div key={task.id}>
//             <h3>{task.title}</h3>
//             <p>Status: {task.status}</p>
//             <button
//               onClick={() => startTask(task.id)}
//               disabled={task.status === "running"}
//             >
//               Start
//             </button>
//             <button
//               onClick={() => pauseTask(task.id)}
//               disabled={task.status !== "running"}
//             >
//               Pause
//             </button>
//             <button
//               onClick={() => resumeTask(task.id)}
//               disabled={task.status !== "paused"}
//             >
//               Resume
//             </button>
//             <button
//               onClick={() => completeTask(task.id)}
//               disabled={task.status === "completed"}
//             >
//               Complete
//             </button>
//             <button onClick={() => deleteTask(task.id)}>Delete</button>
//             <button onClick={() => editTask(task.id, "Updated Task Title")}>
//               Edit
//             </button>
//           </div>
//         ))}
//       </div>
//
//       <div>
//         <h2>Activity Logs</h2>
//         <ul>
//           {activityLogs.map((log, index) => (
//             <li key={index}>
//               <p>
//                 {log.timestamp}: {log.action} - Task ID: {log.taskId}{" "}
//                 {log.taskTitle && `(${log.taskTitle})`}{" "}
//                 {log.details && `- ${log.details}`}
//               </p>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

const focusSessions = [
  {
    minFocus: 16,
    sessions: "≥ 16 sesi fokus",
    styles: {
      outerBorder:
        "border-white bg-gradient-to-r from-blue-500 to-blue-300 ring-4 ring-orange-400",
      middleBorder:
        "border-white bg-gradient-to-r from-yellow-300 to-yellow-100",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    minFocus: 12,
    sessions: "≥ 12 sesi fokus",
    styles: {
      outerBorder: "border-blue-500 bg-gradient-to-r from-blue-500 to-blue-300",
      middleBorder:
        "border-white bg-gradient-to-r from-yellow-300 to-yellow-100",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    minFocus: 4,
    sessions: "≥ 4 sesi fokus",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder:
        "border-white bg-gradient-to-r from-yellow-300 to-yellow-100",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    minFocus: 1,
    sessions: "≥ 1 sesi fokus",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder: "border-gray-300",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    minFocus: 0,
    sessions: "0 sesi fokus",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder: "border-gray-300",
      innerBorder: "border-gray-300",
    },
  },
];

const getFocusComponent = (focusValue, isBtn) => {
  // Cari data yang cocok berdasarkan nilai fokus
  const focusData = focusSessions.find((item) => focusValue >= item.minFocus);

  // Jika tidak ada data yang cocok, return null (atau fallback)
  if (!focusData) return null;

  if (isBtn)
    return (
      <div className="flex items-center gap-2 ">
        <div>
          <div
            className={`shrink-0 rounded-full border-2 p-1 ${focusData.styles.outerBorder} transition-all duration-500 ease-in-out`}
          >
            <div
              className={`rounded-full border-2 p-1 ${focusData.styles.middleBorder} transition-all duration-500 ease-in-out`}
            >
              <div
                className={`rounded-full border-2 h-1.5 w-1.5 ${focusData.styles.innerBorder} transition-all duration-500 ease-in-out`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  // Return JSX sesuai gaya yang ditemukan
  return (
    <div className="flex items-center gap-2">
      <div>
        <div
          className={`shrink-0 rounded-full border-2 p-1.5 ${focusData.styles.outerBorder}`}
        >
          <div
            className={`rounded-full border-2 p-1.5 ${focusData.styles.middleBorder}`}
          >
            <div
              className={`rounded-full border-2 h-2 w-2 ${focusData.styles.innerBorder}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FocusList = () => {
  return (
    <div>
      {focusSessions.map((item, index) => (
        <div key={index} className="mb-2 flex items-center gap-3 ">
          <div>
            <div
              className={`shrink-0 rounded-full border-2 p-1.5 ${item.styles.outerBorder}`}
            >
              <div
                className={`rounded-full border-2 p-1.5 ${item.styles.middleBorder}`}
              >
                <div
                  className={`rounded-full border-2 h-2 w-2 ${item.styles.innerBorder}`}
                />
              </div>
            </div>
          </div>
          <div>{item.sessions}</div>
        </div>
      ))}
    </div>
  );
};

type WeeklyBadgeProps = {
  total_sessions: number; // Total sesi minggu ini
};

const WeeklyBadge: React.FC<WeeklyBadgeProps> = ({ total_sessions }) => {
  // Tentukan tingkat lencana berdasarkan sesi
  const getBadgeData = (sessions: number) => {
    if (sessions >= 48) {
      return {
        label: "Master Fokus",
        color: "from-red-500 to-red-700",
        emoji: "🔥",
      };
    } else if (sessions >= 40) {
      return {
        label: "Ahli Fokus",
        color: "from-orange-500 to-orange-600",
        emoji: "🚀",
      };
    } else if (sessions >= 32) {
      return {
        label: "Pro Fokus",
        color: "from-yellow-500 to-yellow-600",
        emoji: "🌟",
      };
    } else if (sessions >= 24) {
      return {
        label: "Fokus Tinggi",
        color: "from-green-500 to-green-600",
        emoji: "💪",
      };
    } else if (sessions >= 16) {
      return {
        label: "Fokus Bagus",
        color: "from-blue-500 to-blue-600",
        emoji: "🎯",
      };
    } else if (sessions >= 8) {
      return {
        label: "Awal Fokus",
        color: "from-purple-500 to-purple-600",
        emoji: "✨",
      };
    } else {
      return {
        label: "Mulai Fokus",
        color: "from-gray-400 to-gray-500",
        emoji: "🌀",
      };
    }
  };

  const { label, color, emoji } = getBadgeData(total_sessions);

  return (
    <div
      className={`flex-shrink-0 relative overflow-hidden bg-gradient-to-r ${color} rounded-lg w-full max-w-[250px] mx-auto shadow-lg`}
    >
      <svg
        className="absolute bottom-0 left-0 mb-8"
        viewBox="0 0 375 283"
        fill="none"
        style={{ transform: "scale(1.5)", opacity: "0.1" }}
      >
        <rect
          x="159.52"
          y={175}
          width={152}
          height={152}
          rx={8}
          transform="rotate(-45 159.52 175)"
          fill="white"
        />
        <rect
          y="107.48"
          width={152}
          height={152}
          rx={8}
          transform="rotate(-45 0 107.48)"
          fill="white"
        />
      </svg>
      <div className="relative pt-10 px-10 flex items-center justify-center">
        <div
          className="block absolute w-48 h-48 bottom-0 left-0 -mb-24 ml-3"
          style={{
            background: "radial-gradient(black, transparent 60%)",
            transform: "rotate3d(0, 0, 1, 20deg) scale3d(1, 0.6, 1)",
            opacity: "0.2",
          }}
        />
        {/* Icon */}
        <div className="relative mb-4 ">
          <div
            className={`absolute inset-0 animate-pulse bg-gradient-to-r ${color} rounded-full blur-lg opacity-75`}
          ></div>
          <div
            className={`relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-b ${color} p-4 shadow-xl ring ring-gray-200`}
          >
            <span className="text-4xl">{emoji}</span>
          </div>
        </div>
      </div>
      <div className="relative text-white px-6 pb-6 mt-6 w-[200px]">
        <span className="block opacity-75 -mb-1">{label}</span>
        <div className="flex justify-between">
          <span className="block font-semibold text-xl">
            {total_sessions} sesi hari ini
          </span>
        </div>
        <div className="relative w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden mt-4">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
            style={{ width: `${(total_sessions / 48) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

import { z } from "zod";
import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

const TaskSchema = z.object({
  id: z.number().default(Date.now()),
  intent: z.string(),
  status: z
    .enum(["draft", "paused", "progress", "done", "cancel"])
    .default("draft"),
  type: z.enum(["task", "checklist", "note"]).default("task"),
  title: z.string().optional().default(""),
  category: z
    .string()
    .optional()
    .transform((value) => value ?? ""),
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
  sub_tasks: z
    .array(
      z.object({
        id: z.string(),
        checked: z
          .string()
          .default("off")
          .transform((value) => (value === "on" ? true : false)),
        title: z.string().default(""),
        category: z
          .string()
          .optional()
          .transform((value) => value ?? ""),
      }),
    )
    .optional(),
});
import { useDebounceFetcher } from "@/lib/use-debounce-fetcher.ts";

function transformedSubTasks(task) {
  if (!task) return [];
  const data =
    task?.sub_tasks?.length > 0
      ? task.sub_tasks.map((subTask) => ({
          ...subTask,
          checked: subTask.checked ? "on" : "off", // Transformasi boolean ke "on"/"off"
        }))
      : [];
  return data;
}
const TodoForm: React.FC = ({ task, index, date, active_task }) => {
  const todo = task;
  const submit = useSubmit();
  const routeAction = `/daily?day=${date.timestamp}`;

  const totalSessionTime = todo.sessions.reduce(
    (total_time, session) => total_time + session.time,
    0,
  );
  const today = new Date();
  const yesterday = new Date(date.timestamp);
  today.setHours(0, 1, 0, 0);
  const todayTimestamp = today.getTime();
  const isYesterday = todayTimestamp < date.timestamp;
  const is_today = todayTimestamp === date.timestamp;

  const dispatch = useAppDispatch();
  return (
    <div
      style={{ animationDelay: `${index * 0.1}s` }}
      className={cn(
        "relative animate-roll-reveal [animation-fill-mode:backwards]  inset-0 w-full transition-all ease-in-out duration-500",
      )}
    >
      <Collapsible defaultOpen={true}>
        <div
          className={cn(
            "relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 py-2 mb-1.5 bg-gray-50 rounded-lg shadow-md",
            active_task && todo.status !== "progress"
              ? "bg-white/40 text-muted-foreground opacity-80"
              : active_task && todo.status === "progress"
                ? "bg-orange-100 dark:bg-orange-400 bg-gradient-to-l from-gray-50 dark:from-orange-950 opacity-100"
                : todo.status === "done"
                  ? "bg-green-100 dark:bg-green-900 bg-gradient-to-l via-white dark:via-black from-green-50 dark:from-green-950 opacity-100"
                  : "",
          )}
        >
          <div
            className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
            style={{ touchAction: "none" }}
            draggable="true"
          >
            <GripVertical className="absolute top-1/2 transform -translate-y-1/2 left-2  z-20 h-5 w-5 mt-1" />
          </div>
          <div className="mr-1">
            {todo.status === "done" && (
              <CircleCheckBig className="absolute top-0 -right-4 w-28 h-28 text-green-500 dark:text-green-400 opacity-30" />
            )}
            <div className="flex gap-2 pl-0 pt-1">
              {is_today ? (
                <React.Fragment>
                  {todo.status === "done" ? (
                    <CircleCheckBig className="w-6 h-6 text-green-500 rounded-full" />
                  ) : todo.start_at ? (
                    <button
                      onClick={() => {
                        const elapsedTime = todo.start_at
                          ? Date.now() - new Date(todo.start_at).getTime()
                          : 0;
                        const newTotalTime = todo.total_time + elapsedTime;

                        dispatch(
                          updateTask({
                            id: todo.id,
                            key: date.timestamp,
                            updated_task: {
                              status: "paused",
                              start_at: null,
                              total_time: newTotalTime,
                            },
                          }),
                        );
                      }}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500  text-white",
                        active_task &&
                          "animate-roll-reveal [animation-fill-mode:backwards]",
                      )}
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateTask({
                            id: todo.id,
                            key: date.timestamp,
                            updated_task: {
                              title: todo.title,
                              status: "progress",
                              start_at: new Date().toISOString(),
                            },
                          }),
                        )
                      }
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 pl-0.5 text-white",
                        active_task &&
                          "animate-roll-reveal [animation-fill-mode:backwards]",
                      )}
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  )}
                </React.Fragment>
              ) : (
                <button className="h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 ">
                  <ArrowRight />
                </button>
              )}
            </div>
          </div>
          <div className="w-full group">
            <div className="relative flex w-full items-start">
              <AutosizeTextarea
                key={`title-${todo.id}`}
                name="title"
                defaultValue={todo.title}
                onBlur={(e) => {
                  dispatch(
                    updateTask({
                      id: task.id,
                      key: date.timestamp,
                      updated_task: {
                        title: e.target.value,
                      },
                    }),
                  );
                }}
                style={{ resize: "none" }}
                className="w-full bg-transparent p-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
                minHeight={20}
                maxHeight={800}
                placeholder="Untitled"
                autoComplete="off"
              />
              <div className="ml-auto flex items-center gap-2 pr-2 pt-2">
                <CollapsibleTrigger data-state="open">
                  <ChevronsUpDown className="w-4 h-4" />
                  <span className="sr-only">Toggle</span>
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => dispatch(addSubTask({ id: todo.id }))}
                      >
                        <Plus /> Add Subtask
                      </DropdownMenuItem>
                      {todo.status !== "done" && (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() =>
                            dispatch(
                              updateTask({
                                id: task.id,
                                key: date.timestamp,
                                updated_task: {
                                  title: todo.title,
                                  status: "done",
                                },
                              }),
                            )
                          }
                        >
                          <CircleCheckBig className="w-5 h-5" />
                          Mark as done
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />

                      <AlertDialogProvider>
                        <DeleteTask
                          task_id={todo.id}
                          task_title={todo.title}
                          timestamp={date.timestamp}
                        />
                      </AlertDialogProvider>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <div className="relative ml-1 block py-0.5 ">
                <div className="flex items-end">
                  <div className="flex items-center justify-start gap-1 h-4">
                    {new Array(16).fill(null).map((_, index) => (
                      <button
                        onClick={() => {
                          dispatch(
                            updateTask({
                              id: task.id,
                              key: date.timestamp,
                              updated_task: {
                                title: todo.title,
                                target_sessions: index + 1,
                              },
                            }),
                          );
                        }}
                        key={index} // Gunakan key untuk identifikasi unik
                        type="button"
                        style={{ animationDelay: `${index * 0.03}s` }}
                        className={cn(
                          "h-[12px] w-[12px] shrink-0 cursor-pointer rounded-full ",
                          todo?.sessions?.length >= index + 1
                            ? "bg-green-400"
                            : todo?.target_sessions >= index + 1
                              ? "bg-gray-500"
                              : "bg-gray-300  hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                        )}
                      />
                    ))}
                    <button
                      style={{ animationDelay: `${16 * 0.03}s` }}
                      onClick={() => {
                        dispatch(
                          updateTask({
                            id: task.id,
                            key: date.timestamp,
                            updated_task: {
                              title: todo.title,
                              target_sessions: 0,
                            },
                          }),
                        );
                      }}
                      className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-red-400 text-white flex items-center justify-center hidden group-hover:flex  animate-roll-reveal [animation-fill-mode:backwards] "
                    >
                      <X />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-x-1.5 pr-2 text-sm mt-1">
                  <div className={todo?.start_at ? "todo-progress" : ""}>
                    {new Date(totalSessionTime).toISOString().substr(11, 8)}
                  </div>
                  <SelectDemo task={task} date={date} />
                </div>
                <div className="flex">
                  <div className="hidden">
                    <button className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 ">
                      Move to today <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CollapsibleContent className="CollapsibleContent space-y-2 text-text font-base mt-1">
          {task.sub_tasks?.map((subtask, index) => {
            return (
              <div
                key={index}
                className={cn(
                  "ml-5 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 bg-gray-50 rounded-lg py-2 mb-1.5 shadow-md",
                  active_task && todo.status !== "progress"
                    ? "bg-white/40 text-muted-foreground opacity-80"
                    : subtask.checked
                      ? "bg-green-100 dark:bg-green-900 bg-gradient-to-l via-white dark:via-black from-green-50 dark:from-green-950 opacity-100"
                      : "opacity-100",
                )}
              >
                {subtask.checked && (
                  <CircleCheckBig className="absolute top-0 -right-4 w-28 h-28 text-green-500 dark:text-green-400 opacity-30" />
                )}
                <div
                  className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
                  style={{ touchAction: "none" }}
                  draggable="true"
                >
                  <GripVertical className="absolute top-1/2 transform -translate-y-1/2 left-2  z-20 h-5 w-5 mt-1" />
                </div>
                <div className="ml-1">
                  <div className="flex gap-2 pl-0 pt-1 mr-2 mt-1">
                    <input
                      type="hidden"
                      defaultValue={subtask.id}
                      key={`sub_tasks[${index}].id`}
                      name={`sub_tasks[${index}].id`}
                      id={`sub_tasks[${index}].id`}
                    />
                    <input
                      type="checkbox"
                      defaultChecked={subtask.checked}
                      onChange={(e) => {
                        dispatch(
                          updateSubTask({
                            id: task.id,
                            key: date.timestamp,
                            sub_task_id: subtask.id,
                            updated_sub_task: {
                              title: subtask.title,
                              checked: e.target.checked,
                            },
                          }),
                        );
                      }}
                      className="accent-green-400 scale-150"
                      key={`sub_tasks[${index}].checked`}
                      name={`sub_tasks[${index}].checked`}
                      id={`sub_tasks[${index}].checked`}
                    />
                  </div>
                </div>
                <div className="w-full">
                  <div className="relative flex w-full items-start">
                    <AutosizeTextarea
                      defaultValue={subtask.title}
                      key={`sub_tasks[${index}].title`} // Dinamis berdasarkan index
                      name={`sub_tasks[${index}].title`} // Dinamis berdasarkan index
                      id={`sub_tasks[${index}].title`} // Dinamis ber
                      onBlur={(e) => {
                        dispatch(
                          updateSubTask({
                            id: task.id,
                            key: date.timestamp,
                            sub_task_id: subtask.id,
                            updated_sub_task: {
                              title: e.target.value,
                            },
                          }),
                        );
                      }}
                      style={{ resize: "none" }}
                      className="w-full bg-transparent p-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
                      maxHeight={800}
                      placeholder="Untitled"
                      autoComplete="off"
                    />
                    <div className="ml-auto flex items-center gap-2 pr-2 pt-2">
                      <div className="">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <EllipsisVertical className="w-4 h-4 " />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialogProvider>
                              <DeleteTask
                                task_id={task.id}
                                sub_task_id={subtask.id}
                                task_title={todo.title}
                                sub_task_title={subtask.title}
                                timestamp={date.timestamp}
                              />
                            </AlertDialogProvider>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="relative ml-1 block py-0.5 md:block">
                      <div className="flex items-end">
                        <div className="flex items-center gap-x-1.5 ml-auto">
                          <SelectDemo
                            task={task}
                            subtask={subtask}
                            date={date}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/*<pre className="text-xs">{JSON.stringify(todo, null, 2)}</pre>*/}
    </div>
  );
};

// {task && <input {...getInputProps(fields.id, { type: "hidden" })} />}
// {task && <input {...getInputProps(fields.status, { type: "hidden" })} />}
// {task && (
//   <input {...getInputProps(fields.target_sessions, { type: "hidden" })} />
// )}
// {task && (
//   <input
//     {...getInputProps(fields.completed_sessions, { type: "hidden" })}
//   />
// )}
// <input
//   {...getInputProps(fields.intent, {
//     type: "hidden",
//   })}
// />
// {todos.map((todo, index) => {
//   const totalSessionTime = todo.sessions.reduce(
//     (total_time, session) => total_time + session.time,
//     0,
//   );
//   const today = new Date();
//   const yesterday = new Date(date.timestamp);
//   today.setHours(0, 1, 0, 0);
//   const todayTimestamp = today.getTime();
//   const isYesterday = todayTimestamp < date.timestamp;
//   const is_today = todayTimestamp === date.timestamp;
//   return (
//     <div
//       key={todo.id}
//       style={{ animationDelay: `${index * 0.1}s` }}
//       className={cn(
//         "relative animate-roll-reveal [animation-fill-mode:backwards]  inset-0 w-full transition-all ease-in-out duration-500",
//       )}
//     >
//       <Collapsible defaultOpen={true} className="">
//         <div
//           className={cn(
//             "relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 py-2 mb-3 bg-gray-50 rounded-lg",
//             active_task && todo.status !== "progress"
//               ? "bg-white/40 text-muted-foreground opacity-80"
//               : active_task && todo.status === "progress"
//                 ? "opacity-100"
//                 : todo.status === "done"
//                   ? ""
//                   : "",
//           )}
//         >
//           <div
//             className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
//             style={{ touchAction: "none" }}
//             draggable="true"
//           >
//             <GripVertical className="h-5 w-5" />
//           </div>
//           <div className="mr-1">
//             {todo.status === "done" && (
//               <CircleCheckBig className="absolute -top-5 -right-5 w-28 h-28 text-green-500 rounded-full opacity-40" />
//             )}
//             <div className="flex gap-2 pl-0 pt-1">
//               {is_today ? (
//                 <React.Fragment>
//                   {todo.status === "done" ? (
//                     <CircleCheckBig className="w-6 h-6 text-green-500 rounded-full" />
//                   ) : todo.start_at ? (
//                     <button
//                       onClick={() =>
//                         submit(
//                           {
//                             intent: "update-status-task",
//                             id: todo.id,
//                             status: "pause",
//                           },
//                           { action: routeAction, method: "POST" },
//                         )
//                       }
//                       className={cn(
//                         "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500  text-white",
//                         active_task &&
//                           "animate-roll-reveal [animation-fill-mode:backwards]",
//                       )}
//                     >
//                       <Pause className="h-5 w-5" />
//                     </button>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() =>
//                         submit(
//                           {
//                             intent: "update-status-task",
//                             id: todo.id,
//                             status: "progress",
//                           },
//                           { action: routeAction, method: "POST" },
//                         )
//                       }
//                       className={cn(
//                         "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 pl-0.5 text-white",
//                         active_task &&
//                           "animate-roll-reveal [animation-fill-mode:backwards]",
//                       )}
//                     >
//                       <Play className="h-5 w-5" />
//                     </button>
//                   )}
//                 </React.Fragment>
//               ) : (
//                 <button className="h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 ">
//                   <ArrowRight />
//                 </button>
//               )}
//             </div>
//           </div>
//           <div className="w-full">
//             <div className="relative flex w-full items-start">
//               <AutosizeTextarea
//                 onChange={(e) =>
//                   handleChange({ title: e.target.value }, todo.id)
//                 }
//                 style={{ resize: "none" }}
//                 className="w-full bg-transparent p-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
//                 defaultValue={todo.title}
//                 maxHeight={800}
//                 placeholder="Untitled"
//                 autoComplete="off"
//               />
//               <div className="ml-auto flex items-center gap-1 mr-1">
//                 <CollapsibleTrigger data-state="open">
//                   <ChevronsUpDown className="w-5 h-5  data-[state=open]:hidden block" />
//                   <X className="w-5 h-5 data-[state=open]:block hidden" />
//                   <span className="sr-only">Toggle</span>
//                 </CollapsibleTrigger>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button size="sm" variant="link">
//                       <EllipsisVertical className="w-5 h-5 " />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <Link to={`/daily/${daily.id}?day=${date.timestamp}`}>
//                       <DropdownMenuItem>
//                         <PencilLine className="w-5 h-5 mr-2" />
//                         Edit
//                       </DropdownMenuItem>
//                     </Link>
//                     {todo.status !== "done" && (
//                       <DropdownMenuItem
//                         onClick={() =>
//                           submit(
//                             {
//                               intent: "update-status-task",
//                               id: todo.id,
//                               status: "done",
//                             },
//                             { action: routeAction, method: "POST" },
//                           )
//                         }
//                       >
//                         <CircleCheckBig className="w-5 h-5 mr-2" />
//                         Mark as done
//                       </DropdownMenuItem>
//                     )}
//                     <AlertDialog>
//                       <DropdownMenuItem className="p-0">
//                         <AlertDialogTrigger
//                           className="flex w-full h-full  px-2 py-1.5"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <Trash2 className="w-5 h-5 mr-2" />
//                           Delete
//                         </AlertDialogTrigger>
//                       </DropdownMenuItem>
//                       <AlertDialogContent
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <AlertDialogHeader>
//                           <AlertDialogTitle>
//                             Are you absolutely sure?
//                           </AlertDialogTitle>
//                           <AlertDialogDescription>
//                             This action cannot be undone. This will
//                             permanently delete your{" "}
//                             <span className="font-medium">1</span>
//                             task from our database.
//                           </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                           <AlertDialogCancel>Cancel</AlertDialogCancel>
//                           <AlertDialogAction
//                             className={cn(
//                               buttonVariants({
//                                 variant: "destructive",
//                               }),
//                             )}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               submit(
//                                 {
//                                   intent: "delete-task",
//                                   ids: JSON.stringify([todo.id]),
//                                 },
//                                 {
//                                   action: routeAction,
//                                   method: "Delete",
//                                 },
//                               );
//                             }}
//                           >
//                             {navigation.state !== "idle" && (
//                               <Spinner className="h-5 w-5 text-white mr-1.5" />
//                             )}{" "}
//                             Delete
//                           </AlertDialogAction>
//                         </AlertDialogFooter>
//                       </AlertDialogContent>
//                     </AlertDialog>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//             <div className="group">
//               <div className="relative ml-1 block py-0.5 md:block">
//                 <div className="flex items-end">
//                   <div>
//                     {/*<div className="absolute flex items-center justify-start gap-1 overflow-hidden">
//                     <button
//                       type="button"
//                       className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-gray-400"
//                     />
//                     <button
//                       type="button"
//                       className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-gray-400"
//                     />
//                   </div>*/}
//                     <div className="overflow-hidden items-center justify-start gap-1 md:flex">
//                       {new Array(16).fill(null).map((_, index) => (
//                         <button
//                           onClick={() => {
//                             submit(
//                               {
//                                 intent: "update-target-task-session",
//                                 id: todo.id,
//                                 target_sessions: index + 1,
//                               },
//                               { action: routeAction, method: "POST" },
//                             );
//                           }}
//                           key={index} // Gunakan key untuk identifikasi unik
//                           type="button"
//                           style={{ animationDelay: `${index * 0.03}s` }}
//                           className={cn(
//                             "h-3 w-3 shrink-0 cursor-pointer rounded-full ",
//                             todo?.sessions?.length >= index + 1
//                               ? "bg-green-400"
//                               : todo?.target_sessions >= index + 1
//                                 ? "bg-gray-400"
//                                 : "bg-gray-200 hidden group-hover:block  transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
//                           )}
//                         />
//                       ))}
//                       <button
//                         style={{ animationDelay: `${16 * 0.03}s` }}
//                         onClick={() => {
//                           submit(
//                             {
//                               intent: "update-target-task-session",
//                               id: todo.id,
//                               target_sessions: 0,
//                             },
//                             { action: routeAction, method: "POST" },
//                           );
//                         }}
//                         className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-red-400 text-white flex items-center justify-center hidden group-hover:flex  animate-roll-reveal [animation-fill-mode:backwards] "
//                       >
//                         <X />
//                       </button>
//                     </div>
//                     <div className="absolute left-0 top-0 flex items-center gap-1 py-0.5" />
//                     <div className="mt-2 inline-block rounded p-1 text-sm text-black dark:text-white">
//                       <div
//                         className={todo?.start_at ? "todo-progress" : ""}
//                       >
//                         {new Date(totalSessionTime)
//                           .toISOString()
//                           .substr(11, 8)}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="ml-auto px-2 pb-0.5">
//                     <Badge>{todo.category}</Badge>
//                   </div>
//                 </div>
//                 <div className="flex">
//                   <div className="hidden">
//                     <button className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 ">
//                       Move to today <ArrowRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <CollapsibleContent className="data-[state=open]:animate-roll-reveal data-[state=closed]:animate-roll-reveal space-y-2 text-text font-base mt-2">
//           {todo?.sub_tasks?.map((subtask) => (
//             <div
//               key={subtask.id}
//               className={cn(
//                 "ml-5 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 bg-gray-50 rounded-lg py-2 mb-3",
//                 active_task && todo.status !== "progress"
//                   ? "bg-white/40 text-muted-foreground opacity-80"
//                   : active_task && todo.status === "progress"
//                     ? "opacity-100"
//                     : todo.status === "done"
//                       ? ""
//                       : "",
//               )}
//             >
//               <div
//                 className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
//                 style={{ touchAction: "none" }}
//                 draggable="true"
//               >
//                 <GripVertical className="h-5 w-5" />
//               </div>
//               <div className="">
//                 <div className="flex gap-2 pl-0 pt-1 mr-2 mt-1">
//                   <Checkbox defaultChecked={subtask.checked} />
//                 </div>
//               </div>
//               <div className="w-full">
//                 <div className="relative flex w-full items-center">
//                   <AutosizeTextarea
//                     onChange={(e) =>
//                       handleChange(
//                         { id: subtask.id, title: e.target.value },
//                         todo.id,
//                       )
//                     }
//                     style={{ resize: "none" }}
//                     className="w-full bg-transparent p-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
//                     defaultValue={subtask.title}
//                     maxHeight={800}
//                     placeholder="Untitled"
//                     autoComplete="off"
//                   />
//                   <div className="ml-auto flex items-center">
//                     <div className="">
//                       <Button size="sm" variant="link">
//                         <EllipsisVertical className="w-5 h-5 " />
//                         <span className="sr-only">Open menu</span>
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <div className="relative ml-1 block py-0.5 md:block">
//                     <div className="flex items-end">
//                       <div className="ml-auto px-2">
//                         <button
//                           type="button"
//                           aria-haspopup="dialog"
//                           aria-expanded="false"
//                           aria-controls="radix-:r1jd:"
//                           data-state="closed"
//                         >
//                           <div className="h-4 w-4 rounded bg-gray-200" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </CollapsibleContent>
//       </Collapsible>
//
//       <pre className="text-xs">{JSON.stringify(todo, null, 2)}</pre>
//     </div>
//   );
// })}

interface HeartCheckboxProps {
  disabled?: boolean;
  defaultChecked?: boolean;
  id: string;
  label: string;
}

const HeartCheckbox = (props: HeartCheckboxProps) => (
  <div className="w-full flex gap-2">
    <input
      className="peer relative appearance-none shrink-0 w-4 h-4 mt-1"
      type="checkbox"
      {...props}
    />
    <svg
      className="absolute w-4 h-4 pointer-events-none stroke-white fill-none peer-checked:!fill-red-500 mt-1"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
    <label htmlFor={props.id}>{props.label}</label>
  </div>
);

const HiddenFields = ({ data }) => {
  return (
    <React.Fragment>
      {Object.entries(data).map(([name, value]) => (
        <input
          id={`inputHidden${name}`}
          key={name}
          type="hidden"
          name={name}
          defaultValue={value}
        />
      ))}
    </React.Fragment>
  );
};

import { startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";

const CalendarYears = ({ total_sessions }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthsInYear, setMonthsInYear] = useState([]);

  // Fungsi untuk memperbarui kalender
  const updateCalendar = () => {
    // Menghitung tanggal mulai dan akhir tahun di waktu lokal
    const startOfCurrentYear = startOfYear(new Date(currentYear, 0, 1));
    const endOfCurrentYear = endOfYear(startOfCurrentYear);

    // Mengambil semua bulan dalam tahun ini
    const months = eachMonthOfInterval({
      start: startOfCurrentYear,
      end: endOfCurrentYear,
    });

    // Menampilkan setiap bulan dalam tahun
    setMonthsInYear(months);
  };

  // Update kalender saat currentYear berubah
  useEffect(() => {
    updateCalendar();
  }, [currentYear]);

  // Menangani navigasi tahun berikutnya dan sebelumnya
  const handleNextYear = () => {
    setCurrentYear((prevYear) => prevYear + 1);
  };

  const handlePreviousYear = () => {
    setCurrentYear((prevYear) => prevYear - 1);
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-background z-10">
        <div className="text-center text-3xl font-bold">Garden of Focus</div>
        <div className="flex w-full items-center justify-center gap-2">
          <Button
            onClick={handlePreviousYear}
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="text-center text-2xl">{currentYear}</div>
          <Button
            onClick={handleNextYear}
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2 pb-5">
          <GardenSessionBadge text={true} sessionCount={1} />
          <GardenSessionBadge text={true} sessionCount={4} />
          <GardenSessionBadge text={true} sessionCount={8} />
          <GardenSessionBadge text={true} sessionCount={12} />
          <GardenSessionBadge text={true} sessionCount={16} />
          <GardenSessionBadge text={true} sessionCount={20} />
        </div>
      </div>
      <div className="mx-auto grid grid-cols-1 gap-5 gap-y-10 md:grid-cols-3 mt-5 p-3">
        {monthsInYear.map((monthStart) => {
          const monthName = monthStart.toLocaleString("default", {
            month: "long",
          });
          const daysInMonth = [];
          const startOfCurrentMonth = startOfMonth(monthStart);
          const endOfCurrentMonth = endOfMonth(monthStart);
          const days = eachDayOfInterval({
            start: startOfCurrentMonth,
            end: endOfCurrentMonth,
          });
          const firstDayOfMonth = getDay(startOfCurrentMonth);
          const adjustedFirstDay =
            firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
          const paddedDays = Array(adjustedFirstDay).fill(null).concat(days);

          // Menambahkan nama bulan dan hari-hari dalam bulan tersebut
          daysInMonth.push(
            <div key={monthStart} className="border p-2">
              <div className="text-lg font-bold">{monthName}</div>
              <div className="grid w-full grid-cols-7 items-start justify-center gap-2 rounded-lg bg-gradient-to-t from-white to-green-50 p-2 dark:bg-gradient-to-t dark:from-gray-900 dark:to-green-950 md:w-max">
                <div className="rounded-t border-b text-center font-bold">
                  Sn
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Sl
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Rb
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Km
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Jm
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Sb
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Mg
                </div>

                {paddedDays.map((day, index) => {
                  if (day) {
                    const dataKey = day ? format(day, "yyyy-MM-dd") : null;
                    const sessions = total_sessions[dataKey] || 0;
                    return (
                      <div key={index} className=" flex flex-col items-center">
                        <div className="text-center text-sm text-muted-foreground">
                          {day.getDate()}
                        </div>
                        <button data-state="closed">
                          <div className="flex h-12 w-12 items-center justify-center overflow-visible p-1 rounded-lg border border-orange-200 bg-orange-50 dark:border-gray-700 dark:bg-gray-950/50">
                            <GardenSessionBadge sessionCount={sessions} />
                          </div>
                        </button>
                      </div>
                    );
                  } else {
                    return <div key={index} className="h-12 w-12" />;
                  }
                })}
              </div>
            </div>,
          );
          return daysInMonth;
        })}
      </div>
    </div>
  );
};

const GardenSessionBadge = ({ sessionCount, text }) => {
  let icon;
  let sessionText;

  if (sessionCount > 16) {
    icon = (
      <div className="relative">
        <div className="absolute right-0 top-0 text-2xl">🔥</div>
        <div className="text-5xl">🌳</div>
      </div>
    );
    sessionText = ">16 session";
  } else if (sessionCount === 16) {
    icon = "🌳";
    sessionText = "16 session";
  } else if (sessionCount >= 12) {
    icon = "🌲";
    sessionText = "12 session";
  } else if (sessionCount >= 8) {
    icon = (
      <div className="relative">
        <div className="absolute left-1 top-1 scale-75 text-2xl">🌿</div>
        <div className="-ml-3 scale-x-[-1] text-2xl">🌿</div>
      </div>
    );
    sessionText = "8 session";
  } else if (sessionCount >= 4) {
    icon = "☘";
    sessionText = "4 session";
  } else if (sessionCount >= 1) {
    icon = "🌱";
    sessionText = "1 session";
  } else {
    icon = "❌"; // Ini opsional untuk ketika sessionCount === 0 atau tidak valid
    sessionText = "No session";
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-2 dark:border-gray-600 dark:bg-green-950/50",
      )}
    >
      <div className={cn("text-4xl ", text ? "" : "absolute")}>{icon}</div>
      {text && <div className="absolute-10">{sessionText}</div>}
    </div>
  );
};

const DeleteTask: React.FC = ({
  task_title,
  task_id,
  sub_task_id,
  sub_task_title,
  timestamp,
}: {
  task_id: number;
  task_title: string;
  sub_task_id?: number;
  sub_task_title?: string;
  timestamp: number;
}) => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  return (
    <button
      className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-red-600 w-full"
      onClick={async () => {
        const prompt = await confirm({
          title: "Are you absolutely sure?",
          body: "This action cannot be undone. This will permanently delete your task",
          cancelButton: "Cancel",
          actionButton: "Delete",
        });
        if (prompt) {
          if (sub_task_id && sub_task_title) {
            dispatch(
              deleteSubTask({
                id: task_id,
                key: timestamp,
                sub_task_id,
                title: task_title,
                sub_task_title,
              }),
            );
          } else {
            dispatch(
              deleteTask({ id: task_id, key: timestamp, title: task_title }),
            );
          }
        }
      }}
    >
      <Trash />
      Delete
    </button>
  );
};

import {
  // Activity,
  ArrowUpRight,
  // Plus,
  Target,
  CheckCircle2,
} from "lucide-react";

interface Card05Props {
  category?: string;
  title?: string;
  description?: string;
  metrics?: {
    label: string;
    value: string;
    trend?: number;
  }[];
  accentColor?: string;
  href?: string;
  dailyGoals?: {
    title: string;
    isCompleted: boolean;
  }[];
}

function Card05({
  category = "Activity",
  title = "Today's Progress",
  metrics = [
    { label: "Move", value: "420", trend: 85 }, // value in calories
    { label: "Exercise", value: "35", trend: 70 }, // value in minutes
    { label: "Stand", value: "10", trend: 83 }, // value in hours
  ],
  dailyGoals = [
    { title: "30min Morning Yoga", isCompleted: true },
    { title: "10k Steps", isCompleted: false },
    { title: "Drink 2L Water", isCompleted: true },
  ],
}: Card05Props) {
  return (
    <div
      className="relative h-full rounded-3xl p-6
            bg-white dark:bg-black/5
            border border-zinc-200 dark:border-zinc-800
            hover:border-zinc-300 dark:hover:border-zinc-700
            transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
          <Activity className="w-5 h-5 text-[#FF2D55]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{category}</p>
        </div>
      </div>

      {/* Metrics Rings */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const colors = ["#FF2D55", "#2CD758", "#007AFF"];
          return (
            <div
              key={metric.label}
              className="relative flex flex-col items-center"
            >
              <div className="relative w-24 h-24">
                {/* Background Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800/50" />
                {/* Progress Ring */}
                <div
                  className="absolute inset-0 rounded-full border-4"
                  style={{
                    borderColor: colors[index],
                    clipPath: `polygon(0 0, 100% 0, 100% ${metric.trend}%, 0 ${metric.trend}%)`,
                  }}
                />
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">
                    {metric.value}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {index === 0 ? "cal" : index === 1 ? "min" : "hrs"}
                  </span>
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {metric.label}
              </span>
              <span className="text-xs text-zinc-500">{metric.trend}%</span>
            </div>
          );
        })}
      </div>

      {/* New Goals & Notes Section */}
      <div className="mt-8 space-y-6">
        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

        {/* Daily Goals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Target className="w-4 h-4" />
              Today's Goals
            </h4>
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Plus className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>

          <div className="space-y-2">
            {dailyGoals.map((goal) => (
              <div
                key={goal.title}
                className="flex items-center gap-3 p-3 rounded-xl
                                    bg-zinc-50 dark:bg-zinc-900/50
                                    border border-zinc-200/50 dark:border-zinc-800/50
                                    hover:border-zinc-300/50 dark:hover:border-zinc-700/50
                                    transition-all"
              >
                <CheckCircle2
                  className={`w-5 h-5 ${
                    goal.isCompleted
                      ? "text-emerald-500"
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}
                />
                <span
                  className={`text-sm ${
                    goal.isCompleted
                      ? "text-zinc-500 dark:text-zinc-400 line-through"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {goal.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            to="#"
            className="inline-flex items-center gap-2 text-sm font-medium
                                text-zinc-600 hover:text-zinc-900
                                dark:text-zinc-400 dark:hover:text-white
                                transition-colors duration-200"
          >
            View Activity Details
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import {
  // CheckCircle2,
  // Circle,
  Clock,
  Flag,
  MoreHorizontal,
  // Plus,
} from "lucide-react";

function List03() {
  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-2xl shadow-lg",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Today's Tasks
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            June 12, 2024
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            5/8 done
          </span>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div className="p-3 flex items-center gap-3 group">
          <button type="button" className="flex-none">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
              Review design system updates
            </p>
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            2:00 PM
          </span>
        </div>

        <div className="p-3 flex items-center gap-3 group">
          <button type="button" className="flex-none">
            <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                Prepare presentation deck
              </p>
              <Flag className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-500">3:30 PM</span>
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-medium">
                High
              </span>
            </div>
          </div>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-3 flex items-center gap-3 group">
          <button type="button" className="flex-none">
            <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              Update API documentation
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-500">4:00 PM</span>
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                Medium
              </span>
            </div>
          </div>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-3 flex items-center gap-3 group">
          <button type="button" className="flex-none">
            <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              Review weekly analytics
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-500">5:00 PM</span>
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">
                Low
              </span>
            </div>
          </div>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400
                    hover:text-zinc-600 dark:hover:text-zinc-300
                    hover:bg-zinc-50 dark:hover:bg-zinc-800/50
                    rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add new task
        </button>
      </div>
    </div>
  );
}

// import * as React from 'react';
// import { Check, ChevronsUpDown } from 'lucide-react';

// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
import { ScrollArea } from "@/components/ui/scroll-area";

export type ComboboxOptions = {
  value: string;
  label: string;
};

type Mode = "single" | "multiple";

interface ComboboxProps {
  mode?: Mode;
  options: ComboboxOptions[];
  selected: string | string[]; // Updated to handle multiple selections
  className?: string;
  placeholder?: string;
  onChange?: (event: string | string[]) => void; // Updated to handle multiple selections
  onCreate?: (value: string) => void;
}

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function StatusDot({ color }: { color?: string }) {
  return <Squircle fill={color} color={color} />;
}

function SelectDemo({ task, subtask, date }: { task: Task }) {
  const dispatch = useAppDispatch();
  const taskCategories = [
    { label: "Urgent", color: "#e11d48" },
    { label: "High Priority", color: "#f97316" },
    { label: "Medium Priority", color: "#f59e0b" },
    { label: "Low Priority", color: "#6ee7b7" },
    { label: "Personal", color: "#4ade80" },
    { label: "Work", color: "#0284c7" },
    { label: "Important Meetings", color: "#2563eb" },
    { label: "Research", color: "#4f46e5" },
    { label: "Creative", color: "#7c3aed" },
    { label: "Review", color: "#9d4edd" },
    { label: "Reports", color: "#c026d3" },
    { label: "Follow-up", color: "#d946ef" },
    { label: "General", color: "#9ca3af" },
    { label: "Team Collaboration", color: "#f472b6" },
    { label: "Client", color: "#fb923c" },
    { label: "Training", color: "#fbbf24" },
    { label: "Deadline", color: "#a3e635" },
    { label: "Admin", color: "#38bdf8" },
    { label: "Development", color: "#9333ea" },
    { label: "Miscellaneous", color: "#1e3a8a" },
  ];
  return (
    <Select
      defaultValue={subtask ? subtask.category.color : task.category.color}
      onValueChange={(e) => {
        const _category = taskCategories.find((item) => item.color === e);
        if (subtask) {
          dispatch(
            updateSubTask({
              id: task.id,
              sub_task_id: subtask.id,
              updated_sub_task: {
                category: _category,
              },
            }),
          );
        } else {
          dispatch(
            updateTask({
              id: task.id,
              key: date.timestamp,
              updated_task: {
                title: task.title,
                category: _category,
              },
            }),
          );
        }
      }}
    >
      <SelectTrigger className="border-none focus:ring-0 shadow-none w-fit p-0 h-6">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
        {taskCategories.map((item, index) => (
          <SelectItem key={index} value={item.color}>
            <span className="flex items-center gap-1 mr-2">
              <StatusDot color={item.color} />
              <span className="truncate">{item.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Combobox({
  options,
  selected,
  className,
  placeholder,
  mode = "single",
  onChange,
  onCreate,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState<string>("");

  return (
    <div className={cn("block", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            key={"combobox-trigger"}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected && selected.length > 0 ? (
              <div className="relative mr-auto flex flex-grow flex-wrap items-center overflow-hidden">
                <span>
                  {mode === "multiple" && Array.isArray(selected)
                    ? selected
                        .map(
                          (selectedValue: string) =>
                            options.find((item) => item.value === selectedValue)
                              ?.label,
                        )
                        .join(", ")
                    : mode === "single" &&
                      options.find((item) => item.value === selected)?.label}
                </span>
              </div>
            ) : (
              (placeholder ?? "Select Item...")
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 max-w-sm p-0">
          <Command
            filter={(value, search) => {
              if (value.includes(search)) return 1;
              return 0;
            }}
            // shouldFilter={true}
          >
            <CommandInput
              placeholder={placeholder ?? "Cari Item..."}
              value={query}
              onValueChange={(value: string) => setQuery(value)}
            />
            <CommandEmpty
              onClick={() => {
                if (onCreate) {
                  onCreate(query);
                  setQuery("");
                }
              }}
              className="flex cursor-pointer items-center justify-center gap-1 italic"
            >
              <p>Create: </p>
              <p className="block max-w-48 truncate font-semibold text-primary">
                {query}
              </p>
            </CommandEmpty>
            <ScrollArea>
              <div className="max-h-80">
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.label}
                      value={option.label}
                      className="capitalize"
                      onSelect={(currentValue) => {
                        if (onChange) {
                          if (mode === "multiple" && Array.isArray(selected)) {
                            console.warn(
                              "DEBUGPRINT[2]: todo.tsx:5088: selected=",
                              selected,
                            );
                            onChange(
                              selected.includes(option.value)
                                ? selected.filter(
                                    (item) => item !== option.value,
                                  )
                                : [...selected, option.value],
                            );
                            setOpen(false);
                          } else {
                            onChange(option.value);
                            setOpen(false);
                          }
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// import React, { useMemo, useRef, useState } from "react";
import { useMemo } from "react";
import { createPortal } from "react-dom";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  Announcements,
  UniqueIdentifier,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

const defaultCols = [
  {
    id: "todo" as const,
    title: "Todo",
  },
  {
    id: "in-progress" as const,
    title: "In progress",
  },
  {
    id: "done" as const,
    title: "Done",
  },
] satisfies Column[];

export type ColumnId = (typeof defaultCols)[number]["id"];

const initialTasks: Task[] = [
  {
    id: "task1",
    columnId: "done",
    title: "Project initiation and planning",
  },
  {
    id: "task2",
    columnId: "done",
    title: "Gather requirements from stakeholders",
  },
  {
    id: "task3",
    columnId: "done",
    title: "Create wireframes and mockups",
  },
  {
    id: "task4",
    columnId: "in-progress",
    title: "Develop homepage layout",
  },
  {
    id: "task5",
    columnId: "in-progress",
    title: "Design color scheme and typography",
  },
  {
    id: "task6",
    columnId: "todo",
    title: "Implement user authentication",
  },
  {
    id: "task7",
    columnId: "todo",
    title: "Build contact us page",
  },
  {
    id: "task8",
    columnId: "todo",
    title: "Create product catalog",
  },
  {
    id: "task9",
    columnId: "todo",
    title: "Develop about us page",
  },
  {
    id: "task10",
    columnId: "todo",
    title: "Optimize website for mobile devices",
  },
  {
    id: "task11",
    columnId: "todo",
    title: "Integrate payment gateway",
  },
  {
    id: "task12",
    columnId: "todo",
    title: "Perform testing and bug fixing",
  },
  {
    id: "task13",
    columnId: "todo",
    title: "Launch website and deploy to server",
  },
];

function useLocalStorageState(key, initialValue) {
  // Ambil data dari local storage saat komponen dimuat pertama kali
  const [state, setState] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  // Simpan state ke local storage setiap kali berubah
  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function KanbanBoard({ tasks, date, streak_data, active_task }) {
  const dispatch = useAppDispatch();
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const pickedUpTaskColumn = useRef<ColumnId | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  // const [tasks, setTasks] = useState<Task[]>(_tasks);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    }),
  );

  function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
    const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
    const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
    const column = columns.find((col) => col.id === columnId);
    return {
      tasksInColumn,
      taskPosition,
      column,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Column") {
        const startColumnIdx = columnsId.findIndex((id) => id === active.id);
        const startColumn = columns[startColumnIdx];
        return `Picked up Column ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${columnsId.length}`;
      } else if (active.data.current?.type === "Task") {
        pickedUpTaskColumn.current = active.data.current.task.columnId;
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.id,
          pickedUpTaskColumn.current,
        );
        return `Picked up Task ${
          active.data.current.task.content
        } at position: ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnIdx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overColumnIdx + 1} of ${columnsId.length}`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId,
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task ${
            active.data.current.task.content
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId,
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel({ active }) {
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  return (
    <DndContext
      accessibility={{
        announcements,
      }}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <SortableContext items={columnsId}>
        <BoardColumn tasks={tasks} date={date} active_task={active_task} />
      </SortableContext>
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    if (activeId === overId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      function setter(tasks: Task[]) {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        return arrayMove(tasks, activeIndex, overIndex);
      }
      const updatedTasks = setter(tasks);
      dispatch(
        updateTasksColumn({ key: date.timestamp, updated_task: updatedTasks }),
      );
    }
  }
}

import { useSortable } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollBar } from "@/components/ui/scroll-area";

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
}

function BoardColumn({
  column,
  tasks,
  date,
  active_task,
  isOverlay,
}: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  return (
    <SortableContext items={tasksIds}>
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          index={index}
          date={date}
          active_task={active_task}
          key={task.id}
          task={task}
        />
      ))}
    </SortableContext>
  );
}

// export interface Task {
//   id: UniqueIdentifier;
//   columnId: ColumnId;
//   content: string;
// }

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

function TaskCard({
  index,
  date,
  active_task,
  task,
  isOverlay,
}: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "",
        overlay: "",
      },
    },
  });

  const todo = task;

  const totalSessionTime = todo.sessions.reduce(
    (total_time, session) => total_time + session.time,
    0,
  );
  const is_today = date.is_today;
  const dispatch = useAppDispatch();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full mb-2",
        variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        }),
      )}
    >
      <Collapsible defaultOpen={false}>
        <div
          className={cn(
            "p-2 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 py-2 mb-2 bg-gray-50 rounded-lg shadow-md",
            active_task && todo.status !== "progress"
              ? "bg-white/40 text-muted-foreground opacity-80"
              : active_task && todo.status === "progress"
                ? "bg-orange-100 dark:bg-orange-400 bg-gradient-to-l from-gray-50 dark:from-orange-950 opacity-100"
                : todo.status === "done"
                  ? "bg-green-100 dark:bg-green-900 bg-gradient-to-l via-white dark:via-black from-green-50 dark:from-green-950 opacity-100"
                  : "",
          )}
        >
          <div className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400">
            <Button
              variant={"link"}
              {...attributes}
              {...listeners}
              className="text-secondary-foreground/50  h-auto cursor-grab absolute top-1/2 transform -translate-y-1/2 left-2  z-20 h-5 w-5 mt-1"
            >
              <span className="sr-only">Move task</span>
              <GripVertical className="" />
            </Button>
          </div>
          <div className="mr-1">
            {todo.status === "done" && (
              <CircleCheckBig className="absolute top-0 -right-4 w-28 h-28 text-green-500 dark:text-green-400 opacity-30" />
            )}
            <div className="flex gap-2 pl-0 pt-1">
              {is_today ? (
                <React.Fragment>
                  {todo.status === "done" ? (
                    <CircleCheckBig className="w-6 h-6 text-green-500 rounded-full" />
                  ) : todo.start_at ? (
                    <button
                      onClick={() => {
                        const elapsedTime = todo.start_at
                          ? Date.now() - new Date(todo.start_at).getTime()
                          : 0;
                        const newTotalTime = todo.total_time + elapsedTime;

                        dispatch(
                          updateTask({
                            id: todo.id,
                            key: date.timestamp,
                            updated_task: {
                              status: "paused",
                              start_at: null,
                              total_time: newTotalTime,
                            },
                          }),
                        );
                      }}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500  text-white",
                        active_task &&
                          "animate-roll-reveal [animation-fill-mode:backwards]",
                      )}
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateTask({
                            id: todo.id,
                            key: date.timestamp,
                            updated_task: {
                              title: todo.title,
                              status: "progress",
                              start_at: new Date().toISOString(),
                            },
                          }),
                        )
                      }
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 pl-0.5 text-white",
                        active_task &&
                          "animate-roll-reveal [animation-fill-mode:backwards]",
                      )}
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  )}
                </React.Fragment>
              ) : (
                <button className="h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 ">
                  <ArrowRight />
                </button>
              )}
            </div>
          </div>
          <div className="w-full group">
            <div className="relative flex w-full items-start">
              <AutosizeTextarea
                key={`title-${todo.id}`}
                name="title"
                defaultValue={todo.title}
                onBlur={(e) => {
                  dispatch(
                    updateTask({
                      id: task.id,
                      key: date.timestamp,
                      updated_task: {
                        title: e.target.value,
                      },
                    }),
                  );
                }}
                style={{ resize: "none" }}
                className="w-full bg-transparent p-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
                minHeight={20}
                maxHeight={800}
                placeholder="Untitled"
                autoComplete="off"
              />
              <div className="ml-auto flex items-center gap-2 pr-2 pt-2">
                <CollapsibleTrigger>
                  <Badge
                    className="flex items-center gap-x-1"
                    variant="success"
                  >
                    <ChevronsUpDown className="w-4 h-4" />
                    <span>{todo.sub_tasks.length}</span>
                  </Badge>
                  <span className="sr-only">Toggle</span>
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => dispatch(addSubTask({ id: todo.id }))}
                      >
                        <Plus /> Add Subtask
                      </DropdownMenuItem>
                      {todo.status !== "done" && (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() =>
                            dispatch(
                              updateTask({
                                id: task.id,
                                key: date.timestamp,
                                updated_task: {
                                  title: todo.title,
                                  status: "done",
                                },
                              }),
                            )
                          }
                        >
                          <CircleCheckBig className="w-5 h-5" />
                          Mark as done
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />

                      <AlertDialogProvider>
                        <DeleteTask
                          task_id={todo.id}
                          task_title={todo.title}
                          timestamp={date.timestamp}
                        />
                      </AlertDialogProvider>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <div className="relative ml-1 block py-0.5 ">
                <div className="flex items-end">
                  <div className="flex items-center justify-start gap-1 h-4">
                    {new Array(16).fill(null).map((_, index) => (
                      <button
                        onClick={() => {
                          dispatch(
                            updateTask({
                              id: task.id,
                              key: date.timestamp,
                              updated_task: {
                                title: todo.title,
                                target_sessions: index + 1,
                              },
                            }),
                          );
                        }}
                        key={index} // Gunakan key untuk identifikasi unik
                        type="button"
                        style={{ animationDelay: `${index * 0.03}s` }}
                        className={cn(
                          "h-[12px] w-[12px] shrink-0 cursor-pointer rounded-full ",
                          todo?.sessions?.length >= index + 1
                            ? "bg-green-400"
                            : todo?.target_sessions >= index + 1
                              ? "bg-gray-500"
                              : "bg-gray-300  hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                        )}
                      />
                    ))}
                    <button
                      style={{ animationDelay: `${16 * 0.03}s` }}
                      onClick={() => {
                        dispatch(
                          updateTask({
                            id: task.id,
                            key: date.timestamp,
                            updated_task: {
                              title: todo.title,
                              target_sessions: 0,
                            },
                          }),
                        );
                      }}
                      className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-red-400 text-white flex items-center justify-center hidden group-hover:flex  animate-roll-reveal [animation-fill-mode:backwards] "
                    >
                      <X />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-x-1.5 pr-2 text-sm mt-1">
                  <div className={todo?.start_at ? "todo-progress" : ""}>
                    {new Date(totalSessionTime).toISOString().substr(11, 8)}
                  </div>
                  <SelectDemo task={task} date={date} />
                </div>
                <div className="flex">
                  <div className="hidden">
                    <button className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 ">
                      Move to today <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CollapsibleContent className="CollapsibleContent space-y-2 text-text font-base mt-1">
          {task.sub_tasks?.map((subtask, index) => {
            return (
              <div
                key={index}
                className={cn(
                  "ml-5 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 bg-gray-50 rounded-lg py-2 mb-1.5 shadow-md",
                  active_task && todo.status !== "progress"
                    ? "bg-white/40 text-muted-foreground opacity-80"
                    : subtask.checked
                      ? "bg-green-100 dark:bg-green-900 bg-gradient-to-l via-white dark:via-black from-green-50 dark:from-green-950 opacity-100"
                      : "opacity-100",
                )}
              >
                {subtask.checked && (
                  <CircleCheckBig className="absolute top-0 -right-4 w-28 h-28 text-green-500 dark:text-green-400 opacity-30" />
                )}
                <div
                  className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
                  style={{ touchAction: "none" }}
                  draggable="true"
                >
                  <GripVertical className="absolute top-1/2 transform -translate-y-1/2 left-2  z-20 h-5 w-5 mt-1" />
                </div>
                <div className="ml-1">
                  <div className="flex gap-2 pl-0 pt-1 mr-2 mt-1">
                    <input
                      type="hidden"
                      defaultValue={subtask.id}
                      key={`sub_tasks[${index}].id`}
                      name={`sub_tasks[${index}].id`}
                      id={`sub_tasks[${index}].id`}
                    />
                    <input
                      type="checkbox"
                      defaultChecked={subtask.checked}
                      onChange={(e) => {
                        dispatch(
                          updateSubTask({
                            id: task.id,
                            key: date.timestamp,
                            sub_task_id: subtask.id,
                            updated_sub_task: {
                              title: subtask.title,
                              checked: e.target.checked,
                            },
                          }),
                        );
                      }}
                      className="accent-green-400 scale-150"
                      key={`sub_tasks[${index}].checked`}
                      name={`sub_tasks[${index}].checked`}
                      id={`sub_tasks[${index}].checked`}
                    />
                  </div>
                </div>
                <div className="w-full">
                  <div className="relative flex w-full items-start">
                    <AutosizeTextarea
                      defaultValue={subtask.title}
                      key={`sub_tasks[${index}].title`} // Dinamis berdasarkan index
                      name={`sub_tasks[${index}].title`} // Dinamis berdasarkan index
                      id={`sub_tasks[${index}].title`} // Dinamis ber
                      onBlur={(e) => {
                        dispatch(
                          updateSubTask({
                            id: task.id,
                            key: date.timestamp,
                            sub_task_id: subtask.id,
                            updated_sub_task: {
                              title: e.target.value,
                            },
                          }),
                        );
                      }}
                      style={{ resize: "none" }}
                      className="w-full bg-transparent p-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
                      maxHeight={800}
                      placeholder="Untitled"
                      autoComplete="off"
                    />
                    <div className="ml-auto flex items-center gap-2 pr-2 pt-2">
                      <div className="">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <EllipsisVertical className="w-4 h-4 " />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialogProvider>
                              <DeleteTask
                                task_id={task.id}
                                sub_task_id={subtask.id}
                                task_title={todo.title}
                                sub_task_title={subtask.title}
                                timestamp={date.timestamp}
                              />
                            </AlertDialogProvider>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="relative ml-1 block py-0.5 md:block">
                      <div className="flex items-end">
                        <div className="flex items-center gap-x-1.5 ml-auto">
                          <SelectDemo
                            task={task}
                            subtask={subtask}
                            date={date}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/*<pre className="text-xs">{JSON.stringify(todo, null, 2)}</pre>*/}
    </div>
  );
}

import { Active, DataRef, Over } from "@dnd-kit/core";

type DraggableData = ColumnDragData | TaskDragData;

function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Task") {
    return true;
  }

  return false;
}

import {
  closestCorners,
  getFirstCollision,
  KeyboardCode,
  DroppableContainer,
  KeyboardCoordinateGetter,
} from "@dnd-kit/core";

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const coordinateGetter: KeyboardCoordinateGetter = (
  event,
  { context: { active, droppableRects, droppableContainers, collisionRect } },
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!active || !collisionRect) {
      return;
    }

    const filteredContainers: DroppableContainer[] = [];

    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry?.disabled) {
        return;
      }

      const rect = droppableRects.get(entry.id);

      if (!rect) {
        return;
      }

      const data = entry.data.current;

      if (data) {
        const { type, children } = data;

        if (type === "Column" && children?.length > 0) {
          if (active.data.current?.type !== "Column") {
            return;
          }
        }
      }

      switch (event.code) {
        case KeyboardCode.Down:
          if (active.data.current?.type === "Column") {
            return;
          }
          if (collisionRect.top < rect.top) {
            // find all droppable areas below
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Up:
          if (active.data.current?.type === "Column") {
            return;
          }
          if (collisionRect.top > rect.top) {
            // find all droppable areas above
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Left:
          if (collisionRect.left >= rect.left + rect.width) {
            // find all droppable areas to left
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Right:
          // find all droppable areas to right
          if (collisionRect.left + collisionRect.width <= rect.left) {
            filteredContainers.push(entry);
          }
          break;
      }
    });
    const collisions = closestCorners({
      active,
      collisionRect: collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null,
    });
    const closestId = getFirstCollision(collisions, "id");

    if (closestId != null) {
      const newDroppable = droppableContainers.get(closestId);
      const newNode = newDroppable?.node.current;
      const newRect = newDroppable?.rect.current;

      if (newNode && newRect) {
        return {
          x: newRect.left,
          y: newRect.top,
        };
      }
    }
  }

  return undefined;
};

// import { Calendar, MoreHorizontal, Tags, Trash, User } from "lucide-react"
import { Calendar, Tags, Trash, User } from "lucide-react";

// import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const labels = [
  "feature",
  "bug",
  "enhancement",
  "documentation",
  "design",
  "question",
  "maintenance",
];

function ComboboxDropdownMenu() {
  const [label, setLabel] = React.useState("feature");
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex w-full flex-col items-start justify-between rounded-md border px-4 py-3 sm:flex-row sm:items-center">
      <p className="text-sm font-medium leading-none">
        <span className="mr-2 rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground">
          {label}
        </span>
        <span className="text-muted-foreground">Create a new project</span>
      </p>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User />
              Assign to...
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar />
              Set due date...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Tags />
                Apply label
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-0">
                <Command>
                  <CommandInput
                    placeholder="Filter label..."
                    autoFocus={true}
                  />
                  <CommandList>
                    <CommandEmpty>No label found.</CommandEmpty>
                    <CommandGroup>
                      {labels.map((label) => (
                        <CommandItem
                          key={label}
                          value={label}
                          onSelect={(value) => {
                            setLabel(value);
                            setOpen(false);
                          }}
                        >
                          {label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash />
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
