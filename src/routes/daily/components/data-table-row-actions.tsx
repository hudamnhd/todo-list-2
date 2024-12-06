import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Link, useSubmit, useNavigate } from "react-router-dom";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { labels, statuses, priorities } from "../data/data";
import { taskSchema } from "../data/schema";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = taskSchema.parse(row.original);
  const submit = useSubmit();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="neutral"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
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
