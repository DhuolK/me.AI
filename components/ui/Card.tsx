import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "subtle" | "interactive";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const variantStyles = {
    default: "bg-white border-zinc-200 shadow-sm",
    subtle: "bg-zinc-50/70 border-zinc-200/80",
    interactive:
      "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md cursor-pointer transition-all",
  }[variant];

  return (
    <div
      className={`rounded-xl border p-5 ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
