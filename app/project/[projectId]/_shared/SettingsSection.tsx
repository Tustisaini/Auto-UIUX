"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { THEME_NAME_LIST, THEMES } from "@/data/Themes";
import { ProjectType } from "@/type/type";
import { Camera, Share } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { SettingContext } from "@/context/SettingContext";

const BRAND_COLOR = "oklch(0.696 0.1759 28.14)";

type Props = {
  projectDetail: ProjectType | undefined;
};

function SettingsSection({ projectDetail }: Props) {
  const [selectedTheme, setSelectedTheme] = useState("AUROR_INK");
  const [projectName, setProjectName] = useState("");
  const [userNewScreenInput, setUserNewScreenInput] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const { setSettingDetail }: any = useContext(SettingContext);

  /* ---------------- INIT ONLY ONCE ---------------- */
  useEffect(() => {
    if (!projectDetail || isInitialized) return;

    setProjectName(projectDetail.projectName ?? "");
    setSelectedTheme(projectDetail.theme ?? "AUROR_INK");

    setSettingDetail((prev: any) => ({
      ...prev,
      theme: projectDetail.theme ?? "AUROR_INK",
      projectName: projectDetail.projectName ?? "",
    }));

    setIsInitialized(true);
  }, [projectDetail, isInitialized, setSettingDetail]);

  /* ---------------- AUTO SAVE PROJECT NAME ---------------- */
  useEffect(() => {
    if (!projectDetail?.projectId) return;

    const timeout = setTimeout(async () => {
      try {
        // ✅ FIXED API
        await fetch("/api/generateScreenConfig", {
          method: "POST",
          body: JSON.stringify({
            projectId: projectDetail.projectId,
            projectName,
          }),
        });
      } catch (err) {
        console.error("SAVE ERROR:", err);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [projectName, projectDetail?.projectId]);

  /* ---------------- THEME SELECT ---------------- */
  const onThemeSelect = async (theme: string) => {
    setSelectedTheme(theme);

    setSettingDetail((prev: any) => ({
      ...prev,
      theme,
    }));

    if (projectDetail?.projectId) {
      // ✅ FIXED API
      await fetch("/api/generateScreenConfig", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectDetail.projectId,
          theme,
        }),
      });
    }
  };

  return (
    <div className="w-75 min-h-screen p-6 border-r bg-[var(--background)] text-[var(--foreground)]">
      <h2 className="font-bold text-xl mb-4">Settings</h2>

      {/* Project Name */}
      <div className="mt-3">
        <h2 className="text-sm mb-2 font-semibold">Project Name</h2>
        <Input
          placeholder="Project Name"
          value={projectName}
          className="border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
          onChange={(event) => {
            const value = event.target.value;
            setProjectName(value);
            setSettingDetail((prev: any) => ({
              ...prev,
              projectName: value,
            }));
          }}
        />
      </div>

      {/* Generate New Screen */}
      <div className="mt-6">
        <h2 className="text-sm mb-2 font-semibold">Generate New Screen</h2>
        <Textarea
          placeholder="Enter Prompt to generate screen using AI"
          value={userNewScreenInput}
          className="border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
          onChange={(event) => setUserNewScreenInput(event.target.value)}
        />

        {/* ✅ ONLY ADDED onClick (NO OTHER CHANGE) */}
        <Button
          size="sm"
          className="mt-3 w-full text-white shadow-md hover:shadow-lg transition"
          style={{ backgroundColor: BRAND_COLOR }}
          onClick={async () => {
            if (!projectDetail?.projectId || !userNewScreenInput) return;

            try {
              await fetch("/api/generateScreenConfig", {
                method: "POST",
                body: JSON.stringify({
                  projectId: projectDetail.projectId,
                  userInput: userNewScreenInput,
                  device: "mobile",
                }),
              });

              setUserNewScreenInput("");
            } catch (err) {
              console.error("AI GENERATE ERROR:", err);
            }
          }}
        >
          Generate with AI
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
                className={`space-y-1 p-4 border rounded-xl mb-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "shadow-lg border-[var(--primary)] bg-[var(--card)]"
                    : "hover:shadow-md hover:border-[var(--muted)]"
                }`}
              >
                <h2 className="text-sm font-medium">{theme}</h2>
                <div className="flex gap-2 mt-1">
                  <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme].primary }} />
                  <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme].secondary }} />
                  <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme].accent }} />
                  <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme].background }} />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${THEMES[theme].background}, ${THEMES[theme].primary}, ${THEMES[theme].accent})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extras */}
      <div className="mt-6">
        <h2 className="text-sm mb-2 font-semibold">Extras</h2>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <Camera /> Screenshot
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <Share /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsSection;