const express = require('express');
const router = express.Router();
const { registerPatient, registerDoctor, login, getMe, logout } = require('../../controllers/auth.controller');
const authMiddleware = require('../utils/auth.middleware');

router.post('/register/patient', registerPatient);
router.post('/register/doctor', registerDoctor);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

module.exports = router;
