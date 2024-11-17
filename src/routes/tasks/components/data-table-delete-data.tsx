import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import { Spinner } from "@/components/ui/spinner";
import React from "react";
import { useFetcher, useNavigate, useLocation } from "react-router-dom";

const DataTableDeleteData = () => {
  const location = useLocation();
  const tasks = location.state?.tasks;
  const navigate = useNavigate();

  if (!tasks) {
    return navigate("/tasks");
  }

  const key = tasks.length > 0 ? { key: "delete-selected" } : null;
  const fetcher = useFetcher(key);
  const submit = fetcher.submit;
  const isPending = fetcher.state !== "idle";
  const ids = tasks?.map((d) => d.id);

  React.useEffect(() => {
    if (fetcher.data?.success) {
      return navigate("/tasks");
    }
  }, [fetcher.data]);

  return (
    <React.Fragment>
      {tasks && (
        <AlertDialog open={true} onOpenChange={() => navigate("/tasks")}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your{" "}
                <span className="font-medium">{tasks.length}</span>
                {tasks?.length === 1 ? " task" : " tasks"} from our database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                className={cn(buttonVariants({ variant: "destructive" }))}
                onClick={(e) => {
                  e.preventDefault();
                  submit(
                    { intent: "delete-task", ids: JSON.stringify(ids) },
                    { action: "/tasks", method: "Delete" },
                  );
                }}
              >
                {isPending && <Spinner className="h-5 w-5 text-white mr-1.5" />}{" "}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </React.Fragment>
  );
};
export default DataTableDeleteData;
