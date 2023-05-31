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
      required: [true, 'A session must have a duration'],
    },
    sessionType: {
      type: String,
      required: [true, 'Please provide session type'],
    },
    pisqreId: {
      type: String,
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
      type: Number,
      required: [true, 'A booking must have a price'],
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
