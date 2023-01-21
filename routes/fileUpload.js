const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const fs = require('fs');

//creating bucket
let bucket;

const multerStorage = multer.memoryStorage();

mongoose.connection.on('connected', () => {
  var client = mongoose.connections[0].client;
  var db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'questionFiles',
  });
  //  console.log(bucket);
});

const storage = new GridFsStorage({
  url: process.env.DATABASE,
  file: (req, file) => {
    console.log(req.params.id);
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'questionFiles',
        metadata: {
          questionID: new mongoose.Types.ObjectId(req.params.id),
        },
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer(storage).single('uploadFile1');

/**
 * @swagger
 * /file/upload/{id}:
 *   post:
 *     description: Upload a File
 *     parameters:
 *       - in: formData
 *         name: uploadFile1
 *         type: file
 *         description: upload File1
 *         required: true
 *       - in: path
 *         name: id
 *         type: string
 *         description: question ID
 *         required: true
 *     responses:
 *       200:
 *         description: File Uploaded
 */
router.post('/upload/:id', async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send({ error: err });
      return;
    }
    return res.status(200).send('File uploaded successfully');
  });
});

/**
 * @swagger
 * /file/info/{id}:
 *   get:
 *     description: Return All Files Info corresponding to a particular question
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: question ID
 *         required: true
 *     responses:
 *       200:
 *         description: Returned File Info
 */
router.get('/info/:id', async (req, res) => {
  bucket
    .find({
      metadata: { questionID: new mongoose.Types.ObjectId(req.params.id) },
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'no files exist',
        });
      }
      return res.status(200).json({ success: true, message: files });
    });
});

/**
 * @swagger
 * /file/download/{id}:
 *   get:
 *     description: Download File for fileID
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         description: file ID
 *         required: true
 *     responses:
 *       200:
 *         description: File Downloaded
 */
router.get('/download/:id', async (req, res) => {
  bucket
    .find({
      _id: new mongoose.Types.ObjectId(req.params.id),
    })
    .toArray((err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'no file exist',
        });
      }
      var readStream = bucket.openDownloadStream(file[0]._id);
      readStream.pipe(res);
    });
});

/**
 * @swagger
 * /file/{fileId}:
 *   delete:
 *     description: Download Files for questionID
 *     parameters:
 *       - in: path
 *         name: fileId
 *         type: string
 *         description: file ID
 *         required: true
 *     responses:
 *       200:
 *         description: File Deleted
 */
router.delete('/:fileId', async (req, res) => {
  bucket
    .find({ _id: new mongoose.Types.ObjectId(req.params.fileId) })
    .toArray((err, file) => {
      if (!file || file.length == 0) {
        return res.status(404).json({ err: 'no file exist' });
      }
      bucket.delete(file[0]._id);
      return res.status(200).json({ message: 'File Deleted' });
    });
});

module.exports = router;
