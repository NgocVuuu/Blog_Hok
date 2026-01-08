import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

// Generic fetcher
const fetchData = async (endpoint: string, options: any = {}) => {
    try {
        const res = await axios.get(`${API_URL}/api/${endpoint}`, {
            params: { limit: 300 }, // Get all
            ...options
        });
        return res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
};

export const getGameData = async () => {
    const [heroes, equipment, arcana] = await Promise.all([
        fetchData('heroes'),
        fetchData('equipment'),
        fetchData('arcana')
    ]);

    return { heroes, equipment, arcana };
};
