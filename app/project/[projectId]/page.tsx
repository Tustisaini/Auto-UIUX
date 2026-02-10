"use client";

import React, { useEffect, useState } from "react";
import ProjectHeader from "./_shared/ProjectHeader";
import SettingsSection from "./_shared/SettingsSection";
import { useParams } from "next/navigation";
import axios from "axios";
import { ProjectType, ScreenConfig } from "@/type/type";
import { Loader2Icon } from "lucide-react";

function ProjectCanvasPlayground() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [projectDetail, setProjectDetail] = useState<ProjectType | undefined>();
  const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Loading project");

  const generateScreenConfig = async (
    deviceType?: string,
    userInput?: string
  ) => {
    try {
      setLoading(true);
      setLoadingMsg("Generating screen config");

      const result = await axios.post("/api/generate-config", {
        projectId,
        deviceType,
        userInput,
      });

      console.log("🧠 AI RESPONSE:", result.data?.JSONAiResult);

      setScreenConfig(result.data?.JSONAiResult?.screens ?? []);
    } catch (error) {
      console.error("Error generating screen config:", error);
    } finally {
      setLoading(false);
    }
  };

  const GetProjectDetail = async () => {
    try {
      setLoading(true);
      setLoadingMsg("Loading project");

      const result = await axios.get(
        `/api/project?projectId=${projectId}`
      );

      const detail = result?.data?.projectDetail;
      const config = result?.data?.screenConfig ?? [];

      setProjectDetail(detail);
      setScreenConfig(config);

      if (config.length === 0) {
        await generateScreenConfig(detail?.device, detail?.userInput);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      GetProjectDetail();
    }
  }, [projectId]);

  return (
    <div>
      <ProjectHeader />

      {loading && (
        <div className="absolute left-1/2 top-20 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-blue-400 bg-blue-100 shadow-sm">
            <Loader2Icon className="animate-spin text-blue-600" size={18} />
            <span className="text-sm font-medium text-blue-700">
              {loadingMsg}
            </span>
          </div>
        </div>
      )}

      <div className="flex">
        <SettingsSection projectDetail={projectDetail} />
        <div className="flex-1">{/* canvas */}</div>
      </div>
    </div>
  );
}

export default ProjectCanvasPlayground;
