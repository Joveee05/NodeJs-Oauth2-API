const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const fs = require('fs');
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

exports.uploadAssignment = async (req, res) => {
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
};

exports.assignmentInfo = async (req, res) => {
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
};

exports.downloadAssignment = async (req, res) => {
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
};

exports.deleteAssignment = async (req, res) => {
  bucket.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).toArray((err, file) => {
    if (!file || file.length == 0) {
      return res.status(200).json({
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
};

exports.deleteAssignmentFile = async function (id) {
  await bucket
    .find({
      metadata: { assignmentID: new mongoose.Types.ObjectId(id) },
    })
    .toArray((err, file) => {
      if (!file || file.length == 0) {
        return new AppError('No file exists', 404);
      }
      bucket.delete(file[0]._id);
    });
};
