// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db'); // Prisma client (keeps singleton alive)
const authRoutes = require('./routes/auth.routes');

// Tambahkan route profile
const profileRoutes = require('./routes/profile.routes');

// Tambahkan route portfolio
const portfolioRoutes = require('./routes/portfolio.routes');

const projectRoutes = require('./routes/project.routes');

const whatsappRoutes = require('./routes/whatsapp.routes');

const developerRoutes = require('./routes/developer.routes');

const uploadRoutes = require('./routes/upload.routes');



const app = express();
const PORT = process.env.PORT || 4000;
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : 'uploads';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

app.get('/v1/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/v1/auth', authRoutes);

app.use('/profile', profileRoutes);
app.use('/v1/profile', profileRoutes);

app.use('/portfolio', portfolioRoutes);
app.use('/v1/portfolio', portfolioRoutes);

app.use('/project', projectRoutes);
app.use('/v1/project', projectRoutes);

app.use('/whatsapp', whatsappRoutes);
app.use('/v1/whatsapp', whatsappRoutes);
app.use('/upload', uploadRoutes);
app.use('/v1/upload', uploadRoutes);


app.use('/developer', developerRoutes);
app.use('/v1/developer', developerRoutes);

// Global error handler sederhana
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

module.exports = app;



