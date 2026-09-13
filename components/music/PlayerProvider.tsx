"use client";

import type { ReactNode } from "react";
import { PlayerContext, usePlayerProvider } from "@/lib/music/player";

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const player = usePlayerProvider();
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>;
}
