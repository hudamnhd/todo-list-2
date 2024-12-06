import { PlusIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function DataTableAddData() {
  return (
    <Link to="/tasks/add">
      <Button variant="default" size="sm" className="ml-auto h-8">
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Task
      </Button>
    </Link>
  );
}
