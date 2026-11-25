import * as React from "react";
import { cn } from "@/lib/utils";

interface NexoraLogoProps {
  variant?: "public" | "dashboard";
  lightText?: boolean;
  className?: string;
}

export function NexoraLogo({
  variant = "public",
  lightText = false,
  className,
}: NexoraLogoProps) {
  const accentColor = variant === "public" ? "#ff3838" : "#3b82f6";
  const accentSecondary = variant === "public" ? "#ff6b6b" : "#6366f1";

  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {variant === "public" ? (
        /* Webtec-inspired geometric 4-node knot emblem */
        <svg
          width="34"
          height="34"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 3L23.5 8.5L18 14L12.5 8.5L18 3Z"
            fill={accentColor}
          />
          <path
            d="M33 18L27.5 23.5L22 18L27.5 12.5L33 18Z"
            fill={accentColor}
          />
          <path
            d="M18 33L12.5 27.5L18 22L23.5 27.5L18 33Z"
            fill={accentColor}
          />
          <path
            d="M3 18L8.5 12.5L14 18L8.5 23.5L3 18Z"
            fill={accentColor}
          />
          <circle cx="18" cy="18" r="3.5" fill={accentSecondary} />
        </svg>
      ) : (
        /* Nexora CRM dual-faceted hexagon mark */
        <svg
          width="30"
          height="30"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
            fill="url(#nexora-grad)"
          />
          <path
            d="M16 8L22.5 12V20L16 24L9.5 20V12L16 8Z"
            fill="white"
            fillOpacity="0.92"
          />
          <defs>
            <linearGradient
              id="nexora-grad"
              x1="4"
              y1="2"
              x2="28"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <span
        className={cn(
          "font-heading text-2xl font-bold tracking-tight",
          lightText ? "text-white" : "text-foreground"
        )}
      >
        Nexora
      </span>
    </span>
  );
}
