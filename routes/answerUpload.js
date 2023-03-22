const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const fs = require('fs');
const router = express.Router();
const dotenv = require('dotenv');

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
          questionID: new mongoose.Types.ObjectId(req.params.id),
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
 * /uploads/upload_answers/{id}:
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
 *         description: Question id
 *         required: true
 *     responses:
 *       200:
 *         description: Document Uploaded
 */

router.post('/upload_answers/:id', async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send({ error: err });
    } else {
      return res.status(200).json({
        status: 'success',
        message: 'Document uploaded successfully',
        data: req.file,
      });
    }
  });
});

/**
 * @swagger
 * /uploads/answer_info/{id}:
 *   get:
 *     description: Returns all answer info corresponding to a particular question
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: Question id
 *         required: true
 *     responses:
 *       200:
 *         description: Document found
 */

router.get('/answer_info/:id', async (req, res) => {
  bucket
    .find({
      metadata: { questionID: new mongoose.Types.ObjectId(req.params.id) },
    })
    .toArray((message, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
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
