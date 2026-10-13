"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLaunch } from "./launch/LaunchContext";

export default function ThemeToggle() {
  const { theme } = useLaunch();
  const [light, setLight] = useState(false);
  useEffect(() => setLight(document.documentElement.getAttribute("data-theme") === "light"), []);
  const toggle = () => {
    const next = !light;
    setLight(next);
    if (next) document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {}
  };
  if (theme?.halloween) return null;
  return (
    <button onClick={toggle} aria-label="Switch theme" className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition hover:bg-surface-2 hover:text-fg">
      {light ? <Moon className="h-[17px] w-[17px]" /> : <Sun className="h-[17px] w-[17px]" />}
    </button>
  );
}
