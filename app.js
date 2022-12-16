const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

require('./utils/passport')(passport);

const app = express();
app.use(cors());

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pisqre API',
      version: '1.0.0',
      description: 'A simple Express Library API',
    },
    servers: [
      {
        url: 'http://localhost:3000/',
      },
    ],
    // components: {
    //   securitySchemes: {
    //     bearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT',
    //     },
    //   },
    // },
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

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'XYzABBBCdee1234',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/welcome', (req, res) => {
  res.json({
    message: 'Hello, this is the Pisqre API',
    Author: 'Brian Etaghene',
  });
});

app.use('/api/users', userRouter);
app.use('/auth', authRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

module.exports = app;
