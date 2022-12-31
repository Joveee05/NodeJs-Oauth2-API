const express = require('express');
const passport = require('passport');
const { nocache, generateAccessToken } = require('../controllers/agora');
const authController = require('../controllers/authController');
const router = express.Router();
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const getAccessToken = (user, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  return token;
};

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = getAccessToken(req.user._id, res);
    res.writeHead(302, {
      Location: 'http://localhost:4200/auth/google/' + token,
    });
    res.end();
    /*  res.status(200).json({
      status: 'success',
      data: req.user,
    }); */
  }
);

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('login');
});

router.get('/access_token', nocache, generateAccessToken);

module.exports = router;
