# Jobzworld API

A comprehensive Node.js TypeScript API for the Jobzworld video-first job matching platform.

## Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **User Management**: Separate candidate and employer user types
- **Candidate Profiles**: Complete profile management with skills, experience, and preferences
- **Video Responses**: Support for candidate video Q&A responses
- **Job Management**: Job posting and management for employers
- **AI Matching**: Backend support for AI-powered candidate-job matching
- **Messaging**: Communication system between candidates and employers
- **File Management**: AWS S3 integration for file uploads
- **Email Services**: AWS SES integration for transactional emails
- **Rate Limiting**: Protection against API abuse
- **Comprehensive Validation**: Input validation with Joi
- **Error Handling**: Centralized error handling with custom error types

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with raw SQL queries
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3
- **Email**: AWS SES with Nodemailer
- **Validation**: Joi
- **Security**: Helmet, CORS, rate limiting

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd jobzworld-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up PostgreSQL database:

```bash
# Create database
createdb jobzworld

# Run migrations
npm run migrate:up
```

5. Start the development server:

```bash
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables:

- **Server**: NODE_ENV, PORT, API_VERSION
- **Database**: DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- **JWT**: JWT_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY
- **AWS**: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
- **Email**: EMAIL_FROM, AWS_SES_REGION
- **Rate Limiting**: RATE_LIMIT_WINDOW, RATE_LIMIT_MAX_REQUESTS
- **File Upload**: MAX_FILE_SIZE, ALLOWED_VIDEO_TYPES, etc.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email/:userId` - Verify email
- `GET /api/v1/auth/profile` - Get user profile

### Candidates

- `POST /api/v1/candidates/profile` - Create candidate profile
- `GET /api/v1/candidates/profile/me` - Get own profile
- `PUT /api/v1/candidates/profile` - Update profile
- `DELETE /api/v1/candidates/profile` - Delete profile
- `PUT /api/v1/candidates/profile/:id/complete` - Mark profile complete
- `GET /api/v1/candidates/search` - Search candidate profiles
- `GET /api/v1/candidates/:id` - Get candidate profile by ID

### Stub Routes (To Be Implemented)

- `/api/v1/users/*` - User management
- `/api/v1/employers/*` - Employer management
- `/api/v1/jobs/*` - Job posting management
- `/api/v1/applications/*` - Job applications
- `/api/v1/videos/*` - Video management
- `/api/v1/messages/*` - Messaging system
- `/api/v1/notifications/*` - Notifications
- `/api/v1/files/*` - File uploads
- `/api/v1/matching/*` - AI matching
- `/api/v1/billing/*` - Billing and subscriptions
- `/api/v1/analytics/*` - Analytics
- `/api/v1/admin/*` - Admin functions

## Database Schema

The API uses PostgreSQL with the following main tables:

- `users` - User authentication and basic info
- `candidate_profiles` - Candidate profile data
- `companies` - Employer company profiles
- `job_postings` - Job listings
- `job_applications` - Application/connection data
- `video_responses` - Video Q&A responses
- `ai_match_scores` - AI matching scores
- `user_sessions` - Refresh token storage
- `conversations` & `messages` - Messaging system
- `notifications` - User notifications
- `uploaded_files` - File management
- And more...

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Custom middleware
├── validators/      # Input validation schemas
├── types/          # TypeScript type definitions
├── database/       # Database connection and migrations
└── server.ts       # Main application entry point
```

## Development

### Running Tests

```bash
npm test
npm run test:watch
```

### Database Migrations

```bash
# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down

# Create new migration
npm run migrate:create <migration-name>
```

### Building for Production

```bash
npm run build
npm start
```

## Security Features

- **Rate Limiting**: Configurable rate limiting on all endpoints
- **Authentication Rate Limiting**: Special rate limiting for auth endpoints
- **JWT Security**: Secure JWT implementation with refresh tokens
- **Input Validation**: Comprehensive input validation with Joi
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configurable CORS policies
- **Helmet**: Security headers
- **Password Hashing**: Bcrypt with configurable salt rounds

## Error Handling

The API includes comprehensive error handling:

- Custom `AppError` class for operational errors
- Centralized error handling middleware
- Validation error formatting
- Database error handling
- Development vs production error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
