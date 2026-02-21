import api from "./axios";

export interface Notification {
    _id: string;
    recipient: string;
    sender?: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    type: "proposal_new" | "proposal_accepted" | "order_status" | "message";
    title: string;
    message: string;
    isRead: boolean;
    relatedId?: string;
    createdAt: string;
}

export const notificationAPI = {
    getAll: async (): Promise<Notification[]> => {
        const response = await api.get("/notifications");
        return response.data;
    },

    markAsRead: async (id: string): Promise<Notification> => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<{ message: string }> => {
        const response = await api.put("/notifications/read-all");
        return response.data;
    },
};
