import { Outlet } from "react-router-dom";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import { NavLink } from "react-router-dom";
import { MainNav } from "./components/main-nav";
import { Search } from "./components/search";
import { UserNav } from "./components/user-nav";
import ThemeSwitch from "@/components/custom/theme-switch";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetClose,
  SheetTitle,
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu, Package2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className=" flex-col md:flex">
      <div className="shadow-navDark border-b sticky top-0 w-full z-10 bg-bg dark:bg-darkBg">
        <div className="flex h-16 items-center px-4 gap-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="text-start">
                <SheetTitle>Dash Tasks</SheetTitle>
                <SheetDescription>navigation menu</SheetDescription>
              </SheetHeader>
              <nav className={cn("grid gap-2 mt-3")}>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    cn(
                      buttonVariants({
                        variant: isActive ? "default" : "neutral",
                      }),
                    )
                  }
                >
                  <SheetClose>Planner</SheetClose>
                </NavLink>
                <NavLink
                  to="/tasks"
                  className={({ isActive }) =>
                    cn(
                      buttonVariants({
                        variant: isActive ? "default" : "neutral",
                      }),
                    )
                  }
                >
                  <SheetClose>Tasks</SheetClose>
                </NavLink>
              </nav>
            </SheetContent>
          </Sheet>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center md:gap-x-3 gap-x-2">
            <Search />
            <ThemeSwitch />
            <UserNav />
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
