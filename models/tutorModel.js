const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const tutorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'A user must have a firstname'],
    },
    email: {
      type: String,
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
      lowercase: true,
      trim: true,
    },
    emailToken: {
      type: String,
    },
    languageSpoken: {
      type: String,
    },
    languageLevel: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    countryOfOrigin: {
      type: String,
    },
    certificate: {
      type: String,
    },
    startDate: {
      type: String,
    },
    issuedBy: {
      type: String,
    },
    endDate: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
      maxLength: 300,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      default: 'tutor',
    },
    adminVerified: {
      type: Boolean,
      default: false,
    },
    CV: {
      type: String,
      required: [true, 'Please upload your CV'],
    },
    degree: {
      type: String,
      required: [true, 'A tutor must have a degree'],
    },
    degreeType: {
      type: String,
    },
    university: {
      type: String,
      required: [true, 'A tutor must have attended a university'],
    },
    course: {
      type: String,
      required: [true, 'A tutor must have topics'],
    },
    password: {
      type: String,
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
      },
    },
    versionKey: false,
    timestamps: true,
  }
);

tutorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

tutorSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// tutorSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

tutorSchema.methods.correctPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

tutorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

tutorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Tutor = mongoose.model('Tutor', tutorSchema);
module.exports = Tutor;
