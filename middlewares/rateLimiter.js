const rateLimit = require("express-rate-limit");

exports.loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
});
