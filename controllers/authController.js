const express = require('express');
const User = require('../models/userModel');
const Tutor = require('../models/tutorModel');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Email = require('../utils/email');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const Contact = require('../models/contactUs');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendAccessToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
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

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  sendAccessToken(user, 200, res);
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
  const { email, fullName, firstName, lastName, password, passwordConfirm } = req.body;

  const user = new User({
    googleId: null,
    email,
    fullName,
    firstName,
    lastName,
    password,
    passwordConfirm,
    emailToken: crypto.randomBytes(64).toString('hex'),
  });
  const newUser = await user.save({ validateBeforeSave: true });
  const url = process.env.WELCOME_URL + `${user.emailToken}`;
  await new Email(newUser, url).sendWelcome();
  sendAccessToken(newUser, 201, res);
});

exports.adminSignUp = catchAsync(async (req, res, next) => {
  const user = new User({
    email: 'admin@pisqre.com',
    fullName: 'Pisqre Community',
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    isVerified: true,
    role: 'admin',
  });
  const adminCheck = await User.findOne({ email: user.email });
  if (adminCheck) {
    return next(new AppError('Admin already exists', 403));
  }
  const admin = await user.save({ validateBeforeSave: true });
  sendAccessToken(admin, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to proceed.', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('This user no longer exists.', 401));
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('This user recently changed password. Please log in with new password.', 401));
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action. Please, Login as Admin to proceed', 403)
      );
    }
    next();
  };

exports.checkUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    const tutor = await Tutor.findById(id);
    req.user = tutor;
  } else {
    req.user = user;
  }
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Wrong Password. Try again', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  sendAccessToken(user, 200, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const token = req.query.token;
  const user = await User.findOne({ emailToken: token });
  if (user) {
    (user.emailToken = undefined), (user.isVerified = true);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Email verification successful',
    });
  } else {
    return next(new AppError('Email verification failed'));
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = process.env.RESET_URL + `${resetToken}`;
  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email. Try again later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendAccessToken(user, 200, res);
});
