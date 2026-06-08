const success = (res, data = {}, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, ...data });

const created = (res, data = {}, message = "Created successfully") =>
  success(res, data, message, 201);

const fail = (res, message = "Request failed", status = 400, extra = {}) =>
  res.status(status).json({ success: false, message, ...extra });

const notFound = (res, message = "Resource not found") => fail(res, message, 404);

const unauthorized = (res, message = "Unauthorized") => fail(res, message, 401);

const forbidden = (res, message = "Forbidden") => fail(res, message, 403);

module.exports = { success, created, fail, notFound, unauthorized, forbidden };
