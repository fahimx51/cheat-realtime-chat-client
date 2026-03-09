import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user, token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    // ADD THIS LINE - This was the cause of the red error
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user && token) {
            const newSocket = io("http://localhost:3000", {
                query: { token, userId: user._id },
                auth: { token },
                transports: ["websocket"]
            });

            newSocket.on("connect", () => {
                console.log("✅ Socket Connected:", newSocket.id);
                setIsConnected(true);
            });

            // Make sure "getOnlineUser" matches exactly what is in your backend emit
            newSocket.on("getOnlineUser", (users) => {
                setOnlineUser(users);
            });

            newSocket.on("disconnect", () => {
                console.log("❌ Socket Disconnected");
                setIsConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
                setSocket(null);
            };
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket, onlineUser, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};