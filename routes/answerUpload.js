const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Question = require('../models/questions');
const User = require('../models/userModel');
const { GridFsStorage } = require('multer-gridfs-storage');
const fs = require('fs');
const router = express.Router();
let { createNotification } = require('../controllers/utility');
const dotenv = require('dotenv');
const AppError = require('../utils/appError');

dotenv.config({ path: './config.env' });

let bucket;

mongoose.connection.on('connected', () => {
  var client = mongoose.connections[0].client;
  var db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'answers',
  });
});

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'answers',
        metadata: {
          questionID: new mongoose.Types.ObjectId(req.params.questionId),
          answerID: new mongoose.Types.ObjectId(req.params.id),
        },
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage }).single('answer');

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

router.post(
  '/upload_answers/:id/questions/:questionId',
  async (req, res, next) => {
    const answerId = req.params.id;
    const questionId = req.params.questionId;
    const question = await Question.findById(questionId);
    if (!question) {
      return next(new AppError('Invalid or no question id', 400));
    }
    const userID = question.user._id;
    const message = 'You have an answer to one of your questions';

    await Question.findByIdAndUpdate(questionId, {
      $inc: { answers: 1 },
    });

    const response = upload(req, res, (err) => {
      if (!req.file) {
        return res
          .status(400)
          .send({ error: 'No file attached. Please attach a file' });
      } else {
        createNotification(
          'answer to question',
          message,
          userID,
          questionId,
          answerId
        );
        return res.status(200).json({
          status: 'success',
          message: 'Document uploaded successfully',
          data: req.file,
        });
      }
    });
  }
);

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

router.get('/answer_info/:id', async (req, res) => {
  bucket
    .find({
      'metadata.answerID': new mongoose.Types.ObjectId(req.params.id),
    })
    .toArray((message, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          status: 'failed',
          message: 'No document exists',
        });
      }
      res.status(200).json({
        status: 'success',
        message: 'Document found',
        data: files,
      });
    });
});

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

router.get('/download_answer/:id', async (req, res) => {
  bucket
    .find({
      _id: new mongoose.Types.ObjectId(req.params.id),
    })
    .toArray((message, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          message: 'No documents exist',
        });
      }
      var readStream = bucket.openDownloadStream(file[0]._id);
      readStream.pipe(res);
    });
});

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

router.delete('/:id', async (req, res) => {
  bucket
    .find({ _id: new mongoose.Types.ObjectId(req.params.id) })
    .toArray((err, file) => {
      if (!file || file.length == 0) {
        res.status(200).json({
          status: 'failed',
          message: 'No document exist',
        });
      }
      bucket.delete(file[0]._id);
      res.status(200).json({
        status: 'success',
        message: 'Document deleted',
      });
    });
});

module.exports = router;
