const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const AppError = require('../utils/appError');
const fs = require('fs');
require('dotenv').config();

let bucket;

mongoose.connection.on('connected', () => {
  var client = mongoose.connections[0].client;
  var db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'questionFiles',
  });
});

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
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

const upload = multer({ storage }).single('uploadFile1');

exports.uploadFile = async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send({ error: err });
      return;
    }
    return res.status(200).send('File uploaded successfully');
  });
};

exports.getFileInfo = async (req, res) => {
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
};

exports.downloadFile = async (req, res) => {
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
};

exports.deleteFile = async (req, res) => {
  bucket.find({ _id: new mongoose.Types.ObjectId(req.params.fileId) }).toArray((err, file) => {
    if (!file || file.length == 0) {
      return res.status(404).json({ err: 'no file exist' });
    }
    bucket.delete(file[0]._id);
    return res.status(200).json({ message: 'File Deleted' });
  });
};

exports.deleteQuestionFile = async function (id) {
  await bucket
    .find({
      metadata: { questionID: new mongoose.Types.ObjectId(id) },
    })
    .toArray((err, file) => {
      if (!file || file.length == 0) {
        return new AppError('No file exists', 404);
      }
      bucket.delete(file[0]._id);
    });
};
