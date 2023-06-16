const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router.post('/signup', authController.signup);

router.post('/admin/sign_up', authController.adminSignUp);

router.post('/contactUs', userController.contactUs);

router.post('/login', authController.isLoggedIn, authController.login);

router.get('/logout', authController.logOut);

router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/verify-email', authController.verifyEmail);

router.use(authController.protect);

router.get('/', authController.restrictTo('admin'), userController.getAllUsers);

router.get('/all_admins', authController.restrictTo('admin'), userController.getAllAdmins);

router.patch('/add_admin', authController.restrictTo('admin'), userController.addAdmin);

router.patch('/remove_admin', authController.restrictTo('admin'), userController.removeAdmin);

router.post('/contactUs/admin_reply/:id', authController.restrictTo('admin'), userController.adminReply);

router.get('/contactUs/:id', authController.restrictTo('admin'), userController.getContact);

router.delete('/delete_contact/:id', authController.restrictTo('admin'), userController.deleteContact);

router.get('/all_emails', authController.restrictTo('admin'), userController.getAllContacts);

router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);

router.get('/me', userController.getMe, userController.getUser);

router.delete('/delete_me', userController.deleteMe);

router.patch('/updateMyPassword', authController.updatePassword);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.restrictTo('admin'), userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

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
 *           image:
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
 * /users/delete_me:
 *    delete:
 *      summary: Delete my account
 *      tags: [Users]
 *      responses:
 *          200:
 *            description: User account deleted successfully
 *          404:
 *            description: No user found with this ID
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
 *            description: success
 *            content:
 *                application/json:
 *                    schema:
 *                       $ref: '#/components/schemas/User'
 *                    example:
 *                        id: 65648ffa94874749b5
 *                        fullName: Monica Jules
 *                        firstName: Monica
 *                        lastName: Jules
 *                        image: default.jpg
 *                        email: monica@example.com
 *                        password: test1234
 *                        passwordConfirm: test1234
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
 * /users/contactUs:
 *       post:
 *          summary: Contact Us
 *          tags: [Users]
 *          requestBody:
 *              required: true
 *              content:
 *                   application/json:
 *                       schema:
 *                           $ref: '#/components/schemas/User'
 *                       example:
 *                          fullName: John Smith
 *                          email: max@example.com
 *                          message: I need help contacting a tutor.
 *          responses:
 *             200:
 *                description: Email sent successfully
 *             500:
 *                description: Something went wrong
 *
 */

/**
 * @swagger
 * /users/contactUs/admin_reply/{id}:
 *       post:
 *          summary: Admin Reply to contact from users
 *          tags: [Users]
 *          parameters:
 *             - in: path
 *               name: id
 *               required: true
 *               description: The contact Id to be replied to
 *          requestBody:
 *             content:
 *                application/json:
 *                   schema:
 *                      type: string
 *                      example:
 *                         message: We have provided a solution for you.
 *             required: true
 *             description: The email response message
 *          responses:
 *             200:
 *                description: Admin response has been sent successfully
 *             400:
 *                description: Please input a message and a contact Id
 *             401:
 *                description: You are not logged in. Please log in to get access.
 *
 */

/**
 * @swagger
 * /users/contactUs/{id}:
 *      get:
 *        summary: Get contact by id
 *        tags: [Users]
 *        parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The contact id
 *        responses:
 *          200:
 *            description: success
 *
 *          404:
 *            description: No contact found with this ID
 *
 */

/**
 * @swagger
 * /users/all_emails:
 *      get:
 *        summary: Get all contactUs emails
 *        tags: [Users]
 *        responses:
 *          200:
 *            description: 30 contactUs emails found in the database
 *          404:
 *            description: No contactUs emails found in the database
 *
 */

/**
 * @swagger
 * /users/delete_contact/{id}:
 *    delete:
 *      summary: Delete contactUs Email
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The contact id
 *      responses:
 *          200:
 *            description: Contact Deleted Successfully
 *          404:
 *            description: No contactUs email found in the database with that Id
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
 * /auth/google:
 *     get:
 *       summary: Sign Up and Login with Google OAuth2.0
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
 * /users:
 *      get:
 *        summary: Get all users
 *        tags: [Users]
 *        parameters:
 *          - in: query
 *            name: page
 *            description: page number
 *          - in: query
 *            name: limit
 *            description: limit
 *        responses:
 *          200:
 *            description: 40 users found in database
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *          404:
 *            description: No users found in the database
 *
 */

/**
 * @swagger
 * /users/add_admin:
 *    patch:
 *      summary: Add new admin
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        description: The email address of the user to be made admin
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *            example:
 *               email: abc@example.com
 *      responses:
 *        200:
 *          description: John Doe has successfully been made an admin
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *              example:
 *                 _id: 64075674ffgrte6474ac
 *                 fullName: John Doe
 *                 email: abc@example.com
 *                 role: admin
 *                 updatedAt: 2023-04-09
 *        403:
 *          description: This user is already an admin
 *        404:
 *          description: No user found with the email provided
 *        500:
 *          description: Internal server error. Try again
 */

/**
 * @swagger
 * /users/remove_admin:
 *    patch:
 *      summary: Remove admin
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        description: The email address of the user to be removed from admin role
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *            example:
 *               email: abc@example.com
 *      responses:
 *        200:
 *          description: John Doe has successfully been made a student
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *              example:
 *                 _id: 64075674ffgrte6474ac
 *                 fullName: John Doe
 *                 email: abc@example.com
 *                 role: student
 *                 updatedAt: 2023-04-09
 *        401:
 *          description: You are not logged in. Please log in to get access
 *        403:
 *          description: This user is already a student
 *        404:
 *          description: No user found with the email provided
 *        500:
 *          description: Internal server error. Try again
 */

/**
 * @swagger
 * /users/all_admins:
 *      get:
 *        summary: Get all admins
 *        tags: [Users]
 *        parameters:
 *          - in: query
 *            name: page
 *            description: page number
 *          - in: query
 *            name: limit
 *            description: limit
 *        responses:
 *          200:
 *            description: 2 admins found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *                  example:
 *                      id: 645947hehe6363h
 *                      fullName: Pisqre Community
 *                      email: admin@pisqre.com
 *                      role: admin
 *                      image: deafult.jpg
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *          404:
 *            description: No admin found
 *
 */

module.exports = router;
