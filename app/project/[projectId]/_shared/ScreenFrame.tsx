"use client";

import { SettingContext } from "@/context/SettingContext";
import { THEMES } from "@/data/Themes";
import { ProjectType, ScreenConfig } from "@/type/type";
import React, { useEffect, useRef, useContext, useState } from "react";
import { Rnd } from "react-rnd";
import ScreenHandler from "./ScreenHandler";
import { HtmlWrapper } from "@/data/constant";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  setPanningEnabled: (enabled: boolean) => void;
  screenId: string;
  htmlCode: string | undefined;
  projectDetail: ProjectType | undefined;
  screen: ScreenConfig | undefined;
  index: number;
  total: number;
};

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function ScreenFrame({
  x,
  y,
  setPanningEnabled,
  width,
  height,
  screenId,
  htmlCode,
  projectDetail,
  screen,
  index,
  total,
}: Props) {
  const { settingsDetail }: any = useContext(SettingContext);

  const activeTheme =
    (settingsDetail?.theme ||
      projectDetail?.theme ||
      "AURORA_INK") as keyof typeof THEMES;

  const theme = THEMES[activeTheme];

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔍 DEBUG LOGS
  console.log(`🧾 ScreenFrame [${index + 1}/${total}]`, {
    screenName: screen?.screenName,
    hasCode: !!htmlCode,
    codeLength: htmlCode?.length,
  });

  useEffect(() => {
    console.log("🎨 Theme changed → refreshing iframe");
    setRefreshKey((k) => k + 1);
  }, [activeTheme]);

  const html = HtmlWrapper(theme, htmlCode || "");
  const iframeKey = `${screenId}-${refreshKey}-${hashCode(html)}`;

  const isLoading = !htmlCode;

  return (
    <Rnd
      position={{ x, y }}
      size={{ width, height }}
      minWidth={300}
      minHeight={300}
      dragHandleClassName="drag-handle"
      enableResizing={{ bottomRight: true, bottomLeft: true }}
      onDragStart={() => setPanningEnabled(false)}
      onDragStop={() => setPanningEnabled(true)}
      onResizeStart={() => setPanningEnabled(false)}
      onResizeStop={() => setPanningEnabled(true)}
    >
      {/* ✅ CLEAN HEADER (NO PROGRESS TEXT) */}
      <div className="drag-handle flex justify-end items-center cursor-move bg-white rounded-xl px-3 py-2 shadow-sm border">
        <ScreenHandler
          screen={screen}
          theme={theme}
          iframeRef={iframeRef}
          projectId={projectDetail?.projectId}
        />
      </div>

      {/* ✅ CONTENT */}
      <div className="w-full h-[calc(100%-45px)] mt-2 bg-white rounded-2xl overflow-hidden shadow-md border">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            
            {/* ✅ PROGRESS ONLY HERE */}
            <div className="text-xs text-gray-400 animate-pulse">
              Generating screen {index + 1} of {total}
            </div>

            {/* Skeleton */}
            <div className="w-full space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-9 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 bg-gray-200 rounded animate-pulse" />
              <div className="h-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            className="w-full h-full rounded-2xl"
            sandbox="allow-same-origin allow-scripts"
            srcDoc={html}
            onLoad={() =>
              console.log(`✅ Screen ${index + 1}/${total} iframe loaded`)
            }
          />
        )}
      </div>
    </Rnd>
  );
}

export default ScreenFrame;