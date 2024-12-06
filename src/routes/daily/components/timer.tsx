import React, { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { get_cache, set_cache, delete_cache } from "@/lib/cache-client";
import { showNotification } from "./notifications";
import { StopwatchIcon, DotsVerticalIcon } from "@radix-ui/react-icons";

type TimerProps = {
  task: { id: string; start_at: string }; // contoh properti task dengan waktu awal
};

export const Timer: React.FC<TimerProps> = ({
  task,
  summary,
  handler,
  children,
}) => {
  if (!task)
    return (
      <Card
        style={{ animationDelay: `0.1s` }}
        className="animate-roll-reveal [animation-fill-mode:backwards] md:fixed bottom-4 right-4 bg-bg dark:bg-darkBg z-20"
      >
        <CardHeader className="border-b dark:shadow-navDark shadow-nav bg-main relative">
          <CardTitle className="flex items-center gap-x-2 font-heading capitalize">
            Belum ada task progress
          </CardTitle>
          <CardDescription>
            {summary?.done} dari {summary?.total} Task Done
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-x-3 pt-4 md:gap-x-5">
            <div className="relative w-full">{children}</div>
          </div>
        </CardContent>
      </Card>
    );
  const TWENTY_FIVE_MINUTES = 25 * 60 * 1000; // 25 menit dalam milidetik
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastPauseTime, setLastPauseTime] = useState(0);
  const [pauseStart, setPauseStart] = useState<number | null>(null);

  const radius = 40; // Radius lingkaran
  const circumference = 2 * Math.PI * radius; // Keliling lingkaran
  const saveStateToLocalForage = async (
    taskId: string,
    state: {
      isPaused: boolean;
      lastPauseTime: number;
      pauseStart: number | null;
    },
  ) => {
    const allStates =
      (await get_cache<{ [id: string]: any }>("timerStates")) || {};
    allStates[taskId] = state;
    await set_cache("timerStates", allStates);
  };

  const deleteCacheLocalForage = async (taskId: string) => {
    const allStates =
      (await get_cache<{ [id: string]: any }>("timerStates")) || {};
    delete allStates[taskId];
    await set_cache("timerStates", allStates);
  };

  const loadStateFromLocalForage = async (taskId: string) => {
    const allStates = await get_cache<{ [id: string]: any }>("timerStates");
    const savedState = allStates?.[taskId];

    if (savedState) {
      setIsPaused(savedState.isPaused);
      setLastPauseTime(savedState.lastPauseTime);
      setPauseStart(savedState.pauseStart);
    }
  };

  useEffect(() => {
    loadStateFromLocalForage();
  }, []);

  useEffect(() => {
    const startDate = new Date(task.start_at);
    let intervalId: NodeJS.Timeout;

    const updateElapsedTime = () => {
      const currentTime = new Date();
      const timeElapsed =
        currentTime.getTime() - startDate.getTime() - lastPauseTime;
      setElapsedTime(timeElapsed);
      if (timeElapsed >= TWENTY_FIVE_MINUTES && handler) {
        document.title = "Task Completed";
        const notif = {
          title: "Task Completed",
          description: task.id + " has completed",
        };
        toast(notif);
        showNotification(notif.title, notif.description);
        deleteCacheLocalForage(task.id);
        handler();
      }
    };

    if (!isPaused) {
      intervalId = setInterval(updateElapsedTime, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isPaused, lastPauseTime, task.start_at]);

  document.title = getElapsedTime(elapsedTime);

  useEffect(() => {
    saveStateToLocalForage();
  }, [isPaused, lastPauseTime, pauseStart]);

  const handlePause = () => {
    setIsPaused(true);
    setPauseStart(Date.now());
  };

  const handleResume = () => {
    if (pauseStart) {
      setLastPauseTime(lastPauseTime + (Date.now() - pauseStart));
      setPauseStart(null);
    }
    setIsPaused(false);
  };

  function getElapsedTime(elapsedTime) {
    const hours = Math.floor(
      (elapsedTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

    // Tambahkan '0' di depan jika panjang kurang dari 2 digit
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  const progress = Math.min(
    (elapsedTime / TWENTY_FIVE_MINUTES) * circumference,
    circumference,
  );

  const progressPercentage = Math.min(
    (elapsedTime / TWENTY_FIVE_MINUTES) * 100,
    100,
  );

  return (
    <Card
      style={{ animationDelay: `0.1s` }}
      className="animate-roll-reveal [animation-fill-mode:backwards] md:fixed bottom-4 right-4 bg-bg dark:bg-darkBg z-20"
    >
      <CardHeader className="border-b dark:shadow-navDark shadow-nav bg-main relative">
        <CardTitle className="flex items-center gap-x-2 font-heading capitalize">
          <Badge className="text-sm" variant="neutral">
            {task.label}
          </Badge>
          {task.title}
        </CardTitle>
        <CardDescription>
          {summary?.done + 1} dari {summary?.total} Task
        </CardDescription>
        <div className="absolute bottom-3 right-3">
          <TaskActions task={task} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-x-3 pt-4 md:gap-x-5">
          <div className="w-[90px] rounded-full bg-white dark:bg-white/40 backdrop-blur-md text-text dark:text-darkText shadow">
            <div className="relative">
              <div className="absolute flex h-full w-full justify-center">
                <div className="flex flex-col justify-center">
                  <button
                    className="z-10 mx-auto cursor-pointer text-green-500 hidden"
                    data-testid="circle-timer-start-break"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
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
                  </button>

                  <Button
                    size="sm"
                    variant="link"
                    onClick={isPaused ? handleResume : handlePause}
                    className={`z-10 ${isPaused ? "text-green-500" : "text-orange-300"} `}
                  >
                    {isPaused ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-play"
                      >
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-pause"
                      >
                        <rect x={14} y={4} width={4} height={16} rx={1} />
                        <rect x={6} y={4} width={4} height={16} rx={1} />
                      </svg>
                    )}
                  </Button>
                  <div className="mx-auto flex justify-center font-bold">
                    {getElapsedTime(elapsedTime)}
                  </div>
                </div>
              </div>
              <div className="text-green-400">
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
                    cx={45}
                    cy={45}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={5}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative w-full">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
};

import { Link, useSubmit, useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { labels, statuses, priorities } from "../data/data";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

function TaskActions<TData>({ task }: DataTableRowActionsProps<TData>) {
  const submit = useSubmit();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="neutral" size="icon">
          <DotsVerticalIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {task.status === "draft" && (
          <DropdownMenuItem
            onClick={() =>
              submit(
                {
                  intent: "update-status-task",
                  id: task.id,
                  status: "progress",
                },
                { action: "/tasks", method: "POST" },
              )
            }
          >
            Start
          </DropdownMenuItem>
        )}
        {task.status !== "done" && (
          <DropdownMenuItem
            onClick={() => {
              submit(
                {
                  intent: "update-status-task",
                  id: task.id,
                  status: "done",
                },
                { action: "/tasks", method: "POST" },
              );
            }}
          >
            Mark as done
          </DropdownMenuItem>
        )}
        <Link to={`./${task.id}`}>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={() =>
            submit(
              { intent: "copy-task", id: task.id },
              { action: "/tasks", method: "POST" },
            )
          }
        >
          Make a copy
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.label}>
              {labels.map((label) => (
                <DropdownMenuRadioItem
                  onClick={() =>
                    submit(
                      {
                        intent: "update-label-task",
                        id: task.id,
                        label: label.value,
                      },
                      { action: "/tasks", method: "POST" },
                    )
                  }
                  key={label.value}
                  value={label.value}
                >
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.status}>
              {statuses.map((status) => (
                <DropdownMenuRadioItem
                  onClick={() =>
                    submit(
                      {
                        intent: "update-status-task",
                        id: task.id,
                        status: status.value,
                      },
                      { action: "/tasks", method: "POST" },
                    )
                  }
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.priority}>
              {priorities.map((priority) => (
                <DropdownMenuRadioItem
                  onClick={() =>
                    submit(
                      {
                        intent: "update-priority-task",
                        id: task.id,
                        priority: priority.value,
                      },
                      { action: "/tasks", method: "POST" },
                    )
                  }
                  key={priority.value}
                  value={priority.value}
                >
                  {priority.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            navigate("/tasks/delete", { state: { tasks: [task] } })
          }
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
