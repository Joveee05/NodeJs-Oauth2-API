const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'You must have a fullName'],
    },

    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
      lowercase: true,
      trim: true,
    },
    message: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
