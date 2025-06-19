const Announcement = require("../models/Announcement");

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRoles } = req.body;
    const announcement = new Announcement({
      title,
      message,
      targetRoles,
      createdBy: req.user._id,
    });
    await announcement.save();

    // Emit to all connected clients via Socket.IO
    const io = req.app.get("io");
    if (io) {
      console.log("Emitting new-announcement:", announcement);
      io.emit(
        "new-announcement",
        await announcement.populate("createdBy", "personalDetails role")
      );
    }

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.personalDetails.role;
    const announcements = await Announcement.find({
      $or: [{ targetRoles: "all" }, { targetRoles: userRole }],
    })
      .sort({ date: -1 })
      .populate("createdBy", "personalDetails");
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ message: "Announcement deleted" });

    // Emit to all connected clients via Socket.IO
    const io = req.app.get("io");
    if (io) {
      console.log("Emitting announcementDeleted:", { id });
      io.emit("announcementDeleted", { id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
