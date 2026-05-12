const express = require('express');
const router = express.Router();
const slotCtrl = require('../controllers/slot.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, slotCtrl.createSlot);
router.get('/doctor/:doctorId', slotCtrl.getSlotsByDoctor);
router.delete('/:id', auth, slotCtrl.deleteSlot);

module.exports = router;
