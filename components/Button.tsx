"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  external?: boolean;
};

export default function Button({ href, children, variant = "primary", size = "md", className, external }: Props) {
  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors",
        size === "lg" ? "h-14 px-8 text-[17px]" : "h-11 px-6 text-[15px]",
        variant === "primary" ? "bg-inv text-inv-fg hover:opacity-85" : "border border-line bg-surface text-fg hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </motion.a>
  );
}
