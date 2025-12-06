# Quick Start Guide

Get the URL Shortener Platform running in 5 minutes!

## Prerequisites Checklist
- [ ] Node.js v16+ installed
- [ ] PostgreSQL v12+ installed and running
- [ ] Git (optional, for cloning)

## Setup Commands

### 1. Database Setup (2 minutes)
```bash
# Create database
psql -U postgres
CREATE DATABASE url_shortener;
\q

# Run schema
cd server
psql -U postgres -d url_shortener -f schema.sql
```

### 2. Backend Setup (1 minute)
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your PostgreSQL password
npm run dev
```

Expected output: ✓ Server running on http://localhost:5000

### 3. Frontend Setup (1 minute)
```bash
# Open new terminal
cd client
npm install
npm run dev
```

Expected output: ➜ Local: http://localhost:5173/

## First Use

1. Open http://localhost:5173
2. Click "Sign up"
3. Register with email/password
4. Create your first link
5. Test the short URL!

## Common Issues

**Can't connect to database?**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"
```

**Port 5000 already in use?**
- Change PORT in server/.env to 5001
- Update CLIENT_URL and restart both servers

**Frontend can't reach backend?**
- Ensure backend shows "Server running" message
- Check http://localhost:5000/health in browser

## Test Everything Works

```bash
# Test backend health
curl http://localhost:5000/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## What's Next?

- Read the full README.md for detailed documentation
- Check out the API endpoints section
- Explore the analytics dashboard
- Customize the Tailwind styling

## File Structure at a Glance

```
url-shortener/
├── server/              # Backend API
│   ├── src/
│   │   ├── controllers/ # Business logic
│   │   ├── routes/      # API endpoints
│   │   └── middleware/  # Auth & rate limiting
│   ├── schema.sql       # Database schema
│   └── .env             # Your config (create this!)
│
└── client/              # Frontend React app
    ├── src/
    │   ├── pages/       # Login, Dashboard, etc.
    │   └── components/  # Reusable UI components
    └── tailwind.config.js
```

## Development Workflow

1. **Backend changes**: Server auto-restarts (nodemon)
2. **Frontend changes**: Browser auto-refreshes (Vite HMR)
3. **Database changes**: Edit schema.sql and re-run with psql
4. **New dependencies**: npm install in respective folder

Enjoy building with the URL Shortener Platform!
