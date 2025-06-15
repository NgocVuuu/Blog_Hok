# 🏆 BlogHok - Honor of Kings Blog Platform

> A comprehensive MERN Stack application for Honor of Kings game content, featuring heroes, equipment, arcana, meta analysis, and community news.

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://mongodb.com/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.0-blue.svg)](https://mui.com/)

## 🎮 About Honor of Kings

Honor of Kings (王者荣耀) is one of the world's most popular MOBA games. BlogHok provides comprehensive game information and community features for players worldwide.

## Tech Stack

- MongoDB: NoSQL Database
- Express.js: Backend Server
- React.js: Frontend UI
- Node.js: Runtime Environment

## Project Structure

```
bloghok/
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/         # Main pages
│       ├── services/      # API services
│       ├── contexts/      # React contexts
│       ├── App.js
│       └── index.js
│
└── server/                 # Express Backend
    ├── config/            # Configuration files
    ├── controllers/       # Route controllers
    ├── models/           # MongoDB models
    ├── routes/           # API routes
    └── server.js         # Entry point
```

## Features

### Core Features
- **Heroes**: Comprehensive hero database with skills, stats, and meta information
- **Equipment**: Categorized equipment system with detailed stats and effects
- **Arcana**: Complete arcana system with color-coded tiers and attributes
- **Meta Analysis**: Real-time meta tier lists and statistics
- **News System**: Dynamic news and article management
- **Admin Dashboard**: Full CRUD operations for content management

### Technical Features
- **Security**: JWT authentication, input validation, rate limiting, file upload security
- **Performance**: Database indexing, query optimization, lazy loading, code splitting
- **Monitoring**: Health checks, logging system, error tracking
- **Internationalization**: Multi-language support (Vietnamese, English, Chinese)
- **Responsive Design**: Mobile-first approach with Material-UI
- **Error Handling**: Comprehensive error boundaries and toast notifications

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file in server directory
   - Add required environment variables

4. Configure environment variables:
   ```bash
   # Copy example environment file
   cd server
   cp .env.example .env

   # Edit .env file with your configuration
   # At minimum, set:
   # - MONGODB_URI
   # - JWT_SECRET
   # - CORS_ORIGIN
   ```

5. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server (in new terminal)
   cd client
   npm start
   ```

## Security Features

### Backend Security
- **Input Validation**: Comprehensive validation using Joi and express-validator
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control for admin operations
- **Rate Limiting**: Multiple rate limiting strategies for different endpoints
- **File Upload Security**: Secure file upload with type validation and size limits
- **Security Headers**: Helmet.js for security headers
- **NoSQL Injection Prevention**: MongoDB sanitization
- **Error Handling**: Secure error responses without sensitive information

### Frontend Security
- **XSS Prevention**: Input sanitization and CSP headers
- **Error Boundaries**: Graceful error handling
- **Secure API Communication**: Axios interceptors with token management
- **Route Protection**: Protected admin routes

## Performance Optimizations

### Backend Performance
- **Database Indexing**: Optimized indexes for common queries
- **Query Optimization**: Lean queries and pagination
- **Connection Pooling**: MongoDB connection optimization
- **Caching**: Response caching for static data
- **Compression**: Gzip compression for responses

### Frontend Performance
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Lazy loading images with intersection observer
- **Bundle Optimization**: Webpack optimizations
- **Memoization**: React.memo and useMemo for expensive operations

## Monitoring & Logging

### Health Checks
- **Basic Health**: `/health` - Overall system status
- **Detailed Health**: `/health/detailed` - Comprehensive system information
- **Liveness Probe**: `/health/live` - Simple alive check
- **Readiness Probe**: `/health/ready` - Ready to serve traffic
- **Metrics**: `/health/metrics` - System metrics

### Logging
- **Structured Logging**: Winston-based logging with JSON format
- **Log Levels**: Configurable log levels (error, warn, info, debug)
- **Request Logging**: Automatic request/response logging
- **Error Tracking**: Comprehensive error logging with context
- **Performance Monitoring**: Slow query and request detection

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details 