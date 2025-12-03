// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db'); // hanya untuk memastikan init jalan
const authRoutes = require('./routes/auth.routes');

// Tambahkan route profile
const profileRoutes = require('./routes/profile.routes');

// Tambahkan route portfolio
const portfolioRoutes = require('./routes/portfolio.routes');

const projectRoutes = require('./routes/project.routes');

const whatsappRoutes = require('./routes/whatsapp.routes');

const developerRoutes = require('./routes/developer.routes');



const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Routes
app.use('/auth', authRoutes);

app.use('/profile', profileRoutes);

app.use('/portfolio', portfolioRoutes);

app.use('/project', projectRoutes);

app.use('/whatsapp', whatsappRoutes);

app.use('/developer', developerRoutes);

// Global error handler sederhana
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



