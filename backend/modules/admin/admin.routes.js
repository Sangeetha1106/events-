const express = require('express');
const router = express.Router();

const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// ✅ LOGIN (PUBLIC)
router.post('/login', adminController.login);

// 🔒 PROTECTED ROUTES
router.use(authMiddleware);
router.use(roleMiddleware(['Admin']));

router.post('/organizer', adminController.createOrganizer);
router.get('/organizers', adminController.viewOrganizers);
router.get('/organizers/count', adminController.organizerCount);

module.exports = router;