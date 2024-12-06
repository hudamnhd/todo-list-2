import { Github } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";

const FooterLink = ({ children }: { children: React.ReactNode }) => {
  return (
    <Button
      variant="link"
      asChild
      className="scroll-m-20 text-xl font-semibold tracking-tight"
    >
      {children}
    </Button>
  );
};

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
    </>
  );
}

export default App;
