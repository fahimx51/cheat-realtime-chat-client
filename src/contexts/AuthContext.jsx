import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedToken && savedUser) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }

        setLoading(false);

    }, []);

    const login = (userData, userToken) => {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        setToken(null);
        window.location.href = '/login';
    };


    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )

}