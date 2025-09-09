.PHONY: help install build up down restart logs clean backup restore dev prod health monitor

# Detect docker compose command
DOCKER_COMPOSE := $(shell which docker-compose 2>/dev/null)
ifeq ($(DOCKER_COMPOSE),)
	DOCKER_COMPOSE := docker compose
endif

# Default target
help: ## Show available commands
	@echo "🐧 Linux Club Platform - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install and setup environment
	@echo "🛠️  Setting up Linux Club environment..."
	@mkdir -p data/mongodb backups nginx/ssl
	@if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || echo "NODE_ENV=development" > .env; fi
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env 2>/dev/null || echo "NODE_ENV=development\nPORT=5000" > backend/.env; fi
	@if [ ! -f frontend/.env ]; then cp frontend/.env.example frontend/.env 2>/dev/null || echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env; fi
	@echo "✅ Environment setup complete!"
	@echo "🚀 Next: Run 'make dev' for development or 'make prod' for production"

check-docker: ## Check Docker and Docker Compose
	@echo "🔍 Checking Docker installation..."
	@docker --version || (echo "❌ Docker not found. Please install Docker first." && exit 1)
	@$(DOCKER_COMPOSE) version || (echo "❌ Docker Compose not found. Please install Docker Compose." && exit 1)
	@echo "✅ Docker and Docker Compose are ready!"

dev: check-docker ## Start development environment
	@echo "🚀 Starting development environment..."
	$(DOCKER_COMPOSE) up -d
	@echo "✅ Development environment started!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:5000"
	@echo "   MongoDB:  mongodb://localhost:27017"

prod: check-docker ## Deploy to production
	@echo "🚀 Deploying to production..."
	$(DOCKER_COMPOSE) up -d --build
	@echo "✅ Production deployment complete!"
	@echo "   Access: http://localhost:3000"
	@echo "   Demo:   demo@linuxclub.tech / demo123"

build: check-docker ## Build all services
	@echo "🏗️  Building services..."
	$(DOCKER_COMPOSE) build

up: check-docker ## Start all services
	@echo "🚀 Starting all services..."
	$(DOCKER_COMPOSE) up -d

down: ## Stop all services
	@echo "🛑 Stopping all services..."
	$(DOCKER_COMPOSE) down

restart: ## Restart all services
	@echo "🔄 Restarting all services..."
	$(DOCKER_COMPOSE) restart

logs: ## View logs from all services
	$(DOCKER_COMPOSE) logs -f

status: ## Show current status
	@echo "📊 Current Status:"
	$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "🌐 Service URLs:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:5000"
	@echo "   MongoDB:  mongodb://localhost:27017"

health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo "Services:"
	$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "Resource Usage:"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "No containers running"

clean: ## Clean up containers and volumes
	@echo "🧹 Cleaning up..."
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup completed"

backup: ## Create database backup
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@DATE=$$(date +%Y%m%d_%H%M%S) && \
	docker exec linuxclub_mongodb mongodump --out /tmp/backup 2>/dev/null && \
	docker cp linuxclub_mongodb:/tmp/backup ./backups/backup_$$DATE && \
	docker exec linuxclub_mongodb rm -rf /tmp/backup && \
	echo "✅ Backup created: backups/backup_$$DATE"

simple: ## Deploy simple version (no React build required)
	@echo "🚀 Deploying simple version..."
	docker-compose -f docker-compose.simple.yml up -d --build
	@echo "✅ Simple deployment complete!"
	@echo "   Access: http://localhost:3000"

simple-logs: ## View simple deployment logs
	docker-compose -f docker-compose.simple.yml logs -f

simple-down: ## Stop simple deployment
	docker-compose -f docker-compose.simple.yml down

db-shell: ## Access MongoDB shell (4.4 compatible)
	docker exec -it linuxclub_mongodb mongo -u admin -p linuxclub_secure_password --authenticationDatabase admin linuxclub

db-status: ## Check database status
	@echo "📊 Database Status:"
	@docker exec linuxclub_mongodb mongo --eval "db.runCommand('ping')" 2>/dev/null || echo "❌ Database not accessible"
