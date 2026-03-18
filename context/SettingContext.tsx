"use client";

import { createContext, useState } from "react";

export const SettingContext = createContext<any>(null);

export function SettingProvider({ children }: { children: React.ReactNode }) {

  const [settingsDetail, setSettingDetail] = useState<any>({
    theme: "AUROR_INK",   // ✅ FIX: default theme
    projectName: "",
  });

  return (
    <SettingContext.Provider value={{ settingsDetail, setSettingDetail }}>
      {children}
    </SettingContext.Provider>
  );
}