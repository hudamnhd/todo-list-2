import React, { useEffect, useState, StrictMode } from "react";
import Kanban from "./routes/kanban/index.tsx";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./routes/todo.tsx";

import {
  loader as loaderTodo,
  loaderTodoId,
  action as actionTodo,
} from "./routes/daily/data/tasks.ts";
import TodoList from "./routes/daily/index.tsx";
import TodoForm from "./routes/daily/components/task-form.tsx";
import DeleteTodo from "./routes/daily/components/data-table-delete-data.tsx";
import ErrorPage from "./error-page";
import NotFoundError from "./404.tsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        // element: <Kanban />,
        element: <App />,
      },
      {
        path: "/daily",
        element: <TodoList />,
        loader: loaderTodo,
        action: actionTodo,
        children: [
          {
            path: "/daily/:id",
            element: <TodoForm />,
            loader: loaderTodoId,
          },
          {
            path: "/daily/delete",
            element: <DeleteTodo />,
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
import store from "./store/store";
import { Provider } from "react-redux";

const Main = () => {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
};

createRoot(document.getElementById("root")!).render(<Main />);
