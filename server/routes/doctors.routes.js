const express = require('express');
const router = express.Router();
const doctorCtrl = require('../../controllers/doctor.controller');

router.get('/', doctorCtrl.getDoctors);
router.get('/search', doctorCtrl.searchDoctors);
router.get('/first', doctorCtrl.getDoctors); // kept for compatibility; returns paginated list
router.get('/:id', doctorCtrl.getDoctorById);

module.exports = router;
