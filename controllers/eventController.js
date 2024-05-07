// const model = require('../models/event'); // Assuming you export your events array from event.js

// exports.index = (req, res) => {
//     let events = model.find();
//     const categories = model.categories;
//     res.render('./event/index', { categories, events });
// };

// exports.new = (req, res) => {
//     // res.send('Form to create a new event');
//     const newEventPlaceholder = {
//         title: '',
//         details: '',
//         location: '',
//         hostName: '',
//         categoryId: '',
//         startDateTime: '',
//         endDateTime: '',
//         image: ''
//       };
//     res.render('event/editOrNew', { event: newEventPlaceholder, isNew: true });
// };

// exports.create = (req, res) => {
//     // Logic to create a new event
//     let event = req.body;
//     if (req.file) {
//         const base64Image = req.file.buffer.toString('base64');
//         event.image = `data:${req.file.mimetype};base64,${base64Image}`;
//     } else {
//         // Handle cases where an image wasn't uploaded or required
//         console.log('Event created without image!', req);
//     }
//     model.create(event);
//     res.redirect('/events');
// };

// exports.show = (req, res, next) => {
//     let id = req.params.id;
//     let event = model.findById(id);
//     if (event) {
//         res.render('./event/show', { event });
//     } else {
//         let err = new Error('Event not found');
//         err.status = 404;
//         next(err);
//     }
// };

// exports.edit = (req, res, next) => {
//     // res.send('Form to edit event with ID ' + req.params.id);
//     let id = req.params.id;
//     let event = model.findById(id);
//     if (event) {
//         res.render('./event/editOrNew', { event, isNew: false});
//     } else {
//         let err = new Error('Event not found');
//         err.status = 404;
//         next(err);
//     }
// };

// exports.update = (req, res, next) => {
//     // Logic to update an existing event
//     // res.send('Event updated');
//     let id = req.params.id;
//     let updatedEvent = req.body;
//     if (req.file) {
//         const base64Image = req.file.buffer.toString('base64');
//         updatedEvent.image = `data:${req.file.mimetype};base64,${base64Image}`;
//     } else {
//         console.log('Event created without image!', req);
//     }
//     if (model.updateById(id, updatedEvent)) {
//         res.redirect('/events/');
//     } else {
//         let err = new Error('Event not found');
//         err.status = 404;
//         next(err);
//     }
// };

// exports.delete = (req, res, next) => {
//     // Logic to delete an event
//     let id = req.params.id;
//     if (model.deleteById(id)) {
//         res.redirect('/events');
//     } else {
//         let err = new Error('Event not found');
//         err.status = 404;
//         next(err);
//     }
// };
const mongoose = require("mongoose");

