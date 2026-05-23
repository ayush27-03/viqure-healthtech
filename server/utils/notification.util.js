const { Notification } = require("../models");

async function createNotification(payload = {}) {
  try {
    const {
      userId,
      userModel = "User",
      title,
      message,
      type = "appointment",
      refId = null,
      refModel = null,
      link,
      metadata,
    } = payload;

    if (!userId || !title || !message) {
      return null;
    }

    return await Notification.create({
      userId,
      userModel,
      title,
      message,
      type,
      refId,
      refModel,
      link,
      metadata,
    });
  } catch (error) {
    console.error("createNotification:", error.message);
    return null;
  }
}

module.exports = { createNotification };
