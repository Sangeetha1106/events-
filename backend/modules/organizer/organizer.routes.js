const express = require('express');
const router = express.Router();
const organizerController = require('./organizer.controller');
// Other specific routes like events and bookings related to organizer will be imported from their respective modules
// but since the instruction asks to put features in Organizer, we might want to map them here. Let's use event and booking routes.

const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const bookingController = require('../booking/booking.controller');

router.post('/login', organizerController.login);
router.get('/bookings', authMiddleware, roleMiddleware(['Organizer']), bookingController.viewEventBookings);

module.exports = router;
