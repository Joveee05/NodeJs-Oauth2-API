const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router.post('/signup', authController.signup);

router.post('/login', authController.isLoggedIn, authController.login);

router.get('/logout', authController.logOut);

router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/verify-email', authController.verifyEmail);

router.use(authController.protect);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.get('/me', userController.getMe, userController.getUser);

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
 *    description: The Pisqre Users Managing API
 */

/**
 * @swagger
 * /users/{id}:
 *    patch:
 *      summary: Edit or update user
 *      tags: [Users]
 *      parameters:
 *      - in: path
 *        name: The user id
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
 *               fullName:
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
 *                  fullName: Monica Jules
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

/**
 * @swagger
 * /users/login:
 *     post:
 *       summary: Login without Google OAuth
 *       tags: [Users]
 *       requestBody:
 *          required: true
 *          content:
 *            application/json:
 *                  schema:
 *                    $ref: '#/components/schemas/User'
 *                  example:
 *                    email: max@example.com
 *                    password: test1234
 *
 *       responses:
 *          200:
 *            description: Logged in successfully
 *            content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *                      example:
 *                          token: ucbkejnchcuedhcjecnljcuhejio8392
 *                          id: 65648ffa94874749b5
 *                          fullName: Max Lawrence
 *                          role: student
 *                          email: max@example.com
 *                          photo: default.jpg
 *            400:
 *              description: Bad request
 *            500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /users/logout:
 *     get:
 *        summary: Log Out
 *        tags: [Users]
 *        responses:
 *          200:
 *            description: Logged Out
 *          500:
 *            description: Server error
 */

/**
 * @swagger
 * /users/updateMyPassword:
 *       patch:
 *          summary: Change password
 *          tags: [Users]
 *          requestBody:
 *              required: true
 *              content:
 *                   application/json:
 *                       schema:
 *                           $ref: '#/components/schemas/User'
 *                       example:
 *                          currentPassword: test1234
 *                          password: pass1234
 *                          passwordConfirm: pass1234
 *          responses:
 *             200:
 *                description: Password changed successfully
 *                content:
 *                  application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/User'
 *                      example:
 *                        token: sdjindcnhbcyyerofhuh1823
 *                        id: 65648ffa94874749b5
 *                        name: Max Lawrence
 *                        email: max@example.com
 *                        role: student
 *                        photo: default.jpg
 *             400:
 *                description: Bad request
 *
 */

/**
 * @swagger
 * /users/updateMe:
 *    patch:
 *      summary: Edit or update currently logged in user details except password
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
 *               fullName:
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
 * /users/me:
 *   get:
 *     summary: Returns currently logged in user
 *     tags: [Users]
 *     responses:
 *        200:
 *          description: The details of logged in user
 *          content:
 *              applicaton/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /users/forgotPassword:
 *       post:
 *          summary: Forgot password
 *          tags: [Users]
 *          requestBody:
 *              required: true
 *              content:
 *                   application/json:
 *                       schema:
 *                           $ref: '#/components/schemas/User'
 *                       example:
 *                          email: max@example.com
 *          responses:
 *             200:
 *                description: Reset token sent to email successfully
 *             500:
 *                description: Something went wrong
 *
 */

/**
 * @swagger
 * /users/resetPassword/{token}:
 *    patch:
 *      summary: Reset user password via token
 *      tags: [Users]
 *      parameters:
 *      - in: path
 *        name: Reset token
 *        schema:
 *        type: string
 *        required: true
 *        description: The user reset token sent to user via email
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *            example:
 *               password: newpass1234
 *               passwordConfirm: newpass1234
 *      responses:
 *        200:
 *          description: Password changed successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *              example:
 *                        token: sdjindcnhbcyyerofhuh1823
 *                        id: 65648ffa94874749b5
 *                        name: Max Lawrence
 *                        email: max@example.com
 *                        role: student
 *                        photo: default.jpg
 *        500:
 *          description: Internal Server error
 */
/**
 * @swagger
 * /users/verify-email:
 *    get:
 *      summary: Verify account/email via emailToken
 *      tags: [Users]
 *      parameters:
 *      - in: query
 *        name: emailToken
 *        schema:
 *        type: string
 *        required: true
 *        description: The user verification token sent to user via email
 *      responses:
 *        200:
 *          description: User verified successfully
 *        500:
 *          description: Internal Server error
 */

/**
 * @swagger
 * /auth/login:
 *     post:
 *       summary: Login with Google OAuth2.0
 *       tags: [Users]
 *       responses:
 *          200:
 *            description: Logged in successfully
 *            content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *                      example:
 *                          token: ucbkejnchcuedhcjecnljcuhejio8392
 *                          googleId: 123398944672
 *                          id: 65648ffa94874749b5
 *                          fullName: Max Lawrence
 *                          role: student
 *                          email: max@example.com
 *                          photo: https://lh3.googleusercontent.com/a/AEdFTp5CVt6Cdg9DblLo3xTrbBiKjmtTwIrN5dAu5KAm=s96-c
 *            400:
 *              description: Bad request
 *            500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /auth/signup:
 *     post:
 *       summary: SignUp with Google OAuth2.0
 *       tags: [Users]
 *       responses:
 *          200:
 *            description: Success
 *            content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *                      example:
 *                          token: ucbkejnchcuedhcjecnljcuhejio8392
 *                          googleId: 123398944672
 *                          id: 65648ffa94874749b5
 *                          fullName: Max Lawrence
 *                          role: student
 *                          email: max@example.com
 *                          photo: https://lh3.googleusercontent.com/a/AEdFTp5CVt6Cdg9DblLo3xTrbBiKjmtTwIrN5dAu5KAm=s96-c
 *            400:
 *              description: Bad request
 *            500:
 *              description: Internal server error
 */

module.exports = router;
