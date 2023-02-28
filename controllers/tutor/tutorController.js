const express = require('express');
const Tutor = require('../../models/tutorModel');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

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

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

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
  const tutors = await Tutor.find().sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: tutors.length,
    data: {
      tutors,
    },
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
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.', 400));
  }
  const tutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tutor) {
    return next(new AppError('No tutor found with this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Tutor modification successful',
    data: tutor,
  });
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
  } else {
    return next(new AppError('Tutor verification failed'));
  }
});
