const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/logout', authController.logOut);

router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.get('/verify-email', authController.verifyEmail);

router.patch('/updateMyPassword', authController.updatePassword);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.get('/', userController.getAllUsers);

/**
 * @swagger
 * components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          -googleId
 *          -displayName
 *          -firstName
 *          -lastName
 *          -email
 *          -password
 *          -passwordConfirm
 *        properties:
 *           id:
 *              type: String
 *              description: The auto-generated id of the user
 *           firstName:
 *              type: String
 *              description: The user first name
 *           lastName:
 *              type: String
 *              description: The user first name
 *           googleId:
 *              type: String
 *              description: The auto-generated googleId of the user
 *           email:
 *              type: String
 *              description: The user email
 *           password:
 *              type: String
 *              description: The user password
 *           passwordConfirm:
 *              type: String
 *              description: Confirm user password
 *           photo:
 *              type: String
 *              description: User profile photo
 *        example:
 *          id: 65648ffa94874749b5
 *          googleId: 1426wgy3767727662
 *          name: Max Lawrence
 *          firstName: Max
 *          lastName: Max Lawrence
 *          email: max@example.com
 *          password: test1234
 *          passwordConfirm: test1234
 *          photo: default.jpg
 *
 */

/**
 * @swagger
 * tags:
 *    name: Users
 *    description: The Users Managing API
 */

/**
 * @swagger
 * /users/{id}:
 *    patch:
 *      summary: Edit or update user
 *      tags: [Users]
 *      parameters:
 *      - in: path
 *        name: id
 *        schema:
 *        type: string
 *        required: true
 *        description: The user id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *            example:
 *               name:
 *               email:
 *      responses:
 *        200:
 *          description: User updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        404:
 *          description: The user was not found
 *        500:
 *          description: Server error
 */

/**
 * @swagger
 * /users/{id}:
 *      get:
 *        summary: Get user by id
 *        tags: [Users]
 *        parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The user id
 *        responses:
 *          200:
 *            description: User found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *          404:
 *            description: Not found
 *
 */

/**
 * @swagger
 * /users/{id}:
 *    delete:
 *      summary: Delete User
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The user id
 *      responses:
 *          204:
 *            description: No content
 *          404:
 *            description: Not found
 */

/**
 * @swagger
 * /users/signup:
 *    post:
 *      summary: Manual User SignUp without Google OAuth
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                 $ref: '#/components/schemas/User'
 *              example:
 *                  displayName: Monica Jules
 *                  firstName: Monica
 *                  lastName: Jules
 *                  email: monica@example.com
 *                  password: test1234
 *                  passwordConfirm: test1234
 *      responses:
 *          201:
 *            description: Hello, this is the Pisqre API
 *            content:
 *                application/json:
 *                    schema:
 *                       $ref: '#/components/schemas/User'
 *                    example:
 *                        id: 65648ffa94874749b5
 *                        displayName: Monica Jules
 *                        firstName: Monica
 *                        lastName: Jules
 *                        email: monica@example.com
 *                        password: test1234
 *                        passwordConfirm: test1234
 *                        photo: default.jpg
 *          403:
 *            description: User already exits
 *
 *          500:
 *            description: Internal server error. Try again
 */

module.exports = router;
