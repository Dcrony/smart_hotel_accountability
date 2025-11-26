import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiService = {
    // Helper to get headers with JWT token
    getHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    },

    registerUser: async (data) => {
    const response = await axios.post(
        `${API_URL}/auth/register`,
        data,
        apiService.getHeaders()
    );
    return response.data;
},

getUsers: async (page, search) => {
  const res = await axios.get(`${API_URL}/auth/users?page=${page}&search=${search}`, apiService.getHeaders());
  return res.data;
},

createUser: async (data) => {
  const res = await axios.post(`${API_URL}/auth/users`, data, apiService.getHeaders());
  return res.data;
},

deleteUser: async (id) => {
  const res = await axios.delete(`${API_URL}/auth/users/${id}`, apiService.getHeaders());
  return res.data;
},

updateUserRole: async (id, role) => {
  const res = await axios.put(`${API_URL}/auth/users/${id}/role`, { role }, apiService.getHeaders());
  return res.data;
},





    // 1. Auth: Login
    login: async (username, password) => {
        const response = await axios.post(`${API_URL}/auth/login`, { username, password });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    // 2. Transaction: Create (Staff)
    createTransaction: async (data) => {
        const response = await axios.post(
            `${API_URL}/transactions`,
            data,
            apiService.getHeaders()
        );
        return response.data;
    },

    // 3. Staff: Fetch OWN daily transactions
    fetchMyDayTransactions: async () => {
        const response = await axios.get(
            `${API_URL}/transactions/myday`,
            apiService.getHeaders()
        );
        return response.data; // {transactions, summary}
    },

    // 4. Admin: Fetch TODAY summary
    fetchSummary: async () => {
        const response = await axios.get(
            `${API_URL}/transactions/summary`,
            apiService.getHeaders()
        );
        return response.data; // {aggregate, staffSummaries, date, allTransactions?}
    },

    // 5. Admin: Fetch recent transactions (last 20)
    fetchRecent: async () => {
        const response = await axios.get(
            `${API_URL}/transactions/recent`,
            apiService.getHeaders()
        );

        // If backend doesn’t have /recent, fallback to summary
        const allTx = response.data || [];
        return allTx.slice(0, 20); // newest first

    }
};

export default apiService;
