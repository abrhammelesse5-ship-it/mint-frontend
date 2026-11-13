import type { SocialPlatform } from "@/lib/types";

/* Brand marks (simple-icons style paths). lucide-react v1 no longer ships brand icons. */
const paths: Record<SocialPlatform, string> = {
  facebook:
    "M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07",
  x: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93Zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41Z",
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  youtube:
    "M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14c.5-1.88.5-5.8.5-5.8s0-3.92-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z",
  telegram:
    "M11.94 0C5.35 0 0 5.35 0 11.94s5.35 11.94 11.94 11.94 11.94-5.35 11.94-11.94S18.53 0 11.94 0Zm5.87 8.15-1.97 9.28c-.15.66-.54.82-1.09.51l-3-2.21-1.45 1.4c-.16.16-.3.3-.6.3l.21-3.05 5.56-5.02c.24-.21-.05-.33-.38-.12l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.14-.95l11.57-4.46c.54-.2 1.01.13.84.91Z",
  flickr:
    "M5.33 6.67a5.33 5.33 0 1 0 0 10.66 5.33 5.33 0 0 0 0-10.66Zm13.34 0a5.33 5.33 0 1 0 0 10.66 5.33 5.33 0 0 0 0-10.66Z",
};

export const socialLabels: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  telegram: "Telegram",
  flickr: "Flickr",
};

export function SocialIcon({ platform, className = "h-4 w-4" }: { platform: SocialPlatform; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={paths[platform]} />
    </svg>
  );
}
