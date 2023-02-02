const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const authController = require('../controllers/authController');
const APIFeatures = require('../utils/apiFeatures');
const Question = require('../models/questions');
let {
  getAllQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  removeQuestion,
} = require('../controllers/questionController');
const AppError = require('../utils/appError');

/**
 * @swagger
 * /questions/top_questions:
 *   get:
 *     description: All top questions with most answers
 *     responses:
 *       200:
 *         description: Returns all the top questions
 */

router.get('/top_questions', async (req, res, next) => {
  const topQuestion = await Question.find().sort('-answers');
  res.status(200).json({
    status: 'success',
    results: topQuestion.length,
    data: {
      topQuestion,
    },
  });
});

/**
 * @swagger
 * /questions/search:
 *   get:
 *     parameters:
 *      - in: query
 *        name: question
 *        required: true
 *        type: string
 *        description: The question to search for.
 *     description: Get a question by searching
 *     responses:
 *       200:
 *         description: Returns the requested questions
 */

router.get('/search', async (req, res, next) => {
  const data = await Question.find({
    $or: [
      { questionBody: { $regex: req.query.question } },
      { title: { $regex: req.query.question } },
    ],
  });

  if (data.length < 1) {
    return next(
      new AppError('Oops... No question found. Try searching again.', 404)
    );
  } else {
    res.status(200).json({
      status: 'success',
      result: data.length,
      data,
    });
  }
});

/**
 * @swagger
 * /questions:
 *   get:
 *     description: All questions
 *     responses:
 *       200:
 *         description: Returns all the questions
 */
router.get('/', async (req, res) => {
  const features = new APIFeatures(Question.find(), req.query).paginate();
  const questions = await features.query;
  // let response = await getAllQuestions(req.query.page, req.query.limit);
  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: {
      questions,
    },
  });
});

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The questions ID.
 *     description: Get a questions by id
 *     responses:
 *       200:
 *         description: Returns the requested questions
 */
router.get('/:id', async (req, res) => {
  let response = await getQuestionById(req.params.id);
  res.json(response);
});

router.use(authController.protect);

router.get('/me/myQuestions', async (req, res, next) => {
  const features = new APIFeatures(
    Question.find({ user: req.user.id }),
    req.query
  ).paginate();
  const getMyQuestions = await features.query;

  if (getMyQuestions.length < 1) {
    return next(new AppError('Oops... No questions found!!', 404));
  }
  res.status(200).json({
    status: 'success',
    results: getMyQuestions.length,
    data: getMyQuestions,
  });
});

/**
 * @swagger
 * /questions:
 *   post:
 *     parameters:
 *      - in: body
 *        name: questions
 *        description: New question
 *        schema:
 *          type: object
 *          properties:
 *            userId:
 *              type: string
 *            questionBody:
 *              type: string
 *            title:
 *              type: string
 *            keywords:
 *              type: array
 *              items:
 *                type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', async (req, res) => {
  let keywords = [];
  if (req.body.keywords) keywords = req.body.keywords;

  let body = {
    questionBody: req.body.questionBody,
    title: req.body.title,
    user: req.user.id,
    keywords: keywords,
  };

  let response = await addQuestion(body);

  if (response.success == true) {
    res.status(201).json(response);
  } else {
    res.status(404).json(response);
  }
});

/**
 * @swagger
 * /questions/{id}:
 *   patch:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The question ID.
 *      - in: body
 *        name: question
 *        description: Update question
 *        schema:
 *          type: object
 *          properties:
 *            questionBody:
 *              type: string
 *            title:
 *              type: string
 *            keywords:
 *              type: array
 *              items:
 *                type: string
 *              example: ["abc"]
 *     responses:
 *       201:
 *         description: Created
 */
router.patch('/:id', async (req, res) => {
  let response = await updateQuestion(req.params.id, req.body);

  if (response.success == true) {
    res.status(201).json(response);
  } else {
    res.status(404).json(response);
  }
});

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The question ID.
 *     description: Delete a question by id
 *     responses:
 *       200:
 *         description: Returns the requested question
 */
router.delete('/:id', async (req, res) => {
  let response = await removeQuestion(req.params.id);
  try {
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json(response);
  }
});

module.exports = router;
