const express = require('express');
const Notification = require('../models/notificationModel');
const Detail = require('../models/saveAssignmentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
let { updateNotification } = require('../controllers/utility');
const APIFeatures = require('../utils/apiFeatures');

exports.getTutorAssignment = catchAsync(async (req, res, next) => {
  const tutor = await Detail.find({ tutorID: req.params.id });
  if (!tutor) {
    return next(
      new AppError('Oops... No assignments found for this tutor', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: `${tutor.length} assignments found`,
    data: tutor,
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
