import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";
const socket = io.apply(SOCKET_URL, {
    authConnect: false
});


export const connectSocket = (user, token) => {
    if (!socket.connected) {
        socket.io.opts.query = { userId: user.id || user._id };

        socket.auth = { token };
        socket.connect();
    }
};


export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export default socket;