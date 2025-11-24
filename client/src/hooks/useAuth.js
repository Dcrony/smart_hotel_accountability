import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load to persist login
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const signIn = async (username, password) => {
        setLoading(true);
        try {
            const data = await apiService.login(username, password);
            setUser(data.user);
            return data.user;
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return { user, loading, signIn, signOut };
};

export default useAuth;