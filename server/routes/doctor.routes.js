const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect, restrictTo('DOCTOR'));

router.patch('/me/profile', doctorController.updateDoctorProfile);
router.get('/me/slots', doctorController.getMySlots);
router.post('/me/slots', doctorController.addTimeSlots);
router.delete('/me/slots/:slotId', doctorController.removeTimeSlot);
router.get('/me/appointments', doctorController.getMyAppointments);
router.get('/me/earnings', doctorController.getEarningsDashboard);

module.exports = router;
