const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Leave Requests (Employee)
router.get('/balance', leaveController.getLeaveBalance);
router.get('/history', leaveController.getLeaveHistory);
router.post('/apply', leaveController.applyForLeave);
router.patch('/cancel/:id', leaveController.cancelLeave);

// Manager: Get team leave requests
router.get('/team', authorize(['Manager']), leaveController.getTeamLeaveRequests);

// HR/Admin actions
router.get('/requests', authorize(['Admin', 'HR']), leaveController.getAllLeaveRequests);
router.patch('/approve/:id', authorize(['Admin', 'HR']), leaveController.approveLeave);
router.patch('/reject/:id', authorize(['Admin', 'HR']), leaveController.rejectLeave);
router.patch('/admin-cancel/:id', authorize(['Admin', 'HR']), leaveController.adminCancelLeave);
router.get('/report', authorize(['Admin', 'HR']), leaveController.getLeaveReport);

// Leave Types
router.get('/types', leaveController.getLeaveTypes);
router.post('/types', authorize(['Admin', 'HR']), leaveController.createLeaveType);
router.patch('/types/:id', authorize(['Admin', 'HR']), leaveController.updateLeaveType);
router.delete('/types/:id', authorize(['Admin', 'HR']), leaveController.deleteLeaveType);

// Leave Quotas
router.get('/quotas', authorize(['Admin', 'HR']), leaveController.getLeaveQuotas);
router.patch('/quotas/:id', authorize(['Admin', 'HR']), leaveController.updateLeaveQuota);
router.post('/quotas', authorize(['Admin', 'HR']), leaveController.addLeaveQuota);
router.post('/quotas/import', authorize(['Admin', 'HR']), leaveController.bulkImportLeaveQuotas);
router.get('/quotas/matrix', authorize(['Admin', 'HR']), leaveController.getLeaveQuotaMatrix);
router.post('/quotas/reset/:year', authorize(['Admin', 'HR']), async (req, res) => {
  try {
    await leaveController.resetYearlyQuotas(Number(req.params.year));
    res.json({ message: `Yearly reset for ${req.params.year} complete.` });
  } catch (err) {
    res.status(500).json({ message: 'Error in yearly reset', error: err.message });
  }
});
router.post('/quotas/sync', authorize(['Admin', 'HR']), leaveController.syncQuotas);

// Audit Log Endpoints (Admin/HR)
router.get('/audit-logs', authorize(['Admin', 'HR']), leaveController.getAuditLogs);
router.post('/audit-logs/:id/rollback', authorize(['Admin', 'HR']), leaveController.rollbackAuditLog);

module.exports = router; 