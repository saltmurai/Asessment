# My App - Student Management API

A Node.js API built with Hono, TypeScript, and MySQL using Drizzle ORM for managing students and teachers.

## Features

- RESTful API with Hono framework
- MySQL database with Drizzle ORM
- Docker Compose for easy database setup
- TypeScript for type safety
- Vitest for testing
- Student and teacher management system

## Prerequisites

- Node.js (v22 or higher)
- Docker and Docker Compose
- Yarn package manager

## Instruction

### 1. Clone the Repository

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=myapp_user
DB_PASSWORD=myapp_password
DB_NAME=myapp_db

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup using Docker

#### Start the MySQL Database

Use Docker Compose to start the MySQL database:

```bash
docker-compose up -d
```

This will:

- Start a MySQL 8.0 container
- Create the database with credentials from your `.env` file
- Expose MySQL on port 3306
- Set up persistent storage with Docker volumes

#### Verify Database Connection

Check that the database is running:

```bash
docker-compose ps
```

You should see the MySQL container running and healthy.

### 5. Database Migrations

#### Generate Migration Files

If you've made changes to the schema, generate new migration files:

```bash
yarn db:generate
```

#### Run Migrations

Apply all pending migrations to set up the database schema:

```bash
yarn db:migrate
```

#### Alternative: Push Schema Directly (Development Only)

For development, you can push schema changes directly without migrations:

```bash
yarn db:push
```

### 8. Testing

#### Run Unit Tests

```bash
yarn test
```

#### Run Tests with UI

```bash
yarn test:ui
```

#### Run Tests with Coverage

```bash
yarn test:coverage
```

#### Run End-to-End Tests

```bash
yarn test:e2e
```

## API Endpoints

### Health Check

```
GET /api/health
```

Returns the API status.

### Student Management

- `POST /api/register` - Register students under a teacher
- `GET /api/commonstudents` - Get common students between teachers
- `POST /api/suspend` - Suspend a student
- `POST /api/retrievefornotifications` - Get students eligible for notifications

## Project Structure

```
├── src/
│   ├── db/
│   │   ├── config.ts          # Database connection
│   │   └── schema.ts          # Database schema definitions
│   ├── routes/
│   │   └── student/
│   │       ├── student.controller.ts  # Route handlers
│   │       └── student.service.ts     # Business logic
│   ├── test/
│   │   └── e2e.test.ts        # End-to-end tests
│   ├── utils/
│   │   ├── index.ts           # Utility functions
│   │   └── validation-wrapper.ts  # Validation helpers
│   └── index.ts               # Application entry point
├── drizzle/                   # Migration files
├── Assestment/                # API testing with Bruno
├── docker-compose.yml         # Database container setup
├── drizzle.config.ts         # Drizzle ORM configuration
└── package.json              # Dependencies and scripts
```
