"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // ✅ added

function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // ✅ added

  useEffect(() => {
    getProjectList();
  }, []);

  const getProjectList = async () => {
    try {
      const result = await axios.get("/api/project");
      setProjects(result.data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const openProject = (projectId: string) => {
    router.push(`/project/${projectId}`);// ✅ navigation
  };

  return (
    <div className="px-10 md:px-24 lg:px-44 xl:px-56 py-10">
      <h2 className="font-bold text-2xl mb-6">My Projects</h2>

      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              onClick={() => openProject(project.projectId)} // ✅ added
              className="p-5 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer"
            >
              <h3 className="font-semibold text-lg">
                {project.projectName || "Untitled Project"}
              </h3>

              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {project.userInput}
              </p>

              <p className="text-xs text-gray-400 mt-3">
                Device: {project.device}
              </p>

              {/* ✅ FIX: use createdOn */}
              <p className="text-xs text-gray-400 mt-1">
                Created:{" "}
                {project.createdOn
                  ? new Date(project.createdOn).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;