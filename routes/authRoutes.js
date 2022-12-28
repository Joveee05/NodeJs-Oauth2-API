const express = require('express');
const passport = require('passport');
const { nocache, generateAccessToken } = require('../controllers/agora');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/welcome');
  }
);

router.get('/login', (req, res) => {
  res.render('login', {
    layout: 'login',
  });
});

router.get('/signup', (req, res) => {
  res.render('login', {
    layout: 'login',
  });
});

router.get('/access_token', nocache, generateAccessToken);

module.exports = router;
