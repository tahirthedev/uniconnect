# UniConnect Backend - Development Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the following values in `.env`:
     ```bash
     # For local development with MongoDB
     MONGODB_URI=mongodb://localhost:27017/uniconnect
     
     # Generate secure secrets (or use the defaults for development)
     JWT_SECRET=your_jwt_secret_here
     SESSION_SECRET=your_session_secret_here
     
     # Google OAuth (optional for basic testing)
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     ```

3. **Database Setup**
   - Install and start MongoDB locally, OR
   - Use MongoDB Atlas cloud database
   - The connection will be established automatically when you start the server

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Start Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Posts
- `GET /api/posts` - Get all posts (with filters)
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Messages
- `GET /api/messages` - Get user's conversations
- `POST /api/messages` - Send new message
- `GET /api/messages/conversation/:userId` - Get conversation with user
- `PUT /api/messages/:id/read` - Mark message as read

### Reports
- `POST /api/reports` - Create new report
- `GET /api/reports` - Get user's reports
- `PUT /api/reports/:id` - Update report status

### Admin (Admin/Moderator only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/posts` - Get all posts
- `GET /api/admin/reports` - Get all reports
- `PUT /api/admin/users/:id/ban` - Ban user
- `PUT /api/admin/users/:id/unban` - Unban user
- `GET /api/admin/analytics` - Get analytics data

## Testing

Run basic functionality tests:
```bash
npm test
```

## Project Structure

```
backend/
├── config/           # Configuration files
│   ├── database.js   # MongoDB connection
│   └── passport.js   # Authentication strategies
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── .env             # Environment variables
├── .env.example     # Environment template
├── server.js        # Main server file
├── test.js          # Basic tests
└── seed.js          # Database seeder
```

## Features Implemented

✅ **Authentication & Authorization**
- Google OAuth 2.0 integration
- JWT-based authentication
- Role-based access control (Admin, Moderator, User)
- Session management

✅ **Posts System**
- 6 categories: Ridesharing, Pick & Drop, Jobs, Buy/Sell, Accommodation, Currency Exchange
- CRUD operations with advanced filtering
- Like/unlike functionality
- Auto-expiration system

✅ **Messaging System**
- Direct messaging between users
- Conversation management
- Message status tracking
- File attachment support

✅ **Content Moderation**
- Automatic keyword detection
- Content flagging system
- Manual review capabilities
- Reporting system

✅ **Admin Panel**
- User management (ban/unban)
- Content moderation
- Report management
- Basic analytics

✅ **Security Features**
- Rate limiting
- Input validation
- Helmet security headers
- CORS configuration
- JWT token management

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check connection string in `.env`
- For MongoDB Atlas, ensure IP is whitelisted

### Google OAuth Not Working
- Verify credentials in Google Console
- Update callback URL: `http://localhost:5000/api/auth/google/callback`
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env`

### Port Already in Use
- Change PORT in `.env` file
- Kill existing process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)
- Use `netstat -ano | findstr :5000` to find process on Windows
