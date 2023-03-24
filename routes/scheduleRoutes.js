'use strict';

const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const auth = require('../controllers/tutor/auth');
const router = express.Router({ mergeParams: true });

router.use(auth.protect);

router.post('/create_my_schedule', scheduleController.createSchedule);

router.get('/get-weekly-schedule', scheduleController.getWeeklyPlan);

router.get('/schedule-between-date', scheduleController.dateQuery);

router.get('/mySchedule', scheduleController.getSchedule);

router.patch('/change_schedule/:id', scheduleController.updateSchedule);

router.delete('/delete_schedule/:id', scheduleController.deleteSchedule);

/**
 * @swagger
 * components:
 *    schemas:
 *      Schedule:
 *        type: object
 *        required:
 *          -startDate
 *          -endDate
 *        properties:
 *           startDate:
 *              type: Date
 *              description: The schedule start date
 *           endDate:
 *              type: Date
 *              description: The schedule end date
 *        example:
 *          startDate: 2023-03-15
 *          endDate: 2023-03-15
 */

/**
 * @swagger
 * tags:
 *    name: Schedules
 *    description: The Pisqre Schedules Managing API
 */

/**
 * @swagger
 * /schedules/change_schedule/{id}:
 *    patch:
 *      summary: Edit or update tutor schedule
 *      tags: [Schedules]
 *      parameters:
 *      - in: path
 *        name: id
 *        schema:
 *        type: string
 *        required: true
 *        description: The id of the schedule to be updated
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Schedule'
 *      responses:
 *        200:
 *          description: Schedule updated successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Booking'
 *        404:
 *          description: No schedule found. Please check that the Id is correct
 *        500:
 *          description: Server error
 */

/**
 * @swagger
 * /schedules/mySchedule:
 *      get:
 *        summary: Get schedule of logged in user
 *        tags: [Schedules]
 *        responses:
 *          200:
 *            description: Schedule Found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Schedule'
 *          401:
 *            description: You're not logged in. Please log in to get access
 *          404:
 *            description: No schedule found for this tutor
 *
 */

/**
 * @swagger
 * /schedules/delete_schedule/{id}:
 *    delete:
 *      summary: Delete Schedule
 *      tags: [Schedules]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The Schedule id
 *      responses:
 *          200:
 *            description: Schedule Deleted
 *          404:
 *            description: No schedule found. Please check that the Id is correct
 */

/**
 * @swagger
 * /schedules/create_my_schedule:
 *    post:
 *      summary: Create Schedule
 *      tags: [Schedules]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Schedule'
 *      responses:
 *          201:
 *            description: Schedule created successfully
 *            content:
 *                application/json:
 *                    schema:
 *                       $ref: '#/components/schemas/Schedule'
 *                    example:
 *                       tutorId: 640eth747hdie99
 *                       startDate: 2023-03-15
 *                       endDate: 2023-03-15
 *                       booked: false
 *
 *          500:
 *            description: Internal server error.
 */

/**
 * @swagger
 * /schedules/get-weekly-schedule:
 *     get:
 *       summary: Get weekly schedule
 *       tags: [Schedules]
 *       parameters:
 *          - in: query
 *            name: year
 *            required: true
 *            description: Year to get weekly schedules e.g 2023
 *       responses:
 *          200:
 *            description: success
 *            content:
 *               application/json:
 *                      schema:
 *                         example:
 *                            status: success
 *                            data: [{
 *                               numOfSchedule: 2,
 *                               booked: [
 *                                   false,
 *                                   false,
 *                                      ],
 *                               week: 11,
 *                                 }]
 *          401:
 *            description: You're not logged in. Please log in to get access
 *          400:
 *            description: Something went wrong
 *
 */

/**
 * @swagger
 * /schedules/schedule-between-date:
 *     get:
 *       summary: Get schedule between two dates
 *       tags: [Schedules]
 *       parameters:
 *          - in: query
 *            name: from
 *            required: true
 *            description: e.g 2023-03-01
 *          - in: query
 *            name: to
 *            required: true
 *            description: e.g 2023-03-31
 *       responses:
 *          200:
 *            description: success
 *            content:
 *               application/json:
 *                      schema:
 *                         example:
 *                            status: success
 *                            data: [{
 *                               _id: 641854cac888be8f1b2e42a6,
 *                               tutorId: 64179c2dc888be8f1b2e4072,
 *                               startDate: [
 *                                   2023-03-20T06:00:00.000Z,
 *                                      ],
 *                               endDate: [
 *                                   2023-03-21T10:00:00.000Z,
 *                                      ],
 *                               booked: false,
 *                                 }]
 *          401:
 *            description: You're not logged in. Please log in to get access
 *          404:
 *            description: Oops.. No schedule found between these dates
 *
 */

module.exports = router;
