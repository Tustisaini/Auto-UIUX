"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { THEME_NAME_LIST, THEMES } from "@/data/Themes";
import { Camera, Share } from "lucide-react";
import { useState } from "react";

const BRAND_COLOR = "oklch(0.696 0.1759 28.14)";

function SettingsSection() {
  const [selectedTheme, setSelectedTheme] = useState("AUROR_INK");
  const [projectName, setProjectName] = useState("");
  const [userNewScreenInput, setUserNewScreenInput] = useState<string>();

  return (
    <div className="w-75 min-h-screen p-5 border-r">
      <h2 className="font-bold text-lg">Settings</h2>

      <div className="mt-3">
        <h2 className="text-sm mb-1 font-semibold">Project Name</h2>
        <Input
          placeholder="Project Name"
          onChange={(event) => setProjectName(event.target.value)}
        />
      </div>

      <div className="mt-5">
        <h2 className="text-sm mb-1 font-semibold">Generate New Screen</h2>
        <Textarea
          placeholder="Enter Prompt to generate screen using AI"
          onChange={(event) => setUserNewScreenInput(event.target.value)}
        />
        <Button
          size="sm"
          className="mt-2 w-full text-white"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Generate with AI
        </Button>
      </div>

      <div className="mt-5">
        <h2 className="text-sm mb-1 font-semibold">Themes</h2>

        <div className="h-[200px] overflow-auto space-y-3">
          {THEME_NAME_LIST.map((theme) => {
            const isSelected = theme === selectedTheme;

            return (
              <div
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className="space-y-1 p-3 border rounded-xl mb-2 cursor-pointer transition"
                style={{
                  borderColor: isSelected ? BRAND_COLOR : undefined,
                  backgroundColor: isSelected
                    ? `color-mix(in oklch, ${BRAND_COLOR} 20%, transparent)`
                    : undefined,
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
                  <div
  className="h-4 w-4 rounded-full"
  style={{
    background: `linear-gradient(
      135deg,
      ${THEMES[theme].background},
      ${THEMES[theme].primary},
      ${THEMES[theme].accent}
    )`,
  }}
/>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-sm mb-1 font-semibold">Extras</h2>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" className="mt-2">
            <Camera />
            Screenshot
          </Button>
          <Button size="sm" variant="outline" className="mt-2">
            <Share />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsSection;
