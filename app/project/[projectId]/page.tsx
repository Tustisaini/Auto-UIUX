"use client";

import React, { useEffect, useState, useContext } from "react";
import ProjectHeader from "./_shared/ProjectHeader";
import SettingsSection from "./_shared/SettingsSection";
import { useParams } from "next/navigation";
import axios from "axios";
import { ProjectType, ScreenConfig } from "@/type/type";
import { Loader2Icon } from "lucide-react";
import Canvas from "./_shared/Canvas";
import { SettingContext } from "@/context/SettingContext";
import { RefreshDataContext } from "@/context/RefreshDataContext";

function ProjectCanvasPlayground() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [projectDetail, setProjectDetail] = useState<ProjectType>();
  const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Loading project");

  const { setSettingDetail } = useContext(SettingContext);
  const { refreshData } = useContext(RefreshDataContext);

  useEffect(() => { if (projectId) getProjectDetail(); }, [projectId]);
  useEffect(() => { if (refreshData?.method === "screenConfig") getProjectDetail(); }, [refreshData]);

  const getProjectDetail = async () => {
    try {
      setLoading(true);
      setLoadingMsg("Loading project");

      const result = await axios.get(`/api/project?projectId=${projectId}`);
      const detail: ProjectType = result?.data?.projectDetail;
      const config: ScreenConfig[] = result?.data?.screenConfig ?? [];

      setProjectDetail(detail);
      setScreenConfig(config);
      setSettingDetail(detail);

      if (config.length === 0) {
        setLoadingMsg("Generating screens...");
        await axios.post("/api/generateScreenConfig", {
          projectId,
          userInput: detail?.userInput || "Create app screens",
          device: detail?.device,
          theme: detail?.theme,
        });

        const retry = await axios.get(`/api/project?projectId=${projectId}`);
        const newDetail: ProjectType = retry?.data?.projectDetail;
        const newConfig: ScreenConfig[] = retry?.data?.screenConfig ?? [];

        // Never overwrite projectName in frontend
        setProjectDetail(prev => prev ? { ...prev, ...newDetail, projectName: prev.projectName } : newDetail);

        setScreenConfig(newConfig);
        if (newConfig.length > 0) generateScreenUIUX(newConfig);
      } else generateScreenUIUX(config);
    } catch (err) {
      console.error("❌ Error fetching project:", err);
    } finally { setLoading(false); }
  };

  const generateScreenUIUX = async (screens: ScreenConfig[]) => {
    setLoading(true);
    setScreenConfig(prev => prev.map(s => ({ ...s, code: s.code || undefined })));

    await Promise.all(screens.map(async (screen, index) => {
      if (!screen?.screenId || screen?.code) return;
      setLoadingMsg(`Generating ${screen.screenName || `Screen ${index + 1}`}`);
      try {
        const result = await axios.post("/api/generate-screen-ui", {
          projectId,
          screenId: screen.screenId,
          screenName: screen.screenName || `Screen ${index + 1}`,
          purpose: screen.purpose,
          screenDescription: screen.screenDescription,
        });
        const code = result?.data?.code;
        if (!code) return;

        setScreenConfig(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], code };
          return updated;
        });
      } catch (err) {
        console.error(`❌ Error generating screen ${index + 1}:`, err);
      }
    }));

    setLoading(false);
  };

  return (
    <div>
      {/* Always display app name */}
      <ProjectHeader />

      {loading && screenConfig.every(s => !s.code) && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="flex gap-2 px-4 py-3 bg-blue-100 border rounded-xl">
            <Loader2Icon className="animate-spin" />
            {loadingMsg}
          </div>
        </div>
      )}

      <div className="flex">
        <SettingsSection projectDetail={projectDetail} screenDescrption={undefined} />
        <div className="flex-1">
          <Canvas projectDetail={projectDetail} screenConfig={screenConfig} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default ProjectCanvasPlayground;