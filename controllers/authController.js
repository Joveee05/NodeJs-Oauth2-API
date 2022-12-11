const express = require('express');
const User = require('../models/userModel');
const passport = require('passport');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');

exports.logOut = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect('/users/login');
  });
};

exports.createUser = (req, res, next) => {
  // get all the values
  const { email, displayName, firstName, lastName, password, passwordConfirm } =
    req.body;
  // check if the are empty
  if (
    !email ||
    !displayName ||
    !firstName ||
    !lastName ||
    !password ||
    !passwordConfirm
  ) {
    return next(new AppError('All fields are required', 400));
  } else {
    // validate email and username and password
    // skipping validation
    // check if a user exists
    User.findOne(
      { $or: [{ email: email }, { displayName: displayName }] },
      function (err, data) {
        if (err) throw err;
        if (data) {
          return next(new AppError('User Exists, Try Logging In !', 403));
        } else {
          // generate a salt
          bcrypt.genSalt(12, (err, salt) => {
            if (err) throw err;
            // hash the password
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err;
              // save user in db
              User({
                displayName: displayName,
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hash,
                passwordConfirm: hash,
                googleId: null,
                provider: 'email',
              }).save((err, data) => {
                if (err) throw err;
                // login the user
                // use req.login
                // redirect , if you don't want to login
                res.redirect('/welcome');
              });
            });
          });
        }
      }
    );
  }
};
