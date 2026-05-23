function sendSuccess(res, data = {}, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function sendError(res, message = "Error", status = 400, data = {}) {
  return res.status(status).json({ success: false, message, data });
}

function sendCreated(res, data = {}, message = "Created") {
  return res.status(201).json({ success: true, message, data });
}

module.exports = { sendSuccess, sendError, sendCreated };
