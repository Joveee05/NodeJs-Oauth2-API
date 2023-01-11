const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  answeredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  answer: {
    type: String,
    required: true,
  },
  answerTimeStamp: {
    type: Date,
    required: true,
  },
  answerModifiedTimeStamp: {
    type: Date,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  vote: {
    type: Number,
    default: 0,
  },
});

answerSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'answeredBy',
    select: 'firstName fullName image',
  });
  next();
});

const AnswerSchema = mongoose.model('AnswerSchema', answerSchema);

module.exports = AnswerSchema;
