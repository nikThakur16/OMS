const express = require("express");
const chatController = require("../controllers/chatController");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware")

// Protect all chat routes
router.use(protect);

// Get or create a one-to-one chat
router.post("/one-to-one", chatController.getOrCreateOneToOneChat);

// Get all messages for a chat
router.get("/:chatId/messages", chatController.getMessages);

router.post("/:chatId/seen", chatController.markChatAsSeen);

router.get("/", chatController.getAllChatUsers );

module.exports = router;
