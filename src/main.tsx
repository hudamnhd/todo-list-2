import Kanban from "./routes/kanban/index.tsx";
import Calculator from "./routes/calculator/index.tsx";
import Muslim from "./routes/muslim/index.tsx";
import {
  loaderSuratId,
  SholawatView,
  DoaHarianView,
  DzikrView,
  TahlilView,
  SuratView,
  IndexQuranId,
} from "./routes/muslim/index.tsx";
import { createRoot } from "react-dom/client";
import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import DailyTasks from "./routes/daily/index.tsx";
import { Layout } from "./routes/daily/index.tsx";
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
        path: "/calculator",
        element: <Calculator />,
      },
      {
        path: "/muslim",
        element: <Muslim />,
        children: [
          {
            path: "/muslim/quran-surat",
            index: true,
            element: <IndexQuranId />,
          },
          {
            path: "/muslim/quran-surat/:id",
            loader: loaderSuratId,
            element: <SuratView />,
          },
          {
            path: "/muslim/sholawat",
            element: <SholawatView />,
          },
          {
            path: "/muslim/tahlil",
            element: <TahlilView />,
          },
          {
            path: "/muslim/doaharian",
            element: <DoaHarianView />,
          },
          {
            path: "/muslim/dzikr",
            element: <DzikrView />,
          },
        ],
      },
      {
        path: "/daily",
        element: <Layout />,
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
