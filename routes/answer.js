const express = require('express');
const authController = require('../controllers/authController');
const Answer = require('../models/answer');
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const router = express.Router();
const AppError = require('../utils/appError');
let { createNotification } = require('../controllers/utility');
let {
  getAllAnswers,
  getAnswerById,
  addAnswer,
  removeAnswer,
  updateAnswer,
  getAnswerByOptions,
} = require('../controllers/answerController');
const AnswerSchema = require('../models/answer');
const QuestionPageSchema = require('../models/questions');

/**
 * @swagger
 * /answers/question/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The question ID.
 *     description: Get all answers for particular question
 *     responses:
 *       200:
 *         description: Returns the requested answers
 */
router.get('/question/:id', async (req, res, next) => {
  let response = await getAnswerByOptions({ question: req.params.id });
  res.json(response);
});

router.use(authController.protect);

router.get('/myAnswers', async (req, res, next) => {
  const allMyAnswers = await Answer.find({ answeredBy: req.user.id });
  const features = new APIFeatures(Answer.find({ answeredBy: req.user.id }), req.query).sortByTimeStamp().paginate();
  const getMyAnswers = await features.query;

  if (getMyAnswers.length < 1 || allMyAnswers.length < 1) {
    return next(new AppError('Oops... No answers found!!', 404));
  }
  res.status(200).json({
    status: 'success',
    allMyAnswers: allMyAnswers.length,
    results: getMyAnswers.length,
    data: getMyAnswers,
  });
});

//Add an answer
/**
 * @swagger
 * /answers:
 *   post:
 *     parameters:
 *      - in: body
 *        name: answers
 *        description: New answer
 *        schema:
 *          type: object
 *          properties:
 *            userId:
 *              type: string
 *            questionId:
 *              type: string
 *            answer:
 *              type: string
 *     responses:
 *       201:
 *         description: Created Answer
 */
router.post('/:questionId', async (req, res) => {
  const questionId = req.params.questionId;

  let body = {
    answeredBy: req.user.id,
    question: questionId,
    answer: req.body.answer,
    answerTimeStamp: new Date(),
    answerModifiedTimeStamp: new Date(),
  };

  const question = await QuestionPageSchema.findById(questionId);
  const userID = question.user._id;
  const user = await User.findById(req.user.id);
  const message = `${user.fullName} answered one of your questions`;

  const response = await addAnswer(body);

  const newData = await QuestionPageSchema.findByIdAndUpdate(questionId, {
    $inc: { answers: 1 },
  });

  const answerID = response.data._id;
  if (userID == req.user.id) {
    if (response.success == true) {
      return res.status(201).json(response);
    } else {
      return res.status(404).json(response);
    }
  } else {
    if (response.success == true) {
      await createNotification('answer to question', message, userID, questionId, answerID);
      return res.status(201).json(response);
    } else {
      return res.status(404).json(response);
    }
  }
});

//update answer
/**
 * @swagger
 * /answers/{id}:
 *   patch:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The answer ID.
 *      - in: body
 *        name: answer
 *        description: Update answer
 *        schema:
 *          type: object
 *          properties:
 *            answer:
 *              type: string
 *     responses:
 *       201:
 *         description: Updated Answer
 */
router.patch('/:id', async (req, res) => {
  const answerID = req.params.id;
  const answer = await Answer.findById(answerID);
  const questionId = answer.question._id;

  const question = await QuestionPageSchema.findById(questionId);
  const userID = question.user._id;
  const user = await User.findById(req.user.id);
  const message = `${user.fullName} updated an answer`;
  let response = await updateAnswer(answerID, req.body);

  if (response.success == true) {
    await createNotification('updated answer to question', message, userID, questionId, answerID);
    res.status(201).json(response);
  } else {
    res.status(404).json(response);
  }
});

//delete answer
/**
 * @swagger
 * /answers/{id}/question/{questionId}:
 *   delete:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The answer ID.
 *      - in: path
 *        name: Question Id
 *        required: true
 *        type: string
 *        description: The question Id where you want to delete an answer
 *     description: Delete an answer by id
 *
 *     responses:
 *       200:
 *         description: Deleted answer
 */
router.delete('/:id/question/:questionId', async (req, res) => {
  try {
    const questionId = req.params.questionId;
    let response = await removeAnswer(req.params.id);
    if (response.success == true) {
      await QuestionPageSchema.findByIdAndUpdate(questionId, {
        $inc: { answers: -1 },
      });
    }
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json(response);
  }
});

//Return all answers
/**
 * @swagger
 * /answers:
 *   get:
 *     description: All answers
 *     responses:
 *       200:
 *         description: Returns all the answers
 */
router.get('/', async (req, res) => {
  const allAnswers = await Answer.find();
  const features = new APIFeatures(Answer.find(), req.query).sortByTimeStamp().paginate();
  const answers = await features.query;
  res.status(200).json({
    status: 'success',
    allAnswers: allAnswers.length,
    results: answers.length,
    data: {
      answers,
    },
  });
});

//Return ans by id
/**
 * @swagger
 * /answers/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The answer ID.
 *     description: Get a answer by id
 *     responses:
 *       200:
 *         description: Returns the requested answer
 */
router.get('/:id', async (req, res) => {
  let response = await getAnswerById(req.params.id);
  res.json(response);
});

/**
 * @swagger
 * /answers/user/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The user ID.
 *     description: Get all answers for particular user
 *     responses:
 *       200:
 *         description: Returns the requested answers
 */
router.get('/user/:id', async (req, res) => {
  let response = await getAnswerByOptions({ userId: req.params.id });
  res.json(response);
});

module.exports = router;
