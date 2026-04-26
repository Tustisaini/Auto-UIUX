"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { THEME_NAME_LIST, THEMES } from "@/data/Themes";
import { ProjectType } from "@/type/type";
import { Camera, Share } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const BRAND_COLOR = "oklch(0.696 0.1759 28.14)";

type Props = {
  projectDetail: ProjectType | undefined;
};

function SettingsSection({ projectDetail }: Props) {
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof THEMES>("AURORA_INK");

  const [projectName, setProjectName] = useState("");
  const [userNewScreenInput, setUserNewScreenInput] = useState("");

  const [isThemeTouched, setIsThemeTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= SYNC PROJECT ================= */
  useEffect(() => {
    if (!projectDetail) return;

    setProjectName(projectDetail.projectName ?? "");

    if (!isThemeTouched && projectDetail.theme) {
      setSelectedTheme(projectDetail.theme as keyof typeof THEMES);
    }
  }, [projectDetail, isThemeTouched]);

  /* ================= SAVE PROJECT NAME (DEBOUNCED) ================= */
  useEffect(() => {
    if (!projectDetail?.projectId) return;

    const timer = setTimeout(async () => {
      try {
        await axios.put("/api/project", {
          projectId: projectDetail.projectId,
          projectName,
        });
      } catch (err) {
        console.error("Project name update failed:", err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [projectName, projectDetail?.projectId]);

  /* ================= THEME UPDATE ================= */
  const updateTheme = async (theme: keyof typeof THEMES) => {
    if (!projectDetail?.projectId) return;

    const prevTheme = selectedTheme;

    setSelectedTheme(theme);
    setIsThemeTouched(true);
    setSaving(true);

    try {
      await axios.put("/api/project", {
        projectId: projectDetail.projectId,
        theme,
      });
    } catch (err) {
      console.error("Theme update failed:", err);
      setSelectedTheme(prevTheme); // rollback
    } finally {
      setSaving(false);
    }
  };

  /* ================= AI SCREEN GENERATION ================= */
  const generateScreen = async () => {
    if (!projectDetail?.projectId || !userNewScreenInput) return;

    try {
      setSaving(true);

      await axios.post("/api/generate-project", {
        projectId: projectDetail.projectId,
        userInput: userNewScreenInput,
        deviceType: projectDetail.device,
      });

      setUserNewScreenInput("");
    } catch (err) {
      console.error("AI generation failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-75 min-h-screen p-5 border-r">
      <h2 className="font-bold text-lg">Settings</h2>

      {/* PROJECT NAME */}
      <div className="mt-3">
        <h2 className="text-sm mb-1 font-semibold">Project Name</h2>
        <Input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      {/* GENERATE SCREEN */}
      <div className="mt-5">
        <h2 className="text-sm mb-1 font-semibold">
          Generate New Screen
        </h2>

        <Textarea
          placeholder="Enter Prompt to generate screen using AI"
          value={userNewScreenInput}
          onChange={(e) => setUserNewScreenInput(e.target.value)}
        />

        <Button
          size="sm"
          className="mt-2 w-full text-white"
          style={{ backgroundColor: BRAND_COLOR }}
          onClick={generateScreen}
          disabled={saving}
        >
          Generate with AI
        </Button>
      </div>

      {/* THEMES */}
      <div className="mt-5">
        <h2 className="text-sm mb-1 font-semibold">Themes</h2>

        <div className="h-[200px] overflow-auto space-y-3">
          {THEME_NAME_LIST.map((theme) => {
            const isSelected = theme === selectedTheme;

            return (
              <div
                key={theme}
                onClick={() => updateTheme(theme)}
                className="space-y-1 p-3 border rounded-xl cursor-pointer transition"
                style={{
                  borderColor: isSelected ? BRAND_COLOR : undefined,
                  backgroundColor: isSelected
                    ? `color-mix(in oklch, ${BRAND_COLOR} 20%, transparent)`
                    : undefined,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <h2 className="text-sm font-medium">{theme}</h2>

                <div className="flex gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ background: THEMES[theme].primary }}
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ background: THEMES[theme].secondary }}
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ background: THEMES[theme].accent }}
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ background: THEMES[theme].background }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXTRAS */}
      <div className="mt-5">
        <h2 className="text-sm mb-1 font-semibold">Extras</h2>

        <div className="flex gap-3">
          <Button size="sm" variant="outline">
            <Camera />
            Screenshot
          </Button>

          <Button size="sm" variant="outline">
            <Share />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsSection;