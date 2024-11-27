import { cn } from "@/lib/utils";

type ProgressBarType = {
  minValue?: number;
  maxValue?: number;
  rounded?: "none" | "md" | "full" | "base";
  color?:
    | "violet"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "lime"
    | "cyan"
    | "green";
  disabled?: boolean;
  showPercentage?: boolean;
  className?: string;
  currentValue?: number;
};

export const ProgressBar = ({
  minValue = 0,
  maxValue = 100,
  rounded = "base",
  color = "green",
  currentValue = 0,
  showPercentage = true,
  disabled,
  className,
}: ProgressBarType) => {
  const clampedValue = Math.min(maxValue, Math.max(currentValue, minValue));
  const widthPercentage =
    ((clampedValue - minValue) / (maxValue - minValue)) * 100;

  return (
    <div
      className={cn(
        "w-72 md:w-full max-w-md border-2 border-border dark:border-darkBorder  focus:outline-none h-8 overflow-hidden shadow-light dark:shadow-dark bg-white",
        { "rounded-none": rounded === "none" },
        { "rounded-md": rounded === "md" },
        { "rounded-base": rounded === "base" },
        { "rounded-full": rounded === "full" },
        {
          "border-border dark:border-darkBorder  active:bg-main": disabled,
        },
        className,
      )}
    >
      <div
        style={{ width: widthPercentage + "%" }}
        className={cn(
          "h-full flex flex-row items-center justify-end overflow-hidden",
          {
            "bg-violet-200 hover:bg-violet-300":
              color === "violet" && !disabled,
          },
          {
            "bg-pink-200 hover:bg-pink-300": color === "pink" && !disabled,
          },
          {
            "bg-red-200 hover:bg-red-300": color === "red" && !disabled,
          },
          {
            "bg-orange-200 hover:bg-orange-300":
              color === "orange" && !disabled,
          },
          {
            "bg-yellow-200 hover:bg-yellow-300":
              color === "yellow" && !disabled,
          },
          {
            "bg-lime-200 hover:bg-lime-300": color === "lime" && !disabled,
          },
          {
            "bg-cyan-200 hover:bg-cyan-300": color === "cyan" && !disabled,
          },
          {
            "bg-green-400 hover:bg-green-500": color === "green" && !disabled,
          },
          { "rounded-none": rounded === "none" },
          { "rounded-md": rounded === "md" },
          { "rounded-full": rounded === "full" },
        )}
      >
        {showPercentage && !disabled && (
          <h1
            className={cn(
              "mr-2 text-text dark:text-text",
              widthPercentage !== 100 ? "font-bold" : "font-black",
              widthPercentage !== 100 ? "opacity-60" : "opacity-100",
              className,
            )}
          >
            {Math.round(widthPercentage)}%
          </h1>
        )}
      </div>
    </div>
  );
};
