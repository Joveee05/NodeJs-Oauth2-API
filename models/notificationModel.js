const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'A notification must have a message'],
    },
    userID: {
      type: mongoose.Schema.ObjectId,
    },
    questionID: {
      type: mongoose.Schema.ObjectId,
    },
    answerID: {
      type: mongoose.Schema.ObjectId,
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
