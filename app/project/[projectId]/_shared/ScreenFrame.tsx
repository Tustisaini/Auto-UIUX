"use client";

import { SettingContext } from "@/context/SettingContext";
import { THEMES, themeToCssVars } from "@/data/Themes";
import { ProjectType } from "@/type/type";
import { GripVertical } from "lucide-react";
import React, { useEffect, useRef, useContext, useState } from "react";
import { Rnd } from "react-rnd";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  setPanningEnabled: (enabled: boolean) => void;
  screenId: string;
  htmlCode: string | undefined;
  projectDetail: ProjectType | undefined;
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
}: Props) {
  const { settingsDetail }: any = useContext(SettingContext);
  const activeTheme = (settingsDetail?.theme || projectDetail?.theme || "AURORA_INK") as keyof typeof THEMES;
  const theme = THEMES[activeTheme];

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => setRefreshKey((k) => k + 1), [activeTheme]);

  const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script src="https://cdn.tailwindcss.com"></script>
<style>
${theme ? themeToCssVars(theme) : ""}

html,body{
background:var(--background)!important;
color:var(--foreground)!important;
margin:0;
padding:0;
}

.bg-white,.bg-gray-50,.bg-gray-100,.bg-gray-200,.bg-gray-300,.bg-gray-800,.bg-gray-900{
background:var(--card)!important;
}

.text-black,.text-gray-900,.text-gray-800,.text-gray-700,.text-gray-600{
color:var(--foreground)!important;
}

.border,.border-gray-200,.border-gray-300,.border-gray-400{
border-color:var(--border)!important;
}

*{background-color:inherit;color:inherit;}
button{background:var(--primary)!important;color:var(--primary-foreground)!important;}
</style>
</head>
<body>
<script>console.log("🎨 THEME INSIDE IFRAME:", "${activeTheme}")</script>
${htmlCode ?? ""}
</body>
</html>
`;

  const iframeKey = `${screenId}-${refreshKey}-${hashCode(htmlCode ?? "")}`;

  return (
    <Rnd
      position={{ x, y }}
      size={{ width, height }} // FIXED SIZE
      minWidth={200}
      minHeight={200}
      dragHandleClassName="drag-handle"
      enableResizing={{ bottomRight: true, bottomLeft: true }}
      onDragStart={() => setPanningEnabled(false)}
      onDragStop={() => setPanningEnabled(true)}
      onResizeStart={() => setPanningEnabled(false)}
      onResizeStop={(_, __, ref) => {
        setPanningEnabled(true);
      }}
    >
      <div className="drag-handle flex gap-2 items-center cursor-move bg-white rounded-lg p-4">
        <GripVertical className="text-gray-500 h-4 w-4" />
        Drag here
      </div>

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