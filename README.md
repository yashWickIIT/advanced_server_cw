# Advanced Server - Alumni Influencer API

A secure, feature-rich Express.js backend server with authentication, a blind bidding system, comprehensive user profiles, and public API key management for the Phantasmagoria Alumni AR Platform.

## Features

- **User Authentication** - JWT-based authentication with bcrypt password hashing, email verification, and password reset flows.
- **API Key Management** - Allow developers to generate, manage, and view usage statistics for API keys.
- **Blind Bidding System** - Complete daily bidding functionality, monthly win limits, and automated midnight winner selection.
- **User Profiles** - Comprehensive CRUD profile management including degrees, certifications, licences, and image uploads.
- **Security** - Custom XSS protection, rate limiting, CORS configuration, and Helmet headers.
- **Timezone-Aware Dates** - Strict UK timezone (Europe/London) handling using Day.js to prevent BST edge-case bugs.
- **API Documentation** - Full OpenAPI/Swagger interactive UI.

## Tech Stack

- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database**: MySQL (using `mysql2` promises)
- **Authentication**: JWT (`jsonwebtoken`) & `bcrypt`
- **Security**: `helmet`, `cors`, `express-rate-limit`, custom `xss` sanitizer
- **File Upload**: `multer`
- **API Docs**: `swagger-ui-express`
- **Task Scheduling**: `node-cron`
- **Date/Time Handling**: `dayjs` (with UTC & Timezone plugins)

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
   Create a `.env` file in the root directory. You can use the provided `.env.example` as a template:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=alumni_db
JWT_SECRET=your_super_secret_jwt_key
```

4. Set up the database
   Import your database tables or run your SQL setup scripts via phpMyAdmin or MySQL Workbench.

## Usage

### Development Mode

```bash
npm run dev
```

Runs the server with `nodemon` for automatic restarts on file changes.

### Production Mode

```bash
npm start
```

Starts the server normally.

## Project Structure

```text
├── config/          # Configuration files (e.g., db.js)
├── controllers/     # Route logic
│   ├── authController.js
│   ├── apiKeyController.js
│   ├── biddingController.js
│   └── profileController.js
├── middleware/      # Express bouncers
│   ├── authMiddleware.js      # JWT verification
│   ├── apiKeyAuth.js          # API key verification & tracking
│   └── xssSanitizer.js        # Custom XSS protection
├── routes/          # API URL definitions
│   ├── authRoutes.js
│   ├── apiKeyRoutes.js
│   ├── biddingRoutes.js
│   └── profileRoutes.js
├── jobs/            # Scheduled background tasks
│   └── winnerSelection.js     # Midnight cron job
├── utils/           # Helper functions
│   └── dateUtils.js           # Day.js UK timezone config
├── uploads/         # User profile images (Publicly served)
├── server.js        # Main application entry point
├── swagger.json     # OpenAPI documentation configuration
└── package.json     # Project dependencies
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register a new alumni user
- `GET /verify/:token` - Verify email address
- `POST /login` - User login (Returns JWT)
- `POST /logout` - User logout (Instructs client to discard token)
- `POST /forgot-password` - Request a password reset link
- `POST /reset-password/:token` - Submit a new password

### User Profiles (`/api/profile`)

- `GET /` - Get the logged-in user's complete profile
- `POST /` - Create or update profile (Handles text arrays and multipart image uploads)

### Bidding System (`/api/bids`)

- `POST /place` - Place or increase a bid for tomorrow's slot
- `GET /my-bids` - View personal bidding history and statuses
- `GET /alumnus-of-the-day` - Get today's winner (Protected by API Key!)
- `GET /test-winner` - Developer route to manually trigger the midnight cron logic

### Developer API Keys (`/api/developer/keys`)

- `POST /generate` - Create a new API key for a client app
- `GET /` - List all keys owned by the user
- `PUT /revoke/:id` - Revoke an active key
- `GET /stats` - View endpoint usage counts and timestamps

## Security Features

- **XSS Protection**: All user inputs (body, query, params) are recursively sanitized using a custom XSS middleware.
- **Rate Limiting**: Configured to block DDoS and brute force attempts (100 requests per 15 minutes per IP).
- **CORS & Helmet**: Configured for safe cross-origin requests and strict HTTP headers (e.g., disabling DNS prefetching).
- **Password Hashing**: Secure `bcrypt` hashing with 10 salt rounds.
- **JWT Tokens**: Short-lived secure token authentication for client sessions.

> **Note on CSRF Protection:**
> This API utilizes stateless JSON Web Tokens (JWT) transmitted via the `Authorization: Bearer` header, rather than utilizing session cookies. Because the browser does not automatically append custom headers to cross-origin requests, this architectural design is inherently immune to Cross-Site Request Forgery (CSRF) attacks, fulfilling the coursework security requirement without the need for additional CSRF-token middleware.

## API Documentation

Interactive Swagger UI documentation is available at:

```text
http://localhost:3000/api-docs
```
