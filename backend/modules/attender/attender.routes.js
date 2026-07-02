const express = require('express');
const router = express.Router();
const attenderController = require('./attender.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.post('/register', attenderController.register);
router.post('/login', attenderController.login);

// Organizer: Manage attendees (requires auth + Organizer role)
router.put('/:id', authMiddleware, roleMiddleware(['Organizer']), attenderController.organizerUpdateAttender);
router.delete('/:id', authMiddleware, roleMiddleware(['Organizer']), attenderController.organizerDeleteAttender);

// Protected routes (Attender only)
router.use(authMiddleware);
router.use(roleMiddleware(['Attender']));

router.get('/organizers', attenderController.viewOrganizers);
router.get('/organizers/:id', attenderController.viewOrganizerDetails);
router.get('/profile', attenderController.getProfile);
router.put('/profile', attenderController.updateProfile);

module.exports = router;
