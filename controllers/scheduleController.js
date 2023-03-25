'use strict';

const express = require('express');
const Schedule = require('../models/scheduleModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
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

exports.createMultipleSchedule = catchAsync(async (req, res, next) => {
  let newSchedule = [];
  const payload = {
    tutorId: req.user.id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  };
  for (let i = 0; i < req.query.numOfSchedule; i++) {
    newSchedule.push(await Schedule.create(payload));
  }
  res.status(201).json({
    status: 'success',
    message: 'Schedule created successfully',
    results: newSchedule.length,
    data: newSchedule,
  });
});

exports.getSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) {
    return next(
      new AppError(
        'Oops.. No schedule found. Please check that the id is correct',
        404
      )
    );
  } else {
    res.status(200).json({
      status: 'success',
      message: 'Schdeule found',
      data: schedule,
    });
  }
});

exports.getMySchedule = catchAsync(async (req, res, next) => {
  const myschedule = await Schedule.find({ tutorId: req.user.id });
  const features = new APIFeatures(
    Schedule.find({ tutorId: req.user.id }),
    req.query
  )
    .sort()
    .paginate();
  const schedule = await features.query;
  if (!schedule.length < 1) {
    return res.status(200).json({
      status: 'success',
      message: 'Schedule Found',
      results: schedule.length,
      myschedule: myschedule.length,
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

exports.getWeeklyPlan = catchAsync(async (req, res, next) => {
  const year = req.query.year * 1;
  const plan = await Schedule.aggregate([
    {
      $unwind: '$startDate',
    },
    {
      $match: {
        startDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $week: '$startDate' },
        numOfSchedule: { $sum: 1 },
        booked: { $push: '$booked' },
      },
    },
    {
      $addFields: { week: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numOfSchedule: -1 },
    },
  ]);

  if (plan.length < 1) {
    return next(new AppError('Oops.. No schedule found for this year', 404));
  } else {
    res.status(200).json({
      status: 'success',
      data: plan,
    });
  }
});

exports.dateQuery = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({ tutorId: req.params.tutorId })
    .where('startDate')
    .gte(req.query.from)
    .lte(req.query.to)
    .exec();
  if (schedule.length < 1) {
    return next(
      new AppError('Oops.. No schedule found between these dates', 404)
    );
  } else {
    res.status(200).json({
      status: 'success',
      results: schedule.length,
      data: schedule,
    });
  }
});
