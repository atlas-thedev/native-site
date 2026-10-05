import type { Offer, SiteConfig } from "@/lib/launch";
import type { StoreItem } from "@/lib/store";

export type Settings = {
  launch: { at: number; prelaunch: boolean; lockStore: boolean; lockDownloads: boolean; founderPick: boolean; founderCapes: string[]; headline: string; subline: string };
  maintenance: { enabled: boolean; message: string; until: number | null };
  announcement: { enabled: boolean; text: string; href: string; cta: string };
  beta: { open: boolean; closesAt: number | null; maxTesters: number };
  offers: (Offer & { enabled: boolean; createdAt?: number })[];
};
export type SiteOverview = {
  users: number; preLaunchUsers: number; newToday: number; newThisWeek: number; founderPicks: number;
  founderByCape: { id: string; name: string; count: number }[]; votes: number; openPolls: number; signups: { day: string; count: number }[];
};
export type SiteDoc = { settings: Settings; config: SiteConfig; overview: SiteOverview };
export type AdminItem = StoreItem & { order: number };
