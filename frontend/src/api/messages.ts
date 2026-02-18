import api from "./axios";

export interface Message {
    _id: string;
    sender: string;
    receiver: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface ConversationUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export const messageAPI = {
    send: async (receiverId: string, message: string) => {
        const response = await api.post("/messages", { receiverId, message });
        return response.data;
    },
    getConversations: async () => {
        const response = await api.get("/messages/conversations");
        return response.data;
    },
    getMessages: async (userId: string) => {
        if (!userId) return [];
        const response = await api.get(`/messages/${userId}`);
        return response.data;
    },
};
