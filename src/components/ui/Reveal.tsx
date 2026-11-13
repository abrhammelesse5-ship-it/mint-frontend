"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const variants: Record<"up" | "left" | "right" | "fade" | "scale", Variants> = {
  up: { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -32 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 32 }, show: { opacity: 1, x: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1 } },
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: keyof typeof variants;
  as?: "div" | "section" | "li" | "article";
}

/** Scroll-reveal wrapper: fades/slides content in once when it enters the viewport. */
export function Reveal({ children, className, delay = 0, from = "up", as = "div" }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={variants[from]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

/** Staggers its direct <RevealItem> children. */
export function RevealGroup({ children, className, stagger = 0.08 }: { children: React.ReactNode; className?: string; stagger?: number }) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={variants.up} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
