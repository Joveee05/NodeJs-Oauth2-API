const express = require('express');
const assignmentController = require('../controllers/assignmentController');
const authController = require('../controllers/authController');
const assignment = require('../controllers/sentAssignments');
const router = express.Router({ mergeParams: true });

router.get('/tutors/:id', assignment.getTutorAssignment);

router.get('/:id', assignmentController.getAssignment);

router.use(authController.protect);

router.get('/search_assignments', authController.restrictTo('admin'), assignmentController.searchAssignment);

router.post('/:assignmentId/send_answer', authController.restrictTo('admin'), assignmentController.assignmentAnswer);

router.get('/:id/answers', assignmentController.getAssignmentAnswer);

router.get('/:id/users/:userId', authController.restrictTo('admin'), assignmentController.sendToStudent);

router.get('/tutors_accepted/:id', assignment.findAcceptedAssignments);

router.get('/tutors/one_assignment/:id', authController.restrictTo('admin'), assignment.findTutors);

router.get('/', authController.restrictTo('admin'), assignmentController.getAllAssignments);

router.get('/tutors/all_sent_assignments', authController.restrictTo('admin'), assignment.getAllSentAssignments);

router.get('/users/:id', authController.restrictTo('admin'), assignmentController.getAssignmentsForUser);

router.get('/me/my_assignments', assignmentController.getMyAssignments);

router.post('/new_assignment', assignmentController.createAssignment);

router.get('/all_accepted_assignments', authController.restrictTo('admin'), assignment.acceptedAssignment);

router.get('/all_rejected_assignments', authController.restrictTo('admin'), assignment.rejectedAssignment);

router.route('/:id').patch(assignmentController.updateAssignment).delete(assignmentController.deleteAssignment);

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

/**
 * @swagger
 * /assignments/all_accepted_assignments:
 *      get:
 *        summary: Get all accepted assignments
 *        tags: [Assignments]
 *        parameters:
 *            - in: query
 *              name: page
 *              description: page number
 *            - in: query
 *              name: limit
 *              description: limit
 *        responses:
 *          200:
 *            description: 5 assignments found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *          404:
 *            description: No accepted assignments found in the database
 *
 */

/**
 * @swagger
 * /assignments/all_rejected_assignments:
 *      get:
 *        summary: Get all rejected assignments
 *        tags: [Assignments]
 *        parameters:
 *            - in: query
 *              name: page
 *              description: page number
 *            - in: query
 *              name: limit
 *              description: limit
 *        responses:
 *          200:
 *            description: 5 rejected assignments found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *          404:
 *            description: No accepted assignments found in the database
 *
 */

/**
 * @swagger
 * /assignments/users/{id}:
 *   get:
 *     summary: Returns all assignments of particular user
 *     tags: [Assignments]
 *     parameters:
 *         - in: path
 *           name: userid
 *           required: true
 *           description: The user Id
 *         - in: query
 *           name: page
 *           description: page number
 *         - in: query
 *           name: limit
 *           description: limit
 *     responses:
 *        200:
 *          description: This user has 5 assignments
 *          content:
 *              applicaton/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *        401:
 *            description: You are not logged in. Please log in to get access
 *        403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *
 *        404:
 *          description: Oops... No assignments for this user!!
 */

/**
 * @swagger
 * /assignments/tutors/{id}:
 *   get:
 *     summary: Returns all assignments sent to tutor
 *     tags: [Assignments]
 *     parameters:
 *         - in: path
 *           name: tutorid
 *           required: true
 *           description: The tutor id
 *         - in: query
 *           name: page
 *           description: page number
 *         - in: query
 *           name: limit
 *           description: limit
 *     responses:
 *        200:
 *          description: 5 assignments found
 *          content:
 *              applicaton/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *        401:
 *            description: You are not logged in. Please log in to get access
 *        403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *
 *        404:
 *          description: Oops... No assignments found for this tutor
 */

/**
 * @swagger
 * /assignments/tutors/all_sent_assignments:
 *      get:
 *        summary: Get all sent aassignments
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
 *            description: No assignments found in the database.
 *
 */

/**
 * @swagger
 * /assignments/tutors_accepted/{id}:
 *   get:
 *     summary: Returns all assignments and list of tutors that have accepted assignments
 *     tags: [Assignments]
 *     parameters:
 *         - in: path
 *           name: assignmentid
 *           required: true
 *           description: The assignment Id
 *     responses:
 *        200:
 *          description: 5 accepted assignment(s)
 *          content:
 *              applicaton/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *        401:
 *            description: You are not logged in. Please log in to get access
 *        403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *
 *        404:
 *          description: No tutor has accepted this assignment
 */

/**
 * @swagger
 * /assignments/tutors/one_assignment/{id}:
 *   get:
 *     summary: Returns list of tutors that have been sent a particular assignment
 *     tags: [Assignments]
 *     parameters:
 *         - in: path
 *           name: assignmentid
 *           required: true
 *           description: The assignment Id
 *     responses:
 *        200:
 *          description: 5 accepted assignment(s)
 *          content:
 *              applicaton/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *        401:
 *            description: You are not logged in. Please log in to get access
 *        403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *
 *        404:
 *          description: No tutor has accepted this assignment
 */

/**
 * @swagger
 * /assignments/{id}/users/{userId}:
 *      get:
 *        summary: Notify users after assignment is completed
 *        tags: [Assignments]
 *        parameters:
 *          - in: path
 *            name: id
 *            description: The assignment Id
 *            required: true
 *          - in: path
 *            name: userId
 *            description: The user Id who posted the assignment
 *            required: true
 *        responses:
 *          200:
 *            description: User notified successfully
 *          400:
 *            description: Please provide user and assignment id
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *          404:
 *            description: Invalid user id
 *
 */

/**
 * @swagger
 * /assignments/search_assignments:
 *   get:
 *     summary: Returns assignment with pisqreId
 *     tags: [Assignments]
 *     parameters:
 *         - in: query
 *           name: pisqreId
 *           required: true
 *           description: The pisqreId of the assignment
 *     responses:
 *        200:
 *          description: success
 *          content:
 *              applicaton/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Assignment'
 *        401:
 *            description: You are not logged in. Please log in to get access
 *        403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *
 *        404:
 *          description: Oops... No assignments found for this tutor
 */

/**
 * @swagger
 * /assignments/{assignmentId}/send_answer:
 *   post:
 *     summary: Create answer to assignment
 *     tags: [Assignments]
 *     parameters:
 *      - in: path
 *        name: assignmentId
 *        required: true
 *        description: The assignment id
 *      - in: body
 *        name: answer
 *        description: New answer
 *        schema:
 *          type: object
 *          properties:
 *            answer:
 *              type: string
 *     responses:
 *       201:
 *         description: Created Answer
 *       401:
 *            description: You are not logged in. Please log in to get access
 *       403:
 *            description: You do not have permission to perform this action. Please, Login as Admin to proceed
 *
 */

/**
 * @swagger
 * /assignments/{id}/answers:
 *   get:
 *     summary: Get all answers for particular assignment
 *     tags: [Assignments]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The assignment id.
 *     description: Get all answers for particular assignment
 *     responses:
 *       200:
 *         description: Returns the requested answers
 */

module.exports = router;
