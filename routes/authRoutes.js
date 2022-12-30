const express = require('express');
const passport = require('passport');
const { nocache, generateAccessToken } = require('../controllers/agora');
const authController = require('../controllers/authController');
const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.status(200).json({
      status: 'success',
      data: req.user,
    });
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
