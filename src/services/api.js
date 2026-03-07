import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 3000,
});

//authEndpoints

export const register = async (userData) => {
    const resposnse = await api.post("/auth/register", userData);
    return resposnse.data;
};