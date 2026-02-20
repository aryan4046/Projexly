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
    verifyOTP: async (data: { email: string, otp: string }) => {
        const response = await api.post("/auth/verify-otp", data);
        return response.data;
    },
    resendOTP: async (data: { email: string }) => {
        const response = await api.post("/auth/resend-otp", data);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get("/users/me");
        return response.data;
    },
    getUserById: async (id: string) => {
        const response = await api.get(`/users/${id}`);
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
