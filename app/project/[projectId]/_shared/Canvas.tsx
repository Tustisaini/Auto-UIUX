 import React, { useEffect, useState } from "react";
import {
TransformWrapper,
TransformComponent,
} from "react-zoom-pan-pinch";
import ScreenFrame from "./ScreenFrame";
import { ProjectType, ScreenConfig } from "@/type/type";

type Props = {
projectDetail: ProjectType | undefined;
screenConfig: ScreenConfig[];
};

function Canvas({ projectDetail, screenConfig }: Props) {
const [panningEnabled, setPanningEnabled] = useState(true);

useEffect(() => {
console.log("SCREENS FROM DB:", screenConfig);
}, [screenConfig]);

const isMobile = projectDetail?.device === "mobile";

const SCREEN_WIDTH = isMobile ? 400 : 600;
const SCREEN_HEIGHT = 800;
const GAP = isMobile ? 20 : 40;

return (
<div
className="w-full h-screen bg-gray-100 relative overflow-hidden"
style={{
backgroundImage:
"radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
backgroundSize: "20px 20px",
}}
>
<TransformWrapper
initialScale={0.7}
minScale={0.4}
maxScale={3}
initialPositionX={50}
initialPositionY={50}
limitToBounds={false}
wheel={{ step: 0.2 }}
doubleClick={{ disabled: false }}
panning={{ disabled: !panningEnabled }}
>
{({ zoomIn, zoomOut, resetTransform }) => (
<>
{/* TOOLBAR */}
<div className="absolute top-4 left-4 z-50 flex gap-2 bg-white shadow-md rounded-lg p-2">
<button onClick={() => zoomIn()}>+</button>
<button onClick={() => zoomOut()}>-</button>
<button onClick={() => resetTransform()}>Reset</button>
</div>

<TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
<div className="relative w-fit h-full">
{screenConfig?.map((screen, index) => {
const x = index * (SCREEN_WIDTH + GAP);

/**
* ✅ FIXED LOGIC:
* Instead of guessing HTML validity,
* we only check if DB code exists AND is not empty
*/
const hasCode =
screen?.code !== null &&
screen?.code !== undefined &&
screen.code.trim().length > 50; // important fix

return hasCode ? (
<div
key={screen.screenId ?? index}
className="absolute cursor-move"
style={{ transform: `translate(${x}px, 0px)` }}
onMouseDown={() => setPanningEnabled(false)}
onMouseUp={() => setPanningEnabled(true)}
onMouseLeave={() => setPanningEnabled(true)}
>
<ScreenFrame
screenId={screen.screenId}
x={0}
y={0}
width={SCREEN_WIDTH}
height={SCREEN_HEIGHT}
setPanningEnabled={setPanningEnabled}
htmlCode={screen.code}
projectDetail={projectDetail}
/>
</div>
) : (
<div
key={`loading-${index}`}
className="bg-white rounded-2xl shadow-sm absolute flex flex-col items-center justify-center"
style={{
width: SCREEN_WIDTH,
height: SCREEN_HEIGHT,
transform: `translate(${x}px, 0px)`,
}}
>
<div className="text-gray-500 text-sm animate-pulse">
Generating screen...
</div>

<div className="mt-2 text-xs text-gray-400">
{screen.screenName}
</div>
</div>
);
})}
</div>
</TransformComponent>
</>
)}
</TransformWrapper>
</div>
);
}

export default Canvas;