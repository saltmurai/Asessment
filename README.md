# Student Management System

A NestJS-based student management system with MySQL database, fully containerized with Docker.

## Prerequisites

- Docker and Docker Compose
- Node.js 22+ (for local development)
- pnpm (for local development)

## Quick Start with Docker Compose (Recommended)

### 1. Environment Setup

Create a `.env` file in the root directory:

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

1. **Start MySQL container:**

   ```bash
   docker run -d \
     --name mysql-db \
     -e MYSQL_ROOT_PASSWORD=password \
     -e MYSQL_DATABASE=student_manage \
     -p 3306:3306 \
     mysql:8.0
   ```

2. **Build and run the app:**
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

## API Endpoints

- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

## Development Notes

- The app uses pnpm for package management
- TypeScript with NestJS framework
- Docker multi-stage builds for optimized production images
- Health checks and proper container orchestration
- Non-root user in production container for security

App runs on `http://localhost:3000`
