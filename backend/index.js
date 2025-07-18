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

// Map of chatId -> Set of userIds currently in that chat
const chatRoomUsers = new Map();

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
    if (!chatRoomUsers.has(chatId)) chatRoomUsers.set(chatId, new Set());
    chatRoomUsers.get(chatId).add(userId);
    socket.chatId = chatId;
    socket.userId = userId;
    // Emit updated room users to all in the room
    const users = Array.from(chatRoomUsers.get(chatId));
    io.to(chatId).emit("room_users", users);
  });

  // When a user leaves a chat (optional, for cleanup)
  socket.on("leave_chat", (chatId, userId) => {
    socket.leave(chatId);
    if (chatRoomUsers.has(chatId)) {
      chatRoomUsers.get(chatId).delete(userId);
      if (chatRoomUsers.get(chatId).size === 0) chatRoomUsers.delete(chatId);
    }
    // Emit updated room users to all in the room
    const users = chatRoomUsers.has(chatId) ? Array.from(chatRoomUsers.get(chatId)) : [];
    io.to(chatId).emit("room_users", users);
  });

  // When sending a message
  socket.on("send_message", async (data) => {
    try {
      const message = await Message.create({
        chat: data?.chatId,
        sender: data?.sender,
        content: data?.content,
        status: "sent",
        seen: false,
        clientTempId: data.clientTempId // store if present
      });
      await Chat.findByIdAndUpdate(data.chatId, { lastMessage: message?._id });
      // Emit last message update to the chat room
      io.to(data.chatId).emit("last_message_update", {
        chatId: data.chatId,
        lastMessageId: message._id,
        status: "sent"
      });

      const populatedMsg = await message.populate("sender", "personalDetails.firstName personalDetails.lastName");

      // Find chat and recipient
      const chat = await Chat.findById(data.chatId).lean();
      const recipientId = chat.members.find(id => id.toString() !== data.sender);
      const chatMembers = chat.members.map(id => id.toString());

      // Check if both users are in the chat room
      const usersInRoom = chatRoomUsers.get(data.chatId) || new Set();
      const bothInRoom = usersInRoom.has(data.sender) && usersInRoom.has(recipientId.toString());

      // If both are in the chat room, mark as seen
      const status = bothInRoom ? "seen" : "delivered";
      // Emit to sender: status "sent"
      io.to(socket.id).emit("newMessage", {
        ...data,
        _id: message._id,
        createdAt: message.createdAt,
        sender: populatedMsg.sender,
        status: "sent",
        clientTempId: data.clientTempId // echo back
      });

      if (onlineUsers.has(recipientId.toString())) {
        // Emit to the chat room (for open chat windows)
        io.to(data.chatId).emit("newMessage", {
          ...data,
          _id: message._id,
          createdAt: message.createdAt,
          sender: populatedMsg.sender,
          status,
          clientTempId: data.clientTempId,
          members: chatMembers
        });
        // Emit to the recipient's userId room (for chat list updates)
        io.to(recipientId.toString()).emit("newMessage", {
          ...data,
          _id: message._id,
          createdAt: message.createdAt,
          sender: populatedMsg.sender,
          status,
          clientTempId: data.clientTempId,
          members: chatMembers
        });
        io.to(socket.id).emit(
          status === "seen" ? "message_seen" : "message_delivered",
          { messageId: message._id, userId: recipientId.toString() }
        );
        // Persist status in the database
        if (bothInRoom) {
          await Message.findByIdAndUpdate(message._id, {
            status: "seen",
            $addToSet: { seenBy: recipientId }
          });
        } else {
          await Message.findByIdAndUpdate(message._id, { status: "delivered" });
        }
        // Emit last message status update in real time
        io.to(data.chatId).emit("last_message_update", {
          chatId: data.chatId,
          lastMessageId: message._id,
          status
        });
        console.log(`[DEBUG] Message ${message._id} marked as ${status}`);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // When a message is seen
  socket.on("message_seen", async ({ chatId, messageId, userId }) => {
    await Message.findByIdAndUpdate(messageId, { status: "seen", seen: true, $addToSet: { seenBy: userId } });
    io.to(chatId).emit("message_seen", { messageId, userId });
    // Emit last_message_update for chat list
    io.to(chatId).emit("last_message_update", {
      chatId,
      lastMessageId: messageId,
      status: "seen"
    });
  });

  // Listen for last_message_update from client and broadcast to chat room
  socket.on("last_message_update", ({ chatId, lastMessageId, status }) => {
    io.to(chatId).emit("last_message_update", { chatId, lastMessageId, status });
  });

  // On disconnect, clean up
  socket.on("disconnect", async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("user_offline", socket.userId);
      await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() });
      // Remove from all rooms
      for (const chatId of chatRoomUsers.keys()) {
        chatRoomUsers.get(chatId).delete(socket.userId);
      }
    }
  });

  // Add this inside io.on("connection", (socket) => { ... })
  socket.on("get_online_users", () => {
    // Send the list of currently online user IDs
    io.to(socket.id).emit("online_users_list", Array.from(onlineUsers));
  });

  // Respond to get_room_users from frontend
  socket.on("get_room_users", (chatId) => {
    const users = chatRoomUsers.has(chatId) ? Array.from(chatRoomUsers.get(chatId)) : [];
    io.to(socket.id).emit("room_users", users);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
