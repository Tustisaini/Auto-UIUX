"use client";

import { Button } from "@/components/ui/button";
import { SettingContext } from "@/context/SettingContext";
import { Loader2, Save } from "lucide-react";
import Image from "next/image";
import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const BRAND_COLOR = "oklch(0.696 0.1759 28.14)";

function ProjectHeader() {
  const { settingsDetail }: any = useContext(SettingContext);
  const [loading, setLoading] = useState(false);

  const OnSave = async () => {
    if (!settingsDetail?.projectId) {
      toast.error("Project ID is missing");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        theme: settingsDetail?.theme,
        projectId: settingsDetail?.projectId,
        projectName: settingsDetail?.projectName,
      };

      const result = await axios.put("/api/project", payload);

      if (result.status === 200) toast.success("Settings saved successfully");
      else toast.error("Something went wrong while saving");
    } catch (error: any) {
      console.error("Save failed", error);
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 shadow">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="logo" width={40} height={40} />
        {/* Always show App name */}
        <h1 className="text-2xl font-bold text-gray-800">autoUIUX</h1>
      </div>

      <Button
        className="text-white flex items-center gap-2"
        style={{ backgroundColor: BRAND_COLOR }}
        onClick={OnSave}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {loading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

export default ProjectHeader;