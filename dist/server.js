"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const portfolio_routes_1 = __importDefault(require("./routes/portfolio.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const whatsapp_routes_1 = __importDefault(require("./routes/whatsapp.routes"));
const developer_routes_1 = __importDefault(require("./routes/developer.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});
// Routes
app.use('/auth', auth_routes_1.default);
app.use('/profile', profile_routes_1.default);
app.use('/portfolio', portfolio_routes_1.default);
app.use('/project', project_routes_1.default);
app.use('/whatsapp', whatsapp_routes_1.default);
app.use('/developer', developer_routes_1.default);
app.use('/upload', upload_routes_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});
exports.default = app;
