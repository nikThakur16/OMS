import { Project } from "@/types/admin/project"; // Adjust path as needed

// The API project type (raw from backend)
type ApiProject = {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  status?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  manager?: string; // or populated object
  teamIds?: string[];
  departmentIds?: string[];
  customFields?: any;
  deletedAt?: string | Date;
  archivedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export function adaptProject(apiProject: ApiProject): Project {
  return {
    id: apiProject._id,
    name: apiProject.name,
    description: apiProject.description || "",
    status: apiProject.status || "active",
    startDate: apiProject.startDate ? String(apiProject.startDate) : "",
    endDate: apiProject.endDate ? String(apiProject.endDate) : "",
    manager: apiProject.manager || "",
    teamSize: apiProject.teamIds ? apiProject.teamIds.length : 0,
    // You may need to fetch tasksCount/tags/customer/favorite from elsewhere or set defaults:
    tasksCount: 0,
    tags: [],
    customer: "",
    favorite: false,
    // Add any other fields your frontend expects, with sensible defaults
    // progress: 0, priority: "medium", etc.
  };
}
