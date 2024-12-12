import { useLoaderData } from "react-router-dom";
//
// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
//
const summarizeTasks = (tasks: Task[]) => {
  const summary: {
    name: string;
    done: number;
    cancel: number;
  }[] = [];

  // Membuat objek untuk agregasi per bulan
  const monthlySummary: Record<string, { done: number; cancel: number }> = {};

  tasks.forEach((task) => {
    const monthName = new Date(task.created_at).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!monthlySummary[monthName]) {
      monthlySummary[monthName] = { done: 0, cancel: 0 };
    }

    if (task.status === "done") {
      monthlySummary[monthName].done += 1;
    } else if (task.status === "cancel") {
      monthlySummary[monthName].cancel += 1;
    }
  });

  // Konversi hasil ke array
  for (const [name, { done, cancel }] of Object.entries(monthlySummary)) {
    summary.push({ name, done, cancel });
  }

  return summary;
};
//
// // Contoh penggunaan
// const data = [
//   {
//     name: "Jan",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Feb",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Mar",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Apr",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "May",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Jun",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Jul",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Aug",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Sep",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Oct",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Nov",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: "Dec",
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
// ];
//
// export function Overview() {
//   const tasks = useLoaderData();
//
//   const data = summarizeTasks(tasks);
//
//   console.log(data);
//   return (
//     <ResponsiveContainer width="100%" height={350}>
//       <BarChart data={data}>
//         <XAxis
//           dataKey="name"
//           stroke="#888888"
//           fontSize={12}
//           tickLine={false}
//           axisLine={false}
//         />
//         <YAxis
//           stroke="#888888"
//           fontSize={12}
//           tickLine={false}
//           axisLine={false}
//           tickFormatter={(value) => `$${value}`}
//         />
//         <Bar
//           dataKey="total"
//           radius={[4, 4, 0, 0]}
//           className="fill-primary"
//           fill="currentColor"
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// }

const summarizeTasksByWeek = (tasks: Task[]) => {
  const summary: {
    week: string;
    totalTaskDone: number;
    totalTaskCancel: number;
  }[] = [];

  // Membuat objek untuk agregasi per minggu
  const weeklySummary: Record<
    string,
    { totalTaskDone: number; totalTaskCancel: number }
  > = {};

  tasks.forEach((task) => {
    const date = new Date(task.created_at);
    const weekNumber = getWeekNumber(date); // Menghitung minggu dalam tahun
    const year = date.getFullYear();
    // const weekKey = `W-${weekNumber}, ${year}`;
    const weekKey = `W-${weekNumber}`;

    if (!weeklySummary[weekKey]) {
      weeklySummary[weekKey] = { done: 0, cancel: 0 };
    }

    if (task.status === "done") {
      weeklySummary[weekKey].done += 1;
    } else if (task.status === "cancel") {
      weeklySummary[weekKey].cancel += 1;
    }
  });

  // Konversi hasil ke array
  for (const [week, { done, cancel }] of Object.entries(weeklySummary)) {
    summary.push({ week, done, cancel });
  }

  return summary;
};

// Fungsi untuk mendapatkan nomor minggu dalam tahun
const getWeekNumber = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const daysSinceStartOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.ceil((daysSinceStartOfYear + startOfYear.getDay() + 1) / 7);
};

// Contoh penggunaan

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  done: {
    label: "Done",
    color: "hsl(var(--chart-1))",
  },
  cancel: {
    label: "Cancel",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function Overview() {
  const tasks = useLoaderData();
  // const chartData = summarizeTasksByWeek(tasks);
  const chartData = summarizeTasks(tasks);
  return (
    <ChartContainer config={chartConfig} width="100%" className="">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="done" fill="var(--color-done)" radius={4} />
        <Bar dataKey="cancel" fill="var(--color-cancel)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
