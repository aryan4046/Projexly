import api from "./axios";

export const projectAPI = {
    create: async (projectData: any) => {
        const response = await api.post("/projects", projectData);
        return response.data;
    },
    getMyProjects: async () => {
        const response = await api.get("/projects/my-projects");
        return response.data;
    },
    getOpenProjects: async () => {
        const response = await api.get("/projects/open");
        return response.data;
    },
    getProjectById: async (id: string) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },
    update: async (id: string, projectData: any) => {
        const response = await api.put(`/projects/${id}`, projectData);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    },
};
