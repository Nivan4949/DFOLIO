"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Retrieve dashboard stats (must be placed before GET /:id route)
router.get('/stats', auth_1.authenticateJWT, projectController_1.getDashboardStats);
router.post('/', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(['ADMIN', 'PROJECT_MANAGER']), projectController_1.createProject);
router.get('/', auth_1.authenticateJWT, projectController_1.getProjects);
router.get('/:id', auth_1.authenticateJWT, projectController_1.getProjectById);
router.put('/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(['ADMIN', 'PROJECT_MANAGER']), projectController_1.updateProject);
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(['ADMIN']), projectController_1.deleteProject);
exports.default = router;
