const express = require('express');
const bookingController = require('../controllers/bookingController');
const auth = require('../controllers/tutor/auth');
const authController = require('../controllers/authController');
const router = express.Router();

router.post(
  '/book_session/:tutorId',
  authController.protect,
  bookingController.bookSession
);

router.get(
  '/my-live-sessions',
  authController.protect,
  bookingController.getUserBookings
);

router
  .route('/bookings/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

router.get('/', bookingController.getAllBookings);

router.get('/myBookings', auth.protect, bookingController.getMyBookings);

/**
 * @swagger
 * components:
 *    schemas:
 *      Booking:
 *        type: object
 *        required:
 *          -courseName
 *          -topic
 *        properties:
 *           courseName:
 *              type: String
 *              description: The course name which the user wishes to be taught
 *           topic:
 *              type: String
 *              description: The topic which the user wishes to be taught
 *           duration:
 *              type: String
 *              description: The duration of the live session
 *           sessionType:
 *              type: String
 *              description: Either a live or demo session
 *           tutor:
 *              type: String
 *              description: The tutor to be booked for
 *           time:
 *              type: String
 *              description: The start time of teaching eg. 2pm, 4pm etc.
 *           bookedBy:
 *              type: String
 *              description: The user who booked the live session
 *           day:
 *              type: String
 *              description: Day of the week e.g Monday, Tuesday etc.
 *        example:
 *          courseName: Mathematics
 *          topic: Arithmetic
 *          duration: 2 hours
 *          sessionType: Live Session
 *          tutor: Max Lawrence
 *          time: 2pm
 *          bookedBy: John Kwame
 *          day: Monday
 */

/**
 * @swagger
 * tags:
 *    name: Bookings
 *    description: The Pisqre Bookings Managing API
 */

/**
 * @swagger
 * /live_session/bookings/{id}:
 *    patch:
 *      summary: Edit or update booking
 *      tags: [Bookings]
 *      parameters:
 *      - in: path
 *        name: The booking id
 *        schema:
 *        type: string
 *        required: true
 *        description: The booking id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Booking'
 *            example:
 *               fullName: John Davies
 *               email: john@example.com
 *      responses:
 *        200:
 *          description: Booking updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Booking'
 *        401:
 *            description: You are not logged in. Please log in to get access
 *        404:
 *          description: The Booking was not found
 *        500:
 *          description: Server error
 */

/**
 * @swagger
 * /live_session/bookings/{id}:
 *      get:
 *        summary: Get booking by id
 *        tags: [Bookings]
 *        parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The booking id
 *        responses:
 *          200:
 *            description: Booking found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Booking'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: Not found
 *
 */

/**
 * @swagger
 * /live_session:
 *      get:
 *        summary: Get all bookings
 *        tags: [Bookings]
 *        responses:
 *          200:
 *            description: Bookings found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Booking'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: No Live Session Booking found in the database
 *
 */

/**
 * @swagger
 * /live_session/bookings/{id}:
 *    delete:
 *      summary: Delete Booking
 *      tags: [Bookings]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The Booking id
 *      responses:
 *          204:
 *            description: No content
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: Not found
 */

/**
 * @swagger
 * /live_session/book_session/{id}:
 *    post:
 *      summary: Book Live Session
 *      tags: [Bookings]
 *      parameters:
 *          - in: path
 *            name: tutor Id
 *            type: string
 *            description: The ID of the Tutor
 *            required: true
 *          - in: query
 *            name: schedule
 *            type: string
 *            description: The ID of the schedule
 *            required: true
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Booking'
 *      responses:
 *          201:
 *            description: Success
 *            content:
 *                application/json:
 *                    schema:
 *                       $ref: '#/components/schemas/Booking'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          500:
 *            description: Internal server error. Try again
 */

/**
 * @swagger
 * /live_session/myBookings:
 *      get:
 *        summary: Get all bookings for a particular tutor who is logged in.
 *        tags: [Bookings]
 *        responses:
 *          200:
 *            description: Bookings found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Booking'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: Oops... No bookings found!!
 *
 */

/**
 * @swagger
 * /live_session/my-live-sessions:
 *      get:
 *        summary: Get all bookings for a particular logged in user
 *        tags: [Bookings]
 *        responses:
 *          200:
 *            description: Bookings found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Booking'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: Oops... No bookings found!!
 *
 */

module.exports = router;
