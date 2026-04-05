import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "solid";
  glow?: "none" | "primary" | "cyan";
}

function GlassCard({
  className,
  variant = "default",
  glow: _glow = "none",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl p-5 md:p-6",
        variant === "default" && "whimsy-card",
        variant === "solid" && "whimsy-card-elevated",
        className
      )}
      {...props}
    />
  );
}

function GlassCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

function GlassCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-base font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

function GlassCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("", className)} {...props} />;
}

export { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent };
