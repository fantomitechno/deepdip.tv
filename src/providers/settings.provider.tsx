"use client";

import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import { useStreamers } from "./streamers.provider";
import { StreamerData } from "@/lib/api";

type SettingsState = {
  languages: string[];
  setLanguages: (languages: string[]) => void;
  shown: string[];
  setShown: (shown: string[]) => void;
  shownStreamers: StreamerData[];
  showConnected: boolean;
  setShowConnected: (show: boolean) => void;
};

const SettingsContext = createContext<SettingsState | null>(null);

type SettingsProviderProps = {
  children: ReactNode;
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { streamers } = useStreamers();

  const [languages, setLanguages] = useState<string[]>([]);
  const [shown, setShown] = useState<string[]>(
    streamers.map((s) => s.streamer.twitch),
  );
  const [showConnected, setShowConnected] = useState<boolean>(true);

  const shownStreamers = useMemo(() => {
    let shownStreamers = streamers.filter((s) => s.online && (s.onDipDeep || !showConnected));

    if (languages.length) {
      shownStreamers = shownStreamers.filter((s) =>
        languages.includes(s.streamer.language),
      );
    }

    shownStreamers = shownStreamers.filter((s) =>
      shown.includes(s.streamer.twitch),
    );

    shownStreamers.sort((a, b) =>
      a.streamer.twitch.localeCompare(b.streamer.twitch),
    );

    return shownStreamers;
  }, [languages, streamers, shown]);

  return (
    <SettingsContext.Provider
      value={{
        languages,
        setLanguages,
        shownStreamers,
        shown,
        setShown,
        showConnected,
        setShowConnected
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("SettingsContext not found");
  return context;
};
