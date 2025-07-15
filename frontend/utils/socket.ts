import { io } from "socket.io-client";
const socket = io("http://localhost:5000", { withCredentials: true });

export function registerUserOnline(userId:any) {
  socket.on("connect", () => {
    if (userId) socket.emit("user_online", userId);
  });
}

export default socket;