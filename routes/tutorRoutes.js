const express = require('express');
const passport = require('passport');
const tutorController = require('../controllers/tutor/tutorController');
const auth = require('../controllers/tutor/auth');
const router = express.Router();

router.post('/signup', auth.signup);

router.post('/login', auth.login);

router.get('/logout', auth.logOut);

router.post('/forgotPassword', auth.forgotPassword);

router.patch('/resetPassword/:token', auth.resetPassword);

router.get('/verify-email', auth.verifyEmail);

router.get('/verify-tutor/:id', tutorController.verifyTutor);

router
  .route('/:id')
  .get(tutorController.getTutor)
  .patch(tutorController.updateTutor)
  .delete(tutorController.deleteTutor);

router.get('/', tutorController.getAllTutors);

router.use(auth.protect);

router.patch(
  '/me/updateMe',
  tutorController.uploadUserPhoto,
  tutorController.resizeUserPhoto,
  tutorController.updateMe
);

router.get('/me/myAccount', tutorController.getMe, tutorController.getTutor);

router.patch('/me/updateMyPassword', auth.updatePassword);

/**
 * @swagger
 * components:
 *    schemas:
 *      Tutor:
 *        type: object
 *        required:
 *          -fullName
 *          -degree
 *          -email
 *          -CV
 *          -university
 *          -course
 *          -password
 *          -passwordConfirm
 *        properties:
 *           id:
 *              type: String
 *              description: The auto-generated id of the tutor
 *           fullName:
 *              type: String
 *              description: The tutor's fullname
 *           degree:
 *              type: String
 *              description: The tutor's university degree
 *           course:
 *              type: String
 *              description: The course the tutor teaches
 *           certificate:
 *              type: String
 *              description: The tuto's certificate
 *           degreeType:
 *              type: String
 *              description: The type of tutor degree
 *           description:
 *              type: String
 *              description: Brief summary of everything about tutor
 *           university:
 *              type: String
 *              description: The university attended by tutor
 *           startDate:
 *              type: String
 *              description: The start date of tutor's university degree e.g 2015
 *           endDate:
 *              type: String
 *              description: The end date of tutor's university degree e.g 2020
 *           onlineExperience:
 *              type: String
 *              description: The tutor's online teaching exprience e.g 2years
 *           offlineExperience:
 *              type: String
 *              description: The tutor's offline teaching exprience e.g 5years
 *           CV:
 *              type: String
 *              description: The tutor CV in document format
 *           languageSpoken:
 *              type: String
 *              description: The language spoken by the tutor
 *           email:
 *              type: String
 *              description: The tutor email
 *           password:
 *              type: String
 *              description: The tutor password
 *           passwordConfirm:
 *              type: String
 *              description: Confirm tutor password
 *           image:
 *              type: String
 *              description: Tutor profile photo
 *        example:
 *          id: 65648ffa94874749b5
 *          fullName: Max Lawrence
 *          CV: cv.pdf
 *          degree: Bachelor of Science
 *          degreeType: Bachelors
 *          certificate: certificate.pdf
 *          languageSpoken: English
 *          languageLevel: A1
 *          course: Mathematics
 *          onlineExperience: 2years
 *          offlineExperience: 5years
 *          startDate: Date
 *          endDate: Date
 *          description: I have been a tutor for 10 years
 *          issuedBy: Society of Engineers
 *          phoneNumber: 8747949484
 *          university: University of India
 *          email: max@example.com
 *          password: test1234
 *          passwordConfirm: test1234
 *          photo: default.jpg
 *
 */

/**
 * @swagger
 * tags:
 *    name: Tutors
 *    description: The Pisqre Tutors Managing API
 */

/**
 * @swagger
 * /tutors/{id}:
 *    patch:
 *      summary: Edit or update tutor
 *      tags: [Tutors]
 *      parameters:
 *      - in: path
 *        name: The tutor id
 *        schema:
 *        type: string
 *        required: true
 *        description: The tutor id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tutor'
 *            example:
 *               university: University of India
 *               degree: Bachelor of Engineering
 *               course: Mathematics
 *               languageSpoken: English
 *      responses:
 *        200:
 *          description: Tutor updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Tutor'
 *        404:
 *          description: The tutor was not found
 *        500:
 *          description: Server error
 */

