const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId }).populate("sender", "personalDetails.firstName personalDetails.lastName");
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Invalid chatId or server error" });
  }
};

exports.getOrCreateOneToOneChat = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    const members = [userId1, userId2].sort(); // always sort for consistency
  
    let chat = await Chat.findOne({ isGroup: false, members: { $all: members, $size: 2 } });
    if (!chat) {
      chat = await Chat.create({ isGroup: false, members });
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get or create chat" });
  }
  }

exports.getAllChatUsers = async (req, res) => {
  try {
    if (!req?.user || !req?.user?._id) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }
    const currentUserId = req.user._id;

    // Get all users except the current user
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      {
        _id: 1,
        "personalDetails.firstName": 1,
        "personalDetails.lastName": 1,
        lastSeen: 1, // Add this line
      }
    ).lean();

    // For each user, find the chat and last message
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        // Find the chat between current user and this user
        const chat = await Chat.findOne({
          isGroup: false,
          members: { $all: [currentUserId, user._id], $size: 2 }
        });

        let lastMessage = null;
        if (chat && chat.lastMessage) {
          lastMessage = await Message.findById(chat.lastMessage)
            .populate("sender", "personalDetails.firstName personalDetails.lastName _id")
            .lean();
        }

        return {
          ...user,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                sender: {
                  _id: lastMessage.sender._id,
                  firstName: lastMessage.sender.personalDetails.firstName,
                  lastName: lastMessage.sender.personalDetails.lastName,
                },
                createdAt: lastMessage.createdAt,
                seenBy: lastMessage.seenBy || [], // Add this if you want to show seen status
              }
            : null,
        };
      })
    );

    res.json(usersWithLastMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user directory" });
  }
};