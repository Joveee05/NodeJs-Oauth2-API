const express = require('express');
const mongoose = require('mongoose');
const authController = require('../controllers/authController');
const questionController = require('../controllers/questionController');
const APIFeatures = require('../utils/apiFeatures');
const Question = require('../models/questions');
const router = express.Router({ mergeParams: true });
let {
  addQuestion,
  updateView,
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
  const allQuestions = await Question.find();
  const features = new APIFeatures(Question.find(), req.query)
    .sortByAnswers()
    .paginate();
  const topQuestion = await features.query;
  res.status(200).json({
    status: 'success',
    allQuestions: allQuestions.length,
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
    $text: { $search: req.query.question, $caseSensitive: false },
  });

  if (data.length < 1) {
    return next(
      new AppError(
        'Oops... No question found. This may be due to a spelling error. Try searching again.',
        404
      )
    );
  } else {
    res.status(200).json({
      status: 'success',
      results: data.length,
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
  const allQuestions = await Question.find();
  const features = new APIFeatures(Question.find(), req.query)
    .sort()
    .paginate();
  const questions = await features.query;
  res.status(200).json({
    status: 'success',
    allQuestions: allQuestions.length,
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

router.get('/:id', async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate(
    'answeredBy'
  );
  if (question) {
    const userIp = req.ip;
    if (!question.iP.includes(userIp)) {
      const updateIp = await Question.findByIdAndUpdate(
        req.params.id,
        {
          $push: { iP: req.ip },
        },
        { new: true }
      ).then(await updateView(question));
      return res.status(200).json({
        status: 'success',
        data: updateIp,
      });
    } else {
      return res.status(200).json({
        status: 'success',
        data: question,
      });
    }
  } else {
    return next(new AppError('Oops!! No question found...', 404));
  }
});

router.use(authController.protect);

router.get('/me/myQuestions', async (req, res, next) => {
  const allMyQuestions = await Question.find({ user: req.user.id });
  const features = new APIFeatures(
    Question.find({ user: req.user.id }),
    req.query
  )
    .sort()
    .paginate();
  const getMyQuestions = await features.query;

  if (getMyQuestions.length < 1) {
    return next(new AppError('Oops... No questions found!!', 404));
  }
  res.status(200).json({
    status: 'success',
    allMyQuestions: allMyQuestions.length,
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
    iP: req.ip,
    branch: req.body.branch,
    user: req.user.id,
    keywords,
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
