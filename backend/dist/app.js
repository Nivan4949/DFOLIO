"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const floorRoutes_1 = __importDefault(require("./routes/floorRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const subWorkRoutes_1 = __importDefault(require("./routes/subWorkRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const photoRoutes_1 = __importDefault(require("./routes/photoRoutes"));
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
const snagRoutes_1 = __importDefault(require("./routes/snagRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const prisma_1 = __importDefault(require("./config/prisma"));
const app = (0, express_1.default)();
// Security Headers
app.use((0, helmet_1.default)());
// Rate Limiting
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);
// Configurable CORS
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow non-browser requests (e.g. mobile apps, curl) or matched origins
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS Policy restriction: Origin not allowed.'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '20mb' }));
// Enhanced Health Check with Database Connectivity Test
app.get('/api/health', async (req, res) => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            database: 'connected',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Mounted Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/floors', floorRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/subworks', subWorkRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/photos', photoRoutes_1.default);
app.use('/api/notes', noteRoutes_1.default);
app.use('/api/snags', snagRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/search', searchRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/activity', activityRoutes_1.default);
// Generic 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Global Production Error Handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred.'
        : err.message || 'Internal server error occurred';
    res.status(status).json({ error: message });
});
exports.default = app;
