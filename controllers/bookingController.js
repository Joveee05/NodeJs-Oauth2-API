const express = require('express');
const Booking = require('../models/bookingModel');
const Schedule = require('../models/scheduleModel');
const User = require('../models/userModel');
const Tutor = require('../models/tutorModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const bookingEmail = require('../utils/bookingEmail');
const catchAsync = require('../utils/catchAsync');

const updateSchedule = async function (id) {
  const result = await Schedule.findByIdAndUpdate(id, { new: true });
  if (result) {
    result.booked = true;
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid schedule id', 400);
  }
};

const updateNumOfBookings = async function (id) {
  const result = await Tutor.findByIdAndUpdate(
    id,
    { $inc: { numOfBookings: 1 } },
    { new: true }
  );
  if (result) {
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid tutor id', 400);
  }
};

exports.bookSession = catchAsync(async (req, res, next) => {
  const body = {
    courseName: req.body.courseName,
    description: req.body.description,
    duration: req.body.duration,
    price: req.body.price,
    tutor: req.params.tutorId,
    sessionType: req.body.sessionType,
    bookedBy: req.user.id,
    time: req.body.time,
  };
  const user = await User.findById(body.bookedBy);
  const tutor = await Tutor.findById(body.tutor);
  const booking = await Booking.create(body);
  if (booking) {
    await new bookingEmail(user, tutor, booking).confirmBooking();
    await new bookingEmail(tutor, user, booking).notifyTutor();
    updateSchedule(req.query.schedule);
    updateNumOfBookings(body.tutor);
  }
  res.status(201).json({
    status: 'success',
    message: 'Live Session Booked successfully',
    data: booking,
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const booking = await Booking.find().populate('bookedBy').sort('-createdAt');
  if (booking.length < 1) {
    return next(
      new AppError('No Live Session Booking found in the database.', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Bookings found',
    results: booking.length,
    data: booking,
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('bookedBy');
  if (!booking) {
    return next(
      new AppError(
        'No Live Session Booking found in the database with that ID.',
        404
      )
    );
  } else {
    res.status(200).json({
      status: 'success',
      data: booking,
    });
  }
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Booking.find({ tutor: req.user.id }),
    req.query
  ).paginate();
  const myBookings = await features.query;
  if (myBookings.length < 1) {
    return next(new AppError('Oops... No bookings found!!', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Bookings found',
    results: myBookings.length,
    data: myBookings,
  });
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Booking.find({ bookedBy: req.user.id }),
    req.query
  ).paginate();
  const myBookings = await features.query;
  if (myBookings.length < 1) {
    return next(new AppError('Oops... No bookings found!!', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Bookings found',
    results: myBookings.length,
    data: myBookings,
  });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!booking) {
    return next(
      new AppError(
        'No Live Session Booking found in the database with that ID.',
        404
      )
    );
  } else {
    res.status(200).json({
      status: 'success',
      message: 'Booking updated successfully',
      data: booking,
    });
  }
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    return next(
      new AppError(
        'No Live Session Booking found in the database with that ID.',
        404
      )
    );
  } else {
    res.status(200).json({
      status: 'success',
      message: 'Booking deleted successfully',
    });
  }
});
