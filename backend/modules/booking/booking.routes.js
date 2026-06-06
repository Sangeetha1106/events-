const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Public Route (No auth token required for new attenders to register and book inline)
router.post('/', bookingController.createBooking);

router.use(authMiddleware);

// Attender Routes
router.post('/', roleMiddleware(['Attender']), bookingController.bookTickets);
router.get('/history', roleMiddleware(['Attender']), bookingController.viewBookingHistory);

// Organizer Routes
router.get('/event-bookings', roleMiddleware(['Organizer']), bookingController.viewEventBookings);

module.exports = router;
