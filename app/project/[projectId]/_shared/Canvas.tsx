// Canvas.tsx
import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ScreenFrame from './ScreenFrame';
import { ProjectType, ScreenConfig } from '@/type/type';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  projectDetail: ProjectType | undefined,
  screenConfig: ScreenConfig[],
  loading?: boolean
}

function Canvas({ projectDetail, screenConfig, loading }: Props) {
  const [panningEnabled, setPanningEnabled] = useState(true);

  const isMobile = projectDetail?.device === 'mobile';

  const SCREEN_WIDTH = isMobile ? 400 : 600;
  const SCREEN_HEIGHT = isMobile ? 800 : 800;
  const GAP = isMobile ? 20 : 40;

  return (
    <div
      className="w-full h-screen bg-gray-100"
      style={{
        backgroundImage: "radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }}
    >
      <TransformWrapper
        initialScale={0.7}
        minScale={0.7}
        maxScale={3}
        initialPositionX={50}
        initialPositionY={50}
        limitToBounds={false}
        wheel={{ step: 0.8 }}
        doubleClick={{ disabled: false }}
        panning={{ disabled: !panningEnabled }}
      >
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
         {screenConfig?.map((screen, index) =>
  screen?.code ? (
    <ScreenFrame
      key={`${screen.screenId || 'screen'}-${index}`}
      screenId={screen.screenId}
      x={index * (SCREEN_WIDTH + GAP)}
      y={0}
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      setPanningEnabled={setPanningEnabled}
      htmlCode={screen?.code}
      projectDetail={projectDetail}
    />
  ) : (
    <div
      key={`skeleton-${index}`}
      className="bg-white rounded-2xl p-5 shadow-sm absolute"
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        transform: `translate(${index * (SCREEN_WIDTH + GAP)}px, 0px)`
      }}
    >
      <Skeleton className="w-full rounded-lg h-10 mb-4" />
      <Skeleton className="w-full rounded-lg h-32 mb-4" />
      <Skeleton className="w-3/4 rounded-lg h-6" />
    </div>
  )
)}

        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default Canvas;
