import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiService = {

    // ✅ JWT Headers
    getHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    },

    // ✅ AUTH
    registerUser: async (data) => {
        const res = await axios.post(
            `${API_URL}/auth/register`,
            data,
            apiService.getHeaders()
        );
        return res.data;
    },

    login: async (username, password) => {
        const res = await axios.post(`${API_URL}/auth/login`, { username, password });
        
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        return res.data;
    },


    // ✅ ADMIN — USER MANAGEMENT
    getUsers: async (page = 1, search = '') => {
        const res = await axios.get(
            `${API_URL}/auth/users?page=${page}&search=${search}`,
            apiService.getHeaders()
        );
        return res.data;
    },

    createUser: async (data) => {
        const res = await axios.post(
            `${API_URL}/auth/users`,
            data,
            apiService.getHeaders()
        );
        return res.data;
    },

    deleteUser: async (id) => {
        const res = await axios.delete(
            `${API_URL}/auth/users/${id}`,
            apiService.getHeaders()
        );
        return res.data;
    },

    updateUserRole: async (id, role) => {
        const res = await axios.put(
            `${API_URL}/auth/users/${id}/role`,
            { role },
            apiService.getHeaders()
        );
        return res.data;
    },


    // ✅ STAFF — CREATE TRANSACTION
    createTransaction: async (data) => {
        const res = await axios.post(
            `${API_URL}/transactions`,
            data,
            apiService.getHeaders()
        );
        return res.data;
    },

    // ✅ STAFF — DAILY RECORD
    fetchMyDayTransactions: async () => {
        const res = await axios.get(
            `${API_URL}/transactions/myday`,
            apiService.getHeaders()
        );
        return res.data;
    },


    // ✅ ADMIN — TODAY SUMMARY
    fetchSummary: async () => {
        const res = await axios.get(
            `${API_URL}/transactions/summary`,
            apiService.getHeaders()
        );
        return res.data; // contains .aggregate
    },

    // ✅ ADMIN — RECENT TRANSACTIONS
    fetchRecent: async () => {
        const res = await axios.get(
            `${API_URL}/transactions/recent`,
            apiService.getHeaders()
        );

        return res.data || [];
    }
};

export default apiService;
