"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface ColorInputProps {
  onChange?: (color: string) => void;
  defaultValue?: string;
  swatches?: string[];
  showOpacity?: boolean;
  label?: string;
}

const defaultSwatches = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export default function Input_08({
  onChange,
  defaultValue = "#3b82f6",
  swatches = defaultSwatches,
  showOpacity = true,
  label = "Color",
}: ColorInputProps) {
  const [color, setColor] = useState(defaultValue);
  const [opacity, setOpacity] = useState(100);
  const pickerRef = useRef<HTMLDivElement>(null);
  // const { isCopied, copyToClipboard } = useCopyToClipboard();

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    const finalColor =
      opacity === 100
        ? newColor
        : `${newColor}${Math.round(opacity * 2.55)
            .toString(16)
            .padStart(2, "0")}`;
    onChange?.(finalColor);
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    const finalColor = `${color}${Math.round(value * 2.55)
      .toString(16)
      .padStart(2, "0")}`;
    onChange?.(finalColor);
  };

  const handleCopy = () => {
    const finalColor =
      opacity === 100
        ? color
        : `${color}${Math.round(opacity * 2.55)
            .toString(16)
            .padStart(2, "0")}`;
    // copyToClipboard(finalColor);
  };

  return (
    <div className="w-full max-w-xs space-y-2 relative z-10 min-h-[200px]">
      {label && (
        <label
          htmlFor="color-input"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}

      <div className="relative" ref={pickerRef}>
        <div
          className={cn(
            "p-3",
            "bg-white dark:bg-zinc-900",
            "border border-zinc-200 dark:border-zinc-800",
            "rounded-lg",
          )}
        >
          {/* Custom Color Input */}
          <div className="flex gap-2">
            <div
              className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-700"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 flex items-center">
              <input
                id="color-input"
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                    handleColorChange(value);
                  }
                }}
                className={cn(
                  "flex-1 px-2 py-1",
                  "rounded-md border border-zinc-200 dark:border-zinc-800",
                  "bg-white dark:bg-zinc-900",
                  "text-sm font-mono",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                )}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="ml-2 hover:opacity-70"
              >
                {/*{isCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-500" />
                )}*/}
              </button>
            </div>
          </div>

          {/* Opacity Slider */}
          {showOpacity && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>Opacity</span>
                <span>{opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className={cn(
                  "w-full h-2 rounded-full appearance-none",
                  "bg-gradient-to-r from-transparent to-current",
                  "cursor-pointer",
                )}
                style={{ color: color }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Swatches
            </div>
            <div className="grid grid-cols-6 gap-1">
              {swatches.map((swatch) => (
                <button
                  type="button"
                  key={swatch}
                  onClick={() => handleColorChange(swatch)}
                  className={cn(
                    "w-6 h-6 rounded-md",
                    "border border-zinc-200 dark:border-zinc-700",
                    "transition-transform hover:scale-110",
                    "relative",
                  )}
                  style={{ backgroundColor: swatch }}
                >
                  {color === swatch && (
                    <Check
                      className={cn(
                        "w-4 h-4 absolute inset-0 m-auto",
                        "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]",
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
