require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose"); // add mongoose import
const cors = require("cors"); // Import the cors middleware
const cookieParser = require("cookie-parser");
const http = require("http");
const app = express();
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const userRoutes = require("./routes/userRoutes"); // Import your user routes
const announcementRoutes = require("./routes/announcementRoutes"); // <-- Add this
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const teamRoutes = require("./routes/teamRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const statusRoutes = require('./routes/statusRoutes');
const Message = require("./models/Message");
const Chat = require("./models/Chat");
const User = require("./models/User"); // <-- Add this line
const chatRoutes = require("./routes/chatRoutes");
const chatUserDirectoryRoutes = require("./routes/chatRoutes");

app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// Configure CORS to allow requests from your frontend origin
const corsOptions = {
  origin: "http://localhost:3000", // **Allow requests ONLY from your frontend development server**
  methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
  credentials: true, // Allow cookies/authentication headers to be sent
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // Use the cors middleware with your options

// Middleware to parse JSON
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes); // Use the user routes
app.use("/api/employeeDashboard", attendanceRoutes); // Use the attendance routes for employee dashboard
app.use("/api/announcements", announcementRoutes); // <-- Add this
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/departments", departmentRoutes);
app.use('/api/statuses', statusRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/chat-user-directory", chatUserDirectoryRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(" MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("OMS Backend is running");
});

// --- Socket.IO integration ---
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000", // <-- your frontend's URL
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.set("io", io);

const onlineUsers = new Set();

// Track users in rooms
const usersInRooms = {}; // { chatId: Set of userIds }

io.on("connection", (socket) => {
  // When a user comes online
  socket.on("user_online", (userId) => {
    onlineUsers.add(userId);
    socket.userId = userId;
    socket.join(userId); // <--- Add this line
    io.emit("user_online", userId);
  });

  // When a user joins a chat
  socket.on("join_chat", (chatId, userId) => {
    console.log(`[DEBUG] User ${userId} joined chat ${chatId} (socket: ${socket.id})`);
    socket.join(chatId);
    if (!usersInRooms[chatId]) usersInRooms[chatId] = new Set();
    usersInRooms[chatId].add(userId.toString());
    socket.chatId = chatId;
    socket.userId = userId;
    // Emit updated room users to all in the room
    const users = Array.from(usersInRooms[chatId]);
    io.to(chatId).emit("room_users", users);
  });

  // When a user leaves a chat (optional, for cleanup)
  socket.on("leave_chat", (chatId, userId) => {
    socket.leave(chatId);
    if (usersInRooms[chatId]) usersInRooms[chatId].delete(userId);
    // Emit updated room users to all in the room
    const users = usersInRooms[chatId] ? Array.from(usersInRooms[chatId]) : [];
    io.to(chatId).emit("room_users", users);
  });

  // When sending a message
  socket.on("send_message", async (data) => {
    try {
      const message = await Message.create({
        chat: data.chatId,
        sender: data.sender,
        content: data.content,
        status: "sent",
        seen: false,
      });
      await Chat.findByIdAndUpdate(data.chatId, { lastMessage: message._id });

      const populatedMsg = await message.populate("sender", "personalDetails.firstName personalDetails.lastName");

      // Find chat and recipient
      const chat = await Chat.findById(data.chatId).lean();
      const recipientId = chat.members.find(id => id.toString() !== data.sender);

      // Emit to sender: status "sent"
      io.to(socket.id).emit("newMessage", {
        ...data,
        _id: message._id,
        createdAt: message.createdAt,
        sender: populatedMsg.sender,
        status: "sent",
      });

      // Only emit "delivered" if recipient is online and in the chat room
      console.log('[DEBUG] onlineUsers:', onlineUsers);
      console.log('[DEBUG] Checking delivery for chatId:', data.chatId, 'recipientId:', recipientId);
      if (
        onlineUsers.has(recipientId.toString())
      ) {
        // Recipient is online and in the chat room
        // Emit "delivered" to recipient and notify sender
        io.to(recipientId.toString()).emit("newMessage", {
          ...data,
          _id: message._id,
          createdAt: message.createdAt,
          sender: populatedMsg.sender,
          status: "seen",
        });
        // Also notify sender that message is delivered
        io.to(socket.id).emit("message_delivered", { messageId: message?._id });
        // Persist delivered status in the database
        await Message.findByIdAndUpdate(message?._id, { status: "delivered" });
        console.log(`[DEBUG] Message ${message._id} marked as delivered`);
      } else {
        // Do not emit "delivered", message stays "sent"
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // When a message is seen
  socket.on("message_seen", async ({ chatId, messageId, userId }) => {
    // 1. Update the message in the database to mark as seen
    await Message.findByIdAndUpdate(messageId, { status: "seen", seen: true });

    // 2. Notify all clients in the chat room
    io.to(chatId).emit("message_seen", { messageId, userId });
  });

  // On disconnect, clean up
  socket.on("disconnect", async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("user_offline", socket.userId);
      await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() });
      // Remove from all rooms
      Object.keys(usersInRooms).forEach(chatId => {
        usersInRooms[chatId].delete(socket.userId);
      });
    }
  });

  // Add this inside io.on("connection", (socket) => { ... })
  socket.on("get_online_users", () => {
    // Send the list of currently online user IDs
    io.to(socket.id).emit("online_users_list", Array.from(onlineUsers));
  });

  // Respond to get_room_users from frontend
  socket.on("get_room_users", (chatId) => {
    const users = usersInRooms[chatId] ? Array.from(usersInRooms[chatId]) : [];
    io.to(socket.id).emit("room_users", users);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
