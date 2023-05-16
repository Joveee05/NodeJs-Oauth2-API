const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const tutorRouter = require('./routes/tutorRoutes');
const uploadRouter = require('./routes/answerUpload');
const authRouter = require('./routes/authRoutes');
const documentRouter = require('./routes/documentRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const assignmentRouter = require('./routes/assignmentRoutes');
const assignmentUpload = require('./routes/assignmentUpload');
const notificationRouter = require('./routes/notification');
const scheduleRouter = require('./routes/scheduleRoutes');
const cookieParser = require('cookie-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { questions, fileUpload, vote, answer } = require('./routes/index');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
require('./utils/passport')(passport);

const app = express();
app.use(cors());

app.use(helmet());

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pisqre Community API',
      version: '1.0.0',
      description: 'The Pisqre API',
    },
    servers: [
      {
        url: 'https://pisqre-app-4m3x3.ondigitalocean.app/api',
      },
      {
        url: 'https://pisqre-app-4m3x3.ondigitalocean.app',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsDoc(options);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.set('trust-proxy', true);

app.get('/api', (req, res) => {
  const ip = req.ip;
  res.send(ip);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SECRET,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    resave: false,
    saveUninitialized: false,
  })
);

app.use(xss());

app.use(passport.initialize());
app.use(passport.session());

app.use(mongoSanitize());

app.use(compression());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Pisqre Community API',
    Author: 'Brian Etaghene',
  });
});

app.use('/api/questions', questions);
app.use('/api/file', fileUpload);
app.use('/api/vote', vote);
app.use('/api/answers', answer);
app.use('/api/users', userRouter);
app.use('/api/documents', documentRouter);
app.use('/api/schedules', scheduleRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/tutors', tutorRouter);
app.use('/api/assignments', assignmentUpload, assignmentRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/live_session', bookingRouter);
app.use('/auth', authRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

app.all('*', (req, res, next) => {
  res.status(500).json({
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use(globalErrorHandler);

module.exports = app;
