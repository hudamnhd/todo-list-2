"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import { useMemo, useState } from "react";

export function PickerExample({
  className,
}: {
  background: string;
  setBackground: (background: string) => void;
  className?: string;
}) {
  const [background, setBackground] = useState("#09203f");

  const taskCategories = [
    { category: "Urgent Tasks", color: "#ef4444" },
    { category: "High Priority Tasks", color: "#f97316" },
    { category: "Medium Priority Tasks", color: "#f59e0b" },
    { category: "Low Priority Tasks", color: "#84cc16" },
    { category: "Personal Tasks", color: "#22c55e" },
    { category: "Work Tasks", color: "#06b6d4" },
    { category: "Important Meetings", color: "#3b82f6" },
    { category: "Research Tasks", color: "#6366f1" },
    { category: "Creative Tasks", color: "#8b5cf6" },
    { category: "Review Tasks", color: "#d946ef" },
    { category: "Reports", color: "#ec4899" },
    { category: "Follow-up Tasks", color: "#f43f5e" },
    { category: "General Tasks", color: "#E2E2E2" },
    { category: "Team Collaboration", color: "#ff75c3" },
    { category: "Client Tasks", color: "#ffa647" },
    { category: "Training Tasks", color: "#ffe83f" },
    { category: "Deadline Tasks", color: "#9fff5b" },
    { category: "Admin Tasks", color: "#70e2ff" },
    { category: "Development Tasks", color: "#cd93ff" },
    { category: "Miscellaneous Tasks", color: "#09203f" },
  ];
  const solids = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#E2E2E2",
    "#ff75c3",
    "#ffa647",
    "#ffe83f",
    "#9fff5b",
    "#70e2ff",
    "#cd93ff",
    "#09203f",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[220px] justify-start text-left font-normal",
            !background && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex w-full items-center gap-2">
            {background ? (
              <div
                className="h-4 w-4 rounded !bg-cover !bg-center transition-all"
                style={{ background }}
              ></div>
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <div className="flex-1 truncate">
              {background ? background : "Pick a color"}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-wrap gap-2">
          {taskCategories.map((s) => (
            <div
              key={s.color}
              style={{ background: s.color }}
              className="h-6 w-6 cursor-pointer rounded-md active:scale-105"
              onClick={() => setBackground(s.color)}
            />
          ))}
        </div>

        {/*<Input
          id="custom"
          value={background}
          className="col-span-2 mt-4 h-8"
          onChange={(e) => setBackground(e.currentTarget.value)}
        />*/}
      </PopoverContent>
    </Popover>
  );
}
