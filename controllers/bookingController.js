const express = require('express');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.bookSession = catchAsync(async (req, res, next) => {
  const body = {
    courseName: req.body.courseName,
    topic: req.body.topic,
    duration: req.body.duration,
    tutor: req.params.tutorId,
    sessionType: req.body.sessionType,
    bookedBy: req.user.id,
    time: req.body.time,
    day: req.body.day,
  };
  const booking = await Booking.create(body);
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
      message: 'Booking updated successfully',
      data: booking,
    });
  }
});
