const express = require('express');
const router = express.Router();
const attenderController = require('./attender.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.post('/register', attenderController.register);
router.post('/login', attenderController.login);

// Protected routes (Attender only)
router.use(authMiddleware);
router.use(roleMiddleware(['Attender']));

router.get('/organizers', attenderController.viewOrganizers);
router.get('/organizers/:id', attenderController.viewOrganizerDetails);

module.exports = router;
