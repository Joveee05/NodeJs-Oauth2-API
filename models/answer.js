const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  answeredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  answeredByTutor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tutor',
  },
  answer: {
    type: String,
    required: true,
  },
  question: {
    type: mongoose.Schema.ObjectId,
    ref: 'QuestionPageSchema',
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
    path: 'question answeredBy answeredByTutor',
    select: 'fullName role image title',
  });
  next();
});

const AnswerSchema = mongoose.model('AnswerSchema', answerSchema);

module.exports = AnswerSchema;
