const express = require("express");
const multer = require("multer");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { isLoggedIn, isAuthor } = require("../middlewares/auth");
const {
  validateEvent,
  validateEventId,
  validateResult,
  validateRSVP,
} = require("../middlewares/validator");

// Memory storage keeps the file in memory as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// RESTful routes for events
router.get("/", eventController.index); // List all events
router.get("/new", isLoggedIn, eventController.new); // Show the form to create a new event
router.get("/:id", validateEventId, eventController.show); // Show a single event

router.get(
  "/:id/edit",
  validateEventId,
  isLoggedIn,
  isAuthor,
  eventController.edit,
); // Show the form to edit an event
router.delete(
  "/:id",
  validateEventId,
  isLoggedIn,
  isAuthor,
  eventController.delete,
); // Delete an event

router.post(
  "/create",
  upload.single("image"),
  isLoggedIn,
  validateEvent,
  validateResult,
  eventController.create,
); // Create a new event
router.post(
  "/:id/rsvp",
  validateEventId,
  isLoggedIn,
  validateRSVP,
  eventController.rsvp,
); // Route for RSVP requests
router.put(
  "/:id",
  upload.single("image"),
  validateEventId,
  isLoggedIn,
  isAuthor,
  validateEvent,
  validateResult,
  eventController.update,
); // Update an event

module.exports = router;
