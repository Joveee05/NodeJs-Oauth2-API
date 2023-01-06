const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { questions, fileUpload, vote, answer } = require("./routes/index");

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
        url: 'http://localhost:3000/api',
      },
      {
        url: 'http://localhost:3000/',
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

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Try again in an hour',
});

app.use('/api', limiter);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(xss());

app.use(passport.initialize());
app.use(passport.session());

app.use(mongoSanitize());

app.use(compression());

app.use('/api/questions', questions)
app.use('/api/file', fileUpload)
app.use('/api/vote', vote)
app.use('/api/answers', answer)
app.use('/api/users', userRouter);
app.use('/auth', authRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
