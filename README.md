# URL Shortener Platform

A production-ready URL shortener platform built with React, Node.js, Express, and PostgreSQL. Features include user authentication, link management, analytics tracking, and rate limiting.

## Tech Stack

- **Frontend**: React + Tailwind CSS v3 (Vite)
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **API Style**: REST API

## Features

### 1. User Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 2. Link Management
- Create short links with auto-generated or custom slugs
- Set optional expiration dates
- Edit existing links (URL, expiration, active status)
- Soft delete links
- View all links belonging to the authenticated user

### 3. Analytics
- Track click events with:
  - Timestamp
  - Referrer
  - User-Agent (device detection)
  - IP address
- View detailed analytics:
  - Total clicks
  - Clicks over time (daily breakdown)
  - Top referrers
  - Device breakdown (desktop/mobile/tablet)

### 4. Public Redirect
- Fast redirect from short URLs to original URLs
- Automatic click tracking
- Handle expired and inactive links
- Friendly error pages

### 5. Rate Limiting
- In-memory rate limiting for link creation and authentication
- Configurable windows and limits
- Protection against abuse

## Project Structure

```
url-shortener/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client configuration
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Tailwind CSS imports
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── server/                 # Node.js backend
    ├── src/
    │   ├── config/        # Database configuration
    │   ├── controllers/   # Route controllers
    │   ├── middleware/    # Auth & rate limiting
    │   ├── routes/        # API routes
    │   ├── utils/         # Helper functions
    │   ├── app.js         # Express app
    │   └── index.js       # Server entry point
    ├── schema.sql         # Database schema
    ├── package.json
    └── .env.example       # Environment variables template
```

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

Verify installations:
```bash
node --version
npm --version
psql --version
```

## How to Run Locally

### Step 1: Database Setup

1. **Start PostgreSQL** (if not already running)

2. **Create the database**:
   ```bash
   # Connect to PostgreSQL (Windows with psql in PATH)
   psql -U postgres

   # Or use pgAdmin GUI to create database
   ```

   In the PostgreSQL prompt:
   ```sql
   CREATE DATABASE url_shortener;
   \q
   ```

3. **Run the schema file**:
   ```bash
   # Navigate to the server directory
   cd server

   # Run the schema (replace 'postgres' with your PostgreSQL username if different)
   psql -U postgres -d url_shortener -f schema.sql
   ```

   You should see output confirming tables were created:
   ```
   DROP TABLE
   CREATE TABLE
   CREATE INDEX
   ...
   ```

### Step 2: Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   # Copy the example env file
   cp .env.example .env

   # Or on Windows:
   copy .env.example .env
   ```

4. **Edit `.env` file** with your settings:
   ```env
   PORT=5000
   DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/url_shortener
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   BASE_URL=http://localhost:5000
   ```

   **Important**: Replace `YOUR_PASSWORD` with your PostgreSQL password.

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ✓ Database connection successful
   ✓ Server running on http://localhost:5000
   ✓ Environment: development
   ```

### Step 3: Frontend Setup

1. **Open a new terminal** and navigate to client directory:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

### Step 4: Access the Application

1. **Open your browser** and navigate to: `http://localhost:5173`

2. **Register a new account**:
   - Click "Sign up"
   - Enter email and password (min 6 characters)
   - Click "Sign Up"

3. **Create your first short link**:
   - Click "Create New Link"
   - Enter an original URL (e.g., `https://www.google.com`)
   - Optionally add a custom slug (e.g., `google`)
   - Optionally set an expiration date
   - Click "Create Link"

4. **Test the redirect**:
   - Copy the short URL from the dashboard
   - Open it in a new tab (e.g., `http://localhost:5000/google`)
   - You should be redirected to the original URL
   - The click will be tracked

5. **View analytics**:
   - Click "Analytics" button for any link
   - See total clicks, referrers, device breakdown, and clicks over time

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Links (All Protected)
- `POST /api/links` - Create new short link
- `GET /api/links` - Get all links for current user
- `GET /api/links/:id` - Get single link by ID
- `PATCH /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete (deactivate) link

### Analytics (Protected)
- `GET /api/links/:id/analytics?from=&to=` - Get analytics for a link

### Public
- `GET /:shortCode` - Redirect to original URL
- `GET /health` - Health check endpoint

## Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| DATABASE_URL | PostgreSQL connection string | postgres://user:pass@localhost:5432/url_shortener |
| JWT_SECRET | Secret key for JWT signing | your-secret-key |
| JWT_EXPIRES_IN | JWT token expiration | 7d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |
| BASE_URL | Base URL for short links | http://localhost:5000 |

## Database Schema

### Users Table
- `id` - Serial primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Links Table
- `id` - Serial primary key
- `user_id` - Foreign key to users
- `original_url` - The destination URL
- `short_code` - Unique short code
- `expires_at` - Optional expiration timestamp
- `is_active` - Boolean active status
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Clicks Table
- `id` - Serial primary key
- `link_id` - Foreign key to links
- `clicked_at` - Timestamp
- `referrer` - HTTP referrer
- `user_agent` - Browser user agent
- `ip_address` - Client IP address

## Rate Limiting

Rate limits are enforced on:
- **Link Creation**: 10 requests per minute per user/IP
- **Authentication**: 5 requests per 15 minutes per IP

When rate limit is exceeded, API returns HTTP 429 with:
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

## Building for Production

### Backend
```bash
cd server
npm start
```

### Frontend
```bash
cd client
npm run build
npm run preview
```

The build output will be in `client/dist/`. Deploy this to a static hosting service and point to your backend API.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Check PostgreSQL username and password
- Ensure database `url_shortener` exists

### Port Already in Use
- Change `PORT` in server `.env` file
- Or kill the process using the port

### CORS Errors
- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
- Ensure backend is running before starting frontend

### JWT Token Issues
- Clear browser localStorage
- Logout and login again
- Ensure `JWT_SECRET` is set in `.env`

## Security Considerations

This is a development setup. For production:

1. **Use HTTPS** for all connections
2. **Set strong JWT_SECRET** (use a secure random string)
3. **Use environment-specific URLs** (not localhost)
4. **Add request logging** and monitoring
5. **Implement Redis** for rate limiting (instead of in-memory)
6. **Add input sanitization** for XSS prevention
7. **Set up database backups**
8. **Use connection pooling** for database
9. **Add CSRF protection** for state-changing operations
10. **Implement proper error logging** (e.g., Sentry)

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
