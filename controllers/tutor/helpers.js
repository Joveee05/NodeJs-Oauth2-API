'use strict';

const Question = require('../../models/questions');
const Tutor = require('../../models/tutorModel');
const AppError = require('../../utils/appError');

const updateQuestion = async function (id, req) {
  const result = await Question.findByIdAndUpdate(
    id,
    {
      $push: {
        answeredBy: {
          user: req.user.fullName,
          role: req.user.role,
          image: req.user.image,
          answer: req.body.answer,
        },
      },
      $inc: { answers: 1 },
    },
    { new: true }
  );
  if (result) {
    return true;
  } else {
    return new AppError('Inavlid question id', 400);
  }
};

const updateNumOfAns = async function (id) {
  const result = await Tutor.findByIdAndUpdate(id, {
    $inc: { numOfAnswers: 1 },
  });
  if (result) {
    return true;
  } else {
    return new AppError('Invalid tutor id', 400);
  }
};

module.exports = {
  updateQuestion,
  updateNumOfAns,
};
