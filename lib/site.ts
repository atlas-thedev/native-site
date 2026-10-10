/** seconds the intro overlay holds before page content animates in */
export const INTRO = 0.9;

export const site = {
  name: "Native Client",
  short: "Native",
  tagline: "Minecraft, launched beautifully.",
  description:
    "Native Client is a fast, beautiful Minecraft launcher with instances, mod and modpack discovery, a 3D skin locker, friends chat, and a crash analyzer that fixes problems for you.",
  /** shown until the real latest release is known */
  fallbackVersion: "4.1.12",
  discord: "https://discord.gg/playnative",
  youtube: "https://www.youtube.com/@native-client",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://playnative.fun").replace(/\/$/, ""),
  keywords: [
    "Minecraft launcher",
    "Native Client",
    "Minecraft mod launcher",
    "Fabric launcher",
    "Forge launcher",
    "NeoForge",
    "Quilt",
    "modpack manager",
    "Minecraft skin editor",
    "Minecraft crash analyzer",
    "Modrinth",
    "CurseForge",
    "Minecraft instances",
  ],
};

export const nav = [
  { href: "/#features", label: "Features" },
  { href: "/#tour", label: "Tour" },
  { href: "/#versions", label: "Versions" },
  { href: "/plus", label: "Native+" },
  { href: "/beta", label: "Beta" },
  { href: "/changes", label: "Changes" },
  { href: "/support", label: "Support" },
];

export type Platform = "windows" | "mac" | "linux";

export const platforms: Record<
  Platform,
  { label: string; sub: string; files: string[]; note: string }
> = {
  windows: {
    label: "Windows",
    sub: "Windows 10 and 11 · x64",
    files: ["Setup installer (.exe)", "Portable (.zip)"],
    note: "Installer includes auto-updates.",
  },
  mac: {
    label: "macOS",
    sub: "Intel and Apple Silicon",
    files: ["Disk image (.dmg)", "Archive (.zip)"],
    note: "Separate builds for Apple Silicon and Intel.",
  },
  linux: {
    label: "Linux",
    sub: "x64 · AppImage and .deb",
    files: ["AppImage", "Debian package (.deb)"],
    note: "Runs on any modern distro.",
  },
};

export const loaders: { name: string; src?: string; mono?: string }[] = [
  { name: "Vanilla", src: "/icons/vanilla.png" },
  { name: "Fabric", src: "/icons/fabric.png" },
  { name: "Forge", src: "/icons/forge.jpg" },
  { name: "NeoForge", mono: "NF" },
  { name: "Quilt", mono: "Q" },
];

export const faqs = [
  {
    q: "Is Native Client free?",
    a: "Yes. Download it, sign in with a Microsoft account, a free Native account, or play offline. Everything in the launcher is available without paying.",
  },
  {
    q: "Which Minecraft versions and mod loaders are supported?",
    a: "Every release from the classic 1.x line up to the newest 26.x versions, plus snapshots. Create instances with Vanilla, Fabric, Forge, NeoForge or Quilt and Native installs the right loader build for you.",
  },
  {
    q: "Where do mods and modpacks come from?",
    a: "Discover searches Modrinth and CurseForge in one place for mods, modpacks, shader packs, resource packs and data packs. Dependencies are detected and offered before you install, and Native checks your installed mods for updates.",
  },
  {
    q: "Do I need to install Java myself?",
    a: "No. Native detects the Java runtimes on your machine and installs the right one (8, 17, 21 or 25) for each Minecraft version automatically. You can still point an instance at your own Java if you prefer.",
  },
  {
    q: "What happens when the game crashes?",
    a: "The crash analyzer reads the log, finds the cause (a conflicting mod, too little memory, the wrong Java) and offers fixes you can apply in one click. You can also share a clean report with a link.",
  },
  {
    q: "Can I use my own skin and cape?",
    a: "The Locker previews your skin in 3D, keeps a wardrobe of favourites, and syncs it to your account. Microsoft accounts use their official Mojang skin and capes; Native accounts can use Native cosmetics.",
  },
  {
    q: "Does it work with friends?",
    a: "Relay is the built-in social layer: friends, direct messages, group chats, presence that shows what instance someone is playing, and one-click sharing.",
  },
  {
    q: "Do I need a Native account?",
    a: "No. You can sign in with Microsoft or play offline. A free Native account adds a cloud-synced skin locker and Relay friends and chat, and you can manage your locker from this website too.",
  },
  {
    q: "Where do I get help?",
    a: "Visit the Support page for quick fixes and a live service status, or ask in our Discord server. Someone is usually around to help.",
  },
  {
    q: "Which languages are available?",
    a: "English, Español, Deutsch, Français, Português (Brasil) and Türkçe, with more on the way.",
  },
];
