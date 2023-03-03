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
  passport.authenticate('google', { failureRedirect: '/api/users/login' }),
  (req, res) => {
    res.redirect('/api/users/me');
  }
);

router.get('/access_token', nocache, generateAccessToken);

module.exports = router;
