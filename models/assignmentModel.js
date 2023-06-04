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
      type: Number,
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
    pisqreId: {
      type: String,
    },
    tutorID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tutor',
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
