import { Reveal } from "./Reveal";
import { ButtonLink } from "./Button";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
  id?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, action, align = "left", invert, className, id }: Props) {
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-col gap-6 md:mb-12",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className={cn("eyebrow mb-3", invert && "text-gold-400 dark:text-gold-400")}>{eyebrow}</p>}
        <h2 id={id} className={cn("text-3xl font-bold sm:text-4xl", invert && "text-white")}>
          {title}
        </h2>
        {subtitle && <p className={cn("mt-3 text-lg text-ink-500 dark:text-ink-300", invert && "text-white/75")}>{subtitle}</p>}
      </div>
      {action && (
        <ButtonLink href={action.href} variant={invert ? "outline-light" : "ghost"} className="shrink-0 self-start md:self-auto">
          {action.label}
        </ButtonLink>
      )}
    </Reveal>
  );
}
