import api from "./axios";

export interface Review {
    _id: string;
    order: string;
    gig: string;
    reviewer: { _id: string; name: string };
    reviewee: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const reviewAPI = {
    create: async (data: { orderId: string, rating: number, comment: string }) => {
        const response = await api.post("/reviews", data);
        return response.data;
    },
    getByGigId: async (gigId: string) => {
        const response = await api.get(`/reviews/gig/${gigId}`);
        return response.data;
    },
};
