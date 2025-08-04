# UniConnect Backend API

A comprehensive backend API for the UniConnect MVP - a university marketplace and community platform.

## Features

### ✅ Implemented Features

#### Authentication & Authorization
- **Google OAuth 2.0** integration (mandatory)
- JWT-based authentication with refresh tokens
- User roles: Admin, Moderator, Regular User
- Session management with secure cookies
- Password-based registration/login (optional)

#### User Management
- Complete user profile system
- Email/phone storage (optional fields)
- User activity tracking
- Ban/unban functionality
- Role-based access control

#### Posts System
- 6 categories: Ridesharing, Pick & Drop, Jobs, Buy/Sell, Shared Accommodation, Currency Exchange
- Rich post data: title, description, images (URLs), location, pricing
- Advanced search and filtering
- Like/unlike functionality
- View tracking
- Auto-expiration system

#### Messaging System
- Direct messaging between users
- Conversation management
- Message status tracking (sent, delivered, read)
- File attachment support
- Message flagging for moderation

#### Content Moderation
- Automatic keyword detection and flagging
- Severity-based content classification
- Manual review system for moderators
- Auto-flagging for high-risk content
- Comprehensive reporting system

#### Reporting System
- Report posts, users, and messages
- Multiple report categories and reasons
- Priority-based report handling
- Resolution tracking and actions
- Similar report detection

#### Admin Panel
- User management (CRUD operations)
- Post moderation tools
- Report management dashboard
- Content flagging review
- System analytics and health monitoring

#### Analytics
- Daily/Monthly active user tracking
- Posts per category statistics
- User growth metrics
- Engagement analytics
- System performance monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Google OAuth, JWT)
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Express-validator
- **Logging**: Morgan

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── passport.js          # Passport authentication strategies
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── postController.js    # Post management
│   ├── messageController.js # Messaging system
│   ├── reportController.js  # Reporting system
│   └── adminController.js   # Admin panel functionality
├── middleware/
│   └── auth.js              # Authentication & authorization middleware
├── models/
│   ├── User.js              # User schema and methods
│   ├── Post.js              # Post schema with category-specific fields
│   ├── Message.js           # Messaging schema
│   ├── Report.js            # Reporting system schema
│   └── Analytics.js         # Analytics tracking schemas
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── posts.js             # Post management routes
│   ├── messages.js          # Messaging routes
│   ├── reports.js           # Reporting routes
│   └── admin.js             # Admin panel routes
├── utils/
│   ├── moderation.js        # Content moderation utilities
│   ├── validation.js        # Input validation rules
│   └── jwt.js               # JWT utilities
├── package.json
├── server.js                # Main application entry point
└── .env.example             # Environment variables template
```

## Installation & Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Required environment variables**
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/uniconnect
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Session
   SESSION_SECRET=your_session_secret
   
   # Server
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update user profile

#### Posts
- `GET /posts` - Get all posts with filters
- `POST /posts` - Create new post
- `GET /posts/:id` - Get specific post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Toggle like
- `GET /posts/search` - Search posts

#### Messages
- `GET /messages` - Get all conversations
- `POST /messages/to/:userId` - Send message
- `GET /messages/conversation/:userId` - Get conversation
- `PUT /messages/:id/read` - Mark as read

#### Reports
- `POST /reports` - Create report
- `GET /reports` - Get all reports (mod/admin)
- `PUT /reports/:id/status` - Update report status

#### Admin
- `GET /admin/users` - Get all users
- `POST /admin/users/:id/ban` - Ban user
- `GET /admin/analytics` - Get analytics dashboard
- `GET /admin/flagged-content` - Get flagged content

### User Roles & Permissions

#### User (Default)
- Create, read, update, delete own posts
- Send and receive messages
- Report content
- Like posts

#### Moderator
- All user permissions
- Review and moderate flagged content
- Manage reports
- Ban/unban users
- Access moderation dashboard

#### Admin
- All moderator permissions
- Manage user roles
- Access system analytics
- Full system administration

### Post Categories

1. **Ridesharing** - Ride sharing and carpooling
2. **Pick & Drop** - Delivery and transportation services
3. **Jobs** - Job postings and opportunities
4. **Buy/Sell** - Marketplace for goods
5. **Accommodation** - Housing and roommate finder
6. **Currency Exchange** - Currency exchange services

### Content Moderation

The system includes automatic content moderation with:
- Keyword detection for inappropriate content
- Severity classification (low, medium, high, critical)
- Auto-flagging for high-risk content
- Manual review workflow for moderators

### Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js for security headers
- Input validation and sanitization
- JWT with expiration and refresh tokens
- Password hashing with bcrypt
- CORS protection
- SQL injection protection (NoSQL injection for MongoDB)

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Database Setup

Make sure MongoDB is running locally or provide a remote MongoDB URI in your `.env` file.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - Your production callback URL

### Testing

The API includes a health check endpoint at `/health` and documentation at `/api`.

## Deployment Considerations

### Environment Variables
Ensure all production environment variables are properly set, especially:
- Strong JWT secrets
- Production MongoDB URI
- Correct Google OAuth credentials
- Secure session secrets

### Security
- Use HTTPS in production
- Set up proper CORS origins
- Configure rate limiting based on your needs
- Regular security updates for dependencies

### Monitoring
- Set up logging aggregation
- Monitor API response times
- Track error rates
- Database performance monitoring

## Analytics & Tracking

The system tracks:
- Daily/monthly active users
- Posts per category
- User engagement metrics
- System performance
- Content moderation statistics

Analytics are automatically updated and accessible through the admin dashboard.

## Contributing

1. Follow the existing code structure
2. Add proper validation for new endpoints
3. Include appropriate middleware for authentication/authorization
4. Update documentation for new features
5. Test thoroughly before deployment

## Support

For questions or issues:
1. Check the API documentation at `/api`
2. Review the health check at `/health`
3. Check server logs for detailed error information
