const express = require('express');
const User = require('../models/userModel');
const Assignment = require('../models/assignmentModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const { createNotification, assignmentCompletedStatus } = require('./utility');
const Email = require('../utils/email');

const message =
  'We have recieved your assignment. A solution will be provided shortly - Admin';

exports.createAssignment = catchAsync(async (req, res, next) => {
  const body = {
    courseName: req.body.courseName,
    description: req.body.description,
    amount: req.body.amount,
    postedBy: req.user.id,
    deadLine: req.body.deadLine,
    pisqreId: Math.floor(Math.random() * 100000000 + 1),
  };
  const userId = body.postedBy;
  if (!body) {
    return next(new AppError('No request body object', 400));
  }
  const assignment = await Assignment.create(body);
  await createNotification(message, userId, assignment._id);

  res.status(201).json({
    status: 'success',
    message: 'Assignment created successfully',
    data: assignment,
  });
});

exports.getAllAssignments = catchAsync(async (req, res, next) => {
  const allAssignments = await Assignment.find();
  const features = new APIFeatures(Assignment.find(), req.query)
    .sort()
    .paginate();

  const assignments = await features.query;
  if (allAssignments.length < 1 || assignments.length < 1) {
    return next(new AppError('No assignments found in the database.', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `${allAssignments.length} assignments found`,
    allAssignments: allAssignments.length,
    results: assignments.length,
    data: assignments,
  });
});

exports.getAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return next(
      new AppError('No assignment found in the database with this id.', 404)
    );
  } else {
    return res.status(200).json({
      status: 'success',
      message: 'Assignment found successfully',
      data: assignment,
    });
  }
});

exports.getMyAssignments = catchAsync(async (req, res, next) => {
  const allMyAssignments = await Assignment.find({ postedBy: req.user.id });
  const features = new APIFeatures(
    Assignment.find({ postedBy: req.user.id }),
    req.query
  )
    .sort()
    .paginate();
  const myAssignments = await features.query;
  if (myAssignments.length < 1 || allMyAssignments.length < 1) {
    return next(new AppError('Oops... You have no assignments!!', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `You have ${allMyAssignments.length} assignments`,
    allMyAssignments: allMyAssignments.length,
    results: myAssignments.length,
    data: myAssignments,
  });
});

exports.getAssignmentsForUser = catchAsync(async (req, res, next) => {
  const allUserAssignments = await Assignment.find({ postedBy: req.params.id });
  const features = new APIFeatures(
    Assignment.find({ postedBy: req.params.id }),
    req.query
  )
    .sort()
    .paginate();
  const assignments = await features.query;
  if (assignments.length < 1 || allUserAssignments.length < 1) {
    return next(new AppError('Oops... You have no assignments!!', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `This user has ${allUserAssignments.length} assignments`,
    allUserAssignments: allUserAssignments.length,
    results: assignments.length,
    data: assignments,
  });
});

exports.updateAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!assignment) {
    return next(
      new AppError('No assignment found in the database with this id.', 404)
    );
  } else {
    res.status(200).json({
      status: 'success',
      message: 'Assignment updated successfully',
      data: assignment,
    });
  }
});

exports.deleteAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) {
    return next(
      new AppError('No assignment found in the database with this id.', 404)
    );
  } else {
    res.status(200).json({
      status: 'success',
      message: 'Assignment deleted successfully',
    });
  }
});

exports.sendToStudent = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const assignmentId = req.params.id;
  const user = await User.findById(userId);
  if (!userId || !assignmentId) {
    return next(new AppError('Please provide user and assignment id', 400));
  } else if (!user) {
    return next(new AppError('Invalid user id', 404));
  }
  const message = `Hi ${user.fullName}, the solution to your assignment is now available`;

  await assignmentCompletedStatus(assignmentId);
  await createNotification(message, userId, assignmentId);
  await new Email(user).notifyUser();

  res.status(200).json({
    status: 'success',
    message: 'User notified successfully',
  });
});

exports.searchAssignment = catchAsync(async (req, res, next) => {
  const data = await Assignment.find({
    $text: { $search: req.query.pisqreId, $caseSensitive: false },
  });

  if (data.length < 1) {
    return next(
      new AppError(
        'Oops... No assignment found. Please check that the pisqreId is correct',
        404
      )
    );
  } else {
    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
    });
  }
});
