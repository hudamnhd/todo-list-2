import { Cross2Icon } from "@radix-ui/react-icons";
import { Timer } from "./timer";
import { Table } from "@tanstack/react-table";
import { useNavigate, useSubmit, useFetcher } from "react-router-dom";
import { Download } from "lucide-react";
import { Trash2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { exportTableToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../components/data-table-view-options";
import { DataTableAddData } from "../components/data-table-add-data";
import { CalendarDateRangePicker } from "@/routes/tasks/components/date-range-picker";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

import React from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}
import { startOfDay, endOfDay } from "date-fns";
export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const submit = useSubmit();
  const isFiltered = table.getState().columnFilters.length > 0;
  const today = new Date();
  const rows = table.getRowModel().rows;

  // Utility function to filter rows by date and status
  const filterRowsByStatus = (status: string) => {
    return rows.filter((row) => {
      const createdAt = new Date(row.getValue("createdAt"));
      const taskStatus = row.getValue("status");
      return (
        createdAt >= startOfDay(today) &&
        createdAt <= endOfDay(today) &&
        taskStatus === status
      );
    });
  };

  // Get filtered data
  const todayRows = rows.filter((row) => {
    const createdAt = new Date(row.getValue("createdAt"));
    return createdAt >= startOfDay(today) && createdAt <= endOfDay(today);
  });

  const todayInProgressRows = filterRowsByStatus("progress");
  const todayDoneRows = filterRowsByStatus("done");
  // Define target
  const MIN_TARGET = 3;
  const MAX_TARGET = 16;

  // Calculate progress
  const doneCount = todayDoneRows.length;
  const totalCount = todayRows.length;
  const progressMessage = `You have completed ${doneCount} of ${totalCount} tasks today.`;

  // Check achievement
  let achievementMessage = "";
  if (doneCount >= MIN_TARGET) {
    achievementMessage =
      "🎉 Congratulations! You've achieved your daily task target!";
  } else {
    achievementMessage = `🔔 You need ${MIN_TARGET - doneCount} more tasks to meet your target.`;
  }
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
  const summary = {
    total: todayRows?.length,
    done: todayDoneRows?.length,
  };
  const taskOnProgress =
    todayInProgressRows?.length === 1 ? todayInProgressRows[0]?.original : null;
  // Calculate total time spent on tasks
  const totalTimeInMilliseconds = todayDoneRows.reduce((total, row) => {
    const createdAt = new Date(row.getValue("createdAt")).getTime();
    const completedAt = new Date(row.getValue("completedAt")).getTime();
    return total + (completedAt - createdAt);
  }, 0);

  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(totalTimeInMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor(
    (totalTimeInMilliseconds % (1000 * 60 * 60)) / (1000 * 60),
  );
  const seconds = Math.floor((totalTimeInMilliseconds % (1000 * 60)) / 1000);

  const progressPercentage = Math.min(
    Math.round((doneCount / MIN_TARGET) * 100),
    100, // Cap at 100%
  );
  const totalTimeMessage = `Total time spent: ${hours}h ${minutes}m ${seconds}s.`;
  return (
    <React.Fragment>
      <Timer task={taskOnProgress} summary={summary} handler={handleDoneTask}>
        <div
          style={{ animationDelay: `0.1s` }}
          className="animate-slide-top [animation-fill-mode:backwards] grid gap-2"
        >
          <Badge className="text-sm shadow-light dark:shadow-dark">
            {progressMessage}
          </Badge>

          {doneCount === 0 && (
            <div className="text-sm text-red-500">
              You need to complete at least {MIN_TARGET} tasks today. Keep
              going!
            </div>
          )}
          <Badge className="text-sm shadow-light dark:shadow-dark bg-amber-300 dark:bg-amber-300">
            {totalTimeMessage}
          </Badge>

          <Badge className="text-sm shadow-light dark:shadow-dark bg-red-300 dark:bg-red-300">
            {achievementMessage}
          </Badge>
          <div className="grid gap-2 mt-2">
            <Label>Progress Today</Label>
            <ProgressBar currentValue={progressPercentage} />
          </div>
        </div>
      </Timer>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
          <Input
            placeholder="Filter tasks..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <div className="flex gap-x-2">
            {table.getColumn("status") && (
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title="Status"
                options={statuses}
              />
            )}
            {table.getColumn("priority") && (
              <DataTableFacetedFilter
                column={table.getColumn("priority")}
                title="Priority"
                options={priorities}
              />
            )}
          </div>
          {isFiltered && (
            <Button
              variant="default"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-x-2">
          <Button
            variant="default"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
            onClick={() =>
              exportTableToCSV(table, {
                filename: "tasks",
                excludeColumns: ["select", "actions"],
              })
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DeleteDataTableSelected table={table} />
          <CalendarDateRangePicker table={table} />
          <DataTableAddData table={table} />
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </React.Fragment>
  );
}

const DeleteDataTableSelected = ({ table }) => {
  const fetcher = useFetcher({ key: "delete-selected" });
  const navigate = useNavigate();

  React.useEffect(() => {
    if (fetcher.data?.success) {
      table.toggleAllRowsSelected(false);
    }
  }, [fetcher.data]);

  return (
    <React.Fragment>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <Button
          variant="default"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
          onClick={() => {
            const tasks = table
              .getFilteredSelectedRowModel()
              .rows.map((row) => row.original);
            navigate("/tasks/delete", {
              state: { tasks },
            });
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete ({table.getFilteredSelectedRowModel().rows.length})
        </Button>
      )}
    </React.Fragment>
  );
};
