import api from "./axios";

export const authAPI = {
    login: async (credentials: any) => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    },
    register: async (userData: any) => {
        const response = await api.post("/auth/register", userData);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get("/users/me");
        return response.data;
    },
    switchRole: async () => {
        const response = await api.put("/users/switch-role");
        return response.data;
    },
    updateProfile: async (data: any) => {
        const response = await api.put("/users/profile", data);
        return response.data;
    },
    deleteAccount: async () => {
        const response = await api.delete("/users/profile");
        return response.data;
    },
};
