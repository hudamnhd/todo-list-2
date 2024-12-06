import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "enhancement",
    label: "Enhancement",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const statuses = [
  // {
  //   value: "backlog",
  //   label: "Backlog",
  //   icon: QuestionMarkCircledIcon,
  // },
  {
    value: "draft",
    label: "Draft",
    icon: CircleIcon,
  },
  {
    value: "progress",
    label: "Progress",
    icon: StopwatchIcon,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircledIcon,
  },
  {
    value: "cancel",
    label: "Cancel",
    icon: CrossCircledIcon,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
];
