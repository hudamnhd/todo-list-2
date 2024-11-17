"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function CalendarDateRangePicker({
  table,
  className,
}: {
  className: React.HTMLAttributes<HTMLDivElement>;
  table: DataTableToolbarProps<TData>;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    // from: addDays(new Date(), -3), // 3 hari sebelumnya
    // to: addDays(new Date(), 4), // 4 hari setelahnya
  });

  const handleApplyFilter = (date) => {
    const column = table.getColumn("createdAt"); // Ambil kolom "createdAt"
    if (column) {
      column.setFilterValue(date); // Set filter value pada kolom
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-fit justify-start text-left font-normal h-8",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(e) => {
              handleApplyFilter(e);
              setDate(e);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
