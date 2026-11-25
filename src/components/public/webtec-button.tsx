import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebtecButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function WebtecButton({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  onClick,
}: WebtecButtonProps) {
  const classes = cn(
    variant === "primary" ? "webtec-btn-primary" : "webtec-btn-outline",
    disabled && "opacity-60 pointer-events-none",
    className
  );

  const inner = (
    <>
      <span
        className={cn(
          "webtec-btn-circle",
          variant === "outline" &&
            "bg-[var(--webtec-accent)] text-white"
        )}
      >
        <ChevronRight className="h-4 w-4 stroke-[2.5]" />
      </span>
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(classes, "cursor-pointer")}
    >
      {inner}
    </button>
  );
}
