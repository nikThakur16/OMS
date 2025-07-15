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

const onlineUsers = new Map(); // userId -> Set of socket ids

// Track users in rooms
const usersInRooms = {}; // { chatId: Set of userIds }

io.on("connection", (socket) => {
  // When a user comes online
  socket.on("user_online", (userId) => {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socket.userId = userId;
    io.emit("user_online", userId);
  });

  // When a user joins a chat
  socket.on("join_chat", (chatId, userId) => {
    socket.join(chatId);
    if (!usersInRooms[chatId]) usersInRooms[chatId] = new Set();
    usersInRooms[chatId].add(userId);
    socket.chatId = chatId;
    socket.userId = userId;
  });

  // When a user leaves a chat (optional, for cleanup)
  socket.on("leave_chat", (chatId, userId) => {
    socket.leave(chatId);
    if (usersInRooms[chatId]) usersInRooms[chatId].delete(userId);
  });

  // When sending a message
  socket.on("send_message", async (data) => {
    try {
      const message = await Message.create({
        chat: data.chatId,
        sender: data.sender,
        content: data.content,
        status: "sent",
        seenBy: [],
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

      // Emit to recipient: status "delivered" (if online in room)
      if (
        usersInRooms[data.chatId] &&
        usersInRooms[data.chatId].has(recipientId.toString())
      ) {
        const recipientSocketIds = onlineUsers.get(recipientId.toString());
        if (recipientSocketIds && recipientSocketIds.size > 0) {
          for (const recipientSocketId of recipientSocketIds) {
            io.to(recipientSocketId).emit("newMessage", {
              ...data,
              _id: message._id,
              createdAt: message.createdAt,
              sender: populatedMsg.sender,
              status: "delivered",
            });
            // Also notify sender that message is delivered
            io.to(socket.id).emit("message_delivered", { messageId: message?._id });
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // When a message is seen
  socket.on("message_seen", async ({ chatId, messageId, userId }) => {
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { seenBy: userId },
      status: "seen",
    });
    io.to(chatId).emit("message_seen", { messageId, userId });
  });

  // On disconnect, clean up
  socket.on("disconnect", async () => {
    if (socket.userId) {
      const userSockets = onlineUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit("user_offline", socket.userId);
          await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() });
        }
      }
      // Remove from all rooms
      Object.keys(usersInRooms).forEach(chatId => {
        usersInRooms[chatId].delete(socket.userId);
      });
    }
  });

  // Add this inside io.on("connection", (socket) => { ... })
  socket.on("get_online_users", () => {
    // Send the list of currently online user IDs
    io.to(socket.id).emit("online_users_list", Array.from(onlineUsers.keys()));
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
