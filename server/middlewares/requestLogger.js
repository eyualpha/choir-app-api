const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    if (process.env.NODE_ENV === "test") return;
    const duration = Date.now() - startedAt;
    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    if (res.statusCode >= 500) console.error(line);
    else if (process.env.NODE_ENV !== "production") console.log(line);
  });
  next();
};

module.exports = { requestLogger };
