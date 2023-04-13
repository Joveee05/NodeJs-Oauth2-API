const express = require('express');
const User = require('../models/userModel');
const Contact = require('../models/contactUs');
const Email = require('../utils/email');
const adminEmail = require('../utils/adminEmail');
const APIFeatures = require('../utils/apiFeatures');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { updateReply } = require('./utility');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Oops... Sorry, Please upload images only', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('image');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const allUsers = await User.find();
  const features = new APIFeatures(User.find(), req.query).sort().paginate();

  const users = await features.query;

  if (allUsers.length < 1 || users.length < 1) {
    return next(new AppError('No users found in the database.', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `${allUsers.length} users found in the database`,
    allUsers: allUsers.length,
    results: users.length,
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with this ID'), 404);
  }
  res.status(200).json({
    status: 'success',
    message: 'user found',
    data: {
      user,
    },
  });
});

exports.getAllContacts = catchAsync(async (req, res, next) => {
  const allContacts = await Contact.find();
  const features = new APIFeatures(Contact.find(), req.query).sort().paginate();

  const contacts = await features.query;

  if (allContacts.length < 1 || contacts.length < 1) {
    return next(
      new AppError('No contactUs emails found in the database.', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: `${allContacts.length} contactUs emails found in the database`,
    allContacts: allContacts.length,
    results: contacts.length,
    data: contacts,
  });
});

exports.getContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    return next(new AppError('No contact found with this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'contact found',
    data: contact,
  });
});

exports.contactUs = catchAsync(async (req, res, next) => {
  const { fullName, email, message } = req.body;
  if (!fullName || !email || !message) {
    return next(new AppError('Please input all fields'));
  }
  const contact = await Contact.create(req.body);
  await new Email(contact).contactUs();
  res.status(201).json({
    status: 'success',
    message: 'Email sent successfully',
    data: contact,
  });
});

exports.adminReply = catchAsync(async (req, res, next) => {
  const contactId = req.params.id;
  const message = req.body.message;
  const contact = await Contact.findById(contactId);
  if (!message || !contact) {
    return next(
      new AppError('Please input a message and a valid contact Id', 400)
    );
  }
  const fullName = contact.fullName;
  const email = contact.email;

  await new adminEmail(fullName, email, message).sendReply();
  updateReply(contactId);
  res.status(200).json({
    status: 'success',
    message: 'Admin response has been sent successfully',
  });
});

exports.addAdmin = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    'fullName email role'
  );

  if (!user) {
    return next(new AppError('No user found with the email provided', 404));
  } else if (user.role === 'admin') {
    return next(new AppError('This user is already an admin', 403));
  } else {
    user.role = 'admin';
    const newAdmin = await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: 'success',
      message: `${user.fullName} has successfully been made an admin`,
      data: newAdmin,
    });
  }
});

exports.removeAdmin = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    'fullName email role'
  );

  if (!user) {
    return next(new AppError('No user found with the email provided', 404));
  } else if (user.role === 'student') {
    return next(new AppError('This user is already a student', 403));
  } else {
    user.role = 'student';
    const newStudent = await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: 'success',
      message: `${user.fullName} has successfully been made a student`,
      data: newStudent,
    });
  }
});

exports.deleteContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return next(new AppError('No contact found with this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Contact deleted successfully',
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.', 400));
  }
  const modifiedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!modifiedUser) {
    return next(new AppError('No user found with this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'user modification successful',
    data: modifiedUser,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates', 400));
  }

  const filteredBody = filterObj(req.body, 'fullName', 'email');
  if (req.file) filteredBody.image = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
