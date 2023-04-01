const mongoose = require('mongoose');
const validator = require('validator');

const bookingSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, 'A user must provide a course'],
    },
    description: {
      type: String,
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
      required: [true, 'Please provide a tutor Id'],
    },
    time: {
      type: String,
      required: [true, 'A user must provide a date'],
    },
    bookedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    price: {
      type: String,
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
