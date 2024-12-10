import Kanban from "./routes/kanban/index.tsx";
import { createRoot } from "react-dom/client";
import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import DailyTasks from "./routes/daily/index.tsx";
import DailyTasksGarden from "./routes/daily/daily-garden.tsx";
import DailyTasksSprint from "./routes/daily/daily-sprint.tsx";
import DailyTasksBoard from "./routes/daily/daily-board.tsx";
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
        element: <Kanban />,
      },
      {
        path: "/daily",
        element: <Outlet />,
        children: [
          {
            path: "/daily",
            index: true,
            element: <DailyTasks />,
          },
          {
            path: "/daily/garden",
            element: <DailyTasksGarden />,
          },
          {
            path: "/daily/sprint",
            element: <DailyTasksSprint />,
          },
          {
            path: "/daily/board",
            element: <DailyTasksBoard />,
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
