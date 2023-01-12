const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionPageSchema = new Schema(
  {
    vote: {
      type: Number,
      default: 0,
    },

    answers: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      required: true,
    },
    questionBody: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    answeredBy: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A question must belong to a user.'],
    },

    keywords: {
      type: [String],
      defaut: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

questionPageSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user answeredBy',
    select: 'firstName fullName image',
  });
  next();
});

const QuestionPageSchema = mongoose.model(
  'QuestionPageSchema',
  questionPageSchema
);

module.exports = QuestionPageSchema;
