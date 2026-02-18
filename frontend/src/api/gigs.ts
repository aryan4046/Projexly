import api from "./axios";

export interface Gig {
    _id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    deliveryTime: number;
    revisions: number;
    features: string[];
    images: string[];
    freelancer: {
        _id: string;
        name: string;
        email: string;
        portfolio?: string[];
    };
    isActive: boolean;
    rating: number;
    reviewCount: number;
    createdAt: string;
}

export const gigAPI = {
    getAll: async (filters: any) => {
        // Convert filters object to query string manually or let axios handle params
        const response = await api.get("/gigs", { params: filters });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/gigs/${id}`);
        return response.data;
    },
    getMyGigs: async () => {
        const response = await api.get("/gigs/my-gigs");
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post("/gigs", data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/gigs/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/gigs/${id}`);
        return response.data;
    },
};
