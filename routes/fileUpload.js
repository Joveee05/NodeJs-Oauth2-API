const express = require('express');
const fileController = require('../controllers/fileUpload');
const router = express.Router();

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

router.post('/upload/:id', fileController.uploadFile);

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

router.get('/info/:id', fileController.getFileInfo);

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
router.get('/download/:id', fileController.downloadFile);

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
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
