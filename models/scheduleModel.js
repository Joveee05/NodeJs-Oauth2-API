const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tutor',
      required: [true, 'Please provide a tutorId'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    booked: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
