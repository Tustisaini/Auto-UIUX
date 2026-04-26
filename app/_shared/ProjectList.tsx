"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Project = {
  id: number;
  projectId: string;
  projectName: string;
  device: string;
  theme?: string;
  createdOn: string;
};

function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/project");

      const projectsData = res.data?.projects;

      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      console.error("FETCH ERROR:", err?.response?.data || err);

      setError(
        err?.response?.data?.error || "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-lg font-semibold mb-3">
        Projects
      </h2>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">
          No projects found
        </p>
      ) : (
        <div className="divide-y border rounded-lg">
          {projects.map((project) => (
            <Link
              key={project.projectId}
              href={`/project/${project.projectId}`}
              className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">
                  {project.projectName || "Untitled Project"}
                </p>

                <p className="text-xs text-gray-400">
                  {project.device}
                  {project.theme && ` • ${project.theme}`}
                </p>
              </div>

              <span className="text-xs text-gray-400">
                {formatDate(project.createdOn)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;