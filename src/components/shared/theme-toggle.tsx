"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "public" | "dashboard" | "pill";
}

export function ThemeToggle({ className, variant = "dashboard" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center gap-1 rounded-full border border-border bg-card/80 p-1 backdrop-blur-sm",
          className
        )}
        role="group"
        aria-label="Theme switcher"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-label="Switch to light mode"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            !isDark
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-label="Switch to dark mode"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            isDark
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "public"
          ? "border border-current/20 hover:bg-white/10"
          : "border border-border bg-card text-foreground hover:bg-accent",
        className
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <Sun className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
}
