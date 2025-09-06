require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./src/routes/authroutes');
const taskRoutes = require('./src/routes/scheduleroutes'); 
const googleAIRoutes = require('./src/routes/googleairoutes');
const pdfRoutes = require('./src/routes/pdfroutes');
const youtubeRoutes = require('./src/routes/youtuberoutes');
const rerankRoutes = require('./src/routes/rerankroutes');

const { errorHandler, notFound } = require('./src/utils/errorhandler');

// Create Express app
const app = express();

// ⚙️ Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🏠 Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Study Buddy API is running! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      googleai: '/api/googleai',
      pdf: '/api/pdf',
      youtube: '/api/youtube',
      rerank: '/api/rerank',
      health: '/health'
    }
  });
});

// 💚 Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 🛣️ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); 
app.use('/api/googleai', googleAIRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/rerank', rerankRoutes);



// 🚨 Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Study Buddy API Server Started!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📱 Local: http://localhost:${PORT}
🔗 Health Check: http://localhost:${PORT}/health
🔐 Auth API: http://localhost:${PORT}/api/auth
🗂️ Tasks API: http://localhost:${PORT}/api/tasks
🧠 Google AI API: http://localhost:${PORT}/api/googleai
📄 PDF API: http://localhost:${PORT}/api/pdf
🎥 YouTube API: http://localhost:${PORT}/api/youtube
🔄 Rerank API: http://localhost:${PORT}/api/rerank



Available Endpoints:

✋🏻🛑⛔️ Login & Registration Features:
✅ POST /api/auth/register       - Register user
✅ POST /api/auth/login          - Login user
✅ GET  /api/auth/profile        - Get profile (Protected)
✅ POST /api/auth/logout         - Logout user (Protected)
✅ GET  /api/auth/verify         - Verify token (Protected)
✅ PUT  /api/auth/update-profile - Update profile (Protected)
✅ POST /api/auth/forgot-password - Send password reset email

🎯 Task schedule Features:
✅ GET  /api/tasks               - Get upcoming tasks (Protected)
✅ POST /api/tasks               - Create task (Protected)
✅ DELETE /api/tasks/:id        - Delete task (Protected)
✅ PUT  /api/tasks/:id          - Update task (Protected)

🧠 AI Features:
✅ POST /api/googleai/explain    - Get AI explanation of a topic
✅ POST /api/googleai/chat       - Chat with AI tutor
✅ POST /api/googleai/notes      - Generate study notes

📄 PDF Features:
✅ POST /api/pdf/search     - Basic PDF search by query
✅ POST /api/pdf/advanced   - Advanced PDF search with filters

🎥 YouTube Features:
✅ POST /api/youtube/search     - Basic YouTube search by query
✅ POST /api/youtube/advanced   - Advanced YouTube search with filters
✅ POST /api/youtube/details    - Get video details by ID

🔄 Rerank Features:
✅ POST /api/rerank/rerank       - Rerank combined search results
✅ POST /api/rerank/recommend    - Get smart content recommendations
✅ POST /api/rerank/analyze      - Analyze content quality


`);
});


process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
  process.exit(1);
});
