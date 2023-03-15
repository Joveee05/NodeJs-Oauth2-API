'use strict';

const express = require('express');
const Schedule = require('../models/scheduleModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createSchedule = catchAsync(async (req, res, next) => {
  const payload = {
    tutorId: req.user.id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  };
  const newSchedule = await Schedule.create(payload);
  res.status(201).json({
    status: 'success',
    message: 'Schedule created successfully',
    data: newSchedule,
  });
});

exports.getSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({ tutorId: req.user.id }).sort(
    '-createdAt'
  );
  if (!schedule.length < 1) {
    return res.status(200).json({
      status: 'success',
      message: 'Schedule Found',
      data: schedule,
    });
  } else {
    return next(new AppError('No schedule found for this tutor', 404));
  }
});

exports.updateSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (schedule) {
    return res.status(200).json({
      status: 'success',
      message: 'Schedule updated successfully',
      data: schedule,
    });
  } else {
    return next(
      new AppError(
        'No schedule found. Please check that the Id is correct',
        404
      )
    );
  }
});

exports.deleteSchedule = catchAsync(async (req, res, next) => {
  const response = await Schedule.findByIdAndDelete(req.params.id);
  if (response) {
    return res.status(200).json({
      status: 'success',
      message: 'Schedule Deleted',
    });
  } else {
    return next(
      new AppError(
        'No schedule found. Please check that the Id is correct',
        404
      )
    );
  }
});
