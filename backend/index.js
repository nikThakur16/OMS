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

io.on("connection", (socket) => {
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", async (data) => {
    // Save message to DB
    const message = await Message.create({
      chat: data.chatId,
      sender: data.sender,
      content: data.content,
    });
    // Optionally update lastMessage in Chat
    await Chat.findByIdAndUpdate(data.chatId, { lastMessage: message._id });

    // Populate sender for frontend display (optional)
    const populatedMsg = await message.populate("sender", "personalDetails.firstName personalDetails.lastName");

    io.to(data.chatId).emit("receive_message", {
      ...data,
      _id: message._id,
      createdAt: message.createdAt,
      sender: populatedMsg.sender, // send sender details
    });
  });

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
