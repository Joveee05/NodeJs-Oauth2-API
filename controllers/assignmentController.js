const express = require('express');
const User = require('../models/userModel');
const Assignment = require('../models/assignmentModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.createAssignment = catchAsync(async (req, res, next) => {
  const body = {
    courseName: req.body.courseName,
    email: req.body.email,
    description: req.body.description,
    amount: req.body.amount,
    postedBy: req.user.id,
    deadLine: req.body.deadLine,
  };
  const assignment = await Assignment.create(body);

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
