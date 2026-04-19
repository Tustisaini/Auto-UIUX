"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { THEME_NAME_LIST, THEMES } from "@/data/Themes";
import { ProjectType } from "@/type/type";
import { Loader2Icon, Share } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { SettingContext } from "@/context/SettingContext";
import axios from "axios";
import { RefreshDataContext } from "@/context/RefreshDataContext";
import { toast } from "sonner";

const BRAND_COLOR = "oklch(0.696 0.1759 28.14)";

type Props = {
  projectDetail: ProjectType | undefined;
  screenDescrption: string | undefined;
};

function SettingsSection({ projectDetail, screenDescrption }: Props) {
  const [selectedTheme, setSelectedTheme] = useState("AUROR_INK");
  const [projectName, setProjectName] = useState("");
  const [userNewScreenInput, setUserNewScreenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Generating...");

  const { setSettingDetail }: any = useContext(SettingContext);
  const { setRefreshData } = useContext(RefreshDataContext);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!projectDetail) return;

    const name = projectDetail.projectName || "Untitled Project";

    setProjectName(name);
    setSelectedTheme(projectDetail.theme || "AUROR_INK");

    setSettingDetail((prev: any) => ({
      ...prev,
      theme: projectDetail.theme || "AUROR_INK",
      projectName: name,
    }));
  }, [projectDetail]);

  /* ---------------- AUTO SAVE PROJECT NAME ---------------- */
  useEffect(() => {
    if (!projectDetail?.projectId) return;

    const timeout = setTimeout(async () => {
      try {
        await fetch("/api/project", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: projectDetail.projectId,
            projectName, // Only save project name, header untouched
          }),
        });
      } catch (err) {
        console.error("SAVE ERROR:", err);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [projectName, projectDetail?.projectId]);

  /* ---------------- THEME ---------------- */
  const onThemeSelect = async (theme: string) => {
    setSelectedTheme(theme);

    setSettingDetail((prev: any) => ({ ...prev, theme }));

    if (projectDetail?.projectId) {
      await fetch("/api/generateScreenConfig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectDetail.projectId,
          theme,
        }),
      });
    }
  };

  /* ---------------- GENERATE SCREEN ---------------- */
  const generateNewScreen = async () => {
    if (!projectDetail?.projectId || !userNewScreenInput || loading) return;

    setLoading(true);
    setLoadingMsg("Generating screen...");

    try {
      await axios.post("/api/generateScreenConfig", {
        projectId: projectDetail.projectId,
        userInput: userNewScreenInput,
        device: projectDetail.device || "mobile",
        theme: selectedTheme,
        oldScreenDescription: screenDescrption,
      });

      setUserNewScreenInput("");
      setRefreshData({ method: "screenConfig", date: Date.now() });
    } catch (err) {
      console.error("AI ERROR:", err);
      setLoadingMsg("Failed... try again");
    }

    setLoading(false);
  };

  /* ---------------- SHARE PROJECT ---------------- */
  const shareProject = async () => {
    if (!projectDetail?.projectId) return;
    const url = `${window.location.origin}/project/${projectDetail.projectId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Project link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="w-75 min-h-screen p-6 border-r bg-[var(--background)] text-[var(--foreground)]">
      <h2 className="font-bold text-xl mb-4">Settings</h2>

      {/* Project Name */}
      <div className="mt-3">
        <h2 className="text-sm mb-2 font-semibold">Project Name</h2>
        <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
      </div>

      {/* Generate Screen */}
      <div className="mt-6">
        <h2 className="text-sm mb-2 font-semibold">Generate New Screen</h2>
        <Textarea
          placeholder="Enter Prompt..."
          value={userNewScreenInput}
          onChange={(e) => setUserNewScreenInput(e.target.value)}
        />
        <Button
          size="sm"
          className="mt-3 w-full text-white"
          style={{ backgroundColor: BRAND_COLOR }}
          onClick={generateNewScreen}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2Icon className="animate-spin mr-2" />
              {loadingMsg}
            </>
          ) : (
            "Generate with AI"
          )}
        </Button>
      </div>

      {/* Themes */}
      <div className="mt-6">
        <h2 className="text-sm mb-2 font-semibold">Themes</h2>
        <div className="h-[220px] overflow-auto space-y-3">
          {THEME_NAME_LIST.map((theme) => {
            const isSelected = theme === selectedTheme;
            return (
              <div
                key={theme}
                onClick={() => onThemeSelect(theme)}
                className={`p-4 border rounded-xl cursor-pointer ${
                  isSelected
                    ? "shadow-lg border-[var(--primary)] bg-[var(--card)]"
                    : "hover:shadow-md"
                }`}
              >
                <h2 className="text-sm font-medium">{theme}</h2>
                <div className="flex gap-2 mt-1">
                  <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme].primary }} />
                  <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme].secondary }} />
                  <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme].accent }} />
                  <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme].background }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extras: Share Only */}
      <div className="mt-6">
        <h2 className="text-sm mb-2 font-semibold">Extras</h2>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={shareProject}>
            <Share /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsSection;