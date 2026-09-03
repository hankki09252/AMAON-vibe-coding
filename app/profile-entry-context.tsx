"use client";

import { createContext } from "react";
import type { ManagedRosterPlayer, MediaItem, PlayerProfileOverride } from "./gd-roster";

export type ProfileEntryData = {
  team: string;
  player: string;
  roster: ManagedRosterPlayer[];
  overrides: PlayerProfileOverride[];
  media: MediaItem[];
  visibleRegions: string[];
};

export const ProfileEntryContext = createContext<ProfileEntryData | null>(null);
