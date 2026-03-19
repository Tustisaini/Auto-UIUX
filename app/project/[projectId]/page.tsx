"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
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
  const [screenConfigOriginal, setScreenConfigOriginal] = useState<ScreenConfig[]>([]);

  const { setSettingDetail } = useContext(SettingContext);
  const { refreshData } = useContext(RefreshDataContext);

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Loading project");

  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (projectId) getProjectDetail();
  }, [projectId]);

  useEffect(() => {
    if (refreshData?.method === "screenConfig") {
      hasGeneratedRef.current = false; // ✅ IMPORTANT FIX
      getProjectDetail();
    }
  }, [refreshData]);

  useEffect(() => {
    if (
      projectDetail &&
      screenConfigOriginal.length > 0 &&
      screenConfigOriginal.some((screen) => !screen.code) &&
      !hasGeneratedRef.current
    ) {
      hasGeneratedRef.current = true;
      generateScreenUIUX();
    }
  }, [projectDetail, screenConfigOriginal]);

  const getProjectDetail = async () => {
    try {
      setLoading(true);

      const result = await axios.get(`/api/project?projectId=${projectId}`);

      const detail = result?.data?.projectDetail;
      const config = result?.data?.screenConfig ?? [];

      setProjectDetail(detail);
      setScreenConfig(config);
      setScreenConfigOriginal(config);

      setSettingDetail(detail);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateScreenUIUX = async () => {
    try {
      setLoading(true);

      for (let index = 0; index < screenConfigOriginal.length; index++) {
        const screen = screenConfigOriginal[index];

        if (screen?.code) continue;

        const result = await axios.post("/api/generate-screen-ui", {
          projectId,
          screenId: screen?.id || screen?.screenId,
          screenName: screen?.screenName || `Screen ${index + 1}`,
          purpose: screen?.purpose,
        });

        const code = result.data?.code;

        setScreenConfig((prev) =>
          prev.map((s, i) => (i === index ? { ...s, code } : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProjectHeader />

      {loading && (
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
          <Canvas projectDetail={projectDetail} screenConfig={screenConfig} />
        </div>
      </div>
    </div>
  );
}

export default ProjectCanvasPlayground;