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
    bucketName: 'documents',
  });
});

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'documents',
        metadata: {
          tutorID: new mongoose.Types.ObjectId(req.params.id),
        },
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage }).single('document');

/**
 * @swagger
 * tags:
 *    name: Documents
 *    description: Upload a CV, Degree, Certificate
 */

/**
 * @swagger
 * /documents/upload/{id}:
 *   post:
 *     description: Upload a CV, Degree or Certificate
 *     tags: [Documents]
 *     parameters:
 *       - in: formData
 *         name: document
 *         type: file
 *         description: Upload document
 *         required: true
 *       - in: path
 *         name: id
 *         type: string
 *         description: tutor ID
 *         required: true
 *     responses:
 *       200:
 *         description: Document Uploaded
 */

router.post('/upload/:id', async (req, res) => {
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
 * /documents/info/{id}:
 *   get:
 *     description: Return All Documents Info corresponding to a particular tutor
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: tutor ID
 *         required: true
 *     responses:
 *       200:
 *         description: Document found
 */

router.get('/info/:id', async (req, res) => {
  bucket
    .find({
      metadata: { tutorID: new mongoose.Types.ObjectId(req.params.id) },
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
 * /documents/download/{id}:
 *   get:
 *     description: Download a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: Document ID
 *         required: true
 *     responses:
 *       200:
 *         description: Document downloaded
 */

router.get('/download/:id', async (req, res) => {
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
 * /documents/{documentId}:
 *   delete:
 *     description: Delete documents with Document ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: Document Id
 *         type: string
 *         description: document Id
 *         required: true
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete('/:documentId', async (req, res) => {
  bucket
    .find({ _id: new mongoose.Types.ObjectId(req.params.documentId) })
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
