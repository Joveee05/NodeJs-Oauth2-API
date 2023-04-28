const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema(
  {
    tutorID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tutor',
    },
    assignmentID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Assignment',
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    rejected: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

detailSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tutorID assignmentID',
    select: 'fullName email image courseName amount deadLine',
  });
  next();
});

const Detail = mongoose.model('SentAssignments', detailSchema);

module.exports = Detail;
