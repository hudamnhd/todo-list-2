import React, { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { getCache, setCache, deleteCache } from "@/lib/cache-client";
import { showNotification } from "./notifications";
import { StopwatchIcon } from "@radix-ui/react-icons";

type TimerProps = {
  task: { id: string; startAt: string }; // contoh properti task dengan waktu awal
};

export const Timer: React.FC<TimerProps> = ({ task, handler }) => {
  const TWENTY_FIVE_MINUTES = 25 * 60 * 1000; // 25 menit dalam milidetik
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastPauseTime, setLastPauseTime] = useState(0);
  const [pauseStart, setPauseStart] = useState<number | null>(null);

  const saveStateToLocalForage = async (
    taskId: string,
    state: {
      isPaused: boolean;
      lastPauseTime: number;
      pauseStart: number | null;
    },
  ) => {
    const allStates =
      (await getCache<{ [id: string]: any }>("timerStates")) || {};
    allStates[taskId] = state;
    await setCache("timerStates", allStates);
  };

  const deleteCacheLocalForage = async (taskId: string) => {
    const allStates =
      (await getCache<{ [id: string]: any }>("timerStates")) || {};
    delete allStates[taskId];
    await setCache("timerStates", allStates);
  };

  const loadStateFromLocalForage = async (taskId: string) => {
    const allStates = await getCache<{ [id: string]: any }>("timerStates");
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
    const startDate = new Date(task.startAt);
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
  }, [isPaused, lastPauseTime, task.startAt]);

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
    return `${minutes}m ${seconds}s`;
  }
  return (
    <div
      style={{ animationDelay: `0.1s` }}
      className="animate-roll-reveal [animation-fill-mode:backwards] fixed bottom-4 right-4 bg-white border p-4 rounded shadow-lg flex items-center gap-5 rounded-md p-4  shadow-lg transition-all  border bg-background"
    >
      <div className="grid gap-1">
        <div className="text-sm font-semibold">
          Focusing on: <span className="capitalize">{task.id}</span>
        </div>
        <div className="text-md flex items-center gap-x-1.5">
          <StopwatchIcon className="h-4 w-4" />
          {getElapsedTime(elapsedTime)}
        </div>
      </div>
      <Button
        size="sm"
        onClick={isPaused ? handleResume : handlePause}
        className="button"
      >
        {isPaused ? "Resume" : "Pause"}
      </Button>
    </div>
  );
};
