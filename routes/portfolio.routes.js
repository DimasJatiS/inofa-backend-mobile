const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { ensureDeveloper } = require('../middleware/role.middleware');
const portfolioController = require('../controllers/portfolio.controller');

router.post('/', authMiddleware, ensureDeveloper, portfolioController.createPortfolio);
router.get('/me', authMiddleware, ensureDeveloper, portfolioController.getMyPortfolio);
router.get('/:id', authMiddleware, ensureDeveloper, portfolioController.getPortfolioById);
router.put('/:id', authMiddleware, ensureDeveloper, portfolioController.updatePortfolio);
router.delete('/:id', authMiddleware, ensureDeveloper, portfolioController.deletePortfolio);

module.exports = router;
