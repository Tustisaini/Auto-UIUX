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
  screen
}: Props) {

  const { settingsDetail }: any = useContext(SettingContext);

  const activeTheme =
    (settingsDetail?.theme ||
      projectDetail?.theme ||
      "AURORA_INK") as keyof typeof THEMES;

  const theme = THEMES[activeTheme];

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔍 DEBUG LOG
  console.log("🧾 ScreenFrame screen:", screen);

  useEffect(() => {
    setRefreshKey((k) => k + 1);
  }, [activeTheme]);

  const html = HtmlWrapper(theme, htmlCode || "");

  const iframeKey = `${screenId}-${refreshKey}-${hashCode(html)}`;

  return (
    <Rnd
      position={{ x, y }}
      size={{ width, height }}
      minWidth={200}
      minHeight={200}
      dragHandleClassName="drag-handle"
      enableResizing={{ bottomRight: true, bottomLeft: true }}
      onDragStart={() => setPanningEnabled(false)}
      onDragStop={() => setPanningEnabled(true)}
      onResizeStart={() => setPanningEnabled(false)}
      onResizeStop={() => setPanningEnabled(true)}
    >

      {/* Header */}
      <div className="drag-handle flex gap-2 items-center cursor-move bg-white rounded-lg p-4">
        <ScreenHandler
          screen={screen}
          theme={theme}
          iframeRef={iframeRef}
          projectId={projectDetail?.projectId}
        />
      </div>

      {/* Preview */}
      <iframe
        key={iframeKey}
        ref={iframeRef}
        className="w-full h-full rounded-3xl mt-3"
        sandbox="allow-same-origin allow-scripts"
        srcDoc={html}
      />
    </Rnd>
  );
}

export default ScreenFrame;