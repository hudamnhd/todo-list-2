import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/dashboard/page.tsx";
import Index from "./routes/index.tsx";
import TaskList from "./routes/tasks/index.tsx";
import {
  loader as loaderTasks,
  loaderTaskId,
  action as actionTasks,
} from "./routes/tasks/data/tasks.ts";
import TaskForm from "./routes/tasks/components/task-form.tsx";
import DataTableDeleteData from "./routes/tasks/components/data-table-delete-data.tsx";
import ErrorPage from "./error-page";
import NotFoundError from "./404.tsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        loader: loaderTasks,
        element: <Index />,
      },
      {
        path: "/tasks",
        element: <TaskList />,
        loader: loaderTasks,
        action: actionTasks,
        children: [
          {
            path: "/tasks/:id",
            element: <TaskForm />,
            loader: loaderTaskId,
          },
          {
            path: "/tasks/delete",
            element: <DataTableDeleteData />,
            // loader: loaderTaskId,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundError />,
  },
]);

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/custom/theme-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
