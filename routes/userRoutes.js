const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.createUser);

router.get('/login', userController.logIn);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.get('/', userController.getAllUsers);

module.exports = router;
