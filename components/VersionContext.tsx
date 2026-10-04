"use client";

import { createContext, useContext } from "react";

const Ctx = createContext("4.1.4");
export const VersionProvider = ({ version, children }: { version: string; children: React.ReactNode }) => <Ctx.Provider value={version}>{children}</Ctx.Provider>;
export const useVersion = () => useContext(Ctx);
