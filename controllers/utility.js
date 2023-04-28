//For resolving circular dependencies
const Vote = require('../models/vote');
const Notification = require('../models/notificationModel');
const AppError = require('../utils/appError');
const Contact = require('../models/contactUs');
const Detail = require('../models/saveAssignmentModel');

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

const updateReply = async function (id) {
  const contact = await Contact.findByIdAndUpdate(id, { new: true });
  if (contact) {
    contact.replied = true;
    await contact.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid contact id', 400);
  }
};

const updateSchedule = async function (id) {
  const result = await Schedule.findByIdAndUpdate(id, { new: true });
  if (result) {
    result.booked = true;
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid schedule id', 400);
  }
};

const updateNumOfBookings = async function (id) {
  const result = await Tutor.findByIdAndUpdate(
    id,
    { $inc: { numOfBookings: 1 } },
    { new: true }
  );
  if (result) {
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid tutor id', 400);
  }
};

const saveAssignmentDetails = async function (tutorID, assignmentID) {
  try {
    const payload = {
      tutorID,
      assignmentID,
    };
    const result = await Detail.create(payload);
  } catch (err) {
    return new AppError('Failed to create new assignment entry', 400);
  }
};

module.exports = {
  removeVotesForObjectId,
  createNotification,
  updateReply,
  updateNumOfBookings,
  updateSchedule,
  saveAssignmentDetails,
  updateNotification,
};
