import { createElement } from "react";
import {
  Accessibility, Award, Bell, BookOpen, Brain, BriefcaseBusiness, Building2, CalendarDays, ChartColumnBig, CircleHelp, ClipboardList, Code,
  Coins, Cpu, Download, FileText, Fingerprint, FlaskConical, Gavel, Globe, GraduationCap, Handshake, House, Images, Info, Landmark, Layers,
  Library, Lightbulb, Link2, Lock, Mail, MapPin, Megaphone, Microscope, MonitorSmartphone, Network, Newspaper, Phone, Quote, Rocket,
  Satellite, Scale, Search, Server, Settings, ShieldCheck, Store, Target, Users, Video, Waypoints, Wifi, ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import type { NavIcon } from "@/lib/nav-icon";
import { resolveNavIcon } from "@/lib/nav-icon";

export const navIcons: Record<NavIcon, LucideIcon> = {
  home: House, info: Info, quote: Quote, target: Target, network: Network, scale: Scale, users: Users, layers: Layers, rocket: Rocket,
  file: FileText, book: BookOpen, clipboard: ClipboardList, library: Library, newspaper: Newspaper, megaphone: Megaphone,
  images: Images, calendar: CalendarDays, bell: Bell, gavel: Gavel, briefcase: BriefcaseBusiness, lightbulb: Lightbulb,
  graduation: GraduationCap, monitor: MonitorSmartphone, globe: Globe, help: CircleHelp, cpu: Cpu, building: Building2,
  flask: FlaskConical, wifi: Wifi, shield: ShieldCheck, brain: Brain, satellite: Satellite, landmark: Landmark, phone: Phone, mail: Mail,
  search: Search, handshake: Handshake, chart: ChartColumnBig, coins: Coins, server: Server, code: Code, map: MapPin, link: Link2,
  video: Video, award: Award, lock: Lock, accessibility: Accessibility, sitemap: Waypoints, transfer: ArrowLeftRight, microscope: Microscope,
  id: Fingerprint, store: Store, settings: Settings, download: Download,
};

/** Lucide icon for a link: its resolved icon name, or one inferred from the label/href. */
export function iconFor(link: { icon?: NavIcon; label: string; href?: string }): LucideIcon {
  return navIcons[link.icon ?? resolveNavIcon(link.label, link.href)] ?? Layers;
}

/** Renders the icon for a link (label/href keyword match when it has no explicit icon). */
export function NavGlyph({ link, className }: { link: { icon?: NavIcon; label: string; href?: string }; className?: string }) {
  return createElement(iconFor(link), { className, "aria-hidden": true });
}
