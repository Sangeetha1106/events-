const express = require('express');
const router = express.Router();

const adminRoutes = require('../modules/admin/admin.routes');
const organizerRoutes = require('../modules/organizer/organizer.routes');
const attenderRoutes = require('../modules/attender/attender.routes');
const eventRoutes = require('../modules/event/event.routes');
const bookingRoutes = require('../modules/booking/booking.routes');
const authRoutes = require('../modules/auth/auth.routes');

router.use('/admin', adminRoutes);
router.use('/organizer', organizerRoutes);
router.use('/attender', attenderRoutes);
router.use('/event', eventRoutes);
router.use('/events', eventRoutes);
router.use('/booking', bookingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/auth', authRoutes);

module.exports = router;
