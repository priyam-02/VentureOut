// const { DateTime } = require("luxon");
// const { v4: uuidv4 } = require('uuid');

// const categories = [
//     {
//         id: "1",
//         name: "Outdoor Adventures",
//         // image: "/images/adventures.jpg",
//     },
//     {
//         id: "2",
//         name: "City Tours",
//         // image: "/images/city.jpg",
//     },
//     {
//         id: "3",
//         name: "Sports",
//         // image: "/images/sports.jpg",
//     },
//     {
//         id: "4",
//         name: "Workshops",
//         // image: "/images/workshops.jpg",
//     },
//     {
//         id: "5",
//         name: "Other",
//         // image: "/images/other.jpg",
//     }
// ];

// const events = [
//     {
//         id: "1",
//         categoryId: "1",
//         title: "Mountain Hiking",
//         hostName: "John Doe",
//         startDateTime: "2024-04-15T09:00",
//         endDateTime: "2024-04-15T17:00",
//         details: "Join us for a day of adventure as we explore the mountains.",
//         location: "Green Mountains, Vermont",
//         image: "/images/mountainhiking.jpg",
//         createdAt: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
//     },
//     {
//         id: "2",
//         categoryId: "1",
//         title: "River Rafting",
//         hostName: "Jane Smith",
//         startDateTime: "2024-05-20T10:00",
//         endDateTime: "2024-05-20T15:00",
//         details: "Experience the thrill of river rafting with our expert guides.",
//         location: "Colorado River, Arizona",
//         image: "/images/riverraft.jpg",
//         createdAt: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
//     },
//     {
//         id: "3",
//         categoryId: "1",
//         title: "Forest Camping",
//         hostName: "Alex Johnson",
//         startDateTime: "2024-06-10T08:00",
//         endDateTime: "2024-06-12T13:00",
//         details: "Spend a peaceful weekend camping in the forest.",
//         location: "Redwood Forest, California",
//         image: "/images/forest.jpg",
//         createdAt: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
//     },
//     {
//         id: "4",
//         categoryId: "2",
//         title: "Art Exhibition",
//         hostName: "Samantha Lee",
//         startDateTime: "2024-07-01T14:00",
//         endDateTime: "2024-07-01T19:00",
//         details: "Explore the latest art from local artists at our exhibition.",
//         location: "Downtown Art Gallery",
//         image: "/images/art.jpg",
//         createdAt: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
//     },
//     {
//         id: "5",
//         categoryId: "2",
//         title: "Culinary Workshop",
//         hostName: "Carlos Gomez",
//         startDateTime: "2024-08-15T11:00",
//         endDateTime: "2024-08-15T14:00",
//         details: "Learn to cook traditional dishes with our culinary workshop.",
//         location: "Downtown Cooking School",
//         image: "/images/culinary.jpg",
//         createdAt: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
//     },
//     {
//         id: "6",
//         categoryId: "2",
//         title: "Historical Landmark Tour",
//         hostName: "Maria Chang",
//         startDateTime: "2024-09-05T10:00",
//         endDateTime: "2024-09-05T16:00",
//         details: "Discover the history behind our city's most famous landmarks.",
//         location: "Downtown Historical District",
//         image: "/images/landmark.jpg",
//         createdAt: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
//     }
// ];

// exports.categories = categories;

// exports.find = () => events;

// exports.findById = id => events.find(event => event.id === id);

// exports.create = event => {
//     event.id = uuidv4();
//     event.createdAt = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT);
//     events.push(event);
// }

// exports.updateById = (id, updatedEvent) => {
//     let event = this.findById(id);
//     if (event) {
//         event = { ...event, ...updatedEvent };
//         events.splice(events.findIndex(event => event.id === id), 1, event);
//         return true;
//     }
//     return false;
// }


// exports.deleteById = id => {
//     let index = events.findIndex(event => event.id === id);
//     if (index !== -1) {
//         events.splice(index, 1);
//         return true;
//     }
//     return false;
// }
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Defining the Event Schema
const eventSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required.']
  },
  category: {
    type: String,
    required: [true, 'Category is required.'],
    enum: {
      values: ['Outdoor Adventures', 'City Tours', 'Sports', 'Workshops', 'Other'],
      message: '{VALUE} is not a valid category.'
    }
  },
  hostName: {
    type: Schema.Types.ObjectId, ref: 'User', 
    required: true,
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date/time is required.']
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date/time is required.'],
    validate: {
      // Ensure that the end date/time is after the start date/time
      validator: function(endDate) {
        return endDate.getTime() > this.startDateTime.getTime();
      },
      message: 'End date/time must be after start date/time.'
    }
  },
  details: {
    type: String,
    required: [true, 'Details are required.']
  },
  image: {
    type: String,
    required: [true, 'Image file path is required.']
  },
  // Additional fields
  location: {
    type: String,
    required: [true, 'Location is required.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt timestamps
});

// Compiling the model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
