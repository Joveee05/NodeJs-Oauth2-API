const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const dotenv = require('dotenv');

dotenv.config({ path: './../config.env' });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Oops... Sorry, Please upload images only', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadAnswerFile = upload.single('file');

exports.saveToFolder = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }
  const questionId = req.params.id;
  req.file.filename = `answer-${questionId}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/answers/${req.file.filename}`);

  res.status(200).json({
    status: 'success',
    message: 'Upload successful',
    filename: req.file.filename,
    imageUrl: process.env.IMAGE_URL + `${req.file.filename}`,
  });
});
