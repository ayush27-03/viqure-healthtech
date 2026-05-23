const express = require('express');
const router = express.Router();
const doctorCtrl = require('../controllers/doctor.controller');
const doctorProfileCtrl = require('../controllers/doctorProfile.controller');
const appointmentCtrl = require('../controllers/appointment.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

router.get('/me', auth, role('doctor'), doctorProfileCtrl.getDoctorProfile);
router.patch('/me', auth, role('doctor'), doctorProfileCtrl.updateDoctorProfile);
router.get('/earnings', auth, role('doctor'), appointmentCtrl.getDoctorEarnings);
router.get('/', doctorCtrl.getDoctors);
router.get('/search', doctorCtrl.searchDoctors);
router.get('/first', doctorCtrl.getDoctors); // kept for compatibility; returns paginated list
router.get('/:id', doctorCtrl.getDoctorById);

module.exports = router;
