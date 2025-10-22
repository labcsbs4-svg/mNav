Local server for NavApp (Prisma + SQLite)

Setup

1. Install dependencies

   npm install

2. Initialize Prisma and run migration (creates SQLite `dev.db`):

   npx prisma migrate dev --name init

3. Start server in dev mode

   npm run dev

The server listens on http://localhost:4000 and exposes endpoints:
- GET /api/locations
- POST /api/locations
- DELETE /api/locations/:id
- GET /api/roads
- POST /api/roads
- DELETE /api/roads/:id
