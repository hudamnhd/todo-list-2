import { cn } from "@/lib/utils";
import { PlusIcon } from "@radix-ui/react-icons";

export const Debug = ({ data }) => {
  return (
    <div className="flex-1">
      <details
        className="my-1 group [&_summary::-webkit-details-marker]:hidden"
        open
      >
        <summary className="flex cursor-pointer items-center gap-1.5 rounded-sm border w-fit py-1 px-2">
          <span className="font-medium text-xs">DEBUG</span>
          <PlusIcon
            name="plus"
            className="shrink-0 transition duration-300 group-open:-rotate-45"
          />
        </summary>
        <pre
          style={{ animationDelay: `0.05s` }}
          className={cn(
            "my-1 overflow-scroll rounded border p-1 text-xs",
            "whitespace-pre animate-slide-top [animation-fill-mode:backwards]",
          )}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};
