import { RenderTracker } from "@/components/render-tracker.tsx";
import RichTextEditor from "@/components/text-editor";
import { Link, useBlocker } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import React, { useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import store from "@/store/store";
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
import QUOTES from "/public/data/quotes-islami.json";

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
    columnId: faker.helpers.arrayElement(["done", "todo"]),
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

  const initialTasks = await get_cache("daily-tasks");

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

interface Quote {
  id: string;
  arabic: string;
  arti: string;
}

// Fungsi untuk memilih quote secara acak
function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[randomIndex];
}

function Bismillah() {
  const [quran, setQuran] = React.useState("");

  async function get_data() {
    const res = await fetch("/quran/surah/112.json");
    const data = await res.json();
    setQuran(data.bismillah.arab);
    return data;
  }

  React.useEffect(() => {
    get_data();
  }, []);

  return (
    <div className="font-lpmq text-2xl sm:flex hidden text-center justify-center">
      {quran}
    </div>
  );
}

function Quotes() {
  const [quote, setQuote] = React.useState(null);

  React.useEffect(() => {
    setQuote(getRandomQuote());
    const intervalId = setInterval(() => {
      const randomQuote = getRandomQuote();
      setQuote(randomQuote);
    }, 60000); // 60000 ms = 1 menit

    // Cleanup: Menghentikan interval saat komponen di-unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (quote)
    return (
      <div>
        <blockquote className="my-3">
          <div className="font-lpmq text-2xl text-center w-full mx-auto my-2 ">
            {quote.arabic}
          </div>
          <p className="text-muted-foreground italic leading-relaxed text-center">
            {quote.arti}
          </p>
        </blockquote>
      </div>
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

        <KanbanBoardTasks
          tasks={todos}
          date={date_key}
          active_task={active_task}
          all_session={all_session}
          streak_data={streak_data}
        />

        <Unload data={data} date={date_key} active_task={active_task} />
        {/*<Debug data={todos} />*/}
        <div className="flex items-center justify-between">
          {(date_key.is_today || date_key.is_tomorrow) && (
            <AddTodo date={date_key} />
          )}
          <Popover>
            <PopoverTrigger>
              <Info className="w-4 h-4 " />
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
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
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
      <div className="relative inset-0  min-h-screen overflow-y-auto w-full bg-gray-200 dark:bg-gradient-to-tl dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto max-w-3xl w-full rounded-base p-3 bg-gray-200 dark:bg-gradient-to-tl dark:from-gray-950 dark:to-gray-900">
          <TodoNavigator data={todos} />
        </main>
      </div>
    );
  }
};

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

const Unload = ({ data }) => {
  function beforeUnload(e: BeforeUnloadEvent) {
    e.preventDefault();
    save_data_daily_tasks(data);
    event.returnValue = true;
  }

  React.useEffect(() => {
    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [data]);

  let blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname,
  );

  React.useEffect(() => {
    if (blocker.state === "blocked") {
      save_data_daily_tasks(data);
    }
  }, [blocker]);

  if (blocker.state === "blocked")
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your to-do list. Are you sure you want
              to leave with saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
        <Button variant="link" className="px-2">
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

  // Fungsi untuk menghitung total sesi dari seluruh todos
  const calculateTotalSessions = (todos: Array<{ sessions: Array<any> }>) => {
    return todos.reduce(
      (total_sessions, todo) =>
        total_sessions + todo.sessions.filter((d) => d?.done).length || 0,
      0,
    );
  };

  const total_sessions = calculateTotalSessions(todos);
  const calculateTotalTime = (
    todos: Array<{ sessions: Array<{ time: number }> }>,
  ) => {
    return todos.reduce((total_elapsed_time, todo) => {
      // Jumlahkan time dari setiap session di todo
      const sessionTime = todo.sessions.reduce(
        (sessionTotal, session) => sessionTotal + session?.elapsed_time || 0,
        0,
      );
      return total_elapsed_time + sessionTime; // Tambahkan session time ke total
    }, 0);
  };

  // Menghitung total waktu dari semua todo
  const total_elapsed_time = calculateTotalTime(todos);

  return (
    <div className="">
      {/*<RenderTracker name="TASK APP" stateName={totalTargetSessions} />*/}
      <section className="relative mx-auto flex items-center justify-between w-full items-center">
        <h1 className="bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 inline-block text-transparent bg-clip-text uppercase text-xl my-2 font-sans font-bold">
          MHDA
        </h1>

        <div className="flex-none flex items-center gap-2">
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

          <Link
            className="rounded-lg bg-green-500 bg-gradient-to-tr from-yellow-200 via-yellow-200/50 to-yellow-100/50 p-2 text-black shadow hover:via-yellow-300/60 hover:to-yellow-200/50"
            to="./garden"
          >
            <Trees />
          </Link>

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

      <Bismillah />
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
          className="animate-roll-reveal [animation-fill-mode:backwards] ml-auto flex w-full items-center  bg-gradient-to-l from-gray-100 via-gray-100/80 to-gray-100/0 py-2 pr-2 dark:from-gray-700 mt-1 mb-2 rounded-md"
        >
          <div className="mb-1 mt-3 flex justify-end">
            <div className="text-xs md:text-sm ml-3">
              Total focus time:{" "}
              <strong>{formatFocusTime(total_elapsed_time)}</strong>
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
        <div className="relative h-8 w-full rounded-md bg-gray-300 dark:bg-gray-600">
          <div className="flex h-8 items-center justify-end gap-1 px-2">
            Max 16
            <Rocket className="h-5 w-5" />
          </div>
          <div
            className={cn(
              "absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden rounded-l-md bg-gray-400 px-2 text-white transition-all duration-500 ease-in-out",
              totalTargetSessions >= 16 && "rounded-md",
            )}
            style={{
              width: `${(totalTargetSessions > 16 ? 16 / 16 : totalTargetSessions / 16) * 100}%`,
            }}
          >
            {totalTargetSessions}
            <Crosshair className="h-5 w-5 animate-pulse" />
          </div>
          <div
            className={cn(
              "z-10 absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden bg-green-400 px-2 text-gray-600 rounded-l-md transition-all duration-500 ease-in-out",
              totalTargetSessions >= 16 && "rounded-md",
            )}
            style={{
              width: `${(total_sessions > 16 ? 16 / 16 : total_sessions / 16) * 100}%`,
            }}
          >
            <div
              className="flex shrink-0 items-center gap-1 text-sm"
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
      <Plus className="h-7 w-7" /> Add Task
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
  todos,
  date,
  active_task,
}: { todos: Task[]; date: any; active_task: Task }) => {
  const dispatch = useAppDispatch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  let progress = 0;

  const pauseTodo = todos.find((todo) => todo.status === "paused");

  useEffect(() => {
    if (active_task) {
      const task = active_task;

      const last_session_index = task?.sessions?.length - 1;
      const last_session = task?.sessions[last_session_index];
      const last_start = last_session?.log
        ?.filter((d) => d.name === "start") // Memfilter log yang bernama "start"
        .slice(-1)[0]; // Mengambil elemen terakhir

      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          const updatedTotalTime = Date.now() - last_start.time;

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
              updateSessionTask({
                id: task.id,
                key: date.timestamp,
                updated_session_task: {
                  id: last_session.id,
                  elapsed_time: TWENTY_FIVE_MINUTES,
                  done: true,
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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        document.title = "Todo";
      }
    };
  }, [active_task]); // Make sure the effect reruns when active_task changes

  return (
    <div className="flex items-start justify-between gap-x-3 pt-2 px-4 md:gap-x-5 h-[130px]">
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
                            const last_session_index =
                              active_task?.sessions?.length - 1;
                            const last_session =
                              active_task?.sessions[last_session_index];
                            const last_start = last_session?.log
                              ?.filter((d) => d.name === "start") // Memfilter log yang bernama "start"
                              .slice(-1)[0]; // Mengambil elemen terakhir

                            const count_pause = last_session?.log?.filter(
                              (d) => d.name === "pause",
                            ).length; // Memfilter log yang bernama "start"
                            if (count_pause === 2)
                              return toast({
                                title: "Error",
                                description: `Maximal paused only two times`,
                              });
                            if (!last_start) return;

                            const elapsed_time = Date.now() - last_start.time;

                            dispatch(
                              updateSessionTask({
                                id: active_task.id,
                                key: date.timestamp,
                                updated_session_task: {
                                  id: last_session.id,
                                  done: false,
                                  elapsed_time:
                                    elapsed_time + last_session.elapsed_time,
                                  log: [
                                    ...last_session.log,
                                    { time: Date.now(), name: "pause" },
                                  ],
                                },
                              }),
                            );
                          }
                        : () => {
                            const last_session_index =
                              pauseTodo?.sessions?.length - 1;
                            const last_session =
                              pauseTodo?.sessions[last_session_index];
                            dispatch(
                              updateSessionTask({
                                id: pauseTodo.id,
                                key: date.timestamp,
                                updated_session_task: {
                                  id: last_session.id,
                                  elapsed_time: last_session.elapsed_time,
                                  done: false,
                                  log: [
                                    ...last_session.log,
                                    { time: Date.now(), name: "start" },
                                  ],
                                },
                              }),
                            );
                          }
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
                  className="animate-roll-reveal [animation-fill-mode:backwards] todo-progress mx-auto flex justify-center font-bold transition-all duration-500 ease-in-out"
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
              {active_task?.title !== "" ? (
                <div dangerouslySetInnerHTML={{ __html: active_task.title }} />
              ) : (
                "Untitled"
              )}
            </div>

            <div className="h-2.5">
              <div className="absolute flex gap-1">
                {new Array(16).fill(null).map((_, index) => {
                  const active = active_task?.sessions?.filter(
                    (d) => d?.done,
                  )?.length;

                  return (
                    <div className="relative inline-flex gap-1" key={index}>
                      <div
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 cursor-pointer rounded-full ",
                          "transition-all duration-500 animate-roll-reveal [animation-fill-mode:backwards] ",
                          active_task?.target_sessions >= index + 1 &&
                            "bg-gray-400",
                          active > index && "bg-green-400",
                        )}
                      />
                      {active === index && (
                        <React.Fragment>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full absolute -top-0.5 left-0 animate-ping" />
                          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full absolute top-0 left-0 animate-pulse" />
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
              <button
                onClick={() => {
                  const todo = active_task as Task;
                  const sessionData = todo.sessions ? [...todo.sessions] : []; // Copy the old sessions array, or start with an empty array

                  const notif = {
                    title: "Saatnya istirahat",
                    description:
                      "Sesion " + (sessionData.length + 1) + " has completed",
                  };
                  showNotification(notif.title, notif.description);
                  const task = active_task;

                  const last_session_index = task?.sessions?.length - 1;
                  const last_session = task?.sessions[last_session_index];
                  const last_start = last_session?.log
                    ?.filter((d) => d.name === "start") // Memfilter log yang bernama "start"
                    .slice(-1)[0]; // Mengambil elemen terakhir

                  const elapsed_time = Date.now() - last_start.time;
                  dispatch(
                    updateSessionTask({
                      id: todo.id,
                      key: date.timestamp,
                      updated_session_task: {
                        id: last_session.id,
                        elapsed_time: elapsed_time + last_session.elapsed_time,
                        done: true,
                      },
                    }),
                  );
                  dispatch(
                    updateTask({
                      id: active_task.id,
                      key: date.timestamp,
                      updated_task: {
                        title: active_task.title,
                        status: "done",
                        done: Date.now(),
                      },
                    }),
                  );
                }}
                className="items-center justify-center rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex h-auto gap-1 px-1.5 py-1 text-sm bg-green-400 hover:bg-green-500 text-gray-600"
              >
                <CircleCheckBig className="h-5 w-5" />
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
            "sm:block hidden relative w-[140px] pt-3",
            active_task &&
              "animate-roll-reveal [animation-fill-mode:backwards]",
          )}
        >
          {/*<img src="/rocket.gif" alt="Rocket" className="animate-pulse" />*/}
          <HorseAnimation />
        </div>
      ) : (
        <div
          style={{ animationDelay: `0.1s` }}
          className={cn(
            "sm:block hidden relative w-[80px] pt-1",
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
      <Trash2 />
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
  Clock,
  Flag,
  MoreHorizontal,
  // CheckCircle2,
  // Circle,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function StatusDot({ color }: { color?: string }) {
  if (color) return <Squircle fill={color} color={color} />;

  const gradientId = "gradient1";

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Definisikan Gradien */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: color || "#FFF", stopOpacity: 1 }}
          />
          <stop offset="100%" style={{ stopColor: "#000", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Gambar objek yang menggunakan gradien */}
      <circle cx="20" cy="20" r="18" fill={`url(#${gradientId})`} />
    </svg>
  );
}

function SelectFilter({ value, setValue, tasks }) {
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
    <div className="flex items-end w-full justify-end mb-2">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="max-w-[150px] p-0 flex gap-x-1 items-center border-none focus:ring-0 shadow-none w-fit p-0 h-6 text-muted-foreground">
          <SelectValue placeholder="Filter Category" />
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
          <SelectItem value="all">
            <span className="flex items-center gap-1 mr-2">
              <StatusDot />
              <span className="truncate">
                All Category{" "}
                {tasks.length > 0 && <span>( {tasks.length} )</span>}
              </span>
            </span>
          </SelectItem>
          {mergedCategories.map((item, index) => (
            <SelectItem key={index} value={item.color}>
              <span className="flex items-center gap-1 mr-2">
                <StatusDot color={item.color} />
                <span className="truncate">
                  {item.label} ( {item.count} )
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
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
function KanbanBoardTasks({ tasks: _tasks, date, active_task }) {
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
    debounceOnChange(); // Call the debounced function whenever tasks change
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
            return taskMatches && filteredSubTasks.length > 0;
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
      <SelectFilter value={value} setValue={setValue} tasks={tasks} />
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
          <Quotes />
          <p className="text-center text-gray-600 leading-relaxed flex gap-x-2 items-center justify-center">
            {value !== "all" && (
              <span className="flex gap-x-2">
                <StatusDot color={value} />
              </span>
            )}{" "}
            No {date.is_tomorrow && " planing "} task in {date.q}
          </p>
        </div>
      )}
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
            {...attributes}
            {...listeners}
            className="text-secondary-foreground/50 h-auto cursor-grab absolute top-1/2 transform -translate-y-1/2 left-2  z-20 h-5 w-5 mt-1"
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

    const totalSessionTime = todo.sessions.reduce(
      (total_elapsed_time, session) =>
        total_elapsed_time + session?.elapsed_time || 0,
      0,
    );
    const is_today = date.is_today;
    const dispatch = useAppDispatch();

    return (
      <Collapsible
        {...(active_task ? { open: active_task.id === task.id } : {})}
        defaultOpen={false}
      >
        <div
          style={{ animationDelay: `${index * 0.07}s` }}
          className={cn(
            "animate-roll-reveal [animation-fill-mode:backwards] p-2 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 py-2 mb-2 bg-gray-50 rounded-lg shadow-md",
            active_task && todo.status !== "progress"
              ? "bg-white text-muted-foreground opacity-60"
              : active_task && todo.status === "progress"
                ? "bg-orange-100 dark:bg-orange-400 bg-gradient-to-l from-gray-50 dark:from-orange-950 opacity-100"
                : todo.status === "done"
                  ? "bg-green-100 dark:bg-green-900 bg-gradient-to-l via-white dark:via-black from-green-50 dark:from-green-950 opacity-100"
                  : "",
          )}
        >
          <div className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400">
            {children}
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
                  ) : todo.status === "progress" ? (
                    <button
                      onClick={() => {
                        const last_session_index = task?.sessions?.length - 1;
                        const last_session = task?.sessions[last_session_index];
                        const last_start = last_session?.log
                          ?.filter((d) => d.name === "start") // Memfilter log yang bernama "start"
                          .slice(-1)[0]; // Mengambil elemen terakhir

                        const count_pause = last_session?.log?.filter(
                          (d) => d.name === "pause",
                        ).length; // Memfilter log yang bernama "start"
                        if (count_pause === 2)
                          return toast({
                            title: "Error",
                            description: `Maximal paused only two times`,
                          });
                        if (!last_start) return;

                        const elapsed_time = Date.now() - last_start.time;

                        dispatch(
                          updateSessionTask({
                            id: todo.id,
                            key: date.timestamp,
                            updated_session_task: {
                              id: last_session.id,
                              done: false,
                              elapsed_time:
                                elapsed_time + last_session.elapsed_time,
                              log: [
                                ...last_session.log,
                                { time: Date.now(), name: "pause" },
                              ],
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
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const last_session_index = task?.sessions?.length - 1;
                          const last_session =
                            task?.sessions[last_session_index];
                          const last_pause = last_session?.log
                            ?.filter((d) => d.name === "pause") // Memfilter log yang bernama "start"
                            .slice(-1)[0]; // Mengambil elemen terakhir
                          const last_done = last_session?.done;

                          if (!last_session || last_done) {
                            dispatch(
                              updateSessionTask({
                                id: todo.id,
                                key: date.timestamp,
                                updated_session_task: {
                                  id: Date.now(),
                                  elapsed_time: 0,
                                  done: false,
                                  log: [{ time: Date.now(), name: "start" }],
                                },
                              }),
                            );
                          } else {
                            dispatch(
                              updateSessionTask({
                                id: todo.id,
                                key: date.timestamp,
                                updated_session_task: {
                                  id: last_session.id,
                                  elapsed_time: last_session.elapsed_time,
                                  done: false,
                                  log: [
                                    ...last_session.log,
                                    { time: Date.now(), name: "start" },
                                  ],
                                },
                              }),
                            );
                          }
                        }}
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 pl-0.5 text-white",
                          active_task &&
                            "animate-roll-reveal [animation-fill-mode:backwards]",
                        )}
                      >
                        <Play className="h-5 w-5" />
                      </button>

                      {/*<button
                        type="button"
                        onClick={() => {
                          const last_session_index = task?.sessions?.length - 1;
                          const last_session =
                            task?.sessions[last_session_index];
                          const last_start = last_session?.log
                            ?.filter((d) => d.name === "start") // Memfilter log yang bernama "start"
                            .slice(-1)[0]; // Mengambil elemen terakhir

                          const elapsed_time = Date.now() - last_start.time;
                          dispatch(
                            updateSessionTask({
                              id: todo.id,
                              key: date.timestamp,
                              updated_session_task: {
                                id: last_session.id,
                                done: true,
                                elapsed_time:
                                  elapsed_time + last_session.elapsed_time,
                              },
                            }),
                          );
                        }}
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 pl-0.5 text-white",
                          active_task &&
                            "animate-roll-reveal [animation-fill-mode:backwards]",
                        )}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const last_session_index = task?.sessions?.length - 1;
                          const last_session =
                            task?.sessions[last_session_index];
                          const last_start = last_session?.log
                            ?.filter((d) => d.name === "start") // Memfilter log yang bernama "start"
                            .slice(-1)[0]; // Mengambil elemen terakhir

                          const elapsed_time =
                            last_session.elapsed_time !== 0
                              ? last_session.elapsed_time
                              : Date.now() - last_start.time;

                          dispatch(
                            updateSessionTask({
                              id: todo.id,
                              key: date.timestamp,
                              updated_session_task: {
                                id: last_session.id,
                                elapsed_time: elapsed_time,
                                done: true,
                              },
                            }),
                          );
                        }}
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 pl-0.5 text-white",
                          active_task &&
                            "animate-roll-reveal [animation-fill-mode:backwards]",
                        )}
                      >
                        X<CheckCircle2 className="h-5 w-5" />
                      </button>*/}
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
            </div>
          </div>
          <div className="w-full group">
            <div className="relative flex w-full items-start">
              <AppRichTextEditor
                defaultValue={todo.title}
                handler={(v) => {
                  dispatch(
                    updateTask({
                      id: task.id,
                      key: date.timestamp,
                      updated_task: {
                        title: v,
                      },
                    }),
                  );
                }}
              />
              {/*<AutosizeTextarea
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
              />*/}
              <div className="ml-auto flex items-center gap-2 pr-2 pt-2">
                {todo.sub_tasks.length > 0 && (
                  <CollapsibleTrigger asChild>
                    <Badge
                      className="flex flex-1 items-center gap-1 justify-between text-sm font-medium transition-all text-left [&[data-state=close]>svg.chev]:block [&[data-state=open]>svg.cross]:block [&[data-state=open]>svg.chev]:hidden"
                      variant="success"
                    >
                      <ChevronsUpDown className="chev h-4 w-4 shrink-0 transition-all duration-200" />
                      <X className="cross hidden h-4 w-4 shrink-0 transition-all duration-200" />
                      <span>{todo.sub_tasks.length}</span>
                    </Badge>
                  </CollapsibleTrigger>
                )}
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
                      {todo.status !== "done" ? (
                        <DropdownMenuItem
                          className="text-green-600 focus:text-green-600 focus:bg-green-100 dark:text-green-400 dark:focus:text-green-400 dark:focus:bg-green-800"
                          onClick={() => {
                            if (active_task) {
                              const todo = active_task as Task;
                              const sessionData = todo.sessions
                                ? [...todo.sessions]
                                : []; // Copy the old sessions array, or start with an empty array

                              const notif = {
                                title: "Saatnya istirahat",
                                description:
                                  "Sesion " +
                                  (sessionData.length + 1) +
                                  " has completed",
                              };
                              showNotification(notif.title, notif.description);

                              const last_session_index =
                                task?.sessions?.length - 1;
                              const last_session =
                                task?.sessions[last_session_index];
                              const last_start = last_session?.log
                                ?.filter((d) => d.name === "start") // Memfilter log yang bernama "start"
                                .slice(-1)[0]; // Mengambil elemen terakhir

                              const elapsed_time = Date.now() - last_start.time;
                              dispatch(
                                updateSessionTask({
                                  id: todo.id,
                                  key: date.timestamp,
                                  updated_session_task: {
                                    id: last_session.id,
                                    elapsed_time:
                                      elapsed_time + last_session.elapsed_time,
                                    done: true,
                                  },
                                }),
                              );
                            }
                            dispatch(
                              updateTask({
                                id: task.id,
                                key: date.timestamp,
                                updated_task: {
                                  title: todo.title,
                                  status: "done",
                                  done: Date.now(),
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
                                id: task.id,
                                key: date.timestamp,
                                updated_task: {
                                  title: todo.title,
                                  status: "draft",
                                  done: null,
                                },
                              }),
                            );
                          }}
                        >
                          <CirclePlus className="rotate-45 w-5 h-5" />
                          Unmark as done
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
                    {new Array(16).fill(null).map((_, index) => {
                      const active = todo?.sessions?.filter(
                        (d) => d?.done,
                      )?.length;

                      return (
                        <div className="relative inline-flex gap-1" key={index}>
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
                              active >= index + 1
                                ? "bg-green-400"
                                : todo?.target_sessions >= index + 1
                                  ? "bg-gray-500"
                                  : todo.status === "progress" &&
                                      active === index
                                    ? "bg-yellow-400"
                                    : "bg-gray-300  hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                            )}
                          />

                          {todo.status === "progress" && active === index && (
                            <React.Fragment>
                              <div className="w-3 h-3 bg-yellow-400 rounded-full absolute top-0 left-0 animate-ping" />
                              <div className="h-[12px] w-[12px]  bg-yellow-400 rounded-full absolute top-0 left-0 animate-pulse" />
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
                      className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-red-400 text-white flex items-center justify-center hidden group-hover:flex  animate-roll-reveal [animation-fill-mode:backwards] "
                    >
                      <X />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-x-1.5 pr-2 text-sm mt-1">
                  <div className="flex items-center gap-x-1.5">
                    {task.status !== "progress" && task.sessions.length > 0 && (
                      <Popover>
                        <PopoverTrigger>
                          <History className="w-4 h-4 text-muted-foreground" />
                        </PopoverTrigger>
                        <PopoverContent className="max-h-[40vh] overflow-y-auto py-0">
                          <TimelineInfo sessions={task.sessions} />
                        </PopoverContent>
                      </Popover>
                    )}
                    <div
                      className={
                        todo?.status === "progress" ? "todo-progress" : ""
                      }
                    >
                      {new Date(totalSessionTime).toISOString().substr(11, 8)}
                    </div>
                  </div>
                  <SelectDemo task={task} date={date} />
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

        {todo.sub_tasks.length > 0 && (
          <div>
            <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down transition-all duration-500 space-y-2 text-text font-base mt-1">
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
          {...attributes}
          {...listeners}
          className="text-secondary-foreground/50 h-auto cursor-grab absolute top-1/2 transform -translate-y-1/2 left-0  z-20 h-5 w-5 mt-1"
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
        style={{ animationDelay: `${index * 0.07}s` }}
        className={cn(
          "animate-slide-top [animation-fill-mode:backwards] ml-2.5 sm:ml-5 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 bg-gray-50 rounded-lg py-2 mb-1.5 shadow-md",
          active_task && todo.status !== "progress"
            ? "bg-white/40 text-muted-foreground opacity-80"
            : active_task && todo.status === "progress"
              ? "bg-orange-100 dark:bg-orange-400 bg-gradient-to-l from-gray-50 dark:from-orange-950 opacity-100"
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
          {children}
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
            <AppRichTextEditor
              defaultValue={subtask.title}
              handler={(v) => {
                dispatch(
                  updateSubTask({
                    id: task.id,
                    key: date.timestamp,
                    sub_task_id: subtask.id,
                    updated_sub_task: {
                      title: v,
                    },
                  }),
                );
              }}
            />
            {/*<AutosizeTextarea
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
            />*/}
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
                  <SelectDemo task={task} subtask={subtask} date={date} />
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

const TimelineInfo: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  // Mengambil sesi yang sudah diformat
  const formattedSessions = sessions.flatMap((session, index) =>
    getSessionTimes(session, index),
  );

  return (
    <div>
      <ul
        role="list"
        className="divide-y divide-gray-200 bg-background p-2 rounded-md"
      >
        {formattedSessions.map((sessionInfo, index) => (
          <li key={index} className="py-2">
            <div className="flex space-x-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{sessionInfo.name}</h3>
                  <p className="text-sm text-gray-500">
                    {sessionInfo.duration}
                  </p>
                </div>
                {sessionInfo.timeRange?.map((d, index) => (
                  <p key={index} className="text-sm text-gray-500">
                    <span>{d.start}</span>
                    <span>-</span>
                    <span>{d.end}</span>
                    <span className="text-xs font-bold"> ( {d.duration} )</span>
                  </p>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

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

function AppRichTextEditor({ defaultValue, handler }) {
  return (
    <div className="w-full">
      <RichTextEditor value={defaultValue} onChange={handler} />
    </div>
  );
}
