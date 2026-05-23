const express = require("express");
const router = express.Router();

const patientCtrl = require("../controllers/patient.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get("/me", auth, role("patient"), patientCtrl.getPatientProfile);
router.patch("/me", auth, role("patient"), patientCtrl.updatePatientProfile);
router.get("/me/medical-records", auth, role("patient"), patientCtrl.getMedicalRecords);
router.patch("/me/medical-records", auth, role("patient"), patientCtrl.updateMedicalRecords);

module.exports = router;
