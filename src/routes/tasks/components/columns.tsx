import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import React from "react";
import { DataTableRowActions } from "./data-table-row-actions";

import { labels, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="neutral">{label.label}</Badge>}
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status"),
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          <StatusBadge status={status.value} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue("priority"),
      );

      if (!priority) {
        return null;
      }

      return (
        <div className="flex items-center">
          <PriorityBadge priority={priority} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt");

      return (
        <div className="flex items-center">
          <span>{dayjs(createdAt).format("H:mm [on] D MMM YYYY")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      if (!value?.from || !value?.to) return true;

      const createdAt = new Date(row.getValue(id)); // Ubah ISO string ke `Date`
      const from = new Date(value.from);
      const to = new Date(value.to);

      return createdAt >= from && createdAt <= to;
    },
  },
  {
    accessorKey: "completedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Completed" />
    ),
    cell: ({ row }) => {
      const completedAt = row.getValue("completedAt");
      if (!completedAt) return "-";

      return (
        <div className="flex items-center">
          <span>{dayjs(completedAt).format("H:mm [on] D MMM YYYY")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      if (!value?.from || !value?.to) return true;

      const createdAt = new Date(row.getValue(id)); // Ubah ISO string ke `Date`
      const from = new Date(value.from);
      const to = new Date(value.to);

      return completedAt >= from && completedAt <= to;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

import {
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusStyles: Record<
    string,
    { label: string; color: string; icon: React.FC }
  > = {
    draft: {
      label: "Draft",
      color: "bg-gray-200 text-gray-800 border-gray-800",
      icon: CircleIcon,
    },
    progress: {
      label: "Progress",
      color: "bg-yellow-200 text-yellow-800 border-yellow-800",
      icon: StopwatchIcon,
    },
    done: {
      label: "Done",
      color: "bg-green-200 text-green-800 border-green-800",
      icon: CheckCircledIcon,
    },
    cancel: {
      label: "Cancel",
      color: "bg-red-200 text-red-800 border-red-800",
      icon: CrossCircledIcon,
    },
  };

  const currentStatus = statusStyles[status] || {
    label: "Unknown",
    color: "bg-gray-100 text-gray-600 border-gray-600",
    icon: CircleIcon,
  };

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1 border rounded-base shadow-light dark:shadow-dark ${currentStatus.color}`}
    >
      <currentStatus.icon className="h-4 w-4" />
      <span className="text-xs font-bold">{currentStatus.label}</span>
    </div>
  );
};

const PriorityBadge: React.FC<{
  priority: { label: string; value: string; icon: React.ElementType };
}> = ({ priority }) => {
  const colors = {
    low: "bg-green-200 text-green-900 border-green-600",
    medium: "bg-yellow-200 text-yellow-900 border-yellow-600",
    high: "bg-red-200 text-red-900 border-red-600",
  };

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1 border rounded-base shadow-light dark:shadow-dark  ${colors[priority.value]}`}
    >
      <priority.icon className="h-4 w-4" />
      <span className="text-xs font-bold">{priority.label}</span>
    </div>
  );
};
