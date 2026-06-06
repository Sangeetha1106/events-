const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Public or Attender route
router.get('/', eventController.viewEvents);
router.get('/public', eventController.viewPublicEvents);

// Protected routes (Organizer only)
router.use(authMiddleware);
router.use(roleMiddleware(['Organizer']));

router.post('/', eventController.createEvent);
router.get('/my-events', eventController.viewOwnEvents);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.patch('/:id/schedule', eventController.addEventSchedule);
router.patch('/:id/tickets', eventController.addTicketDetails);

module.exports = router;
