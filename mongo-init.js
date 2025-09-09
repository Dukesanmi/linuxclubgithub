// Enhanced MongoDB initialization with roles and admin features
db = db.getSiblingDB('linuxclub');

// Pre-computed bcrypt hash for "demo123" (generated with bcrypt, rounds=10)
// You can generate this by running: bcrypt.hash('demo123', 10)
const hashedPassword = '$2a$10$09nZFAQtLexumY17UhMUmu.DUkCJu3e929P5TyVgADfkywj2y1EaC'; // demo123

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1, expirationDate: 1 });
db.courses.createIndex({ id: 1 }, { unique: true });
db.courses.createIndex({ createdBy: 1 });
db.progresses.createIndex({ userId: 1, courseId: 1 }, { unique: true });

// Create admin user (owner)
db.users.insertOne({
  name: 'Platform Owner',
  email: 'admin@linuxclub.tech',
  password: hashedPassword,
  age: 30,
  experience: 'advanced',
  goals: 'general',
  role: 'admin', // admin, teacher, user
  permissions: ['all'], // Array of permissions
  signupDate: new Date(),
  expirationDate: new Date(Date.now() + (10 * 365 * 24 * 60 * 60 * 1000)), // 10 years
  isActive: true,
  profile: {
    bio: 'Platform Administrator',
    title: 'Founder & CEO',
    avatar: '/avatars/admin.png'
  },
  adminNotes: 'Platform owner with full access',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create demo teacher
db.users.insertOne({
  name: 'John Teacher',
  email: 'teacher@linuxclub.tech',
  password: hashedPassword,
  age: 35,
  experience: 'advanced',
  goals: 'general',
  role: 'teacher',
  permissions: ['courses.create', 'courses.edit', 'courses.view', 'users.view_progress'],
  signupDate: new Date(),
  expirationDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)), // 2 years
  isActive: true,
  profile: {
    bio: 'Senior Linux System Administrator with 10+ years experience',
    title: 'Senior Linux Instructor',
    avatar: '/avatars/teacher.png',
    specializations: ['System Administration', 'DevOps', 'Security']
  },
  teacherStats: {
    coursesCreated: 0,
    studentsEnrolled: 0,
    rating: 4.9
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create demo student user
db.users.insertOne({
  name: 'Demo User',
  email: 'demo@linuxclub.tech',
  password: hashedPassword,
  age: 25,
  experience: 'beginner',
  goals: 'devops',
  role: 'user',
  permissions: ['courses.view', 'progress.track'],
  signupDate: new Date(),
  expirationDate: new Date(Date.now() + (6 * 30 * 24 * 60 * 60 * 1000)),
  isActive: true,
  profile: {
    bio: 'Learning Linux to advance my career in DevOps',
    location: 'Demo City'
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Enhanced courses with creator tracking
db.courses.insertMany([
  {
    id: 'linux-basics',
    title: 'Linux Basics & Command Line',
    description: 'Master essential Linux commands and file system navigation',
    icon: '🖥️',
    order: 1,
    difficulty: 'beginner',
    estimatedHours: 8,
    prerequisites: [],
    createdBy: 'teacher',
    approvedBy: 'admin',
    status: 'published', // draft, review, published, archived
    category: 'fundamentals',
    tags: ['command-line', 'basics', 'beginner'],
    lessons: [
      {
        id: 1,
        title: 'Introduction to Linux',
        content: 'What is Linux and why is it important for your career?',
        duration: 45,
        videoUrl: '',
        exercises: [],
        resources: []
      },
      {
        id: 2,
        title: 'The Terminal & Shell',
        content: 'Understanding the command line interface and shell basics.',
        duration: 60,
        videoUrl: '',
        exercises: [],
        resources: []
      }
    ],
    stats: {
      enrolledUsers: 0,
      completedUsers: 0,
      averageRating: 0,
      totalRatings: 0
    },
    isPublished: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create admin settings collection
db.settings.insertOne({
  _id: 'platform_settings',
  siteName: 'Linux Club',
  siteDescription: 'Master Linux & Launch Your Tech Career',
  maxUsersPerTeacher: 100,
  defaultMembershipDuration: 180, // days
  enableRegistration: true,
  requireApproval: false,
  emailSettings: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@linuxclub.tech'
  },
  features: {
    enableCertificates: true,
    enableDiscussions: false,
    enableLiveSessions: false
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create audit log collection for tracking admin actions
db.auditLogs.createIndex({ action: 1, timestamp: -1 });
db.auditLogs.createIndex({ performedBy: 1, timestamp: -1 });

print('✅ Database initialized with admin features, roles, and demo accounts!');
print('👑 Admin: admin@linuxclub.tech / demo123');
print('👨‍🏫 Teacher: teacher@linuxclub.tech / demo123');
print('👨‍🎓 Student: demo@linuxclub.tech / demo123');