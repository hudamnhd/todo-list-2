import { RenderTracker } from "@/components/render-tracker.tsx";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import RichTextEditor from "@/components/text-editor";
import { Link, useBlocker, NavLink } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import React, { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import store from "@/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addTask,
  copyTask,
  addSubTask,
  updateTask,
  deleteTask,
  deleteSubTask,
  updateSubTask,
  updateSessionTask,
  updateTasksColumn,
  updateSubTasksColumn,
  Task,
  setTasks,
} from "@/features/daily-tasks/actions";
import { faker } from "@faker-js/faker";
import { set_cache, get_cache } from "@/lib/cache-client";
import {
  AlertDialogProvider,
  useConfirm,
} from "@/components/ui/alert-dialog-provider.tsx";
import {
  ChevronsUpDown,
  Info,
  Download,
  Upload,
  EllipsisVertical,
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
  CircleCheckBig,
  CirclePlus,
  Squircle,
  Trash2,
  History,
  Filter,
  ChevronRight,
  ChevronLeft,
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
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Debug } from "@/components/debug";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

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
    target_sessions: faker.number.int({ min: 1, max: 8 }),
    sessions,
    status: faker.helpers.arrayElement(["paused", "completed"]),
    title: faker.lorem.words(2),
    columnId: faker.helpers.arrayElement(["completed", "todo"]),
    category: {
      label: faker.helpers.arrayElement(["General"]),
      color: faker.helpers.arrayElement(["#9ca3af"]),
    },
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

  const data_tasks = localStorage.getItem("daily-tasks");
  const initialTasks = data_tasks ? JSON.parse(data_tasks) : {};
  // const initialTasks = await get_cache("daily-tasks");

  // const testData = generate_todos_by_date("2024-11-22", 30); // Data untuk 7 hari mulai dari 1 Desember 2024
  // store.dispatch(setTasks(testData));
  //
  // if (spinner) {
  //   spinner.style.display = "none";
  // }
  // initial_data = false;
  // return;

  const now = new Date();

  // Fungsi untuk memperbarui status
  function updateStatus(data: Data): Data {
    for (const date in data) {
      const tasks = data[date];

      for (const task of tasks) {
        // Cek jika status progress
        if (task.status === "progress") {
          // Ambil waktu terakhir dari sessions
          const lastSessionTime = new Date(
            task.sessions[task.sessions.length - 1],
          );

          // Jika sudah lebih dari 25 menit
          const diffMinutes =
            (now.getTime() - lastSessionTime.getTime()) / 1000 / 60;

          if (diffMinutes > 25) {
            task.status = "pending";
            console.log(
              `Status updated to 'pending' for task ${task.id} due to timeout.`,
            );
          } else {
            console.log(`No status update needed for task ${task.id}.`);
          }
        }
      }
    }

    return data;
  }

  try {
    if (initialTasks) {
      const updatedData = updateStatus(initialTasks);
      store.dispatch(setTasks(updatedData));
    } else {
      store.dispatch(setTasks({}));
    }
    initial_data = false;
  } catch (error) {
    console.warn("DEBUGPRINT[2]: todo.tsx:81: error=", error);
    initial_data = false;
  } finally {
    if (spinner) {
      spinner.style.display = "none";
    }
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

async function save_data_daily_tasks(data) {
  set_cache("daily-tasks", data);
}

const navItems = [
  { to: "/daily", label: "Daily" },
  { to: "/muslim/sholawat", label: "Sholawat" },
  { to: "/muslim/quran-surat", label: "Qur'an" },
];

import { Outlet, useLocation } from "react-router-dom";

export function Layout() {
  return (
    <React.Fragment>
      <div className="flex h-14 items-center px-4 border-b sticky top-0 bg-transparent backdrop-blur-md z-10">
        <div className="mr-4 hidden md:flex">
          <NavLink className="mr-4 flex items-center gap-2 lg:mr-6" to="/">
            <Activity className="w-5 h-5" />
            <span className="hidden font-bold lg:inline-block">Activity</span>
          </NavLink>
          <nav className="flex items-center gap-4 text-sm xl:gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    isActive ? "text-primary" : "text-muted-foreground/80",
                    "text-sm font-medium transition-colors hover:text-primary",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <NavbarMobile />
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <CommandMenu />
          <nav className="flex items-center gap-0.5">
            <ThemeSwitch />
          </nav>
        </div>
      </div>
      <Outlet />
    </React.Fragment>
  );
}

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
  // const active_task = checkSessionStatus(data);
  const all_session = calculateGlobalSessionCount(data);
  const streak_data = calculateStreak(data);
  // This could be useState, useOptimistic, or other state

  // useBeforeUnload(
  //   React.useCallback(() => {
  //     if (
  //       data &&
  //       Object.keys(data).length > 0 &&
  //       Object.values(data).some((val) => val !== null && val !== undefined)
  //     ) {
  //       localStorage.setItem("daily-tasks", JSON.stringify(data));
  //     }
  //   }, [data]),
  // );

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

        <BreakState data={todos} />
        <div id="container-task">
          <KanbanBoardTasks
            data={data}
            tasks={todos}
            date={date_key}
            active_task={active_task}
            all_session={all_session}
            streak_data={streak_data}
          />
        </div>

        <Unload data={data} date={date_key} active_task={active_task} />
        {/*<Debug data={todos} />*/}
      </div>
    </div>
  );
};

const BreakState = () => {
  return (
    <div
      id="container-break-time"
      style={{ display: "none" }}
      className="flex mx-auto w-full flex-col items-center justify-center rounded py-20 text-center text-xl "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={50}
        height={50}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-coffee text-gray-600"
      >
        <path d="M10 2v2" />
        <path d="M14 2v2" />
        <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
        <path d="M6 2v2" />
      </svg>
      Nikmati istirahatmu! Lupakan sejenak tasks yang ada, relax!
      <div className="mt-2 text-base">Kamu sedang break untuk 5 menit.</div>
    </div>
  );
};

const exportTodos = (todos) => {
  // Mengonversi data todos ke format JSON
  const jsonData = JSON.stringify(todos);

  // Membuat Blob untuk file JSON
  const blob = new Blob([jsonData], { type: "application/json" });

  // Membuat URL untuk Blob
  const url = URL.createObjectURL(blob);

  // Membuat elemen <a> untuk mendownload file
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos.json"; // Nama file yang akan diunduh
  a.click(); // Men-trigger klik untuk mendownload

  // Membersihkan URL objek
  URL.revokeObjectURL(url);
};

// Fungsi untuk memvalidasi format data
const validateTodoData = (todosData) => {
  // Memeriksa apakah data sesuai dengan format yang diinginkan
  if (typeof todosData !== "object") return false;

  // Iterasi setiap tanggal menggunakan for...of
  for (const date of Object.keys(todosData)) {
    const tasks = todosData[date];

    // Memeriksa apakah setiap tanggal memiliki array
    if (!Array.isArray(tasks)) return false;

    // Iterasi setiap task di dalam array
    for (const task of tasks) {
      // Memeriksa apakah task memiliki struktur yang benar
      if (!task.id || !task.created_at) {
        return false; // Jika ada field yang tidak ada, data tidak valid
      }
    }
  }
  return true;
};

const mergeSubTasks = (existingSubTasks, newSubTasks) => {
  // Gabungkan sub_tasks yang ada, dan hindari duplikat berdasarkan ID
  const mergedSubTasks = [...existingSubTasks];

  for (const newSubTask of newSubTasks) {
    // Memeriksa apakah sub_task dengan id yang sama sudah ada
    const exists = mergedSubTasks.some(
      (subTask) => subTask.id === newSubTask.id,
    );

    if (!exists) {
      mergedSubTasks.push(newSubTask); // Jika tidak ada, tambahkan sub_task baru
    }
  }

  return mergedSubTasks;
};
// Fungsi untuk menggabungkan tugas berdasarkan tanggal
const mergeTasksByDate = (todosData, oldData = {}) => {
  const mergedData = { ...oldData };

  // Iterasi setiap tanggal dari todosData
  for (const date of Object.keys(todosData)) {
    const tasks = todosData[date];

    // Memastikan bahwa tanggal dan tasks ada
    if (!Array.isArray(tasks) || tasks.length === 0) {
      continue; // Jika tidak ada tasks pada tanggal ini, lanjutkan ke tanggal berikutnya
    }

    // Jika tanggal ini belum ada di mergedData, buat array untuk menyimpan tugasnya
    if (!mergedData[date]) {
      mergedData[date] = [];
    }

    // Iterasi setiap task pada tanggal tertentu
    for (const newTask of tasks) {
      if (!newTask.id || !newTask.created_at) {
        continue; // Jika task tidak memiliki id atau title, lanjutkan ke task berikutnya
      }

      // Memeriksa apakah task dengan ID yang sama sudah ada pada tanggal ini
      const existingTaskIndex = mergedData[date].findIndex(
        (task) => task.id === newTask.id,
      );

      if (existingTaskIndex === -1) {
        // Jika task dengan ID tersebut belum ada, tambahkan task baru
        mergedData[date].push(newTask);
      } else {
        // Jika sudah ada task dengan ID yang sama, gabungkan data
        const existingTask = mergedData[date][existingTaskIndex];
        mergedData[date][existingTaskIndex] = {
          ...existingTask,
          ...newTask,
          // Gabungkan sub_tasks tanpa duplikat
          sub_tasks: mergeSubTasks(existingTask.sub_tasks, newTask.sub_tasks),
        };
      }
    }
  }

  return mergedData;
};

// Fungsi untuk mengimpor data
const importTodos = (event, data) => {
  const file = event.target.files[0]; // Ambil file yang dipilih

  if (file && file.type === "application/json") {
    const reader = new FileReader();

    reader.onload = (e) => {
      const jsonData = e.target.result;
      try {
        const todosData = JSON.parse(jsonData);

        // Validasi data
        if (!validateTodoData(todosData)) {
          alert("Invalid data format.");
          return;
        }

        store.dispatch(setTasks({}));
        // Gabungkan tugas dengan tanggal yang sama
        const mergedTodos = mergeTasksByDate(todosData, data);

        store.dispatch(setTasks(mergedTodos));
        alert("Data imported successfully.");
      } catch (error) {
        console.warn("DEBUGPRINT[5]: index.tsx:438: error=", error);
        alert("Error reading JSON file.");
      }
    };

    reader.readAsText(file);
  } else {
    alert("Please upload a valid JSON file.");
  }
};

const TaskFirst = () => {
  const todos = useAppSelector((state) => state.tasks.tasks);

  React.useEffect(() => {
    load_data_daily_tasks();
    askNotificationPermission();
  }, []);

  if (!initial_data) {
    return (
      <div className="mx-auto max-w-3xl w-full h-[100vh] border-x p-2.5 sm:p-4">
        {/*<Debug data={todos} />*/}
        <TodoNavigator data={todos} />
      </div>
    );
  }
};

import { useBeforeUnload } from "react-router-dom";

const Unload = ({ data }) => {
  useBeforeUnload(
    React.useCallback(() => {
      localStorage.setItem("daily-tasks", JSON.stringify(data));
    }, [data]),
  );

  return null;
};

// Fungsi untuk menghitung ukuran yang digunakan di localStorage
const getLocalStorageSize = () => {
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    totalSize += key.length + value!.length; // Menghitung ukuran key dan value dalam byte
  }
  return totalSize; // Mengembalikan dalam byte
};

// Mengonversi ukuran dalam byte ke format yang lebih mudah dibaca (KB)
const formatSize = (sizeInBytes: number) => {
  return (sizeInBytes / 1024).toFixed(2) + " KB"; // Mengonversi byte ke KB
};

const LocalStorageProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  // Maksimum kapasitas localStorage (5MB)
  const MAX_LOCAL_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB dalam byte

  // Hitung persentase penggunaan ruang setiap kali komponen dimuat
  useEffect(() => {
    const localStorageSize = getLocalStorageSize();
    const usagePercentage = (localStorageSize / MAX_LOCAL_STORAGE_SIZE) * 100;
    setProgress(usagePercentage);
  }, []); // Hanya dijalankan sekali saat komponen dimount

  return (
    <div className="col-span-2 pb-1">
      <Label>Local Storage</Label>
      <div className="mt-2">
        <div className="relative h-6 w-full rounded-md bg-muted">
          <div
            className={cn(
              "relative h-6 w-full rounded-md ",
              progress >= 90 ? "bg-destructive" : "bg-chart-2",
            )}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
        <div className="flex gap-2 items-center justify-between mt-1">
          <Label>{formatSize(getLocalStorageSize())} / 5MB</Label>
          <Label>{progress.toFixed(2)}% terpakai</Label>
        </div>
      </div>
    </div>
  );
};

export default TaskFirst;

