const express = require('express');
const authController = require('../controllers/authController');
const Answer = require('../models/answer');
const router = express.Router();
const AppError = require('../utils/appError');
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
  const getMyAnswers = await Answer.find({ answeredBy: req.user.id })
    .populate('answeredBy')
    .populate('question')
    .sort('-answerTimeStamp');

  if (getMyAnswers.length < 1) {
    return next(new AppError('Oops... No answers found!!', 404));
  }
  res.status(200).json({
    status: 'success',
    result: getMyAnswers.length,
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

  const response = await addAnswer(body).then(
    await QuestionPageSchema.findByIdAndUpdate(questionId, {
      $push: {
        answeredBy: {
          user: req.user.fullName,
          image: req.user.image,
          answer: req.body.answer,
        },
      },
    })
  );

  if (response.success == true) {
    await QuestionPageSchema.findByIdAndUpdate(questionId, {
      $inc: { answers: 1 },
    });
    res.status(201).json(response);
  } else {
    res.status(404).json(response);
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
  let response = await updateAnswer(req.params.id, req.body);

  if (response.success == true) {
    res.status(201).json(response);
  } else {
    res.status(404).json(response);
  }
});

//delete answer
/**
 * @swagger
 * /answers/{id}:
 *   delete:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The answer ID.
 *     description: Delete a answer by id
 *     responses:
 *       200:
 *         description: Returns the requested answer
 */
router.delete('/:id', async (req, res) => {
  let response = await removeAnswer(req.params.id);
  try {
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
  let response = await getAllAnswers(
    req.query.s,
    req.query.page,
    req.query.limit
  );
  if (response.success == true) {
    res.status(200).json(response);
  } else {
    res.status(404).json(response);
  }
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
