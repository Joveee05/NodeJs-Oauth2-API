const express = require('express');
const Notification = require('../models/notificationModel');
const Detail = require('../models/saveAssignmentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
let { updateNotification } = require('../controllers/utility');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllSentAssignments = catchAsync(async (req, res, next) => {
  const allSentAssignments = await Detail.find();
  const features = new APIFeatures(Detail.find(), req.query).sort().paginate();

  const assignments = await features.query;
  if (allSentAssignments.length < 1 || assignments.length < 1) {
    return next(new AppError('No assignments found in the database.', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `${allSentAssignments.length} assignments found`,
    allSentAssignments: allSentAssignments.length,
    results: assignments.length,
    data: assignments,
  });
});

exports.getTutorAssignment = catchAsync(async (req, res, next) => {
  const tutor = await Detail.find({ tutorID: req.params.id });
  const features = new APIFeatures(
    Detail.find({ tutorID: req.params.id }),
    req.query
  )
    .sort()
    .paginate();

  const result = await features.query;

  if (tutor.length < 1 || result.length < 1) {
    return next(
      new AppError('Oops... No assignments found for this tutor', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    allAssignments: tutor.length,
    results: result.length,
    message: `${result.length} assignments found`,
    data: result,
  });
});

exports.acceptedAssignment = catchAsync(async (req, res, next) => {
  const allAcceptedAssignments = await Detail.find({ accepted: true });

  const features = new APIFeatures(Detail.find({ accepted: true }), req.query)
    .sort()
    .paginate();

  const assignments = await features.query;

  if (assignments.length < 1 || allAcceptedAssignments.length < 1) {
    return next(new AppError('No accepted assignments found', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `${assignments.length} accepted assignments`,
    allAcceptedAssignments: allAcceptedAssignments.length,
    result: assignments.length,
    data: assignments,
  });
});

exports.rejectedAssignment = catchAsync(async (req, res, next) => {
  const allRejectedAssignments = await Detail.find({ rejected: true });

  const features = new APIFeatures(Detail.find({ rejected: true }), req.query)
    .sort()
    .paginate();

  const assignments = await features.query;

  if (assignments.length < 1 || allRejectedAssignments.length < 1) {
    return next(new AppError('No rejected assignments found', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `${assignments.length} rejected assignments`,
    allRejectedAssignments: allRejectedAssignments.length,
    result: assignments.length,
    data: assignments,
  });
});

exports.findAcceptedAssignments = catchAsync(async (req, res, next) => {
  const assignment = await Detail.find({ assignmentID: req.params.id })
    .where('accepted')
    .equals(true)
    .exec();
  if (assignment.length < 1) {
    return next(new AppError('No tutor has accepted this assignment', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `${assignment.length} accepted assignment(s) `,
    data: assignment,
  });
});

exports.findTutors = catchAsync(async (req, res, next) => {
  const assignment = await Detail.find({ assignmentID: req.params.id });
  if (assignment.length < 1) {
    return next(
      new AppError('This assignment has not been sent to a tutor', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: `${assignment.length} tutors have been sent this assignment `,
    data: assignment,
  });
});
