const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/', bookingController.getAllBookings);

router.post('/book_session', bookingController.bookSession);

router.get('/myBookings/:tutorId', bookingController.getMyBookings);

router
  .route('/bookings/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

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
 *          404:
 *            description: Not found
 */

/**
 * @swagger
 * /live_session/bookings/book_session:
 *    post:
 *      summary: Book Live Session
 *      tags: [Bookings]
 *      parameters:
 *          - in: path
 *            name: tutor Id
 *            type: string
 *            description: The ID of the Tutor
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
 *
 *          500:
 *            description: Internal server error. Try again
 */

/**
 * @swagger
 * /live_session/myBookings/{id}:
 *      get:
 *        summary: Get all bookings for a particular tutor
 *        tags: [Bookings]
 *        parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The tutor id
 *        responses:
 *          200:
 *            description: Bookings found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Booking'
 *          404:
 *            description: Oops... No bookings found!!
 *
 */

module.exports = router;
