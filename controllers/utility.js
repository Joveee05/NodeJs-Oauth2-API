//For resolving circular dependencies
const Vote = require('../models/vote');
const Notification = require('../models/notificationModel');
const AppError = require('../utils/appError');

async function removeVotesForObjectId(id) {
  try {
    const res = await Vote.deleteMany({ objectId: id });
    return {
      success: true,
      data: res,
      message: `successfully deleted all votes for {id}`,
    };
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
}

async function createNotification(message, userID, questionID, answerID) {
  try {
    const payload = {
      message,
      userID,
      questionID,
      answerID,
    };
    const notification = await Notification.create(payload);
  } catch (err) {
    return new AppError('Failed to create notification', 400);
  }
}

const updateNotification = async function (id) {
  const result = await Notification.findByIdAndUpdate(id, { new: true });
  if (result) {
    result.read = true;
    const notification = await result.save({ validateBeforeSave: false });
    return notification;
  } else {
    return new AppError('Inavlid notification id', 400);
  }
};

module.exports = {
  removeVotesForObjectId,
  createNotification,
  updateNotification,
};
