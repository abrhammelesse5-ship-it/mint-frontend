import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn, isExternalUrl } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light" | "gold";

const styles: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/20",
  secondary: "bg-ink-900 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100",
  ghost: "text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5",
  light: "bg-white text-ink-900 hover:bg-brand-50 shadow-sm",
  "outline-light": "border border-white/40 text-white hover:bg-white/10 backdrop-blur",
  gold: "bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-sm",
};

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
  newTab?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ButtonLink({ href, children, variant = "primary", className, arrow = true, newTab, size = "md" }: Props) {
  const external = isExternalUrl(href);
  const openNew = newTab ?? external;
  const Icon = external ? ArrowUpRight : ArrowRight;
  const classes = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200",
    size === "sm" && "px-4 py-2 text-sm",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "lg" && "px-7 py-3.5 text-base",
    styles[variant],
    className,
  );
  const content = (
    <>
      <span>{children}</span>
      {arrow && <Icon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />}
    </>
  );
  if (external) {
    return (
      <a href={href} className={classes} target={openNew ? "_blank" : undefined} rel={openNew ? "noopener noreferrer" : undefined}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} target={openNew ? "_blank" : undefined}>
      {content}
    </Link>
  );
}
