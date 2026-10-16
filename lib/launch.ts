/** Client-safe launch / site settings shared by the API proxy, pages and the admin dashboard. */
export type Offer = { id: string; title: string; description: string; percent: number; itemIds: string[]; startsAt: number | null; endsAt: number | null; banner: boolean; enabled?: boolean };

export type SiteConfig = {
  serverTime: number;
  launch: {
    at: number;
    prelaunch: boolean;
    launched: boolean;
    lockStore: boolean;
    lockDownloads: boolean;
    founderPick: boolean;
    founderCapes: string[];
    headline: string;
    subline: string;
  };
  maintenance: { enabled: boolean; message: string; until: number | null };
  announcement: { enabled: boolean; text: string; href: string; cta: string };
  beta: { open: boolean; closesAt: number | null };
  theme: { halloween: boolean };
  offers: Offer[];
};

export type BetaAnswers = {
  discord: string; platform: "windows" | "macos" | "linux" | ""; age: "13-17" | "18-24" | "25+" | ""; specs: string;
  versions: string[]; hours: number; playstyle: string[]; experience: string; why: string; timezone: string; agree: boolean;
};
export type BetaApplication = {
  id: string; status: "pending" | "approved" | "waitlist" | "rejected"; answers: BetaAnswers; createdAt: number; updatedAt: number;
  reviewedAt: number | null; note: string | null; canReapply: boolean; reapplyAt: number | null;
  /** Accepted only: when the tester's month of Native+ ends (null once it's over or Native+ comes from elsewhere). */
  plusEndsAt?: number | null;
};

/** Used when the API can't be reached: assume launched with nothing locked (never lock people out by accident). */
/** Used only when the API is unreachable. Fails safe to the pre-launch state until the default launch date. */
const FALLBACK_AT = Date.parse(process.env.NEXT_PUBLIC_LAUNCH_AT || "2026-11-01T18:00:00Z");
const FALLBACK_PRE = Date.now() < FALLBACK_AT;

export const FALLBACK_CONFIG: SiteConfig = {
  serverTime: 0,
  launch: {
    at: FALLBACK_AT,
    prelaunch: FALLBACK_PRE,
    launched: !FALLBACK_PRE,
    lockStore: FALLBACK_PRE,
    lockDownloads: FALLBACK_PRE,
    founderPick: FALLBACK_PRE,
    founderCapes: FALLBACK_PRE ? ["toon-blaze", "slime-pop", "comet-night"] : [],
    headline: "",
    subline: "",
  },
  maintenance: { enabled: false, message: "", until: null },
  announcement: { enabled: false, text: "", href: "", cta: "" },
  beta: { open: true, closesAt: null },
  theme: { halloween: false },
  offers: [],
};

export type Poll = {
  id: string;
  title: string;
  description: string;
  kind: string;
  status: "open" | "closed";
  rawStatus?: string;
  results: "always" | "after_vote" | "after_close";
  endsAt: number | null;
  createdAt: number;
  myVote: string | null;
  total: number | null;
  showResults: boolean;
  /** closed polls: the admin's pick, else the option with the most votes (null on a tie) */
  winnerId?: string | null;
  winnerPicked?: boolean;
  options: { id: string; label: string; description: string; image: string | null; votes: number | null; itemId?: string | null; item?: PollItem | null }[];
};

/** A Store item used as a vote option (hidden concept pieces included). */
export type PollItem = {
  id: string; name: string; kind?: "cape" | "cosmetic"; slot?: string | null; hidden?: boolean; exclusive?: boolean; price?: number;
  animated?: boolean; frames?: number; fps?: number; stripUrl?: string | null; stillUrl: string; modelUrl?: string | null; textureUrl?: string | null;
};
