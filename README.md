# linuxclub

# 🐧 Linux Club - Complete Learning Platform

A comprehensive Linux learning platform with React frontend, Node.js backend, and MongoDB database.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://gitlab.com/yourusername/linux-club.git
cd linux-club

# One-command deployment
make install && make prod
```

```
Access: http://localhost:3000
Demo Account: demo@linuxclub.tech / demo123
```


## 📋 Services

** Frontend: React app (Port 3000) 
** Backend: Node.js API (Port 5000)
** Database: MongoDB (Port 27017)
** Proxy: Nginx (Port 80)

## 🛠️ Commands

```
make install    # Setup environment
make dev        # Development mode
make prod       # Production deployment
make health     # Check services
make logs       # View logs
make backup     # Backup database
make clean      # Clean up
```

📚 Features

7 comprehensive Linux courses
User authentication & progress tracking
6-month free membership system
Certificates upon completion
Responsive modern UI
Production-ready deployment

## 🔧 Development
```
make dev        # Start development environment
make test       # Run tests
make monitor    # System monitoring
```

Ready to master Linux? Start learning today! 🚀
EOF


**Create Makefile:**
```bash
cat > Makefile << 'EOF'
.PHONY: help install build up down restart logs clean backup restore dev prod health

help: ## Show available commands
	@echo "🐧 Linux Club Platform Commands:"
	@echo "  make install  - Setup environment"
	@echo "  make dev      - Start development"
	@echo "  make prod     - Deploy production"
	@echo "  make health   - Check services"
	@echo "  make logs     - View logs"
	@echo "  make backup   - Backup database"
	@echo "  make clean    - Clean up"

install: ## Install dependencies
	@echo "🛠️ Setting up Linux Club..."
	@mkdir -p data/mongodb backups
	@cp .env.example .env || echo "⚠️ .env.example not found"
	@echo "✅ Setup complete!"

dev: ## Start development environment
	@echo "🚀 Starting development..."
	docker-compose up -d
	@echo "✅ Development running at http://localhost:3000"

prod: ## Deploy to production
	@echo "🚀 Deploying to production..."
	docker-compose up -d --build
	@echo "✅ Production deployed!"

health: ## Check service health
	@echo "🏥 Checking services..."
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

logs: ## View logs
	docker-compose logs -f

down: ## Stop all services
	docker-compose down

restart: ## Restart services
	docker-compose restart

backup: ## Backup database
	@echo "💾 Creating backup..."
	@mkdir -p backups
	@docker exec linuxclub_mongodb mongodump --out /tmp/backup
	@docker cp linuxclub_mongodb:/tmp/backup ./backups/backup_$(shell date +%Y%m%d_%H%M%S)
	@echo "✅ Backup created"

clean: ## Clean up
	docker-compose down -v
	docker system prune -f

build: ## Build services
	docker-compose build
EOF
```


## 📁 Final Repository Structure
```
linux-club/
├── .gitlab-ci.yml
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── docker-compose.test.yml
├── docker-compose.monitoring.yml
├── Makefile
├── README.md
├── mongo-init.js
├── deploy.sh
├── backup.sh
├── restore.sh
├── monitor.sh
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── healthcheck.js
│   ├── models/
│   ├── routes/
│   └── middleware/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   ├── nginx.conf
│   └── src/
├── nginx/
│   └── nginx.conf
└── scripts/

```

#!/bin/bash
# quick-setup.sh - Automated Linux Club project setup

set -e

echo "🐧 Setting up Linux Club project..."

# Create directory structure
mkdir -p backend/{models,routes,middleware}
mkdir -p frontend/src
mkdir -p nginx/ssl
mkdir -p data/mongodb
mkdir -p backups
mkdir -p monitoring/{prometheus,grafana/provisioning}
mkdir -p scripts

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production
.env.development

# Production builds
backend/dist/
frontend/dist/
frontend/build/

# Database data
data/
*.log
logs/

# SSL certificates
nginx/ssl/*.pem
nginx/ssl/*.key
nginx/ssl/*.crt

# Backups (optional - you might want to commit these)
backups/*.tar.gz

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Docker
.dockerignore

# Runtime
*.pid
*.seed
*.pid.lock
coverage/
.nyc_output

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache
EOF

# Create environment example files
cat > .env.example << 'EOF'
# Production Environment Variables
COMPOSE_PROJECT_NAME=linuxclub
DOMAIN=linuxclub.tech
MONGODB_ROOT_PASSWORD=change_this_secure_password
JWT_SECRET=change_this_jwt_secret
NODE_ENV=production
SSL_ENABLED=false
EOF

cat > backend/.env.example << 'EOF'
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password@localhost:27017/linuxclub?authSource=admin
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your_session_secret_here
EOF

cat > frontend/.env.example << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Linux Club
VITE_APP_DOMAIN=linuxclub.tech
EOF

# Create basic package.json files
cat > backend/package.json << 'EOF'
{
  "name": "linuxclub-backend",
  "version": "1.0.0",
  "description": "Linux Club Learning Platform Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "validator": "^13.11.0",
    "dotenv": "^16.3.1",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

cat > frontend/package.json << 'EOF'
{
  "name": "linuxclub-frontend",
  "version": "1.0.0",
  "description": "Linux Club Learning Platform Frontend",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.6.2",
    "react-query": "^3.39.3",
    "react-hook-form": "^7.48.2",
    "react-hot-toast": "^2.4.1",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.294.0",
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
EOF

# Create basic healthcheck
cat > backend/healthcheck.js << 'EOF'
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.end();
EOF

# Create dockerignore files
cat > backend/.dockerignore << 'EOF'
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
coverage
.nyc_output
EOF

cat > frontend/.dockerignore << 'EOF'
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
coverage
.nyc_output
dist
build
EOF

# Make scripts executable
``` bash
chmod +x deploy.sh backup.sh restore.sh monitor.sh setup.sh
```

echo "✅ Basic project structure created!"
echo ""
echo "📝 Next steps:"
echo "1. Copy all the Docker Compose files from the artifacts"
echo "2. Copy all the source code files (server.js, models, routes, etc.)"
echo "3. Copy the Makefile"
echo "4. Copy the complete README.md"
echo "5. Run: git add . && git commit -m 'Initial Linux Club setup' && git push"
echo ""
echo "🚀 After pushing to GitLab, anyone can clone and run:"
echo "   git clone <your-repo>"
echo "   cd <your-repo>"
echo "   make install && make prod"
EOF

```bash
chmod +x quick-setup.sh
```
