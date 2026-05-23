const express = require("express");
const router = express.Router();

const miscCtrl = require("../controllers/misc.controller");

router.get("/", miscCtrl.getCategories);

module.exports = router;
