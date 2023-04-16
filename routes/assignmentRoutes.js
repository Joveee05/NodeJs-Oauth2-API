const express = require('express');
const router = express.Router({ mergeParams: true });
const assignmentController = require('../controllers/assignmentController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get(
  '/',
  authController.restrictTo('admin'),
  assignmentController.getAllAssignments
);

router.get('/me/my_assignments', assignmentController.getMyAssignments);

router.post('/new_assignment', assignmentController.createAssignment);

router
  .route('/:id')
  .get(assignmentController.getAssignment)
  .patch(assignmentController.updateAssignment)
  .delete(assignmentController.deleteAssignment);

/**
 * @swagger
 * components:
 *    schemas:
 *      Assignment:
 *        type: object
 *        required:
 *          -courseName
 *          -email
 *          -description
 *          -amount
 *          -deadLine
 *        properties:
 *           id:
 *              type: String
 *              description: The auto-generated id of the assignment
 *           courseName:
 *              type: String
 *              description: The course name of the assignment
 *           email:
 *              type: String
 *              description: The user email
 *           description:
 *              type: String
 *              description: A brief descrition by the user
 *           amount:
 *              type: String
 *              description: The amount the user wishes to pay for his assignment to be answered
 *           deadLine:
 *              type: Date
 *              description: The deadline of within which the assignment must be answered
 *        example:
 *          id: 65648ffa94874749b5
 *          courseName: PRE582
 *          email: max@example.com
 *          description: I need help doing this assignment
 *          amount: $20
 *          deadLine: 2023-04-23
 *          assignmentID: 65463thd22gegge
 *
 */

/**
 * @swagger
 * tags:
 *    name: Assignments
 *    description: The Pisqre Assignments Managing API
 */

/**
 * @swagger
 * /assignments/new_assignment:
 *    post:
 *      summary: Create a new assignment
 *      tags: [Assignments]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Assignment'
 *              example:
 *                   id: 65648ffa94874749b5
 *                   courseName: PRE582
 *                   email: max@example.com
 *                   description: I need help doing this assignment
 *                   amount: $20
 *                   deadLine: 2023-04-23
 *      responses:
 *          201:
 *            description: success
 *            content:
 *                application/json:
 *                    schema:
 *                       $ref: '#/components/schemas/Assignment'
 *          401:
 *            description: You are not logged in. Please log in to proceed.
 *
 *          500:
 *            description: Internal server error. Try again
 */

/**
 * @swagger
 * /assignments/{id}:
 *      get:
 *        summary: Get assignment by id
 *        tags: [Assignments]
 *        parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The assignment id
 *        responses:
 *          200:
 *            description: Assignment found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *          401:
 *            description: You are not logged in. Please log in to proceed.
 *          404:
 *            description: No assignment found in the database with this id
 *
 */

/**
 * @swagger
 * /assignments/{id}:
 *    patch:
 *      summary: Edit or update assignment
 *      tags: [Assignments]
 *      parameters:
 *      - in: path
 *        name: The assignment id
 *        schema:
 *        type: string
 *        required: true
 *        description: The assignment id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Assignment'
 *            example:
 *               courseName:
 *               email:
 *               deadLine:
 *      responses:
 *        200:
 *          description: Assignment updated successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Assignment'
 *        401:
 *          description: You are not logged in. Please log in to proceed.
 *        404:
 *          description: No assignment found in the database with this id
 *        500:
 *          description: Server error
 */

/**
 * @swagger
 * /assignments/{id}:
 *    delete:
 *      summary: Delete Assignment
 *      tags: [Assignments]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The assignment id
 *      responses:
 *          200:
 *            description: Assignment deleted successfully.
 *          401:
 *            description: You are not logged in. Please log in to proceed.
 *          404:
 *            description: No assignment found in the database with this id.
 */

/**
 * @swagger
 * /assignments/me/my_assignments:
 *   get:
 *     summary: Returns all assignments of currently logged in user
 *     tags: [Assignments]
 *     parameters:
 *         - in: query
 *           name: page
 *           description: page number
 *         - in: query
 *           name: limit
 *           description: limit
 *     responses:
 *        200:
 *          description: You have 30 assignments
 *          content:
 *              applicaton/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 */

/**
 * @swagger
 * /assignments:
 *      get:
 *        summary: Get all aassignments
 *        tags: [Assignments]
 *        parameters:
 *          - in: query
 *            name: page
 *            description: page number
 *          - in: query
 *            name: limit
 *            description: limit
 *        responses:
 *          200:
 *            description: 200 assignments found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *          404:
 *            description: Oops... You have no assignments!!
 *
 */

module.exports = router;