function get_formatted_date(timestamp?: number | null) {
  const currentDate = timestamp ? new Date(timestamp) : new Date();
  currentDate.setHours(0, 1, 0, 0);

  return {
    key: format(currentDate, "yyyy-MM-dd"),
    q: format(currentDate, "EEEE, dd MMM yyyy"),
    timestamp: currentDate.getTime(),
    is_today: isToday(currentDate),
    is_yesterday: isYesterday(currentDate),
    is_tomorrow: isTomorrow(currentDate),
  };
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
import { useTheme } from "@/components/custom/theme-provider.tsx";

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
        <Button variant="ghost" className="px-2">
          <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
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

  const sessionDuration = 25 * 60 * 1000; // 25 menit
  // Fungsi untuk menghitung total sesi dari seluruh todos
  const calculateTotalSessions = (todos: Array<{ sessions: Array<any> }>) => {
    return todos.reduce(
      (total_sessions, todo) =>
        total_sessions +
          todo.sessions.filter((d) => d + sessionDuration < Date.now())
            .length || 0,
      0,
    );
  };

  const total_sessions = calculateTotalSessions(todos);
  const calculateTotalTime = (
    todos: Array<{ sessions: Array<number>; completed_at?: number }>,
  ) => {
    // Durasi sesi normal (misalnya 25 menit) dalam milidetik
    const sessionDuration = 25 * 60 * 1000; // 25 menit

    return todos.reduce((total_elapsed_time, todo) => {
      const sessionTime = todo.sessions.reduce(
        (sessionTotal, session, index, sessions) => {
          // Pastikan session time lebih besar dari Date.now()
          if (session + sessionDuration < Date.now()) {
            // Menjumlahkan durasi sesi biasa (25 menit) ke sessionTotal
            sessionTotal += sessionDuration;

            // Jika ini adalah sesi terakhir dan ada completed_at
            if (index === sessions.length - 1 && todo.completed_at) {
              const lastSessionTime = sessions[index];
              const timeDifference = todo.completed_at - lastSessionTime;

              // Jika jarak antara completed_at dan waktu sesi terakhir kurang dari durasi normal (25 menit),
              // kurangi durasi sesi terakhir
              if (timeDifference > 0 && timeDifference < sessionDuration) {
                sessionTotal -= sessionDuration - timeDifference; // Kurangi sisa waktu dari sesi terakhir
              }
            }
          }

          return sessionTotal;
        },
        0,
      );

      // Tambahkan sessionTime ke total_elapsed_time untuk semua task
      return total_elapsed_time + sessionTime;
    }, 0);
  };

  // Menghitung total waktu dari semua todo
  const total_elapsed_time = calculateTotalTime(todos);

  return (
    <div className="">
      {/*<RenderTracker name="TASK APP" stateName={totalTargetSessions} />*/}
      <section className="relative mx-auto flex items-center justify-between w-full items-center mb-4">
        <Popover>
          <PopoverTrigger className="rounded-lg lg p-1 border">
            <FocusDisplay total_sessions={total_sessions} isBtn={true} />
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <CalendarMonth total_sessions={all_session} />
          </PopoverContent>
        </Popover>
        <div className="flex-none flex items-center gap-2">
          <Link
            to="./garden"
            className={cn(
              buttonVariants({ size: "icon", variant: "secondary" }),
            )}
          >
            <Trees />
          </Link>

          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ size: "icon", variant: "secondary" }),
              )}
            >
              <BadgeIcon />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-1 rounded-lg">
              <WeeklyBadge total_sessions={total_sessions} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ size: "icon", variant: "secondary" }),
              )}
            >
              <Activity />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0 rounded-lg">
              <List03 tasks={todos} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ size: "icon", variant: "secondary" }),
                "relative",
              )}
            >
              <Flame />
              <Badge className="absolute px-1.5 -top-2 -right-2">
                {streak_data?.current_streak}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <CalendarWeek
                total_sessions={all_session}
                streak_data={streak_data}
              />
            </PopoverContent>
          </Popover>
        </div>
      </section>

      <TodoTimer todos={todos} date={date} active_task={active_task} />

      <div>
        <div
          style={{ animationDelay: `0.1s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] flex flex-col items-end"
        >
          <div className="flex items-center gap-x-1 text-sm">{date.q}</div>
        </div>
        <div
          style={{ animationDelay: `0.1s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] ml-auto flex w-full items-center  bg-gradient-to-r from-background to-accent py-2 pr-2 mt-1 mb-2 rounded-md"
        >
          <div className="mb-1 mt-3 flex justify-end">
            <div className="text-xs md:text-sm ml-3">
              Total focus time:{" "}
              <strong>{formatFocusTime(total_elapsed_time)}</strong>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button onClick={goToPreviousDate} variant="outline" size="icon">
              <ChevronLeft />
            </Button>
            <Button onClick={goToNextDate} variant="outline" size="icon">
              <ChevronRight />
            </Button>
          </div>
        </div>

        <ProgressBarIndicator
          totalTargetSessions={totalTargetSessions}
          total_sessions={total_sessions}
          active_task={active_task}
        />
      </div>
    </div>
  );
};
const ProgressBarIndicator = ({
  totalTargetSessions,
  total_sessions,
  active_task,
}: { totalTargetSessions: number; total_sessions: number }) => {
  return (
    <React.Fragment>
      <div
        style={{ animationDelay: `0.1s` }}
        className="animate-roll-reveal [animation-fill-mode:backwards] mb-3 text-sm rounded-md transition-all duration-500 ease-in-out"
      >
        <div className="relative h-8 w-full rounded-md bg-muted">
          <div className="flex h-8 items-center justify-end gap-1 px-2">
            Max 16
            <Rocket className="h-5 w-5" />
          </div>
          <div
            className={cn(
              "absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden rounded-l-md backdrop-blur-md bg-primary/20 px-2 transition-all duration-500 ease-in-out",
              totalTargetSessions >= 16 && "rounded-md",
            )}
            style={{
              width: `${(totalTargetSessions > 16 ? 16 / 16 : totalTargetSessions / 16) * 100}%`,
            }}
          >
            {totalTargetSessions}
            <Crosshair className="h-5 w-5" />
          </div>
          <div
            className={cn(
              "z-10 absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden bg-chart-2 text-primary-foreground px-2 rounded-l-md transition-all duration-500 ease-in-out",
              totalTargetSessions >= 16 && "rounded-md",
            )}
            style={{
              width: `${(total_sessions > 16 ? 16 / 16 : total_sessions / 16) * 100}%`,
            }}
          >
            <div
              className="flex shrink-0 items-center gap-1 text-sm font-medium"
              style={{ opacity: 1 }}
            >
              {totalTargetSessions >= 16 ? (
                <CircleCheckBig className="ml-2 h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
              {total_sessions} sesi
              <ArrowRight
                className={cn(
                  "h-5 w-5 ",
                  active_task && "ml-2 bounce-left-right",
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const AddTodo = ({ date }) => {
  const dispatch = useAppDispatch();
  return (
    <Button
      onClick={() => dispatch(addTask({ key: date.timestamp }))}
      variant="link"
    >
      <Plus /> Add Task
    </Button>
  );
};

const TWENTY_FIVE_MINUTES = 25 * 60 * 1000; // 25 menit dalam milidetik
// const TWENTY_FIVE_MINUTES = 10.5 * 60 * 1000; // 25 menit dalam milidetik
const radius = 40; // Radius lingkaran
const circumference = 2 * Math.PI * radius; // Keliling lingkaran

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
  date,
  todos,
  active_task,
}: { todos: Task[]; date: any; active_task: Task }) => {
  const dispatch = useAppDispatch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeTaskRef = useRef(null);
  const FIVE_MINUTES = 5 * 60 * 1000; // 25 menit dalam milidetik
  const [break_time, set_break_time] = useState(null);
  let progress = 0;

  if (activeTaskRef.current) {
    const filter = todos.find((d) => d.id === activeTaskRef.current?.id);
    if ((filter && filter.status === "completed") || !filter) {
      const circleElement = document.getElementById("progress-circle");
      if (circleElement) {
        circleElement.setAttribute("stroke-dashoffset", "0");
      }

      const timerFields = document.querySelectorAll(".todo-progress");
      for (const timerField of timerFields) {
        if (timerField instanceof HTMLDivElement) {
          timerField.innerHTML = "00:00";
        }
      }
      activeTaskRef.current = null;
    }
  }

  useEffect(() => {
    const task = active_task;
    const sessions_length = task?.sessions?.length > 0;
    if (active_task && sessions_length) {
      const last_start = sessions_length
        ? task.sessions[task.sessions.length - 1]
        : null;

      if (!timerRef.current && last_start) {
        timerRef.current = setInterval(() => {
          const lastStartDate = new Date(last_start);

          // Dapatkan waktu sekarang dalam milidetik
          const currentTime = Date.now();

          // Hitung selisih waktu (total waktu yang telah berlalu dalam milidetik)
          const updatedTotalTime = currentTime - lastStartDate.getTime();

          progress = Math.min(
            (updatedTotalTime / TWENTY_FIVE_MINUTES) * circumference,
            circumference,
          );

          const timer = new Date(updatedTotalTime).toISOString().substr(14, 5);

          // Update DOM manually
          const circleElement = document.getElementById("progress-circle");
          if (circleElement) {
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

          if (updatedTotalTime >= TWENTY_FIVE_MINUTES) {
            activeTaskRef.current = active_task;
            clearInterval(timerRef.current);

            const notif = {
              title: "Saatnya istirahat",
              description:
                "Sesion " +
                (active_task.sessions.length + 1) +
                " has completed",
            };
            showNotification(notif.title, notif.description);

            dispatch(
              updateTask({
                id: active_task.id,
                key: date.timestamp,
                updated_task: {
                  status: "pending",
                },
              }),
            );
          }
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        document.title = "Todo";
      }
    }

    if (break_time) {
      const container_task = document.getElementById("container-task");
      const container_break_time = document.getElementById(
        "container-break-time",
      );
      timerRef.current = setInterval(() => {
        const updatedTotalTime = Date.now() - break_time;

        progress = Math.min(
          (updatedTotalTime / FIVE_MINUTES) * circumference,
          circumference,
        );

        const timer = new Date(updatedTotalTime).toISOString().substr(14, 5);

        // Update DOM manually

        if (
          container_task instanceof HTMLDivElement &&
          container_task instanceof HTMLDivElement
        ) {
          container_break_time.style.display = "flex";
          container_task.style.display = "none";
        }
        const circleElement = document.getElementById("progress-circle");
        if (circleElement) {
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

        document.title = `${timer} Break`;

        if (updatedTotalTime >= FIVE_MINUTES) {
          clearInterval(timerRef.current);
          set_break_time(null);

          if (
            container_task instanceof HTMLDivElement &&
            container_task instanceof HTMLDivElement
          ) {
            container_break_time.style.display = "none";
            container_task.style.display = "block";
          }
          const notif = {
            title: "Istirahat Selesai",
            description: "Saatnya lanjut",
          };
          showNotification(notif.title, notif.description);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        document.title = "Todo";
      }
    };
  }, [break_time, active_task]); // Make sure the effect reruns when active_task changes

  return (
    <div className="flex items-start justify-between gap-x-3 px-4 md:gap-x-5 h-[110px]">
      <div className="flex items-start gap-6 md:gap-8">
        <div
          style={{ animationDelay: `0.05s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] w-[90px] rounded-full bg-secondary/50 dark:bg-muted"
        >
          <div className="relative">
            <div className="absolute flex h-full w-full justify-center">
              <div className="flex flex-col justify-center items-center">
                {break_time ? (
                  <Coffee className="text-chart-1" />
                ) : (
                  (active_task || activeTaskRef.current) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`[&_svg]:size-6 transition-all duration-500 ease-in-out animate-roll-reveal [animation-fill-mode:backwards] z-10 mx-auto p-0 rounded-full`}
                      onClick={
                        active_task
                          ? () => {
                              const last_session_index =
                                active_task?.sessions?.length - 1;
                              const last_session =
                                active_task?.sessions[last_session_index];

                              dispatch(
                                updateSessionTask({
                                  id: active_task.id,
                                  key: date.timestamp,
                                  updated_session_task: {
                                    id: last_session,
                                  },
                                }),
                              );

                              const circleElement =
                                document.getElementById("progress-circle");
                              if (circleElement) {
                                circleElement.setAttribute(
                                  "stroke-dashoffset",
                                  "0",
                                );
                              }

                              const timerFields =
                                document.querySelectorAll(".todo-progress");
                              for (const timerField of timerFields) {
                                if (timerField instanceof HTMLDivElement) {
                                  timerField.innerHTML = "00:00";
                                }
                              }
                              activeTaskRef.current = null;
                            }
                          : () => {
                              dispatch(
                                updateSessionTask({
                                  id: activeTaskRef.current?.id,
                                  key: date.timestamp,
                                  updated_session_task: {
                                    id: new Date().toISOString(),
                                  },
                                }),
                              );
                            }
                      }
                      style={{ animationDelay: `0.1s` }}
                    >
                      {active_task ? (
                        <Pause
                          style={{ animationDelay: `0.3s` }}
                          className={cn(
                            active_task &&
                              "animate-roll-reveal [animation-fill-mode:backwards]",
                          )}
                        />
                      ) : (
                        activeTaskRef.current && (
                          <Play
                            className={cn(
                              !activeTaskRef.current &&
                                "animate-slide-top [animation-fill-mode:backwards]",
                            )}
                          />
                        )
                      )}
                    </Button>
                  )
                )}
                <div
                  style={{ animationDelay: `0.1s` }}
                  className="animate-roll-reveal [animation-fill-mode:backwards] todo-progress mx-auto flex justify-center font-medium transition-all duration-500 ease-in-out"
                >
                  00:00
                </div>
              </div>
            </div>
            <div
              style={{ animationDelay: `0.1s` }}
              className={cn(
                "animate-roll-reveal [animation-fill-mode:backwards] text-chart-2",
                break_time ? "text-chart-1" : "text-chart-2",
              )}
            >
              <svg
                width={90}
                height={90}
                xmlns="http://www.w3.org/2000/svg"
                className="-rotate-90"
              >
                {/* Background Circle */}
                <circle
                  cx={45}
                  cy={45}
                  r={40}
                  fill="none"
                  className="stroke-secondary dark:stroke-background"
                  strokeWidth={6}
                  strokeDasharray="251.32741228718345"
                />

                {/* Progress Circle */}
                <circle
                  id="progress-circle"
                  cx={45}
                  cy={45}
                  r={40}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={6}
                  strokeDasharray="251.32741228718345"
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
            <div className="font-bold md:text-xl line-clamp-1 max-w-[250px]">
              {active_task?.title !== "" ? (
                <div dangerouslySetInnerHTML={{ __html: active_task.title }} />
              ) : (
                "Untitled"
              )}
            </div>

            <div className="h-2.5">
              <div className="absolute flex gap-1">
                {new Array(16).fill(null).map((_, index) => {
                  const active = active_task?.sessions?.length - 1;

                  return (
                    <div className="relative inline-flex gap-1" key={index}>
                      <div
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 cursor-pointer rounded-full ",
                          active >= index
                            ? "bg-chart-2"
                            : active_task?.target_sessions >= index
                              ? "bg-primary/30"
                              : active_task.status === "progress" &&
                                  active_task === index
                                ? "bg-chart-1"
                                : "bg-muted hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                        )}
                      />
                      {active === index && (
                        <React.Fragment>
                          <div className="w-3 h-3 bg-chart-1 rounded-full absolute -top-0.5 left-0 animate-ping" />
                          <div className="w-2.5 h-2.5 bg-chart-1 rounded-full absolute top-0 left-0 animate-pulse" />
                        </React.Fragment>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-1 text-sm">
              {active_task?.sessions?.length} dari{" "}
              {active_task?.target_sessions} target sesi
            </div>
            <div className="mt-2 flex w-full flex-col gap-2 pr-14 md:flex-row md:items-center md:pr-0">
              <Button
                className="bg-chart-2 hover:bg-chart-2/90"
                onClick={() => {
                  const todo = active_task as Task;
                  const sessionData = todo.sessions ? [...todo.sessions] : []; // Copy the old sessions array, or start with an empty array

                  const notif = {
                    title: "Saatnya istirahat",
                    description:
                      "Sesion " + (sessionData.length + 1) + " has completed",
                  };
                  showNotification(notif.title, notif.description);

                  dispatch(
                    updateTask({
                      id: active_task.id,
                      key: date.timestamp,
                      updated_task: {
                        title: active_task.title,
                        status: "completed",
                        completed_at: new Date().toISOString(),
                      },
                    }),
                  );
                }}
              >
                <CircleCheckBig />
                Mark as Done
              </Button>
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
          </div>
        )}
        {!break_time && activeTaskRef.current && !active_task && (
          <div
            style={{ animationDelay: `0.05s` }}
            className="animate-roll-reveal [animation-fill-mode:backwards] relative w-full"
          >
            <div className="font-bold md:text-xl line-clamp-1 max-w-[250px]">
              {activeTaskRef.current?.title !== "" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: activeTaskRef.current.title,
                  }}
                />
              ) : (
                "Untitled"
              )}
            </div>

            <div className="h-2.5">
              <div className="absolute flex gap-1">
                {new Array(16).fill(null).map((_, index) => {
                  const active = activeTaskRef.current?.sessions?.length;

                  return (
                    <div className="relative inline-flex gap-1" key={index}>
                      <div
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 cursor-pointer rounded-full ",
                          active >= index + 1
                            ? "bg-chart-2"
                            : activeTaskRef.current?.target_sessions >=
                                index + 1
                              ? "bg-primary/30"
                              : activeTaskRef.current.status === "progress" &&
                                  activeTaskRef.current === index
                                ? "bg-chart-1"
                                : "bg-muted hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-1 text-sm">
              {activeTaskRef.current?.sessions?.length} dari{" "}
              {activeTaskRef.current?.target_sessions} target sesi
            </div>
            <div className="mt-2 flex w-full flex-col gap-2 pr-14 md:flex-row md:items-center md:pr-0">
              <Button
                className="bg-chart-2 hover:bg-chart-2/90"
                onClick={() => {
                  const todo = activeTaskRef.current as Task;
                  const sessionData = todo.sessions ? [...todo.sessions] : []; // Copy the old sessions array, or start with an empty array

                  const notif = {
                    title: "Saatnya istirahat",
                    description:
                      "Sesion " + (sessionData.length + 1) + " has completed",
                  };
                  showNotification(notif.title, notif.description);
                  dispatch(
                    updateTask({
                      id: activeTaskRef.current.id,
                      key: date.timestamp,
                      updated_task: {
                        title: activeTaskRef.current.title,
                        status: "completed",
                        completed_at: new Date().toISOString(),
                      },
                    }),
                  );
                }}
              >
                <CircleCheckBig />
                Mark as Done
              </Button>
              <Button
                onClick={() => set_break_time(Date.now())}
                variant="destructive"
              >
                <Coffee /> 5 mins
              </Button>
            </div>
          </div>
        )}
        {break_time && (
          <div
            style={{ animationDelay: `0.05s` }}
            className="animate-roll-reveal [animation-fill-mode:backwards] relative w-full"
          >
            <div className="font-bold md:text-xl line-clamp-1 max-w-[250px]">
              Nikmati istirahatmu!
            </div>

            <div className="mt-1 text-sm">
              Lupakan sejenak tasks yang ada, relax!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isYesterday,
  isTomorrow,
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
  }, []);

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
    <Button
      variant="destructive"
      size="sm"
      className="px-2 relative flex cursor-default select-none items-center justify-start gap-2 rounded-sm text-sm outline-none transition-colors w-full"
      onClick={async () => {
        const prompt = await confirm({
          title: "Are you absolutely sure?",
          body: "This action cannot be undone. This will permanently delete your task",
          cancelButton: "Cancel",
          actionButton: "Delete",
        });
        if (prompt) {
          // if (sub_task_id) {
          //   dispatch(
          //     deleteSubTask({
          //       id: task_id,
          //       key: timestamp,
          //       sub_task_id,
          //       title: task_title,
          //       sub_task_title,
          //     }),
          //   );
          // } else {
          //   dispatch(
          //     deleteTask({ id: task_id, key: timestamp, title: task_title }),
          //   );
          // }
        }
      }}
    >
      <Trash2 />
      {/*Delete {sub_task_id ? "Subtask" : "Task"}*/}
      Delete {sub_task_id ? "Subtask" : "Task"}
    </Button>
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
      className="relative h-full p-6
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
  Clock,
  Flag,
  MoreHorizontal,
  // CheckCircle2,
  // Circle,
  // Plus,
} from "lucide-react";

function List03({ tasks }) {
  const flattenedSubTasks = tasks.flatMap((task) => task.sub_tasks);
  const subtask_checked = flattenedSubTasks.filter((d) => d.checked).length;
  const date = new Date(); // Mendapatkan tanggal sekarang
  const formattedDate = format(date, "MMMM dd, yyyy"); // Format menjadi "June 12, 2024"
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
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {subtask_checked}/{flattenedSubTasks.length} done
          </span>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {flattenedSubTasks
          .filter((d) => d.checked)
          .map((d) => (
            <div key={d.id} className="p-3 flex items-center gap-3 group">
              <button type="button" className="flex-none">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
                  {d.title !== "" ? d.title : "Untitled"}
                </p>
              </div>
            </div>
          ))}
        {flattenedSubTasks
          .filter((d) => !d.checked)
          .map((d) => (
            <div key={d.id} className="p-3 flex items-center gap-3 group">
              <button type="button" className="flex-none">
                <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    {d.title !== "" ? d.title : "Untitled"}
                  </p>
                  {/*<Flag className="w-3.5 h-3.5 text-rose-500" />*/}
                </div>
                {/*<div className="flex items-center gap-0.5 mt-1">
                  <Squircle
                    className="w-4 h-4"
                    fill={d.category.color}
                    color={d.category.color}
                  />
                  <Label className="text-xs">{d.category.label}</Label>
                </div>*/}
              </div>
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

function StatusDot({ color }: { color?: string }) {
  if (color) return <Squircle fill={color} color={color} />;
  return <Squircle className="fill-primary text-primary" />;
}

function SelectFilter({ data, date, setValue, tasks }) {
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
  // Menggabungkan colorCount dengan taskCategories

  const colorCount = tasks.reduce((acc, task) => {
    const color = task.category?.color;
    if (color) {
      acc[color] = (acc[color] || 0) + 1; // Menambahkan count untuk warna yang sama
    }
    return acc;
  }, {});
  const mergedCategories = taskCategories
    .map((category) => {
      const count = colorCount[category.color]; // Ambil count berdasarkan warna
      if (count) {
        return { ...category, count }; // Menambahkan count ke kategori jika ada
      }
      return null; // Jika count 0, kembalikan null
    })
    .filter(Boolean); // Menghapus semua kategori yang bernilai null (yang tidak memiliki count)

  return (
    <div className="flex items-center w-full justify-between mb-2">
      {(date.is_today || date.is_tomorrow) && <AddTodo date={date} />}
      <div className="flex items-center gap-x-2">
        <Popover>
          <PopoverTrigger>
            <Info className="w-4 h-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid gap-2">
              <label
                htmlFor="upload-file"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <Upload /> Import
                <input
                  id="upload-file"
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={(e) => importTodos(e, data)}
                />
              </label>

              <Button variant="outline" onClick={() => exportTodos(data)}>
                <Download /> Export
              </Button>

              <LocalStorageProgressBar />
            </div>
          </PopoverContent>
        </Popover>

        <ComboboxPopoverFilter data={mergedCategories} handler={setValue} />
      </div>
    </div>
  );
}

import {
  DndContext,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { debounce } from "lodash";
function KanbanBoardTasks({ data, tasks: _tasks, date, active_task }) {
  const [tasks, setTasks] = useState<Task[]>(_tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(_tasks);
  }, [_tasks]); // Dependency on _tasks, so it will update whenever _tasks changes

  const dispatch = useAppDispatch();

  // Debounced function to dispatch the action after a delay
  const debounceOnChange = debounce(() => {
    dispatch(updateTasksColumn({ key: date.timestamp, updated_task: tasks }));
  }, 3000); // Set delay to 3 seconds

  useEffect(() => {
    if (JSON.stringify(_tasks) !== JSON.stringify(tasks)) {
      debounceOnChange(); // Call the debounced function whenever tasks change
    }
    // Cleanup the debounce function when the component is unmounted or before next render
    return () => {
      debounceOnChange.cancel();
    };
  }, [tasks]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const [value, setValue] = useState("all");
  const filteredTasks =
    value !== "all"
      ? tasks
          .filter((task) => {
            // Memfilter tasks yang memiliki kategori utama yang cocok
            const taskMatches = task.category?.color === value;

            // Memfilter sub_tasks yang memiliki kategori yang cocok
            const filteredSubTasks = task.sub_tasks.filter(
              (subTask) => subTask.category?.color === value,
            );

            // Jika task memiliki kategori utama yang cocok, dan ada sub_task yang cocok, kembalikan task
            // return taskMatches && filteredSubTasks.length > 0;
            return taskMatches;
          })
          .map((task) => ({
            ...task,
            sub_tasks: task.sub_tasks.filter(
              (subTask) => subTask.category?.color === value,
            ), // Filter sub_tasks setelah task terpilih
          }))
      : tasks;

  return (
    <React.Fragment>
      {filteredTasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <BoardColumnTask
            tasks={filteredTasks}
            date={date}
            active_task={active_task}
          />

          {"document" in window &&
            createPortal(
              <DragOverlay>
                {activeTask && (
                  <MainTaskCard
                    task={activeTask}
                    date={date}
                    index={0}
                    active_task={active_task}
                    isOverlay
                  />
                )}
              </DragOverlay>,
              document.body,
            )}
        </DndContext>
      ) : (
        <div className="">
          <p className="text-center text-muted-foreground leading-relaxed flex gap-x-2 items-center justify-center">
            {value !== "all" && (
              <span className="flex gap-x-2">
                <StatusDot color={value} />
              </span>
            )}{" "}
            No {date.is_tomorrow && " planing "} task in {date.q}
          </p>
        </div>
      )}
      <SelectFilter
        data={data}
        date={date}
        value={value}
        setValue={setValue}
        tasks={tasks}
      />
    </React.Fragment>
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
    const { active, over } = event;
    setActiveTask(null);
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
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (activeIndex === -1 || overIndex === -1) return tasks; // Handle case when activeId or overId not found

        const updatedTasks = [...tasks]; // Create a shallow copy of tasks

        const activeTask = updatedTasks[activeIndex];
        const overTask = updatedTasks[overIndex];

        if (
          activeTask &&
          overTask &&
          activeTask.columnId !== overTask.columnId
        ) {
          updatedTasks[activeIndex] = {
            ...activeTask,
            columnId: overTask.columnId,
          }; // Update columnId of active task
          return arrayMove(updatedTasks, activeIndex, overIndex - 1);
        }

        return arrayMove(updatedTasks, activeIndex, overIndex);
      });
    }
  }
}

function KanbanSubTasks({ sub_tasks, task, date, active_task }) {
  const dispatch = useAppDispatch();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const [subtasks, setSubtasks] = useState<Task[]>(sub_tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setSubtasks(sub_tasks);
  }, [sub_tasks]); // Dependency on _tasks, so it will update whenever _tasks changes

  // Debounced function to dispatch the action after a delay
  const debounceOnChange = debounce(() => {
    dispatch(
      updateSubTasksColumn({
        id: task.id,
        key: date.timestamp,
        updated_sub_task: subtasks,
      }),
    );
  }, 3000); // Set delay to 3 seconds

  useEffect(() => {
    debounceOnChange(); // Call the debounced function whenever tasks change
    // Cleanup the debounce function when the component is unmounted or before next render
    return () => {
      debounceOnChange.cancel();
    };
  }, [subtasks]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <BoardSubTasks
        sub_tasks={subtasks}
        date={date}
        task={task}
        active_task={active_task}
      />

      {"document" in window &&
        createPortal(
          <DragOverlay>
            {activeTask && (
              <SubTaskComponentCard
                index={0}
                date={date}
                active_task={active_task}
                subtask={activeTask}
                task={task}
                isOverlay
              />
            )}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Task") {
      setActiveTask(data.subtask);
      return;
    }
  }

  function onDragEnd(event: DragOverEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;

    const isActiveATask = activeData?.type === "Task";

    if (!isActiveATask) return;

    function setter(sub_tasks: Task[]) {
      const activeIndex = sub_tasks.findIndex((t) => t.id === activeId);
      const overIndex = sub_tasks.findIndex((t) => t.id === overId);

      return arrayMove(sub_tasks, activeIndex, overIndex);
    }
    const updatedTasks = setter(sub_tasks);
    setSubtasks(updatedTasks);

    // Im dropping a Task over another Task
  }
}

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";

interface BoardColumnTaskProps {
  tasks: Task[];
  isOverlay?: boolean;
}

function BoardColumnTask({ tasks, date, active_task }: BoardColumnTaskProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  return (
    <SortableContext items={tasksIds}>
      {tasks.map((task, index) => {
        return (
          <MainTaskCard
            key={task.id}
            date={date}
            index={index}
            active_task={active_task}
            task={task}
          />
        );
      })}
    </SortableContext>
  );
}

function BoardSubTasks({
  sub_tasks,
  date,
  task,
  active_task,
}: BoardColumnTaskProps) {
  const tasksIds = useMemo(() => {
    return sub_tasks.length > 0 && sub_tasks.map((sub_task) => sub_task.id);
  }, [sub_tasks]);

  return (
    <SortableContext items={tasksIds}>
      {sub_tasks.map((sub_task, index) => (
        <SubTaskComponentCard
          index={index}
          key={sub_task.id}
          date={date}
          active_task={active_task}
          subtask={sub_task}
          task={task}
        />
      ))}
    </SortableContext>
  );
}

interface MainTaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

const MainTaskCard = React.memo(
  ({ index, date, active_task, task }: MainTaskCardProps) => {
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
          over: "opacity-30",
          overlay: "",
        },
      },
    });

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "w-full mb-2",
          variants({
            dragging: isDragging ? "over" : undefined,
          }),
        )}
      >
        <ChildTask
          index={index}
          date={date}
          active_task={active_task}
          task={task}
        >
          <Button
            variant={"link"}
            size="icon"
            {...attributes}
            {...listeners}
            className="text-muted-foreground hover:text-primary w-auto cursor-grab h-6"
          >
            <span className="sr-only">Move task</span>
            <GripVertical />
          </Button>
        </ChildTask>
      </div>
    );
  },

  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.task) === JSON.stringify(nextProps.task) &&
      JSON.stringify(prevProps.active_task) ===
        JSON.stringify(nextProps.active_task)
    );
  },
);

const ChildTask = React.memo(
  ({ index, date, active_task, task, children }: MainTaskCardProps) => {
    const todo = task;

    const sessionDuration = 25 * 60 * 1000; // 25 menit
    const totalSessionTime = todo.sessions.reduce(
      (sessionTotal, session, index, sessions) => {
        // Pastikan session time lebih besar dari Date.now()
        if (session + sessionDuration < Date.now()) {
          // Menjumlahkan durasi sesi biasa (25 menit) ke sessionTotal
          sessionTotal += sessionDuration;

          // Jika ini adalah sesi terakhir dan ada completed_at
          if (index === sessions.length - 1 && todo.completed_at) {
            const lastSessionTime = sessions[index];
            const timeDifference = todo.completed_at - lastSessionTime;

            // Jika jarak antara completed_at dan waktu sesi terakhir kurang dari durasi normal (25 menit),
            // kurangi durasi sesi terakhir
            if (timeDifference > 0 && timeDifference < sessionDuration) {
              sessionTotal -= sessionDuration - timeDifference; // Kurangi sisa waktu dari sesi terakhir
            }
          }
        }

        return sessionTotal;
      },
      0,
    );

    const is_today = date.is_today;
    const dispatch = useAppDispatch();

    return (
      <Collapsible
        // {...(active_task ? { open: active_task.id === task.id } : {})}
        defaultOpen={active_task?.id === task?.id ? true : false}
      >
        <div
          className={cn(
            "relative flex items-start overflow-hidden mb-2 ",
            active_task && todo.status !== "progress"
              ? "text-muted-foreground bg-muted/20 blur-sm transition-all duration-300"
              : active_task && todo.status === "progress"
                ? ""
                : todo.status === "completed"
                  ? ""
                  : "",
          )}
        >
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full">
            <div
              className={cn(
                "p-6 px-3 py-1.5 space-between flex gap-4 items-center flex-row border-b-2 border-secondary relative",
                active_task && todo.status === "progress"
                  ? " bg-gradient-to-r from-accent to-muted"
                  : " bg-gradient-to-l from-background to-secondary",
                todo.status === "completed" &&
                  " bg-gradient-to-r from-background to-chart-2/40",
              )}
            >
              <div className="flex items-center gap-x-2">{children}</div>
              <div className="ml-auto flex items-center">
                {todo.sub_tasks.length > 0 && (
                  <CollapsibleTrigger asChild>
                    <Badge
                      className="flex flex-1 border-none items-center gap-1 justify-between text-sm font-medium transition-all text-left [&[data-state=close]>svg.chev]:block [&[data-state=open]>svg.cross]:block [&[data-state=open]>svg.chev]:hidden"
                      variant="outline"
                    >
                      <ChevronsUpDown className="chev h-4 w-4 shrink-0 transition-all duration-200" />
                      <X className="cross hidden h-4 w-4 shrink-0 transition-all duration-200" />
                      <span>{todo.sub_tasks.length}</span>
                    </Badge>
                  </CollapsibleTrigger>
                )}
                <Separator className="w-2" orientation="vertical" />
                <DropdownMenuTask
                  todo={todo}
                  date={date}
                  active_task={active_task}
                />
              </div>
            </div>
            <div className="p-2 relative">
              {todo.status === "completed" && (
                <CircleCheckBig className="absolute top-0 -right-4 w-28 h-28 text-chart-2 dark:text-chart-2 opacity-40" />
              )}
              <div className="flex items-start gap-1 px-1">
                {is_today ? (
                  <React.Fragment>
                    {todo.status === "completed" ? (
                      <CircleCheckBig className="w-6 h-6 text-chart-2 rounded-full" />
                    ) : todo.status === "progress" ? (
                      <button
                        onClick={() => {
                          const last_session_index =
                            active_task?.sessions?.length - 1;
                          const last_session =
                            active_task?.sessions[last_session_index];

                          dispatch(
                            updateSessionTask({
                              id: active_task.id,
                              key: date.timestamp,
                              updated_session_task: {
                                id: last_session,
                              },
                            }),
                          );

                          const circleElement =
                            document.getElementById("progress-circle");
                          if (circleElement) {
                            circleElement.setAttribute(
                              "stroke-dashoffset",
                              "0",
                            );
                          }

                          const timerFields =
                            document.querySelectorAll(".todo-progress");
                          for (const timerField of timerFields) {
                            if (timerField instanceof HTMLDivElement) {
                              timerField.innerHTML = "00:00";
                            }
                          }
                        }}
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground",
                          active_task &&
                            "animate-roll-reveal [animation-fill-mode:backwards]",
                        )}
                      >
                        <Pause className="h-5 w-5" />
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(
                              updateSessionTask({
                                id: todo.id,
                                key: date.timestamp,
                                updated_session_task: {
                                  id: new Date().toISOString(),
                                },
                              }),
                            );
                          }}
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary pl-0.5 text-primary-foreground",
                            active_task &&
                              "animate-roll-reveal [animation-fill-mode:backwards]",
                          )}
                        >
                          <Play className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </React.Fragment>
                ) : (
                  <button
                    onClick={() => {
                      dispatch(copyTask({ id: task.id, key: date.timestamp }));

                      toast({
                        title: "Added in today",
                        description: `The task has been successfully added in today.`,
                      });
                    }}
                    className="h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 "
                  >
                    <ArrowRight />
                  </button>
                )}

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
                  className="py-0.5 px-1.5 w-full bg-transparent outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
                  maxHeight={800}
                  placeholder="Untitled"
                  autoComplete="off"
                />
              </div>
              <div className="w-full group px-2">
                <div className="relative block py-0.5 ">
                  <div className="flex items-end">
                    <div className="flex items-center justify-start gap-1 h-4">
                      {new Array(16).fill(null).map((_, index) => {
                        const active = task?.sessions?.length - 1;

                        return (
                          <div
                            className="relative inline-flex gap-1"
                            key={index}
                          >
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
                              type="button"
                              style={{ animationDelay: `${index * 0.03}s` }}
                              className={cn(
                                "h-[12px] w-[12px] shrink-0 cursor-pointer rounded-full ",
                                active >= index
                                  ? "bg-chart-2"
                                  : todo?.target_sessions >= index
                                    ? "bg-primary/30"
                                    : todo.status === "progress" &&
                                        active === index
                                      ? "bg-chart-1"
                                      : "bg-muted hover:bg-primary/50 duration-300 hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                              )}
                            />

                            {todo.status === "progress" && active === index && (
                              <React.Fragment>
                                <div className="w-3 h-3 bg-chart-1 rounded-full absolute top-0 left-0 animate-ping" />
                                <div className="h-[12px] w-[12px]  bg-chart-1 rounded-full absolute top-0 left-0 animate-pulse" />
                              </React.Fragment>
                            )}
                          </div>
                        );
                      })}

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
                        className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hidden group-hover:flex  animate-roll-reveal [animation-fill-mode:backwards] "
                      >
                        <X />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-x-1.5 mt-1.5 justify-between">
                    <div className="flex items-center gap-x-1.5">
                      {task.status !== "progress" &&
                        task.sessions.length > 0 && (
                          <Popover>
                            <PopoverTrigger>
                              <History className="w-4 h-4 text-muted-foreground" />
                            </PopoverTrigger>
                            <PopoverContent className="max-h-[40vh] overflow-y-auto py-0">
                              <TimelineInfo
                                sessions={task.sessions}
                                completed_at={task.completed_at}
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      <div className="text-sm">
                        {new Date(totalSessionTime).toISOString().substr(11, 8)}
                      </div>
                    </div>
                    <ComboboxPopover task={task} date={date} />
                  </div>
                  {!is_today && (
                    <div className="flex">
                      <button
                        onClick={() => {
                          dispatch(
                            copyTask({ id: task.id, key: date.timestamp }),
                          );

                          toast({
                            title: "Added in today",
                            description: `The task has been successfully added in today.`,
                          });
                        }}
                        className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 "
                      >
                        Move to today <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {todo.sub_tasks.length > 0 && (
          <div>
            <CollapsibleContent className="space-y-2 text-text font-base mt-1">
              <KanbanSubTasks
                task={task}
                sub_tasks={todo.sub_tasks}
                date={date}
                active_task={active_task}
              />
            </CollapsibleContent>
          </div>
        )}
      </Collapsible>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.task) === JSON.stringify(nextProps.task) &&
      JSON.stringify(prevProps.active_task) ===
        JSON.stringify(nextProps.active_task)
    );
  },
);

function SubTaskComponentCard({
  index,
  subtask,
  date,
  active_task,
  task,
  isOverlay,
}: SubTaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: subtask?.id ?? 0,
    data: {
      type: "Task",
      subtask,
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
        over: "opacity-30",
        overlay: "",
      },
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full mb-2 ",
        variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        }),
      )}
    >
      <ChildSubTask
        index={index}
        date={date}
        active_task={active_task}
        subtask={subtask}
        task={task}
      >
        <Button
          variant={"link"}
          size="icon"
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-primary w-auto cursor-grab h-6"
        >
          <span className="sr-only">Move task</span>
          <GripVertical />
        </Button>
      </ChildSubTask>
    </div>
  );
}
const ChildSubTask = React.memo(
  ({ index, subtask, date, active_task, task, children }: TaskCardProps) => {
    const todo = task;
    const dispatch = useAppDispatch();

    return (
      <div
        className={cn(
          "group ml-2.5 sm:ml-5 relative flex items-start overflow-hidden p-2 mb-1.5 rounded-md border",
          active_task && todo.status !== "progress"
            ? "text-muted-foreground opacity-80"
            : active_task && todo.status === "progress"
              ? ""
              : subtask.checked
                ? ""
                : "opacity-100",
        )}
      >
        {subtask.checked && (
          <CircleCheckBig className="absolute top-0 -right-4 w-28 h-28 text-green-500 dark:text-green-400 opacity-30" />
        )}
        <div className="w-full">
          <div className="relative flex w-full items-start gap-2">
            {children}
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
                      completed_at: e.target.checked ? Date.now() : null,
                    },
                  }),
                );
              }}
              className="accent-chart-2 scale-[125%] translate-y-1"
              key={`sub_tasks[${index}].checked`}
              name={`sub_tasks[${index}].checked`}
              id={`sub_tasks[${index}].checked`}
            />
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
              className="w-full bg-transparent py-0 px-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
              maxHeight={800}
              minHeight={20}
              placeholder="Untitled"
              autoComplete="off"
            />
            <div className="ml-auto flex items-center">
              <DropdownMenuSubTask
                task_id={task.id}
                sub_task_id={subtask.id}
                task_title={todo.title}
                sub_task_title={subtask.title}
                timestamp={date.timestamp}
              />
            </div>
          </div>
          <div>
            <div className="relative ml-1 block py-0.5 md:block pr-2">
              <div className="flex items-end">
                <div className="flex items-center gap-x-1.5 ml-auto">
                  <ComboboxPopover task={task} subtask={subtask} date={date} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.subtask) === JSON.stringify(nextProps.subtask) &&
      JSON.stringify(prevProps.task) === JSON.stringify(nextProps.task) &&
      JSON.stringify(prevProps.active_task) ===
        JSON.stringify(nextProps.active_task)
    );
  },
);

import { Active, DataRef, Over, DragOverlay } from "@dnd-kit/core";
type DraggableData = TaskDragData;
function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Task") {
    return true;
  }

  return false;
}

interface Session {
  name: string;
  timeRange: { start: string; end: string }[]; // Array of start-end times
  duration: string;
}

const getSessionTimes = (session: any, index: number): Session[] => {
  const logs = session.log;
  const sessions: Session[] = [];

  // Fungsi untuk menghitung durasi dalam format HH:MM
  const formatDuration = (startTime: number, endTime: number) => {
    const durationMs = endTime - startTime;
    const totalMinutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours} hrs ${minutes} mins`;
    } else {
      return `${minutes} mins`;
    }
  };

  let timeRange: { start: string; end: string; duration: string }[] = [];
  let sessionStartTime: number | null = null;
  let sessionEndTime: number | null = null;

  // Proses setiap log untuk mendapatkan waktu mulai dan selesai
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // Jika log adalah 'start', kita akan cari log berikutnya yang pasti 'pause'
    if (log.name === "start") {
      let startTime = new Date(log.time);

      // Cek apakah ada log berikutnya dan itu adalah 'pause'
      let nextLog = logs[i + 1];
      if (nextLog && nextLog.name === "pause") {
        let pauseTime = new Date(nextLog.time);

        // Menambahkan start -> pause ke dalam timeRange yang sama
        const duration = formatDuration(log.time, nextLog.time);
        timeRange.push({
          start: `${startTime.getHours().toString().padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`,
          end: `${pauseTime.getHours().toString().padStart(2, "0")}:${pauseTime.getMinutes().toString().padStart(2, "0")}`,
          duration: duration,
        });

        // Set session start and end time
        if (sessionStartTime === null) {
          sessionStartTime = log.time;
        }
        sessionEndTime = nextLog.time;

        // Update index agar melanjutkan ke log setelah pause
        i++; // Lewati log 'pause' yang sudah diproses
      } else {
        // Set session start and end time
        if (sessionStartTime === null) {
          sessionStartTime = log.time;
        }
        sessionEndTime = log.time + session.elapsed_time;
        let endTime = new Date(log.time + session.elapsed_time);
        const duration = formatDuration(log.time, sessionEndTime);
        timeRange.push({
          start: `${startTime.getHours().toString().padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`,
          end: `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`,
          duration: duration,
        });
        i++; // Lewati log 'pause' yang sudah diproses
      }
    }
  }

  // Cek apakah kita memiliki waktu mulai dan selesai yang valid
  console.warn(
    "DEBUGPRINT[8]: index.tsx:3516: timeRange=",
    timeRange,
    index + 1,
  );
  if (sessionStartTime !== null) {
    const _sessionEndTime =
      sessionEndTime || sessionStartTime + session.elapsed_time;
    const totalDuration = formatDuration(sessionStartTime, sessionEndTime);

    // Push sesi dengan durasi total yang benar
    sessions.push({
      name: `Session ${index + 1}`,
      timeRange: timeRange,
      duration: totalDuration,
    });
  }

  return sessions;
};

const TimelineInfo: React.FC<{ sessions: any[] }> = ({
  sessions,
  completed_at,
}) => {
  // Mengambil sesi yang sudah diformat
  function adjustSessions(sessions: string[], completedAt: string): string[] {
    const intervalInMillis = 25 * 60 * 1000; // 25 minutes in milliseconds
    const formattedSessions: string[] = [];

    // Convert completedAt string to Date object
    const completedAtDate = new Date(completedAt);

    // Loop through all the sessions
    for (let i = 0; i < sessions.length; i++) {
      const startTime = new Date(sessions[i]); // Convert session start time (ISO string) to Date
      let endTime = new Date(startTime.getTime() + intervalInMillis); // Add 25 minutes to start time

      // Format start time as HH:mm
      const startStr = `${startTime.getHours().toString().padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`;

      // Format end time as HH:mm or adjust it based on completedAt
      let endStr = "";

      // For the last session, check if it should be adjusted based on completedAt
      if (i === sessions.length - 1) {
        if (endTime > completedAtDate) {
          // If the session end time is greater than completedAt, adjust it to completedAt
          endStr = `${completedAtDate.getHours().toString().padStart(2, "0")}:${completedAtDate.getMinutes().toString().padStart(2, "0")}`;
        } else {
          // Otherwise, keep the normal end time
          endStr = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;
        }
      } else {
        // For other sessions, just use the calculated end time
        endStr = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;
      }

      // Add the formatted session to the result array
      formattedSessions.push(`${startStr} - ${endStr}`);
    }

    return formattedSessions;
  }

  const adjustedSessions = adjustSessions(sessions, completed_at);

  // Example usage

  // Example usage

  return (
    <div>
      <ul
        role="list"
        className="divide-y divide-gray-200 bg-background p-2 rounded-md"
      >
        {adjustedSessions.map((sessionInfo, index) => (
          <li key={index} className="py-2">
            <div className="flex space-x-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Session {index + 1}</h3>
                  <p className="text-sm ">{sessionInfo}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

import { type DialogProps } from "@radix-ui/react-dialog";

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandShortcut,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

function CommandMenu({ ...props }: DialogProps) {
  // const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64",
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search Menu...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar className="h-4 w-4 mr-2" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile className="h-4 w-4 mr-2" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem disabled>
              <Calculator className="h-4 w-4 mr-2" />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="h-4 w-4 mr-2" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="h-4 w-4 mr-2" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

import { Switch } from "@/components/ui/switch";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

function NavbarMobile() {
  const [open, setOpen] = React.useState(false);
  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground py-2 -ml-2 mr-2 h-8 w-8 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="!size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9h16.5m-16.5 6.75h16.5"
          />
        </svg>
      </DrawerTrigger>
      <DrawerContent>
        <nav className="flex flex-col items-center gap-4 text-sm xl:gap-6 py-2">
          {navItems.map((item) => (
            <NavLink
              onClick={() => setOpen(false)}
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  isActive ? "text-primary" : "text-muted-foreground/80",
                  "text-sm font-medium transition-colors hover:text-primary",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {/*<DrawerHeader>
              <DrawerTitle>Muslim App</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>*/}
      </DrawerContent>
    </Drawer>
  );
}

const SvgIcon = (props) => (
  <React.Fragment>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1452"
      height="524"
      fill="none"
      viewBox="0 0 1452 524"
    >
      <path fill="#000" d="M0 0h1452v524H0z"></path>
      <path fill="#000" d="M128 192h96v48h-96z"></path>
      <path fill="#0b140f" d="M228 192h96v48h-96z"></path>
      <path fill="#0f291d" d="M328 192h96v48h-96z"></path>
      <path fill="#0e3926" d="M428 192h96v48h-96z"></path>
      <path fill="#144831" d="M528 192h96v48h-96z"></path>
      <path fill="#1c573d" d="M628 192h96v48h-96z"></path>
      <path fill="#23684a" d="M728 192h96v48h-96z"></path>
      <path fill="#287c58" d="M828 192h96v48h-96z"></path>
      <path fill="#1f7551" d="M928 192h96v48h-96z"></path>
      <path fill="#1f6446" d="M1028 192h96v48h-96z"></path>
      <path fill="#7bcba3" d="M1128 192h96v48h-96z"></path>
      <path fill="#adf2cd" d="M1228 192h96v48h-96z"></path>
      <path fill="#00000000" d="M128 244h96v48h-96z"></path>
      <path fill="#8dffc014" d="M228 244h96v48h-96z"></path>
      <path fill="#5effb529" d="M328 244h96v48h-96z"></path>
      <path fill="#3fffaa39" d="M428 244h96v48h-96z"></path>
      <path fill="#47ffae48" d="M528 244h96v48h-96z"></path>
      <path fill="#53ffb357" d="M628 244h96v48h-96z"></path>
      <path fill="#56ffb668" d="M728 244h96v48h-96z"></path>
      <path fill="#53ffb57c" d="M828 244h96v48h-96z"></path>
      <path fill="#44ffb175" d="M928 244h96v48h-96z"></path>
      <path fill="#50ffb364" d="M1028 244h96v48h-96z"></path>
      <path fill="#9bffcdcb" d="M1128 244h96v48h-96z"></path>
      <path fill="#b6ffd8f2" d="M1228 244h96v48h-96z"></path>
      <path fill="#000" d="M128 296h96v48h-96z"></path>
      <path fill="#121315" d="M228 296h96v48h-96z"></path>
      <path fill="#1f1f22" d="M328 296h96v48h-96z"></path>
      <path fill="#27282c" d="M428 296h96v48h-96z"></path>
      <path fill="#2f3035" d="M528 296h96v48h-96z"></path>
      <path fill="#393a3f" d="M628 296h96v48h-96z"></path>
      <path fill="#46474e" d="M728 296h96v48h-96z"></path>
      <path fill="#5e606a" d="M828 296h96v48h-96z"></path>
      <path fill="#6c6e79" d="M928 296h96v48h-96z"></path>
      <path fill="#797b86" d="M1028 296h96v48h-96z"></path>
      <path fill="#b2b3bd" d="M1128 296h96v48h-96z"></path>
      <path fill="#eeeef0" d="M1228 296h96v48h-96z"></path>
      <path fill="#00000000" d="M128 348h96v48h-96z"></path>
      <path fill="#dbe7ff15" d="M228 348h96v48h-96z"></path>
      <path fill="#e9e9ff22" d="M328 348h96v48h-96z"></path>
      <path fill="#e3e8ff2c" d="M428 348h96v48h-96z"></path>
      <path fill="#e3e7ff35" d="M528 348h96v48h-96z"></path>
      <path fill="#e7ebff3f" d="M628 348h96v48h-96z"></path>
      <path fill="#e5e9ff4e" d="M728 348h96v48h-96z"></path>
      <path fill="#e3e7ff6a" d="M828 348h96v48h-96z"></path>
      <path fill="#e4e8ff79" d="M928 348h96v48h-96z"></path>
      <path fill="#e7ebff86" d="M1028 348h96v48h-96z"></path>
      <path fill="#f0f2ffbd" d="M1128 348h96v48h-96z"></path>
      <path fill="#fdfdfff0" d="M1228 348h96v48h-96z"></path>
      <path
        fill="#b2b3bd"
        d="M1273.97 167.273V176h-1.06v-7.619h-.05l-2.13 1.414v-1.073l2.18-1.449zm2.51 8.727v-.767l2.88-3.153q.51-.555.84-.964.33-.413.48-.775c.11-.244.17-.5.17-.767 0-.307-.08-.573-.23-.797a1.4 1.4 0 0 0-.59-.52 2 2 0 0 0-.86-.183q-.495 0-.87.209c-.25.136-.44.328-.58.575-.13.247-.2.537-.2.869h-1c0-.511.11-.96.35-1.346q.36-.58.96-.904.615-.324 1.38-.324c.51 0 .96.108 1.36.324q.585.324.93.874.33.55.33 1.223c0 .321-.05.635-.17.942q-.165.456-.6 1.018-.42.558-1.17 1.364l-1.96 2.096v.068h4.06V176zM1173.97 167.273V176h-1.06v-7.619h-.05l-2.13 1.414v-1.073l2.18-1.449zm5.58 0V176h-1.06v-7.619h-.05l-2.13 1.414v-1.073l2.18-1.449zM1072.97 167.273V176h-1.06v-7.619h-.05l-2.13 1.414v-1.073l2.18-1.449zm5.36 8.846c-.64 0-1.19-.174-1.64-.524-.45-.352-.8-.862-1.04-1.53q-.36-1.005-.36-2.429 0-1.414.36-2.416c.24-.67.59-1.182 1.04-1.534.46-.355 1-.533 1.64-.533.63 0 1.18.178 1.63.533.45.352.8.864 1.04 1.534q.36 1.002.36 2.416 0 1.424-.36 2.429c-.23.668-.58 1.178-1.03 1.53-.45.35-1 .524-1.64.524m0-.937c.63 0 1.13-.307 1.48-.921.35-.613.53-1.488.53-2.625q0-1.133-.24-1.93t-.69-1.215-1.08-.417c-.63 0-1.13.311-1.48.933-.36.619-.53 1.496-.53 2.629q0 1.134.24 1.926c.15.529.38.931.68 1.206.3.276.66.414 1.09.414M975.682 167.153a3.1 3.1 0 0 1 1.074.205q.536.2.98.665.442.46.711 1.257t.269 1.998q0 1.164-.222 2.067-.218.9-.63 1.517a2.8 2.8 0 0 1-.998.938 2.7 2.7 0 0 1-1.321.319q-.732 0-1.308-.289a2.6 2.6 0 0 1-.937-.814 2.8 2.8 0 0 1-.465-1.215h1.04q.141.601.558.993.422.388 1.112.388 1.01 0 1.594-.882.588-.882.588-2.493h-.068a2.7 2.7 0 0 1-.567.618 2.5 2.5 0 0 1-.728.4 2.6 2.6 0 0 1-.853.141q-.75 0-1.376-.371a2.8 2.8 0 0 1-.997-1.027q-.37-.655-.371-1.5 0-.801.358-1.466.362-.669 1.014-1.065.657-.396 1.543-.384m0 .938q-.537 0-.968.268a1.94 1.94 0 0 0-.677.716 2 2 0 0 0-.247.993q0 .546.238.993.244.444.661.707.422.26.959.26.405 0 .754-.157a2 2 0 0 0 .609-.439q.265-.282.414-.635.149-.358.149-.746 0-.511-.247-.959a1.97 1.97 0 0 0-.674-.724 1.74 1.74 0 0 0-.971-.277M875.699 176.119q-.877 0-1.551-.311a2.54 2.54 0 0 1-1.044-.865 2.17 2.17 0 0 1-.371-1.261q-.004-.554.217-1.023.222-.473.605-.788a1.86 1.86 0 0 1 .865-.405v-.051a1.7 1.7 0 0 1-.997-.703 2.13 2.13 0 0 1-.366-1.24q-.005-.666.336-1.189.341-.525.938-.827a3 3 0 0 1 1.368-.303q.758 0 1.355.303.597.302.937.827.346.523.35 1.189a2.16 2.16 0 0 1-.379 1.24 1.7 1.7 0 0 1-.985.703v.051q.474.085.853.405.378.315.605.788.225.469.23 1.023a2.2 2.2 0 0 1-.384 1.261q-.375.55-1.044.865-.665.311-1.538.311m0-.937q.592 0 1.023-.192a1.5 1.5 0 0 0 .664-.541q.235-.35.239-.818a1.57 1.57 0 0 0-.256-.874 1.7 1.7 0 0 0-.686-.596 2.15 2.15 0 0 0-.984-.218q-.558 0-.997.218a1.7 1.7 0 0 0-.686.596 1.54 1.54 0 0 0-.243.874q-.005.468.226.818.234.35.669.541.434.192 1.031.192m0-4.142q.468 0 .831-.188.366-.187.575-.524.208-.336.213-.788a1.45 1.45 0 0 0-.209-.772 1.35 1.35 0 0 0-.566-.511 1.85 1.85 0 0 0-.844-.183q-.49 0-.857.183a1.3 1.3 0 0 0-.566.511 1.4 1.4 0 0 0-.196.772q-.005.452.2.788.209.337.575.524.366.188.844.188M774.176 176l3.904-7.722v-.068h-4.5v-.937h5.59v.988L775.284 176zM675.801 176.119a3.3 3.3 0 0 1-1.074-.204 2.6 2.6 0 0 1-.98-.661q-.443-.468-.711-1.265-.269-.801-.269-2.012 0-1.158.217-2.054.217-.899.631-1.512.414-.618.997-.938.588-.32 1.326-.32.733 0 1.303.294.576.291.938.81t.469 1.198h-1.04a1.92 1.92 0 0 0-.563-.976q-.417-.388-1.107-.388-1.015 0-1.599.882-.579.882-.583 2.476h.068q.238-.363.567-.618.332-.26.733-.401.4-.14.848-.14.75 0 1.372.375.622.37.997 1.027.375.651.375 1.496 0 .81-.362 1.482a2.76 2.76 0 0 1-1.019 1.066q-.651.392-1.534.383m0-.937q.537 0 .963-.269.43-.269.678-.72.25-.451.251-1.005 0-.541-.243-.985a1.86 1.86 0 0 0-.66-.712 1.75 1.75 0 0 0-.955-.264q-.405 0-.754.162a1.9 1.9 0 0 0-.614.435 2.1 2.1 0 0 0-.409.635 2.018 2.018 0 0 0 .767 2.446q.431.276.976.277M575.631 176.119q-.75 0-1.351-.298a2.5 2.5 0 0 1-.963-.818 2.23 2.23 0 0 1-.397-1.185h1.023q.06.593.537.98a1.8 1.8 0 0 0 1.151.384q.537 0 .954-.252a1.77 1.77 0 0 0 .661-.69q.243-.443.243-1.001a2.04 2.04 0 0 0-.252-1.019 1.84 1.84 0 0 0-.682-.711 1.9 1.9 0 0 0-.993-.265 2.7 2.7 0 0 0-.822.124 2.3 2.3 0 0 0-.695.32l-.988-.12.528-4.295h4.534v.937h-3.647l-.307 2.574h.051a2.3 2.3 0 0 1 .673-.354q.405-.14.844-.14a2.69 2.69 0 0 1 2.416 1.423q.362.66.362 1.509 0 .835-.375 1.491a2.74 2.74 0 0 1-1.022 1.031q-.652.375-1.483.375M472.699 174.21v-.869l3.835-6.068h.631v1.346h-.426l-2.898 4.586v.068h5.165v.937zm4.108 1.79v-8.727h1.005V176zM375.852 176.119q-.844 0-1.504-.289a2.6 2.6 0 0 1-1.044-.806 2.16 2.16 0 0 1-.418-1.206h1.074q.035.422.29.729.255.303.669.469t.916.166q.563 0 .997-.196.435-.197.682-.546t.247-.809q0-.482-.238-.848a1.6 1.6 0 0 0-.699-.58q-.46-.209-1.125-.209H375v-.937h.699q.519 0 .912-.188.396-.187.618-.528a1.4 1.4 0 0 0 .226-.801q0-.444-.196-.772a1.35 1.35 0 0 0-.554-.511 1.8 1.8 0 0 0-.836-.183q-.452 0-.852.166-.396.162-.648.473a1.24 1.24 0 0 0-.272.742h-1.023q.026-.686.413-1.202a2.6 2.6 0 0 1 1.014-.81q.632-.29 1.385-.29.81 0 1.39.329a2.3 2.3 0 0 1 .89.856q.312.533.311 1.151 0 .737-.388 1.257a1.97 1.97 0 0 1-1.044.72v.068q.828.136 1.292.703.464.563.464 1.394 0 .711-.388 1.278a2.6 2.6 0 0 1-1.048.886q-.664.324-1.513.324M272.903 176v-.767l2.881-3.153q.508-.555.835-.964.328-.413.486-.775.162-.366.162-.767a1.41 1.41 0 0 0-.818-1.317 1.9 1.9 0 0 0-.852-.183q-.504 0-.878.209a1.44 1.44 0 0 0-.576.575q-.2.37-.2.869h-1.005q0-.767.353-1.346.354-.58.963-.904a2.9 2.9 0 0 1 1.377-.324q.766 0 1.359.324t.929.874q.337.55.337 1.223 0 .481-.175.942-.171.456-.597 1.018-.422.558-1.172 1.364l-1.96 2.096v.068h4.057V176zM176.972 167.273V176h-1.057v-7.619h-.051l-2.131 1.414v-1.073l2.182-1.449zM1184.67 136h-1.11l3.21-8.727h1.09l3.2 8.727h-1.1l-2.61-7.347h-.07zm.41-3.409h4.47v.937h-4.47zm9.87 3.545q-.93 0-1.59-.434-.66-.435-1.02-1.198t-.36-1.743c0-.664.12-1.251.37-1.76.24-.511.59-.91 1.03-1.197.44-.29.96-.435 1.55-.435.46 0 .87.086 1.24.256s.68.409.91.716c.24.307.38.665.44 1.074h-1.01q-.105-.448-.51-.793-.39-.35-1.05-.349c-.4 0-.74.102-1.03.307q-.45.302-.69.856-.24.55-.24 1.291 0 .759.24 1.321c.16.375.38.666.68.874.29.207.64.311 1.04.311.26 0 .5-.045.71-.136q.315-.137.54-.392c.15-.171.25-.375.31-.614h1.01q-.09.579-.42 1.044a2.4 2.4 0 0 1-.88.733 2.9 2.9 0 0 1-1.27.268m6.7 0q-.915 0-1.59-.434-.66-.435-1.02-1.198t-.36-1.743c0-.664.13-1.251.37-1.76.25-.511.59-.91 1.03-1.197.44-.29.96-.435 1.55-.435.46 0 .88.086 1.25.256q.555.255.9.716c.24.307.39.665.44 1.074h-1a1.6 1.6 0 0 0-.51-.793c-.26-.233-.62-.349-1.06-.349-.39 0-.74.102-1.03.307a2.06 2.06 0 0 0-.69.856q-.24.55-.24 1.291 0 .759.24 1.321c.16.375.39.666.68.874.3.207.64.311 1.04.311.26 0 .5-.045.71-.136q.315-.137.54-.392c.15-.171.26-.375.32-.614h1q-.075.579-.42 1.044c-.22.307-.51.551-.88.733-.36.179-.79.268-1.27.268m6.79 0c-.63 0-1.18-.139-1.63-.417a2.8 2.8 0 0 1-1.06-1.176q-.36-.759-.36-1.765t.36-1.772c.25-.515.59-.915 1.03-1.202q.675-.435 1.56-.435c.34 0 .67.057 1.01.171q.495.17.9.554c.28.253.49.588.66 1.005q.24.627.24 1.543v.426h-5.05v-.869h4.03c0-.369-.08-.699-.23-.989-.14-.29-.35-.518-.62-.686a1.74 1.74 0 0 0-.94-.251c-.4 0-.75.099-1.04.298-.29.196-.52.452-.67.767q-.24.472-.24 1.014v.58c0 .494.09.913.26 1.257q.255.512.72.78c.31.176.66.264 1.07.264.26 0 .5-.037.71-.111a1.46 1.46 0 0 0 .92-.912l.98.273c-.11.329-.28.619-.52.869-.24.247-.54.441-.89.58q-.54.204-1.2.204m8.87-5.216-.9.256c-.06-.15-.14-.297-.25-.439a1.3 1.3 0 0 0-.44-.358q-.285-.14-.72-.14c-.4 0-.74.092-1 .277-.27.181-.4.413-.4.694q0 .375.27.593c.18.144.47.265.85.362l.98.238c.58.142 1.02.36 1.3.652.29.29.43.664.43 1.121 0 .375-.1.71-.32 1.006-.21.295-.51.528-.89.699-.39.17-.83.255-1.34.255-.67 0-1.22-.145-1.66-.434s-.72-.713-.83-1.27l.95-.239c.09.352.27.617.52.793s.59.264 1 .264c.47 0 .84-.099 1.12-.298.27-.202.41-.443.41-.725a.8.8 0 0 0-.23-.571c-.16-.156-.41-.272-.74-.349l-1.09-.256q-.9-.213-1.32-.66-.42-.452-.42-1.13c0-.369.11-.696.31-.98.21-.284.5-.507.86-.669s.78-.243 1.24-.243c.64 0 1.15.142 1.52.426s.64.66.79 1.125m6.27 0-.9.256c-.06-.15-.14-.297-.25-.439a1.3 1.3 0 0 0-.44-.358q-.285-.14-.72-.14c-.4 0-.74.092-1.01.277q-.39.272-.39.694 0 .375.27.593c.18.144.47.265.85.362l.97.238c.59.142 1.03.36 1.31.652.29.29.43.664.43 1.121 0 .375-.1.71-.32 1.006q-.315.442-.9.699c-.38.17-.82.255-1.33.255-.67 0-1.22-.145-1.66-.434s-.72-.713-.83-1.27l.95-.239c.09.352.27.617.52.793s.59.264 1 .264c.47 0 .84-.099 1.12-.298.27-.202.41-.443.41-.725a.8.8 0 0 0-.23-.571c-.16-.156-.41-.272-.74-.349l-1.09-.256q-.9-.213-1.32-.66-.42-.452-.42-1.13c0-.369.11-.696.31-.98.21-.284.5-.507.86-.669s.78-.243 1.24-.243c.64 0 1.15.142 1.52.426s.64.66.79 1.125m1.64 5.08v-6.545h1V136zm.51-7.636a.7.7 0 0 1-.51-.201.64.64 0 0 1-.21-.481q0-.282.21-.482t.51-.2c.19 0 .36.067.5.2q.21.2.21.482a.64.64 0 0 1-.21.481.7.7 0 0 1-.5.201m2.47 7.636v-8.727h1.01v3.221h.08c.08-.113.18-.258.31-.434q.195-.268.57-.478c.25-.142.59-.213 1.01-.213.56 0 1.04.138 1.46.414q.63.413.99 1.172c.23.505.35 1.102.35 1.789 0 .694-.12 1.294-.35 1.803-.24.506-.57.898-.98 1.176-.42.276-.9.413-1.45.413-.42 0-.76-.069-1.01-.208-.25-.142-.45-.303-.58-.482a8 8 0 0 1-.32-.452h-.12V136zm.99-3.273c0 .495.07.931.22 1.309q.21.563.63.882.42.315 1.02.315c.43 0 .78-.111 1.06-.332.28-.225.49-.526.64-.904q.21-.571.21-1.27 0-.69-.21-1.244a1.95 1.95 0 0 0-.63-.882c-.29-.219-.64-.328-1.07-.328-.4 0-.75.103-1.03.311q-.405.306-.63.861-.21.55-.21 1.282m7.33-5.454V136h-1v-8.727zm4.59 8.863c-.63 0-1.17-.139-1.63-.417a2.7 2.7 0 0 1-1.05-1.176c-.25-.506-.37-1.094-.37-1.765s.12-1.261.37-1.772c.24-.515.59-.915 1.03-1.202.44-.29.96-.435 1.55-.435.34 0 .68.057 1.01.171.33.113.63.298.91.554.27.253.49.588.65 1.005q.24.627.24 1.543v.426h-5.05v-.869h4.03c0-.369-.08-.699-.22-.989q-.225-.434-.63-.686a1.7 1.7 0 0 0-.94-.251c-.4 0-.75.099-1.04.298-.29.196-.51.452-.67.767q-.24.472-.24 1.014v.58c0 .494.09.913.26 1.257q.255.512.72.78c.31.176.66.264 1.07.264q.39 0 .72-.111c.21-.077.4-.19.55-.341.16-.153.28-.344.37-.571l.97.273c-.1.329-.28.619-.52.869-.24.247-.54.441-.89.58q-.54.204-1.2.204m10.46-6.681v.852h-3.39v-.852zm-2.4-1.569h1v6.239c0 .284.05.497.13.639.08.139.19.233.32.281.13.046.28.069.42.069.11 0 .21-.006.28-.017.07-.015.12-.026.17-.035l.2.904a2.221 2.221 0 0 1-.75.119c-.28 0-.56-.061-.83-.183s-.5-.308-.68-.558c-.17-.25-.26-.566-.26-.946zm6.59 8.25c-.63 0-1.18-.139-1.63-.417a2.8 2.8 0 0 1-1.06-1.176q-.36-.759-.36-1.765t.36-1.772c.25-.515.59-.915 1.04-1.202.44-.29.96-.435 1.55-.435.34 0 .67.057 1.01.171q.495.17.9.554c.28.253.49.588.66 1.005q.24.627.24 1.543v.426h-5.05v-.869h4.03c0-.369-.08-.699-.23-.989-.14-.29-.35-.518-.62-.686a1.7 1.7 0 0 0-.94-.251c-.4 0-.75.099-1.04.298-.29.196-.52.452-.67.767q-.24.472-.24 1.014v.58c0 .494.09.913.26 1.257q.255.512.72.78c.31.176.66.264 1.07.264.26 0 .5-.037.71-.111a1.46 1.46 0 0 0 .92-.912l.98.273c-.11.329-.28.619-.52.869-.24.247-.54.441-.89.58q-.54.204-1.2.204m4.81-6.681 1.57 2.676 1.57-2.676h1.16l-2.12 3.272 2.12 3.273h-1.16l-1.57-2.54-1.57 2.54h-1.16l2.08-3.273-2.08-3.272zm8.58 0v.852h-3.39v-.852zm-2.4-1.569h1v6.239c0 .284.04.497.13.639.08.139.19.233.32.281q.195.069.42.069.165 0 .27-.017c.08-.015.13-.026.17-.035l.21.904c-.07.025-.16.051-.29.077-.12.028-.27.042-.46.042q-.42 0-.84-.183a1.65 1.65 0 0 1-.67-.558c-.18-.25-.26-.566-.26-.946zM998.859 129.455a1.34 1.34 0 0 0-.622-1.006q-.546-.358-1.338-.358-.58 0-1.015.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.167.601.17.246.434.413.264.162.554.268.29.103.533.167l.886.238q.341.09.759.247.422.159.805.431.388.268.639.69.252.422.251 1.036 0 .707-.37 1.278-.366.571-1.074.908-.702.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.495.332.818.294.32.742.477.452.154.971.154.606 0 1.087-.196.481-.2.763-.554.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.856-.298l-1.074-.307q-1.023-.294-1.62-.84-.596-.545-.596-1.427 0-.733.396-1.279.4-.549 1.074-.852a3.6 3.6 0 0 1 1.513-.307q.843 0 1.5.303.656.299 1.039.818.388.52.41 1.181zm5.401 6.681c-.59 0-1.11-.14-1.55-.422-.45-.281-.79-.674-1.04-1.18s-.37-1.097-.37-1.773c0-.681.12-1.277.37-1.785.25-.509.59-.904 1.04-1.185.44-.281.96-.422 1.55-.422s1.11.141 1.55.422c.45.281.79.676 1.04 1.185.25.508.38 1.104.38 1.785 0 .676-.13 1.267-.38 1.773s-.59.899-1.04 1.18c-.44.282-.96.422-1.55.422m0-.903q.675 0 1.11-.345c.29-.23.5-.533.64-.908q.21-.562.21-1.219 0-.656-.21-1.223a2.06 2.06 0 0 0-.64-.916q-.435-.35-1.11-.349-.675 0-1.11.349c-.29.233-.5.539-.64.916q-.21.567-.21 1.223t.21 1.219c.14.375.35.678.64.908q.435.345 1.11.345m5.51-7.96V136h-1.01v-8.727zm1.84 8.727v-6.545h1.01V136zm.51-7.636a.75.75 0 0 1-.51-.201.63.63 0 0 1-.2-.481c0-.188.06-.348.2-.482q.225-.2.51-.2c.2 0 .36.067.5.2.15.134.22.294.22.482 0 .187-.07.348-.22.481a.69.69 0 0 1-.5.201m4.81 7.772c-.55 0-1.03-.137-1.45-.413-.41-.278-.74-.67-.98-1.176-.23-.509-.35-1.109-.35-1.803 0-.687.12-1.284.35-1.789q.36-.76.99-1.172c.42-.276.91-.414 1.46-.414.42 0 .76.071 1.01.213q.375.21.57.478c.13.176.23.321.31.434h.08v-3.221h1.01V136h-.97v-1.006h-.12c-.08.12-.18.27-.32.452-.13.179-.33.34-.58.482-.25.139-.59.208-1.01.208m.14-.903q.6 0 1.02-.315.42-.32.63-.882c.15-.378.22-.814.22-1.309q0-.732-.21-1.282-.21-.555-.63-.861c-.28-.208-.63-.311-1.03-.311-.43 0-.79.109-1.07.328q-.42.324-.63.882-.21.554-.21 1.244 0 .699.21 1.27c.14.378.36.679.64.904.28.221.64.332 1.06.332m10.87.903c-.61 0-1.14-.145-1.58-.434q-.66-.435-1.02-1.198t-.36-1.743c0-.664.12-1.251.37-1.76.24-.511.59-.91 1.03-1.197.44-.29.96-.435 1.55-.435.46 0 .87.086 1.24.256s.67.409.91.716.38.665.44 1.074h-1.01q-.105-.448-.51-.793c-.26-.233-.61-.349-1.06-.349-.39 0-.73.102-1.03.307-.29.201-.52.487-.68.856-.16.367-.25.797-.25 1.291q0 .759.24 1.321c.17.375.39.666.69.874.29.207.64.311 1.03.311.27 0 .5-.045.72-.136q.315-.137.54-.392c.15-.171.25-.375.31-.614h1.01q-.09.579-.42 1.044c-.22.307-.52.551-.89.733-.36.179-.78.268-1.27.268m6.71 0q-.885 0-1.56-.422a2.9 2.9 0 0 1-1.04-1.18c-.24-.506-.37-1.097-.37-1.773 0-.681.13-1.277.37-1.785.25-.509.6-.904 1.04-1.185q.675-.422 1.56-.422c.59 0 1.11.141 1.55.422.45.281.79.676 1.04 1.185.25.508.37 1.104.37 1.785 0 .676-.12 1.267-.37 1.773s-.59.899-1.04 1.18c-.44.282-.96.422-1.55.422m0-.903q.675 0 1.11-.345c.29-.23.5-.533.64-.908q.21-.562.21-1.219 0-.656-.21-1.223a2.06 2.06 0 0 0-.64-.916q-.435-.35-1.11-.349-.675 0-1.11.349c-.29.233-.5.539-.64.916q-.21.567-.21 1.223t.21 1.219c.14.375.35.678.64.908q.435.345 1.11.345m5.5-7.96V136h-1v-8.727zm4.51 8.863c-.6 0-1.11-.14-1.56-.422a2.9 2.9 0 0 1-1.04-1.18c-.25-.506-.37-1.097-.37-1.773 0-.681.12-1.277.37-1.785.25-.509.6-.904 1.04-1.185.45-.281.96-.422 1.56-.422.59 0 1.1.141 1.55.422.44.281.79.676 1.04 1.185.25.508.37 1.104.37 1.785 0 .676-.12 1.267-.37 1.773s-.6.899-1.04 1.18c-.45.282-.96.422-1.55.422m0-.903c.44 0 .81-.115 1.1-.345s.51-.533.65-.908q.21-.562.21-1.219 0-.656-.21-1.223a2.1 2.1 0 0 0-.65-.916c-.29-.233-.66-.349-1.1-.349q-.675 0-1.11.349c-.29.233-.51.539-.65.916-.13.378-.2.786-.2 1.223s.07.844.2 1.219c.14.375.36.678.65.908q.435.345 1.11.345m4.5.767v-6.545h.97v.988h.07c.12-.324.33-.586.64-.788.32-.202.67-.303 1.06-.303a11 11 0 0 1 .53.017v1.023a3 3 0 0 0-.23-.038 2.3 2.3 0 0 0-.38-.03c-.32 0-.61.067-.86.2-.24.131-.44.313-.58.546-.15.23-.22.492-.22.788V136zm9.1-5.08-.91.256c-.05-.15-.14-.297-.25-.439-.1-.145-.25-.264-.44-.358q-.285-.14-.72-.14c-.4 0-.73.092-1 .277-.27.181-.4.413-.4.694q0 .375.27.593c.19.144.47.265.86.362l.97.238c.58.142 1.02.36 1.31.652.28.29.43.664.43 1.121q0 .562-.33 1.006c-.21.295-.51.528-.89.699s-.83.255-1.34.255c-.67 0-1.22-.145-1.66-.434-.43-.29-.71-.713-.83-1.27l.96-.239q.135.528.51.793c.26.176.59.264 1 .264.47 0 .84-.099 1.12-.298q.42-.303.42-.725a.76.76 0 0 0-.24-.571c-.16-.156-.4-.272-.73-.349l-1.09-.256c-.6-.142-1.04-.362-1.33-.66-.27-.302-.41-.678-.41-1.13 0-.369.1-.696.31-.98s.49-.507.85-.669c.37-.162.78-.243 1.24-.243q.975 0 1.53.426c.37.285.63.66.79 1.125M710.494 136v-8.727h3.051q.912 0 1.505.315.592.31.882.84.29.524.29 1.163 0 .563-.201.929-.196.366-.52.579a2.4 2.4 0 0 1-.694.316v.085q.4.026.805.281.405.256.678.733.273.478.272 1.168 0 .656-.298 1.18-.299.525-.942.831-.644.307-1.674.307zm1.057-.938h2.097q1.035 0 1.47-.4.44-.405.439-.98a1.55 1.55 0 0 0-.226-.818 1.63 1.63 0 0 0-.643-.605 2 2 0 0 0-.989-.231h-2.148zm0-3.954h1.96q.478 0 .861-.188.388-.187.614-.528a1.4 1.4 0 0 0 .23-.801q0-.576-.401-.976-.4-.405-1.27-.405h-1.994zm9.271 5.028q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.039-1.18q-.371-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.039-1.185.67-.422 1.556-.422t1.551.422q.669.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.83 2.83 0 0 1-1.04 1.18q-.665.423-1.551.422m0-.903q.673 0 1.108-.345.434-.345.643-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.07 2.07 0 0 0-.643-.916q-.435-.35-1.108-.349-.673 0-1.108.349-.434.35-.644.916a3.5 3.5 0 0 0-.208 1.223q0 .657.208 1.219.21.563.644.908t1.108.345m4.501.767v-6.545h.971v.988h.069q.179-.486.647-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .529.017v1.023a4 4 0 0 0-.235-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.802 1.334V136zm6.737.136a2.56 2.56 0 0 1-1.445-.413q-.626-.417-.98-1.176-.353-.763-.353-1.803 0-1.031.353-1.789.354-.76.985-1.172.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.2.264.311.434h.085v-3.221h1.006V136h-.972v-1.006h-.119q-.111.18-.315.452-.205.269-.584.482-.38.208-1.01.208m.136-.903q.606 0 1.023-.315.418-.32.635-.882.217-.567.217-1.309 0-.732-.213-1.282a1.86 1.86 0 0 0-.63-.861q-.419-.312-1.032-.311-.639 0-1.065.328-.422.324-.635.882a3.5 3.5 0 0 0-.209 1.244q0 .699.213 1.27.217.567.64.904.426.332 1.056.332m7.59.903q-.946 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.031-1.202q.666-.435 1.552-.435.511 0 1.01.171.498.17.907.554.41.38.652 1.005.243.627.243 1.543v.426h-5.045v-.869h4.022q0-.554-.221-.989a1.67 1.67 0 0 0-.622-.686 1.75 1.75 0 0 0-.946-.251q-.602 0-1.04.298a1.96 1.96 0 0 0-.669.767 2.26 2.26 0 0 0-.235 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.396 0 .716-.111.324-.115.558-.341.234-.23.362-.571l.972.273a2.15 2.15 0 0 1-.516.869q-.362.371-.895.58a3.3 3.3 0 0 1-1.197.204m4.24-.136v-6.545h.972v.988h.068q.179-.486.647-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .529.017v1.023a3 3 0 0 0-.235-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.801 1.334V136zm9.101-5.08-.903.256a1.7 1.7 0 0 0-.252-.439 1.2 1.2 0 0 0-.443-.358q-.28-.14-.72-.14-.601 0-1.001.277-.397.272-.397.694 0 .375.273.593.273.216.852.362l.972.238q.878.214 1.308.652.43.435.43 1.121 0 .562-.323 1.006a2.16 2.16 0 0 1-.895.699q-.576.255-1.338.255-1.002 0-1.658-.434-.657-.435-.831-1.27l.955-.239q.135.528.515.793.384.264 1.002.264.702 0 1.116-.298.418-.303.418-.725a.76.76 0 0 0-.239-.571q-.238-.234-.733-.349l-1.091-.256q-.899-.213-1.321-.66-.417-.452-.417-1.13 0-.554.311-.98.315-.426.856-.669a3 3 0 0 1 1.236-.243q.971 0 1.526.426.558.427.792 1.125m6.934 5.233q-.622 0-1.129-.234a1.94 1.94 0 0 1-.805-.686q-.299-.452-.299-1.091 0-.562.222-.912.222-.353.592-.554.371-.2.819-.298.451-.102.907-.162.596-.077.968-.115.375-.043.545-.141.175-.098.175-.341v-.034q0-.63-.345-.98-.342-.35-1.036-.349-.72 0-1.129.315-.41.316-.575.673l-.955-.341q.256-.596.682-.929.43-.336.937-.468a4 4 0 0 1 1.006-.137q.316 0 .724.077.414.072.797.303.388.23.644.694.255.465.255 1.245V136h-1.005v-.886h-.051a1.8 1.8 0 0 1-.341.456 2 2 0 0 1-.635.413q-.396.17-.968.17m.154-.903q.597 0 1.006-.234a1.6 1.6 0 0 0 .622-.605q.213-.372.213-.78v-.921q-.065.077-.281.141-.214.06-.495.106a21 21 0 0 1-.963.128q-.392.051-.733.166a1.26 1.26 0 0 0-.545.337q-.205.221-.205.605 0 .525.388.793.391.264.993.264m5.688-3.188V136h-1.006v-6.545h.972v1.022h.085q.23-.498.699-.801.468-.307 1.21-.307.665 0 1.163.273.499.269.776.818.277.546.277 1.381V136h-1.006v-4.091q0-.771-.4-1.202-.4-.434-1.1-.434-.481 0-.861.209-.375.209-.592.609t-.217.971m8.485 4.074q-.818 0-1.444-.413-.627-.417-.981-1.176-.353-.763-.353-1.803 0-1.031.353-1.789.354-.76.985-1.172.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.2.264.311.434h.085v-3.221h1.006V136h-.971v-1.006h-.12q-.111.18-.315.452-.204.269-.584.482-.379.208-1.01.208m.137-.903q.605 0 1.022-.315.418-.32.635-.882.218-.567.218-1.309 0-.732-.214-1.282a1.86 1.86 0 0 0-.63-.861q-.418-.312-1.031-.311-.64 0-1.066.328-.422.324-.635.882a3.5 3.5 0 0 0-.209 1.244q0 .699.213 1.27.217.567.64.904.426.332 1.057.332m12.856-4.313-.903.256a1.7 1.7 0 0 0-.252-.439 1.2 1.2 0 0 0-.443-.358q-.281-.14-.72-.14-.602 0-1.002.277-.396.272-.396.694 0 .375.273.593.273.216.852.362l.972.238q.878.214 1.308.652.43.435.43 1.121 0 .562-.324 1.006a2.16 2.16 0 0 1-.894.699q-.576.255-1.338.255-1.002 0-1.658-.434-.657-.435-.831-1.27l.954-.239q.136.528.516.793.384.264 1.001.264.703 0 1.117-.298.417-.303.418-.725a.76.76 0 0 0-.239-.571q-.238-.234-.733-.349l-1.091-.256q-.899-.213-1.321-.66-.418-.452-.418-1.13 0-.554.312-.98.315-.426.856-.669a3 3 0 0 1 1.236-.243q.972 0 1.525.426a2.3 2.3 0 0 1 .793 1.125m4.378 5.216q-.946 0-1.633-.417a2.8 2.8 0 0 1-1.052-1.176q-.366-.759-.367-1.765 0-1.005.367-1.772a2.9 2.9 0 0 1 1.031-1.202q.665-.435 1.551-.435.512 0 1.01.171.499.17.908.554.41.38.652 1.005.243.627.243 1.543v.426h-5.046v-.869h4.023q0-.554-.222-.989a1.66 1.66 0 0 0-.622-.686 1.75 1.75 0 0 0-.946-.251q-.6 0-1.04.298a2 2 0 0 0-.669.767 2.25 2.25 0 0 0-.234 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.396 0 .715-.111a1.5 1.5 0 0 0 .559-.341q.234-.23.362-.571l.971.273a2.16 2.16 0 0 1-.515.869 2.5 2.5 0 0 1-.895.58 3.3 3.3 0 0 1-1.197.204m4.24 2.319v-9h.971v1.039h.119q.111-.17.307-.434.2-.268.571-.478.375-.213 1.015-.213.826 0 1.457.414.63.413.984 1.172t.354 1.789q0 1.04-.354 1.803-.353.759-.98 1.176-.626.413-1.444.413-.632 0-1.01-.208a1.9 1.9 0 0 1-.584-.482 6 6 0 0 1-.316-.452h-.085v3.461zm.988-5.728q0 .742.218 1.309.216.563.634.882.419.315 1.023.315.632 0 1.053-.332.426-.337.639-.904.217-.571.217-1.27 0-.69-.213-1.244a1.9 1.9 0 0 0-.635-.882q-.422-.328-1.061-.328-.614 0-1.031.311a1.86 1.86 0 0 0-.631.861q-.213.55-.213 1.282m8.25 3.426q-.622 0-1.129-.234a1.93 1.93 0 0 1-.805-.686q-.299-.452-.299-1.091 0-.562.222-.912.222-.353.592-.554a3.1 3.1 0 0 1 .818-.298q.453-.102.908-.162.597-.077.967-.115.375-.043.546-.141.175-.098.175-.341v-.034q0-.63-.346-.98-.34-.35-1.035-.349-.72 0-1.129.315-.41.316-.576.673l-.954-.341q.255-.596.682-.929.43-.336.937-.468a4 4 0 0 1 1.006-.137 4 4 0 0 1 .724.077q.413.072.797.303.388.23.644.694.255.465.255 1.245V136h-1.005v-.886h-.052a1.8 1.8 0 0 1-.341.456q-.238.243-.634.413-.397.17-.968.17m.154-.903q.596 0 1.005-.234a1.6 1.6 0 0 0 .836-1.385v-.921q-.064.077-.282.141a5 5 0 0 1-.494.106 21 21 0 0 1-.963.128q-.392.051-.733.166a1.3 1.3 0 0 0-.546.337q-.204.221-.204.605 0 .525.388.793.391.264.993.264m4.682.75v-6.545h.971v.988h.069q.179-.486.647-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .529.017v1.023a4 4 0 0 0-.235-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.802 1.334V136zm6.391.153q-.622 0-1.129-.234a1.94 1.94 0 0 1-.806-.686q-.298-.452-.298-1.091 0-.562.221-.912.222-.353.593-.554a3.1 3.1 0 0 1 .818-.298 10 10 0 0 1 .908-.162q.596-.077.967-.115.375-.043.545-.141.175-.098.175-.341v-.034q0-.63-.345-.98-.341-.35-1.036-.349-.72 0-1.129.315-.409.316-.575.673l-.955-.341q.256-.596.682-.929.43-.336.938-.468a4 4 0 0 1 1.005-.137q.316 0 .725.077.413.072.797.303.387.23.643.694.256.465.256 1.245V136h-1.006v-.886h-.051a1.8 1.8 0 0 1-.341.456 2 2 0 0 1-.635.413q-.396.17-.967.17m.153-.903q.597 0 1.006-.234.413-.235.622-.605.213-.372.213-.78v-.921q-.064.077-.281.141a5 5 0 0 1-.494.106 21 21 0 0 1-.964.128 4 4 0 0 0-.732.166 1.26 1.26 0 0 0-.546.337q-.204.221-.204.605 0 .525.387.793.393.264.993.264m7.529-5.795v.852h-3.392v-.852zm-2.403-1.569h1.005v6.239q0 .426.124.639a.64.64 0 0 0 .324.281q.2.069.422.069.165 0 .272-.017l.171-.035.204.904a2.2 2.2 0 0 1-.75.119q-.426 0-.835-.183a1.66 1.66 0 0 1-.673-.558q-.264-.376-.264-.946zm6.505 8.25q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.04-1.18q-.37-.759-.37-1.773 0-1.022.37-1.785.375-.763 1.04-1.185.67-.422 1.556-.422.885 0 1.551.422.669.421 1.039 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.8 2.8 0 0 1-1.039 1.18q-.666.423-1.551.422m0-.903q.673 0 1.107-.345.435-.345.644-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.06 2.06 0 0 0-.644-.916q-.434-.35-1.107-.349-.674 0-1.108.349-.435.35-.644.916a3.5 3.5 0 0 0-.209 1.223q0 .657.209 1.219t.644.908q.434.345 1.108.345m4.501.767v-6.545h.971v.988h.068q.18-.486.648-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .528.017v1.023a3 3 0 0 0-.234-.038 2.3 2.3 0 0 0-.379-.03q-.478 0-.853.2a1.468 1.468 0 0 0-.801 1.334V136zm9.101-5.08-.904.256a1.7 1.7 0 0 0-.251-.439 1.2 1.2 0 0 0-.443-.358q-.282-.14-.72-.14-.602 0-1.002.277-.396.272-.396.694 0 .375.273.593.272.216.852.362l.971.238q.879.214 1.309.652.43.435.43 1.121 0 .562-.324 1.006a2.15 2.15 0 0 1-.895.699q-.575.255-1.338.255-1.001 0-1.657-.434-.657-.435-.831-1.27l.954-.239q.136.528.516.793.383.264 1.001.264.703 0 1.117-.298.417-.303.417-.725a.76.76 0 0 0-.238-.571q-.239-.234-.733-.349l-1.091-.256q-.9-.213-1.321-.66-.418-.452-.418-1.13 0-.554.311-.98.316-.426.857-.669a3 3 0 0 1 1.236-.243q.971 0 1.525.426.558.427.793 1.125M411.258 127.273V136h-1.057v-8.727zm2.988 4.789V136h-1.005v-6.545h.971v1.022h.086q.23-.498.698-.801.469-.307 1.211-.307.665 0 1.163.273.498.269.776.818.277.546.277 1.381V136h-1.006v-4.091q0-.771-.401-1.202-.4-.434-1.099-.434-.482 0-.861.209-.375.209-.592.609-.218.4-.218.971m8.861-2.607v.852h-3.392v-.852zm-2.404-1.569h1.006v6.239q0 .426.124.639a.64.64 0 0 0 .324.281q.2.069.421.069.167 0 .273-.017l.171-.035.204.904a2.2 2.2 0 0 1-.75.119q-.426 0-.835-.183a1.66 1.66 0 0 1-.673-.558q-.264-.376-.265-.946zm6.591 8.25q-.947 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.031-1.202q.664-.435 1.551-.435.512 0 1.01.171.499.17.908.554.41.38.652 1.005.243.627.243 1.543v.426h-5.046v-.869h4.023q0-.554-.221-.989a1.67 1.67 0 0 0-.623-.686 1.75 1.75 0 0 0-.946-.251q-.6 0-1.039.298a1.96 1.96 0 0 0-.669.767 2.24 2.24 0 0 0-.235 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.396 0 .716-.111.323-.115.558-.341.234-.23.362-.571l.972.273a2.2 2.2 0 0 1-.516.869q-.362.371-.895.58a3.3 3.3 0 0 1-1.197.204m4.24-.136v-6.545h.971v.988h.069q.179-.486.647-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .528.017v1.023a3 3 0 0 0-.234-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.802 1.334V136zm6.391.153q-.622 0-1.13-.234a1.94 1.94 0 0 1-.805-.686q-.298-.452-.298-1.091 0-.562.221-.912.222-.353.593-.554a3.1 3.1 0 0 1 .818-.298 10 10 0 0 1 .908-.162q.596-.077.967-.115.375-.043.545-.141.175-.098.175-.341v-.034q0-.63-.345-.98-.341-.35-1.036-.349-.72 0-1.129.315-.409.316-.575.673l-.955-.341q.256-.596.682-.929.43-.336.938-.468.51-.137 1.005-.137.315 0 .725.077.413.072.797.303.387.23.643.694.255.465.256 1.245V136h-1.006v-.886h-.051a1.8 1.8 0 0 1-.341.456 2 2 0 0 1-.635.413q-.397.17-.967.17m.153-.903q.597 0 1.006-.234.413-.235.622-.605.213-.372.213-.78v-.921q-.064.077-.281.141-.213.06-.495.106a21 21 0 0 1-.963.128 4 4 0 0 0-.733.166 1.26 1.26 0 0 0-.545.337q-.205.221-.205.605 0 .525.388.793.393.264.993.264m7.341.886q-.92 0-1.585-.434a2.84 2.84 0 0 1-1.023-1.198q-.357-.762-.358-1.743 0-.996.367-1.76.37-.766 1.031-1.197.664-.435 1.551-.435.69 0 1.245.256.554.255.907.716.354.46.439 1.074h-1.005a1.56 1.56 0 0 0-.512-.793q-.391-.35-1.057-.349-.587 0-1.031.307a2 2 0 0 0-.686.856q-.243.55-.243 1.291 0 .759.239 1.321.243.562.682.874.443.31 1.039.311.393 0 .712-.136a1.47 1.47 0 0 0 .857-1.006h1.005a2.33 2.33 0 0 1-1.304 1.777q-.545.268-1.27.268m6.891-6.681v.852h-3.392v-.852zm-2.403-1.569h1.005v6.239q0 .426.124.639a.64.64 0 0 0 .324.281q.2.069.422.069.165 0 .272-.017l.171-.035.204.904a2.2 2.2 0 0 1-.75.119q-.426 0-.835-.183a1.66 1.66 0 0 1-.673-.558q-.264-.376-.264-.946zm3.916 8.114v-6.545h1.005V136zm.511-7.636a.71.71 0 0 1-.507-.201.64.64 0 0 1-.209-.481q0-.282.209-.482a.72.72 0 0 1 .507-.2q.294 0 .503.2a.64.64 0 0 1 .213.482.64.64 0 0 1-.213.481.7.7 0 0 1-.503.201m7.689 1.091L459.602 136h-1.022l-2.421-6.545h1.091l1.807 5.215h.068l1.807-5.215zm3.837 6.681q-.947 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.032-1.202q.664-.435 1.551-.435.511 0 1.01.171.498.17.907.554.41.38.652 1.005.243.627.243 1.543v.426h-5.045v-.869h4.023q0-.554-.222-.989a1.67 1.67 0 0 0-.622-.686 1.75 1.75 0 0 0-.946-.251q-.601 0-1.04.298a1.96 1.96 0 0 0-.669.767 2.25 2.25 0 0 0-.234 1.014v.58q0 .741.255 1.257.261.512.72.78.46.264 1.07.264.396 0 .716-.111.324-.115.558-.341.234-.23.362-.571l.972.273a2.15 2.15 0 0 1-.516.869 2.5 2.5 0 0 1-.894.58 3.3 3.3 0 0 1-1.198.204m10.274 0q-.92 0-1.585-.434a2.84 2.84 0 0 1-1.023-1.198q-.358-.762-.358-1.743 0-.996.367-1.76.37-.766 1.031-1.197.664-.435 1.551-.435.69 0 1.245.256.553.255.907.716t.439 1.074h-1.006a1.55 1.55 0 0 0-.511-.793q-.392-.35-1.057-.349-.588 0-1.031.307a2 2 0 0 0-.686.856q-.243.55-.243 1.291 0 .759.239 1.321.243.562.681.874a1.77 1.77 0 0 0 1.04.311q.393 0 .712-.136.32-.137.541-.392.222-.256.315-.614h1.006a2.33 2.33 0 0 1-1.304 1.777q-.546.268-1.27.268m6.703 0q-.886 0-1.555-.422a2.86 2.86 0 0 1-1.04-1.18q-.37-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.04-1.185.669-.422 1.555-.422.887 0 1.551.422a2.8 2.8 0 0 1 1.04 1.185q.375.763.375 1.785 0 1.014-.375 1.773a2.8 2.8 0 0 1-1.04 1.18q-.664.423-1.551.422m0-.903q.674 0 1.108-.345t.644-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.06 2.06 0 0 0-.644-.916q-.434-.35-1.108-.349-.673 0-1.108.349a2.07 2.07 0 0 0-.643.916 3.5 3.5 0 0 0-.209 1.223q0 .657.209 1.219t.643.908q.435.345 1.108.345m4.501.767v-6.545h.972v1.022h.085q.205-.523.661-.814.456-.294 1.095-.294.648 0 1.078.294.435.29.678.814h.068q.251-.507.754-.805.503-.303 1.206-.303.878 0 1.436.55.558.546.558 1.7V136h-1.005v-4.381q0-.725-.397-1.035a1.46 1.46 0 0 0-.933-.311q-.69 0-1.069.417-.38.413-.38 1.049V136h-1.022v-4.483q0-.558-.363-.899-.362-.345-.933-.345-.392 0-.733.209a1.6 1.6 0 0 0-.545.579 1.7 1.7 0 0 0-.205.848V136zm10.43 2.455v-9h.972v1.039h.119a9 9 0 0 1 .307-.434q.2-.268.571-.478.375-.213 1.014-.213.827 0 1.457.414.631.413.985 1.172t.354 1.789q0 1.04-.354 1.803-.354.759-.98 1.176-.627.413-1.445.413-.63 0-1.01-.208a1.9 1.9 0 0 1-.584-.482 7 7 0 0 1-.315-.452h-.085v3.461zm.989-5.728q0 .742.217 1.309.218.563.635.882.417.315 1.023.315.63 0 1.052-.332.426-.337.64-.904.216-.571.217-1.27 0-.69-.213-1.244a1.9 1.9 0 0 0-.635-.882q-.422-.328-1.061-.328-.613 0-1.032.311a1.86 1.86 0 0 0-.63.861q-.213.55-.213 1.282m8.983 3.409q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.039-1.18q-.371-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.039-1.185.67-.422 1.556-.422.887 0 1.551.422.668.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.83 2.83 0 0 1-1.04 1.18q-.664.423-1.551.422m0-.903q.673 0 1.108-.345.434-.345.643-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.07 2.07 0 0 0-.643-.916q-.435-.35-1.108-.349-.673 0-1.108.349-.435.35-.644.916a3.5 3.5 0 0 0-.209 1.223q0 .657.209 1.219t.644.908q.435.345 1.108.345m5.506-3.171V136h-1.005v-6.545h.971v1.022h.086q.23-.498.698-.801.469-.307 1.211-.307.665 0 1.163.273.498.269.776.818.276.546.277 1.381V136h-1.006v-4.091q0-.771-.401-1.202-.4-.434-1.099-.434-.481 0-.861.209-.375.209-.592.609-.218.4-.218.971m8.759 4.074q-.946 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.367-1.765 0-1.005.367-1.772a2.9 2.9 0 0 1 1.031-1.202q.664-.435 1.551-.435.512 0 1.01.171.499.17.908.554.41.38.652 1.005.243.627.243 1.543v.426h-5.046v-.869h4.023q0-.554-.221-.989a1.67 1.67 0 0 0-.623-.686 1.75 1.75 0 0 0-.946-.251q-.6 0-1.039.298a1.96 1.96 0 0 0-.669.767 2.24 2.24 0 0 0-.235 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.395 0 .716-.111.323-.115.558-.341.234-.23.362-.571l.972.273a2.2 2.2 0 0 1-.516.869 2.5 2.5 0 0 1-.895.58 3.3 3.3 0 0 1-1.197.204m5.245-4.074V136h-1.005v-6.545h.971v1.022h.085a1.9 1.9 0 0 1 .699-.801q.469-.307 1.211-.307.665 0 1.163.273.498.269.776.818.276.546.276 1.381V136h-1.005v-4.091q0-.771-.401-1.202-.4-.434-1.099-.434-.481 0-.861.209-.375.209-.592.609-.218.4-.218.971m8.861-2.607v.852h-3.392v-.852zm-2.404-1.569h1.006v6.239q0 .426.124.639a.64.64 0 0 0 .324.281q.2.069.421.069.166 0 .273-.017l.171-.035.204.904a2.2 2.2 0 0 1-.75.119q-.426 0-.835-.183a1.66 1.66 0 0 1-.673-.558q-.265-.376-.265-.946zm8.436 3.034-.904.256a1.7 1.7 0 0 0-.251-.439 1.2 1.2 0 0 0-.443-.358q-.282-.14-.72-.14-.601 0-1.002.277-.396.272-.396.694 0 .375.273.593.272.216.852.362l.971.238q.879.214 1.309.652.43.435.43 1.121 0 .562-.324 1.006a2.15 2.15 0 0 1-.895.699q-.574.255-1.338.255-1.001 0-1.657-.434-.657-.435-.831-1.27l.954-.239q.137.528.516.793.383.264 1.001.264.703 0 1.117-.298.417-.303.417-.725a.76.76 0 0 0-.238-.571q-.239-.234-.733-.349l-1.091-.256q-.9-.213-1.321-.66-.418-.452-.418-1.13 0-.554.311-.98.315-.426.857-.669a3 3 0 0 1 1.236-.243q.971 0 1.525.426.558.427.793 1.125M190.067 136v-8.727h3.051q.912 0 1.504.315.592.31.882.84.29.524.29 1.163 0 .563-.2.929a1.56 1.56 0 0 1-.52.579 2.4 2.4 0 0 1-.695.316v.085q.401.026.805.281.405.256.678.733.273.478.273 1.168 0 .656-.299 1.18-.297.525-.941.831-.644.307-1.675.307zm1.056-.938h2.097q1.035 0 1.47-.4.44-.405.439-.98a1.55 1.55 0 0 0-.226-.818 1.63 1.63 0 0 0-.643-.605 2 2 0 0 0-.989-.231h-2.148zm0-3.954h1.961q.477 0 .86-.188.388-.187.614-.528a1.4 1.4 0 0 0 .23-.801q0-.576-.4-.976-.401-.405-1.27-.405h-1.995zm8.538 5.045q-.622 0-1.129-.234a1.94 1.94 0 0 1-.806-.686q-.298-.452-.298-1.091 0-.562.222-.912.221-.353.592-.554a3.1 3.1 0 0 1 .818-.298 10 10 0 0 1 .908-.162q.597-.077.967-.115.375-.043.546-.141.174-.098.174-.341v-.034q0-.63-.345-.98-.34-.35-1.035-.349-.72 0-1.13.315-.408.316-.575.673l-.954-.341q.255-.596.681-.929.43-.336.938-.468a4 4 0 0 1 1.006-.137 4 4 0 0 1 .724.077q.414.072.797.303.388.23.643.694.256.465.256 1.245V136h-1.006v-.886h-.051a1.8 1.8 0 0 1-.341.456q-.238.243-.635.413-.396.17-.967.17m.153-.903q.597 0 1.006-.234a1.6 1.6 0 0 0 .835-1.385v-.921q-.063.077-.281.141a5 5 0 0 1-.494.106 21 21 0 0 1-.963.128q-.393.051-.733.166a1.26 1.26 0 0 0-.546.337q-.204.221-.204.605 0 .525.388.793.392.264.992.264m7.342.886q-.92 0-1.586-.434a2.83 2.83 0 0 1-1.022-1.198q-.358-.762-.358-1.743 0-.996.366-1.76.37-.766 1.032-1.197.665-.435 1.551-.435.69 0 1.244.256.554.255.908.716.353.46.439 1.074h-1.006a1.56 1.56 0 0 0-.511-.793q-.393-.35-1.057-.349-.588 0-1.032.307a2 2 0 0 0-.686.856q-.243.55-.243 1.291 0 .759.239 1.321.243.562.682.874.443.31 1.04.311.391 0 .711-.136a1.5 1.5 0 0 0 .542-.392 1.5 1.5 0 0 0 .315-.614h1.006a2.34 2.34 0 0 1-.422 1.044 2.36 2.36 0 0 1-.882.733q-.546.268-1.27.268m4.981-2.522-.017-1.245h.205l2.863-2.914h1.245l-3.051 3.085h-.086zM211.2 136v-8.727h1.005V136zm4.159 0-2.557-3.239.716-.699 3.119 3.938zm4.741 2.591q-.73 0-1.253-.188a2.7 2.7 0 0 1-.874-.485 2.7 2.7 0 0 1-.55-.64l.802-.562q.136.179.345.409.208.234.571.405.366.174.959.175.792 0 1.308-.384.515-.383.515-1.202v-1.329h-.085a6 6 0 0 1-.315.443 1.8 1.8 0 0 1-.58.464q-.375.201-1.014.201a2.73 2.73 0 0 1-1.423-.375 2.63 2.63 0 0 1-.993-1.091q-.362-.716-.362-1.739 0-1.005.353-1.751.354-.75.985-1.159.63-.414 1.457-.414.639 0 1.014.213.38.21.58.478.204.264.315.434h.103v-1.039h.971v6.733q0 .843-.383 1.372a2.2 2.2 0 0 1-1.023.779 3.9 3.9 0 0 1-1.423.252m-.034-3.597q.605 0 1.022-.277.418-.276.635-.797.218-.52.218-1.244 0-.707-.214-1.248a1.87 1.87 0 0 0-.63-.848q-.418-.307-1.031-.307-.64 0-1.066.324a1.97 1.97 0 0 0-.635.869 3.4 3.4 0 0 0-.209 1.21q0 .683.213 1.206.217.52.64.818.426.294 1.057.294M224.77 136v-6.545h.972v.988h.068q.179-.486.648-.788a1.9 1.9 0 0 1 1.056-.303 11 11 0 0 1 .529.017v1.023a3 3 0 0 0-.235-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.801 1.334V136zm6.925.136q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.039-1.18q-.371-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.039-1.185.67-.422 1.556-.422.887 0 1.551.422.67.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.8 2.8 0 0 1-1.04 1.18q-.665.423-1.551.422m0-.903q.673 0 1.108-.345t.643-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.06 2.06 0 0 0-.643-.916q-.435-.35-1.108-.349-.673 0-1.108.349-.434.35-.644.916a3.5 3.5 0 0 0-.208 1.223q0 .657.208 1.219.21.563.644.908t1.108.345m8.626-1.909v-3.869h1.006V136h-1.006v-1.108h-.068a2.15 2.15 0 0 1-.716.848q-.486.345-1.228.345-.613 0-1.09-.268a1.87 1.87 0 0 1-.75-.818q-.273-.55-.273-1.385v-4.159h1.006v4.09q0 .716.4 1.143.405.426 1.031.426.375 0 .763-.192.392-.192.656-.588.269-.396.269-1.01m3.853-1.262V136h-1.005v-6.545h.971v1.022h.085a1.9 1.9 0 0 1 .699-.801q.47-.307 1.21-.307.665 0 1.164.273.499.269.775.818.277.546.277 1.381V136h-1.005v-4.091q0-.771-.401-1.202-.4-.434-1.099-.434-.482 0-.861.209-.376.209-.592.609-.218.4-.218.971m8.486 4.074q-.819 0-1.445-.413-.627-.417-.98-1.176-.354-.763-.354-1.803 0-1.031.354-1.789.354-.76.984-1.172.632-.414 1.458-.414.638 0 1.01.213.375.21.571.478.2.264.311.434h.085v-3.221h1.006V136h-.972v-1.006h-.119a6 6 0 0 1-.316.452q-.204.269-.583.482-.38.208-1.01.208m.136-.903q.605 0 1.023-.315.417-.32.635-.882.217-.567.217-1.309 0-.732-.213-1.282-.213-.555-.631-.861-.417-.312-1.031-.311-.639 0-1.065.328a1.96 1.96 0 0 0-.635.882q-.21.554-.209 1.244 0 .699.213 1.27.218.567.639.904.427.332 1.057.332m9.482-4.313-.904.256a1.7 1.7 0 0 0-.251-.439 1.2 1.2 0 0 0-.443-.358q-.282-.14-.721-.14-.6 0-1.001.277-.396.272-.396.694 0 .375.272.593.273.216.853.362l.971.238q.878.214 1.308.652.43.435.431 1.121 0 .562-.324 1.006a2.15 2.15 0 0 1-.895.699q-.574.255-1.338.255-1.002 0-1.658-.434-.656-.435-.831-1.27l.955-.239q.137.528.516.793.383.264 1.001.264.704 0 1.116-.298.418-.303.418-.725a.76.76 0 0 0-.239-.571q-.238-.234-.733-.349l-1.09-.256q-.9-.213-1.321-.66-.418-.452-.418-1.13 0-.554.311-.98.315-.426.857-.669a3 3 0 0 1 1.235-.243q.972 0 1.526.426.558.427.793 1.125"
      ></path>
      <path fill="url(#paint0_linear_1_10)" d="M128 150h196v1H128z"></path>
      <path fill="url(#paint1_linear_1_10)" d="M328 150h296v1H328z"></path>
      <path fill="url(#paint2_linear_1_10)" d="M628 150h296v1H628z"></path>
      <path fill="url(#paint3_linear_1_10)" d="M928 150h196v1H928z"></path>
      <path fill="url(#paint4_linear_1_10)" d="M1128 150h196v1h-196z"></path>
      <defs>
        <linearGradient
          id="paint0_linear_1_10"
          x1="128"
          x2="324"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5e606a" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#5e606a"></stop>
          <stop offset="1" stopColor="#5e606a" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint1_linear_1_10"
          x1="328"
          x2="624"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5e606a" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#5e606a"></stop>
          <stop offset="1" stopColor="#5e606a" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint2_linear_1_10"
          x1="628"
          x2="924"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5e606a" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#5e606a"></stop>
          <stop offset="1" stopColor="#5e606a" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint3_linear_1_10"
          x1="928"
          x2="1124"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5e606a" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#5e606a"></stop>
          <stop offset="1" stopColor="#5e606a" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint4_linear_1_10"
          x1="1128"
          x2="1324"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5e606a" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#5e606a"></stop>
          <stop offset="1" stopColor="#5e606a" stopOpacity="0"></stop>
        </linearGradient>
      </defs>
    </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1452"
      height="524"
      fill="none"
      viewBox="0 0 1452 524"
    >
      <path fill="#fff" d="M0 0h1452v524H0z"></path>
      <path fill="#fafefc" d="M128 192h96v48h-96z"></path>
      <path fill="#f4fbf7" d="M228 192h96v48h-96z"></path>
      <path fill="#e2f8eb" d="M328 192h96v48h-96z"></path>
      <path fill="#d0f3df" d="M428 192h96v48h-96z"></path>
      <path fill="#bdebd2" d="M528 192h96v48h-96z"></path>
      <path fill="#a8dfc1" d="M628 192h96v48h-96z"></path>
      <path fill="#8cceac" d="M728 192h96v48h-96z"></path>
      <path fill="#63ba90" d="M828 192h96v48h-96z"></path>
      <path fill="#1f7551" d="M928 192h96v48h-96z"></path>
      <path fill="#056643" d="M1028 192h96v48h-96z"></path>
      <path fill="#247954" d="M1128 192h96v48h-96z"></path>
      <path fill="#204131" d="M1228 192h96v48h-96z"></path>
      <path fill="#00cc6605" d="M128 244h96v48h-96z"></path>
      <path fill="#00a3460b" d="M228 244h96v48h-96z"></path>
      <path fill="#00c2501d" d="M328 244h96v48h-96z"></path>
      <path fill="#00be522f" d="M428 244h96v48h-96z"></path>
      <path fill="#00b25242" d="M528 244h96v48h-96z"></path>
      <path fill="#00a24a57" d="M628 244h96v48h-96z"></path>
      <path fill="#00934773" d="M728 244h96v48h-96z"></path>
      <path fill="#008f4a9c" d="M828 244h96v48h-96z"></path>
      <path fill="#006239e0" d="M928 244h96v48h-96z"></path>
      <path fill="#00633ffa" d="M1028 244h96v48h-96z"></path>
      <path fill="#006338db" d="M1128 244h96v48h-96z"></path>
      <path fill="#002614df" d="M1228 244h96v48h-96z"></path>
      <path fill="#fafefc" d="M128 296h96v48h-96z"></path>
      <path fill="#f3fcf8" d="M228 296h96v48h-96z"></path>
      <path fill="#eaf3ef" d="M328 296h96v48h-96z"></path>
      <path fill="#e1ebe7" d="M428 296h96v48h-96z"></path>
      <path fill="#d9e4df" d="M528 296h96v48h-96z"></path>
      <path fill="#cfddd7" d="M628 296h96v48h-96z"></path>
      <path fill="#c4d2cc" d="M728 296h96v48h-96z"></path>
      <path fill="#afc0b9" d="M828 296h96v48h-96z"></path>
      <path fill="#7e9289" d="M928 296h96v48h-96z"></path>
      <path fill="#73877f" d="M1028 296h96v48h-96z"></path>
      <path fill="#556860" d="M1128 296h96v48h-96z"></path>
      <path fill="#13241d" d="M1228 296h96v48h-96z"></path>
      <path fill="#00cc6605" d="M128 348h96v48h-96z"></path>
      <path fill="#00c06b0c" d="M228 348h96v48h-96z"></path>
      <path fill="#006e3d15" d="M328 348h96v48h-96z"></path>
      <path fill="#0055331e" d="M428 348h96v48h-96z"></path>
      <path fill="#004a2926" d="M528 348h96v48h-96z"></path>
      <path fill="#004b2b30" d="M628 348h96v48h-96z"></path>
      <path fill="#013d233b" d="M728 348h96v48h-96z"></path>
      <path fill="#00372050" d="M828 348h96v48h-96z"></path>
      <path fill="#00281681" d="M928 348h96v48h-96z"></path>
      <path fill="#0025168c" d="M1028 348h96v48h-96z"></path>
      <path fill="#001d11aa" d="M1128 348h96v48h-96z"></path>
      <path fill="#00120bec" d="M1228 348h96v48h-96z"></path>
      <path
        fill="#556860"
        d="M1273.97 167.273V176h-1.06v-7.619h-.05l-2.13 1.414v-1.073l2.18-1.449zm2.51 8.727v-.767l2.88-3.153q.51-.555.84-.964.33-.413.48-.775c.11-.244.17-.5.17-.767 0-.307-.08-.573-.23-.797a1.4 1.4 0 0 0-.59-.52 2 2 0 0 0-.86-.183q-.495 0-.87.209c-.25.136-.44.328-.58.575-.13.247-.2.537-.2.869h-1c0-.511.11-.96.35-1.346q.36-.58.96-.904.615-.324 1.38-.324c.51 0 .96.108 1.36.324q.585.324.93.874.33.55.33 1.223c0 .321-.05.635-.17.942q-.165.456-.6 1.018-.42.558-1.17 1.364l-1.96 2.096v.068h4.06V176zM1173.97 167.273V176h-1.06v-7.619h-.05l-2.13 1.414v-1.073l2.18-1.449zm5.58 0V176h-1.06v-7.619h-.05l-2.13 1.414v-1.073l2.18-1.449zM1072.97 167.273V176h-1.06v-7.619h-.05l-2.13 1.414v-1.073l2.18-1.449zm5.36 8.846c-.64 0-1.19-.174-1.64-.524-.45-.352-.8-.862-1.04-1.53q-.36-1.005-.36-2.429 0-1.414.36-2.416c.24-.67.59-1.182 1.04-1.534.46-.355 1-.533 1.64-.533.63 0 1.18.178 1.63.533.45.352.8.864 1.04 1.534q.36 1.002.36 2.416 0 1.424-.36 2.429c-.23.668-.58 1.178-1.03 1.53-.45.35-1 .524-1.64.524m0-.937c.63 0 1.13-.307 1.48-.921.35-.613.53-1.488.53-2.625q0-1.133-.24-1.93t-.69-1.215-1.08-.417c-.63 0-1.13.311-1.48.933-.36.619-.53 1.496-.53 2.629q0 1.134.24 1.926c.15.529.38.931.68 1.206.3.276.66.414 1.09.414M975.682 167.153a3.1 3.1 0 0 1 1.074.205q.536.2.98.665.442.46.711 1.257t.269 1.998q0 1.164-.222 2.067-.218.9-.63 1.517a2.8 2.8 0 0 1-.998.938 2.7 2.7 0 0 1-1.321.319q-.732 0-1.308-.289a2.6 2.6 0 0 1-.937-.814 2.8 2.8 0 0 1-.465-1.215h1.04q.141.601.558.993.422.388 1.112.388 1.01 0 1.594-.882.588-.882.588-2.493h-.068a2.7 2.7 0 0 1-.567.618 2.5 2.5 0 0 1-.728.4 2.6 2.6 0 0 1-.853.141q-.75 0-1.376-.371a2.8 2.8 0 0 1-.997-1.027q-.37-.655-.371-1.5 0-.801.358-1.466.362-.669 1.014-1.065.657-.396 1.543-.384m0 .938q-.537 0-.968.268a1.94 1.94 0 0 0-.677.716 2 2 0 0 0-.247.993q0 .546.238.993.244.444.661.707.422.26.959.26.405 0 .754-.157a2 2 0 0 0 .609-.439q.265-.282.414-.635.149-.358.149-.746 0-.511-.247-.959a1.97 1.97 0 0 0-.674-.724 1.74 1.74 0 0 0-.971-.277M875.699 176.119q-.877 0-1.551-.311a2.54 2.54 0 0 1-1.044-.865 2.17 2.17 0 0 1-.371-1.261q-.004-.554.217-1.023.222-.473.605-.788a1.86 1.86 0 0 1 .865-.405v-.051a1.7 1.7 0 0 1-.997-.703 2.13 2.13 0 0 1-.366-1.24q-.005-.666.336-1.189.341-.525.938-.827a3 3 0 0 1 1.368-.303q.758 0 1.355.303.597.302.937.827.346.523.35 1.189a2.16 2.16 0 0 1-.379 1.24 1.7 1.7 0 0 1-.985.703v.051q.474.085.853.405.378.315.605.788.225.469.23 1.023a2.2 2.2 0 0 1-.384 1.261q-.375.55-1.044.865-.665.311-1.538.311m0-.937q.592 0 1.023-.192a1.5 1.5 0 0 0 .664-.541q.235-.35.239-.818a1.57 1.57 0 0 0-.256-.874 1.7 1.7 0 0 0-.686-.596 2.15 2.15 0 0 0-.984-.218q-.558 0-.997.218a1.7 1.7 0 0 0-.686.596 1.54 1.54 0 0 0-.243.874q-.005.468.226.818.234.35.669.541.434.192 1.031.192m0-4.142q.468 0 .831-.188.366-.187.575-.524.208-.336.213-.788a1.45 1.45 0 0 0-.209-.772 1.35 1.35 0 0 0-.566-.511 1.85 1.85 0 0 0-.844-.183q-.49 0-.857.183a1.3 1.3 0 0 0-.566.511 1.4 1.4 0 0 0-.196.772q-.005.452.2.788.209.337.575.524.366.188.844.188M774.176 176l3.904-7.722v-.068h-4.5v-.937h5.59v.988L775.284 176zM675.801 176.119a3.3 3.3 0 0 1-1.074-.204 2.6 2.6 0 0 1-.98-.661q-.443-.468-.711-1.265-.269-.801-.269-2.012 0-1.158.217-2.054.217-.899.631-1.512.414-.618.997-.938.588-.32 1.326-.32.733 0 1.303.294.576.291.938.81t.469 1.198h-1.04a1.92 1.92 0 0 0-.563-.976q-.417-.388-1.107-.388-1.015 0-1.599.882-.579.882-.583 2.476h.068q.238-.363.567-.618.332-.26.733-.401.4-.14.848-.14.75 0 1.372.375.622.37.997 1.027.375.651.375 1.496 0 .81-.362 1.482a2.76 2.76 0 0 1-1.019 1.066q-.651.392-1.534.383m0-.937q.537 0 .963-.269.43-.269.678-.72.25-.451.251-1.005 0-.541-.243-.985a1.86 1.86 0 0 0-.66-.712 1.75 1.75 0 0 0-.955-.264q-.405 0-.754.162a1.9 1.9 0 0 0-.614.435 2.1 2.1 0 0 0-.409.635 2.018 2.018 0 0 0 .767 2.446q.431.276.976.277M575.631 176.119q-.75 0-1.351-.298a2.5 2.5 0 0 1-.963-.818 2.23 2.23 0 0 1-.397-1.185h1.023q.06.593.537.98a1.8 1.8 0 0 0 1.151.384q.537 0 .954-.252a1.77 1.77 0 0 0 .661-.69q.243-.443.243-1.001a2.04 2.04 0 0 0-.252-1.019 1.84 1.84 0 0 0-.682-.711 1.9 1.9 0 0 0-.993-.265 2.7 2.7 0 0 0-.822.124 2.3 2.3 0 0 0-.695.32l-.988-.12.528-4.295h4.534v.937h-3.647l-.307 2.574h.051a2.3 2.3 0 0 1 .673-.354q.405-.14.844-.14a2.69 2.69 0 0 1 2.416 1.423q.362.66.362 1.509 0 .835-.375 1.491a2.74 2.74 0 0 1-1.022 1.031q-.652.375-1.483.375M472.699 174.21v-.869l3.835-6.068h.631v1.346h-.426l-2.898 4.586v.068h5.165v.937zm4.108 1.79v-8.727h1.005V176zM375.852 176.119q-.844 0-1.504-.289a2.6 2.6 0 0 1-1.044-.806 2.16 2.16 0 0 1-.418-1.206h1.074q.035.422.29.729.255.303.669.469t.916.166q.563 0 .997-.196.435-.197.682-.546t.247-.809q0-.482-.238-.848a1.6 1.6 0 0 0-.699-.58q-.46-.209-1.125-.209H375v-.937h.699q.519 0 .912-.188.396-.187.618-.528a1.4 1.4 0 0 0 .226-.801q0-.444-.196-.772a1.35 1.35 0 0 0-.554-.511 1.8 1.8 0 0 0-.836-.183q-.452 0-.852.166-.396.162-.648.473a1.24 1.24 0 0 0-.272.742h-1.023q.026-.686.413-1.202a2.6 2.6 0 0 1 1.014-.81q.632-.29 1.385-.29.81 0 1.39.329a2.3 2.3 0 0 1 .89.856q.312.533.311 1.151 0 .737-.388 1.257a1.97 1.97 0 0 1-1.044.72v.068q.828.136 1.292.703.464.563.464 1.394 0 .711-.388 1.278a2.6 2.6 0 0 1-1.048.886q-.664.324-1.513.324M272.903 176v-.767l2.881-3.153q.508-.555.835-.964.328-.413.486-.775.162-.366.162-.767a1.41 1.41 0 0 0-.818-1.317 1.9 1.9 0 0 0-.852-.183q-.504 0-.878.209a1.44 1.44 0 0 0-.576.575q-.2.37-.2.869h-1.005q0-.767.353-1.346.354-.58.963-.904a2.9 2.9 0 0 1 1.377-.324q.766 0 1.359.324t.929.874q.337.55.337 1.223 0 .481-.175.942-.171.456-.597 1.018-.422.558-1.172 1.364l-1.96 2.096v.068h4.057V176zM176.972 167.273V176h-1.057v-7.619h-.051l-2.131 1.414v-1.073l2.182-1.449zM1184.67 136h-1.11l3.21-8.727h1.09l3.2 8.727h-1.1l-2.61-7.347h-.07zm.41-3.409h4.47v.937h-4.47zm9.87 3.545q-.93 0-1.59-.434-.66-.435-1.02-1.198t-.36-1.743c0-.664.12-1.251.37-1.76.24-.511.59-.91 1.03-1.197.44-.29.96-.435 1.55-.435.46 0 .87.086 1.24.256s.68.409.91.716c.24.307.38.665.44 1.074h-1.01q-.105-.448-.51-.793-.39-.35-1.05-.349c-.4 0-.74.102-1.03.307q-.45.302-.69.856-.24.55-.24 1.291 0 .759.24 1.321c.16.375.38.666.68.874.29.207.64.311 1.04.311.26 0 .5-.045.71-.136q.315-.137.54-.392c.15-.171.25-.375.31-.614h1.01q-.09.579-.42 1.044a2.4 2.4 0 0 1-.88.733 2.9 2.9 0 0 1-1.27.268m6.7 0q-.915 0-1.59-.434-.66-.435-1.02-1.198t-.36-1.743c0-.664.13-1.251.37-1.76.25-.511.59-.91 1.03-1.197.44-.29.96-.435 1.55-.435.46 0 .88.086 1.25.256q.555.255.9.716c.24.307.39.665.44 1.074h-1a1.6 1.6 0 0 0-.51-.793c-.26-.233-.62-.349-1.06-.349-.39 0-.74.102-1.03.307a2.06 2.06 0 0 0-.69.856q-.24.55-.24 1.291 0 .759.24 1.321c.16.375.39.666.68.874.3.207.64.311 1.04.311.26 0 .5-.045.71-.136q.315-.137.54-.392c.15-.171.26-.375.32-.614h1q-.075.579-.42 1.044c-.22.307-.51.551-.88.733-.36.179-.79.268-1.27.268m6.79 0c-.63 0-1.18-.139-1.63-.417a2.8 2.8 0 0 1-1.06-1.176q-.36-.759-.36-1.765t.36-1.772c.25-.515.59-.915 1.03-1.202q.675-.435 1.56-.435c.34 0 .67.057 1.01.171q.495.17.9.554c.28.253.49.588.66 1.005q.24.627.24 1.543v.426h-5.05v-.869h4.03c0-.369-.08-.699-.23-.989-.14-.29-.35-.518-.62-.686a1.74 1.74 0 0 0-.94-.251c-.4 0-.75.099-1.04.298-.29.196-.52.452-.67.767q-.24.472-.24 1.014v.58c0 .494.09.913.26 1.257q.255.512.72.78c.31.176.66.264 1.07.264.26 0 .5-.037.71-.111a1.46 1.46 0 0 0 .92-.912l.98.273c-.11.329-.28.619-.52.869-.24.247-.54.441-.89.58q-.54.204-1.2.204m8.87-5.216-.9.256c-.06-.15-.14-.297-.25-.439a1.3 1.3 0 0 0-.44-.358q-.285-.14-.72-.14c-.4 0-.74.092-1 .277-.27.181-.4.413-.4.694q0 .375.27.593c.18.144.47.265.85.362l.98.238c.58.142 1.02.36 1.3.652.29.29.43.664.43 1.121 0 .375-.1.71-.32 1.006-.21.295-.51.528-.89.699-.39.17-.83.255-1.34.255-.67 0-1.22-.145-1.66-.434s-.72-.713-.83-1.27l.95-.239c.09.352.27.617.52.793s.59.264 1 .264c.47 0 .84-.099 1.12-.298.27-.202.41-.443.41-.725a.8.8 0 0 0-.23-.571c-.16-.156-.41-.272-.74-.349l-1.09-.256q-.9-.213-1.32-.66-.42-.452-.42-1.13c0-.369.11-.696.31-.98.21-.284.5-.507.86-.669s.78-.243 1.24-.243c.64 0 1.15.142 1.52.426s.64.66.79 1.125m6.27 0-.9.256c-.06-.15-.14-.297-.25-.439a1.3 1.3 0 0 0-.44-.358q-.285-.14-.72-.14c-.4 0-.74.092-1.01.277q-.39.272-.39.694 0 .375.27.593c.18.144.47.265.85.362l.97.238c.59.142 1.03.36 1.31.652.29.29.43.664.43 1.121 0 .375-.1.71-.32 1.006q-.315.442-.9.699c-.38.17-.82.255-1.33.255-.67 0-1.22-.145-1.66-.434s-.72-.713-.83-1.27l.95-.239c.09.352.27.617.52.793s.59.264 1 .264c.47 0 .84-.099 1.12-.298.27-.202.41-.443.41-.725a.8.8 0 0 0-.23-.571c-.16-.156-.41-.272-.74-.349l-1.09-.256q-.9-.213-1.32-.66-.42-.452-.42-1.13c0-.369.11-.696.31-.98.21-.284.5-.507.86-.669s.78-.243 1.24-.243c.64 0 1.15.142 1.52.426s.64.66.79 1.125m1.64 5.08v-6.545h1V136zm.51-7.636a.7.7 0 0 1-.51-.201.64.64 0 0 1-.21-.481q0-.282.21-.482t.51-.2c.19 0 .36.067.5.2q.21.2.21.482a.64.64 0 0 1-.21.481.7.7 0 0 1-.5.201m2.47 7.636v-8.727h1.01v3.221h.08c.08-.113.18-.258.31-.434q.195-.268.57-.478c.25-.142.59-.213 1.01-.213.56 0 1.04.138 1.46.414q.63.413.99 1.172c.23.505.35 1.102.35 1.789 0 .694-.12 1.294-.35 1.803-.24.506-.57.898-.98 1.176-.42.276-.9.413-1.45.413-.42 0-.76-.069-1.01-.208-.25-.142-.45-.303-.58-.482a8 8 0 0 1-.32-.452h-.12V136zm.99-3.273c0 .495.07.931.22 1.309q.21.563.63.882.42.315 1.02.315c.43 0 .78-.111 1.06-.332.28-.225.49-.526.64-.904q.21-.571.21-1.27 0-.69-.21-1.244a1.95 1.95 0 0 0-.63-.882c-.29-.219-.64-.328-1.07-.328-.4 0-.75.103-1.03.311q-.405.306-.63.861-.21.55-.21 1.282m7.33-5.454V136h-1v-8.727zm4.59 8.863c-.63 0-1.17-.139-1.63-.417a2.7 2.7 0 0 1-1.05-1.176c-.25-.506-.37-1.094-.37-1.765s.12-1.261.37-1.772c.24-.515.59-.915 1.03-1.202.44-.29.96-.435 1.55-.435.34 0 .68.057 1.01.171.33.113.63.298.91.554.27.253.49.588.65 1.005q.24.627.24 1.543v.426h-5.05v-.869h4.03c0-.369-.08-.699-.22-.989q-.225-.434-.63-.686a1.7 1.7 0 0 0-.94-.251c-.4 0-.75.099-1.04.298-.29.196-.51.452-.67.767q-.24.472-.24 1.014v.58c0 .494.09.913.26 1.257q.255.512.72.78c.31.176.66.264 1.07.264q.39 0 .72-.111c.21-.077.4-.19.55-.341.16-.153.28-.344.37-.571l.97.273c-.1.329-.28.619-.52.869-.24.247-.54.441-.89.58q-.54.204-1.2.204m10.46-6.681v.852h-3.39v-.852zm-2.4-1.569h1v6.239c0 .284.05.497.13.639.08.139.19.233.32.281.13.046.28.069.42.069.11 0 .21-.006.28-.017.07-.015.12-.026.17-.035l.2.904a2.221 2.221 0 0 1-.75.119c-.28 0-.56-.061-.83-.183s-.5-.308-.68-.558c-.17-.25-.26-.566-.26-.946zm6.59 8.25c-.63 0-1.18-.139-1.63-.417a2.8 2.8 0 0 1-1.06-1.176q-.36-.759-.36-1.765t.36-1.772c.25-.515.59-.915 1.04-1.202.44-.29.96-.435 1.55-.435.34 0 .67.057 1.01.171q.495.17.9.554c.28.253.49.588.66 1.005q.24.627.24 1.543v.426h-5.05v-.869h4.03c0-.369-.08-.699-.23-.989-.14-.29-.35-.518-.62-.686a1.7 1.7 0 0 0-.94-.251c-.4 0-.75.099-1.04.298-.29.196-.52.452-.67.767q-.24.472-.24 1.014v.58c0 .494.09.913.26 1.257q.255.512.72.78c.31.176.66.264 1.07.264.26 0 .5-.037.71-.111a1.46 1.46 0 0 0 .92-.912l.98.273c-.11.329-.28.619-.52.869-.24.247-.54.441-.89.58q-.54.204-1.2.204m4.81-6.681 1.57 2.676 1.57-2.676h1.16l-2.12 3.272 2.12 3.273h-1.16l-1.57-2.54-1.57 2.54h-1.16l2.08-3.273-2.08-3.272zm8.58 0v.852h-3.39v-.852zm-2.4-1.569h1v6.239c0 .284.04.497.13.639.08.139.19.233.32.281q.195.069.42.069.165 0 .27-.017c.08-.015.13-.026.17-.035l.21.904c-.07.025-.16.051-.29.077-.12.028-.27.042-.46.042q-.42 0-.84-.183a1.65 1.65 0 0 1-.67-.558c-.18-.25-.26-.566-.26-.946zM998.859 129.455a1.34 1.34 0 0 0-.622-1.006q-.546-.358-1.338-.358-.58 0-1.015.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.167.601.17.246.434.413.264.162.554.268.29.103.533.167l.886.238q.341.09.759.247.422.159.805.431.388.268.639.69.252.422.251 1.036 0 .707-.37 1.278-.366.571-1.074.908-.702.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.495.332.818.294.32.742.477.452.154.971.154.606 0 1.087-.196.481-.2.763-.554.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.856-.298l-1.074-.307q-1.023-.294-1.62-.84-.596-.545-.596-1.427 0-.733.396-1.279.4-.549 1.074-.852a3.6 3.6 0 0 1 1.513-.307q.843 0 1.5.303.656.299 1.039.818.388.52.41 1.181zm5.401 6.681c-.59 0-1.11-.14-1.55-.422-.45-.281-.79-.674-1.04-1.18s-.37-1.097-.37-1.773c0-.681.12-1.277.37-1.785.25-.509.59-.904 1.04-1.185.44-.281.96-.422 1.55-.422s1.11.141 1.55.422c.45.281.79.676 1.04 1.185.25.508.38 1.104.38 1.785 0 .676-.13 1.267-.38 1.773s-.59.899-1.04 1.18c-.44.282-.96.422-1.55.422m0-.903q.675 0 1.11-.345c.29-.23.5-.533.64-.908q.21-.562.21-1.219 0-.656-.21-1.223a2.06 2.06 0 0 0-.64-.916q-.435-.35-1.11-.349-.675 0-1.11.349c-.29.233-.5.539-.64.916q-.21.567-.21 1.223t.21 1.219c.14.375.35.678.64.908q.435.345 1.11.345m5.51-7.96V136h-1.01v-8.727zm1.84 8.727v-6.545h1.01V136zm.51-7.636a.75.75 0 0 1-.51-.201.63.63 0 0 1-.2-.481c0-.188.06-.348.2-.482q.225-.2.51-.2c.2 0 .36.067.5.2.15.134.22.294.22.482 0 .187-.07.348-.22.481a.69.69 0 0 1-.5.201m4.81 7.772c-.55 0-1.03-.137-1.45-.413-.41-.278-.74-.67-.98-1.176-.23-.509-.35-1.109-.35-1.803 0-.687.12-1.284.35-1.789q.36-.76.99-1.172c.42-.276.91-.414 1.46-.414.42 0 .76.071 1.01.213q.375.21.57.478c.13.176.23.321.31.434h.08v-3.221h1.01V136h-.97v-1.006h-.12c-.08.12-.18.27-.32.452-.13.179-.33.34-.58.482-.25.139-.59.208-1.01.208m.14-.903q.6 0 1.02-.315.42-.32.63-.882c.15-.378.22-.814.22-1.309q0-.732-.21-1.282-.21-.555-.63-.861c-.28-.208-.63-.311-1.03-.311-.43 0-.79.109-1.07.328q-.42.324-.63.882-.21.554-.21 1.244 0 .699.21 1.27c.14.378.36.679.64.904.28.221.64.332 1.06.332m10.87.903c-.61 0-1.14-.145-1.58-.434q-.66-.435-1.02-1.198t-.36-1.743c0-.664.12-1.251.37-1.76.24-.511.59-.91 1.03-1.197.44-.29.96-.435 1.55-.435.46 0 .87.086 1.24.256s.67.409.91.716.38.665.44 1.074h-1.01q-.105-.448-.51-.793c-.26-.233-.61-.349-1.06-.349-.39 0-.73.102-1.03.307-.29.201-.52.487-.68.856-.16.367-.25.797-.25 1.291q0 .759.24 1.321c.17.375.39.666.69.874.29.207.64.311 1.03.311.27 0 .5-.045.72-.136q.315-.137.54-.392c.15-.171.25-.375.31-.614h1.01q-.09.579-.42 1.044c-.22.307-.52.551-.89.733-.36.179-.78.268-1.27.268m6.71 0q-.885 0-1.56-.422a2.9 2.9 0 0 1-1.04-1.18c-.24-.506-.37-1.097-.37-1.773 0-.681.13-1.277.37-1.785.25-.509.6-.904 1.04-1.185q.675-.422 1.56-.422c.59 0 1.11.141 1.55.422.45.281.79.676 1.04 1.185.25.508.37 1.104.37 1.785 0 .676-.12 1.267-.37 1.773s-.59.899-1.04 1.18c-.44.282-.96.422-1.55.422m0-.903q.675 0 1.11-.345c.29-.23.5-.533.64-.908q.21-.562.21-1.219 0-.656-.21-1.223a2.06 2.06 0 0 0-.64-.916q-.435-.35-1.11-.349-.675 0-1.11.349c-.29.233-.5.539-.64.916q-.21.567-.21 1.223t.21 1.219c.14.375.35.678.64.908q.435.345 1.11.345m5.5-7.96V136h-1v-8.727zm4.51 8.863c-.6 0-1.11-.14-1.56-.422a2.9 2.9 0 0 1-1.04-1.18c-.25-.506-.37-1.097-.37-1.773 0-.681.12-1.277.37-1.785.25-.509.6-.904 1.04-1.185.45-.281.96-.422 1.56-.422.59 0 1.1.141 1.55.422.44.281.79.676 1.04 1.185.25.508.37 1.104.37 1.785 0 .676-.12 1.267-.37 1.773s-.6.899-1.04 1.18c-.45.282-.96.422-1.55.422m0-.903c.44 0 .81-.115 1.1-.345s.51-.533.65-.908q.21-.562.21-1.219 0-.656-.21-1.223a2.1 2.1 0 0 0-.65-.916c-.29-.233-.66-.349-1.1-.349q-.675 0-1.11.349c-.29.233-.51.539-.65.916-.13.378-.2.786-.2 1.223s.07.844.2 1.219c.14.375.36.678.65.908q.435.345 1.11.345m4.5.767v-6.545h.97v.988h.07c.12-.324.33-.586.64-.788.32-.202.67-.303 1.06-.303a11 11 0 0 1 .53.017v1.023a3 3 0 0 0-.23-.038 2.3 2.3 0 0 0-.38-.03c-.32 0-.61.067-.86.2-.24.131-.44.313-.58.546-.15.23-.22.492-.22.788V136zm9.1-5.08-.91.256c-.05-.15-.14-.297-.25-.439-.1-.145-.25-.264-.44-.358q-.285-.14-.72-.14c-.4 0-.73.092-1 .277-.27.181-.4.413-.4.694q0 .375.27.593c.19.144.47.265.86.362l.97.238c.58.142 1.02.36 1.31.652.28.29.43.664.43 1.121q0 .562-.33 1.006c-.21.295-.51.528-.89.699s-.83.255-1.34.255c-.67 0-1.22-.145-1.66-.434-.43-.29-.71-.713-.83-1.27l.96-.239q.135.528.51.793c.26.176.59.264 1 .264.47 0 .84-.099 1.12-.298q.42-.303.42-.725a.76.76 0 0 0-.24-.571c-.16-.156-.4-.272-.73-.349l-1.09-.256c-.6-.142-1.04-.362-1.33-.66-.27-.302-.41-.678-.41-1.13 0-.369.1-.696.31-.98s.49-.507.85-.669c.37-.162.78-.243 1.24-.243q.975 0 1.53.426c.37.285.63.66.79 1.125M710.494 136v-8.727h3.051q.912 0 1.505.315.592.31.882.84.29.524.29 1.163 0 .563-.201.929-.196.366-.52.579a2.4 2.4 0 0 1-.694.316v.085q.4.026.805.281.405.256.678.733.273.478.272 1.168 0 .656-.298 1.18-.299.525-.942.831-.644.307-1.674.307zm1.057-.938h2.097q1.035 0 1.47-.4.44-.405.439-.98a1.55 1.55 0 0 0-.226-.818 1.63 1.63 0 0 0-.643-.605 2 2 0 0 0-.989-.231h-2.148zm0-3.954h1.96q.478 0 .861-.188.388-.187.614-.528a1.4 1.4 0 0 0 .23-.801q0-.576-.401-.976-.4-.405-1.27-.405h-1.994zm9.271 5.028q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.039-1.18q-.371-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.039-1.185.67-.422 1.556-.422t1.551.422q.669.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.83 2.83 0 0 1-1.04 1.18q-.665.423-1.551.422m0-.903q.673 0 1.108-.345.434-.345.643-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.07 2.07 0 0 0-.643-.916q-.435-.35-1.108-.349-.673 0-1.108.349-.434.35-.644.916a3.5 3.5 0 0 0-.208 1.223q0 .657.208 1.219.21.563.644.908t1.108.345m4.501.767v-6.545h.971v.988h.069q.179-.486.647-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .529.017v1.023a4 4 0 0 0-.235-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.802 1.334V136zm6.737.136a2.56 2.56 0 0 1-1.445-.413q-.626-.417-.98-1.176-.353-.763-.353-1.803 0-1.031.353-1.789.354-.76.985-1.172.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.2.264.311.434h.085v-3.221h1.006V136h-.972v-1.006h-.119q-.111.18-.315.452-.205.269-.584.482-.38.208-1.01.208m.136-.903q.606 0 1.023-.315.418-.32.635-.882.217-.567.217-1.309 0-.732-.213-1.282a1.86 1.86 0 0 0-.63-.861q-.419-.312-1.032-.311-.639 0-1.065.328-.422.324-.635.882a3.5 3.5 0 0 0-.209 1.244q0 .699.213 1.27.217.567.64.904.426.332 1.056.332m7.59.903q-.946 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.031-1.202q.666-.435 1.552-.435.511 0 1.01.171.498.17.907.554.41.38.652 1.005.243.627.243 1.543v.426h-5.045v-.869h4.022q0-.554-.221-.989a1.67 1.67 0 0 0-.622-.686 1.75 1.75 0 0 0-.946-.251q-.602 0-1.04.298a1.96 1.96 0 0 0-.669.767 2.26 2.26 0 0 0-.235 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.396 0 .716-.111.324-.115.558-.341.234-.23.362-.571l.972.273a2.15 2.15 0 0 1-.516.869q-.362.371-.895.58a3.3 3.3 0 0 1-1.197.204m4.24-.136v-6.545h.972v.988h.068q.179-.486.647-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .529.017v1.023a3 3 0 0 0-.235-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.801 1.334V136zm9.101-5.08-.903.256a1.7 1.7 0 0 0-.252-.439 1.2 1.2 0 0 0-.443-.358q-.28-.14-.72-.14-.601 0-1.001.277-.397.272-.397.694 0 .375.273.593.273.216.852.362l.972.238q.878.214 1.308.652.43.435.43 1.121 0 .562-.323 1.006a2.16 2.16 0 0 1-.895.699q-.576.255-1.338.255-1.002 0-1.658-.434-.657-.435-.831-1.27l.955-.239q.135.528.515.793.384.264 1.002.264.702 0 1.116-.298.418-.303.418-.725a.76.76 0 0 0-.239-.571q-.238-.234-.733-.349l-1.091-.256q-.899-.213-1.321-.66-.417-.452-.417-1.13 0-.554.311-.98.315-.426.856-.669a3 3 0 0 1 1.236-.243q.971 0 1.526.426.558.427.792 1.125m6.934 5.233q-.622 0-1.129-.234a1.94 1.94 0 0 1-.805-.686q-.299-.452-.299-1.091 0-.562.222-.912.222-.353.592-.554.371-.2.819-.298.451-.102.907-.162.596-.077.968-.115.375-.043.545-.141.175-.098.175-.341v-.034q0-.63-.345-.98-.342-.35-1.036-.349-.72 0-1.129.315-.41.316-.575.673l-.955-.341q.256-.596.682-.929.43-.336.937-.468a4 4 0 0 1 1.006-.137q.316 0 .724.077.414.072.797.303.388.23.644.694.255.465.255 1.245V136h-1.005v-.886h-.051a1.8 1.8 0 0 1-.341.456 2 2 0 0 1-.635.413q-.396.17-.968.17m.154-.903q.597 0 1.006-.234a1.6 1.6 0 0 0 .622-.605q.213-.372.213-.78v-.921q-.065.077-.281.141-.214.06-.495.106a21 21 0 0 1-.963.128q-.392.051-.733.166a1.26 1.26 0 0 0-.545.337q-.205.221-.205.605 0 .525.388.793.391.264.993.264m5.688-3.188V136h-1.006v-6.545h.972v1.022h.085q.23-.498.699-.801.468-.307 1.21-.307.665 0 1.163.273.499.269.776.818.277.546.277 1.381V136h-1.006v-4.091q0-.771-.4-1.202-.4-.434-1.1-.434-.481 0-.861.209-.375.209-.592.609t-.217.971m8.485 4.074q-.818 0-1.444-.413-.627-.417-.981-1.176-.353-.763-.353-1.803 0-1.031.353-1.789.354-.76.985-1.172.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.2.264.311.434h.085v-3.221h1.006V136h-.971v-1.006h-.12q-.111.18-.315.452-.204.269-.584.482-.379.208-1.01.208m.137-.903q.605 0 1.022-.315.418-.32.635-.882.218-.567.218-1.309 0-.732-.214-1.282a1.86 1.86 0 0 0-.63-.861q-.418-.312-1.031-.311-.64 0-1.066.328-.422.324-.635.882a3.5 3.5 0 0 0-.209 1.244q0 .699.213 1.27.217.567.64.904.426.332 1.057.332m12.856-4.313-.903.256a1.7 1.7 0 0 0-.252-.439 1.2 1.2 0 0 0-.443-.358q-.281-.14-.72-.14-.602 0-1.002.277-.396.272-.396.694 0 .375.273.593.273.216.852.362l.972.238q.878.214 1.308.652.43.435.43 1.121 0 .562-.324 1.006a2.16 2.16 0 0 1-.894.699q-.576.255-1.338.255-1.002 0-1.658-.434-.657-.435-.831-1.27l.954-.239q.136.528.516.793.384.264 1.001.264.703 0 1.117-.298.417-.303.418-.725a.76.76 0 0 0-.239-.571q-.238-.234-.733-.349l-1.091-.256q-.899-.213-1.321-.66-.418-.452-.418-1.13 0-.554.312-.98.315-.426.856-.669a3 3 0 0 1 1.236-.243q.972 0 1.525.426a2.3 2.3 0 0 1 .793 1.125m4.378 5.216q-.946 0-1.633-.417a2.8 2.8 0 0 1-1.052-1.176q-.366-.759-.367-1.765 0-1.005.367-1.772a2.9 2.9 0 0 1 1.031-1.202q.665-.435 1.551-.435.512 0 1.01.171.499.17.908.554.41.38.652 1.005.243.627.243 1.543v.426h-5.046v-.869h4.023q0-.554-.222-.989a1.66 1.66 0 0 0-.622-.686 1.75 1.75 0 0 0-.946-.251q-.6 0-1.04.298a2 2 0 0 0-.669.767 2.25 2.25 0 0 0-.234 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.396 0 .715-.111a1.5 1.5 0 0 0 .559-.341q.234-.23.362-.571l.971.273a2.16 2.16 0 0 1-.515.869 2.5 2.5 0 0 1-.895.58 3.3 3.3 0 0 1-1.197.204m4.24 2.319v-9h.971v1.039h.119q.111-.17.307-.434.2-.268.571-.478.375-.213 1.015-.213.826 0 1.457.414.63.413.984 1.172t.354 1.789q0 1.04-.354 1.803-.353.759-.98 1.176-.626.413-1.444.413-.632 0-1.01-.208a1.9 1.9 0 0 1-.584-.482 6 6 0 0 1-.316-.452h-.085v3.461zm.988-5.728q0 .742.218 1.309.216.563.634.882.419.315 1.023.315.632 0 1.053-.332.426-.337.639-.904.217-.571.217-1.27 0-.69-.213-1.244a1.9 1.9 0 0 0-.635-.882q-.422-.328-1.061-.328-.614 0-1.031.311a1.86 1.86 0 0 0-.631.861q-.213.55-.213 1.282m8.25 3.426q-.622 0-1.129-.234a1.93 1.93 0 0 1-.805-.686q-.299-.452-.299-1.091 0-.562.222-.912.222-.353.592-.554a3.1 3.1 0 0 1 .818-.298q.453-.102.908-.162.597-.077.967-.115.375-.043.546-.141.175-.098.175-.341v-.034q0-.63-.346-.98-.34-.35-1.035-.349-.72 0-1.129.315-.41.316-.576.673l-.954-.341q.255-.596.682-.929.43-.336.937-.468a4 4 0 0 1 1.006-.137 4 4 0 0 1 .724.077q.413.072.797.303.388.23.644.694.255.465.255 1.245V136h-1.005v-.886h-.052a1.8 1.8 0 0 1-.341.456q-.238.243-.634.413-.397.17-.968.17m.154-.903q.596 0 1.005-.234a1.6 1.6 0 0 0 .836-1.385v-.921q-.064.077-.282.141a5 5 0 0 1-.494.106 21 21 0 0 1-.963.128q-.392.051-.733.166a1.3 1.3 0 0 0-.546.337q-.204.221-.204.605 0 .525.388.793.391.264.993.264m4.682.75v-6.545h.971v.988h.069q.179-.486.647-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .529.017v1.023a4 4 0 0 0-.235-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.802 1.334V136zm6.391.153q-.622 0-1.129-.234a1.94 1.94 0 0 1-.806-.686q-.298-.452-.298-1.091 0-.562.221-.912.222-.353.593-.554a3.1 3.1 0 0 1 .818-.298 10 10 0 0 1 .908-.162q.596-.077.967-.115.375-.043.545-.141.175-.098.175-.341v-.034q0-.63-.345-.98-.341-.35-1.036-.349-.72 0-1.129.315-.409.316-.575.673l-.955-.341q.256-.596.682-.929.43-.336.938-.468a4 4 0 0 1 1.005-.137q.316 0 .725.077.413.072.797.303.387.23.643.694.256.465.256 1.245V136h-1.006v-.886h-.051a1.8 1.8 0 0 1-.341.456 2 2 0 0 1-.635.413q-.396.17-.967.17m.153-.903q.597 0 1.006-.234.413-.235.622-.605.213-.372.213-.78v-.921q-.064.077-.281.141a5 5 0 0 1-.494.106 21 21 0 0 1-.964.128 4 4 0 0 0-.732.166 1.26 1.26 0 0 0-.546.337q-.204.221-.204.605 0 .525.387.793.393.264.993.264m7.529-5.795v.852h-3.392v-.852zm-2.403-1.569h1.005v6.239q0 .426.124.639a.64.64 0 0 0 .324.281q.2.069.422.069.165 0 .272-.017l.171-.035.204.904a2.2 2.2 0 0 1-.75.119q-.426 0-.835-.183a1.66 1.66 0 0 1-.673-.558q-.264-.376-.264-.946zm6.505 8.25q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.04-1.18q-.37-.759-.37-1.773 0-1.022.37-1.785.375-.763 1.04-1.185.67-.422 1.556-.422.885 0 1.551.422.669.421 1.039 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.8 2.8 0 0 1-1.039 1.18q-.666.423-1.551.422m0-.903q.673 0 1.107-.345.435-.345.644-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.06 2.06 0 0 0-.644-.916q-.434-.35-1.107-.349-.674 0-1.108.349-.435.35-.644.916a3.5 3.5 0 0 0-.209 1.223q0 .657.209 1.219t.644.908q.434.345 1.108.345m4.501.767v-6.545h.971v.988h.068q.18-.486.648-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .528.017v1.023a3 3 0 0 0-.234-.038 2.3 2.3 0 0 0-.379-.03q-.478 0-.853.2a1.468 1.468 0 0 0-.801 1.334V136zm9.101-5.08-.904.256a1.7 1.7 0 0 0-.251-.439 1.2 1.2 0 0 0-.443-.358q-.282-.14-.72-.14-.602 0-1.002.277-.396.272-.396.694 0 .375.273.593.272.216.852.362l.971.238q.879.214 1.309.652.43.435.43 1.121 0 .562-.324 1.006a2.15 2.15 0 0 1-.895.699q-.575.255-1.338.255-1.001 0-1.657-.434-.657-.435-.831-1.27l.954-.239q.136.528.516.793.383.264 1.001.264.703 0 1.117-.298.417-.303.417-.725a.76.76 0 0 0-.238-.571q-.239-.234-.733-.349l-1.091-.256q-.9-.213-1.321-.66-.418-.452-.418-1.13 0-.554.311-.98.316-.426.857-.669a3 3 0 0 1 1.236-.243q.971 0 1.525.426.558.427.793 1.125M411.258 127.273V136h-1.057v-8.727zm2.988 4.789V136h-1.005v-6.545h.971v1.022h.086q.23-.498.698-.801.469-.307 1.211-.307.665 0 1.163.273.498.269.776.818.277.546.277 1.381V136h-1.006v-4.091q0-.771-.401-1.202-.4-.434-1.099-.434-.482 0-.861.209-.375.209-.592.609-.218.4-.218.971m8.861-2.607v.852h-3.392v-.852zm-2.404-1.569h1.006v6.239q0 .426.124.639a.64.64 0 0 0 .324.281q.2.069.421.069.167 0 .273-.017l.171-.035.204.904a2.2 2.2 0 0 1-.75.119q-.426 0-.835-.183a1.66 1.66 0 0 1-.673-.558q-.264-.376-.265-.946zm6.591 8.25q-.947 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.031-1.202q.664-.435 1.551-.435.512 0 1.01.171.499.17.908.554.41.38.652 1.005.243.627.243 1.543v.426h-5.046v-.869h4.023q0-.554-.221-.989a1.67 1.67 0 0 0-.623-.686 1.75 1.75 0 0 0-.946-.251q-.6 0-1.039.298a1.96 1.96 0 0 0-.669.767 2.24 2.24 0 0 0-.235 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.396 0 .716-.111.323-.115.558-.341.234-.23.362-.571l.972.273a2.2 2.2 0 0 1-.516.869q-.362.371-.895.58a3.3 3.3 0 0 1-1.197.204m4.24-.136v-6.545h.971v.988h.069q.179-.486.647-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .528.017v1.023a3 3 0 0 0-.234-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.802 1.334V136zm6.391.153q-.622 0-1.13-.234a1.94 1.94 0 0 1-.805-.686q-.298-.452-.298-1.091 0-.562.221-.912.222-.353.593-.554a3.1 3.1 0 0 1 .818-.298 10 10 0 0 1 .908-.162q.596-.077.967-.115.375-.043.545-.141.175-.098.175-.341v-.034q0-.63-.345-.98-.341-.35-1.036-.349-.72 0-1.129.315-.409.316-.575.673l-.955-.341q.256-.596.682-.929.43-.336.938-.468.51-.137 1.005-.137.315 0 .725.077.413.072.797.303.387.23.643.694.255.465.256 1.245V136h-1.006v-.886h-.051a1.8 1.8 0 0 1-.341.456 2 2 0 0 1-.635.413q-.397.17-.967.17m.153-.903q.597 0 1.006-.234.413-.235.622-.605.213-.372.213-.78v-.921q-.064.077-.281.141-.213.06-.495.106a21 21 0 0 1-.963.128 4 4 0 0 0-.733.166 1.26 1.26 0 0 0-.545.337q-.205.221-.205.605 0 .525.388.793.393.264.993.264m7.341.886q-.92 0-1.585-.434a2.84 2.84 0 0 1-1.023-1.198q-.357-.762-.358-1.743 0-.996.367-1.76.37-.766 1.031-1.197.664-.435 1.551-.435.69 0 1.245.256.554.255.907.716.354.46.439 1.074h-1.005a1.56 1.56 0 0 0-.512-.793q-.391-.35-1.057-.349-.587 0-1.031.307a2 2 0 0 0-.686.856q-.243.55-.243 1.291 0 .759.239 1.321.243.562.682.874.443.31 1.039.311.393 0 .712-.136a1.47 1.47 0 0 0 .857-1.006h1.005a2.33 2.33 0 0 1-1.304 1.777q-.545.268-1.27.268m6.891-6.681v.852h-3.392v-.852zm-2.403-1.569h1.005v6.239q0 .426.124.639a.64.64 0 0 0 .324.281q.2.069.422.069.165 0 .272-.017l.171-.035.204.904a2.2 2.2 0 0 1-.75.119q-.426 0-.835-.183a1.66 1.66 0 0 1-.673-.558q-.264-.376-.264-.946zm3.916 8.114v-6.545h1.005V136zm.511-7.636a.71.71 0 0 1-.507-.201.64.64 0 0 1-.209-.481q0-.282.209-.482a.72.72 0 0 1 .507-.2q.294 0 .503.2a.64.64 0 0 1 .213.482.64.64 0 0 1-.213.481.7.7 0 0 1-.503.201m7.689 1.091L459.602 136h-1.022l-2.421-6.545h1.091l1.807 5.215h.068l1.807-5.215zm3.837 6.681q-.947 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.032-1.202q.664-.435 1.551-.435.511 0 1.01.171.498.17.907.554.41.38.652 1.005.243.627.243 1.543v.426h-5.045v-.869h4.023q0-.554-.222-.989a1.67 1.67 0 0 0-.622-.686 1.75 1.75 0 0 0-.946-.251q-.601 0-1.04.298a1.96 1.96 0 0 0-.669.767 2.25 2.25 0 0 0-.234 1.014v.58q0 .741.255 1.257.261.512.72.78.46.264 1.07.264.396 0 .716-.111.324-.115.558-.341.234-.23.362-.571l.972.273a2.15 2.15 0 0 1-.516.869 2.5 2.5 0 0 1-.894.58 3.3 3.3 0 0 1-1.198.204m10.274 0q-.92 0-1.585-.434a2.84 2.84 0 0 1-1.023-1.198q-.358-.762-.358-1.743 0-.996.367-1.76.37-.766 1.031-1.197.664-.435 1.551-.435.69 0 1.245.256.553.255.907.716t.439 1.074h-1.006a1.55 1.55 0 0 0-.511-.793q-.392-.35-1.057-.349-.588 0-1.031.307a2 2 0 0 0-.686.856q-.243.55-.243 1.291 0 .759.239 1.321.243.562.681.874a1.77 1.77 0 0 0 1.04.311q.393 0 .712-.136.32-.137.541-.392.222-.256.315-.614h1.006a2.33 2.33 0 0 1-1.304 1.777q-.546.268-1.27.268m6.703 0q-.886 0-1.555-.422a2.86 2.86 0 0 1-1.04-1.18q-.37-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.04-1.185.669-.422 1.555-.422.887 0 1.551.422a2.8 2.8 0 0 1 1.04 1.185q.375.763.375 1.785 0 1.014-.375 1.773a2.8 2.8 0 0 1-1.04 1.18q-.664.423-1.551.422m0-.903q.674 0 1.108-.345t.644-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.06 2.06 0 0 0-.644-.916q-.434-.35-1.108-.349-.673 0-1.108.349a2.07 2.07 0 0 0-.643.916 3.5 3.5 0 0 0-.209 1.223q0 .657.209 1.219t.643.908q.435.345 1.108.345m4.501.767v-6.545h.972v1.022h.085q.205-.523.661-.814.456-.294 1.095-.294.648 0 1.078.294.435.29.678.814h.068q.251-.507.754-.805.503-.303 1.206-.303.878 0 1.436.55.558.546.558 1.7V136h-1.005v-4.381q0-.725-.397-1.035a1.46 1.46 0 0 0-.933-.311q-.69 0-1.069.417-.38.413-.38 1.049V136h-1.022v-4.483q0-.558-.363-.899-.362-.345-.933-.345-.392 0-.733.209a1.6 1.6 0 0 0-.545.579 1.7 1.7 0 0 0-.205.848V136zm10.43 2.455v-9h.972v1.039h.119a9 9 0 0 1 .307-.434q.2-.268.571-.478.375-.213 1.014-.213.827 0 1.457.414.631.413.985 1.172t.354 1.789q0 1.04-.354 1.803-.354.759-.98 1.176-.627.413-1.445.413-.63 0-1.01-.208a1.9 1.9 0 0 1-.584-.482 7 7 0 0 1-.315-.452h-.085v3.461zm.989-5.728q0 .742.217 1.309.218.563.635.882.417.315 1.023.315.63 0 1.052-.332.426-.337.64-.904.216-.571.217-1.27 0-.69-.213-1.244a1.9 1.9 0 0 0-.635-.882q-.422-.328-1.061-.328-.613 0-1.032.311a1.86 1.86 0 0 0-.63.861q-.213.55-.213 1.282m8.983 3.409q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.039-1.18q-.371-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.039-1.185.67-.422 1.556-.422.887 0 1.551.422.668.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.83 2.83 0 0 1-1.04 1.18q-.664.423-1.551.422m0-.903q.673 0 1.108-.345.434-.345.643-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.07 2.07 0 0 0-.643-.916q-.435-.35-1.108-.349-.673 0-1.108.349-.435.35-.644.916a3.5 3.5 0 0 0-.209 1.223q0 .657.209 1.219t.644.908q.435.345 1.108.345m5.506-3.171V136h-1.005v-6.545h.971v1.022h.086q.23-.498.698-.801.469-.307 1.211-.307.665 0 1.163.273.498.269.776.818.276.546.277 1.381V136h-1.006v-4.091q0-.771-.401-1.202-.4-.434-1.099-.434-.481 0-.861.209-.375.209-.592.609-.218.4-.218.971m8.759 4.074q-.946 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.367-1.765 0-1.005.367-1.772a2.9 2.9 0 0 1 1.031-1.202q.664-.435 1.551-.435.512 0 1.01.171.499.17.908.554.41.38.652 1.005.243.627.243 1.543v.426h-5.046v-.869h4.023q0-.554-.221-.989a1.67 1.67 0 0 0-.623-.686 1.75 1.75 0 0 0-.946-.251q-.6 0-1.039.298a1.96 1.96 0 0 0-.669.767 2.24 2.24 0 0 0-.235 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.395 0 .716-.111.323-.115.558-.341.234-.23.362-.571l.972.273a2.2 2.2 0 0 1-.516.869 2.5 2.5 0 0 1-.895.58 3.3 3.3 0 0 1-1.197.204m5.245-4.074V136h-1.005v-6.545h.971v1.022h.085a1.9 1.9 0 0 1 .699-.801q.469-.307 1.211-.307.665 0 1.163.273.498.269.776.818.276.546.276 1.381V136h-1.005v-4.091q0-.771-.401-1.202-.4-.434-1.099-.434-.481 0-.861.209-.375.209-.592.609-.218.4-.218.971m8.861-2.607v.852h-3.392v-.852zm-2.404-1.569h1.006v6.239q0 .426.124.639a.64.64 0 0 0 .324.281q.2.069.421.069.166 0 .273-.017l.171-.035.204.904a2.2 2.2 0 0 1-.75.119q-.426 0-.835-.183a1.66 1.66 0 0 1-.673-.558q-.265-.376-.265-.946zm8.436 3.034-.904.256a1.7 1.7 0 0 0-.251-.439 1.2 1.2 0 0 0-.443-.358q-.282-.14-.72-.14-.601 0-1.002.277-.396.272-.396.694 0 .375.273.593.272.216.852.362l.971.238q.879.214 1.309.652.43.435.43 1.121 0 .562-.324 1.006a2.15 2.15 0 0 1-.895.699q-.574.255-1.338.255-1.001 0-1.657-.434-.657-.435-.831-1.27l.954-.239q.137.528.516.793.383.264 1.001.264.703 0 1.117-.298.417-.303.417-.725a.76.76 0 0 0-.238-.571q-.239-.234-.733-.349l-1.091-.256q-.9-.213-1.321-.66-.418-.452-.418-1.13 0-.554.311-.98.315-.426.857-.669a3 3 0 0 1 1.236-.243q.971 0 1.525.426.558.427.793 1.125M190.067 136v-8.727h3.051q.912 0 1.504.315.592.31.882.84.29.524.29 1.163 0 .563-.2.929a1.56 1.56 0 0 1-.52.579 2.4 2.4 0 0 1-.695.316v.085q.401.026.805.281.405.256.678.733.273.478.273 1.168 0 .656-.299 1.18-.297.525-.941.831-.644.307-1.675.307zm1.056-.938h2.097q1.035 0 1.47-.4.44-.405.439-.98a1.55 1.55 0 0 0-.226-.818 1.63 1.63 0 0 0-.643-.605 2 2 0 0 0-.989-.231h-2.148zm0-3.954h1.961q.477 0 .86-.188.388-.187.614-.528a1.4 1.4 0 0 0 .23-.801q0-.576-.4-.976-.401-.405-1.27-.405h-1.995zm8.538 5.045q-.622 0-1.129-.234a1.94 1.94 0 0 1-.806-.686q-.298-.452-.298-1.091 0-.562.222-.912.221-.353.592-.554a3.1 3.1 0 0 1 .818-.298 10 10 0 0 1 .908-.162q.597-.077.967-.115.375-.043.546-.141.174-.098.174-.341v-.034q0-.63-.345-.98-.34-.35-1.035-.349-.72 0-1.13.315-.408.316-.575.673l-.954-.341q.255-.596.681-.929.43-.336.938-.468a4 4 0 0 1 1.006-.137 4 4 0 0 1 .724.077q.414.072.797.303.388.23.643.694.256.465.256 1.245V136h-1.006v-.886h-.051a1.8 1.8 0 0 1-.341.456q-.238.243-.635.413-.396.17-.967.17m.153-.903q.597 0 1.006-.234a1.6 1.6 0 0 0 .835-1.385v-.921q-.063.077-.281.141a5 5 0 0 1-.494.106 21 21 0 0 1-.963.128q-.393.051-.733.166a1.26 1.26 0 0 0-.546.337q-.204.221-.204.605 0 .525.388.793.392.264.992.264m7.342.886q-.92 0-1.586-.434a2.83 2.83 0 0 1-1.022-1.198q-.358-.762-.358-1.743 0-.996.366-1.76.37-.766 1.032-1.197.665-.435 1.551-.435.69 0 1.244.256.554.255.908.716.353.46.439 1.074h-1.006a1.56 1.56 0 0 0-.511-.793q-.393-.35-1.057-.349-.588 0-1.032.307a2 2 0 0 0-.686.856q-.243.55-.243 1.291 0 .759.239 1.321.243.562.682.874.443.31 1.04.311.391 0 .711-.136a1.5 1.5 0 0 0 .542-.392 1.5 1.5 0 0 0 .315-.614h1.006a2.34 2.34 0 0 1-.422 1.044 2.36 2.36 0 0 1-.882.733q-.546.268-1.27.268m4.981-2.522-.017-1.245h.205l2.863-2.914h1.245l-3.051 3.085h-.086zM211.2 136v-8.727h1.005V136zm4.159 0-2.557-3.239.716-.699 3.119 3.938zm4.741 2.591q-.73 0-1.253-.188a2.7 2.7 0 0 1-.874-.485 2.7 2.7 0 0 1-.55-.64l.802-.562q.136.179.345.409.208.234.571.405.366.174.959.175.792 0 1.308-.384.515-.383.515-1.202v-1.329h-.085a6 6 0 0 1-.315.443 1.8 1.8 0 0 1-.58.464q-.375.201-1.014.201a2.73 2.73 0 0 1-1.423-.375 2.63 2.63 0 0 1-.993-1.091q-.362-.716-.362-1.739 0-1.005.353-1.751.354-.75.985-1.159.63-.414 1.457-.414.639 0 1.014.213.38.21.58.478.204.264.315.434h.103v-1.039h.971v6.733q0 .843-.383 1.372a2.2 2.2 0 0 1-1.023.779 3.9 3.9 0 0 1-1.423.252m-.034-3.597q.605 0 1.022-.277.418-.276.635-.797.218-.52.218-1.244 0-.707-.214-1.248a1.87 1.87 0 0 0-.63-.848q-.418-.307-1.031-.307-.64 0-1.066.324a1.97 1.97 0 0 0-.635.869 3.4 3.4 0 0 0-.209 1.21q0 .683.213 1.206.217.52.64.818.426.294 1.057.294M224.77 136v-6.545h.972v.988h.068q.179-.486.648-.788a1.9 1.9 0 0 1 1.056-.303 11 11 0 0 1 .529.017v1.023a3 3 0 0 0-.235-.038 2.3 2.3 0 0 0-.379-.03q-.477 0-.852.2a1.468 1.468 0 0 0-.801 1.334V136zm6.925.136q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.039-1.18q-.371-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.039-1.185.67-.422 1.556-.422.887 0 1.551.422.67.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.8 2.8 0 0 1-1.04 1.18q-.665.423-1.551.422m0-.903q.673 0 1.108-.345t.643-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.06 2.06 0 0 0-.643-.916q-.435-.35-1.108-.349-.673 0-1.108.349-.434.35-.644.916a3.5 3.5 0 0 0-.208 1.223q0 .657.208 1.219.21.563.644.908t1.108.345m8.626-1.909v-3.869h1.006V136h-1.006v-1.108h-.068a2.15 2.15 0 0 1-.716.848q-.486.345-1.228.345-.613 0-1.09-.268a1.87 1.87 0 0 1-.75-.818q-.273-.55-.273-1.385v-4.159h1.006v4.09q0 .716.4 1.143.405.426 1.031.426.375 0 .763-.192.392-.192.656-.588.269-.396.269-1.01m3.853-1.262V136h-1.005v-6.545h.971v1.022h.085a1.9 1.9 0 0 1 .699-.801q.47-.307 1.21-.307.665 0 1.164.273.499.269.775.818.277.546.277 1.381V136h-1.005v-4.091q0-.771-.401-1.202-.4-.434-1.099-.434-.482 0-.861.209-.376.209-.592.609-.218.4-.218.971m8.486 4.074q-.819 0-1.445-.413-.627-.417-.98-1.176-.354-.763-.354-1.803 0-1.031.354-1.789.354-.76.984-1.172.632-.414 1.458-.414.638 0 1.01.213.375.21.571.478.2.264.311.434h.085v-3.221h1.006V136h-.972v-1.006h-.119a6 6 0 0 1-.316.452q-.204.269-.583.482-.38.208-1.01.208m.136-.903q.605 0 1.023-.315.417-.32.635-.882.217-.567.217-1.309 0-.732-.213-1.282-.213-.555-.631-.861-.417-.312-1.031-.311-.639 0-1.065.328a1.96 1.96 0 0 0-.635.882q-.21.554-.209 1.244 0 .699.213 1.27.218.567.639.904.427.332 1.057.332m9.482-4.313-.904.256a1.7 1.7 0 0 0-.251-.439 1.2 1.2 0 0 0-.443-.358q-.282-.14-.721-.14-.6 0-1.001.277-.396.272-.396.694 0 .375.272.593.273.216.853.362l.971.238q.878.214 1.308.652.43.435.431 1.121 0 .562-.324 1.006a2.15 2.15 0 0 1-.895.699q-.574.255-1.338.255-1.002 0-1.658-.434-.656-.435-.831-1.27l.955-.239q.137.528.516.793.383.264 1.001.264.704 0 1.116-.298.418-.303.418-.725a.76.76 0 0 0-.239-.571q-.238-.234-.733-.349l-1.09-.256q-.9-.213-1.321-.66-.418-.452-.418-1.13 0-.554.311-.98.315-.426.857-.669a3 3 0 0 1 1.235-.243q.972 0 1.526.426.558.427.793 1.125"
      ></path>
      <path fill="url(#paint0_linear_1_10)" d="M128 150h196v1H128z"></path>
      <path fill="url(#paint1_linear_1_10)" d="M328 150h296v1H328z"></path>
      <path fill="url(#paint2_linear_1_10)" d="M628 150h296v1H628z"></path>
      <path fill="url(#paint3_linear_1_10)" d="M928 150h196v1H928z"></path>
      <path fill="url(#paint4_linear_1_10)" d="M1128 150h196v1h-196z"></path>
      <defs>
        <linearGradient
          id="paint0_linear_1_10"
          x1="128"
          x2="324"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#afc0b9" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#afc0b9"></stop>
          <stop offset="1" stopColor="#afc0b9" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint1_linear_1_10"
          x1="328"
          x2="624"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#afc0b9" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#afc0b9"></stop>
          <stop offset="1" stopColor="#afc0b9" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint2_linear_1_10"
          x1="628"
          x2="924"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#afc0b9" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#afc0b9"></stop>
          <stop offset="1" stopColor="#afc0b9" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint3_linear_1_10"
          x1="928"
          x2="1124"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#afc0b9" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#afc0b9"></stop>
          <stop offset="1" stopColor="#afc0b9" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint4_linear_1_10"
          x1="1128"
          x2="1324"
          y1="150.5"
          y2="150.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#afc0b9" stopOpacity="0"></stop>
          <stop offset="0.5" stopColor="#afc0b9"></stop>
          <stop offset="1" stopColor="#afc0b9" stopOpacity="0"></stop>
        </linearGradient>
      </defs>
    </svg>
  </React.Fragment>
);
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DropdownMenuTask = ({ todo, date, active_task }) => {
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const dispatch = useAppDispatch();
  return (
    <DropdownMenu
      open={showDropdownMenu}
      modal={false}
      onOpenChange={(change) => setShowDropdownMenu(change)}
    >
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <EllipsisVertical className="w-4 h-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => dispatch(addSubTask({ id: todo.id }))}>
          <Plus /> Add Subtask
        </DropdownMenuItem>
        {todo.status !== "completed" ? (
          <DropdownMenuItem
            className="text-green-600 focus:text-green-600 dark:text-green-400 dark:focus:text-white focus:bg-green-100 dark:focus:bg-green-900"
            onClick={() => {
              if (active_task) {
                const todo = active_task as Task;
                const sessionData = todo.sessions ? [...todo.sessions] : []; // Copy the old sessions array, or start with an empty array

                const notif = {
                  title: "Saatnya istirahat",
                  description:
                    "Sesion " + (sessionData.length + 1) + " has completed",
                };
                showNotification(notif.title, notif.description);

                dispatch(
                  updateTask({
                    id: todo.current.id,
                    key: date.timestamp,
                    updated_task: {
                      title: todo.current.title,
                      status: "completed",
                      completed_at: new Date().toISOString(),
                    },
                  }),
                );
              }
              dispatch(
                updateTask({
                  id: todo.id,
                  key: date.timestamp,
                  updated_task: {
                    title: todo.title,
                    status: "completed",
                    completed_at: new Date().toISOString(),
                  },
                }),
              );
            }}
          >
            <CircleCheckBig className="w-5 h-5" />
            Mark as done
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              dispatch(
                updateTask({
                  id: todo.id,
                  key: date.timestamp,
                  updated_task: {
                    title: todo.title,
                    status: "pending",
                    completed_at: null,
                  },
                }),
              );
            }}
          >
            <CirclePlus className="rotate-45 w-5 h-5" />
            Unmark as done
          </DropdownMenuItem>
        )}
        <AlertDialog onOpenChange={(change) => setShowDropdownMenu(change)}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-white focus:bg-red-100 dark:focus:bg-red-900"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 />
              Delete task
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                task
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  dispatch(
                    deleteTask({
                      id: todo.id,
                      key: date.timestamp,
                      title: todo.title,
                    }),
                  );
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DropdownMenuSubTask = ({
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
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const dispatch = useAppDispatch();
  return (
    <DropdownMenu
      open={showDropdownMenu}
      modal={false}
      onOpenChange={(change) => setShowDropdownMenu(change)}
    >
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <EllipsisVertical className="w-4 h-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <AlertDialog onOpenChange={(change) => setShowDropdownMenu(change)}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-white focus:bg-red-100 dark:focus:bg-red-900"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 />
              Delete subtask
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                task
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  dispatch(
                    deleteSubTask({
                      id: task_id,
                      key: timestamp,
                      sub_task_id,
                      title: task_title,
                      sub_task_title,
                    }),
                  );
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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

function ComboboxPopover({ task, subtask, date }: { task: Task }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    subtask ? subtask.category.color : task.category.color,
  );

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="[&_svg]:size-5 p-0 h-auto w-auto"
          >
            {selectedStatus ? (
              <>
                <Squircle fill={selectedStatus} color={selectedStatus} />
              </>
            ) : (
              <Squircle className="fill-primary text-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Change category..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {taskCategories.map((item) => (
                  <CommandItem
                    key={item.color}
                    value={item.color}
                    onSelect={(color) => {
                      setSelectedStatus(color);

                      const _category = taskCategories.find(
                        (item) => item.color === color,
                      );
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
                      setOpen(false);
                    }}
                  >
                    <Squircle
                      fill={item.color}
                      color={item.color}
                      className={cn(
                        "mr-2 h-5 w-5",
                        item.value === selectedStatus?.value
                          ? "opacity-100"
                          : "opacity-40",
                      )}
                    />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ComboboxPopoverFilter({ data, handler }) {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<String | null>(
    null,
  );

  const selected_category = taskCategories.find(
    (item) => item.color === selectedStatus,
  );
  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="[&_svg]:size-4">
            {selectedStatus ? (
              <>
                <span className="pb-0.5 font-medium">
                  {selected_category?.label}
                </span>
                <Squircle fill={selectedStatus} color={selectedStatus} />
              </>
            ) : (
              <React.Fragment>
                <span className="pb-0.5 font-medium">Filter task</span>
                <ChevronsUpDown className="text-muted-foreground" />
              </React.Fragment>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Change category..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.color}
                    value={item.color}
                    onSelect={(color) => {
                      setSelectedStatus(color);
                      handler(color);

                      const _category = taskCategories.find(
                        (item) => item.color === color,
                      );
                      setOpen(false);
                    }}
                  >
                    <Squircle
                      fill={item.color}
                      color={item.color}
                      className={cn(
                        "mr-2 h-5 w-5",
                        item.value === selectedStatus?.value
                          ? "opacity-100"
                          : "opacity-40",
                      )}
                    />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}

                {selectedStatus && (
                  <CommandItem
                    onSelect={() => {
                      setSelectedStatus(null);
                      handler("all");

                      setOpen(false);
                    }}
                  >
                    <X className={cn("mr-2 h-5 w-5")} />
                    <span>Delete filte</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
