import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Add restart function to campaignsAPI
export const restartCampaign = async (id: string) => {
    const response = await axios.post(`${API_BASE}/campaigns/${id}/restart`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};
