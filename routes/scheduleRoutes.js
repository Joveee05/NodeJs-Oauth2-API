'use strict';

const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const auth = require('../controllers/tutor/auth');
const router = express.Router({ mergeParams: true });

router.use(auth.protect);

router.post('/create_my_schedule', scheduleController.createSchedule);

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

module.exports = router;
