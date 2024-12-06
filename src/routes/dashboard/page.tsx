import { Outlet } from "react-router-dom";
import { MainNav } from "./components/main-nav";
import { Search } from "./components/search";
import { UserNav } from "./components/user-nav";
import ThemeSwitch from "@/components/custom/theme-switch";

export default function DashboardPage() {
  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b sticky top-0 w-full z-10 bg-background">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
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
