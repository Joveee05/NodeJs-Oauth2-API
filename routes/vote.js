const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
let { findVote, addVote, removeVote, getVotesForUser, getVotesForObject } = require('../controllers/voteController');

/**
 * @swagger
 * /vote/add:
 *   post:
 *     parameters:
 *      - in: body
 *        name: vote
 *        description: New vote
 *        schema:
 *          type: object
 *          properties:
 *            objectId:
 *              type: string
 *            objectType:
 *              type: string
 *            userId:
 *              type: string
 *            voteType:
 *              type: number
 *     responses:
 *       200:
 *         description: Successfully Voted
 */
router.post('/add', async (req, res) => {
  const objectId = req.body.objectId;
  const userId = req.body.userId;
  const voteType = req.body.voteType;
  const objectType = req.body.objectType;

  const response = await addVote(objectId, userId, voteType, objectType);
  if (response.success == true) {
    res.status(200).json(response);
  } else {
    res.status(404).json(response);
  }
});

/**
 * @swagger
 * /vote/delete:
 *   delete:
 *     parameters:
 *      - in: body
 *        name: vote data
 *        description: Delete vote
 *        schema:
 *          type: object
 *          properties:
 *            objectId:
 *              type: string
 *            userId:
 *              type: string
 *     responses:
 *       200:
 *         description: Successfully deleted vote
 */
router.delete('/delete', async (req, res) => {
  const objectId = req.body.objectId;
  const userId = req.body.userId;

  const response = await removeVote(objectId, userId);
  if (response.success == true) {
    res.status(200).json(response);
  } else {
    res.status(404).json(response);
  }
});

/**
 * @swagger
 * /vote/user/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: user Id
 *     description: Returns objects information for which userId has voted
 *     responses:
 *       200:
 *         description: Successfully found Vote Information
 */
router.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  const response = await getVotesForUser(userId);

  if (response.success == true) {
    res.status(200).json(response);
  } else {
    res.status(404).json(response);
  }
});

/**
 * @swagger
 * /vote/object/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: Object Id
 *     description: Returns users information who voted for objectId
 *     responses:
 *       200:
 *         description: Successfully found Vote Information
 */
router.get('/object/:id', async (req, res) => {
  const objectId = req.params.id;
  const response = await getVotesForObject(objectId);

  if (response.success == true) {
    res.status(200).json(response);
  } else {
    res.status(404).json(response);
  }
});

module.exports = router;
