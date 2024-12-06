import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import React from "react";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <NavLink
        to="/"
        className={({ isActive }) =>
          [
            isActive ? "text-primary" : "text-muted-foreground",
            "text-sm font-medium  transition-colors hover:text-primary",
          ].join(" ")
        }
      >
        Overview
      </NavLink>
      <NavLink
        to="/tasks"
        className={({ isActive }) =>
          [
            isActive ? "text-primary" : "text-muted-foreground",
            "text-sm font-medium  transition-colors hover:text-primary",
          ].join(" ")
        }
      >
        Tasks
      </NavLink>
    </nav>
  );
}
