const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only Admin/HR can create or delete
router.post('/', protect, authorize(['Admin', 'HR']), announcementController.createAnnouncement);
router.delete('/:id', protect, authorize(['Admin', 'HR']), announcementController.deleteAnnouncement);

// All authenticated users can view
router.get('/', protect, announcementController.getAnnouncements);

module.exports = router;
