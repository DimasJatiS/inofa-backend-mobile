const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { ensureDeveloper } = require('../middleware/role.middleware');
const developer = require('../controllers/developer.controller');

// Get all developers
router.get('/all', auth, developer.getAllDevelopers);

// Search developer by skill
router.get('/search', auth, developer.searchDevelopersBySkill);

// Get my developer profile (developer only)
router.get('/me', auth, ensureDeveloper, developer.getMyDeveloperProfile);

// Get one developer by ID
router.get('/:id', auth, developer.getDeveloperById);

module.exports = router;
