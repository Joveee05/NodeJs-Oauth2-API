const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Assignment = require('../models/assignmentModel');
const User = require('../models/userModel');
const { GridFsStorage } = require('multer-gridfs-storage');
const fs = require('fs');
const router = express.Router();
// const { createNotification } = require('../controllers/utility');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

let bucket;

mongoose.connection.on('connected', () => {
  var client = mongoose.connections[0].client;
  var db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'assignmentFiles',
  });
});

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'assignmentFiles',
        metadata: {
          assignmentID: new mongoose.Types.ObjectId(req.params.id),
        },
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage }).single('assignment');

/**
 * @swagger
 * /assignments/upload_assignment/{id}:
 *   post:
 *     summary: Upload an assignment file
 *     description: Upload an assignment file
 *     tags: [Assignments]
 *     parameters:
 *       - in: formData
 *         name: assignment
 *         type: file
 *         description: Upload assignment file
 *         required: true
 *       - in: path
 *         name: id
 *         type: string
 *         description: Assignment id
 *         required: true
 *     responses:
 *       200:
 *         description: Assignment Uploaded
 */

router.post('/upload_assignment/:id', async (req, res) => {
  const response = upload(req, res, (err) => {
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
 * /assignments/assignment_info/{id}:
 *   get:
 *     summary: Returns all assignment info corresponding to a particular assignment
 *     description: Returns all assignment info corresponding to a particular assignment
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: Assignment id
 *         required: true
 *     responses:
 *       200:
 *         description: Assignment document found
 */

router.get('/assignment_info/:id', async (req, res) => {
  bucket
    .find({
      metadata: { assignmentID: new mongoose.Types.ObjectId(req.params.id) },
    })
    .toArray((message, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          message: 'No assignment document exists',
        });
      }
      res.status(200).json({
        status: 'success',
        message: 'Assignment document found',
        data: files,
      });
    });
});

/**
 * @swagger
 * /assignments/download_assignment/{id}:
 *   get:
 *     summary: Download an assignment file
 *     description: Download an assignment file
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: Assignment file id
 *         required: true
 *     responses:
 *       200:
 *         description: Assignment downloaded
 */

router.get('/download_assignment/:id', async (req, res) => {
  bucket
    .find({
      _id: new mongoose.Types.ObjectId(req.params.id),
    })
    .toArray((message, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          message: 'No assignment exists',
        });
      }
      var readStream = bucket.openDownloadStream(file[0]._id);
      readStream.pipe(res);
    });
});

/**
 * @swagger
 * /assignments/delete_file/{id}:
 *   delete:
 *     summary: Delete files with assignment id
 *     description: Delete files with assignment id
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: Assignment id
 *         type: string
 *         description: The assignment file to be deleted
 *         required: true
 *     responses:
 *       200:
 *         description: Assignment deleted
 */

router.delete('/delete_file/:id', async (req, res) => {
  bucket
    .find({ _id: new mongoose.Types.ObjectId(req.params.id) })
    .toArray((err, file) => {
      if (!file || file.length == 0) {
        res.status(200).json({
          status: 'failed',
          message: 'No assignment exists',
        });
      }
      bucket.delete(file[0]._id);
      res.status(200).json({
        status: 'success',
        message: 'Assignment deleted',
      });
    });
});

module.exports = router;
