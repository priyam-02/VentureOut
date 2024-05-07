const { body, sanitizeBody, validationResult } = require("express-validator");

exports.validateEventId = (req, res, next) => {
  let id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    let err = new Error("Invalid event id");
    err.status = 400;
    return next(err);
  } else {
    return next();
  }
};

exports.validateEvent = [
  // Validate the title: non-empty and is a string
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Event title is required.")
    .isString()
    .withMessage("Event title must be a string.")
    .escape(),

  // Validate the details: non-empty and is a string
  body("details")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Event details are required.")
    .isString()
    .withMessage("Event details must be a string.")
    .escape(),

  // Validate the location: non-empty and is a string
  body("location")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Event location is required.")
    .isString()
    .withMessage("Event location must be a string.")
    .escape(),

  // Validate the category: must be a valid category
  body("category")
    .trim()
    .isIn(["Outdoor Adventures", "City Tours", "Sports", "Workshops", "Other"])
    .withMessage("Invalid event category. Select a valid category.")
    .escape(),

  // Validate start and end datetime: non-empty, valid date, and end date must be after start date
  body("startDateTime")
    .trim()
    .isISO8601()
    .withMessage(
      "Start date and time must be a valid date and time in ISO 8601 format.",
    )
    .isAfter(new Date().toISOString())
    .withMessage("Start date and time must be in the future.")
    .toDate(),
  body("endDateTime")
    .trim()
    .isISO8601()
    .withMessage(
      "End date and time must be a valid date and time in ISO 8601 format.",
    )
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error(
          "End date and time must be after the start date and time.",
        );
      }
      return true;
    }),
];

exports.validateRSVP = [
  body("status")
    .trim()
    .isIn(["YES", "NO", "MAYBE"])
    .withMessage("Invalid RSVP status. Allowed values are YES, NO, or MAYBE.")
    .escape(),
];

exports.validateSignUp = [
  body("firstName", "firstName cannot be empty").notEmpty().trim().escape(),
  body("lastName", "lastName cannot be empty").notEmpty().trim().escape(),
  body("email", "Email must be valid email address")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body(
    "password",
    "Password must be 8 characters and at most 64 characters",
  ).isLength({ min: 8, max: 64 }),
];

exports.validateLogIn = [
  body("email", "Email must be valid email address")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body(
    "password",
    "Password must be 8 characters and at most 64 characters",
  ).isLength({ min: 8, max: 64 }),
];

exports.validateResult = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });
    return res.redirect("back");
  } else {
    return next();
  }
};
