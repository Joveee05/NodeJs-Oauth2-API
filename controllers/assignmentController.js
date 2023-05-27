const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Assignment = require('../models/assignmentModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const { createNotification, assignmentCompletedStatus } = require('./utility');
const { addAnswer, getAnswerByOptions } = require('./answerController');
const { deleteAssignmentFile } = require('./assignmentUpload');
const Email = require('../utils/email');
const Tutor = require('../models/tutorModel');

const message = 'We have recieved your assignment. A solution will be provided before your stated deadline - Admin';

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
  await createNotification('new_assignment', message, userId, assignment._id);

  res.status(201).json({
    status: 'success',
    message: 'Assignment created successfully',
    data: assignment,
  });
});

exports.getAllAssignments = catchAsync(async (req, res, next) => {
  const allAssignments = await Assignment.find();
  const features = new APIFeatures(Assignment.find(), req.query).sort().paginate();

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

exports.checkUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.query.user);
  if (!user) {
    const tutor = await Tutor.findById(req.query.user);
    req.user = tutor;
  } else {
    req.user = user;
  }
  next();
});

exports.protectAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return next(new AppError('No assignment found in the database with this id.', 404));
  } else if (
    !(assignment.postedBy._id == req.user.id) &&
    !(req.user.role === 'tutor') &&
    !(req.user.role === 'admin')
  ) {
    return next(new AppError('Oops.. You do not have the permission to view this assignment answer', 403));
  }
  next();
});

exports.getAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return next(new AppError('No assignment found in the database with this id.', 404));
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
  const features = new APIFeatures(Assignment.find({ postedBy: req.user.id }), req.query).sort().paginate();
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
  const features = new APIFeatures(Assignment.find({ postedBy: req.params.id }), req.query).sort().paginate();
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
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!assignment) {
    return next(new AppError('No assignment found in the database with this id.', 404));
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
    return next(new AppError('No assignment found in the database with this id.', 404));
  } else {
    await deleteAssignmentFile(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Assignment deleted successfully',
    });
  }
});

exports.searchAssignment = catchAsync(async (req, res, next) => {
  const data = await Assignment.find({
    $text: { $search: req.query.pisqreId, $caseSensitive: false },
  });

  if (data.length < 1) {
    return next(new AppError('Oops... No assignment found. Please check that the pisqreId is correct', 404));
  } else {
    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
    });
  }
});

exports.assignmentAnswer = catchAsync(async (req, res, next) => {
  const assignmentId = req.params.assignmentId;
  let body = {
    answeredBy: req.user.id,
    question: assignmentId,
    answer: req.body.answer,
    answerTimeStamp: new Date(),
    answerModifiedTimeStamp: new Date(),
  };
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return next(new AppError('Invalid or no assignment Id', 404));
  }
  const user = assignment.postedBy;

  const message2 = `Hi ${user.fullName}, the solution to your assignment is now available`;
  const response = await addAnswer(body);
  const answerId = response.data.id;
  if (response.success == true) {
    await assignmentCompletedStatus(assignmentId);
    await createNotification('assignment complete', message2, user, assignmentId, answerId);
    return res.status(201).json(response);
  } else {
    return res.status(404).json(response);
  }
});

exports.getAssignmentAnswer = catchAsync(async (req, res, next) => {
  let response = await getAnswerByOptions({ question: req.params.id });
  res.json(response);
});

// exports.getCheckoutSession = catchAsync(async (req, res, next) => {
//   const assignmentId = req.params.assignmentId;
//   const userId = req.user.id;
//   const assignment = await Assignment.findById(assignmentId);
//   const user = await User.findById(userId);

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     success_url: `${req.protocol}://${req.get('host')}/?assignment=${assignmentId}&user=${req.user.id}&amount=${
//       assignment.amount
//     }`,
//     cancel_url: `${req.protocol}://${req.get('host')}/assignment/${assignment.courseName}`,
//     customer_email: req.user.email,
//     client_reference_id: assignmentId,
//     line_items: [
//       {
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: `${assignment.courseName} Assignment`,
//             description: assignment.description,
//             images: [`https://pisqre-app-4m3x3.ondigitalocean.app/img/users/${user.image}`],
//           },
//           unit_amount: assignment.amount * 100,
//         },
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//   });

//   res.status(200).json({
//     status: 'success',
//     session,
//   });
// });
