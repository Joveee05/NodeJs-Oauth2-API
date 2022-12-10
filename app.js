const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');

require('./utils/passport')(passport);

const app = express();
app.use(cors());

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

app.use('/users', userRouter);
app.use('/auth', authRouter);

module.exports = app;
