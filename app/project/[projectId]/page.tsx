"use client";

import React, { useEffect, useState, useRef } from "react";
import ProjectHeader from "./_shared/ProjectHeader";
import SettingsSection from "./_shared/SettingsSection";
import { useParams } from "next/navigation";
import axios from "axios";
import { ProjectType, ScreenConfig } from "@/type/type";
import { Loader2Icon } from "lucide-react";
import Canvas from "./_shared/Canvas";

function ProjectCanvasPlayground() {
const params = useParams();
const projectId = params?.projectId as string;

const [projectDetail, setProjectDetail] = useState<ProjectType>();
const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
const [loading, setLoading] = useState(false);
const [loadingMsg, setLoadingMsg] = useState("Loading project");

const abortRef = useRef<AbortController | null>(null);
const hasFetchedOnce = useRef(false);

/* ================= LOAD PROJECT ================= */
useEffect(() => {
if (!projectId) return;

getProjectDetail();

return () => {
abortRef.current?.abort();
};
}, [projectId]);

/* ================= FETCH PROJECT ================= */
const getProjectDetail = async () => {
try {
setLoading(true);

const result = await axios.get(
`/api/project?projectId=${projectId}`
);

const project = result?.data?.projectDetail;
const screens = result?.data?.screenConfig ?? [];

setProjectDetail(project);

// ❌ NEVER render empty array (prevents flicker)
if (screens.length > 0) {
setScreenConfig(screens);
}

// ✅ trigger AI generation only once
if (screens.length === 0 && !hasFetchedOnce.current) {
hasFetchedOnce.current = true;

await generateScreenUIUX();

const refreshed = await axios.get(
`/api/project?projectId=${projectId}`
);

const newScreens = refreshed?.data?.screenConfig ?? [];

if (newScreens.length > 0) {
setScreenConfig(newScreens);
}
}

} catch (error: any) {
console.error("Fetch error:", error);
} finally {
setLoading(false);
}
};

/* ================= GENERATE UI ================= */
const generateScreenUIUX = async () => {
try {
if (!projectId) return;

setLoading(true);
setLoadingMsg("Generating UI...");

await axios.post("/api/generate-screen-ui/route.ts", {
projectId,
});
} catch (error) {
console.error("Generate error:", error);
} finally {
setLoading(false);
}
};

/* ================= UI ================= */
return (
<div>
<ProjectHeader />

{loading && (
<div className="absolute left-1/2 top-20 -translate-x-1/2 z-50">
<div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-blue-100 shadow-sm">
<Loader2Icon className="animate-spin" size={18} />
<span className="text-sm">{loadingMsg}</span>
</div>
</div>
)}

<div className="flex">
<SettingsSection projectDetail={projectDetail} />

<div className="flex-1">
<Canvas
projectDetail={projectDetail}
screenConfig={screenConfig}
/>
</div>
</div>
</div>
);
}

export default ProjectCanvasPlayground;