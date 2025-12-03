const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { ensureClient, ensureDeveloper } = require('../middleware/role.middleware');
const project = require('../controllers/project.controller');

// CLIENT ROUTES
router.post('/', auth, ensureClient, project.createProject);
router.get('/me', auth, ensureClient, project.getMyProjects);

// DEVELOPER ROUTES
router.get('/all', auth, ensureDeveloper, project.getAllProjects);

module.exports = router;
