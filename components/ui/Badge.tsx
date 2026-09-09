import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger" | "brand" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}) => {
  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
  }[size];

  const variantStyles = {
    neutral: "bg-zinc-100 text-zinc-700 border-zinc-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    brand: "bg-blue-50 text-blue-700 border-blue-200",
    outline: "bg-transparent text-zinc-600 border-zinc-300",
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-md border tracking-tight ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
