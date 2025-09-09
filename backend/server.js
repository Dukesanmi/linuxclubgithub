const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:demo123@mongodb:27017/linuxclub?authSource=admin';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    experience: { type: String, required: true },
    goals: { type: String, required: true },
    role: { type: String, default: 'user' },
    permissions: [String],
    signupDate: { type: Date, default: Date.now },
    expirationDate: Date,
    isActive: { type: Boolean, default: true },
    profile: {
        bio: String,
        title: String,
        avatar: String,
        location: String,
        specializations: [String]
    },
    adminNotes: String,
    teacherStats: {
        coursesCreated: { type: Number, default: 0 },
        studentsEnrolled: { type: Number, default: 0 },
        rating: { type: Number, default: 0 }
    }
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    icon: String,
    order: Number,
    difficulty: String,
    estimatedHours: Number,
    prerequisites: [String],
    createdBy: String,
    approvedBy: String,
    status: { type: String, default: 'draft' },
    category: String,
    tags: [String],
    lessons: [{
        id: Number,
        title: String,
        content: String,
        duration: Number,
        videoUrl: String,
        exercises: [Object],
        resources: [Object]
    }],
    stats: {
        enrolledUsers: { type: Number, default: 0 },
        completedUsers: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 }
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);

// Check database initialization
async function checkDatabaseConnection() {
    try {
        const userCount = await User.countDocuments();
        const courseCount = await Course.countDocuments();
        console.log(`✅ Found ${userCount} users and ${courseCount} courses in MongoDB`);
        
        if (userCount > 0) {
            const users = await User.find({}, 'email role').limit(5);
            users.forEach(u => console.log(`   👤 ${u.role}: ${u.email}`));
        }
    } catch (error) {
        console.error('❌ Database check failed:', error);
    }
}

// Basic routes
app.get('/', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({
            message: '🐧 Linux Club Backend API',
            status: 'running',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            users: userCount
        });
    } catch (error) {
        res.json({
            message: '🐧 Linux Club Backend API',
            status: 'running',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            users: 'unknown'
        });
    }
});

app.get('/health', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            service: 'Linux Club Backend',
            uptime: process.uptime(),
            users: userCount,
            memory: process.memoryUsage(),
            database: 'connected'
        });
    } catch (error) {
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            service: 'Linux Club Backend',
            uptime: process.uptime(),
            users: 'unknown',
            memory: process.memoryUsage(),
            database: 'disconnected'
        });
    }
});

// Debug endpoint
app.get('/api/debug/users', async (req, res) => {
    try {
        const users = await User.find({}, 'email role isActive').limit(10);
        const debugUsers = users.map(u => ({
            id: u._id,
            email: u.email,
            role: u.role,
            isActive: u.isActive
        }));
        res.json({ users: debugUsers, total: users.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', message: error.message });
    }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        console.log('🔐 Login attempt:', email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password mismatch for:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account inactive' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userResponse } = user.toObject();
        console.log('✅ Login successful:', email, 'Role:', user.role);
        
        res.json({ 
            message: 'Login successful', 
            token, 
            user: userResponse 
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, age, experience, goals } = req.body;

        if (!name || !email || !password || !age || !experience || !goals) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (age < 16) {
            return res.status(400).json({ message: 'Must be at least 16 years old' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            age: parseInt(age),
            experience,
            goals,
            role: 'user',
            permissions: ['courses.view', 'progress.track'],
            expirationDate: new Date(Date.now() + (6 * 30 * 24 * 60 * 60 * 1000)),
            isActive: true,
            profile: {}
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userResponse } = user.toObject();
        res.status(201).json({ 
            message: 'User registered successfully', 
            token, 
            user: userResponse 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Courses endpoint
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find({ status: 'published' }).sort({ order: 1 });
        res.json({
            courses: courses,
            total: courses.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses', message: error.message });
    }
});

// Admin endpoints
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalCourses = await Course.countDocuments();
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        const recentUsers = await User.find({}, '-password').sort({ createdAt: -1 }).limit(3);

        res.json({
            stats: {
                totalUsers,
                activeUsers,
                totalCourses,
                teacherCount
            },
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data', message: error.message });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const users = await User.find({}, '-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await User.countDocuments();
        const pages = Math.ceil(total / limit);

        res.json({
            users,
            pagination: { total, page, limit, pages }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', message: error.message });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🐧 Linux Club Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`👑 Admin: admin@linuxclub.tech / demo123`);
    console.log(`👨‍🏫 Teacher: teacher@linuxclub.tech / demo123`);
    console.log(`👨‍🎓 Student: demo@linuxclub.tech / demo123`);
    
    // Check database connection and data
    await checkDatabaseConnection();
    
    console.log(`✅ Backend healthy and ready!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 Shutting down gracefully...');
    mongoose.connection.close();
    process.exit(0);
});