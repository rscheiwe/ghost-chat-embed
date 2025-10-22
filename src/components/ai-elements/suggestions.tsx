import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface Suggestion {
  text: string;
  prompt: string;
}

export interface SuggestionsProps extends HTMLAttributes<HTMLDivElement> {
  suggestions: Suggestion[];
  onSuggestionClick: (prompt: string) => void;
}

export function Suggestions({
  suggestions,
  onSuggestionClick,
  className,
  ...props
}: SuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div
      className={cn("flex flex-col items-center gap-3 py-8", className)}
      {...props}
    >
      <div className="flex flex-col gap-3 w-full max-w-md">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className={cn(
              "px-6 py-3 rounded-full text-sm transition-all",
              "border-[1px] border-primary text-primary bg-background",
              "hover:bg-primary hover:text-primary-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "text-center"
            )}
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
}
