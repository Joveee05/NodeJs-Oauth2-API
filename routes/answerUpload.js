const express = require('express');
const router = express.Router();
const answerFileController = require('../controllers/answerUpload');

/**
 * @swagger
 * tags:
 *    name: Answers
 *    description: Upload, download and get info of an answer file
 */

/**
 * @swagger
 * /uploads/upload_answers/{id}/questions/{questionId}:
 *   post:
 *     description: Upload an answer file
 *     tags: [Answers]
 *     parameters:
 *       - in: formData
 *         name: answer
 *         type: file
 *         description: Upload answer
 *         required: true
 *       - in: path
 *         name: id
 *         type: string
 *         description: Answer id
 *         required: true
 *       - in: path
 *         name: QuestionId
 *         type: string
 *         description: Question id
 *         required: true
 *     responses:
 *       200:
 *         description: Document Uploaded
 */

router.post('/upload_answers/:id/questions/:questionId', answerFileController.uploadAnswer);

/**
 * @swagger
 * /uploads/answer_info/{id}:
 *   get:
 *     description: Returns answer info
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: The answer id
 *         required: true
 *     responses:
 *       200:
 *         description: Document found
 */

router.get('/answer_info/:id', answerFileController.getAnswerFileInfo);

/**
 * @swagger
 * /uploads/download_answer/{id}:
 *   get:
 *     description: Download an answer file
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: Uploaded answer file id
 *         required: true
 *     responses:
 *       200:
 *         description: Document downloaded
 */

router.get('/download_answer/:id', answerFileController.downloadAnswer);

/**
 * @swagger
 * /uploads/{id}:
 *   delete:
 *     description: Delete files with answer id
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: Answer Id uploaded file
 *         type: string
 *         description: The answer file to be deleted
 *         required: true
 *     responses:
 *       200:
 *         description: Answer deleted
 */

router.delete('/:id', answerFileController.deleteAnswer);

module.exports = router;
