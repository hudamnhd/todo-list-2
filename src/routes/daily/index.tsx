import { RenderTracker } from "@/components/render-tracker.tsx";
import { Link } from "react-router-dom";
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
  Squircle,
  Trash,
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
import { Button } from "@/components/ui/button";
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
    // total_time: sessions.reduce((total, session) => total + session.time, 0),
    id: faker.number.int(),
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
        <KanbanBoard
          tasks={todos}
          date={date_key}
          active_task={active_task}
          all_session={all_session}
          streak_data={streak_data}
        />

        {(date_key.is_today || date_key.is_tomorrow) && (
          <AddTodo date={date_key} />
        )}
        {/*<Debug data={todos} />*/}
        <Unload data={data} date={date_key} active_task={active_task} />
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
      {/*<RenderTracker name="TASK APP" stateName={totalTargetSessions} />*/}
      <section className="relative mx-auto flex items-center justify-between w-full items-center">
        <h1 className="bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 inline-block text-transparent bg-clip-text uppercase text-xl my-2 font-sans font-bold">
          MHDA
        </h1>
        <div className="ml-auto flex items-center gap-2">
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
// const TWENTY_FIVE_MINUTES = 1 * 60 * 1000; // 25 menit dalam milidetik
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
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          const elapsedTime = active_task.start_at
            ? Date.now() - new Date(active_task.start_at).getTime()
            : 0;

          const updatedTotalTime = active_task.total_time + elapsedTime;
          const estimate_time_done =
            Date.now() + TWENTY_FIVE_MINUTES - updatedTotalTime;

          progress = Math.min(
            (updatedTotalTime / TWENTY_FIVE_MINUTES) * circumference,
            circumference,
          );

          const timer = new Date(updatedTotalTime || active_task.total_time)
            .toISOString()
            .substr(14, 5);

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

            const sessionData = active_task.sessions
              ? [...active_task.sessions]
              : [];
            const notif = {
              title: "Saatnya istirahat",
              description:
                "Sesion " + (sessionData.length + 1) + " has completed",
            };
            showNotification(notif.title, notif.description);

            sessionData.push({
              date: new Date(estimate_time_done).toISOString(),
              time: TWENTY_FIVE_MINUTES as number,
            });

            dispatch(
              updateSessionTask({
                id: active_task.id as number,
                key: date.timestamp as number,
                updated_session_task: sessionData,
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
    <div className="flex items-start justify-between gap-x-3 pt-4 px-4 md:gap-x-5 mt-2 h-[130px]">
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
              {active_task?.title !== "" ? active_task.title : "Untitled"}
            </div>

            <div className="h-2.5">
              <div className="absolute flex gap-1">
                {new Array(16).fill(null).map((_, index) => (
                  <div className="relative inline-flex gap-1" key={index}>
                    <div
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 cursor-pointer rounded-full ",
                        "transition-all duration-500 animate-roll-reveal [animation-fill-mode:backwards] ",
                        active_task?.target_sessions >= index + 1 &&
                          "bg-gray-400",
                        active_task?.sessions?.length > index && "bg-green-400",
                      )}
                    />
                    {active_task?.sessions?.length === index && (
                      <React.Fragment>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full absolute -top-0.5 left-0 animate-ping" />
                        <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full absolute top-0 left-0 animate-pulse" />
                      </React.Fragment>
                    )}
                  </div>
                ))}
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
                  const elapsedTime = todo.start_at
                    ? Date.now() - new Date(todo.start_at).getTime()
                    : 0;
                  const newTotalTime = todo.total_time + elapsedTime;

                  const notif = {
                    title: "Saatnya istirahat",
                    description:
                      "Sesion " + (sessionData.length + 1) + " has completed",
                  };
                  showNotification(notif.title, notif.description);

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
                  dispatch(
                    updateTask({
                      id: active_task.id,
                      key: date.timestamp,
                      updated_task: {
                        status: "done",
                        end_at: new Date().toISOString(),
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
            "sm:block hidden relative w-[80px] pt-3",
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
          <Filter className="w-4 h-4 flex-none" />
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

function KanbanBoard({ tasks, date, active_task }) {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const dispatch = useAppDispatch();
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
          <BoardColumn
            tasks={filteredTasks}
            date={date}
            active_task={active_task}
          />
        </DndContext>
      ) : (
        <div className="">
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
    // const data = event.active.data.current;
  }

  function onDragEnd(event: DragEndEvent) {
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

function KanbanBoardSubTasks({ sub_tasks, task, date, active_task }) {
  const dispatch = useAppDispatch();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <BoardColumnSubTasks
        sub_tasks={sub_tasks}
        date={date}
        task={task}
        active_task={active_task}
      />
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    // const data = event.active.data.current;
  }

  function onDragEnd(event: DragOverEvent) {
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
      function setter(sub_tasks: Task[]) {
        const activeIndex = sub_tasks.findIndex((t) => t.id === activeId);
        const overIndex = sub_tasks.findIndex((t) => t.id === overId);

        return arrayMove(sub_tasks, activeIndex, overIndex);
      }
      const updatedTasks = setter(sub_tasks);
      dispatch(
        updateSubTasksColumn({
          id: task.id,
          key: date.timestamp,
          updated_sub_task: updatedTasks,
        }),
      );
    }
  }
}

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";

interface BoardColumnProps {
  tasks: Task[];
  isOverlay?: boolean;
}

function BoardColumn({ tasks, date, active_task }: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  return (
    <SortableContext items={tasksIds}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          date={date}
          active_task={active_task}
          task={task}
        />
      ))}
    </SortableContext>
  );
}

function BoardColumnSubTasks({
  sub_tasks,
  date,
  task,
  active_task,
}: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return sub_tasks.length > 0 && sub_tasks.map((sub_task) => sub_task.id);
  }, [sub_tasks]);

  return (
    <SortableContext items={tasksIds}>
      {sub_tasks.map((sub_task, index) => (
        <SubTaskCard
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

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

function TaskCard({ date, active_task, task, isOverlay }: TaskCardProps) {
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
        "w-full mb-2 animate-roll-reveal [animation-fill-mode:backwards]",
        variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        }),
      )}
    >
      <Collapsible
        {...(active_task ? { open: active_task.id === task.id } : {})}
        defaultOpen={false}
      >
        <div
          className={cn(
            "p-2 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 py-2 mb-2 bg-gray-50 rounded-lg shadow-md",
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
            <Button
              variant={"link"}
              {...attributes}
              {...listeners}
              className="text-secondary-foreground/50 h-auto cursor-grab absolute top-1/2 transform -translate-y-1/2 left-2  z-20 h-5 w-5 mt-1"
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
                      {todo.status !== "done" && (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() => {
                            if (active_task) {
                              const todo = active_task as Task;
                              const sessionData = todo.sessions
                                ? [...todo.sessions]
                                : []; // Copy the old sessions array, or start with an empty array
                              const elapsedTime = todo.start_at
                                ? Date.now() - new Date(todo.start_at).getTime()
                                : 0;
                              const newTotalTime =
                                todo.total_time + elapsedTime;

                              const notif = {
                                title: "Saatnya istirahat",
                                description:
                                  "Sesion " +
                                  (sessionData.length + 1) +
                                  " has completed",
                              };
                              showNotification(notif.title, notif.description);

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
                            dispatch(
                              updateTask({
                                id: task.id,
                                key: date.timestamp,
                                updated_task: {
                                  title: todo.title,
                                  status: "done",
                                },
                              }),
                            );
                          }}
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
              <KanbanBoardSubTasks
                task={task}
                sub_tasks={todo.sub_tasks}
                date={date}
                active_task={active_task}
              />
            </CollapsibleContent>
          </div>
        )}
      </Collapsible>
    </div>
  );
}

function SubTaskCard({
  index,
  subtask,
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

  const todo = task;

  const dispatch = useAppDispatch();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full mb-2 animate-roll-reveal [animation-fill-mode:backwards]",
        variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        }),
      )}
    >
      <div
        className={cn(
          "ml-2.5 sm:ml-5 relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 bg-gray-50 rounded-lg py-2 mb-1.5 shadow-md",
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
          <Button
            variant={"link"}
            {...attributes}
            {...listeners}
            className="text-secondary-foreground/50 h-auto cursor-grab absolute top-1/2 transform -translate-y-1/2 left-0  z-20 h-5 w-5 mt-1"
          >
            <span className="sr-only">Move task</span>
            <GripVertical />
          </Button>
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
                  <SelectDemo task={task} subtask={subtask} date={date} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Active, DataRef, Over } from "@dnd-kit/core";
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
