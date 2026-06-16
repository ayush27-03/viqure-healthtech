/**
 * Wraps an async controller fn and forwards any thrown error to Express's
 * error-handling middleware via next(err), avoiding repetitive try/catch
 * blocks in every controller.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
