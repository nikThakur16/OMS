const express = require("express");
const chatController = require("../controllers/chatController");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware")

// Get or create a one-to-one chat
router.post("/one-to-one", chatController.getOrCreateOneToOneChat);

// Get all messages for a chat
router.get("/:chatId/messages", chatController.getMessages);


router.get("/", protect, chatController.getAllChatUsers );
  

module.exports = router;
