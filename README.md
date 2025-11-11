# 🌍 TravelPlanner

### A full-stack travel planning web application built with Next.js and Python

#### https://travel-planner-sigma-sable.vercel.app



---

#### A full-stack travel planning web application built with Next.js and Python.

## Local Development Setup

### 1. Clone the Repository & Navigate to it
```
git clone https://github.com/TravelPlanner467/TravelPlanner.git
cd TravelPlanner
```

### 2. Install Dependencies
```
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
User Database (NeonDB)
DATABASE_URL=“DATABASE_URL_HERE”

BetterAuth Configuration
BETTER_AUTH_SECRET=“AUTH_SECRET_HERE”
BETTER_AUTH_URL=http://localhost:3000

# Server Action URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/py

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="API_KEY_HERE"
```

> **Note:** Contact the project maintainers for the actual configuration values.

### 4. Generate Prisma Client
```
pnpm prisma generate
```

### 6. Start Development Server
```
pnpm run dev
```

### The application will be available at **http://localhost:3000**

---

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js, TypeScript, React |
| **Backend** | Python (Flask), Next.js API Routes |
| **Database** | PostgreSQL (NeonDB) |
| **Authentication** | BetterAuth |
| **ORM** | Prisma |
| **Maps** | Google Maps API |


---

## Project Structure

- `/api/` - Flask API Endpoints
- `/app/(main pages)/` - Next.js application routes and pages
- `/app/(ui)/` - React Components
- `/lib` - Server Actions, Types, & Configurations
