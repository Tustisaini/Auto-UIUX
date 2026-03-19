"use client";

import React, { useState, useContext, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ScreenFrame from "./ScreenFrame";
import { ProjectType, ScreenConfig } from "@/type/type";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingContext } from "@/context/SettingContext";

type Props = {
  projectDetail: ProjectType | undefined;
  screenConfig: ScreenConfig[];
  loading?: boolean;
};

function Canvas({ projectDetail, screenConfig }: Props) {
  const [panningEnabled, setPanningEnabled] = useState(true);
  const { settingsDetail }: any = useContext(SettingContext);

  const isMobile = projectDetail?.device === "mobile";
  const SCREEN_WIDTH = isMobile ? 400 : 600;
  const SCREEN_HEIGHT = 800;
  const GAP = isMobile ? 20 : 40;

  return (
    <div
      className="w-full h-screen bg-gray-100 relative"
      style={{
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <TransformWrapper
        initialScale={0.7}
        minScale={0.7}
        maxScale={3}
        initialPositionX={50}
        initialPositionY={50}
        limitToBounds={false}
        panning={{ disabled: !panningEnabled }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <div className="absolute top-4 left-4 z-50 flex gap-2 bg-white p-2 rounded-lg shadow">
              <button onClick={() => zoomIn(0.1)}>+</button>
              <button onClick={() => zoomOut(0.1)}>-</button>
              <button onClick={() => resetTransform()}>x</button>
            </div>

            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
              <div
                className="flex items-start overflow-x-auto overflow-y-hidden py-5 px-3"
                style={{ gap: GAP }}
              >
                {screenConfig?.map((screen, index) => {
                  const screenId = `screen-${index}`;

                  return screen?.code ? (
                    <ScreenFrame
                      key={`${screenId}-${settingsDetail?.theme}-${screen.code}-${index}`}
                      screenId={screenId}
                      x={index * (SCREEN_WIDTH + GAP)}
                      y={0}
                      width={SCREEN_WIDTH}
                      height={SCREEN_HEIGHT}
                      setPanningEnabled={setPanningEnabled}
                      htmlCode={screen.code}
                      projectDetail={projectDetail}
                      screen={screen}
                    />
                  ) : (
                    <div
                      key={`skeleton-${index}`}
                      className="bg-white rounded-2xl p-5 shadow-sm flex-shrink-0"
                      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                    >
                      <Skeleton className="w-full h-10 mb-4" />
                      <Skeleton className="w-full h-32 mb-4" />
                      <Skeleton className="w-3/4 h-6" />
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