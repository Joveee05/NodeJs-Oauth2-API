const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const DB = require('./database');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception...');
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(
    `Pisqre App running in ${process.env.NODE_ENV} mode on port ${port}...`
  );
});

mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully!'));

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('App Shutting Down...');
  server.close(() => {
    process.exit(1);
  });
});
