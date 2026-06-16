const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/', appointmentController.bookAppointment);
router.get('/', appointmentController.listAppointments);
router.get('/:id', appointmentController.getAppointmentById);

router.patch('/:id/confirm', appointmentController.confirmAppointment);
router.patch('/:id/reject', appointmentController.rejectAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);
router.patch('/:id/complete', appointmentController.completeAppointment);
router.patch('/:id/payment', appointmentController.recordPayment);

router.post('/:id/documents', appointmentController.shareDocument);
router.post('/:id/feedback', appointmentController.leaveFeedback);
router.post('/:id/report-issue', appointmentController.reportIssue);
router.patch('/:id/resolve-issue', appointmentController.resolveIssue);

module.exports = router;
