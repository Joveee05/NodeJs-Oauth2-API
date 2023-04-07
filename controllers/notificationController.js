const express = require('express');
const Notification = require('../models/notificationModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
let { updateNotification } = require('../controllers/utility');
const APIFeatures = require('../utils/apiFeatures');

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const myNotifications = await Notification.find({ userID: req.user.id });
  const features = new APIFeatures(
    Notification.find({ userID: req.user.id }),
    req.query
  )
    .sort()
    .paginate();

  const notification = await features.query;
  if (myNotifications.length < 1 || notification.length < 1) {
    return next(new AppError('You have no new notifications', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Notification found',
    results: notification.length,
    allMyNotifications: myNotifications.length,
    data: notification,
  });
});

exports.getOneNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return next(new AppError('No notification found with that id', 404));
  }
  const update = await updateNotification(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Notificaton found',
    data: update,
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) {
    return next(new AppError('No notification found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully',
  });
});
