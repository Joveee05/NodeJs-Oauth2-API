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
      ref: 'QuestionPageSchema',
    },
    answerID: {
      type: mongoose.Schema.ObjectId,
      ref: 'AnswerSchema',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// notificationSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'userID',
//     select: 'fullName role image',
//   });
//   next();
// });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
