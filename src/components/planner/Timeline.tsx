import React from "react";
import { useCalendar } from "@/contexts/PlannerContext";
import { cn } from "@/lib/utils";
import { TableHead, TableHeader, TableRow } from "../ui/table";

export const Timeline: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const { timeLabels } = useCalendar();

  return (
    <TableHeader>
      <TableRow className="bg-main text-text dark:text-darkText dark:border-darkText border border-border">
        <TableHead></TableHead>
        {timeLabels.map((label, index) => (
          <TableHead
            key={index}
            className={cn(
              "shadow-navDark border-b sticky -top-0.5 z-10 bg-main dark:border-darkText border-border min-w-56 text-center lg:min-w-72 ",
            )}
          >
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
