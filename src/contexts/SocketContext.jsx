import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import socket, { connectSocket } from "../services/socket";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user, token } = useContext(AuthContext);
    const [isConnected, setConnected] = useState(socket);
    const [onlineUser, setOnlineUser] = useState([]);


    useEffect(() => {
        if (user && token) {
            connectSocket(user, token);
        }

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('getOnlineUser', (user) => setOnlineUser(user));

        return () => {
            socket.off("getOnlineUser");
            socket.off("connect");
            socket.off("disconnect");
        };

    }, [user, token]);


    return (
        <SocketContext.Provider value={{ socket, onlineUser, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};