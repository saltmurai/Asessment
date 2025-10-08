# Student Management System

A NestJS-based student management system with MySQL database, fully containerized with Docker.

## Prerequisites

- Docker and Docker Compose
- Node.js 22+ (for local development)
- pnpm (for local development)

## Quick Start with Docker Compose (Recommended)

### 1. Environment Setup

Create a `.env` file in the root directory following `.env.example`:

```bash
# Database Configuration
DB_USER=root
DB_HOST=localhost
DB_PORT=3306
DB_PASSWORD=password
DB_NAME=student_manage

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 2. Run the Application

```bash
# Build and start all services (app + database)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at `http://localhost:3000`

### 3. Stop the Application

```bash
docker-compose down

# To also remove volumes (database data)
docker-compose down -v
```

## Alternative Setup Methods

### Using Docker Only (Manual Database Setup)

1. **Build and run the app:**
   ```bash
   docker build -t student-app .
   docker run -p 3000:3000 --env-file .env student-app
   ```

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (requires local MySQL)
pnpm start:dev

# Run tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

### Production Build

```bash
pnpm install
pnpm build
pnpm start:prod
```

## Database

The application uses MySQL 8.0 with the following features:

- Database schema is automatically initialized from `sql/schema-init.sql`
- TypeORM with entity synchronization in development
- Health checks ensure database is ready before app starts


App runs on `http://localhost:3000`
