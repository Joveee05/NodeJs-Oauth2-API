const express = require('express');
const Tutor = require('../../models/tutorModel');
const Question = require('../../models/questions');
const Answer = require('../../models/answer');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../../utils/appError');
const Email = require('../../utils/email');
const catchAsync = require('../../utils/catchAsync');
const APIFeatures = require('../../utils/apiFeatures');
let { createNotification } = require('../utility');
let {
  updateQuestion,
  updateNumOfAns,
  removeNumOfAns,
} = require('../tutor/helpers');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Oops... Sorry, Please upload images only', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('image');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `tutor-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tutors/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllTutors = catchAsync(async (req, res, next) => {
  const allTutors = await Tutor.find();
  const features = new APIFeatures(Tutor.find(), req.query).sort().paginate();

  const tutors = await features.query;
  if (tutors.length < 1 || allTutors.length < 1) {
    return next(new AppError('No tutors found in the database.', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `${allTutors.length} tutors found in database`,
    allTutors: allTutors.length,
    results: tutors.length,
    data: tutors,
  });
});

exports.getUnverifiedTutors = catchAsync(async (req, res, next) => {
  const allUnverifiedTutors = await Tutor.find({
    adminVerified: { $ne: true },
  });
  const features = new APIFeatures(
    Tutor.find({ adminVerified: { $ne: true } }),
    req.query
  )
    .sort()
    .paginate();

  const tutors = await features.query;
  if (tutors.length < 1 || allUnverifiedTutors.length < 1) {
    return next(
      new AppError('No unverified tutors found in the database.', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: `${allUnverifiedTutors.length} unverified tutors found in database`,
    allTutors: allUnverifiedTutors.length,
    results: tutors.length,
    data: tutors,
  });
});

exports.findTutor = catchAsync(async (req, res, next) => {
  const tutor = await Tutor.find({
    $or: [{ course: { $regex: req.body.course } }],
  });
  if (tutor.length < 1) {
    return next(
      new AppError('Oops... No tutor found. Try searching again.', 404)
    );
  } else {
    res.status(200).json({
      status: 'success',
      result: tutor.length,
      tutor,
    });
  }
});

exports.getTutor = catchAsync(async (req, res, next) => {
  const tutor = await Tutor.findById(req.params.id);
  if (!tutor) {
    return next(new AppError('No tutor found with this ID'), 404);
  }
  res.status(200).json({
    status: 'success',
    message: 'tutor found',
    data: {
      tutor,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.deleteTutor = catchAsync(async (req, res, next) => {
  const tutor = await Tutor.findByIdAndDelete(req.params.id);

  if (!tutor) {
    return next(new AppError('No user found with this ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateTutor = catchAsync(async (req, res, next) => {
  if (
    req.body.password ||
    req.body.passwordConfirm ||
    req.body.email ||
    req.body.fullName
  ) {
    return next(
      new AppError(
        'This route is not for password, name or email updates.',
        400
      )
    );
  }
  const tutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tutor) {
    return next(new AppError('No tutor found with this ID', 404));
  } else {
    await new Email(tutor).tutorVerify();
    res.status(200).json({
      status: 'success',
      message: 'Tutor modification successful',
      data: tutor,
    });
  }
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates', 400));
  }

  const filteredBody = filterObj(req.body, 'fullName', 'email');
  if (req.file) filteredBody.image = req.file.filename;

  const tutor = await Tutor.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: tutor,
    },
  });
});

exports.verifyTutor = catchAsync(async (req, res, next) => {
  const tutorId = req.params.id;
  const tutor = await Tutor.findOne({ _id: tutorId });
  if (tutor) {
    tutor.adminVerified = true;
    await tutor.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Tutor verification successful',
    });
  } else if (tutor.adminVerified == true) {
    return next(new AppError('This tutor has already been verified', 400));
  } else {
    return next(
      new AppError('Tutor verification failed. No tutor found.', 404)
    );
  }
});

exports.askQuestion = catchAsync(async (req, res, next) => {
  let keywords = [];
  if (req.body.keywords) keywords = req.body.keywords;

  const body = {
    questionBody: req.body.questionBody,
    title: req.body.title,
    iP: req.ip,
    branch: req.body.branch,
    tutor: req.user.id,
    keywords,
  };
  const question = await Question.create(body);

  res.status(201).json({
    status: 'success',
    message: 'Question created successfully',
    data: question,
  });
});

exports.tutorAnswer = catchAsync(async (req, res, next) => {
  const questionId = req.params.id;
  let body = {
    answeredByTutor: req.user.id,
    question: questionId,
    answer: req.body.answer,
    answerTimeStamp: new Date(),
    answerModifiedTimeStamp: new Date(),
  };
  const question = await Question.findById(questionId);
  const userID = question.user._id;
  const tutor = await Tutor.findById(req.user.id);
  const message = `${tutor.fullName} answered one of your questions`;

  const answer = await Answer.create(body);
  const answerID = answer._id;
  if (answer) {
    updateQuestion(questionId, req);
    updateNumOfAns(req.user.id);
    await createNotification(message, userID, questionId, answerID);
  }
  res.status(201).json({
    status: 'success',
    message: 'Answer created successfully',
    data: answer,
  });
});

exports.myQuestions = catchAsync(async (req, res, next) => {
  const allMyQuestions = await Question.find({ tutor: req.user.id });
  const features = new APIFeatures(
    Question.find({ tutor: req.user.id }),
    req.query
  )
    .sort()
    .paginate();
  const getMyQuestions = await features.query;

  if (getMyQuestions.length < 1) {
    return next(new AppError('Oops... No questions found!!', 404));
  }
  res.status(200).json({
    status: 'success',
    allMyQuestions: allMyQuestions.length,
    results: getMyQuestions.length,
    data: getMyQuestions,
  });
});

exports.myAnswers = catchAsync(async (req, res, next) => {
  const allMyAnswers = await Answer.find({ answeredByTutor: req.user.id });
  const features = new APIFeatures(
    Answer.find({ answeredByTutor: req.user.id }),
    req.query
  )
    .sortByTimeStamp()
    .paginate();
  const getMyAnswers = await features.query;

  if (getMyAnswers.length < 1) {
    return next(new AppError('Oops... No answers found!!', 404));
  }
  res.status(200).json({
    status: 'success',
    allMyAnswers: allMyAnswers.length,
    results: getMyAnswers.length,
    data: getMyAnswers,
  });
});

exports.deleteAnswer = catchAsync(async (req, res, next) => {
  const answer = await Answer.findByIdAndDelete(req.params.id);

  if (!answer) {
    return next(new AppError('No answer found with this id', 404));
  }

  await removeNumOfAns(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Answer deleted successfully',
  });
});

exports.searchTutor = catchAsync(async (req, res, next) => {
  const data = await Tutor.find({
    $text: { $search: req.query.course, $caseSensitive: false },
  });

  if (data.length < 1) {
    return next(
      new AppError(
        'Oops... No tutor found. This may be due to a spelling error. Try searching again.',
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
