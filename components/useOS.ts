"use client";

import { useEffect, useState } from "react";
import type { Platform } from "@/lib/site";

export function useOS(): Platform {
  const [os, setOs] = useState<Platform>("windows");
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) setOs("mac");
    else if (ua.includes("linux") && !ua.includes("android")) setOs("linux");
    else setOs("windows");
  }, []);
  return os;
}
