'use strict';

const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const auth = require('../controllers/tutor/auth');
const router = express.Router({ mergeParams: true });

router.get('/schedule-between-dates/:tutorId', scheduleController.dateQuery);

router.use(auth.protect);

router.post('/create_my_schedule', scheduleController.createSchedule);

router.post(
  '/create_multiple_schedules',
  scheduleController.createMultipleSchedule
);

router.get('/get-weekly-schedule', scheduleController.getWeeklyPlan);

router.get('/mySchedule', scheduleController.getMySchedule);

router.get('/get_schedule/:id', scheduleController.getSchedule);

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
 * /schedules/get_schedule/{id}:
 *      get:
 *        summary: Get schedule by id
 *        tags: [Schedules]
 *        parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: The schedule id
 *        responses:
 *          200:
 *            description: success
 *            content:
 *               application/json:
 *                      schema:
 *                         example:
 *                            status: success
 *                            message: Schedule found
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
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: Oops.. No schedule found. Please check that the id is correct
 *
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
 *        401:
 *            description: You are not logged in. Please log in to get access
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
 *            description: You are not logged in. Please log in to get access
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
 *          401:
 *            description: You are not logged in. Please log in to get access
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
 *          401:
 *            description: You are not logged in. Please log in to get access
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
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: Oops.. No schedule found for this year
 *
 */

/**
 * @swagger
 * /schedules/schedule-between-dates:
 *     get:
 *       summary: Get schedule between two dates
 *       tags: [Schedules]
 *       parameters:
 *          - in: path
 *            name: tutor id
 *            required: true
 *            description: The id of the tutor
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
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: Oops.. No schedule found between these dates
 *
 */

/**
 * @swagger
 * /schedules/create_multiple_schedules:
 *    post:
 *      summary: Create many schedules at once
 *      tags: [Schedules]
 *      parameters:
 *        - in: query
 *          name: numOfSchedule
 *          required: true
 *          description: The number of schedules you want to create at a time
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
 *                       status: success
 *                       message: Schedule created successfully
 *                       results: 2
 *                       data: [
 *                        {
 *                         tutorId: 641712f498cb1ebd4f5442d8,
 *                         startDate: [
 *                                2023-03-15
 *                                    ],
 *                         endDate: [
 *                              2023-03-15
 *                                  ],
 *                         booked: false,
 *                          },
 *                        {
 *                         tutorId: 641712f498cb1ebd4f5442d8,
 *                         startDate: [
 *                                2023-03-15
 *                                    ],
 *                         endDate: [
 *                              2023-03-15
 *                                  ],
 *                         booked: false
 *                          },
 *                            ]
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          500:
 *            description: Internal server error.
 */

module.exports = router;
