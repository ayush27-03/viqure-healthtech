const express = require("express");
const router = express.Router();

const miscCtrl = require("../controllers/misc.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, miscCtrl.getNotifications);
router.patch("/:id/read", auth, miscCtrl.markNotificationRead);
router.patch("/read-all", auth, miscCtrl.markAllNotificationsRead);

module.exports = router;
