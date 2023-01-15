const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/bookings', bookingController.getAllBookings);

router
  .route('/bookings/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