const Event = require("../models/event"); // Adjust this path as needed
const { DateTime } = require("luxon");
const RSVP = require("../models/rsvp");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.index = (req, res, next) => {
  Event.find()
    .lean()
    .then((events) => {
      Event.distinct("category")
        .then((categories) => {
          // Convert dates using luxon for all events
          events = events.map((event) => {
            event.startDateTime = DateTime.fromJSDate(
              event.startDateTime,
            ).toISO();
            event.endDateTime = DateTime.fromJSDate(event.endDateTime).toISO();
            return event;
          });
          res.render("./event/index", { categories, events });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.new = (req, res) => {
  const newEventPlaceholder = {
    title: "",
    details: "",
    location: "",
    hostName: "",
    category: "",
    startDateTime: "",
    endDateTime: "",
    image: "",
  };
  res.render("event/editOrNew", { event: newEventPlaceholder, isNew: true });
};

exports.create = (req, res, next) => {
  const event = new Event({
    title: req.body.title,
    details: req.body.details,
    location: req.body.location,
    hostName: req.session.user,
    category: req.body.category, // Directly use the category from the form
    startDateTime: req.body.startDateTime,
    endDateTime: req.body.endDateTime,
  });
  if (req.file) {
    event.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  }
  event
    .save()
    .then(() => {
      req.flash("success", "Event created successfully");
      res.redirect("/events");
    })
    .catch((err) => next(err));
};

// exports.show = (req, res, next) => {
//     let id = req.params.id;
//     Event.findById(id).populate('hostName', 'firstName lastName').lean()
//         .then(event => {
//             if (event) {
//                 event.startDateTime = DateTime.fromJSDate(event.startDateTime).toISO();
//                 event.endDateTime = DateTime.fromJSDate(event.endDateTime).toISO();
//                 res.render('./event/show', { event });
//             } else {
//                 throw new Error('Event not found');
//             }
//         })
//         .catch(err => {
//             err.status = 404;
//             next(err);
//         });
// };

exports.show = (req, res, next) => {
  let id = req.params.id;
  Event.findById(id)
    .populate("hostName", "firstName lastName")
    .lean()
    .then((event) => {
      if (event) {
        RSVP.countDocuments({ event: id, status: "YES" }) // Count YES RSVPs
          .then((yesCount) => {
            event.startDateTime = DateTime.fromJSDate(
              event.startDateTime,
            ).toISO();
            event.endDateTime = DateTime.fromJSDate(event.endDateTime).toISO();
            res.render("./event/show", { event, yesCount });
          });
      } else {
        throw new Error("Event not found");
      }
    })
    .catch((err) => {
      err.status = 404;
      next(err);
    });
};

exports.edit = (req, res, next) => {
  let id = req.params.id;
  Event.findById(id)
    .lean()
    .then((event) => {
      if (event) {
        if (
          !event.startDateTime ||
          isNaN(new Date(event.startDateTime).getTime())
        ) {
          event.startDateTime = DateTime.now().toISO();
        } else {
          event.startDateTime = DateTime.fromJSDate(
            event.startDateTime,
          ).toISO();
        }

        // Check if endDateTime is undefined or not a valid date, then set to current date/time
        if (
          !event.endDateTime ||
          isNaN(new Date(event.endDateTime).getTime())
        ) {
          event.endDateTime = DateTime.now().toISO();
        } else {
          event.endDateTime = DateTime.fromJSDate(event.endDateTime).toISO();
        }
        res.render("./event/editOrNew", { event, isNew: false });
      } else {
        throw new Error("Event not found");
      }
    })
    .catch((err) => {
      err.status = 404;
      next(err);
    });
};

exports.update = (req, res, next) => {
  let id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).send("Invalid Event ID");
  }
  let updatedEvent = req.body;
  if (req.file) {
    updatedEvent.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  }
  Event.findByIdAndUpdate(id, updatedEvent, { new: true })
    .lean()
    .then(() => {
      req.flash("success", "Changes applied successfully");
      res.redirect("/events/" + id);
    })
    .catch((err) => next(err));
};

exports.rsvp = (req, res, next) => {
  const eventId = req.params.id;
  const user = req.session.user; // Assuming the user ID is stored in the session
  const status = req.body.status;

  if (!isValidObjectId(eventId) || !isValidObjectId(user)) {
    return res.status(400).send("Invalid IDs");
  }

  Event.findById(eventId)
    .then((event) => {
      if (!event) throw new Error("Event not found");
      if (event.hostName.equals(user)) {
        res.status(401).send("Cannot RSVP your own event");
      } else {
        RSVP.findOneAndUpdate(
          { user: user, event: eventId },
          { status: status },
          { new: true, upsert: true },
        )
          .then(() => res.redirect(`/events/${eventId}`))
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
};

exports.delete = (req, res, next) => {
  let id = req.params.id;
  Event.findByIdAndDelete(id)
    .then(() => {
      // After successfully deleting the event, delete all associated RSVPs
      return RSVP.deleteMany({ event: id });
    })
    .then(() => {
      req.flash("success", "Event and associated RSVPs deleted successfully");
      res.redirect("/events");
    })
    .catch((err) => {
      err.status = 404;
      next(err);
    });
};
