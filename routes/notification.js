const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../controllers/tutor/auth');
const notificationController = require('../controllers/notificationController');
const router = express.Router({ mergeParams: true });

router.get(
  '/my_notifications',
  authController.protect,
  notificationController.getMyNotifications
);

router.get('/tutor', auth.protect, notificationController.getMyNotifications);

router.get('/:id', notificationController.getOneNotification);

router.delete('/:id', notificationController.deleteNotification);

/**
 * @swagger
 * components:
 *    schemas:
 *      Notification:
 *        type: object
 *        required:
 *          -message
 *        properties:
 *           message:
 *              type: String
 *              description: The notification message
 *           userID:
 *              type: String
 *              description: The Id of the user that posted a question
 *           questionID:
 *              type: String
 *              description: The Id of the question
 *           answerID:
 *              type: String
 *              description: The Id of the answer
 *        example:
 *          _id: 65784747rhrh647hrr
 *          message: John Doe answered one of your questions
 *          userID: 645udhd8848heh6yhu7
 *          questionID: 6353tete564ehyrh9
 *          answerID: 678yeyeue9974uiwkw
 */

/**
 * @swagger
 * tags:
 *    name: Notifications
 *    description: The Pisqre Notifications Managing API
 */

/**
 * @swagger
 * /notifications/{id}:
 *      get:
 *        summary: Get notification by id
 *        tags: [Notifications]
 *        parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: The notification id
 *        responses:
 *          200:
 *            description: success
 *            content:
 *               application/json:
 *                   schema:
 *                      $ref: '#/components/schemas/Notification'
 *          404:
 *            description: No notification found with that id
 *
 */

/**
 * @swagger
 * /notifications/my_notifications:
 *      get:
 *        summary: Get notfication of logged in user
 *        tags: [Notifications]
 *        responses:
 *          200:
 *            description: Notification Found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Notification'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: You have no new notifications
 *
 */

/**
 * @swagger
 * /notifications/tutor:
 *      get:
 *        summary: Get notfication of logged in tutor
 *        tags: [Notifications]
 *        responses:
 *          200:
 *            description: Notification Found
 *            content:
 *                application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Notification'
 *          401:
 *            description: You are not logged in. Please log in to get access
 *          404:
 *            description: You have no new notifications
 *
 */

/**
 * @swagger
 * /notifications/{id}:
 *    delete:
 *      summary: Delete Notfication
 *      tags: [Notifications]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The Notification id
 *      responses:
 *          200:
 *            description: Notification deleted successfully
 *          404:
 *            description: No notification found with that id
 */

module.exports = router;
