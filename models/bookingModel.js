const mongoose = require('mongoose');
const validator = require('validator');

const bookingSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
    },
    topic: {
      type: String,
    },
    duration: {
      type: String,
      enum: ['30minutes', '1hour'],
    },
    tutor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tutor',
    },
    time: {
      type: String,
      enum: [''],
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
