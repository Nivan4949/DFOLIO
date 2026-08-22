"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const photoController_1 = require("../controllers/photoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
router.get('/', auth_1.authenticateJWT, photoController_1.getAllPhotos);
router.post('/upload', auth_1.authenticateJWT, upload.single('photo'), photoController_1.uploadPhoto);
router.get('/task/:taskId', auth_1.authenticateJWT, photoController_1.getTaskPhotos);
router.delete('/:id', auth_1.authenticateJWT, photoController_1.deletePhoto);
exports.default = router;
