"use client";

import { createContext, useState } from "react";

export const SettingContext = createContext<any>(null);

export function SettingProvider({ children }: { children: React.ReactNode }) {

  const [settingsDetail, setSettingDetail] = useState<any>({});

  return (
    <SettingContext.Provider value={{ settingsDetail, setSettingDetail }}>
      {children}
    </SettingContext.Provider>
  );
}