/**
 * @swagger
 * /tutors/{id}:
 *      get:
 *        summary: Get tutor by id
 *        tags: [Tutors]
 *        parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The tutor id
 *        responses:
 *          200:
 *            description: Tutor found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Tutor'
 *          404:
 *            description: Not found
 *
 */

/**
 * @swagger
 * /tutors/{id}:
 *    delete:
 *      summary: Delete Tutor
 *      tags: [Tutors]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The tutor id
 *      responses:
 *          204:
 *            description: No content
 *          404:
 *            description: Not found
 */

/**
 * @swagger
 * /tutors/signup:
 *    post:
 *      summary: Tutor SignUp
 *      tags: [Tutors]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Tutor'
 *      responses:
 *          201:
 *            description: Success
 *            content:
 *                application/json:
 *                    schema:
 *                       $ref: '#/components/schemas/Tutor'
 *          403:
 *            description: Tutor already exits
 *
 *          500:
 *            description: Internal server error. Try again
 */

/**
 * @swagger
 * /tutors/login:
 *     post:
 *       summary: Login for Tutors
 *       tags: [Tutors]
 *       requestBody:
 *          required: true
 *          content:
 *            application/json:
 *                  schema:
 *                    $ref: '#/components/schemas/Tutor'
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
 *                          $ref: '#/components/schemas/Tutor'
 *            400:
 *              description: Bad request
 *            500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /tutors/logout:
 *     get:
 *        summary: Log Out
 *        tags: [Tutors]
 *        responses:
 *          200:
 *            description: Logged Out
 *          500:
 *            description: Server error
 */

/**
 * @swagger
 * /tutors/me/updateMyPassword:
 *       patch:
 *          summary: Change password
 *          tags: [Tutors]
 *          requestBody:
 *              required: true
 *              content:
 *                   application/json:
 *                       schema:
 *                           $ref: '#/components/schemas/Tutor'
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
 *                        $ref: '#/components/schemas/Tutor'
 *             400:
 *                description: Bad request
 *
 */

/**
 * @swagger
 * /tutors/me/updateMe:
 *    patch:
 *      summary: Edit or update currently logged in tutor details EXCEPT password
 *      tags: [Tutors]
 *      parameters:
 *      - in: path
 *        name: id
 *        schema:
 *        type: string
 *        required: true
 *        description: The tutor id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tutor'
 *            example:
 *               fullName: Johnson Dakota
 *               email: johnson@example.com
 *      responses:
 *        200:
 *          description: Tutor updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Tutor'
 *        404:
 *          description: The tutor was not found
 *        500:
 *          description: Server error
 */

/**
 * @swagger
 * /tutors/me/myAccount:
 *   get:
 *     summary: Returns currently logged in tutor
 *     tags: [Tutors]
 *     responses:
 *        200:
 *          description: The details of logged in tutor
 *          content:
 *              applicaton/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Tutor'
 */

/**
 * @swagger
 * /tutors:
 *      get:
 *        summary: Get all tutors
 *        tags: [Tutors]
 *        responses:
 *          200:
 *            description: Tutors found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Tutor'
 *          404:
 *            description: No tutors found in the database
 *
 */

/**
 * @swagger
 * /tutors/forgotPassword:
 *       post:
 *          summary: Forgot password
 *          tags: [Tutors]
 *          requestBody:
 *              required: true
 *              content:
 *                   application/json:
 *                       schema:
 *                           $ref: '#/components/schemas/Tutor'
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
 * /tutors/resetPassword/{token}:
 *    patch:
 *      summary: Reset user password via token
 *      tags: [Tutors]
 *      parameters:
 *      - in: path
 *        name: Reset token
 *        schema:
 *        type: string
 *        required: true
 *        description: The tutor reset token sent to tutor via email
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tutor'
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
 *        500:
 *          description: Internal Server error
 */
/**
 * @swagger
 * /tutors/verify-email:
 *    get:
 *      summary: Verify account/email via emailToken
 *      tags: [Tutors]
 *      parameters:
 *      - in: query
 *        name: emailToken
 *        schema:
 *        type: string
 *        required: true
 *        description: The tutor verification token sent to tutor via email
 *      responses:
 *        200:
 *          description: Tutor verified successfully
 *        500:
 *          description: Internal Server error
 */

module.exports = router;
