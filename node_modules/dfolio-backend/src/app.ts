import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import floorRoutes from './routes/floorRoutes';
import roomRoutes from './routes/roomRoutes';
import categoryRoutes from './routes/categoryRoutes';
import subWorkRoutes from './routes/subWorkRoutes';
import taskRoutes from './routes/taskRoutes';
import photoRoutes from './routes/photoRoutes';
import noteRoutes from './routes/noteRoutes';
import snagRoutes from './routes/snagRoutes';
import reportRoutes from './routes/reportRoutes';
import searchRoutes from './routes/searchRoutes';

const app = express();

// Security Headers
app.use(helmet());

// Rate Limiting
const apiLimiter = rateLimit({
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

app.use(cors({
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

app.use(express.json({ limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString() 
  });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subworks', subWorkRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/snags', snagRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);

// Generic 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Production Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An internal server error occurred.' 
    : err.message || 'Internal server error occurred';

  res.status(status).json({ error: message });
});

export default app;
