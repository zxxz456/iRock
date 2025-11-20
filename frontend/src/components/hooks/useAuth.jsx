import { useState, useEffect } from 'react';

/**
 * Custom hook to get current authenticated user from localStorage.
 * Returns user object with permissions or null if not logged in.
 */

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Get user and token from localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    const isAuthenticated = () => {
        // Check localStorage directly for immediate updates
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        return !!storedToken && !!storedUser;
    };

    const isStaff = () => {
        // Check localStorage directly for immediate updates
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return false;
        const userData = JSON.parse(storedUser);
        return userData?.is_staff || userData?.is_superuser;
    };

    const isSuperuser = () => {
        // Check localStorage directly for immediate updates
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return false;
        const userData = JSON.parse(storedUser);
        return userData?.is_superuser;
    };

    const isActive = () => {
        // Check localStorage directly for immediate updates
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return false;
        const userData = JSON.parse(storedUser);
        return userData?.is_active;
    };

    return {
        user,
        token,
        isAuthenticated,
        isStaff,
        isSuperuser,
        isActive,
        logout,
    };
};

export default useAuth;
