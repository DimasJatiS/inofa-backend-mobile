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

// COMMON ROUTES (must be after specific routes like /all and /me)
router.get('/:id', auth, project.getProjectById);
router.put('/:id', auth, ensureClient, project.updateProject);
router.patch('/:id/status', auth, ensureClient, project.updateProjectStatus);
router.delete('/:id', auth, ensureClient, project.deleteProject);

module.exports = router;
