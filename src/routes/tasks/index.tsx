import { Layout } from "@/components/custom/layout";
import { DataTable } from "./components/data-table";
import { Timer } from "./components/timer";
import { askNotificationPermission } from "./components/notifications";
import { columns } from "./components/columns";
import { Debug } from "@/components/debug";
import React from "react";
import { Outlet } from "react-router-dom";
import { useLoaderData, useSubmit } from "react-router-dom";

export default function Tasks() {
  const tasks = useLoaderData();
  const submit = useSubmit();
  const taskOnProgress = tasks?.find((d) => d.status === "progress");
  const memoizedData = React.useMemo(() => tasks, [JSON.stringify(tasks)]);

  const handleDoneTask = () => {
    submit(
      {
        intent: "update-status-task",
        id: taskOnProgress.id,
        status: "done",
      },
      { action: "/tasks", method: "POST" },
    );
  };

  React.useEffect(() => {
    askNotificationPermission();
  }, []);

  return (
    <Layout>
      {taskOnProgress && (
        <Timer task={taskOnProgress} handler={handleDoneTask} />
      )}
      <Outlet />
      <Layout.Body>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <DataTable data={memoizedData} columns={columns} />
        </div>
        {/*<Debug data={memoizedData} />*/}
      </Layout.Body>
    </Layout>
  );
}
