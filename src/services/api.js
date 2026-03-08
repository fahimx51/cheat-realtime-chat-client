import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 3000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }

    const message = error.response?.data?.message || "Server connection failed";

    return Promise.reject({ message, originalError: error });
});

//authEndpoints

export const registerAPI = async (userData) => {
    const resposnse = await api.post("/auth/register", userData);
    return resposnse.data;
};

export const loginAPI = async (userData) => {
    const resposnse = await api.post("/auth/login", userData);
    return resposnse.data;
};

export const updateProfile = async (updateData) => {
    const resposnse = await api.put("/user/profile", updateData);
    return resposnse.data;
};

export const getAllUsers = async () => {
    const resposnse = await api.put("/user");
    return resposnse.data;
};

export const getConversationMessages = async (reciepientId) => {
    const resposnse = await api.get(`/messages/${reciepientId}`);
    return resposnse.data;
};

export const sendMessege = async (msgData) => {
    const resposnse = await api.post('/messages/send', msgData);
    return resposnse.data;
};

export const uploadFile = async (formData) => {
    const resposnse = await api.post('/messages/upload', formData, {
        headers: {
            "Content-Type": "multipart/formdata"
        }
    });
    return resposnse.data;
};

