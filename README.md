# Use Case Library

A production-grade web application for managing and exploring digital transformation use cases. Built with Node.js, Express, Prisma (PostgreSQL), React, and Tailwind CSS following OMMAX corporate design guidelines.

## Architecture

```
use-case-library/
├── backend/                 # Node.js + Express API
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── src/
│   │   ├── server.ts        # Express server with API endpoints
│   │   └── importScript.ts  # CSV data import script
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── App.tsx          # Main application
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Tailwind styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **npm** or **yarn**

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

Create a PostgreSQL database and configure the connection:

```bash
# In the backend directory, create a .env file
cd backend
```

Create a `.env` file with the following content:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/use_case_library?schema=public"
PORT=3001
NODE_ENV=development
API_KEY=your-secure-api-key-here
```

Replace `username`, `password`, and database details with your PostgreSQL credentials.

### 3. Initialize Database Schema

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database (development)
npm run prisma:push

# Or run migrations (production)
npm run prisma:migrate
```

### 4. Import Data from CSV (Optional)

To import use cases from a CSV file:

1. Place your `Use_Case_Library.csv` file in the `backend/` directory
2. Ensure the CSV has the following columns:
   - `Use Case` (required)
   - `Concept description` (required)
   - `Concrete implementation` (optional)
   - `Benefit` (optional)
   - `Industry` (optional)
   - `Department` (optional)
   - `Value Chain Step` (optional)
   - `URL` (optional)

3. Run the import script:

```bash
cd backend
npm run import
```

The script will:
- Skip rows with empty required fields
- Check for duplicates before inserting
- Log a detailed summary of the import process

### 5. Start Development Servers

**Backend:**
```bash
cd backend
npm run dev
```
The API will be available at `http://localhost:3001`

**Frontend:**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:5173`

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/use-cases` | List use cases (paginated) |
| `GET` | `/api/use-cases/:id` | Get single use case |
| `GET` | `/api/use-cases/filters` | Get available filter options |

### Protected Endpoints (require `x-api-key` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/use-cases` | Create new use case |

### Query Parameters for `/api/use-cases`

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `industry` | string | Filter by industry |
| `valueChainStep` | string | Filter by value chain step |
| `department` | string | Filter by department |
| `search` | string | Full-text search |

### Example Requests

```bash
# Get paginated use cases
curl http://localhost:3001/api/use-cases?page=1&limit=10

# Filter by industry
curl http://localhost:3001/api/use-cases?industry=Manufacturing

# Create new use case (protected)
curl -X POST http://localhost:3001/api/use-cases \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secure-api-key-here" \
  -d '{
    "useCase": "Predictive Maintenance",
    "conceptDescription": "Use ML to predict equipment failures..."
  }'
```

## Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Security:** Helmet, CORS, API Key authentication
- **Validation:** express-validator

### Frontend
- **Build Tool:** Vite
- **Framework:** React 18
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6

## OMMAX Corporate Design

The frontend strictly follows OMMAX brand guidelines:

- **Colors:**
  - Primary: OMMAX Red `#E30613`
  - Text: Black `#000000` / Dark Gray `#111111`
  - Backgrounds: White `#FFFFFF` / Light Gray `#F9F9F9`

- **Typography:** Inter font family, bold headings

- **Shapes:** Sharp edges (0-2px border-radius), clean borders

- **Layout:** Professional, grid-based, spacious

## Error Handling

The application implements comprehensive error handling:

- Centralized error middleware with JSON responses
- Prisma-specific error handling (duplicates, not found)
- Form validation with user-friendly messages
- Loading states and error banners in the UI

## License

Proprietary - OMMAX Digital Solutions
