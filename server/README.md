# BlogHok Server

Backend server for BlogHok application built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=6000
MONGODB_URI=mongodb://localhost:27017/bloghok
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server in development mode with nodemon
- `npm run seed` - Seed the database with initial data

## API Endpoints

### Champions
- GET `/api/champions` - Get all champions
- GET `/api/champions/:id` - Get a specific champion
- POST `/api/champions` - Create a new champion (admin only)
- PATCH `/api/champions/:id` - Update a champion (admin only)
- DELETE `/api/champions/:id` - Delete a champion (admin only)

### Equipment
- GET `/api/equipment` - Get all equipment
- GET `/api/equipment/:id` - Get a specific equipment
- POST `/api/equipment` - Create a new equipment (admin only)
- PUT `/api/equipment/:id` - Update an equipment (admin only)
- DELETE `/api/equipment/:id` - Delete an equipment (admin only)

### Runes
- GET `/api/runes` - Get all runes
- GET `/api/runes/:id` - Get a specific rune
- POST `/api/runes` - Create a new rune (admin only)
- PATCH `/api/runes/:id` - Update a rune (admin only)
- DELETE `/api/runes/:id` - Delete a rune (admin only)

### Auth
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user info
- PATCH `/api/auth/me` - Update user info

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security

- JWT authentication
- Password hashing with bcrypt
- CORS enabled
- Rate limiting
- Input validation 