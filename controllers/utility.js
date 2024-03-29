//For resolving circular dependencies
const Vote = require('../models/vote');
const Notification = require('../models/notificationModel');
const Assignment = require('../models/assignmentModel');
const AppError = require('../utils/appError');
const Contact = require('../models/contactUs');
const Detail = require('../models/saveAssignmentModel');
const Tutor = require('../models/tutorModel');
const Schedule = require('../models/scheduleModel');

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

async function createNotification(type, message, userID, questionID, answerID) {
  try {
    const payload = {
      type,
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
  const result = await Notification.findById(id);
  if (result) {
    result.read = true;
    const notification = await result.save({ validateBeforeSave: false });
    return notification;
  } else {
    return new AppError('Inavlid notification id', 400);
  }
};

const updateReply = async function (id) {
  const contact = await Contact.findById(id);
  if (contact) {
    contact.replied = true;
    await contact.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid contact id', 400);
  }
};

const updateSchedule = async function (id) {
  const result = await Schedule.findById(id);
  if (result) {
    result.booked = true;
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid schedule id', 400);
  }
};

const removeSchedule = async function (id) {
  const result = await Schedule.findById(id);
  if (result) {
    result.booked = false;
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid schedule id', 400);
  }
};

const updateNumOfBookings = async function (id) {
  const result = await Tutor.findByIdAndUpdate(id, { $inc: { numOfBookings: 1 } }, { new: true });
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

const updateAssignmentStatus = async function (id) {
  const response = await Assignment.findById(id);
  if (response) {
    response.status = 'sent to tutor';
    await response.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid assignment id', 400);
  }
};

const assignToTutorStatus = async function (id, tutorId) {
  const tutor = await Tutor.findById(tutorId);
  const response = await Assignment.findById(id);
  if (response) {
    response.status = `assigned to ${tutor.fullName}`;
    await response.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid assignment or tutor id', 400);
  }
};

const assignmentCompletedStatus = async function (id) {
  const response = await Assignment.findById(id);
  if (response) {
    response.status = 'assignment completed';
    await response.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid assignment or tutor id', 400);
  }
};

const assignmentVerificationStatus = async function (id) {
  const response = await Assignment.findById(id);
  if (response) {
    response.status = 'answer verification by admin';
    await response.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid assignment or tutor id', 400);
  }
};

const increaseAssignments = async (tutorId) => {
  const result = await Tutor.findByIdAndUpdate(tutorId, { $inc: { numOfAssignments: 1 } }, { new: true });
  if (result) {
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid tutor id', 400);
  }
};

const updateTutorId = async function (id, tutorId) {
  const result = await Assignment.findByIdAndUpdate(id, { tutorID: tutorId }, { new: true });
  if (result) {
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid assignment id', 400);
  }
};

const answerVerified = async function (id) {
  const result = await Assignment.findById(id);
  if (result) {
    result.answerVerified = true;
    await result.save({ validateBeforeSave: false });
  } else {
    return new AppError('Inavlid assignment id', 400);
  }
};

module.exports = {
  removeVotesForObjectId,
  createNotification,
  updateReply,
  updateNumOfBookings,
  updateSchedule,
  removeSchedule,
  saveAssignmentDetails,
  updateNotification,
  assignToTutorStatus,
  increaseAssignments,
  updateTutorId,
  answerVerified,
  assignmentVerificationStatus,
  assignmentCompletedStatus,
  updateAssignmentStatus,
};
