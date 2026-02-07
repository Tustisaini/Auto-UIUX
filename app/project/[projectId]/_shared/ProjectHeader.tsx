import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import Image from "next/image";
import React from "react";

const BRAND_COLOR = "oklch(0.696 0.1759 28.14)";

function ProjectHeader() {
  return (
    <div className="flex items-center justify-between p-4 shadow">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="logo" width={40} height={40} />
        <h1 className="text-2xl font-bold text-gray-800">Auto UIUX</h1>
      </div>

      <Button
        className="text-white"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>
    </div>
  );
}

export default ProjectHeader;
