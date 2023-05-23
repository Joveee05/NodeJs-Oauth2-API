const express = require('express');
const router = express.Router();
const assignmentUpload = require('../controllers/assignmentUpload');

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

router.post('/upload_assignment/:id', assignmentUpload.uploadAssignment);

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

router.get('/assignment_info/:id', assignmentUpload.assignmentInfo);

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

router.get('/download_assignment/:id', assignmentUpload.downloadAssignment);

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

router.delete('/delete_file/:id', assignmentUpload.deleteAssignment);

module.exports = router;
