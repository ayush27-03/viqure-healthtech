const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/', medicalRecordController.createRecord);
router.get('/', medicalRecordController.listRecords);
router.get('/:id', medicalRecordController.getRecordById);
router.patch('/:id', medicalRecordController.updateRecord);
router.delete('/:id', medicalRecordController.deleteRecord);

module.exports = router;
