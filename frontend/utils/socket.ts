import { io } from "socket.io-client";
const socket = io("http://localhost:5000"); // Adjust if your backend runs elsewhere
export default socket;