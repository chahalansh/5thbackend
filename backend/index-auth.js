import express from 'express';
import cors from 'cors';

import 'dotenv/config';
import { connect } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connect();

// Import auth routes only
import authRoutes from './Routes/AuthRoutes.js';

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running!', timestamp: new Date() });
});

// Auth routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`🔐 Authentication endpoints available`);
    console.log(`📊 Connected to MongoDB for real data storage`);
});