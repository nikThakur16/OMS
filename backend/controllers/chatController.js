const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId }).populate("sender", "personalDetails.firstName personalDetails.lastName");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Invalid chatId or server error" });
  }
};

exports.getOrCreateOneToOneChat = async (req, res) => {
    const { userId1, userId2 } = req.body;
    const members = [userId1, userId2].sort(); // always sort for consistency
  
    let chat = await Chat.findOne({ isGroup: false, members: { $all: members, $size: 2 } });
    if (!chat) {
      chat = await Chat.create({ isGroup: false, members });
    }
    res.json(chat);
  }

exports.getAllChatUsers = async (req, res) => {
    try {
      // Only return _id and first/last name
      const users = await User.find({}, {
        _id: 1,
        "personalDetails.firstName": 1,
        "personalDetails.lastName": 1
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user directory" });
    }
  }