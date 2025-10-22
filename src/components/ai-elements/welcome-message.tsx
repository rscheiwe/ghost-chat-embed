import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface WelcomeMessageProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
  emoji?: string;
}

export function WelcomeMessage({
  message = "Hi! I'm your AI assistant. How can I help you today?",
  emoji = "👋",
  className,
  ...props
}: WelcomeMessageProps) {
  return (
    <div
      className={cn("flex justify-start py-4 mb-4", className)}
      {...props}
    >
      <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-sm">
        <p className="text-foreground">
          <span className="mr-2">{emoji}</span>
          {message}
        </p>
      </div>
    </div>
  );
}
