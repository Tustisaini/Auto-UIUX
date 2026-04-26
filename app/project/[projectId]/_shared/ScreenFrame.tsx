import { THEMES, themeToCssVars } from "@/data/Themes";
import { ProjectType } from "@/type/type";
import { GripVertical } from "lucide-react";
import React, { useState } from "react";
import { Rnd } from "react-rnd";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  setPanningEnabled: (enabled: boolean) => void;
  screenId?: string;
  htmlCode: string | undefined;
  projectDetail: ProjectType | undefined;
};

function ScreenFrame({
  x,
  y,
  setPanningEnabled,
  width,
  height,
  htmlCode,
  projectDetail,
}: Props) {
  const themeKey = projectDetail?.theme as keyof typeof THEMES;
  const theme = THEMES?.[themeKey];

  // ✅ controlled state (fixes drag bugs)
  const [position, setPosition] = useState({ x, y });

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    ${theme ? themeToCssVars(theme) : ""}
    body {
      margin: 0;
    }
  </style>
</head>

<body class="bg-[var(--background)] text-[var(--foreground)] w-full">
  ${htmlCode ?? ""}
</body>
</html>
`;

  return (
    <Rnd
      size={{ width, height }}
      position={position}
      minWidth={200}
      minHeight={200}
      bounds="parent"
      enableResizing={true}
      dragHandleClassName="drag-handle"

      onDragStart={() => setPanningEnabled(false)}

      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
        setPanningEnabled(true);
      }}

      onResizeStop={(e, direction, ref, delta, pos) => {
        setPosition(pos);
      }}
    >
      {/* HEADER / DRAG HANDLE */}
      <div className="drag-handle flex items-center gap-2 p-2 bg-white border-b cursor-move select-none">
        <GripVertical size={16} />
        <span className="text-sm">Screen</span>
      </div>

      {/* IFRAME */}
      <iframe
        className="w-full h-[calc(100%-36px)] bg-white"
        sandbox="allow-scripts allow-same-origin"
        srcDoc={html}
      />
    </Rnd>
  );
}

export default ScreenFrame;