// ScreenFrame.tsx
import { themeToCssVars } from '@/data/Themes';
import { ProjectType } from '@/type/type';
import { GripVertical } from 'lucide-react';
import React from 'react';
import { Rnd } from "react-rnd";

type Props = {
  x: number,
  y: number,
  width: number,
  height: number,
  setPanningEnabled: (enabled: boolean) => void,
  screenId?: string,
  htmlCode: string | undefined,
  projectDetail: ProjectType | undefined
};

function ScreenFrame({
  x,
  y,
  setPanningEnabled,
  width,
  height,
  screenId,
  htmlCode,
  projectDetail
}: Props) {

  // Safely get theme from projectDetail
  const selectedTheme = projectDetail?.theme as any;
  const theme = selectedTheme ? selectedTheme : null;

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>

  <style>
    ${theme ? themeToCssVars(projectDetail?.theme) : ""}
  </style>
</head>
<body class="bg-[var(--background)] text-[var(--foreground)] w-full">
  ${htmlCode ?? ""}
</body>
</html>
`;

  return (
    <Rnd
      default={{
        x,
        y,
        width,
        height
      }}
      minWidth={200}
      maxWidth={width}
      minHeight={200}
      maxHeight={height}
      dragHandleClassName='drag-handle'
      enableResizing={{
        bottomRight: true,
        bottomLeft: true
      }}
      onDragStart={() => setPanningEnabled(false)}
      onDragStop={() => setPanningEnabled(true)}
      onResizeStart={() => setPanningEnabled(false)}
      onResizeStop={() => setPanningEnabled(true)}
    >
      <div className='drag-handle flex gap-2 items-center cursor-move bg-white rounded-lg p-4'>
        <GripVertical className='text-gray-500 h-4 w-4' />
        Drag here
      </div>

      <iframe
        className='w-full h-[calc(100%-40px)] bg-white rounded-3xl mt-3'
        sandbox='allow-same-origin allow-scripts'
        srcDoc={html}
      />
    </Rnd>
  );
}

export default ScreenFrame;
