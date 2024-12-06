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
  Task,
  setTasks,
} from "@/features/daily-tasks/actions";
import { LinearCombobox } from "@/components/linear-combobox";
import { PickerExample } from "@/components/custom/color-picker-2.tsx";
import { Input } from "@/components/ui/input";
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
      </div>
    </div>
  );
};

const TaskFirst = () => {
  const todos = useAppSelector((state) => state.tasks.tasks);

  React.useEffect(() => {
    load_data_daily_tasks();
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

// import { KanbanBoard } from "@/components/kanban/KanbanBoard";
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

      <section className="relative mx-auto flex w-full items-center">
        <div className="ml-auto flex items-center gap-2">
          <AddTodo count={todos.length} date_key={date.timestamp} />
          <Popover>
            <PopoverTrigger className="flex rounded-lg bg-green-400 p-2 text-green-100 transition-all duration-500 ease-in-out">
              <ChartLine />
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-2xl">
              <List03 />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger className="flex rounded-lg bg-red-400 p-2 text-red-100 transition-all duration-500 ease-in-out">
              <Activity />
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-3xl w-auto">
              <Card05 />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger className="flex rounded-lg bg-orange-400 p-2 text-orange-100 transition-all duration-500 ease-in-out">
              <Flame />
              {streak_data?.current_streak}
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <CalendarWeek
                total_sessions={all_session}
                streak_data={streak_data}
              />
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

        <div
          style={{ animationDelay: `0.1s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] mb-3 text-sm rounded-l  transition-all duration-500 ease-in-out"
        >
          <div className="relative h-8 w-full rounded-l bg-gray-300 dark:bg-gray-600 dark:text-white transition-all duration-500 ease-in-out">
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
                {/*TOTAL TARGET*/}
                <Circle className="h-5 w-5" />
                {total_sessions} sesi
                <ArrowRight className=" ml-2 h-5 w-5 bounce-left-right" />
              </div>
            </div>
          </div>
        </div>

        <ContainerList todos={todos} active_task={active_task} date={date} />
      </div>
    </div>
  );
};

const ContainerList = ({ todos, date, active_task }) => {
  return (
    <React.Fragment>
      {todos.length > 0 ? (
        <React.Fragment>
          <TodoView todos={todos} date={date} active_task={active_task} />
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
    <div className="flex items-center justify-center dark:bg-secondaryBlack inset-0 flex h-[25vh] w-full bg-[#f3f4f6] bg-[linear-gradient(to_right,#9ca3af,transparent_1px),linear-gradient(to_bottom,#9ca3af,transparent_1px)] bg-[size:70px_70px] ">
      <div className="relative p-10 w-full border-4 border-black rounded-sm shadow-light h-full space-y-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 opacity-20 transform -rotate-45 scale-150"></div>
        <div className="absolute top-8 left-8 w-20 h-20 bg-yellow-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-8 right-8 w-32 h-32 bg-green-500 rounded-full opacity-40"></div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 pb-5">
          <p className="max-w-md text-lg text-center text-gray-600 leading-relaxed ">
            {date.q}
          </p>
          <h1 className="text-4xl font-extrabold text-gray-800 text-center tracking-tight leading-tight">
            No tasks{" "}
          </h1>
          <p className="max-w-md text-lg text-center text-gray-600 leading-relaxed">
            Looks like you don't have any tasks for today. Click below to add a
            task and get going.
          </p>

          <div className="flex justify-center">
            <Button
              onClick={() => dispatch(addTask({ key: date.timestamp }))}
              variant="default"
            >
              <Plus className="h-7 w-7" /> Add Task
            </Button>
          </div>
        </div>

        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-red-500 rounded-lg opacity-50 rotate-12"></div>
        <div className="absolute bottom-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-orange-300 opacity-40 rotate-45"></div>
      </div>
    </div>
  );
};

const TodoView = ({ todos, date, active_task }) => {
  return (
    <div className="grid gap-3">
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

// import React, { useEffect, useRef } from "react";
import localForage from "localforage";

interface TimerProps {
  todos: any[];
  onUpdate: (id: string, total_time: number) => void;
}

const TWENTY_FIVE_MINUTES = 25 * 60 * 1000; // 25 menit dalam milidetik
const radius = 40; // Radius lingkaran
const circumference = 2 * Math.PI * radius; // Keliling lingkaran

// import { showNotification } from "./components/notifications";
const TodoTimer = ({ todos, date, active_task }) => {
  const dispatch = useAppDispatch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submit = useSubmit();
  const routeAction = `/daily?day=${date.timestamp}`;
  let progress = 0;

  const pauseTodo = todos.find((todo) => todo.status === "paused");
  useEffect(() => {
    if (active_task) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          const elapsedTime = active_task.start_at
            ? Date.now() - new Date(active_task.start_at)
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
          const circleElement = document.getElementById(
            "progress-circle",
          ) as SVGCircleElement;

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

          document.title = `${timer} ${active_task.title}`;

          // Cek apakah timer sudah mencapai 25 menit
          if (updatedTotalTime >= TWENTY_FIVE_MINUTES) {
            const notif = {
              title: "Saatnya istirahat",
              description: active_task.title + " has completed",
            };
            // showNotification(notif.title, notif.description);

            const todo = active_task;
            const sessionData = todo.sessions || [];
            const elapsedTime = todo.start_at
              ? Date.now() - new Date(todo.start_at)
              : 0;
            const newTotalTime = todo.total_time + elapsedTime;
            sessionData.push({
              date: new Date().toISOString(),
              time: newTotalTime,
            });

            dispatch(
              updateTask({
                id: active_task.id,
                key: date.timestamp,
                updated_task: {
                  updated_at: new Date().toISOString(),
                  sessions: sessionData,
                  status: "draft",
                  total_time: 0,
                  start_at: null,
                },
              }),
            );
            clearInterval(timerRef.current); // Berhenti menjalankan timer
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
      <div className="flex items-start gap-8">
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
                        ? () =>
                            dispatch(
                              updateTask({
                                id: active_task.id,
                                key: date.timestamp,
                                updated_task: {
                                  status: "paused",
                                  start_at: null,
                                },
                              }),
                            )
                        : () =>
                            dispatch(
                              updateTask({
                                id: pauseTodo.id,
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
                  strokeDashoffset={circumference - progress}
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
            <div className="font-bold md:text-xl">{active_task?.title}</div>
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
              <button
                className="items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md flex h-auto gap-1 p-1 py-1 text-sm bg-transparent text-foreground hover:bg-red-600 hover:text-white"
                data-testid="timer-mark-as-done"
                confirmationpopovermessage="Minutes won't be recorded if continue."
              >
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

      {/*<HorseAnimation />*/}
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

// import React, { useRef, useEffect, useState } from "react";

// const HorseAnimation = () => {
//   const canvasRef = useRef(null);
//   const [isRunning, setIsRunning] = useState(true);
//
//   // Gambar utama
//   const horseImages = {
//     running: "/path-to-running-image.png", // Path gambar kuda berlari
//     resting: "/path-to-resting-image.png", // Path gambar kuda beristirahat
//   };
//
//   const loadImages = (sources) => {
//     return new Promise((resolve) => {
//       const images = {};
//       let loadedCount = 0;
//       Object.entries(sources).forEach(([key, src]) => {
//         const img = new Image();
//         img.src = src;
//         img.onload = () => {
//           images[key] = img;
//           loadedCount++;
//           if (loadedCount === Object.keys(sources).length) {
//             resolve(images);
//           }
//         };
//       });
//     });
//   };
//
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let frame = 0;
//
//     const animate = async () => {
//       const images = await loadImages(horseImages);
//
//       const draw = () => {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//         // Pilih gambar
//         const horseImage = isRunning ? images.running : images.resting;
//
//         // Gambar kuda
//         ctx.drawImage(horseImage, 100, 100, 200, 200);
//
//         // Tambahkan Zzz jika sedang istirahat
//         if (!isRunning) {
//           ctx.font = "30px Arial";
//           ctx.fillStyle = "blue";
//           ctx.fillText("Zzz...", 150, 80);
//         }
//
//         frame = requestAnimationFrame(draw);
//       };
//
//       draw();
//     };
//
//     animate();
//
//     return () => cancelAnimationFrame(frame);
//   }, [isRunning]);
//
//   return (
//     <div>
//       <canvas
//         ref={canvasRef}
//         width={400}
//         height={300}
//         style={{ border: "1px solid black" }}
//       />
//       <div>
//         <button onClick={() => setIsRunning(true)}>Run</button>
//         <button onClick={() => setIsRunning(false)}>Rest</button>
//       </div>
//     </div>
//   );
// };
const HorseAnimation = () => {
  return (
    <svg
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      id="svg2985"
      viewBox="0 0 950 700"
      style={{ maxHeight: 180, maxWidth: 180 }}
      version="1.1"
      transform="matrix(-1,0,0,1,0,0)"
    >
      <g id="socle">
        <path
          style={{ opacity: "0.5", fill: "grey", stroke: "none" }}
          d="m 747,571.086 c 0,12.481 -138.344,22.6 -309,22.6 -170.656,0 -309,-10.118 -309,-22.6 l 0,0 c 0,-12.481 138.344,-22.6 309,-22.6 170.656,0 309,10.118 309,22.6 l 0,0 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            repeatCount="indefinite"
            fill="freeze"
            values="
           m 747,571.086 c 0,12.481 -138.344,22.6 -309,22.6 -170.656,0 -309,-10.118 -309,-22.6 l 0,0 c 0,-12.481 138.344,-22.6 309,-22.6 170.656,0 309,10.118 309,22.6 l 0,0 z;
           m 710.5,572.419 c 0,12.481 -123.346,22.6 -275.5,22.6 -152.154,0 -275.5,-10.118 -275.5,-22.6 l 0,0 c 0,-12.481 123.345,-22.6 275.5,-22.6 152.154,0 275.5,10.119 275.5,22.6 l 0,0 z;
           m 654.831,572.419 c 0,12.481 -103.794,22.6 -231.831,22.6 -128.037,0 -231.831,-10.118 -231.831,-22.6 l 0,0 c 0,-12.481 103.794,-22.6 231.831,-22.6 128.037,0 231.831,10.119 231.831,22.6 l 0,0 z;
           m 654.831,572.419 c 0,12.481 -103.794,22.6 -231.831,22.6 -128.037,0 -231.831,-10.118 -231.831,-22.6 l 0,0 c 0,-12.481 103.794,-22.6 231.831,-22.6 128.037,0 231.831,10.119 231.831,22.6 l 0,0 z;
           m 665.834,572.419 c 0,12.481 -108.721,22.6 -242.834,22.6 -134.113,0 -242.833,-10.118 -242.833,-22.6 l 0,0 c 0,-12.481 108.72,-22.6 242.833,-22.6 134.113,0 242.834,10.119 242.834,22.6 l 0,0 z;
           m 708.833,572.419 c 0,12.481 -124.391,22.6 -277.833,22.6 -153.443,0 -277.833,-10.118 -277.833,-22.6 l 0,0 c 0,-12.481 124.389,-22.6 277.833,-22.6 153.442,0 277.833,10.119 277.833,22.6 l 0,0 z;
           M726.5,572.419c0,12.481-130.957,22.6-292.5,22.6c-161.543,0-292.5-10.118-292.5-22.6l0,0c0-12.481,130.956-22.6,292.5-22.6 C595.543,549.819,726.5,559.938,726.5,572.419L726.5,572.419z;
           m 747,571.086 c 0,12.481 -138.344,22.6 -309,22.6 -170.656,0 -309,-10.118 -309,-22.6 l 0,0 c 0,-12.481 138.344,-22.6 309,-22.6 170.656,0 309,10.118 309,22.6 l 0,0 z "
            dur="0.6s"
          />
        </path>
      </g>
      <g id="queue">
        <path
          style={{
            fill: "rgb(255, 254, 161)",
            stroke: "rgb(242, 224, 0)",
            strokeWidth: 4,
          }}
          d="M 484,303 C 621,225 800,162 870,168 940,175 934,230 922,252 910,273 912,295 839,301 766,307 757,317 708,322 660,326 610,332 540,319 471,305 484,303 484,303 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            repeatCount="indefinite"
            fill="freeze"
            values="
           M 484,303 C 621,225 800,162 870,168 940,175 934,230 922,252 910,273 912,295 839,301 766,307 757,317 708,322 660,326 610,332 540,319 471,305 484,303 484,303 z;
           M 479.167,290.833 C 593.5,206.5 616.51873,286.94931 775.5,215 882.56893,166.54438 898.28731,254.11624 889.31777,278.13654 880.85672,300.79511 840.688,331.324 788.833,348.5 736,366 703.167,371.166 639.5,351.5 c -63.667,-19.666 -84.666,-44 -122.667,-48.667 -38,-4.667 -37.666,-12 -37.666,-12 z;
           M 480.5,291.833 C 590.833,220.5 663.08528,226.48198 778.82285,240.46954 875.17934,252.11479 887.333,286 884.833,326.5 c -12,21 -22.333,50 -92.333,44.5 -55.485,-4.359 -109.833,-21.334 -173.5,-41 -63.667,-19.666 -73.5,-22.333 -111.5,-27 -38,-4.667 -27,-11.167 -27,-11.167 z;
           M 480.5,291.833 C 590.833,220.5 660.586,212.932 785,239 c 105,22 113.333,60.5 108,99 -5.333,38.5 -42.03046,44.94416 -92.5,40 -55.39081,-5.42626 -91.333,-33.334 -155,-53 -63.667,-19.666 -100,-17.333 -138,-22 -38,-4.667 -27,-11.167 -27,-11.167 z;
           m 491,305 c 110.334,-71.333 210.72902,-105.80199 335.5,-81.5 79.24111,15.43401 112.95939,56.47969 91,92 -20.43853,33.06025 -42,44.5 -96,36.5 -55.056,-8.156 -42,-21 -130,-24 -68.643,-2.34 -145,-6.333 -183,-11 -38,-4.667 -17.5,-12 -17.5,-12 z;
           M 491.667,296.833 C 602.001,225.5 704.087,183.432 828.501,209.5 c 105,22 119.666,68.833 93.666,102.333 -23.831,30.705 -45.666,34 -82.666,32 -55.575,-3.004 -59.001,-26.666 -147.001,-29.666 -68.643,-2.34 -145.333,-0.667 -183.333,-5.334 -38,-4.667 -17.5,-12 -17.5,-12 z;
           M491.667,296.833 C602.001,225.5,733,175,862.5,191c86.066,10.634,103.5,56.5,77.5,90c-23.831,30.705-52.064,36.464-89,33.5c-81-6.5-99.5,2-187.5-1 c-68.643-2.34-116-3.5-159.5,0.5C465.875,317.506,491.667,296.833,491.667,296.833z;
           M 484,303 C 621,225 800,162 870,168 940,175 934,230 922,252 910,273 912,295 839,301 766,307 757,317 708,322 660,326 610,332 540,319 471,305 484,303 484,303 z "
            dur="0.6s"
          />
        </path>
      </g>
      <g id="crinière">
        <path
          style={{
            fill: "rgb(255, 254, 161)",
            stroke: "rgb(242, 224, 0)",
            strokeWidth: 4,
          }}
          d="M251,142c88-9,114-4,143,3c29,8,52,30,84,35c33,5,62,1,80,14c17,13,27,33,23,46c-5,13-15,35-44,36c-55,2-84-32-110-28 c-25,5-38,26-50,39C366,299,251,142,251,142z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           M251,142c88-9,114-4,143,3c29,8,52,30,84,35c33,5,62,1,80,14c17,13,27,33,23,46c-5,13-15,35-44,36c-55,2-84-32-110-28 c-25,5-38,26-50,39C366,299,251,142,251,142z;
           m 245.833,140.833 c 88,-9 86.929,4.495 123.333,5 48,0.667 67.228,-22.685 109.333,-29.333 19,-3 45.347,7.988 55,18.667 15.667,17.333 15.334,36 3,58 -12.334,22 -37.666,19 -69.333,17.667 -31.667,-1.333 -42.666,5.666 -65.666,30.333 -22.863,24.521 -28.56899,43.86519 -51.667,47.333 -7.32753,1.10012 -104,-147.667 -104,-147.667 z;
           M258.833,134.833c73.333,10.333,84.595,19.162,121,19.667c48,0.667,69.679-31.995,107.667-51.333c18.333-9.333,43.347-7.679,53,3 c15.667,17.333,22,36.333,11.667,62c-9.419,23.396-15.334,29.333-53.667,44.667c-29.428,11.771-55.333,12.667-88.333,31.333 c-29.181,16.506-30,23.667-47.333,38.333C342.75,299.493,258.833,134.833,258.833,134.833z ;
           M260.5,134.5c49.667,0,85.345,5.837,120.667,14.667c65.333,16.333,75.345,0.339,113.333-19c18.333-9.333,33.347-10.346,43,0.333 c15.667,17.333,20,29.667,11.334,55c-8.163,23.864-12.334,39.667-50.667,55c-29.428,11.771-49,5.667-87,16.667 c-32.204,9.322-40.333,18.333-46.667,24.999C346.38,301.239,260.5,134.5,260.5,134.5z;
           M264,115.5c49.667,0,98.482,18.239,123.167,45c35.667,38.667,59,50.667,110.833,29.5c19.045-7.777,45.443-0.077,54,11.5 c8.5,11.5,12.129,29.054,6,43.5c-7,16.5-28.5,37.5-49,42.5c-30.792,7.51-29.5-3-68.5-8c-33.254-4.263-55.5-8-79.5-6 C334.783,275.685,264,115.5,264,115.5z;
           M264,115.5c49.667,0,111.483,11.906,136.168,38.667c35.667,38.667,56.815,50.575,112.333,43.333c23-3,41.777,12.09,50.334,23.667 c8.5,11.5,10.462,31.22,4.333,45.667c-7,16.5-24.5,26.333-45,31.333c-30.792,7.51-48.666,0.333-87-17.333 C404.72,266.801,385,271.5,361,273.5C334.783,275.685,264,115.5,264,115.5z;
           M264,115.5c49.667,0,106.009,18.271,136.168,38.667C446.5,185.5,456.5,193.5,512.501,197.5c23.136,1.652,42.499,9.5,53.499,21 c11.41,11.929,15.629,35.554,9.5,50c-7,16.5-24.5,25-51.5,28c-31.501,3.5-40.666-6.333-79-24c-30.448-14.032-57-5.5-77.5,6 C344.556,291.371,264,115.5,264,115.5z ;
           M251,142c88-9,114-4,143,3c29,8,52,30,84,35c33,5,62,1,80,14c17,13,27,33,23,46c-5,13-15,35-44,36c-55,2-84-32-110-28 c-25,5-38,26-50,39C366,299,251,142,251,142z"
          />
        </path>
      </g>
      <g id="patte-ar-d" transform="scale(1, 1)">
        <path
          style={{
            fill: "rgb(255, 176, 57)",
            stroke: "rgb(255, 76, 1)",
            strokeWidth: 4,
          }}
          d=" m 423.7,325.7 c -9,18 -13,35 -2,48 11,14 18,17 45,31 26,15 48,22 59,18 11,-4 7,-7 16,-2 8,5 60,40 66,44 5,4 17,26 31,29 13,2 18,-8 22,-25 3,-19 -3,-39 -11,-41 -21,-6 -45,11 -85,-46 -5,-7 -29,3 -29,3 0,0 -11,-17 -10,-25 3,-8 -13,-50 -50,-57 -36,-7 -52,23 -52,23 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            repeatCount="indefinite"
            fill="freeze"
            values="
           m 423.7,325.7 c -9,18 -13,35 -2,48 11,14 18,17 45,31 26,15 48,22 59,18 11,-4 7,-7 16,-2 8,5 60,40 66,44 5,4 17,26 31,29 13,2 18,-8 22,-25 3,-19 -3,-39 -11,-41 -21,-6 -45,11 -85,-46 -5,-7 -29,3 -29,3 0,0 -11,-17 -10,-25 3,-8 -13,-50 -50,-57 -36,-7 -52,23 -52,23 z;
           m 497.834,300.5 c -15.85305,-5.56284 -48.219,-2.643 -57.667,12 -9.448,14.643 -18.097,11.717 -21.333,26.667 -3.236,14.95 0.932,65.476 6,73.333 5.068,7.857 23.14,12.737 20.333,20.334 -2.807,7.597 -18.533,32.299 -25.667,41 -7.134,8.701 -16.297,20.21 -15,33.666 1.297,13.456 18.312,11.043 34.667,6.334 22,-6.334 42.667,-23.334 46,-33.334 3.333,-10 -16.333,-38 9,-62 9.791,-9.275 15.334,-15.332 16.667,-19.666 1.333,-4.334 -14.098,-19.646 -3.049,-22.99 11.049,-3.344 19.986,3.463 21.715,-35.01 1.729,-38.473 -15.81205,-34.77084 -31.666,-40.334 z;
           m 469.833,321.501 c -13.595,-9.872 -52.42,-14.322 -65.667,-3 -13.247,11.321 -14.912,12.007 -22.295,25.402 -7.384,13.397 11.025,52.617 13.629,61.597 2.605,8.979 -18.801,25.527 -23.667,32.001 -4.866,6.474 -16.333,13.666 -29,29.333 -7.074,8.75 -30.388,35.069 -33,48.333 -2.612,13.264 -5.352,14.493 11.667,14.667 22.893,0.234 68.275,-4.707 74.333,-13.333 6.058,-8.626 7.799,-39.541 31.667,-65 15,-16 28.814,-23.229 31.333,-27 2.519,-3.771 -31.61,-13.532 -20.333,-16 10.667,-2.334 44.549,-20.323 49.667,-35 12.678,-36.365 -4.74,-42.128 -18.334,-52 z;
           M478.833,332.5c-13.595-9.872-34.753-19.989-48-8.667c-13.247,11.321-18.616,13.938-26,27.334 c-7.384,13.396-3.433,56.973,2.333,64.334c15.667,20,30.667,46.333,21,57.667c-5.255,6.162-20.333,24.333-36,41 c-7.706,8.198-32.675,32.343-38.333,38.666c-5.667,6.334-9.685,12.16,7.333,12.334c22.893,0.234,55.941,2.626,62-6 c6.058-8.626,4.132-9.875,28-35.334c15-16,21.148-29.563,23.667-33.333c2.519-3.771-8.028-36.7-1.667-46.333 c11.667-17.667,15.216-53.657,20.333-68.334C506.179,339.469,492.427,342.372,478.833,332.5z;
           M487,325c-13.595-9.872-20.253-6.322-33.5,5c-13.247,11.321-15.616,11.604-23,25c-7.384,13.396,0.216,49.137,7.5,55 c20.5,16.5,39.635,17.774,46,29.5c9.5,17.5,20.5,35.5,8.5,71c-3.603,10.659-17,32.5-21,42c-3.298,7.833-7.018,11.826,10,12 c22.893,0.234,59.5,2.5,63-3c5.659-8.894,7.5-32.5,5-63c-1.792-21.858-9.5-55.5-24-86.5c-1.921-4.107-30.861,5.133-24.5-4.5 c11.667-17.667,16.075-39.967,15.5-55.5C515,311.5,500.594,334.872,487,325z;
           M484.833,315.834c-13.595-9.872-24.753,0.678-38,12c-13.247,11.321-18,30.667-15.667,44.333 c2.574,15.079,34.049,44.47,41.333,50.333c20.5,16.5,42.733,1.468,51.333,11.668c14.333,17,20.667,26,40,60 c8.918,15.683,17.702,37.817,21.666,47.332c5,12.001,5.755,17.535,20.667,9.334c26.667-14.666,32.628-45.844,32-52.333 c-1-10.332-14.667-21.333-35-40c-19.668-18.057-35-33.333-54.667-59.001c-3.824-4.991-23.725,10.807-25-0.666 c-2-18-2.091-36.467-2.667-52C519.333,306.334,498.427,325.706,484.833,315.834z;
           M483.833,316.334c-13.595-9.872-24.753,0.678-38,12c-13.247,11.321-18,30.667-15.667,44.333 c2.574,15.079,29.549,34.47,36.833,40.333c20.5,16.5,63.165-1.418,71.5,9c8.666,10.832,9.5-0.5,42.5,31.5 c12.951,12.56,58.5,43,69.5,50c10.969,6.979,35.246,23.842,40,7.5c8-27.5-4-50-9-55.5c-8.509-9.359-7-3-47-24 c-23.64-12.411-41.5-16.5-69.5-43c-4.566-4.322-27.148,12.986-26,1.5c2-20-2.334-31.334-14-46.5 C500.29,311.377,497.427,326.206,483.833,316.334z;
           m 423.7,325.7 c -9,18 -13,35 -2,48 11,14 18,17 45,31 26,15 48,22 59,18 11,-4 7,-7 16,-2 8,5 60,40 66,44 5,4 17,26 31,29 13,2 18,-8 22,-25 3,-19 -3,-39 -11,-41 -21,-6 -45,11 -85,-46 -5,-7 -29,3 -29,3 0,0 -11,-17 -10,-25 3,-8 -13,-50 -50,-57 -36,-7 -52,23 -52,23 z "
            dur="0.6s"
          />
        </path>
      </g>
      <g id="patte-av-d" transform="scale(1, 1)">
        <path
          style={{
            fill: "rgb(255, 176, 57)",
            stroke: "rgb(255, 76, 1)",
            strokeWidth: 4,
          }}
          d="M 340,369 C 340,369 327,379 314,380 300,380 296,384 293,394 291,400 285,411 262,456 237,504 209,530 201,544 197,550 201,555 209,555 229,554 265,555 275,555 281,555 293,532 296,527 297,523 305,502 310,490 314,477 320,464 323,451 325,445 329,436 332,424 334,419 338,397 342,391 346,385 363,389 357,374 350,359 340,369 340,369 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           M 340,369 C 340,369 327,379 314,380 300,380 296,384 293,394 291,400 285,411 262,456 237,504 209,530 201,544 197,550 201,555 209,555 229,554 265,555 275,555 281,555 293,532 296,527 297,523 305,502 310,490 314,477 320,464 323,451 325,445 329,436 332,424 334,419 338,397 342,391 346,385 363,389 357,374 350,359 340,369 340,369 z;
           m 339.167,347.501 c -10.512,1.479 -13.889,12.478 -13.667,21.333 0.333,13.333 1.667,28.999 5.333,41.333 3.278,11.026 13.354,21.155 29.667,46 21.667,33 78.479,43.17 85,44.334 9.333,1.666 16.599,-0.642 18,-7.334 9,-43 -6.333,-63 -16,-68 -9.006,-4.658 -21.485,0.495 -27.333,-2.666 -12.333,-6.667 -18.94346,-13.25146 -25.08046,-19.08146 -6.667,-6.333 -5.35827,-4.90343 -11.47538,-13.91854 -7.69746,-11.34415 -6.42446,-7.17338 -9.41446,-16.80838 -3,-9.667 3.57614,-6.71361 3.57614,-14.04061 0,-10 -3.85465,-8.11604 -13.9396,-12.40431 C 351.96718,341.20208 349.68,346.022 339.167,347.501 z;
           m 309.833,331.834 c -10.512,1.479 -13.889,12.478 -13.667,21.333 C 296.5,366.5 274.333,389.666 278,402 c 3.278,11.026 12.271,29.014 37,45.5 42,28 76.979,28.336 83.5,29.5 9.333,1.666 20.099,-0.308 21.5,-7 9,-43 -13.333,-56 -23,-61 -9.006,-4.658 -22.5,5.5 -42,2.5 -13.857,-2.132 -27.863,-13.67 -34,-19.5 -6.667,-6.333 8.936,-6.957 18,-13 15,-10 12.52598,-7.10958 13.18731,-17.17615 0.53553,-8.15177 3.07106,-8.22884 3.07106,-15.55584 0,-10 -5.69754,-13.35814 -15.9599,-17.20254 -10.0983,-3.78293 -18.95247,1.28953 -29.46547,2.76853 z;
           m 311.833,329.667 c -10.512,1.479 -13.888,7.978 -13.667,16.833 0.333,13.333 -49,-7 -53.333,4.666 -4.005,10.783 -3.193,52.996 14.333,77 23,31.5 43.226,51.889 48.667,55.667 12,8.334 21.88,9.234 25.333,3.333 18.333,-31.333 7.628,-70.383 3.333,-76 -4.333,-5.666 -8.667,-2.666 -20.667,-7.333 -13.066,-5.082 -16.529,-5.837 -22.667,-11.667 -6.667,-6.333 20.269,13.377 29.333,7.334 15,-10 29.657,-28.699 26.667,-38.334 -3,-9.667 -1,-3.172 -1,-10.499 0,-10 -3.33623,-6.34853 -4.84823,-17.20253 -1.512,-10.854 -20.97077,-5.27647 -31.48377,-3.79747 z;
           m 310.333,328.667 c -10.512,1.479 -9.555,13.978 -9.333,22.833 0.333,13.333 -46,-17.5 -59.5,-6 -8.757,7.459 -28.699,49.787 -28,79.5 1,42.5 15.396,66.301 19.5,71.5 7.5,9.5 13.033,8.838 19,5.5 29.5,-16.5 46.295,-62.883 42,-68.5 -4.333,-5.666 -19.755,-13.156 -27.5,-31.5 -9.5,-22.5 -0.78492,-7.22008 7.50508,-5.50508 14.5,3 35.43092,7.54808 44.49492,1.50508 15,-10 32.157,-28.199 29.167,-37.834 -3,-9.667 -1,-6.20246 -1,-13.52946 0,-10 -1.821,0.21746 -3.333,-10.63654 -1.512,-10.854 -22.488,-8.812 -33.001,-7.333 z;
           m 317.5,332.5 c -10.512,1.479 -29,16 -36.5,16.5 -13.308,0.887 -38,-20 -60,-13 -10.961,3.487 -48.5,17 -72,48.5 -25.42,34.074 -21,58.5 -21,65.5 0,12.104 12.163,10.41 19,10.5 38,0.5 70.5,-24 63.5,-32.5 -4.535,-5.506 0.5,-26 2.5,-32.5 8.488,-27.585 10.21,-16.715 18.5,-15 14.5,3 60.436,15.543 69.5,9.5 15,-10 32.157,-28.199 29.167,-37.834 -3,-9.667 -1,-3.172 -1,-10.499 0,-10 -1.821,-2.813 -3.333,-13.667 -1.512,-10.854 2.178,3.021 -8.334,4.5 z;
           m 319.667,351.5 c -10.512,1.479 -3.943,1.139 -10.667,4.5 -14,7 -20.963,21.199 -40.5,33.5 -13.5,8.5 -45,36.5 -83,59 -36.58,21.659 -58.5,21 -74.5,28.5 -10.959,5.137 6.172,20.424 12,24 22,13.5 36.107,29.613 47,28 13.5,-2 61.506,-38.883 66.5,-43.5 26.5,-24.5 27.5,-36 39.5,-44 12.32,-8.214 29.936,-23.957 39,-30 15,-10 20.324,-30.699 17.333,-40.334 -3,-9.667 -1,-3.172 -1,-10.499 0,-10 0.19931,2.74284 -1.31269,-8.11116 -1.512,-10.854 0.15869,-2.53484 -10.35331,-1.05584 z;
           M 340,369 C 340,369 327,379 314,380 300,380 296,384 293,394 291,400 285,411 262,456 237,504 209,530 201,544 197,550 201,555 209,555 229,554 265,555 275,555 281,555 293,532 296,527 297,523 305,502 310,490 314,477 320,464 323,451 325,445 329,436 332,424 334,419 338,397 342,391 346,385 363,389 357,374 350,359 340,369 340,369 z "
          />
        </path>
      </g>
      <g id="Body">
        <path
          style={{
            fill: "rgb(255, 176, 57)",
            stroke: "rgb(255, 76, 1)",
            strokeWidth: 4,
          }}
          d=" m 277.749,144.997 c 39.4137,23.54416 56.313,47.503 73.199,81.67 16.886,34.167 26.552,77.416 26.552,77.416 8.054,-0.378 18.167,2.833 36.667,0.667 18.5,-2.166 34.392,-10.935 61,-11.583 27.333,-0.667 44.417,12 55.667,32 11.25,20 9.29562,44.29553 5.666,52 -3.62962,7.70447 -24.40453,19.32076 -41,24 -27.34851,7.71115 -60.33352,13.48377 -92.333,10.666 -48.67118,-4.28583 -68.52762,-14.04462 -90.333,-30 -14.69824,-10.75496 -30.36446,-32.74822 -39.334,-61.333 -11.55082,-36.81097 -8.15685,-64.11168 -3.417,-98.833 6.24781,-45.7678 7.666,-76.67 7.666,-76.67 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           m 277.749,144.997 c 39.4137,23.54416 56.313,47.503 73.199,81.67 16.886,34.167 26.552,77.416 26.552,77.416 8.054,-0.378 18.167,2.833 36.667,0.667 18.5,-2.166 34.392,-10.935 61,-11.583 27.333,-0.667 44.417,12 55.667,32 11.25,20 9.29562,44.29553 5.666,52 -3.62962,7.70447 -24.40453,19.32076 -41,24 -27.34851,7.71115 -60.33352,13.48377 -92.333,10.666 -48.67118,-4.28583 -68.52762,-14.04462 -90.333,-30 -14.69824,-10.75496 -30.36446,-32.74822 -39.334,-61.333 -11.55082,-36.81097 -8.15685,-64.11168 -3.417,-98.833 6.24781,-45.7678 7.666,-76.67 7.666,-76.67 z;
           m 281.5,164.5 c 32,19.667 53.285,37.002 74.667,76.667 C 379.462,284.38 376,303.5 376,303.5 c 8.054,-0.377 12.075,1.898 35.204,-5.968 23.129,-7.866 42.642,-15.929 70.296,-17.032 27.654,-1.103 52.156,22.366 58.667,38.334 6.511,15.968 3.33553,32.05439 -4,45.666 -7.33553,13.61161 -28.054,22.269 -41.667,26 -13.613,3.731 -39.667,14.667 -77.667,16.334 -25.362,1.112 -58,4.999 -90.667,-11.334 -26.55,-13.274 -47.107,-43.448 -51,-66.333 -3.893,-22.885 -1,-74.334 -0.167,-96.834 0.833,-22.5 6.501,-67.833 6.501,-67.833 z;
           m 289,145.5 c 32,19.667 59,49.5 72.5,84.5 13.5,35 17.5,65.5 17.5,65.5 8.054,-0.377 12.075,1.898 35.204,-5.968 23.129,-7.866 27.142,-10.91885 54.796,-12.02185 27.654,-1.103 48.489,18.52185 55,34.48985 6.511,15.968 2.27969,36.87316 -1.52031,46.44416 -3.801,9.571 -14.887,18.81469 -26.47969,23.55584 -13.06464,5.34315 -39.5,21.333 -77.5,23 -25.362,1.112 -70.333,0.833 -103,-15.5 -26.55,-13.274 -37.607,-46.115 -41.5,-69 -3.893,-22.885 3.167,-73.667 4,-96.167 0.833,-22.5 11,-78.833 11,-78.833 z;
           m 298.5,134.833 c 32,19.667 55.167,47.333 68.667,82.333 13.5,35 14.167,69 14.167,69 6.167,0.333 18.833,-3 32.167,-7.667 23.059,-8.071 39,-10.667 55.333,-6.667 16.499,4.041 39.489,17.033 46,33 6.51,15.969 0.82946,37.90462 -6,50 -6.82946,12.09538 -20.333,26.333 -36.667,35.666 -12.256,7.003 -27.79898,11.34415 -52.667,12 -25.37759,0.66929 -77.333,0.334 -110,-16 -26.55,-13.273 -29.273,-52.449 -33.167,-75.334 -3.893,-22.884 3.167,-73.667 4,-96.167 0.833,-22.5 18.167,-80.164 18.167,-80.164 z;
           m 279,119 c 32,19.667 56.582,34.134 81.5,78.5 20.5,36.5 24.5,83 24.5,83 6.167,-1.667 19.909,-3.494 34,-4.5 28,-2 47.667,2.5 64,6.5 16.499,4.041 31.52046,22.54623 35,34.97969 3.47954,12.43347 2.82438,40.44523 -3.5,50.52031 -6.32438,10.07508 -15.167,15.667 -31.5,25 -12.256,7.003 -25.5,7.834 -63.5,9.5 -25.362,1.113 -74.333,-7.166 -107,-23.5 -26.55,-13.273 -28.107,-47.615 -32,-70.5 -3.893,-22.884 -1,-71.001 -0.167,-93.5 C 281.166,192.501 279,119 279,119 z;
           m 283.5,116 c 36,20.5 61.014,43.103 84,88.5 20,39.5 20,91 20,91 8,1.5 21.586,1.441 35.5,-1 28.5,-5 46.667,-9.5 63,-5.5 16.499,4.041 27.489,19.533 34,35.5 6.51,15.969 -0.701,42.43 -4.5,52 -3.801,9.572 -12.66898,24.18511 -30,31.5 -8.21539,3.46747 -25,5.334 -63,7 -25.362,1.113 -51.333,-7.666 -84,-24 -26.55,-13.273 -46.107,-45.115 -50,-68 -3.893,-22.885 -6.5,-70.501 -5.667,-93 0.833,-22.499 0.667,-114 0.667,-114 z;
           m 277,123.5 c 36,20.5 62.533,40.383 87,85 25.5,46.5 20,90.5 20,90.5 8,1.5 21.586,1.441 35.5,-1 28.5,-5 51.167,-12 67.5,-8 16.499,4.041 28.489,21.533 35,37.5 6.51,15.969 0.32131,41.91785 -5.5,52.5 -5.82131,10.58215 -17.15685,21.70761 -34.5,27 -13.50102,4.11994 -24,5.334 -62,7 -25.362,1.113 -50.833,-7.166 -83.5,-23.5 -26.55,-13.273 -46.607,-46.115 -50.5,-69 -3.893,-22.885 -7.5,-65.501 -6.667,-88 0.833,-22.499 -2.333,-110 -2.333,-110 z;
           m 277.749,144.997 c 39.4137,23.54416 56.313,47.503 73.199,81.67 16.886,34.167 26.552,77.416 26.552,77.416 8.054,-0.378 18.167,2.833 36.667,0.667 18.5,-2.166 34.392,-10.935 61,-11.583 27.333,-0.667 44.417,12 55.667,32 11.25,20 9.29562,44.29553 5.666,52 -3.62962,7.70447 -24.40453,19.32076 -41,24 -27.34851,7.71115 -60.33352,13.48377 -92.333,10.666 -48.67118,-4.28583 -68.52762,-14.04462 -90.333,-30 -14.69824,-10.75496 -30.36446,-32.74822 -39.334,-61.333 -11.55082,-36.81097 -8.15685,-64.11168 -3.417,-98.833 6.24781,-45.7678 7.666,-76.67 7.666,-76.67 z "
          />
        </path>
      </g>
      <g id="patte-av-g">
        <path
          style={{
            fill: "rgb(255, 176, 57)",
            stroke: "rgb(255, 76, 1)",
            strokeWidth: 4,
          }}
          d="M 340,369 C 331.948,373.871 327,379 314,380 300,380 278,367 272,367 266,366 245,366 205,403 165,440 164,476 165,486 166,495 169,500 189,499 208,497 234,482 240,475 247,469 251,463.541 250,459.541 250,455.541 251,429 255,421 259,413 284.721,420.334 289.738,421.246 295.723,422.334 319.015,429.088 325,428 330.017,427.088 344,418 348,412 352,406 363.424,388.824 357,374 350.418,358.812 346.402,365.127 340,369 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           M 340,369 C 331.948,373.871 327,379 314,380 300,380 278,367 272,367 266,366 245,366 205,403 165,440 164,476 165,486 166,495 169,500 189,499 208,497 234,482 240,475 247,469 251,463.541 250,459.541 250,455.541 251,429 255,421 259,413 284.721,420.334 289.738,421.246 295.723,422.334 319.015,429.088 325,428 330.017,427.088 344,418 348,412 352,406 363.424,388.824 357,374 350.418,358.812 346.402,365.127 340,369 z;
           M 342.167,360.833 C 335.003,367.283 327.266,392.953 321.823,410.691 319.024,419.811 311.136,429.58 306.473,445.686 299.14,471.019 279.151,497.128 266.55,518.265 256.217,535.598 234.408,557.841 225.834,569.5 217.501,580.833 227.395,581.717 236.834,582.166 250.834,582.833 290.306,582.833 299.167,582.833 305.834,582.833 306.92,584.811 315.56,567.321 321.742,554.806 336.084,500.394 338.467,493.773 341.467,485.44 357.05,454.199 359.177,447.816 364.177,432.816 364.117,430.387 367.5,420.5 376.167,395.166 374.454,391.215 375.833,379.5 377.212,367.785 370.59,364.371 362.833,362.833 355.076,361.295 349.331,354.383 342.167,360.833 z;
           M 329.048,363.502 C 327.564,373.027 324.88,376.688 331.857,393.881 335.444,402.721 342.646,436.217 347.548,452.252 351.724,465.911 354.099,490.197 354.432,515.197 354.701,535.375 352.789,552.713 353.5,567.167 354.191,581.217 353.444,581.1 362.833,582.167 377.5,583.834 420.833,583.167 432.5,580.167 438.957,578.507 437.89,568.752 432.462,550.014 429.137,538.537 410.388,470.397 408.057,463.758 405.123,455.402 397.213,433.794 394.833,427.5 389.241,412.711 383.118,404.637 379.5,394.834 370.228,369.716 368.492,367.123 362.167,357.167 355.842,347.21 353.326,348.302 346.339,352.006 339.352,355.711 330.532,353.978 329.048,363.502 z;
           M 332.392,367.404 C 330.908,376.929 341.202,385.129 349.353,401.797 355.091,413.527 356.681,428.499 367.894,445.617 378.386,461.633 391.473,475.554 413.605,490.699 422.899,497.058 439.833,510.167 468.5,516.834 482.201,520.021 487.269,520.252 490.833,511.501 498.166,493.501 497.5,486.167 495.833,473.501 493.588,456.44 491.02,460.582 481.834,455.271 471.544,449.198 431.835,439.897 427.16,434.637 419.16,425.637 409.448,414.28 403.057,403.419 396.977,393.086 381.232,381.841 373.718,371.058 367.914,362.729 369.667,351.27 358.264,348.249 348.037,345.538 348.651,345.693 341.321,348.662 337.68,350.137 333.876,357.88 332.392,367.404 z;
           M 315.048,342.502 C 313.564,352.027 318.024,351.307 325,368.5 327.951,375.771 317.528,403.127 317.689,423.591 317.877,447.623 338.123,459.799 362.059,471.894 381.877,481.909 406.915,492.333 435.581,499 449.282,502.187 451.345,498.405 454.505,489.5 459.817,474.53 451.191,454.176 447.505,440.5 443.027,423.885 438.903,430.12 415.5,427 400.5,425 368.297,424.417 367,417.5 365.5,409.5 370,386 365.5,372.5 355.368,342.105 357.618,359.303 354,349.5 344.728,324.382 354.492,346.123 348.167,336.167 341.842,326.21 339.326,327.302 332.339,331.006 325.352,334.711 316.532,332.978 315.048,342.502 z;
           M 320,340.5 C 318.516,350.025 319.5,353.5 321.5,371.5 322.367,379.3 305,365 283,365.5 267.569,365.851 247.487,401.414 246.5,432 245.5,463 248.268,495.141 265.5,519 272,528 279.318,529.182 286,522.5 305,503.5 326.854,468.057 324.5,455.5 323,447.5 314.705,449.58 309.861,440.263 299.181,423.42 294.071,418.662 300.441,416.254 318.441,409.754 337.709,409.684 351.639,396.763 363.344,385.905 358.954,357.362 355.5,347.5 354.309,344.1 351.967,340.062 348.167,336.167 339.93,327.723 339.326,327.302 332.339,331.006 325.352,334.711 321.484,330.976 320,340.5 z;
           M 340,369 C 331.948,373.871 327,379 314,380 300,380 278,367 272,367 266,366 245,366 205,403 165,440 164,476 165,486 166,495 169,500 189,499 208,497 234,482 240,475 247,469 251,463.541 250,459.541 250,455.541 251,429 255,421 259,413 284.721,420.334 289.738,421.246 295.723,422.334 319.015,429.088 325,428 330.017,427.088 344,418 348,412 352,406 363.424,388.824 357,374 350.418,358.812 346.402,365.127 340,369 z"
          />
        </path>
        <path
          id="cuisse-av-g"
          style={{ fill: "rgb(255, 176, 57)", fillOpacity: 1, stroke: "none" }}
          d="m 346,411 c 10,-11 10,-13 15,-21 5,-8 12,-32 -3,-33 -15,-2 -27,23 -41,25 -9,2 29,29 29,29 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            repeatCount="indefinite"
            fill="freeze"
            values="
           m 346,411 c 10,-11 10,-13 15,-21 5,-8 12,-32 -3,-33 -15,-2 -27,23 -41,25 -9,2 29,29 29,29 z;
           m 352.5,413.833 c 18.5,-0.499 23.167,-15.168 28,-34.667 2.423,-9.776 7.596,-27.735 -15.167,-29.167 C 341.5,348.5 329.667,343.666 326.5,373.5 c -3.167,29.834 7.5,40.832 26,40.333 z;
           m 365.188,386.749 c 14.033,-12.066 8.391,-26.388 -0.17,-44.562 -4.292,-9.112 -11.618,-26.306 -30.176,-13.046 -19.43,13.884 -31.659,17.605 -15.28,42.741 16.377,25.138 31.592,26.933 45.626,14.867 z;
           m 366.854,389.082 c 40.646,11.419 13.541,-26.407 4.979,-44.581 -4.292,-9.112 -16.768,-26.286 -35.326,-13.026 -19.43,13.884 -35.696,19.891 -17.008,43.359 14.334,18 25.39,8.077 47.355,14.248 z;
           m 346.5,382 c 33,0 10.569,-23.462 12,-43.5 1.5,-21 -7.935,-39.785 -26.492,-26.525 -19.43,13.884 -35.696,19.891 -17.008,43.359 14.333,18 8.685,26.666 31.5,26.666 z;
           m 343.5,372.5 c 32.5,27 6.569,-23.462 8,-43.5 1.5,-21 -3.935,-39.785 -22.492,-26.525 -19.43,13.884 -38.196,20.057 -19.508,43.525 14.333,18 16.451,11.921 34,26.5 z;
           m 340.5,376.5 c 21,10.5 22.069,-15.462 23.5,-35.5 1.5,-21 -19.435,-47.785 -37.992,-34.525 -19.43,13.884 -38.196,20.057 -19.508,43.525 14.333,18 13.594,16.297 34,26.5 z;
           m 346,411 c 10,-11 10,-13 15,-21 5,-8 12,-32 -3,-33 -15,-2 -27,23 -41,25 -9,2 29,29 29,29 z "
            dur="0.6s"
          />
        </path>
      </g>
      <g id="patte-ar-g">
        <path
          style={{
            fill: "rgb(255, 176, 57)",
            stroke: "rgb(255, 76, 1)",
            strokeWidth: 4,
          }}
          d="m 450,313 c -14,15 -22.41242,30.18684 -15,46 7.5925,16.19734 11.24268,23.74867 33,45 21.24559,20.75151 43.99616,29.95686 55,29 11.99633,-1.04316 9,-5 16,2 7,7 50.23386,79.82156 54,85 4.24137,5.83188 4.09215,40.80423 17,47 12.0952,5.8057 38.1957,-5.90364 46,-22 8.19684,-16.90597 7.83045,-40.92386 7,-43 -1.17444,-2.9361 -94.04651,-105.39177 -98,-106 -9.11234,-1.4019 -22,3 -22,3 0,0 -6.40588,-20.18825 -3,-27 3.60555,-7.2111 -0.0923,-51.80528 -34,-68 -33.09344,-15.80582 -44.9956,-2.79043 -56,9 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           m 450,313 c -14,15 -22.41242,30.18684 -15,46 7.5925,16.19734 11.24268,23.74867 33,45 21.24559,20.75151 43.99616,29.95686 55,29 11.99633,-1.04316 9,-5 16,2 7,7 50.23386,79.82156 54,85 4.24137,5.83188 4.09215,40.80423 17,47 12.0952,5.8057 38.1957,-5.90364 46,-22 8.19684,-16.90597 7.83045,-40.92386 7,-43 -1.17444,-2.9361 -94.04651,-105.39177 -98,-106 -9.11234,-1.4019 -22,3 -22,3 0,0 -6.40588,-20.18825 -3,-27 3.60555,-7.2111 -0.0923,-51.80528 -34,-68 -33.09344,-15.80582 -44.9956,-2.79043 -56,9 z;
           m 465.501,299.167 c -7.917,7.667 -25.918,19.248 -23.959,36.541 1.959,17.293 5.805,26.063 16.293,37.793 12.667,14.167 48.333,36 71.707,36.207 30.965,0.274 23.606,-12.175 26.294,-4.874 C 565.835,432 600,455.25 624.5,467.75 c 15.165,7.737 34.984,17.455 45.25,15.5 15.75,-3 19.932,-28.898 20,-36.5 C 690,419 677.751,407.354 669.5,407.25 610,406.5 613.034,392.534 582.25,361.75 c -11.5,-11.5 -28.17203,11.862 -28,9.625 0.12497,-1.625 -5.25,-6.375 -4.75,-22.125 0.508,-15.995 -17.677,-49.652 -41.999,-53.917 -25.666,-4.5 -34.084,-3.834 -42,3.834 z;
           m 449.793,298.626 c -7.917,7.667 -25.918,19.248 -23.959,36.541 1.959,17.293 5.805,26.063 16.293,37.793 12.667,14.167 36.001,45.869 59.373,45.54 23.667,-0.333 26.334,-10.666 24.334,-8.333 -9.526,11.112 -14.334,55 34,114.667 10.716,13.228 32.506,-15.081 36.666,-24.667 7.667,-17.666 9.334,-47.666 5.334,-49.333 -19.896,-8.291 -27.174,-21.379 -30.334,-29 -5.667,-13.667 -5.376,-34.71 -6,-49.667 -0.678,-16.249 -35.172,3.904 -35,1.667 0.125,-1.625 2.793,-9.374 3.293,-25.124 0.508,-15.995 -17.677,-49.652 -42,-53.917 -25.665,-4.501 -34.083,-3.835 -42,3.833 z;
           m 450.833,297.834 c -10.63313,2.89799 -26,11.333 -30.333,29 -4.146,16.902 -5,28.334 -1.333,43.334 4.002,16.371 9.974,36.791 27.333,47 5.667,3.333 14.333,-5 0.667,5.333 -11.675,8.827 -31.167,38.667 -31.333,87.333 -0.059,17.023 37.49173,8.58269 56,-1 19.40221,-10.04553 30.256,-27.967 28,-31.667 -8.333,-13.666 -7.667,-26 -4.333,-40.333 3.351,-14.411 15.667,-23 24.333,-32 11.281,-11.715 -12.433,-32.273 -14.667,-29.667 -26,30.334 14.833,-15.583 15.333,-31.333 0.508,-15.995 4.656,-39.734 -19.667,-44 -25.665,-4.5 -38.54747,-5.12131 -50,-2 z;
           M 462.96954,298.94924 C 452.10283,300.79091 445.5,302 429.5,319 c -11.928,12.673 -14,25 -21.5,39.5 -6.286,12.152 -10.5,35.5 -2.5,52 2.868,5.916 4.667,11.667 -9,22 -11.675,8.827 -81.5,78.5 -86,104 -2.958,16.765 6.55,13.5 17,13.5 19.5,0 63.322,-2.004 65,-6 10.5,-25 20.992,-51.364 30,-63 12,-15.5 26.514,-27.369 36,-35.5 17.5,-15 15.503,-20.368 -5,-27.5 -11.5,-4 55,-11.5 67,-74.166 3.01,-15.718 -7.42345,-38.19844 -19.667,-44 -9.36228,-4.43628 -25.40077,-2.99692 -37.86346,-0.88476 z;
           m 463,311 c -10.83887,1.99899 -13,4 -29,21 -11.928,12.673 -14.23,27.177 -14,43.5 0.5,35.5 17,60.5 35,65.5 6.335,1.76 -1.657,16.139 -11,30.5 -27,41.5 -64,75 -82.5,96.5 -11.104,12.904 -2.95,16 7.5,16 19.5,0 67.744,-2.8 70,-6.5 12.5,-20.5 27.871,-39.242 39,-61.5 18,-36 29.197,-73.688 34.5,-85 7.5,-16 -1.5,-13.5 -18,-12 -12.126,1.103 24.5,-22.5 26.5,-70.5 0.666,-15.989 -7.9936,-18.54978 -22,-31 -10.29247,-9.14893 -24.54747,-8.61216 -36,-6.5 z;
           m 466.5,301 c -5.7579,3.39992 -10.03046,6.53046 -23,20.5 -11.84117,12.75417 -17.23,20.177 -17,36.5 0.5,35.5 40,66 58,71 6.335,1.76 32,34.5 28,59.5 -7.822,48.889 -17.5,62 -28,83 -7.613,15.227 -0.45,11.5 10,11.5 19.5,0 64.244,-0.3 66.5,-4 12.5,-20.5 8.375,-60.229 6,-85 -3.5,-36.5 -16.5,-62 -21.5,-73 -7.313,-16.087 -6.657,-10.224 -23,-7.5 -9,1.5 -7,1 2.5,-40 3.644,-15.724 -4.51738,-54.98064 -19,-68 -14.85531,-13.35439 -28.83604,-10.79685 -39.5,-4.5 z;
           m 450,313 c -14,15 -22.41242,30.18684 -15,46 7.5925,16.19734 11.24268,23.74867 33,45 21.24559,20.75151 43.99616,29.95686 55,29 11.99633,-1.04316 9,-5 16,2 7,7 50.23386,79.82156 54,85 4.24137,5.83188 4.09215,40.80423 17,47 12.0952,5.8057 38.1957,-5.90364 46,-22 8.19684,-16.90597 7.83045,-40.92386 7,-43 -1.17444,-2.9361 -94.04651,-105.39177 -98,-106 -9.11234,-1.4019 -22,3 -22,3 0,0 -6.40588,-20.18825 -3,-27 3.60555,-7.2111 -0.0923,-51.80528 -34,-68 -33.09344,-15.80582 -44.9956,-2.79043 -56,9 z "
          />
        </path>
        <path
          id="cuisse-ar-g"
          style={{ fill: "rgb(255, 176, 57)", fillOpacity: 1, stroke: "none" }}
          d="m 447,307 c -19,13 -19,38 -17,47 2,9 2,13 24,34 22,21 54,17 65,10 12,-6 15.7059,-35.30548 14,-54 -1.12714,-12.35198 -6.08376,-18.62183 -14,-30 -8.07675,-11.60888 -19,-19 -39,-19 -20,1 -33,12 -33,12 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           m 447,307 c -19,13 -19,38 -17,47 2,9 2,13 24,34 22,21 54,17 65,10 12,-6 15.7059,-35.30548 14,-54 -1.12714,-12.35198 -6.08376,-18.62183 -14,-30 -8.07675,-11.60888 -19,-19 -39,-19 -20,1 -33,12 -33,12 z;
           m 455.001,298 c -9.833,7.167 -20.00289,27.74886 -17,47 3.5,22.43808 13.667,24.833 24,34 10.333,9.167 48.833,20.833 65,10 16.167,-10.833 18.166,-39.333 15.5,-54.333 -2.666,-15 -3.166,-18.501 -13.5,-29.667 -9.534,-10.301 -26.5,-21.001 -41,-19 -14.5,2.001 -23.167,4.832 -33,12 z;
           m 440.667,297.666 c -9.833,7.167 -19.99492,28.84315 -16.49492,48.01015 3.5,19.167 13.16192,23.82285 23.49492,32.98985 10.333,9.167 48.833,20.833 65,10 16.167,-10.833 18.167,-39.333 15.5,-54.333 -2.667,-15 -3.334,-18.499 -13.5,-32.667 -8.183,-11.404 -26.5,-18.001 -41,-16 -14.5,2.001 -23.167,4.832 -33,12 z;
           m 431.667,290.333 c -9.833,7.167 -20.5,27.833 -17,47 3.5,19.167 3.167,20.835 9.5,35.835 3.466,8.21 15.499,35.664 31.666,24.831 C 472,387.166 520.31777,356.14214 519.167,327 c -0.60114,-15.22321 -3.334,-18.499 -13.5,-32.667 -8.183,-11.404 -26.5,-18.001 -41,-16 -14.5,2.001 -23.167,4.832 -33,12 z;
           m 429.834,297.834 c -9.833,7.167 -10.13007,13.61739 -17.86446,45.13554 -7.28059,29.66889 4.03146,22.69946 10.36446,37.69946 3.466,8.21 15.499,35.664 31.666,24.831 16.167,-10.833 66,-55.999 63.334,-70.999 -2.666,-15 -3.334,-18.499 -13.5,-32.667 -8.183,-11.404 -26.5,-18.001 -41,-16 -14.5,2.001 -23.167,4.832 -33,12 z;
           M 430.834,303.834 C 421.001,311.001 414.946,319.315 416,352 c 0.5,15.5 9.667,44.5 16,59.5 3.466,8.21 23.84823,19.35331 40.01523,8.52031 C 488.18223,409.18731 519,369.5 519.5,346 c 0.324,-15.231 -4.5,-23.998 -14.666,-38.166 -8.183,-11.404 -26.5,-18.001 -41,-16 -14.5,2.001 -23.167,4.832 -33,12 z;
           m 430.834,303.834 c -9.833,7.167 -12.888,12.981 -11.834,45.666 0.5,15.5 22,44 38,59.5 6.401,6.201 18.333,9.333 34.5,-1.5 16.167,-10.833 27.5,-38 28,-61.5 0.324,-15.231 -3.334,-27.832 -13.5,-42 -8.183,-11.404 -24,-15.75 -42.166,-12.167 -14.361,2.834 -23.167,4.833 -33,12.001 z;
           m 447,307 c -19,13 -19,38 -17,47 2,9 2,13 24,34 22,21 54,17 65,10 12,-6 15.7059,-35.30548 14,-54 -1.12714,-12.35198 -6.08376,-18.62183 -14,-30 -8.07675,-11.60888 -19,-19 -39,-19 -20,1 -33,12 -33,12 z "
          />
        </path>
      </g>
      <g id="Tete">
        <path
          style={{
            fill: "rgb(255, 176, 57)",
            stroke: "rgb(255, 76, 1)",
            strokeWidth: 4,
          }}
          d=" m 153,165 c -12,49 -28,55 -11,98 18,43 22,45 33,55 12,10 18,13 16,18 -1,5 -12,17 -2,22 10,6 43,10 75,-16 34,-28 43,-55 48,-76 6,-20 -9,-76 -20,-95 -11,-19 -139,-6 -139,-6 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            repeatCount="indefinite"
            fill="freeze"
            values="
           m 153,165 c -12,49 -28,55 -11,98 18,43 22,45 33,55 12,10 18,13 16,18 -1,5 -12,17 -2,22 10,6 43,10 75,-16 34,-28 43,-55 48,-76 6,-20 -9,-76 -20,-95 -11,-19 -139,-6 -139,-6 z;
           m 153.222,185.638 c -9.869,49.473 -25.595,56.16 -6.75,98.384 19.843,42.181 23.926,44.007 35.348,53.521 12.421,9.473 18.546,12.209 16.764,17.291 -0.783,5.039 -11.253,17.504 -1.046,22.066 10.25,5.563 43.393,8.131 74.238,-19.229 32.757,-29.445 40.581,-56.809 44.667,-78.006 5.129,-20.241 -12.279,-75.54 -24.09,-94.046 -11.811,-18.506 -139.131,0.019 -139.131,0.019 z;
           m 160.722,170.138 c -9.869,49.473 -25.595,56.16 -6.75,98.384 19.843,42.181 23.926,44.007 35.348,53.521 12.421,9.473 18.546,12.209 16.764,17.291 -0.783,5.039 -11.253,17.504 -1.046,22.066 10.25,5.563 43.393,8.131 74.238,-19.229 32.757,-29.445 40.581,-56.809 44.667,-78.006 5.129,-20.241 -12.279,-75.54 -24.09,-94.046 -11.811,-18.506 -139.131,0.019 -139.131,0.019 z;
           m 161.995,161.884 c -5.584,50.138 -20.678,58.15 1.723,98.6 23.393,40.32 27.617,41.789 39.814,50.287 13.188,8.371 19.525,10.57 18.186,15.789 -0.347,5.086 -9.708,18.404 0.853,22.074 10.69,4.66 43.93,4.373 72.313,-25.533 30.107,-32.15 35.552,-60.083 37.804,-81.554 3.372,-20.606 -18.721,-74.206 -32.078,-91.629 -13.359,-17.423 -138.615,11.966 -138.615,11.966 z;
           m 146.769,150.843 c 0.471,50.446 -13.553,60.21 13.538,97.682 28.061,37.223 32.43,38.175 45.559,45.148 14.097,6.729 20.652,8.153 19.949,13.494 0.266,5.091 -7.431,19.436 3.494,21.813 11.172,3.344 44.138,-0.928 68.728,-34.022 26.033,-35.529 28.088,-63.914 27.748,-85.5 C 326.66,188.595 295.351,151.695 280,136 264.649,120.304 146.769,150.843 146.769,150.843 z;
           m 162.318,141.398 c -9.432,49.559 -25.098,56.383 -5.882,98.439 20.216,42.003 24.314,43.794 35.82,53.206 12.503,9.363 18.652,12.044 16.916,17.144 -0.738,5.044 -11.098,17.601 -0.852,22.074 10.299,5.47 43.462,7.746 74.065,-19.883 32.496,-29.734 40.077,-57.164 43.978,-78.398 4.95,-20.285 -18.514,-62.607 -30.489,-81.009 -11.976,-18.4 -133.556,-11.573 -133.556,-11.573 z;
           m 157.318,151.398 c -9.432,49.559 -25.098,56.383 -5.882,98.439 20.216,42.003 24.314,43.794 35.82,53.206 12.503,9.363 18.652,12.045 16.916,17.145 -0.738,5.044 -11.098,17.601 -0.852,22.074 10.299,5.47 43.462,7.746 74.065,-19.883 32.496,-29.734 40.077,-57.164 43.978,-78.398 4.95,-20.285 -18.514,-62.607 -30.489,-81.009 -11.976,-18.401 -133.556,-11.574 -133.556,-11.574 z;
           m 153,165 c -12,49 -28,55 -11,98 18,43 22,45 33,55 12,10 18,13 16,18 -1,5 -12,17 -2,22 10,6 43,10 75,-16 34,-28 43,-55 48,-76 6,-20 -9,-76 -20,-95 -11,-19 -139,-6 -139,-6 z "
            dur="0.6s"
          />
        </path>
        <path
          id="cou"
          style={{ fill: "rgb(255, 176, 57)", fillOpacity: 1, stroke: "none" }}
          d="M 278,161 C 298,170 293,163 300,172 307,180 320,216 320,238 321,260 308,292 290,312 275,329 269,338 258,344 248,350 278,161 278,161 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           M 278,161 C 298,170 293,163 300,172 307,180 320,216 320,238 321,260 308,292 290,312 275,329 269,338 258,344 248,350 278,161 278,161 z;
           M277.932,176.235 c20.371,8.126,15.073,1.35,22.455,10.038c7.34,7.69,21.885,43.094,22.836,65.073c1.951,21.936-9.653,54.468-26.771,75.228 c-14.251,17.633-19.856,26.885-30.586,33.355C256.135,366.355,277.932,176.235,277.932,176.235z ;
           M285.432,160.735 c20.371,8.126,15.073,1.35,22.455,10.038c7.34,7.69,21.885,43.094,22.836,65.073c1.951,21.936-9.653,54.468-26.771,75.228 c-14.251,17.633-19.856,26.885-30.586,33.355C263.635,350.855,285.432,160.735,285.432,160.735z ;
           M285.437,141.806 c20.993,6.348,15.133,0.051,23.234,8.073c7.973,7.032,25.505,41.056,28.34,62.872c3.828,21.687-4.94,55.096-20.211,77.249 c-12.685,18.792-17.474,28.491-27.608,35.858C280.048,333.096,285.437,141.806,285.437,141.806z;
           M263.5,125 c21.603,3.784,21.495,1.507,30.5,8.5c8.759,6.024,27.246,24.2,32.677,45.519c6.401,21.071,1.705,55.291-10.799,79.115 c-10.339,20.178-13.93,30.381-23.108,38.911C284.561,305.327,263.5,125,263.5,125z;
           M281.85,138.95 c20.442,7.947,20.782,5.694,28.241,14.317c7.408,7.625,21.971,29.073,23.116,51.043c2.145,21.917-9.172,54.552-26.105,75.461 c-14.095,17.758-19.618,27.06-30.29,33.623C267.137,319.905,281.85,138.95,281.85,138.95z;
           M276.85,148.95 c20.442,7.947,20.782,5.694,28.241,14.317c7.408,7.625,21.971,29.073,23.116,51.043c2.145,21.917-9.172,54.552-26.105,75.461 c-14.095,17.759-19.618,27.06-30.29,33.623C262.137,329.905,276.85,148.95,276.85,148.95z ;
           M 278,161 C 298,170 293,163 300,172 307,180 320,216 320,238 321,260 308,292 290,312 275,329 269,338 258,344 248,350 278,161 278,161 z "
          />
        </path>
        <path
          style={{ fill: "rgb(255, 76, 1)", fillOpacity: 1, stroke: "none" }}
          id="bouche"
          d="M 220,338 C 220,338 226,343 224,350 222,357 220,362 216,362 212,362 221,364 223,361 226,358 228,353 228,348 227,342 223,340 220,338 z "
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           M 220,338 C 220,338 226,343 224,350 222,357 220,362 216,362 212,362 221,364 223,361 226,358 228,353 228,348 227,342 223,340 220,338 z;
           m 227.642,355.578 c 0,0 6.21,4.736 4.515,11.816 -1.695,7.08 -3.477,12.16 -7.473,12.334 -3.997,0.174 5.082,1.781 6.95,-1.303 2.867,-3.127 4.649,-8.207 4.433,-13.203 -1.258,-5.951 -5.341,-7.775 -8.425,-9.644 z;
           m 235.142,340.078 c 0,0 6.21,4.736 4.515,11.816 -1.695,7.08 -3.477,12.16 -7.473,12.334 -3.997,0.174 5.082,1.781 6.95,-1.303 2.867,-3.127 4.649,-8.207 4.433,-13.203 -1.258,-5.951 -5.341,-7.775 -8.425,-9.644 z;
           M250.735,324.805c0,0,6.594,4.186,5.513,11.387 c-1.081,7.199-2.42,12.412-6.386,12.93c-3.967,0.516,5.215,1.336,6.813-1.896c2.588-3.359,3.927-8.574,3.283-13.533 C258.192,327.869,253.967,326.404,250.735,324.805z;
           M254.411,301.942c0,0,7.049,3.364,6.839,10.644 c-0.209,7.276-0.914,12.612-4.789,13.602c-3.876,0.988,5.338,0.701,6.536-2.699c2.166-3.646,2.87-8.983,1.635-13.829 C262.181,304.091,257.812,303.143,254.411,301.942z ;
           M238.236,310.674c0,0,6.252,4.681,4.619,11.777 c-1.632,7.095-3.369,12.188-7.363,12.398c-3.995,0.209,5.097,1.734,6.938-1.364c2.839-3.15,4.576-8.247,4.315-13.24 C245.434,314.305,241.335,312.518,238.236,310.674z ;
           M233.236,320.674c0,0,6.252,4.681,4.619,11.777 c-1.632,7.095-3.369,12.188-7.363,12.398c-3.995,0.209,5.097,1.734,6.938-1.364c2.839-3.15,4.576-8.247,4.315-13.24 C240.434,324.305,236.335,322.518,233.236,320.674z;
           M 220,338 C 220,338 226,343 224,350 222,357 220,362 216,362 212,362 221,364 223,361 226,358 228,353 228,348 227,342 223,340 220,338 z "
          />
        </path>
        <path
          id="nez"
          style={{ fill: "rgb(255, 76, 1)", fillOpacity: 1, stroke: "none" }}
          d=" "
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            fill="freeze"
            values="
           m 199,351 c 0,0 3,0 3,-3 0,-4 -3,-4 -3,-4 0,0 1,1 1,3 0,2 -3,3 -1,4 z;
           m 207.224,369.475 c 0,0 2.997,-0.131 2.867,-3.127 -0.173,-3.996 -3.17,-3.867 -3.17,-3.867 0,0 1.042,0.957 1.129,2.955 0.087,1.998 -2.867,3.127 -0.826,4.039 z;
           m 214.724,353.975 c 0,0 2.997,-0.131 2.867,-3.127 -0.173,-3.996 -3.17,-3.867 -3.17,-3.867 0,0 1.042,0.957 1.129,2.955 0.087,1.998 -2.867,3.127 -0.826,4.039 z;
           m 231.585,340.404 c 0,0 2.975,-0.389 2.588,-3.363 -0.516,-3.965 -3.49,-3.578 -3.49,-3.578 0,0 1.12,0.863 1.378,2.846 0.259,1.982 -2.588,3.361 -0.476,4.095 z;
           m 237.271,319.727 c 0,0 2.907,-0.742 2.167,-3.65 -0.988,-3.874 -3.894,-3.133 -3.894,-3.133 0,0 1.215,0.723 1.709,2.66 0.493,1.936 -2.168,3.647 0.018,4.123 z;
           m 217.941,324.751 c 0,0 2.996,-0.158 2.84,-3.154 -0.209,-3.993 -3.204,-3.836 -3.204,-3.836 0,0 1.05,0.947 1.154,2.943 0.105,1.996 -2.839,3.152 -0.79,4.047 z;
           m 212.941,334.751 c 0,0 2.996,-0.158 2.84,-3.154 -0.209,-3.993 -3.204,-3.836 -3.204,-3.836 0,0 1.05,0.947 1.154,2.943 0.105,1.996 -2.839,3.152 -0.79,4.047 z;
           m 199,351 c 0,0 3,0 3,-3 0,-4 -3,-4 -3,-4 0,0 1,1 1,3 0,2 -3,3 -1,4 z "
          />
        </path>
      </g>
      <g id="Hair">
        <path
          style={{
            fill: "rgb(255, 254, 161)",
            stroke: "rgb(242, 224, 0)",
            strokeWidth: 4,
          }}
          d="m 114.63706,161.7208 c -18.520137,16.0703 -36.040611,34.00508 -36.05584,57.07107 -0.02224,33.68835 15.622848,42.23199 15.622848,42.23199 0,0 -3.683763,-11.10152 -1.016763,-17.76852 3.976,-9.938 8.030455,-17.77868 8.030455,-17.77868 0,0 -3.578694,39.08554 11.96955,64.7792 13.97252,23.08977 27.54183,38.20531 37.81016,43.27208 10.53649,5.19909 28.3051,17.74822 28.3051,17.74822 0,0 -6.94837,-4.66452 -9.22591,-26.70813 -0.94975,-9.19238 5.10293,-14.30079 5.64518,-25.62639 0.93508,-19.53061 -4.59645,-37.13198 -4.59645,-37.13198 0,0 1.25508,9.91422 17.88706,16.59137 6.76372,2.7154 28.28605,-2.0873 28.28605,-2.0873 0,0 -23.95788,-11.57611 -26.66803,-29.30202 -0.43813,-2.86556 6.69745,-0.0101 15.5236,-1.36853 6.4971,-0.99993 21.55913,-1.91522 21.55913,-1.91522 0,0 -27.70859,-20.7707 -22.83959,-45.9797 5.667,-29.333 18.13652,-33.74601 28.40355,-44.80762 4.43401,-4.77716 -5.02346,-17.01049 -21.35279,-24.4137 -9.19578,-4.16908 -76.22095,14.91416 -97.28731,33.19386 z"
        >
          <animate
            attributeType="XML"
            attributeName="d"
            dur="0.6s"
            repeatCount="indefinite"
            values="
           m 114.63706,161.7208 c -18.520137,16.0703 -36.040611,34.00508 -36.05584,57.07107 -0.02224,33.68835 15.622848,42.23199 15.622848,42.23199 0,0 -3.683763,-11.10152 -1.016763,-17.76852 3.976,-9.938 8.030455,-17.77868 8.030455,-17.77868 0,0 -3.578694,39.08554 11.96955,64.7792 13.97252,23.08977 27.54183,38.20531 37.81016,43.27208 10.53649,5.19909 28.3051,17.74822 28.3051,17.74822 0,0 -6.94837,-4.66452 -9.22591,-26.70813 -0.94975,-9.19238 5.10293,-14.30079 5.64518,-25.62639 0.93508,-19.53061 -4.59645,-37.13198 -4.59645,-37.13198 0,0 1.25508,9.91422 17.88706,16.59137 6.76372,2.7154 28.28605,-2.0873 28.28605,-2.0873 0,0 -23.95788,-11.57611 -26.66803,-29.30202 -0.43813,-2.86556 6.69745,-0.0101 15.5236,-1.36853 6.4971,-0.99993 21.55913,-1.91522 21.55913,-1.91522 0,0 -27.70859,-20.7707 -22.83959,-45.9797 5.667,-29.333 18.13652,-33.74601 28.40355,-44.80762 4.43401,-4.77716 -5.02346,-17.01049 -21.35279,-24.4137 -9.19578,-4.16908 -76.22095,14.91416 -97.28731,33.19386 z;
           m 101,189.5 c -19,15.5 -32,33.5 -30.5,50 3.05,33.55 16.633,35.666 16.633,35.666 0,0 1.367,-1 4.034,-7.667 3.976,-9.938 5,-6.667 5,-6.667 0,0 10.333,7.333 15,37 3.871,24.605 -3.785,43.171 -9.667,49.333 -7,7.333 -18.667,9.667 -18.667,9.667 0,0 44.208,5.746 63,-6 10.667,-6.667 19.667,-19.333 24.333,-29.667 6.996,-15.49 5,-24 5,-24 0,0 0.75,1.833 4.25,7.5 3.83,6.201 12.62869,10.03453 12.62869,10.03453 0,0 3.82131,-47.43653 2.12131,-52.53553 -0.917,-2.75 3.667,1 4.917,2.167 4.805,4.486 7.417,6.166 7.417,6.166 0,0 -10.536,-22.791 -5.667,-48 5.667,-29.333 27,-37 38,-47.333 11,-10.333 -18.11116,-31.79847 -36,-33 C 190.30931,141.32283 116.12752,177.15913 101,189.5 z;
           m 107.5,180.167 c -19,15.5 -25.833,39.167 -24.333,55.667 3.05,33.55 19.667,40 19.667,40 0,0 -1,-8.333 1.667,-15 3.976,-9.938 3.333,-7.667 3.333,-7.667 0,0 -0.334,17.333 9.666,31.666 14.251,20.426 20.333,41.333 17.667,54.667 -1.989,9.941 -10.667,18.667 -10.667,18.667 0,0 18.542,2.746 37.333,-9 10.667,-6.668 17.666,-12.665 23.333,-26.334 6.509,-15.701 0.833,-27.499 0.833,-27.499 0,0 1.167,1.5 4.583,4.75 2.78,2.645 4.083,4.25 4.083,4.25 10.333,-23.332 6.867,-44.401 5.167,-49.5 -0.917,-2.75 3.667,1 4.917,2.167 4.805,4.486 7.417,6.166 7.417,6.166 0,0 -9.203,-27.458 -4.333,-52.667 5.667,-29.333 17,-36 28,-46.333 11,-10.333 -20.667,-24.334 -33,-22.001 -12.333,2.333 -95.333,38.001 -95.333,38.001 z;
           m 126.167,170.167 c -19,15.5 -27.833,47.5 -26.333,64 3.05,33.55 23,42 23,42 0,0 1.667,-4.82 1.667,-12 0,-10 0,-12.667 0,-12.667 0,0 4,16 14,30.333 14.251,20.426 32.5,25 35.667,48.333 1.363,10.046 0.333,33.333 0.333,33.333 0,0 7.191,-0.803 23,-16.333 9.5,-9.333 14.388,-25.872 14.667,-40.667 0.333,-17.667 -6.333,-24 -6.333,-24 0,0 4.25,8.75 7.667,12 2.78,2.645 6,3.667 6,3.667 4.333,-24.333 -5.633,-42.901 -7.333,-48 -0.917,-2.75 6.083,0.5 7.333,1.667 4.805,4.486 10,4.667 10,4.667 0,0 -22.87,-38.124 -18,-63.333 5.667,-29.333 8.333,-35 19.333,-45.333 11,-10.333 -13.833,-8.001 -26.167,-5.667 -12.334,2.334 -78.501,28 -78.501,28 z;
           m 129.667,149.667 c -19,15.5 -26,47.5 -24.5,64 3.05,33.55 25.167,51.333 25.167,51.333 0,0 -4.167,-14.153 -4.167,-21.333 0,-10 1.833,-12.667 1.833,-12.667 0,0 6.635,21.438 15.5,36.5 17.167,29.167 27.167,34.667 36,47.5 5.748,8.351 25,34.5 25,34.5 0,0 4.537,-9.733 8.5,-24 3.125,-11.25 2.5,-24.75 1.5,-39.625 -0.771,-11.475 -6.125,-24 -6.125,-24 0,0 5.641,8.602 9.625,11.125 3.75,2.375 12.167,1.833 12.167,1.833 0,-24 -12.5,-37.667 -17.833,-45.333 -1.655,-2.38 9.016,1.386 10.667,1.833 9.375,2.542 13.5,0.167 13.5,0.167 0,0 -29.75,-35.325 -29.75,-61 0,-16.75 10,-35.167 21,-45.5 11,-10.333 -35.417,-5.333 -47.75,-3 -12.333,2.333 -50.334,27.667 -50.334,27.667 z;
           m 127.833,141.833 c -19,15.5 -29.5,46.833 -28,63.333 3.05,33.55 19.333,48.333 19.333,48.333 0,0 0.333,-7.153 0.333,-14.333 0,-10 1.25,-6.5 1.25,-6.5 0,0 5.906,23.721 14.083,39.167 15,28.333 20.833,35.501 29.667,48.333 5.748,8.352 31,33 31,33 0,0 -10.296,-23.399 -6.333,-37.667 3.125,-11.25 10.667,-23.125 9.667,-38 -0.771,-11.475 -13,-35.667 -13,-35.667 0,0 10.946,19.074 14,22.667 5.667,6.667 24.667,12.333 24.667,12.333 -8,-25.667 -17.667,-45 -23,-52.667 -1.655,-2.38 10.333,7.667 14.25,8.833 9.309,2.772 16.75,0.167 16.75,0.167 0,0 -21.333,-32.325 -21.333,-58 0,-16.75 10.667,-29.667 21.667,-40 11,-10.333 -47.75,-13.833 -60.083,-11.5 -12.333,2.333 -44.918,18.168 -44.918,18.168 z;
           m 117.833,141.833 c -19,15.5 -29.5,46.833 -28,63.333 3.05,33.55 19.333,48.333 19.333,48.333 0,0 0.333,-7.153 0.333,-14.333 0,-10 1.25,-6.5 1.25,-6.5 0,0 5.572,25.387 13.75,40.833 15,28.333 22.50681,36.9691 34.01523,47.46954 13.55584,12.36854 37.54569,18.95432 37.54569,18.95432 0,0 -8.52772,-11.18456 -10.52539,-24.90863 -2.43641,-16.73834 -2.30631,-27.66182 -3.07106,-42.55076 -0.771,-15.01054 -6.63147,-30.63147 -6.63147,-30.63147 0,0 6.59693,16.12231 21.668,23.668 11.99668,6.00642 28,4.5 28,4.5 -28.15229,-23.50508 -28.667,-38.167 -34,-45.833 -1.655,-2.38 2.75686,3.62639 14.75508,8.32792 C 215.29851,236.03862 232.5,233 232.5,233 c 0,0 -24,-22.325 -24,-48 0,-16.75 6,-33.167 17,-43.5 11,-10.333 -50.417,-20.167 -62.75,-17.833 -12.333,2.334 -44.917,18.166 -44.917,18.166 z;
           m 114.63706,161.7208 c -18.520137,16.0703 -36.040611,34.00508 -36.05584,57.07107 -0.02224,33.68835 15.622848,42.23199 15.622848,42.23199 0,0 -3.683763,-11.10152 -1.016763,-17.76852 3.976,-9.938 8.030455,-17.77868 8.030455,-17.77868 0,0 -3.578694,39.08554 11.96955,64.7792 13.97252,23.08977 27.54183,38.20531 37.81016,43.27208 10.53649,5.19909 28.3051,17.74822 28.3051,17.74822 0,0 -6.94837,-4.66452 -9.22591,-26.70813 -0.94975,-9.19238 5.10293,-14.30079 5.64518,-25.62639 0.93508,-19.53061 -4.59645,-37.13198 -4.59645,-37.13198 0,0 1.25508,9.91422 17.88706,16.59137 6.76372,2.7154 28.28605,-2.0873 28.28605,-2.0873 0,0 -23.95788,-11.57611 -26.66803,-29.30202 -0.43813,-2.86556 6.69745,-0.0101 15.5236,-1.36853 6.4971,-0.99993 21.55913,-1.91522 21.55913,-1.91522 0,0 -27.70859,-20.7707 -22.83959,-45.9797 5.667,-29.333 18.13652,-33.74601 28.40355,-44.80762 4.43401,-4.77716 -5.02346,-17.01049 -21.35279,-24.4137 -9.19578,-4.16908 -76.22095,14.91416 -97.28731,33.19386 z "
          />
        </path>
      </g>
      <g id="Chapo">
        <g id="layer3">
          <path
            style={{
              fill: "rgb(204, 135, 44)",
              stroke: "rgb(169, 111, 37)",
              strokeWidth: "4.9px",
            }}
            d="M102,167 c0,0,9-17,13-40c4-24,7-48.6,12-52.3c5-3.7,24,0.8,34-1.5c10-2.2,61-25.1,81-26.6c20-1.5,19-1.1,24,4.8c4,5.9,10,18.1,16,30.7 C288,94.7,294,106,299,112C305,119,102,167,102,167z"
            id="path3026"
          >
            <animate
              attributeType="XML"
              attributeName="d"
              dur="0.6s"
              repeatCount="indefinite"
              values="
             M102,167 c0,0,9-17,13-40c4-24,7-48.6,12-52.3c5-3.7,24,0.8,34-1.5c10-2.2,61-25.1,81-26.6c20-1.5,19-1.1,24,4.8c4,5.9,10,18.1,16,30.7 C288,94.7,294,106,299,112C305,119,102,167,102,167z ;
             M104.197,184.416c0,0,8.607-17.202,12.079-40.287c3.448-24.086,5.882-48.748,10.796-52.562c4.914-3.814,24.013,0.249,33.958-2.28 c9.946-2.429,60.408-26.494,80.368-28.452c19.96-1.958,18.969-1.535,24.104,4.248c4.134,5.807,10.413,17.866,16.699,30.325 c6.288,12.459,12.546,23.618,17.682,29.502C306.042,131.77,104.197,184.416,104.197,184.416z;
             M105.35,175.856 c0,0,7.525-17.702,9.559-40.958c1.949-24.253,2.851-49.019,7.518-53.13c4.668-4.111,23.982-1.239,33.751-4.379 c9.777-3.041,58.65-30.186,78.451-33.377c19.8-3.191,18.837-2.707,24.321,2.747c4.485,5.54,11.5,17.187,18.546,29.232 c7.048,12.045,13.985,22.795,19.476,28.35C303.545,110.805,105.35,175.856,105.35,175.856z;
             M107.565,168.549c0,0,6.527-18.094,7.262-41.427c0.594-24.324,0.113-49.102,4.544-53.466c4.432-4.365,23.876-2.574,33.454-6.254 c9.592-3.581,56.876-33.408,76.468-37.699c19.592-4.29,18.657-3.753,24.437,1.387c4.787,5.281,12.44,16.519,20.146,28.153 c7.709,11.633,15.234,21.98,21.026,27.22C301.826,92.551,107.565,168.549,107.565,168.549z;
             M103.648,155.524c0,0,6.527-18.094,7.262-41.427c0.594-24.324,0.113-49.102,4.544-53.466c4.432-4.365,23.876-2.574,33.454-6.254 c9.592-3.581,56.876-33.408,76.468-37.699c19.592-4.29,18.657-3.753,24.437,1.387c4.787,5.281,12.44,16.519,20.146,28.153 c7.709,11.633,15.234,21.98,21.026,27.22C297.908,79.526,103.648,155.524,103.648,155.524z ;
             M110.61,140.92 c0,0,8.225-17.388,11.185-40.545c2.915-24.156,4.803-48.866,9.631-52.788c4.828-3.921,24.012-0.281,33.899-3.03 c9.891-2.648,59.807-27.822,79.72-30.222c19.912-2.398,18.93-1.954,24.192,3.715c4.261,5.714,10.805,17.631,17.365,29.948 c6.563,12.317,13.065,23.335,18.33,29.104C311.241,83.825,110.61,140.92,110.61,140.92z;
             M102.55,150.369 c0,0,8.225-17.388,11.185-40.545c2.915-24.156,4.803-48.866,9.631-52.788c4.828-3.921,24.012-0.281,33.899-3.03 c9.891-2.648,59.807-27.822,79.72-30.222c19.912-2.398,18.93-1.954,24.192,3.715c4.261,5.714,10.805,17.631,17.365,29.948 c6.563,12.317,13.065,23.335,18.33,29.104C303.181,93.274,102.55,150.369,102.55,150.369z;
             M102,167 c0,0,9-17,13-40c4-24,7-48.6,12-52.3c5-3.7,24,0.8,34-1.5c10-2.2,61-25.1,81-26.6c20-1.5,19-1.1,24,4.8c4,5.9,10,18.1,16,30.7 C288,94.7,294,106,299,112C305,119,102,167,102,167z "
            />
          </path>
          <path
            style={{
              fill: "rgb(204, 135, 44)",
              fillOpacity: 1,
              stroke: "rgb(169, 111, 37)",
              strokeWidth: 4,
            }}
            d="M 9.62,149 C 9.62,149 18.9,165 54,165 89.1,166 133,154 159,143 184,132 216,105 252,101 288,96.8 309,101 321,110 333,120 362,145 368,154 375,163 375,163 375,170 376,177 376,179 376,179 376,179 357,173 331,169 304,165 284,165 272,159 261,153 241,148 202,152 164,157 117,171 90.3,173 63.6,175 36.3,188 9.62,149 z"
            id="path3796"
          >
            <animate
              attributeType="XML"
              attributeName="d"
              values="
             M 9.62,149 C 9.62,149 18.9,165 54,165 89.1,166 133,154 159,143 184,132 216,105 252,101 288,96.8 309,101 321,110 333,120 362,145 368,154 375,163 375,163 375,170 376,177 376,179 376,179 376,179 357,173 331,169 304,165 284,165 272,159 261,153 241,148 202,152 164,157 117,171 90.3,173 63.6,175 36.3,188 9.62,149 z;
             m 11.428,168.541 c 0,0 9.645,15.783 44.735,14.978 35.113,0.194 78.726,-12.81 104.468,-24.404 24.741,-11.57 56.113,-39.298 92.011,-44.123 35.894,-5.025 56.985,-1.308 69.188,7.414 12.227,9.722 41.793,34.05 47.997,42.909 7.205,8.837 7.205,8.837 7.366,15.835 1.16,6.976 1.206,8.975 1.206,8.975 0,0 -19.132,-5.562 -45.218,-8.964 -27.084,-3.379 -47.078,-2.92 -59.213,-8.644 -11.134,-5.746 -31.244,-10.285 -70.142,-5.392 -37.875,5.871 -84.542,20.946 -111.189,23.558 -26.647,2.612 -53.641,16.235 -81.209,-22.142 z;
             m 11.776,165.759 c 0,0 10.604,15.155 45.577,12.177 35.058,-1.982 77.781,-17.663 102.754,-30.83 23.977,-13.081 53.57,-42.699 89.101,-49.739 35.514,-7.239 56.795,-4.836 69.514,3.113 12.806,8.946 43.823,31.394 50.564,39.853 7.739,8.374 7.739,8.374 8.333,15.349 1.59,6.891 1.76,8.883 1.76,8.883 0,0 -19.44,-4.366 -45.687,-6.146 -27.241,-1.695 -47.168,0.002 -59.635,-4.958 -11.469,-5.045 -31.822,-8.33 -70.342,-1.035 -37.439,8.206 -83.082,26.144 -109.515,30.402 -26.434,4.257 -52.533,19.527 -82.424,-17.069 z;
             m 13.574,163.685 c 0,0 11.432,14.54 46.185,9.618 34.893,-3.933 76.676,-21.972 100.876,-36.51 23.21,-14.397 51.106,-45.619 86.19,-54.629 35.055,-9.207 56.437,-7.995 69.58,-0.767 13.285,8.218 45.505,28.903 52.707,36.972 8.194,7.929 8.194,7.929 9.175,14.86 1.972,6.791 2.252,8.771 2.252,8.771 0,0 -19.653,-3.276 -45.958,-3.589 -27.293,-0.174 -47.095,2.631 -59.818,-1.626 -11.733,-4.398 -32.237,-6.543 -70.29,2.888 -36.923,10.281 -81.495,30.734 -107.65,36.46 -26.157,5.724 -51.364,22.424 -83.249,-12.448 z;
             m 9.657,150.66 c 0,0 11.432,14.54 46.185,9.617 34.893,-3.933 76.676,-21.972 100.876,-36.51 23.21,-14.397 51.106,-45.619 86.19,-54.629 35.055,-9.207 56.437,-7.995 69.58,-0.767 13.285,8.218 45.505,28.903 52.707,36.972 8.194,7.929 8.194,7.929 9.175,14.86 1.972,6.791 2.252,8.771 2.252,8.771 0,0 -19.653,-3.276 -45.958,-3.589 -27.293,-0.174 -47.095,2.631 -59.818,-1.626 -11.733,-4.398 -32.237,-6.543 -70.29,2.888 -36.923,10.281 -81.495,30.734 -107.65,36.46 -26.157,5.724 -51.364,22.425 -83.249,-12.447 z;
             m 17.513,127.099 c 0,0 9.991,15.566 45.056,13.985 35.109,-0.582 78.423,-14.548 103.902,-26.708 24.48,-12.114 55.23,-40.529 91.014,-46.146 35.774,-5.817 56.942,-2.567 69.335,5.883 12.439,9.45 42.536,33.117 48.934,41.838 7.398,8.676 7.398,8.676 7.714,15.668 1.313,6.949 1.404,8.947 1.404,8.947 0,0 -19.25,-5.138 -45.405,-7.963 -27.152,-2.78 -47.131,-1.879 -59.389,-7.333 -11.259,-5.498 -31.465,-9.592 -70.245,-3.839 -37.736,6.707 -84.058,22.81 -110.64,26.01 -26.584,3.2 -53.271,17.417 -81.68,-20.342 z;
             m 9.453,136.548 c 0,0 9.991,15.566 45.056,13.985 35.109,-0.582 78.423,-14.548 103.902,-26.708 24.48,-12.114 55.23,-40.529 91.014,-46.146 35.774,-5.817 56.942,-2.567 69.335,5.883 12.439,9.45 42.536,33.117 48.934,41.838 7.398,8.676 7.398,8.676 7.714,15.668 1.313,6.949 1.404,8.947 1.404,8.947 0,0 -19.25,-5.138 -45.405,-7.963 -27.152,-2.78 -47.131,-1.879 -59.389,-7.333 -11.259,-5.498 -31.465,-9.592 -70.245,-3.839 -37.736,6.707 -84.058,22.81 -110.64,26.01 -26.584,3.2 -53.272,17.417 -81.68,-20.342 z;
             M 9.62,149 C 9.62,149 18.9,165 54,165 89.1,166 133,154 159,143 184,132 216,105 252,101 288,96.8 309,101 321,110 333,120 362,145 368,154 375,163 375,163 375,170 376,177 376,179 376,179 376,179 357,173 331,169 304,165 284,165 272,159 261,153 241,148 202,152 164,157 117,171 90.3,173 63.6,175 36.3,188 9.62,149 z "
              dur="0.6s"
              repeatCount="indefinite"
            />
          </path>
          <path
            style={{
              fill: "rgb(169, 111, 37)",
              fillOpacity: 1,
              stroke: "none",
            }}
            d="M161,84.2c0,0,13,2.3,30-1.8c18-4.2,43-13.6,43-13.6 s-15,12.2-34,17C182,90.5,173,88.4,161,84.2z"
            id="path3798"
          >
            <animate
              attributeType="XML"
              attributeName="d"
              dur="0.6s"
              repeatCount="indefinite"
              values="
             M161,84.2c0,0,13,2.3,30-1.8c18-4.2,43-13.6,43-13.6 s-15,12.2-34,17C182,90.5,173,88.4,161,84.2z;
             M161.281,100.284c0,0,13.05,2.001,29.951-2.488 c17.899-4.612,42.676-14.583,42.676-14.583s-14.716,12.541-33.601,17.775C182.42,106.1,173.374,104.207,161.281,100.284z;
             M157.111,88.349c0,0,13.148,1.189,29.74-4.339 c17.579-5.712,41.691-17.199,41.691-17.199s-13.91,13.429-32.435,19.823C178.57,92.844,169.425,91.515,157.111,88.349z ;
             M154.368,78.293c0,0,13.195,0.454,29.452-5.99 c17.233-6.683,40.667-19.497,40.667-19.497s-13.14,14.183-31.279,21.601C176.044,81.585,166.839,80.768,154.368,78.293z;
             M150.45,65.268c0,0,13.195,0.454,29.452-5.99 c17.233-6.683,40.667-19.497,40.667-19.497s-13.14,14.183-31.279,21.601C172.127,68.56,162.922,67.743,150.45,65.268z; M165.82,55.546c0,0,13.091,1.713,29.89-3.15 c17.792-5.006,42.343-15.523,42.343-15.523s-14.435,12.863-33.199,18.514C187.083,60.894,177.998,59.201,165.82,55.546z;
             M157.76,64.995c0,0,13.091,1.713,29.89-3.15 c17.792-5.006,42.343-15.523,42.343-15.523s-14.435,12.863-33.199,18.514C179.023,70.343,169.938,68.65,157.76,64.995z ;
             M161,84.2c0,0,13,2.3,30-1.8c18-4.2,43-13.6,43-13.6 s-15,12.2-34,17C182,90.5,173,88.4,161,84.2z "
            />
          </path>
          <path
            style={{
              fill: "rgb(169, 111, 37)",
              fillOpacity: 1,
              stroke: "none",
            }}
            d="m 343,171 c 0,0 -8,0 -25,-8 -17,-8 -26,-18 -48,-20 -22,-2 16,21 16,21 l 57,7 z"
            id="path3800"
          >
            <animate
              attributeType="XML"
              attributeName="d"
              dur="0.6s"
              repeatCount="indefinite"
              values="
             m 343,171 c 0,0 -8,0 -25,-8 -17,-8 -26,-18 -48,-20 -22,-2 16,21 16,21 l 57,7 z;
             M345.225,182.884c0,0-7.998,0.184-25.177-7.425 c-17.18-7.607-26.407-17.398-48.447-18.892c-22.04-1.495,16.478,20.627,16.478,20.627L345.225,182.884z;
             M345.82,159.393c0,0-7.972,0.679-25.588-5.85 c-17.618-6.528-27.434-15.728-49.524-15.854c-22.09-0.127,17.724,19.566,17.724,19.566L345.82,159.393z;
             M346.743,138.707c0,0-7.921,1.122-25.875-4.415 c-17.954-5.535-28.268-14.174-50.331-13.069c-22.063,1.105,18.787,18.548,18.787,18.548L346.743,138.707z ;
             M342.826,125.682c0,0-7.921,1.122-25.875-4.415 c-17.954-5.535-28.268-14.174-50.331-13.069c-22.063,1.105,18.787,18.548,18.787,18.548L342.826,125.682z;
             M351.545,134.061c0,0-7.992,0.36-25.334-6.867 c-17.344-7.225-26.785-16.81-48.853-17.817c-22.068-1.007,16.93,20.258,16.93,20.258L351.545,134.061z;
             M343.485,143.51c0,0-7.992,0.36-25.334-6.867 c-17.344-7.225-26.785-16.81-48.853-17.817c-22.068-1.007,16.93,20.258,16.93,20.258L343.485,143.51z;
             m 343,171 c 0,0 -8,0 -25,-8 -17,-8 -26,-18 -48,-20 -22,-2 16,21 16,21 l 57,7 z "
            />
          </path>
        </g>
      </g>
      <g id="oreilles">
        <g id="g4814">
          <path
            id="path4800"
            d="M 289,171 C 277,146 268,125 231,113 193,100 173,108 171,111 169,115 173,134 194,154 214,174 247,186 289,171 z"
            style={{
              fill: "rgb(255, 176, 57)",
              stroke: "rgb(255, 76, 1)",
              strokeWidth: 4,
            }}
          >
            <animate
              attributeType="XML"
              attributeName="d"
              dur="0.6s"
              repeatCount="indefinite"
              values="
             M289,171 c-12-25-21-46-58-58c-38-13-58-5-60-2c-2,4,2,23,23,43C214,174,247,186,289,171z;
             M290.833,183.5 c-12-25-21-46-58-58c-38-13-58-5-60-2c-2,4,2,23,23,43C215.833,186.5,248.833,198.5,290.833,183.5z;
             M293.671,165.548 c-14.937-23.364-26.412-43.121-64.592-50.556c-39.294-8.306-58.179,2.055-59.801,5.275c-1.501,4.212,4.769,22.589,28.034,39.901 C219.585,177.601,253.795,185.52,293.671,165.548z ;
             M295.089,150.22 c-17.981-21.111-32.042-39.119-70.878-41.282c-40.06-2.874-57.356,9.964-58.525,13.375c-0.913,4.378,7.802,21.729,33.21,35.708 C223.336,172.257,258.306,175.44,295.089,150.22z;
             M286.057,129.612 c-19.178-20.03-34.261-37.191-73.158-37.092c-40.159-0.541-56.68,13.281-57.648,16.754c-0.657,4.423,9.052,21.238,35.229,33.718 C215.706,155.782,250.802,156.927,286.057,129.612z;
             M295.135,137.735 c-17.104-21.828-30.417-40.396-69.133-44.142c-39.909-4.508-57.715,7.613-59.022,10.974c-1.091,4.337,6.908,22.029,31.724,37.035 C222.542,156.823,257.354,161.431,295.135,137.735z;
             M288.169,148.133 c-15.12-23.247-26.748-42.914-64.985-50.049c-39.358-7.999-58.161,2.51-59.759,5.743c-1.468,4.224,4.945,22.55,28.345,39.68 C214.179,160.765,248.45,168.416,288.169,148.133z;
             M289,171 c-12-25-21-46-58-58c-38-13-58-5-60-2c-2,4,2,23,23,43C214,174,247,186,289,171z "
            />
          </path>
          <path
            id="path4808"
            d=" "
            style={{ fill: "rgb(255, 76, 1)", fillOpacity: 1, stroke: "none" }}
          >
            <animate
              attributeType="XML"
              attributeName="d"
              dur="0.6s"
              repeatCount="indefinite"
              values="
             M211,117c0,0,20,8,28,22c7,13,7,22,7,22s-5-18-17-28 C217,122,211,117,211,117z;
             M212.833,129.5c0,0,20,8,28,22c7,13,7,22,7,22 s-5-18-17-28C218.833,134.5,212.833,129.5,212.833,129.5z;
             M209.71,121.383c0,0,20.821,5.521,30.456,18.45 c8.522,12.057,9.611,20.991,9.611,20.991s-7.141-17.263-20.263-25.737C216.271,125.62,209.71,121.383,209.71,121.383z;
             M205.893,117.909c0,0,21.379,2.632,32.687,14.128 c10.085,10.784,12.381,19.486,12.381,19.486s-9.427-16.128-23.582-22.736C212.97,121.212,205.893,117.909,205.893,117.909z;
             M195.133,102.54c0,0,21.496,1.385,33.453,12.204 c10.695,10.179,13.493,18.733,13.493,18.733s-10.349-15.553-24.863-21.327C202.39,105.426,195.133,102.54,195.133,102.54z;
             M207.333,101.808c0,0,21.254,3.503,32.083,15.451 c9.637,11.187,11.576,19.975,11.576,19.975s-8.761-16.5-22.633-23.68C214.27,105.396,207.333,101.808,207.333,101.808z;
             M203.864,104.625c0,0,20.864,5.358,30.6,18.211 c8.616,11.991,9.775,20.915,9.775,20.915s-7.276-17.206-20.464-25.577C210.459,108.811,203.864,104.625,203.864,104.625z;
             M211,117c0,0,20,8,28,22c7,13,7,22,7,22s-5-18-17-28 C217,122,211,117,211,117z "
            />
          </path>
          <path
            id="path4810"
            d=" "
            style={{
              fill: "rgb(255, 176, 57)",
              fillOpacity: 1,
              stroke: "none",
            }}
          >
            <animate
              attributeType="XML"
              attributeName="d"
              dur="0.6s"
              repeatCount="indefinite"
              values="
             m 192,144 c 0,0 27,30 36,39 10,9 65,-8 65,-8 0,0 -9,-23 -23,-34 -14,-11 -5,25 -16,26 -11,0 -62,-23 -62,-23 z;
             m 193.833,156.5 c 0,0 27,30 36,39 10,9 65,-8 65,-8 0,0 -9,-23 -23,-34 -14,-11 -5,25 -16,26 -11,0 -62,-23 -62,-23 z;
             m 194.117,150.484 c 0,0 30.432,26.512 40.455,34.357 11.016,7.724 63.554,-15.806 63.554,-15.806 0,0 -11.717,-21.742 -26.945,-30.967 -15.229,-9.225 -1.938,25.421 -12.736,27.745 -10.92,1.331 -64.328,-15.329 -64.328,-15.329 z;
             m 194.41,148.863 c 0,0 33.761,22.118 44.759,28.524 11.965,6.151 60.808,-24.319 60.808,-24.319 0,0 -14.57,-19.943 -30.914,-27.007 -16.344,-7.064 1.544,25.448 -8.837,29.222 -10.636,2.806 -65.816,-6.42 -65.816,-6.42 z;
             m 185.469,134.109 c 0,0 34.989,20.118 46.341,25.874 12.303,5.445 59.292,-27.813 59.292,-27.813 0,0 -15.705,-19.062 -32.431,-25.165 -16.726,-6.102 3.021,25.315 -7.124,29.686 -10.455,3.422 -66.078,-2.582 -66.078,-2.582 z;
             m 194.596,132.267 c 0,0 32.829,23.479 43.557,30.328 11.705,6.634 61.75,-21.816 61.75,-21.816 0,0 -13.744,-20.521 -29.785,-28.247 -16.041,-7.725 0.503,25.49 -10.023,28.836 -10.741,2.371 -65.499,-9.101 -65.499,-9.101 z ;
             m 188.5,133.848 c 0,0 30.638,26.273 40.722,34.04 11.076,7.638 63.429,-16.303 63.429,-16.303 0,0 -11.887,-21.65 -27.186,-30.755 -15.3,-9.106 -1.74,25.435 -12.52,27.843 -10.908,1.416 -64.445,-14.825 -64.445,-14.825 z;
             m 192,144 c 0,0 27,30 36,39 10,9 65,-8 65,-8 0,0 -9,-23 -23,-34 -14,-11 -5,25 -16,26 -11,0 -62,-23 -62,-23 z "
            />
          </path>
        </g>
      </g>
    </svg>
  );
};

const CatAnimation = () => {
  return (
    <React.Fragment>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 500 500"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: 180, maxWidth: 180 }}
      >
        <defs>
          <clipPath id="__lottie_element_1208">
            <rect width={500} height={500} x={0} y={0} />
          </clipPath>
        </defs>
        <g clipPath="url(#__lottie_element_1208)">
          <g
            transform="matrix(1,0,0,1,0,0)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,130.25999450683594,314.0889892578125)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M29.48900032043457,-23.106000900268555 C29.48900032043457,-23.106000900268555 14.680000305175781,-7.7870001792907715 1.659000039100647,-8.553000450134277 C-11.362000465393066,-9.319000244140625 -22.59600067138672,-14.935999870300293 -30.766000747680664,-13.659000396728516 C-38.93600082397461,-12.381999969482422 -49.915000915527344,-8.553000450134277 -47.617000579833984,4.2129998207092285 C-45.319000244140625,16.979000091552734 -35.106998443603516,24.382999420166016 -18,25.14900016784668 C-0.8939999938011169,25.915000915527344 26.93600082397461,19.277000427246094 38.42499923706055,13.14900016784668 C49.915000915527344,7.021999835968018 40.97800064086914,-21.319000244140625 37.40399932861328,-23.617000579833984 C33.82899856567383,-25.915000915527344 29.48900032043457,-23.106000900268555 29.48900032043457,-23.106000900268555z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,130.25999450683594,314.0889892578125)"
            >
              <path
                strokeLinecap="butt"
                strokeLinejoin="miter"
                fillOpacity={0}
                strokeMiterlimit={10}
                stroke="rgb(118,19,99)"
                strokeOpacity={1}
                strokeWidth={5}
                d=" M29.48900032043457,-23.106000900268555 C29.48900032043457,-23.106000900268555 14.680000305175781,-7.7870001792907715 1.659000039100647,-8.553000450134277 C-11.362000465393066,-9.319000244140625 -22.59600067138672,-14.935999870300293 -30.766000747680664,-13.659000396728516 C-38.93600082397461,-12.381999969482422 -49.915000915527344,-8.553000450134277 -47.617000579833984,4.2129998207092285 C-45.319000244140625,16.979000091552734 -35.106998443603516,24.382999420166016 -18,25.14900016784668 C-0.8939999938011169,25.915000915527344 26.93600082397461,19.277000427246094 38.42499923706055,13.14900016784668 C49.915000915527344,7.021999835968018 40.97800064086914,-21.319000244140625 37.40399932861328,-23.617000579833984 C33.82899856567383,-25.915000915527344 29.48900032043457,-23.106000900268555 29.48900032043457,-23.106000900268555z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,103.5479965209961,319.9779968261719)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M8.329999923706055,-15.654000282287598 C8.329999923706055,-15.654000282287598 4.5,-0.7179999947547913 11.520999908447266,7.451000213623047 C18.542999267578125,15.621999740600586 18.79800033569336,16.483999252319336 18.79800033569336,16.483999252319336 C18.79800033569336,16.483999252319336 9.35099983215332,17.441999435424805 1.9470000267028809,15.942000389099121 C-9.064000129699707,14.442000389099121 -18.000999450683594,7.0370001792907715 -18.638999938964844,-4.068999767303467 C-18.79800033569336,-7.708000183105469 -18.159000396728516,-9.972999572753906 -15.510000228881836,-12.430999755859375 C-12.734000205993652,-15.239999771118164 -5.650000095367432,-17.058000564575195 -2.3310000896453857,-17.18600082397461 C1.850000023841858,-17.441999435424805 8.329999923706055,-15.654000282287598 8.329999923706055,-15.654000282287598z"
              />
            </g>
            <g
              opacity="0.3"
              transform="matrix(1,0,0,1,130.86700439453125,325.3599853515625)"
            >
              <path
                fill="rgb(113,57,5)"
                fillOpacity={1}
                d=" M-43.308998107910156,-0.4830000102519989 C-43.308998107910156,-0.4830000102519989 -28.43600082397461,5.453999996185303 -10.435999870300293,3.6659998893737793 C7.564000129699707,1.878000020980835 43.30799865722656,-11.39799976348877 43.30799865722656,-11.39799976348877 C43.30799865722656,-11.39799976348877 41.7760009765625,-5.078999996185303 38.20199966430664,-1.503999948501587 C34.62699890136719,2.069999933242798 10.564000129699707,9.682000160217285 -9.414999961853027,11.182000160217285 C-26.075000762939453,12.267000198364258 -37.244998931884766,9.41100025177002 -43.308998107910156,-0.4830000102519989z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,126.11100006103516,302.5989990234375)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M-38.361000061035156,5.235000133514404 C-38.361000061035156,5.235000133514404 -26.235000610351562,0.7670000195503235 -14.489999771118164,5.107999801635742 C-2.744999885559082,9.447999954223633 5.808000087738037,12.255999565124512 18.19099998474121,6.001999855041504 C30.573999404907227,-0.2540000081062317 38.361000061035156,-8.168000221252441 38.361000061035156,-8.168000221252441 C38.361000061035156,-8.168000221252441 35.21900177001953,-9.645000457763672 35.21900177001953,-9.645000457763672 C35.21900177001953,-9.645000457763672 22.36400032043457,3.568000078201294 9.654000282287598,5.24399995803833 C-1.6920000314712524,6.416999816894531 -12.581999778747559,1.031000018119812 -22.635000228881836,0.2160000056028366 C-32.61600112915039,-0.11900000274181366 -38.361000061035156,5.235000133514404 -38.361000061035156,5.235000133514404z"
              />
            </g>
          </g>
          <g
            transform="matrix(1,0.000003963627932535019,-0.000003963627932535019,1,0.001129150390625,-0.001373291015625)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,368.531005859375,266.4419860839844)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M-24.95199966430664,-20.138999938964844 C-24.95199966430664,-20.138999938964844 18.96299934387207,-17.714000701904297 22.26799964904785,-6.908999919891357 C24.95199966430664,2.446000099182129 2.0230000019073486,20.138999938964844 2.0230000019073486,20.138999938964844"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,368.26300048828125,265.9849853515625)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-24.64299964904785,-20.413000106811523 C-22.81800079345703,-20.79599952697754 -21.006000518798828,-21.033000946044922 -19.190000534057617,-21.187000274658203 C-17.37700080871582,-21.32200050354004 -15.548999786376953,-21.514999389648438 -13.767000198364258,-21.246999740600586 C-10.192999839782715,-20.82900047302246 -6.620999813079834,-20.368999481201172 -3.055000066757202,-19.77899932861328 C0.5109999775886536,-19.190000534057617 4.072000026702881,-18.496000289916992 7.619999885559082,-17.5939998626709 C11.166000366210938,-16.666000366210938 14.710000038146973,-15.612000465393066 18.19700050354004,-13.854999542236328 C19.926000595092773,-12.949000358581543 21.68899917602539,-11.897000312805176 23.246000289916992,-10.135000228881836 C24.009000778198242,-9.26200008392334 24.715999603271484,-8.116000175476074 25.035999298095703,-6.75 C25.33799934387207,-5.460999965667725 25.28700065612793,-4.230000019073486 25.101999282836914,-3.1110000610351562 C24.702999114990234,-0.8709999918937683 23.81399917602539,0.9679999947547913 22.847999572753906,2.6640000343322754 C21.868999481201172,4.354000091552734 20.76099967956543,5.890999794006348 19.600000381469727,7.355000019073486 C17.270999908447266,10.276000022888184 14.722000122070312,12.906999588012695 12.085000038146973,15.418999671936035 C11.42199993133545,16.04400062561035 10.767000198364258,16.677000045776367 10.04699993133545,17.236000061035156 C9.329999923706055,17.797000885009766 8.53600025177002,18.267000198364258 7.763999938964844,18.757999420166016 C6.191999912261963,19.711999893188477 4.579999923706055,20.583999633789062 2.8440001010894775,21.31399917602539 C2.367000102996826,21.514999389648438 1.8170000314712524,21.29199981689453 1.6160000562667847,20.81399917602539 C1.4839999675750732,20.500999450683594 1.534999966621399,20.15399932861328 1.7209999561309814,19.89699935913086 C1.7209999561309814,19.89699935913086 1.7359999418258667,19.878000259399414 1.7359999418258667,19.878000259399414 C2.803999900817871,18.413000106811523 3.9260001182556152,16.999000549316406 5.046000003814697,15.621999740600586 C5.619999885559082,14.946999549865723 6.1579999923706055,14.23799991607666 6.760000228881836,13.604000091552734 C7.360000133514404,12.968000411987305 8.01200008392334,12.390999794006348 8.642000198364258,11.791000366210938 C11.16100025177002,9.395000457763672 13.574999809265137,6.894000053405762 15.685999870300293,4.244999885559082 C16.73699951171875,2.9200000762939453 17.711999893188477,1.555999994277954 18.517000198364258,0.164000004529953 C19.319000244140625,-1.218999981880188 19.95599937438965,-2.6630001068115234 20.172000885009766,-3.944000005722046 C20.27899932861328,-4.574999809265137 20.277999877929688,-5.160999774932861 20.167999267578125,-5.60699987411499 C20.08300018310547,-5.98199987411499 19.858999252319336,-6.414000034332275 19.452999114990234,-6.877999782562256 C18.652999877929688,-7.803999900817871 17.336000442504883,-8.680999755859375 15.918000221252441,-9.404999732971191 C13.038999557495117,-10.864999771118164 9.718000411987305,-11.885000228881836 6.382999897003174,-12.74899959564209 C3.0290000438690186,-13.602999687194824 -0.40700000524520874,-14.27400016784668 -3.867000102996826,-14.845000267028809 C-7.328999996185303,-15.407999992370605 -10.815999984741211,-15.890000343322754 -14.319999694824219,-16.2549991607666 C-16.07699966430664,-16.381000518798828 -17.79199981689453,-16.924999237060547 -19.527000427246094,-17.374000549316406 C-21.256999969482422,-17.84000015258789 -22.9950008392334,-18.357999801635742 -24.724000930786133,-18.95400047302246 C-24.724000930786133,-18.95400047302246 -24.733999252319336,-18.957000732421875 -24.733999252319336,-18.957000732421875 C-25.128000259399414,-19.093000411987305 -25.339000701904297,-19.523000717163086 -25.20400047302246,-19.917999267578125 C-25.11400032043457,-20.179000854492188 -24.893999099731445,-20.358999252319336 -24.64299964904785,-20.413000106811523z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,366.6600036621094,268.4599914550781)"
            >
              <path
                fill="rgb(246,31,128)"
                fillOpacity={1}
                d=" M-4.995999813079834,-4.750999927520752 C-4.995999813079834,-4.750999927520752 0.8109999895095825,0.054999999701976776 2.619999885559082,5.008999824523926 C4.429999828338623,9.961999893188477 3.753999948501587,14.199999809265137 7.973999977111816,9.456000328063965 C12.192999839782715,4.7129998207092285 16.110000610351562,-1.7209999561309814 14.326000213623047,-5.381999969482422 C12.541000366210938,-9.043000221252441 3.640000104904175,-12.012999534606934 -1.7400000095367432,-12.420999526977539 C-7.120999813079834,-12.829000473022461 -16.108999252319336,-14.199999809265137 -4.995999813079834,-4.750999927520752z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,365.0450134277344,267.01300048828125)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M0.3230000138282776,-4.310999870300293 C-0.5799999833106995,-5.396999835968018 -3.249000072479248,-6.302000045776367 0.39500001072883606,-6.96999979019165 C2.9860000610351562,-7.446000099182129 10.414999961853027,-6.361000061035156 14.494999885559082,-5.692999839782715 C11.279999732971191,-8.51099967956543 4.361000061035156,-10.633000373840332 -0.125,-10.973999977111816 C-5.50600004196167,-11.381999969482422 -14.494999885559082,-12.753000259399414 -3.38100004196167,-3.303999900817871 C-3.38100004196167,-3.303999900817871 2.4260001182556152,1.5010000467300415 4.235000133514404,6.454999923706055 C5.293000221252441,9.350000381469727 5.502999782562256,11.99899959564209 6.336999893188477,12.753000259399414 C6.688000202178955,3.763000011444092 1.1660000085830688,-3.296999931335449 0.3230000138282776,-4.310999870300293z"
              />
            </g>
            <g
              opacity="0.6"
              transform="matrix(1,0,0,1,372.9909973144531,257.3529968261719)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M-15.529000282287598,-7.2210001945495605 C-15.529000282287598,-7.2210001945495605 4.456999778747559,-2.369999885559082 8.286999702453613,0.18400000035762787 C12.116999626159668,2.736999988555908 14.598999977111816,4.795000076293945 14.598999977111816,7.2210001945495605 C16.67300033569336,2.625 15.380000114440918,1.156000018119812 9.699999809265137,-1.4759999513626099 C2.7019999027252197,-4.922999858856201 -15.529000282287598,-7.2210001945495605 -15.529000282287598,-7.2210001945495605z"
              />
            </g>
          </g>
          <g
            transform="matrix(1,0,0,1,0,0)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,248.21800231933594,344.5369873046875)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M168.1269989013672,-0.0010000000474974513 C168.1269989013672,2.009000062942505 92.85399627685547,3.638000011444092 0,3.638000011444092 C-92.85399627685547,3.638000011444092 -168.1269989013672,2.009000062942505 -168.1269989013672,-0.0010000000474974513 C-168.1269989013672,-2.009999990463257 -92.85399627685547,-3.638000011444092 0,-3.638000011444092 C92.85399627685547,-3.638000011444092 168.1269989013672,-2.009999990463257 168.1269989013672,-0.0010000000474974513z"
              />
            </g>
          </g>
          <g
            transform="matrix(1.0000096559524536,0,0,0.9999980330467224,-0.0015106201171875,0.00067138671875)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,270.17498779296875,276.36700439453125)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M-104.2979965209961,68.74400329589844 C-104.2979965209961,68.74400329589844 79.91400146484375,68.36000061035156 88.33999633789062,67.97699737548828 C96.76499938964844,67.59500122070312 120.12699890136719,62.61600112915039 120.51000213623047,41.553001403808594 C120.76499938964844,24.82900047302246 113.48899841308594,24.062999725341797 111.19100189208984,17.934999465942383 C108.89299774169922,11.807000160217285 108.25399780273438,-17.426000595092773 79.91400146484375,-28.149999618530273 C54.76499938964844,-37.97999954223633 48.893001556396484,-40.02199935913086 42.5099983215332,-44.36199951171875 C36.12699890136719,-48.702999114990234 26.29800033569336,-65.68199920654297 -13.914999961853027,-67.21399688720703 C-54.12699890136719,-68.74500274658203 -97.78800201416016,-44.23500061035156 -109.2770004272461,-4.40500020980835 C-120.76599884033203,35.42499923706055 -106.97899627685547,67.59500122070312 -104.2979965209961,68.74400329589844z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,270.17498779296875,276.36700439453125)"
            >
              <path
                strokeLinecap="butt"
                strokeLinejoin="miter"
                fillOpacity={0}
                strokeMiterlimit={10}
                stroke="rgb(118,19,99)"
                strokeOpacity={1}
                strokeWidth={5}
                d=" M-104.2979965209961,68.74400329589844 C-104.2979965209961,68.74400329589844 79.91400146484375,68.36000061035156 88.33999633789062,67.97699737548828 C96.76499938964844,67.59500122070312 120.12699890136719,62.61600112915039 120.51000213623047,41.553001403808594 C120.76499938964844,24.82900047302246 113.48899841308594,24.062999725341797 111.19100189208984,17.934999465942383 C108.89299774169922,11.807000160217285 108.25399780273438,-17.426000595092773 79.91400146484375,-28.149999618530273 C54.76499938964844,-37.97999954223633 48.893001556396484,-40.02199935913086 42.5099983215332,-44.36199951171875 C36.12699890136719,-48.702999114990234 26.29800033569336,-65.68199920654297 -13.914999961853027,-67.21399688720703 C-54.12699890136719,-68.74500274658203 -97.78800201416016,-44.23500061035156 -109.2770004272461,-4.40500020980835 C-120.76599884033203,35.42499923706055 -106.97899627685547,67.59500122070312 -104.2979965209961,68.74400329589844z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,181.21600341796875,257.9280090332031)"
            >
              <path
                fill="rgb(190,101,12)"
                fillOpacity={1}
                d=" M-4.544000148773193,-10.954999923706055 C-4.544000148773193,-10.954999923706055 -1.2089999914169312,-2.9040000438690186 6.195000171661377,2.2019999027252197 C13.600000381469727,7.309000015258789 16.70400047302246,12.375 8.022000312805176,10.588000297546387 C-0.6579999923706055,8.800999641418457 -13.281000137329102,2.927999973297119 -13.281000137329102,2.927999973297119 C-10.755000114440918,-2.0829999446868896 -7.886000156402588,-6.754000186920166 -4.544000148773193,-10.954999923706055z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,207.75999450683594,239.6300048828125)"
            >
              <path
                fill="rgb(190,101,12)"
                fillOpacity={1}
                d=" M10.22599983215332,-21.697999954223633 C10.22599983215332,-21.697999954223633 9.435999870300293,3.2260000705718994 11.605999946594238,9.737000465393066 C13.776000022888184,16.246999740600586 13.319999694824219,25.91900062561035 7.011000156402588,19.694000244140625 C0.7020000219345093,13.468999862670898 -12.782999992370605,-9.701000213623047 -12.782999992370605,-9.701000213623047 C-5.468999862670898,-14.821999549865723 2.302999973297119,-18.736000061035156 10.22599983215332,-21.697999954223633z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,256.3840026855469,228.70399475097656)"
            >
              <path
                fill="rgb(190,101,12)"
                fillOpacity={1}
                d=" M11.96399974822998,-16.031999588012695 C11.96399974822998,-16.031999588012695 -1.00600004196167,-0.39800000190734863 -3.187000036239624,6.109000205993652 C-5.36899995803833,12.616000175476074 -11.229999542236328,23.981000900268555 -11.868000030517578,11.470000267028809 C-12.506999969482422,-1.0399999618530273 -9.746000289916992,-16.8700008392334 -9.746000289916992,-16.8700008392334 C-2.4189999103546143,-17.341999053955078 4.816999912261963,-17.054000854492188 11.96399974822998,-16.031999588012695z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,349.0369873046875,258.4739990234375)"
            >
              <path
                fill="rgb(113,57,5)"
                fillOpacity={1}
                d=" M8.95199966430664,-3.4590001106262207 C10.388999938964844,-1.1130000352859497 12.637999534606934,4.583000183105469 12.541999816894531,8.748000144958496 C12.446000099182129,12.913000106811523 9.142000198364258,8.508999824523926 8.09000015258789,4.296000003814697 C7.035999774932861,0.08299999684095383 0.28600001335144043,-6.380000114440918 0.28600001335144043,-6.380000114440918 C0.28600001335144043,-6.380000114440918 2.25,-0.4909999966621399 1.6759999990463257,3.2909998893737793 C1.1009999513626099,7.072000026702881 -1.7719999551773071,2.9560000896453857 -3.4000000953674316,-1.2569999694824219 C-5.0279998779296875,-5.46999979019165 -12.638999938964844,-12.913999557495117 -12.638999938964844,-12.913999557495117 C-3.937000036239624,-9.65999984741211 4.85099983215332,-6.459000110626221 8.95199966430664,-3.4590001106262207z"
              />
            </g>
            <g
              opacity="0.6"
              transform="matrix(1,0,0,1,373.1390075683594,293.99798583984375)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M-15.079000473022461,-38.887001037597656 C-15.079000473022461,-38.887001037597656 -4.0929999351501465,-28.163000106811523 -1.7949999570846558,-17.631999969482422 C0.503000020980835,-7.099999904632568 1.2050000429153442,1.4529999494552612 5.418000221252441,6.239999771118164 C9.630999565124512,11.027999877929688 12.184000015258789,12.8149995803833 12.37600040435791,18.750999450683594 C12.567000389099121,24.687000274658203 11.753000259399414,32.106998443603516 9.071999549865723,37.08599853515625 C6.392000198364258,42.064998626708984 12.184000015258789,35.55400085449219 13.53600025177002,31.628999710083008 C15.678999900817871,26.72100067138672 15.583000183105469,17.291000366210938 13.28499984741211,12.312000274658203 C11.729999542236328,8.817000389099121 10.317000389099121,7.932000160217285 7.133999824523926,3.6470000743865967 C5.386000156402588,0.9190000295639038 5.242000102996826,-1.0440000295639038 3.7109999656677246,-8.392999649047852 C0.19200000166893005,-22.18000030517578 -3.9010000228881836,-31.18000030517578 -15.079000473022461,-38.887001037597656z"
              />
            </g>
          </g>
          <g
            style={{ display: "none" }}
            transform="matrix(0.4226182699203491,0.9063078165054321,-0.9063078165054321,0.4226182699203491,473.7507019042969,-115.08096313476562)"
            opacity={1}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,368.531005859375,266.4419860839844)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M-24.95199966430664,-20.138999938964844 C-24.95199966430664,-20.138999938964844 18.96299934387207,-17.714000701904297 22.26799964904785,-6.908999919891357 C24.95199966430664,2.446000099182129 2.0230000019073486,20.138999938964844 2.0230000019073486,20.138999938964844"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,368.26300048828125,265.9849853515625)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-24.64299964904785,-20.413000106811523 C-22.81800079345703,-20.79599952697754 -21.006000518798828,-21.033000946044922 -19.190000534057617,-21.187000274658203 C-17.37700080871582,-21.32200050354004 -15.548999786376953,-21.514999389648438 -13.767000198364258,-21.246999740600586 C-10.192999839782715,-20.82900047302246 -6.620999813079834,-20.368999481201172 -3.055000066757202,-19.77899932861328 C0.5109999775886536,-19.190000534057617 4.072000026702881,-18.496000289916992 7.619999885559082,-17.5939998626709 C11.166000366210938,-16.666000366210938 14.710000038146973,-15.612000465393066 18.19700050354004,-13.854999542236328 C19.926000595092773,-12.949000358581543 21.68899917602539,-11.897000312805176 23.246000289916992,-10.135000228881836 C24.009000778198242,-9.26200008392334 24.715999603271484,-8.116000175476074 25.035999298095703,-6.75 C25.33799934387207,-5.460999965667725 25.28700065612793,-4.230000019073486 25.101999282836914,-3.1110000610351562 C24.702999114990234,-0.8709999918937683 23.81399917602539,0.9679999947547913 22.847999572753906,2.6640000343322754 C21.868999481201172,4.354000091552734 20.76099967956543,5.890999794006348 19.600000381469727,7.355000019073486 C17.270999908447266,10.276000022888184 14.722000122070312,12.906999588012695 12.085000038146973,15.418999671936035 C11.42199993133545,16.04400062561035 10.767000198364258,16.677000045776367 10.04699993133545,17.236000061035156 C9.329999923706055,17.797000885009766 8.53600025177002,18.267000198364258 7.763999938964844,18.757999420166016 C6.191999912261963,19.711999893188477 4.579999923706055,20.583999633789062 2.8440001010894775,21.31399917602539 C2.367000102996826,21.514999389648438 1.8170000314712524,21.29199981689453 1.6160000562667847,20.81399917602539 C1.4839999675750732,20.500999450683594 1.534999966621399,20.15399932861328 1.7209999561309814,19.89699935913086 C1.7209999561309814,19.89699935913086 1.7359999418258667,19.878000259399414 1.7359999418258667,19.878000259399414 C2.803999900817871,18.413000106811523 3.9260001182556152,16.999000549316406 5.046000003814697,15.621999740600586 C5.619999885559082,14.946999549865723 6.1579999923706055,14.23799991607666 6.760000228881836,13.604000091552734 C7.360000133514404,12.968000411987305 8.01200008392334,12.390999794006348 8.642000198364258,11.791000366210938 C11.16100025177002,9.395000457763672 13.574999809265137,6.894000053405762 15.685999870300293,4.244999885559082 C16.73699951171875,2.9200000762939453 17.711999893188477,1.555999994277954 18.517000198364258,0.164000004529953 C19.319000244140625,-1.218999981880188 19.95599937438965,-2.6630001068115234 20.172000885009766,-3.944000005722046 C20.27899932861328,-4.574999809265137 20.277999877929688,-5.160999774932861 20.167999267578125,-5.60699987411499 C20.08300018310547,-5.98199987411499 19.858999252319336,-6.414000034332275 19.452999114990234,-6.877999782562256 C18.652999877929688,-7.803999900817871 17.336000442504883,-8.680999755859375 15.918000221252441,-9.404999732971191 C13.038999557495117,-10.864999771118164 9.718000411987305,-11.885000228881836 6.382999897003174,-12.74899959564209 C3.0290000438690186,-13.602999687194824 -0.40700000524520874,-14.27400016784668 -3.867000102996826,-14.845000267028809 C-7.328999996185303,-15.407999992370605 -10.815999984741211,-15.890000343322754 -14.319999694824219,-16.2549991607666 C-16.07699966430664,-16.381000518798828 -17.79199981689453,-16.924999237060547 -19.527000427246094,-17.374000549316406 C-21.256999969482422,-17.84000015258789 -22.9950008392334,-18.357999801635742 -24.724000930786133,-18.95400047302246 C-24.724000930786133,-18.95400047302246 -24.733999252319336,-18.957000732421875 -24.733999252319336,-18.957000732421875 C-25.128000259399414,-19.093000411987305 -25.339000701904297,-19.523000717163086 -25.20400047302246,-19.917999267578125 C-25.11400032043457,-20.179000854492188 -24.893999099731445,-20.358999252319336 -24.64299964904785,-20.413000106811523z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,366.6600036621094,268.4599914550781)"
            >
              <path
                fill="rgb(246,31,128)"
                fillOpacity={1}
                d=" M-4.995999813079834,-4.750999927520752 C-4.995999813079834,-4.750999927520752 0.8109999895095825,0.054999999701976776 2.619999885559082,5.008999824523926 C4.429999828338623,9.961999893188477 3.753999948501587,14.199999809265137 7.973999977111816,9.456000328063965 C12.192999839782715,4.7129998207092285 16.110000610351562,-1.7209999561309814 14.326000213623047,-5.381999969482422 C12.541000366210938,-9.043000221252441 3.640000104904175,-12.012999534606934 -1.7400000095367432,-12.420999526977539 C-7.120999813079834,-12.829000473022461 -16.108999252319336,-14.199999809265137 -4.995999813079834,-4.750999927520752z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,365.0450134277344,267.01300048828125)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M0.3230000138282776,-4.310999870300293 C-0.5799999833106995,-5.396999835968018 -3.249000072479248,-6.302000045776367 0.39500001072883606,-6.96999979019165 C2.9860000610351562,-7.446000099182129 10.414999961853027,-6.361000061035156 14.494999885559082,-5.692999839782715 C11.279999732971191,-8.51099967956543 4.361000061035156,-10.633000373840332 -0.125,-10.973999977111816 C-5.50600004196167,-11.381999969482422 -14.494999885559082,-12.753000259399414 -3.38100004196167,-3.303999900817871 C-3.38100004196167,-3.303999900817871 2.4260001182556152,1.5010000467300415 4.235000133514404,6.454999923706055 C5.293000221252441,9.350000381469727 5.502999782562256,11.99899959564209 6.336999893188477,12.753000259399414 C6.688000202178955,3.763000011444092 1.1660000085830688,-3.296999931335449 0.3230000138282776,-4.310999870300293z"
              />
            </g>
            <g
              opacity="0.6"
              transform="matrix(1,0,0,1,372.9909973144531,257.3529968261719)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M-15.529000282287598,-7.2210001945495605 C-15.529000282287598,-7.2210001945495605 4.456999778747559,-2.369999885559082 8.286999702453613,0.18400000035762787 C12.116999626159668,2.736999988555908 14.598999977111816,4.795000076293945 14.598999977111816,7.2210001945495605 C16.67300033569336,2.625 15.380000114440918,1.156000018119812 9.699999809265137,-1.4759999513626099 C2.7019999027252197,-4.922999858856201 -15.529000282287598,-7.2210001945495605 -15.529000282287598,-7.2210001945495605z"
              />
            </g>
          </g>
          <g
            style={{ display: "none" }}
            transform="matrix(0.9816271662712097,-0.1908089965581894,0.18317663669586182,0.9423620700836182,-50.393524169921875,42.8922119140625)"
            opacity={1}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,130.25999450683594,314.0889892578125)"
            >
              <path
                strokeLinecap="butt"
                strokeLinejoin="miter"
                fillOpacity={0}
                strokeMiterlimit={10}
                stroke="rgb(118,19,99)"
                strokeOpacity={1}
                strokeWidth={5}
                d=" M29.48900032043457,-23.106000900268555 C29.48900032043457,-23.106000900268555 14.680000305175781,-7.7870001792907715 1.659000039100647,-8.553000450134277 C-11.362000465393066,-9.319000244140625 -22.59600067138672,-14.935999870300293 -30.766000747680664,-13.659000396728516 C-38.93600082397461,-12.381999969482422 -49.915000915527344,-8.553000450134277 -47.617000579833984,4.2129998207092285 C-45.319000244140625,16.979000091552734 -35.1150016784668,25.719999313354492 -18,25.14900016784668 C75.48999786376953,22.027999877929688 29.48900032043457,-23.106000900268555 29.48900032043457,-23.106000900268555z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,130.25999450683594,314.0889892578125)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M31.051000595092773,-21.152999877929688 C31.051000595092773,-21.152999877929688 15.180000305175781,-5.313000202178955 2.1589999198913574,-6.078999996185303 C-10.862000465393066,-6.84499979019165 -22.534000396728516,-12.397000312805176 -30.70400047302246,-11.119999885559082 C-38.874000549316406,-9.843000411987305 -47.09600067138672,-6.86299991607666 -44.992000579833984,4.4079999923706055 C-42.7599983215332,16.36400032043457 -32.91899871826172,21.974000930786133 -15.812000274658203,22.739999771118164 C1.2940000295639038,23.506000518798828 26.93600082397461,16.47800064086914 38.42499923706055,10.350000381469727 C49.915000915527344,4.2230000495910645 51.2400016784668,-19.89900016784668 32.65399932861328,-31.298999786376953 C29.0310001373291,-33.520999908447266 31.051000595092773,-21.152999877929688 31.051000595092773,-21.152999877929688z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,103.5479965209961,319.9779968261719)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M8.329999923706055,-15.654000282287598 C8.329999923706055,-15.654000282287598 4.5,-0.7179999947547913 11.520999908447266,7.451000213623047 C18.542999267578125,15.621999740600586 18.79800033569336,16.483999252319336 18.79800033569336,16.483999252319336 C18.79800033569336,16.483999252319336 9.35099983215332,17.441999435424805 1.9470000267028809,15.942000389099121 C-9.064000129699707,14.442000389099121 -18.000999450683594,7.0370001792907715 -18.638999938964844,-4.068999767303467 C-18.79800033569336,-7.708000183105469 -18.159000396728516,-9.972999572753906 -15.510000228881836,-12.430999755859375 C-12.734000205993652,-15.239999771118164 -5.650000095367432,-17.058000564575195 -2.3310000896453857,-17.18600082397461 C1.850000023841858,-17.441999435424805 8.329999923706055,-15.654000282287598 8.329999923706055,-15.654000282287598z"
              />
            </g>
            <g
              opacity="0.3"
              transform="matrix(1,0,0,1,130.86700439453125,325.3599853515625)"
            >
              <path
                fill="rgb(113,57,5)"
                fillOpacity={1}
                d=" M-43.308998107910156,-0.4830000102519989 C-43.308998107910156,-0.4830000102519989 -28.43600082397461,5.453999996185303 -10.435999870300293,3.6659998893737793 C7.564000129699707,1.878000020980835 43.30799865722656,-11.39799976348877 43.30799865722656,-11.39799976348877 C43.30799865722656,-11.39799976348877 41.7760009765625,-5.078999996185303 38.20199966430664,-1.503999948501587 C34.62699890136719,2.069999933242798 10.564000129699707,9.682000160217285 -9.414999961853027,11.182000160217285 C-26.075000762939453,12.267000198364258 -37.244998931884766,9.41100025177002 -43.308998107910156,-0.4830000102519989z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,126.11100006103516,302.5989990234375)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M-38.361000061035156,5.235000133514404 C-38.361000061035156,5.235000133514404 -26.235000610351562,0.7670000195503235 -14.489999771118164,5.107999801635742 C-2.744999885559082,9.447999954223633 5.808000087738037,12.255999565124512 18.19099998474121,6.001999855041504 C30.573999404907227,-0.2540000081062317 32.861000061035156,-5.434000015258789 32.861000061035156,-5.434000015258789 C32.861000061035156,-5.434000015258789 35.21900177001953,-9.645000457763672 35.21900177001953,-9.645000457763672 C35.21900177001953,-9.645000457763672 22.364999771118164,3.568000078201294 9.654999732971191,5.24399995803833 C-1.690999984741211,6.416999816894531 -12.581999778747559,1.031000018119812 -22.635000228881836,0.2160000056028366 C-32.61600112915039,-0.11900000274181366 -38.361000061035156,5.235000133514404 -38.361000061035156,5.235000133514404z"
              />
            </g>
          </g>
          <g
            transform="matrix(0.9999998211860657,0.0006012910744175315,-0.0006012910744175315,0.9999998211860657,0.15594482421875,-0.180755615234375)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,323.40899658203125,239.281005859375)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M-22.14900016784668,-1.1490000486373901 C-22.14900016784668,-1.1490000486373901 5.425000190734863,-19.275999069213867 13.788000106811523,-14.29800033569336 C22.14900016784668,-9.319000244140625 17.55299949645996,19.275999069213867 17.55299949645996,19.275999069213867"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,322.7250061035156,240.4320068359375)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-21.867000579833984,-2.9100000858306885 C-20.847999572753906,-4.223999977111816 -19.738000869750977,-5.394000053405762 -18.566999435424805,-6.489999771118164 C-17.975000381469727,-7.0269999504089355 -17.393999099731445,-7.584000110626221 -16.76300048828125,-8.060999870300293 C-16.132999420166016,-8.538999557495117 -15.42300033569336,-8.883000373840332 -14.741000175476074,-9.27299976348877 C-12,-10.8149995803833 -9.21399974822998,-12.289999961853027 -6.35099983215332,-13.654000282287598 C-3.4820001125335693,-15.005000114440918 -0.5550000071525574,-16.27400016784668 2.553999900817871,-17.274999618530273 C4.11299991607666,-17.76799964904785 5.698999881744385,-18.222999572753906 7.3979997634887695,-18.503999710083008 C9.093000411987305,-18.777000427246094 10.883000373840332,-18.954999923706055 12.885000228881836,-18.617000579833984 C13.371000289916992,-18.559999465942383 13.907999992370605,-18.361000061035156 14.411999702453613,-18.219999313354492 C14.92199993133545,-18.009000778198242 15.470000267028809,-17.768999099731445 15.937999725341797,-17.466999053955078 C16.395999908447266,-17.145999908447266 16.87299919128418,-16.82699966430664 17.23200035095215,-16.437999725341797 C17.422000885009766,-16.25 17.618999481201172,-16.06100082397461 17.795000076293945,-15.866999626159668 C17.795000076293945,-15.866999626159668 18.266000747680664,-15.263999938964844 18.266000747680664,-15.263999938964844 C19.47599983215332,-13.633000373840332 20.124000549316406,-11.923999786376953 20.611000061035156,-10.267000198364258 C21.53700065612793,-6.939000129699707 21.83300018310547,-3.687999963760376 21.948999404907227,-0.47699999809265137 C22.062999725341797,2.7360000610351562 21.952999114990234,5.910999774932861 21.736000061035156,9.067999839782715 C21.648000717163086,10.64799976348877 21.197999954223633,12.194999694824219 20.770999908447266,13.729000091552734 C20.325000762939453,15.265000343322754 19.802000045776367,16.77400016784668 19.131999969482422,18.270999908447266 C18.920000076293945,18.743999481201172 18.364999771118164,18.95599937438965 17.892000198364258,18.7450008392334 C17.58300018310547,18.606000900268555 17.385000228881836,18.320999145507812 17.3439998626709,18.007999420166016 C17.3439998626709,18.007999420166016 17.340999603271484,17.98200035095215 17.340999603271484,17.98200035095215 C17.141000747680664,16.41900062561035 16.99799919128418,14.85099983215332 16.891000747680664,13.309000015258789 C16.79400062561035,11.763999938964844 16.624000549316406,10.22700023651123 16.75200080871582,8.718999862670898 C16.952999114990234,5.697999954223633 17.059999465942383,2.674999952316284 16.95199966430664,-0.30300000309944153 C16.854000091552734,-3.2709999084472656 16.548999786376953,-6.235000133514404 15.807999610900879,-8.878999710083008 C15.4350004196167,-10.185999870300293 14.916999816894531,-11.406000137329102 14.269000053405762,-12.26200008392334 C14.269000053405762,-12.26200008392334 14.029000282287598,-12.57800006866455 14.029000282287598,-12.57800006866455 C14.029000282287598,-12.57800006866455 13.77299976348877,-12.82800006866455 13.77299976348877,-12.82800006866455 C13.61299991607666,-13.02299976348877 13.425000190734863,-13.109000205993652 13.258999824523926,-13.246000289916992 C13.079999923706055,-13.362000465393066 12.902000427246094,-13.420000076293945 12.706999778747559,-13.517999649047852 C12.461000442504883,-13.562000274658203 12.276000022888184,-13.675000190734863 11.98900032043457,-13.697999954223633 C10.932000160217285,-13.883999824523926 9.588000297546387,-13.803000450134277 8.237000465393066,-13.574000358581543 C6.877999782562256,-13.352999687194824 5.4770002365112305,-12.954999923706055 4.085999965667725,-12.513999938964844 C1.2970000505447388,-11.618000030517578 -1.4739999771118164,-10.425000190734863 -4.204999923706055,-9.137999534606934 C-6.933000087738037,-7.835999965667725 -9.628000259399414,-6.416999816894531 -12.281000137329102,-4.916999816894531 C-12.944999694824219,-4.541999816894531 -13.581000328063965,-4.11899995803833 -14.286999702453613,-3.815000057220459 C-14.993000030517578,-3.513000011444092 -15.744999885559082,-3.2839999198913574 -16.479000091552734,-3.0209999084472656 C-17.961000442504883,-2.5190000534057617 -19.485000610351562,-2.061000108718872 -21.06399917602539,-1.6890000104904175 C-21.06399917602539,-1.6890000104904175 -21.07900047302246,-1.684999942779541 -21.07900047302246,-1.684999942779541 C-21.493999481201172,-1.5870000123977661 -21.90999984741211,-1.843999981880188 -22.009000778198242,-2.259000062942505 C-22.062999725341797,-2.493000030517578 -22.003000259399414,-2.7320001125335693 -21.867000579833984,-2.9100000858306885z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,321.90899658203125,243.68499755859375)"
            >
              <path
                fill="rgb(246,31,128)"
                fillOpacity={1}
                d=" M-2.5850000381469727,0.7020000219345093 C-2.5850000381469727,0.7020000219345093 4.882999897003174,1.7230000495910645 9.031000137329102,4.979000091552734 C13.180999755859375,8.234000205993652 14.84000015258789,12.190999984741211 15.925000190734863,5.935999870300293 C17.01099967956543,-0.3190000057220459 16.945999145507812,-7.85099983215332 13.5,-10.020999908447266 C10.053000450134277,-12.192000389099121 0.925000011920929,-10.020000457763672 -3.861999988555908,-7.531000137329102 C-8.64900016784668,-5.041999816894531 -17.01099967956543,-1.468000054359436 -2.5850000381469727,0.7020000219345093z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,320.47198486328125,242.57200622558594)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M1.468000054359436,-0.9929999709129333 C0.12800000607967377,-1.440000057220459 -2.617000102996826,-0.8009999990463257 0.12800000607967377,-3.2899999618530273 C2.0789999961853027,-5.059000015258789 8.963000297546387,-8.055000305175781 12.781999588012695,-9.638999938964844 C8.5649995803833,-10.338000297546387 1.5670000314712524,-8.494000434875488 -2.4260001182556152,-6.418000221252441 C-7.2129998207092285,-3.928999900817871 -15.574000358581543,-0.3540000021457672 -1.1480000019073486,1.815999984741211 C-1.1480000019073486,1.815999984741211 6.320000171661377,2.8369998931884766 10.468000411987305,6.0920000076293945 C12.894000053405762,7.994999885559082 14.468000411987305,10.135000228881836 15.574000358581543,10.336999893188477 C11.133999824523926,2.51200008392334 2.7190001010894775,-0.5759999752044678 1.468000054359436,-0.9929999709129333z"
              />
            </g>
            <g
              opacity="0.6"
              transform="matrix(1,0,0,1,325.11199951171875,230.86599731445312)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M-13.989999771118164,4.258999824523926 C-13.989999771118164,4.258999824523926 5.269999980926514,-2.946000099182129 10.760000228881836,0.11800000071525574 C12.949000358581543,1.2669999599456787 13.989999771118164,3.253999948501587 13.989999771118164,3.253999948501587 C13.989999771118164,3.253999948501587 13.128999710083008,-2.5989999771118164 10.675999641418457,-3.7960000038146973 C8.043000221252441,-5.315999984741211 0.46700000762939453,-2.7060000896453857 -2.4049999713897705,-1.4259999990463257 C-5.565000057220459,-0.37299999594688416 -13.989999771118164,4.258999824523926 -13.989999771118164,4.258999824523926z"
              />
            </g>
          </g>
          <g
            transform="matrix(1,0,0,1,0,0)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,369.7170104980469,302.49200439453125)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-6.702000141143799,3.937999963760376 C-6.449999809265137,2.496999979019165 -5.697999954223633,1.2489999532699585 -4.793000221252441,0.17499999701976776 C-3.871000051498413,-0.8920000195503235 -2.753000020980835,-1.7999999523162842 -1.4989999532699585,-2.4590001106262207 C-0.24899999797344208,-3.119999885559082 1.1100000143051147,-3.5950000286102295 2.5160000324249268,-3.749000072479248 C3.9089999198913574,-3.937000036239624 5.3460001945495605,-3.815999984741211 6.701000213623047,-3.3380000591278076 C5.454999923706055,-2.569999933242798 4.2870001792907715,-2.071000099182129 3.1740000247955322,-1.4839999675750732 C2.0480000972747803,-0.953000009059906 0.9879999756813049,-0.37299999594688416 -0.07900000363588333,0.18199999630451202 C-1.1469999551773071,0.7390000224113464 -2.190000057220459,1.3420000076293945 -3.2679998874664307,1.965000033378601 C-3.2679998874664307,1.965000033378601 -6.702000141143799,3.937999963760376 -6.702000141143799,3.937999963760376z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,342.0469970703125,302.1969909667969)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M7.947000026702881,4.328999996185303 C6.539999961853027,3.489000082015991 5.263000011444092,2.74399995803833 3.9800000190734863,2.0260000228881836 C2.7039999961853027,1.3140000104904175 1.4529999494552612,0.6299999952316284 0.16699999570846558,0.0020000000949949026 C-1.125,-0.6069999933242798 -2.4049999713897705,-1.2610000371932983 -3.759999990463257,-1.8320000171661377 C-4.421999931335449,-2.1679999828338623 -5.11899995803833,-2.4130001068115234 -5.809999942779541,-2.763000011444092 C-6.502999782562256,-3.1040000915527344 -7.223999977111816,-3.367000102996826 -7.947000026702881,-3.809999942779541 C-6.367000102996826,-4.250999927520752 -4.728000164031982,-4.328999996185303 -3.128999948501587,-4.105000019073486 C-1.5169999599456787,-3.9200000762939453 0.039000000804662704,-3.384999990463257 1.503999948501587,-2.683000087738037 C2.9649999141693115,-1.965000033378601 4.297999858856201,-0.984000027179718 5.433000087738037,0.17900000512599945 C6.550000190734863,1.3509999513626099 7.517000198364258,2.7200000286102295 7.947000026702881,4.328999996185303z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,377.0889892578125,313.32501220703125)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-5.840000152587891,-0.289000004529953 C-4.8460001945495605,-0.6570000052452087 -3.86299991607666,-0.8159999847412109 -2.881999969482422,-0.9279999732971191 C-1.9019999504089355,-1.0260000228881836 -0.925000011920929,-1.0470000505447388 0.04899999871850014,-1 C1.0219999551773071,-0.9539999961853027 1.9930000305175781,-0.8370000123977661 2.9600000381469727,-0.6430000066757202 C3.924999952316284,-0.43700000643730164 4.888999938964844,-0.1809999942779541 5.841000080108643,0.28600001335144043 C4.8480000495910645,0.656000018119812 3.86299991607666,0.8169999718666077 2.881999969482422,0.9279999732971191 C1.9010000228881836,1.0260000228881836 0.925000011920929,1.0470000505447388 -0.04800000041723251,0.996999979019165 C-1.0219999551773071,0.9480000138282776 -1.9919999837875366,0.8320000171661377 -2.9579999446868896,0.6380000114440918 C-3.9240000247955322,0.4309999942779541 -4.88700008392334,0.17599999904632568 -5.840000152587891,-0.289000004529953z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,377.66400146484375,320.5060119628906)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-5.39900016784668,-2.244999885559082 C-4.339000225067139,-2.25600004196167 -3.359999895095825,-2.072999954223633 -2.3989999294281006,-1.847000002861023 C-1.4429999589920044,-1.6080000400543213 -0.515999972820282,-1.2970000505447388 0.3840000033378601,-0.925000011920929 C1.284999966621399,-0.5519999861717224 2.1579999923706055,-0.11400000005960464 3.000999927520752,0.39500001072883606 C3.8399999141693115,0.9150000214576721 4.660999774932861,1.4819999933242798 5.400000095367432,2.243000030517578 C4.339000225067139,2.25600004196167 3.3589999675750732,2.0739998817443848 2.3980000019073486,1.847000002861023 C1.4420000314712524,1.6089999675750732 0.515999972820282,1.2979999780654907 -0.382999986410141,0.921999990940094 C-1.2829999923706055,0.546999990940094 -2.1570000648498535,0.10899999737739563 -3.000999927520752,-0.39899998903274536 C-3.8380000591278076,-0.9210000038146973 -4.659999847412109,-1.4859999418258667 -5.39900016784668,-2.244999885559082z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,373.51300048828125,325.02899169921875)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-2.61899995803833,-2.177999973297119 C-1.9170000553131104,-2.134999990463257 -1.3480000495910645,-1.9320000410079956 -0.8080000281333923,-1.6920000314712524 C-0.27799999713897705,-1.440999984741211 0.20200000703334808,-1.1299999952316284 0.6389999985694885,-0.7689999938011169 C1.0770000219345093,-0.40700000524520874 1.4700000286102295,0.008999999612569809 1.812999963760376,0.48399999737739563 C2.1480000019073486,0.968999981880188 2.4509999752044678,1.4930000305175781 2.61899995803833,2.177999973297119 C1.9149999618530273,2.13700008392334 1.3450000286102295,1.934999942779541 0.8069999814033508,1.694000005722046 C0.2770000100135803,1.4429999589920044 -0.2029999941587448,1.1339999437332153 -0.6399999856948853,0.7689999938011169 C-1.0750000476837158,0.4050000011920929 -1.468000054359436,-0.009999999776482582 -1.809999942779541,-0.4869999885559082 C-2.1449999809265137,-0.972000002861023 -2.4489998817443848,-1.49399995803833 -2.61899995803833,-2.177999973297119z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,331.9939880371094,313.5159912109375)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M6.031000137329102,-0.5759999752044678 C5.065999984741211,-0.06499999761581421 4.079999923706055,0.2370000034570694 3.0899999141693115,0.4909999966621399 C2.0980000495910645,0.734000027179718 1.0989999771118164,0.8980000019073486 0.09399999678134918,0.9940000176429749 C-0.9100000262260437,1.090999960899353 -1.9220000505447388,1.11899995803833 -2.941999912261963,1.069000005722046 C-3.9619998931884766,1.0069999694824219 -4.98799991607666,0.8949999809265137 -6.0320000648498535,0.5730000138282776 C-5.066999912261963,0.061000000685453415 -4.080999851226807,-0.24300000071525574 -3.0910000801086426,-0.4970000088214874 C-2.0999999046325684,-0.7379999756813049 -1.1009999513626099,-0.9020000100135803 -0.0949999988079071,-0.9959999918937683 C0.9100000262260437,-1.090999960899353 1.9220000505447388,-1.11899995803833 2.940999984741211,-1.0679999589920044 C3.9619998931884766,-1.00600004196167 4.986999988555908,-0.8939999938011169 6.031000137329102,-0.5759999752044678z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,332.260986328125,320.2919921875)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M5.916999816894531,-2.6059999465942383 C5.099999904632568,-1.7910000085830688 4.195000171661377,-1.1670000553131104 3.2739999294281006,-0.5860000252723694 C2.3469998836517334,-0.017000000923871994 1.3890000581741333,0.4790000021457672 0.4020000100135803,0.9150000214576721 C-0.5830000042915344,1.350000023841858 -1.597000002861023,1.722000002861023 -2.6419999599456787,2.0220000743865967 C-3.690999984741211,2.312000036239624 -4.76200008392334,2.555000066757202 -5.916999816894531,2.6059999465942383 C-5.099999904632568,1.7879999876022339 -4.197000026702881,1.1629999876022339 -3.2750000953674316,0.5830000042915344 C-2.3489999771118164,0.014999999664723873 -1.3890000581741333,-0.4819999933242798 -0.4020000100135803,-0.9160000085830688 C0.5839999914169312,-1.3480000495910645 1.597000002861023,-1.7200000286102295 2.6429998874664307,-2.0199999809265137 C3.691999912261963,-2.309000015258789 4.763999938964844,-2.552999973297119 5.916999816894531,-2.6059999465942383z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,335.5870056152344,325.6780090332031)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M3.0510001182556152,-2.3580000400543213 C2.7980000972747803,-1.6349999904632568 2.4159998893737793,-1.0789999961853027 2.005000114440918,-0.5590000152587891 C1.5859999656677246,-0.05000000074505806 1.11899995803833,0.3970000147819519 0.6119999885559082,0.7910000085830688 C0.10499999672174454,1.1859999895095825 -0.44600000977516174,1.524999976158142 -1.0440000295639038,1.8009999990463257 C-1.6490000486373901,2.069999933242798 -2.2860000133514404,2.296999931335449 -3.0510001182556152,2.3589999675750732 C-2.7990000247955322,1.6339999437332153 -2.4179999828338623,1.0759999752044678 -2.00600004196167,0.5569999814033508 C-1.5870000123977661,0.04800000041723251 -1.121000051498413,-0.4000000059604645 -0.6110000014305115,-0.7919999957084656 C-0.10199999809265137,-1.184000015258789 0.4480000138282776,-1.5219999551773071 1.0460000038146973,-1.7990000247955322 C1.652999997138977,-2.065999984741211 2.2880001068115234,-2.2950000762939453 3.0510001182556152,-2.3580000400543213z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,357.42999267578125,322.260986328125)"
            >
              <path
                fill="rgb(246,232,217)"
                fillOpacity={1}
                d=" M-0.06400000303983688,-7.788000106811523 C-0.06400000303983688,-7.788000106811523 5.425000190734863,-7.915999889373779 7.7230000495910645,-7.14900016784668 C10.020999908447266,-6.383999824523926 11.680999755859375,0.8930000066757202 8.105999946594238,4.59499979019165 C4.5320000648498535,8.29699993133545 1.5950000286102295,8.935999870300293 -2.617000102996826,8.680000305175781 C-6.829999923706055,8.425000190734863 -11.680999755859375,4.85099983215332 -10.65999984741211,-2.0429999828338623 C-9.637999534606934,-8.935999870300293 -7.211999893188477,-8.170999526977539 -0.06400000303983688,-7.788000106811523z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,355.26800537109375,319.8169860839844)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M10.904000282287598,0.2409999966621399 C10.847999572753906,-0.0689999982714653 10.717000007629395,-0.35499998927116394 10.621000289916992,-0.6389999985694885 C10.539999961853027,-0.8809999823570251 10.286999702453613,-1.0290000438690186 10.031999588012695,-0.9729999899864197 C9.758000373840332,-0.9129999876022339 9.583999633789062,-0.6430000066757202 9.642999649047852,-0.36800000071525574 C9.642999649047852,-0.36800000071525574 9.66100025177002,-0.2849999964237213 9.66100025177002,-0.2849999964237213 C9.85200023651123,0.5950000286102295 9.494000434875488,1.350000023841858 8.901000022888184,1.7929999828338623 C8.291000366210938,2.239000082015991 7.461999893188477,2.3499999046325684 6.739999771118164,2.197999954223633 C6.00600004196167,2.0450000762939453 5.361999988555908,1.625 4.8420000076293945,1.0670000314712524 C4.301000118255615,0.527999997138977 3.953000068664551,-0.2590000033378601 3.625999927520752,-1.00600004196167 C3.625999927520752,-1.00600004196167 3.5739998817443848,-1.1230000257492065 3.5739998817443848,-1.1230000257492065 C3.5420000553131104,-1.1959999799728394 3.49399995803833,-1.2619999647140503 3.4519999027252197,-1.3320000171661377 C5.242000102996826,-3.111999988555908 8.01099967956543,-6.002999782562256 7.6519999504089355,-6.493000030517578 C7.125,-7.211999893188477 -2.6649999618530273,-7.498000144958496 -3.1670000553131104,-6.517000198364258 C-3.496000051498413,-5.875 -1.187000036239624,-3.255000114440918 0.453000009059906,-1.5160000324249268 C0.3799999952316284,-1.4229999780654907 0.3070000112056732,-1.3279999494552612 0.25699999928474426,-1.2330000400543213 C0.25699999928474426,-1.2330000400543213 0.21699999272823334,-1.156999945640564 0.21699999272823334,-1.156999945640564 C-0.20000000298023224,-0.3630000054836273 -0.6769999861717224,0.4269999861717224 -1.3519999980926514,1.003999948501587 C-2.0190000534057617,1.5770000219345093 -2.8320000171661377,2.006999969482422 -3.7330000400543213,2.177999973297119 C-4.623000144958496,2.3510000705718994 -5.605999946594238,2.26200008392334 -6.388999938964844,1.850000023841858 C-6.622000217437744,1.7350000143051147 -6.820000171661377,1.5859999656677246 -6.98199987411499,1.4129999876022339 C-6.932000160217285,0.550000011920929 -6.995999813079834,-0.3109999895095825 -7.182000160217285,-1.1369999647140503 C-7.415999889373779,-2.197999954223633 -7.793000221252441,-3.2100000381469727 -8.439000129699707,-4.11299991607666 C-8.49899959564209,-4.195000171661377 -8.598999977111816,-4.249000072479248 -8.706999778747559,-4.243000030517578 C-8.878999710083008,-4.236000061035156 -9.01200008392334,-4.090000152587891 -9.003000259399414,-3.9179999828338623 C-9.003000259399414,-3.9179999828338623 -9.001999855041504,-3.8940000534057617 -9.001999855041504,-3.8940000534057617 C-8.902999877929688,-1.8619999885559082 -8.793999671936035,0.05000000074505806 -9.029999732971191,1.875 C-9.13599967956543,2.7909998893737793 -9.361000061035156,3.6640000343322754 -9.663999557495117,4.534999847412109 C-9.956000328063965,5.423999786376953 -10.456999778747559,6.211999893188477 -10.958999633789062,7.139999866485596 C-10.958999633789062,7.139999866485596 -10.970999717712402,7.163000106811523 -10.970999717712402,7.163000106811523 C-11.00100040435791,7.2210001945495605 -11.005000114440918,7.290999889373779 -10.973999977111816,7.353000164031982 C-10.92300033569336,7.456999778747559 -10.79800033569336,7.498000144958496 -10.694999694824219,7.447000026702881 C-9.734999656677246,6.9710001945495605 -8.819000244140625,6.248000144958496 -8.22700023651123,5.284999847412109 C-7.836999893188477,4.682000160217285 -7.5329999923706055,4.015999794006348 -7.318999767303467,3.3269999027252197 C-6.261000156402588,4.196000099182129 -4.940999984741211,4.614999771118164 -3.6110000610351562,4.672999858856201 C-2.2279999256134033,4.73199987411499 -0.8220000267028809,4.382999897003174 0.4309999942779541,3.7249999046325684 C0.9440000057220459,3.4570000171661377 1.406000018119812,3.122999906539917 1.843000054359436,2.76200008392334 C2.1559998989105225,3.0510001182556152 2.484999895095825,3.3259999752044678 2.8610000610351562,3.562000036239624 C3.9600000381469727,4.2789998054504395 5.296000003814697,4.72599983215332 6.635000228881836,4.659999847412109 C7.961999893188477,4.5960001945495605 9.282999992370605,4.054999828338623 10.140000343322754,3.0199999809265137 C10.329000473022461,2.736999988555908 10.553000450134277,2.493000030517578 10.661999702453613,2.1659998893737793 C10.661999702453613,2.1659998893737793 10.845999717712402,1.7020000219345093 10.845999717712402,1.7020000219345093 C10.845999717712402,1.7020000219345093 10.927000045776367,1.2100000381469727 10.927000045776367,1.2100000381469727 C11.005999565124512,0.8870000243186951 10.925000190734863,0.5550000071525574 10.904000282287598,0.2409999966621399z"
              />
            </g>
          </g>
          <g
            style={{ display: "none" }}
            transform="matrix(1,0,0,0.8600000143051147,0,48.5682373046875)"
            opacity={1}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,251.49200439453125,322.71099853515625)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M36.88199996948242,21.833999633789062 C36.88199996948242,21.833999633789062 1.7669999599456787,21.441999435424805 -9.49899959564209,21.059999465942383 C-24.020000457763672,20.739999771118164 -36.88100051879883,6.506999969482422 -26.062000274658203,-2.877000093460083 C-13.232000350952148,-14.652999877929688 30.905000686645508,-21.833999633789062 30.905000686645508,-21.833999633789062"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,254.78700256347656,323.468994140625)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M33.56100082397461,23.44499969482422 C27.53499984741211,23.239999771118164 21.503999710083008,23.52199935913086 15.479000091552734,23.3439998626709 C15.479000091552734,23.3439998626709 -2.6059999465942383,23.048999786376953 -2.6059999465942383,23.048999786376953 C-2.6059999465942383,23.048999786376953 -11.66100025177002,22.836999893188477 -11.66100025177002,22.836999893188477 C-11.66100025177002,22.836999893188477 -12.791000366210938,22.802000045776367 -12.791000366210938,22.802000045776367 C-13.187999725341797,22.788000106811523 -13.602999687194824,22.777999877929688 -14.019000053405762,22.746000289916992 C-14.85200023651123,22.687000274658203 -15.680999755859375,22.5939998626709 -16.500999450683594,22.457000732421875 C-18.141000747680664,22.18000030517578 -19.753000259399414,21.76300048828125 -21.30900001525879,21.194000244140625 C-24.422000885009766,20.062000274658203 -27.339000701904297,18.382999420166016 -29.860000610351562,16.14299964904785 C-32.34600067138672,13.89799976348877 -34.54499816894531,11.041000366210938 -35.48099899291992,7.433000087738037 C-35.939998626708984,5.645999908447266 -36.027000427246094,3.677999973297119 -35.60200119018555,1.8040000200271606 C-35.19200134277344,-0.07400000095367432 -34.30400085449219,-1.8020000457763672 -33.185001373291016,-3.2279999256134033 C-32.630001068115234,-3.940999984741211 -32.00299835205078,-4.603000164031982 -31.375999450683594,-5.178999900817871 C-30.756000518798828,-5.739999771118164 -30.124000549316406,-6.263000011444092 -29.48200035095215,-6.783999919891357 C-28.16200065612793,-7.770999908447266 -26.812000274658203,-8.675999641418457 -25.42799949645996,-9.451000213623047 C-19.895999908447266,-12.581000328063965 -14.107999801635742,-14.696000099182129 -8.293999671936035,-16.604000091552734 C-5.382999897003174,-17.54599952697754 -2.4549999237060547,-18.402000427246094 0.48399999737739563,-19.201000213623047 C3.4179999828338623,-20.014999389648438 6.388999938964844,-20.674999237060547 9.383999824523926,-21.201000213623047 C15.37600040435791,-22.2450008392334 21.385000228881836,-23.076000213623047 27.465999603271484,-23.488000869750977 C27.968000411987305,-23.52199935913086 28.402000427246094,-23.142000198364258 28.43600082397461,-22.639999389648438 C28.46500015258789,-22.201000213623047 28.18000030517578,-21.81399917602539 27.77199935913086,-21.701000213623047 C27.77199935913086,-21.701000213623047 27.756999969482422,-21.69700050354004 27.756999969482422,-21.69700050354004 C21.958999633789062,-20.08799934387207 16.15999984741211,-18.483999252319336 10.418000221252441,-16.788999557495117 C4.690999984741211,-15.053999900817871 -1.1239999532699585,-13.71500015258789 -6.757999897003174,-11.845999717712402 C-12.380000114440918,-10.008999824523926 -17.9689998626709,-7.934999942779541 -22.933000564575195,-5.117000102996826 C-24.179000854492188,-4.422999858856201 -25.33099937438965,-3.6389999389648438 -26.424999237060547,-2.8269999027252197 C-26.950000762939453,-2.3970000743865967 -27.479999542236328,-1.9589999914169312 -27.97800064086914,-1.5110000371932983 C-28.458999633789062,-1.069000005722046 -28.868999481201172,-0.6299999952316284 -29.239999771118164,-0.15600000321865082 C-30.72800064086914,1.7300000190734863 -31.229000091552734,3.937999963760376 -30.635000228881836,6.202000141143799 C-30.066999435424805,8.470000267028809 -28.493999481201172,10.657999992370605 -26.527000427246094,12.416999816894531 C-24.54400062561035,14.180999755859375 -22.149999618530273,15.571000099182129 -19.604000091552734,16.493999481201172 C-18.33099937438965,16.961000442504883 -17.013999938964844,17.298999786376953 -15.684000015258789,17.52400016784668 C-15.019000053405762,17.635000228881836 -14.348999977111816,17.711000442504883 -13.678999900817871,17.757999420166016 C-13.345000267028809,17.784000396728516 -13.005999565124512,17.791000366210938 -12.651000022888184,17.804000854492188 C-12.651000022888184,17.804000854492188 -11.522000312805176,17.839000701904297 -11.522000312805176,17.839000701904297 C-11.522000312805176,17.839000701904297 -2.507999897003174,18.049999237060547 -2.507999897003174,18.049999237060547 C-2.507999897003174,18.049999237060547 15.548999786376953,18.3439998626709 15.548999786376953,18.3439998626709 C21.57200050354004,18.336999893188477 27.59000015258789,18.773000717163086 33.612998962402344,18.70599937438965 C34.922000885009766,18.690000534057617 35.99700164794922,19.73900032043457 36.012001037597656,21.048999786376953 C36.02799987792969,22.35700035095215 34.97800064086914,23.43000030517578 33.66899871826172,23.445999145507812 C33.63600158691406,23.44700050354004 33.59400177001953,23.445999145507812 33.56100082397461,23.44499969482422z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,242.3769989013672,326.44000244140625)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M6.861999988555908,-15.286999702453613 C6.861999988555908,-15.286999702453613 4.564000129699707,-1.0529999732971191 11.585000038146973,7.117000102996826 C18.60700035095215,15.286999702453613 19.180999755859375,14.616999626159668 19.180999755859375,14.616999626159668 C19.180999755859375,14.616999626159668 1.9789999723434448,14.873000144958496 -0.6380000114440918,14.809000015258789 C-3.255000114440918,14.744999885559082 -16.37299919128418,13.182000160217285 -18.67099952697754,1.628000020980835 C-19.180999755859375,-7.946000099182129 6.861999988555908,-15.286999702453613 6.861999988555908,-15.286999702453613z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,228.8209991455078,329.2149963378906)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-7.269000053405762,-2.6730000972747803 C-6.160999774932861,-2.496999979019165 -4.894999980926514,-2.38700008392334 -3.693000078201294,-2.303999900817871 C-2.4749999046325684,-2.2239999771118164 -1.246999979019165,-2.178999900817871 -0.023000000044703484,-2.197000026702881 C1.2000000476837158,-2.2170000076293945 2.434000015258789,-2.2660000324249268 3.6500000953674316,-2.436000108718872 C4.866000175476074,-2.6050000190734863 6.085999965667725,-2.8450000286102295 7.269000053405762,-3.315999984741211 C6.359000205993652,-2.4240000247955322 5.270999908447266,-1.684999942779541 4.144000053405762,-1.0199999809265137 C3.013000011444092,-0.3499999940395355 1.8259999752044678,0.20499999821186066 0.6209999918937683,0.7329999804496765 C-0.5870000123977661,1.2599999904632568 -1.8170000314712524,1.7230000495910645 -3.063999891281128,2.1519999504089355 C-4.328999996185303,2.5799999237060547 -5.539999961853027,2.9730000495910645 -6.916999816894531,3.315999984741211 C-6.916999816894531,3.315999984741211 -7.269000053405762,-2.6730000972747803 -7.269000053405762,-2.6730000972747803z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,233.927001953125,338.2149963378906)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-7.269000053405762,-2.6730000972747803 C-6.160999774932861,-2.496999979019165 -4.894999980926514,-2.38700008392334 -3.691999912261963,-2.303999900817871 C-2.4739999771118164,-2.2239999771118164 -1.246999979019165,-2.178999900817871 -0.023000000044703484,-2.197000026702881 C1.2000000476837158,-2.2170000076293945 2.434999942779541,-2.2660000324249268 3.6500000953674316,-2.436000108718872 C4.867000102996826,-2.6050000190734863 6.085999965667725,-2.8450000286102295 7.269000053405762,-3.315999984741211 C6.360000133514404,-2.4240000247955322 5.270999908447266,-1.684999942779541 4.144999980926514,-1.0199999809265137 C3.0139999389648438,-0.3499999940395355 1.8270000219345093,0.20499999821186066 0.6209999918937683,0.7329999804496765 C-0.5860000252723694,1.2599999904632568 -1.8170000314712524,1.7230000495910645 -3.063999891281128,2.1519999504089355 C-4.328999996185303,2.5799999237060547 -5.539000034332275,2.9730000495910645 -6.915999889373779,3.315999984741211 C-6.915999889373779,3.315999984741211 -7.269000053405762,-2.6730000972747803 -7.269000053405762,-2.6730000972747803z"
              />
            </g>
          </g>
          <g
            style={{ display: "none" }}
            transform="matrix(1,0,0,0.8600000143051147,-95,48.5682373046875)"
            opacity={1}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,251.49200439453125,322.71099853515625)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M36.88199996948242,21.833999633789062 C36.88199996948242,21.833999633789062 1.7669999599456787,21.441999435424805 -9.49899959564209,21.059999465942383 C-24.020000457763672,20.739999771118164 -36.88100051879883,6.506999969482422 -26.062000274658203,-2.877000093460083 C-13.232000350952148,-14.652999877929688 30.905000686645508,-21.833999633789062 30.905000686645508,-21.833999633789062"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,254.78700256347656,323.468994140625)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M33.56100082397461,23.44499969482422 C27.53499984741211,23.239999771118164 21.503999710083008,23.52199935913086 15.479000091552734,23.3439998626709 C15.479000091552734,23.3439998626709 -2.6059999465942383,23.048999786376953 -2.6059999465942383,23.048999786376953 C-2.6059999465942383,23.048999786376953 -11.66100025177002,22.836999893188477 -11.66100025177002,22.836999893188477 C-11.66100025177002,22.836999893188477 -12.791000366210938,22.802000045776367 -12.791000366210938,22.802000045776367 C-13.187999725341797,22.788000106811523 -13.602999687194824,22.777999877929688 -14.019000053405762,22.746000289916992 C-14.85200023651123,22.687000274658203 -15.680999755859375,22.5939998626709 -16.500999450683594,22.457000732421875 C-18.141000747680664,22.18000030517578 -19.753000259399414,21.76300048828125 -21.30900001525879,21.194000244140625 C-24.422000885009766,20.062000274658203 -27.339000701904297,18.382999420166016 -29.860000610351562,16.14299964904785 C-32.34600067138672,13.89799976348877 -34.54499816894531,11.041000366210938 -35.48099899291992,7.433000087738037 C-35.939998626708984,5.645999908447266 -36.027000427246094,3.677999973297119 -35.60200119018555,1.8040000200271606 C-35.19200134277344,-0.07400000095367432 -34.30400085449219,-1.8020000457763672 -33.185001373291016,-3.2279999256134033 C-32.630001068115234,-3.940999984741211 -32.00299835205078,-4.603000164031982 -31.375999450683594,-5.178999900817871 C-30.756000518798828,-5.739999771118164 -30.124000549316406,-6.263000011444092 -29.48200035095215,-6.783999919891357 C-28.16200065612793,-7.770999908447266 -26.812000274658203,-8.675999641418457 -25.42799949645996,-9.451000213623047 C-19.895999908447266,-12.581000328063965 -14.107999801635742,-14.696000099182129 -8.293999671936035,-16.604000091552734 C-5.382999897003174,-17.54599952697754 -2.4549999237060547,-18.402000427246094 0.48399999737739563,-19.201000213623047 C3.4179999828338623,-20.014999389648438 6.388999938964844,-20.674999237060547 9.383999824523926,-21.201000213623047 C15.37600040435791,-22.2450008392334 21.385000228881836,-23.076000213623047 27.465999603271484,-23.488000869750977 C27.968000411987305,-23.52199935913086 28.402000427246094,-23.142000198364258 28.43600082397461,-22.639999389648438 C28.46500015258789,-22.201000213623047 28.18000030517578,-21.81399917602539 27.77199935913086,-21.701000213623047 C27.77199935913086,-21.701000213623047 27.756999969482422,-21.69700050354004 27.756999969482422,-21.69700050354004 C21.958999633789062,-20.08799934387207 16.15999984741211,-18.483999252319336 10.418000221252441,-16.788999557495117 C4.690999984741211,-15.053999900817871 -1.1239999532699585,-13.71500015258789 -6.757999897003174,-11.845999717712402 C-12.380000114440918,-10.008999824523926 -17.9689998626709,-7.934999942779541 -22.933000564575195,-5.117000102996826 C-24.179000854492188,-4.422999858856201 -25.33099937438965,-3.6389999389648438 -26.424999237060547,-2.8269999027252197 C-26.950000762939453,-2.3970000743865967 -27.479999542236328,-1.9589999914169312 -27.97800064086914,-1.5110000371932983 C-28.458999633789062,-1.069000005722046 -28.868999481201172,-0.6299999952316284 -29.239999771118164,-0.15600000321865082 C-30.72800064086914,1.7300000190734863 -31.229000091552734,3.937999963760376 -30.635000228881836,6.202000141143799 C-30.066999435424805,8.470000267028809 -28.493999481201172,10.657999992370605 -26.527000427246094,12.416999816894531 C-24.54400062561035,14.180999755859375 -22.149999618530273,15.571000099182129 -19.604000091552734,16.493999481201172 C-18.33099937438965,16.961000442504883 -17.013999938964844,17.298999786376953 -15.684000015258789,17.52400016784668 C-15.019000053405762,17.635000228881836 -14.348999977111816,17.711000442504883 -13.678999900817871,17.757999420166016 C-13.345000267028809,17.784000396728516 -13.005999565124512,17.791000366210938 -12.651000022888184,17.804000854492188 C-12.651000022888184,17.804000854492188 -11.522000312805176,17.839000701904297 -11.522000312805176,17.839000701904297 C-11.522000312805176,17.839000701904297 -2.507999897003174,18.049999237060547 -2.507999897003174,18.049999237060547 C-2.507999897003174,18.049999237060547 15.548999786376953,18.3439998626709 15.548999786376953,18.3439998626709 C21.57200050354004,18.336999893188477 27.59000015258789,18.773000717163086 33.612998962402344,18.70599937438965 C34.922000885009766,18.690000534057617 35.99700164794922,19.73900032043457 36.012001037597656,21.048999786376953 C36.02799987792969,22.35700035095215 34.97800064086914,23.43000030517578 33.66899871826172,23.445999145507812 C33.63600158691406,23.44700050354004 33.59400177001953,23.445999145507812 33.56100082397461,23.44499969482422z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,242.3769989013672,326.44000244140625)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M6.861999988555908,-15.286999702453613 C6.861999988555908,-15.286999702453613 4.564000129699707,-1.0529999732971191 11.585000038146973,7.117000102996826 C18.60700035095215,15.286999702453613 19.180999755859375,14.616999626159668 19.180999755859375,14.616999626159668 C19.180999755859375,14.616999626159668 1.9789999723434448,14.873000144958496 -0.6380000114440918,14.809000015258789 C-3.255000114440918,14.744999885559082 -16.37299919128418,13.182000160217285 -18.67099952697754,1.628000020980835 C-19.180999755859375,-7.946000099182129 6.861999988555908,-15.286999702453613 6.861999988555908,-15.286999702453613z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,228.8209991455078,329.2149963378906)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-7.269000053405762,-2.6730000972747803 C-6.160999774932861,-2.496999979019165 -4.894999980926514,-2.38700008392334 -3.693000078201294,-2.303999900817871 C-2.4749999046325684,-2.2239999771118164 -1.246999979019165,-2.178999900817871 -0.023000000044703484,-2.197000026702881 C1.2000000476837158,-2.2170000076293945 2.434000015258789,-2.2660000324249268 3.6500000953674316,-2.436000108718872 C4.866000175476074,-2.6050000190734863 6.085999965667725,-2.8450000286102295 7.269000053405762,-3.315999984741211 C6.359000205993652,-2.4240000247955322 5.270999908447266,-1.684999942779541 4.144000053405762,-1.0199999809265137 C3.013000011444092,-0.3499999940395355 1.8259999752044678,0.20499999821186066 0.6209999918937683,0.7329999804496765 C-0.5870000123977661,1.2599999904632568 -1.8170000314712524,1.7230000495910645 -3.063999891281128,2.1519999504089355 C-4.328999996185303,2.5799999237060547 -5.539999961853027,2.9730000495910645 -6.916999816894531,3.315999984741211 C-6.916999816894531,3.315999984741211 -7.269000053405762,-2.6730000972747803 -7.269000053405762,-2.6730000972747803z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,233.927001953125,338.2149963378906)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-7.269000053405762,-2.6730000972747803 C-6.160999774932861,-2.496999979019165 -4.894999980926514,-2.38700008392334 -3.691999912261963,-2.303999900817871 C-2.4739999771118164,-2.2239999771118164 -1.246999979019165,-2.178999900817871 -0.023000000044703484,-2.197000026702881 C1.2000000476837158,-2.2170000076293945 2.434999942779541,-2.2660000324249268 3.6500000953674316,-2.436000108718872 C4.867000102996826,-2.6050000190734863 6.085999965667725,-2.8450000286102295 7.269000053405762,-3.315999984741211 C6.360000133514404,-2.4240000247955322 5.270999908447266,-1.684999942779541 4.144999980926514,-1.0199999809265137 C3.0139999389648438,-0.3499999940395355 1.8270000219345093,0.20499999821186066 0.6209999918937683,0.7329999804496765 C-0.5860000252723694,1.2599999904632568 -1.8170000314712524,1.7230000495910645 -3.063999891281128,2.1519999504089355 C-4.328999996185303,2.5799999237060547 -5.539000034332275,2.9730000495910645 -6.915999889373779,3.315999984741211 C-6.915999889373779,3.315999984741211 -7.269000053405762,-2.6730000972747803 -7.269000053405762,-2.6730000972747803z"
              />
            </g>
          </g>
          <g
            transform="matrix(1.0000096559524536,0,0,0.9999980330467224,-0.0015106201171875,0.00067138671875)"
            opacity="0.3"
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,194.57699584960938,323.4570007324219)"
            >
              <path
                fill="rgb(113,57,5)"
                fillOpacity={1}
                d=" M-68.5770034790039,7.24399995803833 C-68.5770034790039,7.24399995803833 -58.1879997253418,11.567999839782715 -44.52899932861328,11.696000099182129 C-30.868999481201172,11.824000358581543 4.109000205993652,11.696000099182129 7.556000232696533,11.567999839782715 C11.003000259399414,11.440999984741211 14.449999809265137,9.015000343322754 16.108999252319336,4.802999973297119 C17.768999099731445,0.5899999737739563 20.448999404907227,-6.559000015258789 34.875,-12.04800033569336 C49.29999923706055,-17.53700065612793 68.5770034790039,-19.069000244140625 68.5770034790039,-19.069000244140625 C68.5770034790039,-19.069000244140625 44.83300018310547,-14.218999862670898 37.555999755859375,-8.729000091552734 C30.27899932861328,-3.239000082015991 22.492000579833984,7.482999801635742 30.66200065612793,13.611000061035156 C33.152000427246094,15.765000343322754 38.51300048828125,19.06800079345703 38.51300048828125,19.06800079345703 C38.51300048828125,19.06800079345703 -54.26300048828125,18.59000015258789 -54.26300048828125,18.59000015258789 C-60.222999572753906,17.17799949645996 -67.04499816894531,12.350000381469727 -68.5770034790039,7.24399995803833z"
              />
            </g>
          </g>
          <g
            transform="matrix(1,0,0,1,0,0)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,251.49200439453125,322.71099853515625)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M36.88199996948242,21.833999633789062 C36.88199996948242,21.833999633789062 1.7669999599456787,21.441999435424805 -9.49899959564209,21.059999465942383 C-24.020000457763672,20.739999771118164 -36.88100051879883,6.506999969482422 -26.062000274658203,-2.877000093460083 C-13.232000350952148,-14.652999877929688 30.905000686645508,-21.833999633789062 30.905000686645508,-21.833999633789062"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,254.78700256347656,323.468994140625)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M33.56100082397461,23.44499969482422 C27.53499984741211,23.239999771118164 21.503999710083008,23.52199935913086 15.479000091552734,23.3439998626709 C15.479000091552734,23.3439998626709 -2.6059999465942383,23.048999786376953 -2.6059999465942383,23.048999786376953 C-2.6059999465942383,23.048999786376953 -11.66100025177002,22.836999893188477 -11.66100025177002,22.836999893188477 C-11.66100025177002,22.836999893188477 -12.791000366210938,22.802000045776367 -12.791000366210938,22.802000045776367 C-13.187999725341797,22.788000106811523 -13.602999687194824,22.777999877929688 -14.019000053405762,22.746000289916992 C-14.85200023651123,22.687000274658203 -15.680999755859375,22.5939998626709 -16.500999450683594,22.457000732421875 C-18.141000747680664,22.18000030517578 -19.753000259399414,21.76300048828125 -21.30900001525879,21.194000244140625 C-24.422000885009766,20.062000274658203 -27.339000701904297,18.382999420166016 -29.860000610351562,16.14299964904785 C-32.34600067138672,13.89799976348877 -34.54499816894531,11.041000366210938 -35.48099899291992,7.433000087738037 C-35.939998626708984,5.645999908447266 -36.027000427246094,3.677999973297119 -35.60200119018555,1.8040000200271606 C-35.19200134277344,-0.07400000095367432 -34.30400085449219,-1.8020000457763672 -33.185001373291016,-3.2279999256134033 C-32.630001068115234,-3.940999984741211 -32.00299835205078,-4.603000164031982 -31.375999450683594,-5.178999900817871 C-30.756000518798828,-5.739999771118164 -30.124000549316406,-6.263000011444092 -29.48200035095215,-6.783999919891357 C-28.16200065612793,-7.770999908447266 -26.812000274658203,-8.675999641418457 -25.42799949645996,-9.451000213623047 C-19.895999908447266,-12.581000328063965 -14.107999801635742,-14.696000099182129 -8.293999671936035,-16.604000091552734 C-5.382999897003174,-17.54599952697754 -2.4549999237060547,-18.402000427246094 0.48399999737739563,-19.201000213623047 C3.4179999828338623,-20.014999389648438 6.388999938964844,-20.674999237060547 9.383999824523926,-21.201000213623047 C15.37600040435791,-22.2450008392334 21.385000228881836,-23.076000213623047 27.465999603271484,-23.488000869750977 C27.968000411987305,-23.52199935913086 28.402000427246094,-23.142000198364258 28.43600082397461,-22.639999389648438 C28.46500015258789,-22.201000213623047 28.18000030517578,-21.81399917602539 27.77199935913086,-21.701000213623047 C27.77199935913086,-21.701000213623047 27.756999969482422,-21.69700050354004 27.756999969482422,-21.69700050354004 C21.958999633789062,-20.08799934387207 16.15999984741211,-18.483999252319336 10.418000221252441,-16.788999557495117 C4.690999984741211,-15.053999900817871 -1.1239999532699585,-13.71500015258789 -6.757999897003174,-11.845999717712402 C-12.380000114440918,-10.008999824523926 -17.9689998626709,-7.934999942779541 -22.933000564575195,-5.117000102996826 C-24.179000854492188,-4.422999858856201 -25.33099937438965,-3.6389999389648438 -26.424999237060547,-2.8269999027252197 C-26.950000762939453,-2.3970000743865967 -27.479999542236328,-1.9589999914169312 -27.97800064086914,-1.5110000371932983 C-28.458999633789062,-1.069000005722046 -28.868999481201172,-0.6299999952316284 -29.239999771118164,-0.15600000321865082 C-30.72800064086914,1.7300000190734863 -31.229000091552734,3.937999963760376 -30.635000228881836,6.202000141143799 C-30.066999435424805,8.470000267028809 -28.493999481201172,10.657999992370605 -26.527000427246094,12.416999816894531 C-24.54400062561035,14.180999755859375 -22.149999618530273,15.571000099182129 -19.604000091552734,16.493999481201172 C-18.33099937438965,16.961000442504883 -17.013999938964844,17.298999786376953 -15.684000015258789,17.52400016784668 C-15.019000053405762,17.635000228881836 -14.348999977111816,17.711000442504883 -13.678999900817871,17.757999420166016 C-13.345000267028809,17.784000396728516 -13.005999565124512,17.791000366210938 -12.651000022888184,17.804000854492188 C-12.651000022888184,17.804000854492188 -11.522000312805176,17.839000701904297 -11.522000312805176,17.839000701904297 C-11.522000312805176,17.839000701904297 -2.507999897003174,18.049999237060547 -2.507999897003174,18.049999237060547 C-2.507999897003174,18.049999237060547 15.548999786376953,18.3439998626709 15.548999786376953,18.3439998626709 C21.57200050354004,18.336999893188477 27.59000015258789,18.773000717163086 33.612998962402344,18.70599937438965 C34.922000885009766,18.690000534057617 35.99700164794922,19.73900032043457 36.012001037597656,21.048999786376953 C36.02799987792969,22.35700035095215 34.97800064086914,23.43000030517578 33.66899871826172,23.445999145507812 C33.63600158691406,23.44700050354004 33.59400177001953,23.445999145507812 33.56100082397461,23.44499969482422z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,242.3769989013672,326.44000244140625)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M6.861999988555908,-15.286999702453613 C6.861999988555908,-15.286999702453613 4.564000129699707,-1.0529999732971191 11.585000038146973,7.117000102996826 C18.60700035095215,15.286999702453613 19.180999755859375,14.616999626159668 19.180999755859375,14.616999626159668 C19.180999755859375,14.616999626159668 1.9789999723434448,14.873000144958496 -0.6380000114440918,14.809000015258789 C-3.255000114440918,14.744999885559082 -16.37299919128418,13.182000160217285 -18.67099952697754,1.628000020980835 C-19.180999755859375,-7.946000099182129 6.861999988555908,-15.286999702453613 6.861999988555908,-15.286999702453613z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,228.8209991455078,329.2149963378906)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-7.269000053405762,-2.6730000972747803 C-6.160999774932861,-2.496999979019165 -4.894999980926514,-2.38700008392334 -3.693000078201294,-2.303999900817871 C-2.4749999046325684,-2.2239999771118164 -1.246999979019165,-2.178999900817871 -0.023000000044703484,-2.197000026702881 C1.2000000476837158,-2.2170000076293945 2.434000015258789,-2.2660000324249268 3.6500000953674316,-2.436000108718872 C4.866000175476074,-2.6050000190734863 6.085999965667725,-2.8450000286102295 7.269000053405762,-3.315999984741211 C6.359000205993652,-2.4240000247955322 5.270999908447266,-1.684999942779541 4.144000053405762,-1.0199999809265137 C3.013000011444092,-0.3499999940395355 1.8259999752044678,0.20499999821186066 0.6209999918937683,0.7329999804496765 C-0.5870000123977661,1.2599999904632568 -1.8170000314712524,1.7230000495910645 -3.063999891281128,2.1519999504089355 C-4.328999996185303,2.5799999237060547 -5.539999961853027,2.9730000495910645 -6.916999816894531,3.315999984741211 C-6.916999816894531,3.315999984741211 -7.269000053405762,-2.6730000972747803 -7.269000053405762,-2.6730000972747803z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,233.927001953125,338.2149963378906)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-7.269000053405762,-2.6730000972747803 C-6.160999774932861,-2.496999979019165 -4.894999980926514,-2.38700008392334 -3.691999912261963,-2.303999900817871 C-2.4739999771118164,-2.2239999771118164 -1.246999979019165,-2.178999900817871 -0.023000000044703484,-2.197000026702881 C1.2000000476837158,-2.2170000076293945 2.434999942779541,-2.2660000324249268 3.6500000953674316,-2.436000108718872 C4.867000102996826,-2.6050000190734863 6.085999965667725,-2.8450000286102295 7.269000053405762,-3.315999984741211 C6.360000133514404,-2.4240000247955322 5.270999908447266,-1.684999942779541 4.144999980926514,-1.0199999809265137 C3.0139999389648438,-0.3499999940395355 1.8270000219345093,0.20499999821186066 0.6209999918937683,0.7329999804496765 C-0.5860000252723694,1.2599999904632568 -1.8170000314712524,1.7230000495910645 -3.063999891281128,2.1519999504089355 C-4.328999996185303,2.5799999237060547 -5.539000034332275,2.9730000495910645 -6.915999889373779,3.315999984741211 C-6.915999889373779,3.315999984741211 -7.269000053405762,-2.6730000972747803 -7.269000053405762,-2.6730000972747803z"
              />
            </g>
          </g>
          <g
            transform="matrix(1,0,0,1,0,0)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity={1}
              transform="matrix(1,0,0,1,152.83200073242188,324.56201171875)"
            >
              <path
                fill="rgb(244,171,31)"
                fillOpacity={1}
                d=" M36.45399856567383,20.43000030517578 C36.45399856567383,20.43000030517578 1.8910000324249268,19.99799919128418 -9.119999885559082,19.80699920654297 C-23.641000747680664,19.488000869750977 -36.45500183105469,5.230000019073486 -25.63599967956543,-4.1529998779296875 C-12.805999755859375,-15.930000305175781 17.641000747680664,-20.43000030517578 17.641000747680664,-20.43000030517578"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,156.14999389648438,325.3290100097656)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M33.106998443603516,22.104999542236328 C22.27199935913086,22.062000274658203 11.437999725341797,21.847000122070312 0.6039999723434448,21.718000411987305 C0.6039999723434448,21.718000411987305 -7.5229997634887695,21.607999801635742 -7.5229997634887695,21.607999801635742 C-7.5229997634887695,21.607999801635742 -11.585000038146973,21.552000045776367 -11.585000038146973,21.552000045776367 C-11.585000038146973,21.552000045776367 -12.614999771118164,21.535999298095703 -12.614999771118164,21.535999298095703 C-12.994000434875488,21.52400016784668 -13.371999740600586,21.506999969482422 -13.744999885559082,21.479000091552734 C-14.493000030517578,21.42300033569336 -15.237000465393066,21.343000411987305 -15.975000381469727,21.22100067138672 C-21.867000579833984,20.246000289916992 -27.440000534057617,17.45599937438965 -31.499000549316406,12.819000244140625 C-33.487998962402344,10.5 -35.11399841308594,7.564000129699707 -35.433998107910156,4.1539998054504395 C-35.59000015258789,2.4649999141693115 -35.37300109863281,0.699999988079071 -34.790000915527344,-0.9100000262260437 C-34.21200180053711,-2.5230000019073486 -33.30099868774414,-3.9600000381469727 -32.2400016784668,-5.172999858856201 C-31.708999633789062,-5.7769999504089355 -31.12299919128418,-6.341000080108643 -30.576000213623047,-6.821000099182129 C-30.02199935913086,-7.2870001792907715 -29.500999450683594,-7.781000137329102 -28.91699981689453,-8.220000267028809 C-27.770999908447266,-9.123000144958496 -26.591999053955078,-9.96399974822998 -25.375999450683594,-10.713000297546387 C-22.954999923706055,-12.23900032043457 -20.441999435424805,-13.526000022888184 -17.888999938964844,-14.67199993133545 C-15.336000442504883,-15.817000389099121 -12.73799991607666,-16.812999725341797 -10.119999885559082,-17.71500015258789 C-7.499000072479248,-18.604000091552734 -4.873000144958496,-19.46500015258789 -2.180000066757202,-20.05900001525879 C3.2219998836517334,-21.19099998474121 8.666000366210938,-21.92099952697754 14.190999984741211,-22.093000411987305 C14.694999694824219,-22.108999252319336 15.116000175476074,-21.71299934387207 15.131999969482422,-21.208999633789062 C15.145000457763672,-20.78700065612793 14.869000434875488,-20.422000885009766 14.482000350952148,-20.305999755859375 C14.482000350952148,-20.305999755859375 14.456000328063965,-20.298999786376953 14.456000328063965,-20.298999786376953 C9.288000106811523,-18.750999450683594 4.138999938964844,-17.138999938964844 -0.906000018119812,-15.416999816894531 C-3.434999942779541,-14.57800006866455 -5.993000030517578,-13.862000465393066 -8.491999626159668,-12.98900032043457 C-10.993000030517578,-12.125 -13.458000183105469,-11.180000305175781 -15.845999717712402,-10.109000205993652 C-18.232999801635742,-9.038000106811523 -20.548999786376953,-7.8460001945495605 -22.709999084472656,-6.484000205993652 C-23.801000595092773,-5.814000129699707 -24.827999114990234,-5.076000213623047 -25.80900001525879,-4.304999828338623 C-26.30900001525879,-3.931999921798706 -26.768999099731445,-3.489000082015991 -27.253000259399414,-3.0850000381469727 C-27.724000930786133,-2.671999931335449 -28.11199951171875,-2.2920000553131104 -28.476999282836914,-1.8799999952316284 C-29.92799949645996,-0.23000000417232513 -30.648000717163086,1.6929999589920044 -30.45400047302246,3.7079999446868896 C-30.277000427246094,5.72599983215332 -29.225000381469727,7.802999973297119 -27.70199966430664,9.565999984741211 C-24.625999450683594,13.119000434875488 -19.95599937438965,15.52400016784668 -15.189000129699707,16.284000396728516 C-14.590999603271484,16.382999420166016 -13.98900032043457,16.44700050354004 -13.38700008392334,16.492000579833984 C-13.085000038146973,16.514999389648438 -12.786999702453613,16.527000427246094 -12.489999771118164,16.53700065612793 C-12.489999771118164,16.53700065612793 -11.48799991607666,16.55299949645996 -11.48799991607666,16.55299949645996 C-11.48799991607666,16.55299949645996 -7.427999973297119,16.608999252319336 -7.427999973297119,16.608999252319336 C-7.427999973297119,16.608999252319336 0.6909999847412109,16.7189998626709 0.6909999847412109,16.7189998626709 C11.517000198364258,16.886999130249023 22.341999053955078,16.966999053955078 33.16699981689453,17.219999313354492 C33.16699981689453,17.219999313354492 33.17300033569336,17.22100067138672 33.17300033569336,17.22100067138672 C34.520999908447266,17.25200080871582 35.5890007019043,18.371000289916992 35.55699920654297,19.7189998626709 C35.5260009765625,21.051000595092773 34.43299865722656,22.108999252319336 33.106998443603516,22.104999542236328z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,144.0800018310547,326.6960144042969)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M7.117000102996826,-15.286999702453613 C7.117000102996826,-15.286999702453613 4.817999839782715,-1.0540000200271606 11.84000015258789,7.117000102996826 C18.861000061035156,15.286999702453613 18.924999237060547,14.809000015258789 18.924999237060547,14.809000015258789 C18.924999237060547,14.809000015258789 1.1480000019073486,15.128000259399414 -1.468999981880188,15.064000129699707 C-4.085999965667725,15 -16.118000030517578,13.180999755859375 -18.416000366210938,1.628000020980835 C-18.926000595092773,-7.947000026702881 7.117000102996826,-15.286999702453613 7.117000102996826,-15.286999702453613z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,131.8000030517578,329.4700012207031)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-7.269000053405762,-2.6730000972747803 C-6.160999774932861,-2.496999979019165 -4.894999980926514,-2.388000011444092 -3.691999912261963,-2.303999900817871 C-2.4739999771118164,-2.2249999046325684 -1.246999979019165,-2.178999900817871 -0.023000000044703484,-2.196000099182129 C1.2000000476837158,-2.2160000801086426 2.434999942779541,-2.2669999599456787 3.6500000953674316,-2.437000036239624 C4.867000102996826,-2.6059999465942383 6.085999965667725,-2.8459999561309814 7.269000053405762,-3.316999912261963 C6.360000133514404,-2.424999952316284 5.270999908447266,-1.684999942779541 4.144999980926514,-1.0210000276565552 C3.0139999389648438,-0.35100001096725464 1.8270000219345093,0.20600000023841858 0.6209999918937683,0.7329999804496765 C-0.5860000252723694,1.2599999904632568 -1.8170000314712524,1.7230000495910645 -3.063999891281128,2.1519999504089355 C-4.328999996185303,2.5789999961853027 -5.539000034332275,2.9730000495910645 -6.915999889373779,3.316999912261963 C-6.915999889373779,3.316999912261963 -7.269000053405762,-2.6730000972747803 -7.269000053405762,-2.6730000972747803z"
              />
            </g>
            <g
              opacity={1}
              transform="matrix(1,0,0,1,136.3209991455078,338.52899169921875)"
            >
              <path
                fill="rgb(118,19,99)"
                fillOpacity={1}
                d=" M-7.855000019073486,-2.6110000610351562 C-6.63100004196167,-2.447999954223633 -5.270999908447266,-2.3459999561309814 -3.9660000801086426,-2.2699999809265137 C-2.6459999084472656,-2.196000099182129 -1.3220000267028809,-2.1610000133514404 0,-2.180999994277954 C1.3240000009536743,-2.1989998817443848 2.6510000228881836,-2.26200008392334 3.9630000591278076,-2.436000108718872 C5.27400016784668,-2.611999988555908 6.5920000076293945,-2.8510000705718994 7.854000091552734,-3.375999927520752 C6.86299991607666,-2.427000045776367 5.6579999923706055,-1.6829999685287476 4.431000232696533,-1.0110000371932983 C3.196000099182129,-0.3370000123977661 1.9110000133514404,0.2329999953508377 0.6069999933242798,0.7559999823570251 C-0.6970000267028809,1.284000039100647 -2.0220000743865967,1.75600004196167 -3.359999895095825,2.188999891281128 C-4.714000225067139,2.621000051498413 -6.021999835968018,3.0220000743865967 -7.474999904632568,3.375999927520752 C-7.474999904632568,3.375999927520752 -7.855000019073486,-2.6110000610351562 -7.855000019073486,-2.6110000610351562z"
              />
            </g>
          </g>
          <g
            transform="matrix(1.0000096559524536,0,0,0.9999980330467224,-0.0015106201171875,0.00067138671875)"
            opacity={1}
            style={{ display: "block" }}
          >
            <g
              opacity="0.6"
              transform="matrix(1,0,0,1,247.8249969482422,224.1750030517578)"
            >
              <path
                fill="rgb(255,255,255)"
                fillOpacity={1}
                d=" M-61.40999984741211,12.553000450134277 C-61.40999984741211,12.553000450134277 -34.45800018310547,-6.7870001792907715 -0.5640000104904175,-7.552999973297119 C33.32899856567383,-8.319000244140625 52.095001220703125,3.361999988555908 57.64799880981445,7.765999794006348 C60.34199905395508,9.902999877929688 61.80400085449219,9.515999794006348 61.31800079345703,8.404000282287598 C60.361000061035156,7.239999771118164 58.191001892089844,5.2769999504089355 56.834999084472656,4.0320000648498535 C50.611000061035156,-1.569000005722046 36.20199966430664,-13.105999946594238 1.5420000553131104,-12.531999588012695 C-37.042999267578125,-11.095999717712402 -61.40999984741211,12.553000450134277 -61.40999984741211,12.553000450134277z"
              />
            </g>
          </g>
        </g>
      </svg>
    </React.Fragment>
  );
};

// import React, { useState, useEffect } from 'react';
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
            "relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 py-2 mb-3 bg-gray-50 rounded-lg shadow-md",
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
            <GripVertical className="h-5 w-5" />
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
                      onClick={() =>
                        dispatch(
                          updateTask({
                            id: todo.id,
                            key: date.timestamp,
                            updated_task: {
                              title: todo.title,
                              status: "paused",
                              start_at: null,
                            },
                          }),
                        )
                      }
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
            <div className="relative flex w-full items-center">
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
                maxHeight={800}
                placeholder="Untitled"
                autoComplete="off"
              />
              <div className="ml-auto flex items-center gap-2 absolute right-3 top-1">
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
              <div className="relative ml-1 block py-0.5 md:block">
                <div className="flex items-end">
                  <div>
                    <div className="overflow-hidden items-center justify-start gap-1 md:flex h-3">
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
                            "h-3 w-3 shrink-0 cursor-pointer rounded-full ",
                            todo?.sessions?.length >= index + 1
                              ? "bg-green-400"
                              : todo?.target_sessions >= index + 1
                                ? "bg-gray-500"
                                : "bg-gray-300 hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
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
                    <div className="absolute left-0 top-0 flex items-center gap-1 py-0.5" />
                    <div className="mt-2 inline-block rounded p-1 text-sm text-black dark:text-white">
                      <div className={todo?.start_at ? "todo-progress" : ""}>
                        {new Date(totalSessionTime).toISOString().substr(11, 8)}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto pr-1 pb-0.5">
                    <div className="flex items-center gap-x-1.5 ml-auto">
                      <SelectDemo task={task} date={date} />
                    </div>
                  </div>
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
        <CollapsibleContent className="CollapsibleContent space-y-2 text-text font-base">
          {task.sub_tasks?.map((subtask, index) => {
            return (
              <div
                key={index}
                className={cn(
                  "ml-5 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 bg-gray-50 rounded-lg py-2 mb-2 shadow-md",
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
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="">
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
                  <div className="relative flex w-full items-center">
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
                    <div className="ml-auto flex items-center gap-2 absolute right-3 top-1">
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
}) => {
  const dispatch = useAppDispatch();
  return (
    <button
      className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-red-600"
      onClick={async () => {
        const prompt = await confirm({
          title: "Are you absolutely sure?",
          body: "This action cannot be undone. This will permanently delete your task",
          cancelButton: "Cancel",
          actionButton: "Delete",
        });
        if (prompt) {
          if (sub_task_id) {
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
      <SelectTrigger className="border-none focus:ring-0 shadow-none w-fit p-0">
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

import { get_cache, set_cache } from "@/lib/cache-client";
const cache_key = `todos-key`;

function KanbanBoard() {
  const { data: tasks, date, streak_data } = useLoaderData();
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const pickedUpTaskColumn = useRef<ColumnId | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const saveTasksToLocalForage = async (tasks: Task[]) => {
    try {
      const cached_data = (await get_cache(cache_key)) as {} | null;
      await set_cache(cache_key, {
        ...cached_data,
        [date.key]: [...tasks], // Menyimpan data berdasarkan tanggal
      });
    } catch (error) {
      console.error("Error saving tasks to localforage", error);
    }
  };

  // const [tasks, setTasks] = useLocalStorageState("tasks-kanban", initialTasks);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

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
          active.data.current.task.title
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
            active.data.current.task.title
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
      <BoardContainer>
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((task) => task.columnId === col.id)}
            />
          ))}
        </SortableContext>
      </BoardContainer>

      {"document" in window &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                isOverlay
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id,
                )}
              />
            )}
            {activeTask && <TaskCard task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  async function onDragOver(event: DragOverEvent) {
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
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);
      const activeTask = tasks[activeIndex];
      const overTask = tasks[overIndex];
      if (activeTask && overTask && activeTask.columnId !== overTask.columnId) {
        activeTask.columnId = overTask.columnId;
        return arrayMove(tasks, activeIndex, overIndex - 1);
      }

      const updatedTasks = arrayMove(tasks, activeIndex, overIndex);
      saveTasksToLocalForage(updatedTasks); // Simpan ke localforage setelah update
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      // setTasks((tasks) => {
      //   const activeIndex = tasks.findIndex((t) => t.id === activeId);
      //   const activeTask = tasks[activeIndex];
      //   if (activeTask) {
      //     activeTask.columnId = overId as ColumnId;
      //     return arrayMove(tasks, activeIndex, activeIndex);
      //   }
      //   return tasks;
      // });
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

function BoardColumn({ column, tasks, isOverlay }: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    "h-[90vh] max-h-[90vh] w-[30vw] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    },
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="p-4 font-semibold border-b-2 text-left flex flex-row space-between items-center">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className=" p-1 text-primary/50 -ml-2 h-auto cursor-grab relative"
        >
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <GripVertical />
        </Button>
        <span className="ml-auto"> {column.title}</span>
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex flex-grow flex-col gap-2 p-2">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva("px-2 md:px-0 flex lg:justify-center pb-4", {
    variants: {
      dragging: {
        default: "snap-x snap-mandatory",
        active: "snap-none",
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}
    >
      <div className="flex gap-4 items-center flex-row justify-center">
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
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

function TaskCard({ task, isOverlay }: TaskCardProps) {
  const todo = task;
  const index = 1;
  const fetcher = useDebounceFetcher();

  const fetcherPlay = useFetcher({ key: "play" + todo.id });
  const submit = useSubmit();
  const { data: todos, date, active_task } = useLoaderData();
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

  const transformedSubTasks =
    task?.sub_tasks?.length > 0
      ? task.sub_tasks.map((subTask) => ({
          ...subTask,
          checked: subTask.checked ? "on" : "off", // Transformasi boolean ke "on"/"off"
        }))
      : [];

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
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });
  return (
    <Form
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
      method="post"
    >
      <div
        className={cn(
          "relative  inset-0 w-full transition-all ease-in-out duration-500",
        )}
      >
        <Collapsible defaultOpen={true}>
          <div
            className={cn(
              "relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 py-2 mb-3 bg-gray-50 rounded-lg shadow-md",
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
              <Button
                variant={"ghost"}
                {...attributes}
                {...listeners}
                className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
              >
                <span className="sr-only">Move task</span>
                <GripVertical />
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
                        onClick={() =>
                          fetcherPlay.submit(
                            {
                              intent: "update-status-task",
                              id: todo.id,
                              status: "pause",
                            },
                            { action: routeAction, method: "POST" },
                          )
                        }
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
                          fetcherPlay.submit(
                            {
                              intent: "update-status-task",
                              id: todo.id,
                              status: "progress",
                            },
                            { action: routeAction, method: "POST" },
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
              <div className="relative flex w-full items-center">
                <AutosizeTextarea
                  key={`title-${todo.id}`}
                  name="title"
                  defaultValue={todo.title}
                  onChange={(event) => {
                    fetcher.submit(event.target.form, {
                      navigate: false, // use a fetcher instead of a page navigation
                      fetcherKey: task.id, // cancel any previous fetcher with the same key
                      debounceTimeout: 1000,
                    });
                  }}
                  style={{ resize: "none" }}
                  className="w-full bg-transparent p-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
                  maxHeight={800}
                  placeholder="Untitled"
                  autoComplete="off"
                />
                <div className="ml-auto flex items-center gap-1 mr-2">
                  <CollapsibleTrigger data-state="open">
                    <ChevronsUpDown className="w-5 h-5  data-[state=open]:hidden block" />
                    <X className="w-5 h-5 data-[state=open]:block hidden" />
                    <span className="sr-only">Toggle</span>
                  </CollapsibleTrigger>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="link">
                        <EllipsisVertical className="w-5 h-5 " />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          submit(
                            {
                              intent: "add-sub-task",
                              id: todo.id,
                              sub_tasks: JSON.stringify({
                                id: Date.now().toString(), // Default ID unik
                                title: "",
                                checked: "off",
                                category: "",
                              }),
                            },
                            { action: routeAction, method: "POST" },
                          )
                        }
                      >
                        <Plus /> Add Subtask
                      </DropdownMenuItem>
                      {todo.status !== "done" && (
                        <DropdownMenuItem
                          className="text-green-500"
                          onClick={() =>
                            submit(
                              {
                                intent: "update-status-task",
                                id: todo.id,
                                status: "done",
                              },
                              { action: routeAction, method: "POST" },
                            )
                          }
                        >
                          <CircleCheckBig />
                          Mark as done
                        </DropdownMenuItem>
                      )}

                      <AlertDialogProvider>
                        <DeleteTask id={todo.id} />
                      </AlertDialogProvider>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div>
                <div className="relative ml-1 block py-0.5 md:block">
                  <div className="flex items-end">
                    <div>
                      <div className="overflow-hidden items-center justify-start gap-1 md:flex h-3">
                        {new Array(16).fill(null).map((_, index) => (
                          <button
                            onClick={() => {
                              submit(
                                {
                                  intent: "update-target-task-session",
                                  id: todo.id,
                                  target_sessions: index + 1,
                                },
                                { action: routeAction, method: "POST" },
                              );
                            }}
                            key={index} // Gunakan key untuk identifikasi unik
                            type="button"
                            style={{ animationDelay: `${index * 0.03}s` }}
                            className={cn(
                              "h-3 w-3 shrink-0 cursor-pointer rounded-full ",
                              todo?.sessions?.length >= index + 1
                                ? "bg-green-400"
                                : todo?.target_sessions >= index + 1
                                  ? "bg-gray-500"
                                  : "bg-gray-300 hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                            )}
                          />
                        ))}
                        <button
                          style={{ animationDelay: `${16 * 0.03}s` }}
                          onClick={() => {
                            submit(
                              {
                                intent: "update-target-task-session",
                                id: todo.id,
                                target_sessions: 0,
                              },
                              { action: routeAction, method: "POST" },
                            );
                          }}
                          className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-red-400 text-white flex items-center justify-center hidden group-hover:flex  animate-roll-reveal [animation-fill-mode:backwards] "
                        >
                          <X />
                        </button>
                      </div>
                      <div className="absolute left-0 top-0 flex items-center gap-1 py-0.5" />
                      <div className="mt-2 inline-block rounded p-1 text-sm text-black dark:text-white">
                        <div className={todo?.start_at ? "todo-progress" : ""}>
                          {new Date(totalSessionTime)
                            .toISOString()
                            .substr(11, 8)}
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto px-2 pb-0.5">
                      <div className="flex items-center gap-x-1.5 ml-auto px-2">
                        <input
                          key={`category-${todo.id}`}
                          id={`category-${todo.id}`}
                          className="font-bold w-fit bg-transparent p-1 outline-none text-xs text-right"
                          onChange={(event) => {
                            fetcher.submit(event.target.form, {
                              navigate: false,
                              fetcherKey: task.id,
                              debounceTimeout: 1000,
                            });
                          }}
                        />
                        <label
                          htmlFor={`category-${todo.id}`}
                          className="h-4 w-4 rounded bg-gray-200"
                        />
                      </div>
                    </div>
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
          <CollapsibleContent className="CollapsibleContent space-y-2 text-text font-base">
            {transformedSubTasks?.map((subtask, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    "ml-5 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 bg-gray-50 rounded-lg py-2 mb-2 shadow-md",
                    active_task && todo.status !== "progress"
                      ? "bg-white/40 text-muted-foreground opacity-80"
                      : subtask.checked === "on"
                        ? "bg-green-100 dark:bg-green-900 bg-gradient-to-l via-white dark:via-black from-green-50 dark:from-green-950 opacity-100"
                        : "opacity-100",
                  )}
                >
                  {subtask.checked === "on" && (
                    <CircleCheckBig className="absolute top-0 -right-4 w-28 h-28 text-green-500 dark:text-green-400 opacity-30" />
                  )}
                  <div
                    className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
                    style={{ touchAction: "none" }}
                    draggable="true"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="">
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
                        defaultChecked={subtask.checked === "on"}
                        onChange={(event) => {
                          fetcher.submit(event.target.form, {
                            navigate: false,
                            fetcherKey: task.id,
                            debounceTimeout: 0,
                          });
                        }}
                        className="accent-green-400 scale-150"
                        key={`sub_tasks[${index}].checked`}
                        name={`sub_tasks[${index}].checked`}
                        id={`sub_tasks[${index}].checked`}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="relative flex w-full items-center">
                      <AutosizeTextarea
                        defaultValue={subtask.title}
                        key={`sub_tasks[${index}].title`} // Dinamis berdasarkan index
                        name={`sub_tasks[${index}].title`} // Dinamis berdasarkan index
                        id={`sub_tasks[${index}].title`} // Dinamis ber
                        onChange={(event) => {
                          fetcher.submit(event.target.form, {
                            navigate: false,
                            fetcherKey: task.id,
                            debounceTimeout: 1000,
                          });
                        }}
                        style={{ resize: "none" }}
                        className="w-full bg-transparent p-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
                        maxHeight={800}
                        placeholder="Untitled"
                        autoComplete="off"
                      />
                      <div className="ml-auto flex items-center">
                        <div className="">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="link">
                                <EllipsisVertical className="w-5 h-5 " />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AlertDialogProvider>
                                <DeleteTask id={subtask.id} />
                              </AlertDialogProvider>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="relative ml-1 block py-0.5 md:block">
                        <div className="flex items-end">
                          <div className="flex items-center gap-x-1.5 ml-auto px-2">
                            <input
                              className="fontsubtask-bold w-fit bg-transparent p-1 outline-none text-xs text-right"
                              defaultValue={subtask.category}
                              onChange={(event) => {
                                fetcher.submit(event.target.form, {
                                  navigate: false,
                                  fetcherKey: task.id,
                                  debounceTimeout: 1000,
                                });
                              }}
                              key={`sub_tasks[${index}].category`}
                              name={`sub_tasks[${index}].category`}
                              id={`sub_tasks[${index}].category`}
                            />
                            <label
                              htmlFor={`sub_tasks[${index}].category`}
                              className="h-4 w-4 rounded bg-gray-200"
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

      <HiddenFields
        data={{
          id: todo.id,
          status: todo.status,
          target_sessions: todo.target_sessions,
          intent: "update-task",
          completed_sessions: todo.completed_sessions,
        }}
      />
    </Form>
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
