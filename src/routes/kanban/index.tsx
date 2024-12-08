import { Github } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import RichTextEditor from "@/components/text-editor";
import { Button } from "@/components/ui/button";
import React from "react";
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
      <App />
    </div>
  );
}
function App() {
  return (
    <>
      <div className="flex flex-col m-10">
        <main className="mx-4 flex flex-col gap-6 max-w-6xl mx-auto text-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Drag and Drop Kanban Board
          </h1>
          <KanbanBoard />
        </main>
      </div>
      <div className="w-full">
        <AppRichTextEditor />
      </div>
    </>
  );
}
function AppRichTextEditor() {
  const [value, setValue] = React.useState("Example tiptap");
  return (
    <div className="max-w-6xl mx-auto">
      <RichTextEditor value={value} onChange={setValue} />
    </div>
  );
}
