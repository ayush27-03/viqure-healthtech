const express = require('express');
const router = express.Router();
const apptCtrl = require('../controllers/appointment.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, apptCtrl.createAppointment);
router.get('/patient', auth, apptCtrl.getPatientAppointments);
router.get('/doctor', auth, apptCtrl.getDoctorAppointments);
router.get('/doctor/earnings', auth, apptCtrl.getDoctorEarnings);
router.get('/:id', auth, apptCtrl.getAppointmentById);
router.patch('/:id/status', auth, apptCtrl.updateAppointmentStatus);
router.patch('/:id/remarks', auth, apptCtrl.addDoctorRemarks);

module.exports = router;
