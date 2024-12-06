"use client";

import React, { useEffect, useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

import { startOfDay, endOfDay, endOfWeek, startOfWeek } from "date-fns";
export function CalendarDateRangePicker({
  table,
}: {
  className: React.HTMLAttributes<HTMLDivElement>;
  table: DataTableToolbarProps<TData>;
}) {
  const [range, setRange] = useState<DateRange>({
    from: startOfDay(new Date()), // Awal hari ini
    to: endOfDay(new Date()), // Akhir hari ini
  });
  const handleDateRangeUpdate = (range: DateRange) => {
    const from = range.from;
    const to = range.to ?? endOfDay(range.from as Date);
    setRange({
      from: from,
      to: to,
    });
  };

  useEffect(() => {
    // setDateRange(range);
    const column = table.getColumn("created_at"); // Ambil kolom "created_at"
    if (column) {
      column.setFilterValue(range); // Set filter value pada kolom
    }
  }, [range]);

  return (
    <DateRangePicker
      onUpdate={(value) => handleDateRangeUpdate(value.range)}
      initialDateFrom={range.from}
      initialDateTo={range.to}
      align="start"
      showCompare={false}
    />
  );
}
