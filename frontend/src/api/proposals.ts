import api from "./axios";

export interface Proposal {
    _id: string;
    project: {
        _id: string;
        title: string;
        budget: number;
        status: string;
        student?: {
            name: string;
        };
    };
    freelancer: {
        _id: string;
        name: string;
        email: string;
    };
    message: string;
    bidAmount: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export const proposalAPI = {
    create: async (data: { projectId: string; message: string; bidAmount: number }) => {
        const response = await api.post("/proposals", data);
        return response.data;
    },
    getMyProposals: async () => {
        const response = await api.get("/proposals/my-proposals");
        return response.data;
    },
    getReceivedProposals: async () => {
        const response = await api.get("/proposals/received");
        return response.data;
    },
    getProjectProposals: async (projectId: string) => {
        const response = await api.get(`/proposals/project/${projectId}`);
        return response.data;
    },
    withdraw: async (id: string) => {
        const response = await api.delete(`/proposals/${id}`);
        return response.data;
    },
    accept: async (id: string, paymentMethodId: string) => {
        const response = await api.put(`/proposals/${id}/accept`, { paymentMethodId });
        return response.data;
    },
    reject: async (id: string) => {
        const response = await api.put(`/proposals/${id}/reject`, { status: 'rejected' });
        return response.data;
    }
};
