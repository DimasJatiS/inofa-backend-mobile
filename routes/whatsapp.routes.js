const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const whatsapp = require('../controllers/whatsapp.controller');

router.get('/contact', auth, whatsapp.getWhatsappLink);

module.exports = router;
