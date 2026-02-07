import React from "react";
import ProjectHeader from "./_shared/ProjectHeader";
import SettingsSection from "./_shared/SettingsSection";

function ProjectCanvasPlayground() {
  return (
    <div>
      <ProjectHeader />

      <div className="flex">
        {/* Setting */}
        <SettingsSection />
        {/* canvas */}
      </div>
    </div>
  );
}

export default ProjectCanvasPlayground;
