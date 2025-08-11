# TestSprite Testing Plan: CORS and Navigation Issues

## Test Overview

This test plan addresses CORS policy errors occurring when navigating between different post categories in the UniConnect MVP application. The error `"Access to fetch at 'http://localhost:5000/api/posts' from origin 'http://localhost:3000' has been blocked by CORS policy"` indicates backend CORS configuration issues.

## Environment Setup

- **Frontend**: Next.js running on `http://localhost:3000`
- **Backend**: Node.js/Express server on `http://localhost:5000`
- **Issue**: CORS headers missing/misconfigured for preflight requests

## Critical Issues Identified

### 1. CORS Policy Error
- **Error**: `No 'Access-Control-Allow-Origin' header is present on the requested resource`
- **Trigger**: Switching navigation between post categories (jobs, rides, accommodation, etc.)
- **Root Cause**: Backend CORS middleware not properly configured for preflight OPTIONS requests

### 2. Navigation API Failures
- **Symptom**: Category filtering fails when switching navigation
- **Impact**: Users cannot browse different post categories
- **Affected Routes**: All category-based post fetching

## Test Cases for TestSprite

### TC001: CORS Preflight Request Validation
**Priority**: CRITICAL
**Objective**: Verify CORS preflight OPTIONS requests are handled correctly
**API Endpoint**: `OPTIONS http://localhost:5000/api/posts`
**Test Steps**:
1. Send OPTIONS request with Origin header `http://localhost:3000`
2. Verify response includes required CORS headers:
   - `Access-Control-Allow-Origin: http://localhost:3000`
   - `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With`
   - `Access-Control-Allow-Credentials: true`
3. Verify response status is 200 or 204

**Expected Result**: All required CORS headers present in response

### TC002: Category Navigation API Calls
**Priority**: HIGH
**Objective**: Test API calls when switching between navigation categories
**Test Sequence**:
1. **Jobs Category**: `GET /api/posts?category=jobs`
2. **Ridesharing**: `GET /api/posts?category=ridesharing` 
3. **Accommodation**: `GET /api/posts?category=accommodation`
4. **Buy & Sell**: `GET /api/posts?category=buy-sell`
5. **Currency Exchange**: `GET /api/posts?category=currency-exchange`
6. **Pick & Drop**: `GET /api/posts?category=pick-drop`

**Headers to Include**:
```
Origin: http://localhost:3000
Content-Type: application/json
Authorization: Bearer <token>
```

**Expected Result**: All requests succeed with proper CORS headers

### TC003: Backend CORS Middleware Configuration
**Priority**: HIGH
**Objective**: Validate backend server CORS configuration
**File to Test**: `backend/server.js`
**Required Configuration**:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
```

### TC004: Frontend API Client CORS Handling
**Priority**: MEDIUM
**Objective**: Test frontend API client configuration
**File to Test**: `lib/api.ts`
**Test Points**:
- Base URL configuration points to correct backend
- Request headers properly set
- Error handling for CORS failures
- Credentials included in requests if needed

### TC005: Homepage Navigation Flow
**Priority**: HIGH
**Objective**: Test complete navigation flow on homepage
**Test Scenario**:
1. Load homepage at `http://localhost:3000`
2. Click "Jobs" in navigation → should fetch jobs posts
3. Click "Rides" in navigation → should fetch ridesharing posts
4. Click "Accommodation" → should fetch accommodation posts
5. Monitor browser console for CORS errors
6. Verify Network tab shows successful API calls

**Expected Result**: No CORS errors, successful navigation between categories

## Backend CORS Fix Requirements

### Current Issue
The backend likely has incomplete CORS configuration or is missing preflight request handling.

### Required CORS Headers for All Responses
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Environment Variables to Check
```env
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
PORT=5000
```

## Testing Commands for Manual Validation

### 1. Test CORS Preflight
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/posts
```

### 2. Test Actual API Call
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Content-Type: application/json" \
     -X GET \
     http://localhost:5000/api/posts?category=jobs
```

### 3. Check Backend Server Status
```bash
curl http://localhost:5000/health
```

## Files to Examine During Testing

1. **Backend Configuration**:
   - `backend/server.js` (CORS middleware setup)
   - `backend/routes/posts.js` (posts API routes)
   - `backend/package.json` (cors dependency)

2. **Frontend Configuration**:
   - `lib/api.ts` (API client setup)
   - `app/page.tsx` (homepage navigation)
   - `components/navigation.tsx` (navigation component)

3. **Environment Files**:
   - `.env.local` (frontend environment)
   - `backend/.env` (backend environment)

## Success Criteria

✅ **CORS Headers**: All API responses include proper CORS headers  
✅ **Preflight Requests**: OPTIONS requests handled correctly  
✅ **Navigation Flow**: Switching categories works without errors  
✅ **Browser Console**: No CORS-related errors displayed  
✅ **Network Requests**: All API calls return 200 status  
✅ **User Experience**: Smooth navigation between post categories  

## Test Execution Priority

### Phase 1 - Critical (Block Release)
- TC001: CORS Preflight Request Validation
- TC002: Category Navigation API Calls
- TC005: Homepage Navigation Flow

### Phase 2 - Important (Fix Before Deployment)
- TC003: Backend CORS Middleware Configuration
- TC004: Frontend API Client CORS Handling

## Common CORS Error Solutions

### 1. Missing CORS Middleware
```javascript
// Add to backend/server.js
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 2. Incorrect Origin Configuration
```javascript
// Ensure all possible frontend URLs are included
origin: [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean)
```

### 3. Missing Preflight Handler
```javascript
// Handle OPTIONS requests explicitly
app.options('*', cors());
```

## Test Data Requirements

- Valid JWT token for authenticated requests
- Test posts in different categories
- User account with proper permissions
- Backend server running and accessible

## Monitoring During Tests

1. **Browser Developer Tools**:
   - Console tab for CORS errors
   - Network tab for request/response headers
   - Application tab for localStorage tokens

2. **Backend Logs**:
   - Incoming request logs
   - CORS middleware logs
   - Error logs for failed requests

3. **Performance Metrics**:
   - API response times
   - Navigation switching speed
   - Overall user experience smoothness

This test plan should comprehensively validate and resolve the CORS issues affecting navigation between post categories in your UniConnect MVP application.
