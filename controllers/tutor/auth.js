const express = require('express');
const Tutor = require('../../models/tutorModel');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../utils/email');
const AppError = require('../../utils/appError');
const crypto = require('crypto');
const catchAsync = require('../../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendAccessToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please enter email and password', 400));
  }

  const tutor = await Tutor.findOne({ email }).select('+password');

  if (!user || !(await tutor.correctPassword(password, tutor.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  tutor.passwordResetToken = undefined;
  tutor.passwordResetExpires = undefined;
  sendAccessToken(tutor, 200, res);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'You have been logged out successfully',
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const tutorCheck = await Tutor.findOne({ email: req.body.email });
  if (tutorCheck) {
    return next(new AppError('Tutor already exists', 403));
  }
  const tutor = new Tutor({
    googleId: null,
    email: req.body.email,
    fullName: req.body.fullName,
    university: req.body.university,
    degree: req.body.degree,
    CV: req.body.cv,
    course: req.body.course,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    emailToken: crypto.randomBytes(64).toString('hex'),
  });
  const newTutor = await tutor.save({ validateBeforeSave: false });
  sendAccessToken(newTutor, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to proceed.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentTutor = await Tutor.findById(decoded.id);
  if (!currentTutor) {
    return next(new AppError('This tutor no longer exists.', 401));
  }
  if (currentTutor.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'This tutor recently changed password. Please log in with new password.',
        401
      )
    );
  }
  req.user = currentTutor;
  res.locals.user = currentTutor;
  next();
});

// exports.restrictTo =
//   (...roles) =>
//   (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You do not have permission to perform this action.', 403)
//       );
//     }
//     next();
//   };

exports.updatePassword = catchAsync(async (req, res, next) => {
  const tutor = await Tutor.findById(req.user.id).select('+password');
  if (
    !(await tutor.correctPassword(req.body.currentPassword, tutor.password))
  ) {
    return next(new AppError('Wrong Password. Try again', 401));
  }
  tutor.password = req.body.password;
  tutor.passwordConfirm = req.body.passwordConfirm;
  await tutor.save();

  sendAccessToken(tutor, 200, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const token = req.query.token;
  const tutor = await Tutor.findOne({ emailToken: token });
  if (tutor) {
    (tutor.emailToken = undefined), (tutor.isVerified = true);
    await tutor.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Email verification successful',
    });
  } else {
    return next(new AppError('Email verification failed'));
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const tutor = await Tutor.findOne({ email: req.body.email });
  if (!tutor) {
    return next(new AppError('No tutor found with that email address', 404));
  }

  const resetToken = tutor.createPasswordResetToken();
  await tutor.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Copy and paste this URL on your browser: ${resetURL}. \nIf you didn't forget your password, ignore this email`;
  try {
    await sendEmail({
      email: tutor.email,
      subject: 'Your password reset token',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to your email',
    });
  } catch (err) {
    tutor.passwordResetToken = undefined;
    tutor.passwordResetExpires = undefined;
    await tutor.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email. Try again later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const tutor = await Tutor.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!tutor) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  tutor.password = req.body.password;
  tutor.passwordConfirm = req.body.passwordConfirm;
  tutor.passwordResetToken = undefined;
  tutor.passwordResetExpires = undefined;
  await tutor.save();

  sendAccessToken(tutor, 200, res);
});
