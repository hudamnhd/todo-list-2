import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import { NavLink } from "react-router-dom";
import React from "react";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "hidden md:flex items-center space-x-4 lg:space-x-6",
        className,
      )}
      {...props}
    >
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(buttonVariants({ variant: isActive ? "default" : "neutral" }))
        }
      >
        Planner
      </NavLink>
      <NavLink
        to="/tasks"
        className={({ isActive }) =>
          cn(buttonVariants({ variant: isActive ? "default" : "neutral" }))
        }
      >
        Tasks
      </NavLink>
    </nav>
  );
}
