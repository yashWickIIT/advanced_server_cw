# Advanced Server

A secure, feature-rich Express.js backend server with authentication, bidding system, user profiles, and API key management.

## Features

- **User Authentication** - JWT-based authentication with bcrypt password hashing
- **API Key Management** - Generate and manage API keys for secure access
- **Bidding System** - Complete bidding functionality with winner selection
- **User Profiles** - User profile management and updates
- **Security** - XSS protection, rate limiting, CORS, and Helmet for secure HTTP headers
- **Database** - MySQL integration using mysql2
- **API Documentation** - Swagger/OpenAPI documentation
- **Job Scheduling** - Automated winner selection using cron jobs

## Tech Stack

- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken) & bcrypt
- **Security**: helmet, cors, express-rate-limit, xss sanitizer
- **File Upload**: multer
- **API Docs**: Swagger UI with swagger-jsdoc
- **Task Scheduling**: node-cron

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd advanced_server_cw
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
```

4. Set up the database
```sql
CREATE DATABASE your_database;
-- Run your migration scripts
```

## Usage

### Development Mode
```bash
npm run dev
```
Runs the server with nodemon for automatic restart on file changes.

### Production Mode
```bash
npm start
```
Starts the server normally.

## Project Structure

```
├── config/          # Configuration files (database setup)
├── controllers/     # Route controllers
│   ├── authController.js
│   ├── apiKeyController.js
│   ├── biddingController.js
│   └── profileController.js
├── middleware/      # Express middleware
│   ├── authMiddleware.js      # JWT verification
│   ├── apiKeyAuth.js          # API key verification
│   └── xssSanitizer.js        # XSS protection
├── models/          # Database models
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── apiKeyRoutes.js
│   ├── biddingRoutes.js
│   └── profileRoutes.js
├── jobs/            # Scheduled jobs
│   └── winnerSelection.js
├── uploads/         # User uploads directory
├── server.js        # Main server file
├── swagger.json     # API documentation
└── package.json     # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### API Keys
- `GET /api/apikeys` - Get all API keys
- `POST /api/apikeys` - Create new API key
- `DELETE /api/apikeys/:id` - Delete API key

### Bidding
- `GET /api/bids` - Get all bids
- `POST /api/bids` - Create new bid
- `PUT /api/bids/:id` - Update bid
- `DELETE /api/bids/:id` - Delete bid

### Profiles
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/avatar` - Upload profile avatar

## Security Features

- **XSS Protection**: All user inputs are sanitized
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for cross-origin requests
- **Helmet**: Secure HTTP headers
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | - |
| `JWT_SECRET` | JWT secret key | - |


## API Documentation

Access the Swagger UI documentation at:
```
http://localhost:3000/api-docs
```

## Contributing

1. Create a feature branch (`git checkout -b feature/feature-name`)
2. Commit your changes (`git commit -m 'Add feature'`)
3. Push to the branch (`git push origin feature/feature-name`)
4. Open a Pull Request

