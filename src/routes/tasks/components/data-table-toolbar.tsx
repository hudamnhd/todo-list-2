import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { useNavigate, useFetcher } from "react-router-dom";
import { Download } from "lucide-react";
import { Trash2 } from "lucide-react";
import React from "react";

import { exportTableToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../components/data-table-view-options";
import { DataTableAddData } from "../components/data-table-add-data";
import { CalendarDateRangePicker } from "@/routes/tasks/components/date-range-picker";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
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
            variant="ghost"
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
          variant="outline"
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
          variant="outline"
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
