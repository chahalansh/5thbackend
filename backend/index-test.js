import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory user storage for testing (replace with MongoDB later)
const users = [];

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running!', timestamp: new Date() });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body);
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 6 characters' 
            });
        }

        // Check if user already exists
        const existingUser = users.find(user => user.email === email || user.username === username);
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        users.push(newUser);
        console.log('✅ User registered successfully:', username);

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: error.message 
        });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔐 Login attempt:', req.body);
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required' 
            });
        }

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        console.log('✅ User logged in successfully:', user.username);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: error.message 
        });
    }
});

// Protected route to get user profile
app.get('/api/auth/profile', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('❌ Profile error:', error);
        res.status(401).json({ 
            success: false,
            message: 'Invalid token' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`🔐 Authentication endpoints available`);
    console.log(`📊 Using in-memory storage for testing`);
    console.log(`💾 Users will be stored temporarily (restart clears data)`);
});