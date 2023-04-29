const mongoose = require('mongoose');
const validator = require('validator');

const assignmentSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, 'Please provide a courseName'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    amount: {
      type: String,
      required: [true, 'Please enter an amount'],
    },
    deadLine: {
      type: Date,
      required: [true, 'Please provide a deadline'],
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      default: 'submitted',
    },
    assignmentID: {
      type: mongoose.Schema.ObjectId,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

assignmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'postedBy',
    select: 'fullName role email image',
  });
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
