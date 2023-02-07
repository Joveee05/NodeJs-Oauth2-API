const mongoose = require('mongoose');
const validator = require('validator');

const bookingSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, 'A user must provide a course'],
    },
    topic: {
      type: String,
      required: [true, 'A user must provide a topic'],
    },
    duration: {
      type: String,
      enum: ['1hour', '2hours'],
    },
    sessionType: {
      type: String,
      enum: ['Live Session', 'Demo'],
    },
    tutor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tutor',
    },
    time: {
      type: String,
    },
    bookedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'bookedBy tutor',
    select: 'fullName image',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
