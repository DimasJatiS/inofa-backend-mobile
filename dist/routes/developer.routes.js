"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const developer_controller_1 = require("../controllers/developer.controller");
const router = (0, express_1.Router)();
// Alias for clients that call /developer/all
router.get('/all', developer_controller_1.getAllDevelopers);
router.get('/', developer_controller_1.getAllDevelopers);
router.get('/:id', developer_controller_1.getDeveloperById);
exports.default = router;
