const express = require('express');
const passport = require('passport');
const tutorController = require('../controllers/tutor/tutorController');
const auth = require('../controllers/tutor/auth');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', auth.signup);

router.post('/login', auth.login);

router.get('/logout', auth.logOut);

router.post('/forgotPassword', auth.forgotPassword);

router.patch('/resetPassword/:token', auth.resetPassword);

router.get('/verify-email', auth.verifyEmail);

router.patch(
  '/verify-tutor/:id',
  authController.protect,
  authController.restrictTo('admin'),
  tutorController.verifyTutor
);

router.get('/search_tutors', tutorController.searchTutor);

router
  .route('/:id')
  .get(tutorController.getTutor)
  .patch(auth.protect, tutorController.updateTutor)
  .delete(tutorController.deleteTutor);

router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  tutorController.getAllTutors
);

router.get(
  '/all_tutors/unverified',
  authController.protect,
  authController.restrictTo('admin'),
  tutorController.getUnverifiedTutors
);

router.use(auth.protect);

router.patch(
  '/me/updateMe',
  tutorController.uploadUserPhoto,
  tutorController.resizeUserPhoto,
  tutorController.updateMe
);

router.get('/me/myAccount', tutorController.getMe, tutorController.getTutor);

router.patch('/me/updateMyPassword', auth.updatePassword);

router.post('/ask_questions', tutorController.askQuestion);

router.post('/answers/:id', tutorController.tutorAnswer);

router.delete('/answers/:id', tutorController.deleteAnswer);

router.get('/me/my_questions', tutorController.myQuestions);

router.get('/me/all_my_answers', tutorController.myAnswers);

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
 *        parameters:
 *            - in: query
 *              name: page
 *              description: page number
 *            - in: query
 *              name: limit
 *              description: limit
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

/**
 * @swagger
 * /tutors/ask_questions:
 *   post:
 *     summary: Ask question for tutors
 *     tags: [Tutors]
 *     parameters:
 *      - in: body
 *        name: Question
 *        description: Ask questions for tutor
 *        schema:
 *          type: object
 *          properties:
 *            branch:
 *              type: string
 *            questionBody:
 *              type: string
 *            title:
 *              type: string
 *            keywords:
 *              type: array
 *              items:
 *                type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *            application/json:
 *                    schema:
 *                        example:
 *                            status: success
 *                            message: Question created successfully
 *                            data:
 *                              vote: 0
 *                              answers: 0
 *                              title: test
 *                              branch: Chemistry
 *                              questionBody: 123
 *                              views: 0
 *                              answeredBy: []
 *                              tutor: 63b8c8814egjhd73637u
 *                              keywords: [
 *                                  string node
 *                                        ]
 *                              id: 63b8c881464647yehe93
 */

/**
 * @swagger
 * /tutors/answers/{id}:
 *   post:
 *     summary: Answer questions for tutors
 *     tags: [Tutors]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *        type: string
 *        required: true
 *        description: The id of the question to be asnwered
 *      - in: body
 *        name: Answer
 *        description: New answer for tutor
 *        schema:
 *          type: object
 *          properties:
 *            answer:
 *              type: string
 *     responses:
 *       201:
 *         description: Answer created successfully
 *         content:
 *             application/json:
 *                  schema:
 *                     example:
 *                        status: success
 *                        message: Answer created successfully
 *                        data:
 *                          answeredByTutor: 65747yehd03746hh
 *                          answer: string
 *                          question: 65747yehd03746hh
 *                          answerTimeStamp: 2023-03-19T12:56:27.956Z
 *                          answerModifiedTimeStamp: 2023-03-19T12:56:27.956Z
 *                          views: 0
 *                          votes: 0
 *                          id: 65408ftegh5464ydgd99
 */

/**
 * @swagger
 * /tutors/me/my_questions:
 *   get:
 *     summary: Returns all questions of currently logged in tutor
 *     tags: [Tutors]
 *     responses:
 *        200:
 *          description: success
 *          content:
 *            application/json:
 *                    schema:
 *                        example:
 *                            status: success
 *                            allQuestions: 12
 *                            results: 12
 *                            data:
 *                              vote: 0
 *                              answers: 0
 *                              title: test
 *                              branch: Chemistry
 *                              questionBody: 123
 *                              views: 0
 *                              answeredBy: []
 *                              tutor: 63b8c8814egjhd73637u
 *                              keywords: [
 *                                  string node
 *                                        ]
 *                              id: 63b8c881464647yehe93
 *        401:
 *          description: You are not logged in. Please log in to get access
 *        404:
 *          description: Oops... No questions found!!
 */

/**
 * @swagger
 * /tutors/me/all_my_answers:
 *   get:
 *     summary: Returns all answers of currently logged in tutor
 *     tags: [Tutors]
 *     responses:
 *        200:
 *          description: success
 *          content:
 *            application/json:
 *                    schema:
 *                        example:
 *                           status: success
 *                           allMyAnswers: 12
 *                           results: 12
 *                           data:
 *                             answeredByTutor: 65747yehd03746hh
 *                             answer: string
 *                             question: 65747yehd03746hh
 *                             answerTimeStamp: 2023-03-19T12:56:27.956Z
 *                             answerModifiedTimeStamp: 2023-03-19T12:56:27.956Z
 *                             views: 0
 *                             votes: 0
 *                             id: 65408ftegh5464ydgd99
 *        401:
 *          description: You are not logged in. Please log in to get access
 *        404:
 *          description: Oops... No answers found!!
 */

/**
 * @swagger
 * /tutors/answers/{id}:
 *    delete:
 *      summary: Delete Answer
 *      tags: [Tutors]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The answer id
 *      responses:
 *          200:
 *            description: Answer deleted successfully
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: No answer found with this id
 */

/**
 * @swagger
 * /tutors/search_tutors:
 *   get:
 *     summary: Get a tutor by searching for courses
 *     tags: [Tutors]
 *     parameters:
 *      - in: query
 *        name: course
 *        required: true
 *        type: string
 *        description: The course to search for.
 *     description: Get a tutor by searching for courses
 *     responses:
 *       200:
 *         description: Returns the requested tutors who teach the courses searched for
 *       404:
 *         description: Oops... No tutor found. This may be due to a spelling error. Try searching again.
 */

/**
 * @swagger
 * /tutors/all_tutors/unverified:
 *      get:
 *        summary: Get all admin unverified tutors
 *        tags: [Tutors]
 *        parameters:
 *            - in: query
 *              name: page
 *              description: page number
 *            - in: query
 *              name: limit
 *              description: limit
 *        responses:
 *          200:
 *            description: success
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Tutor'
 *          403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *
 *          404:
 *            description: No unverified tutors found in the database.
 *
 */

/**
 * @swagger
 * /tutors/verify-tutor/{id}:
 *    patch:
 *      summary: Verify tutor by admin
 *      tags: [Tutors]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: The tutor id to be verified by admin
 *      responses:
 *          200:
 *            description: Tutor verification successful
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          400:
 *            description: This tutor has already been verified
 *          403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *          404:
 *            description: Tutor verification failed. No tutor found.
 */

module.exports = router;
