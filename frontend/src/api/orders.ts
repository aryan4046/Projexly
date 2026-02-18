import api from "./axios";
import { Gig } from "./gigs";

export interface Order {
    _id: string;
    gig: Gig;
    buyer: { _id: string; name: string; email: string };
    seller: { _id: string; name: string; email: string };
    price: number;
    status: "active" | "completed" | "cancelled";
    requirements: string;
    isCompleted: boolean;
    deliveredWork: string[];
    createdAt: string;
}

export const orderAPI = {
    create: async (gigId: string, requirements: string) => {
        const response = await api.post("/orders", { gigId, requirements });
        return response.data;
    },
    getMyOrders: async () => {
        const response = await api.get("/orders");
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },
    updateStatus: async (id: string, status: "completed" | "cancelled") => {
        const response = await api.put(`/orders/${id}/status`, { status });
        return response.data;
    },
    deliverWork: async (id: string, deliveredFiles: string[]) => {
        const response = await api.put(`/orders/${id}/deliver`, { deliveredFiles });
        return response.data;
    },
};
