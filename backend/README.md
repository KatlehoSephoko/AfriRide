# AfriRide Backend System

This is the production-ready backend architecture for the AfriRide e-hailing and mobility platform. 
Built with Node.js, TypeScript, PostgreSQL (PostGIS), Redis, and Prisma.

## Folder Structure (Modular Monolith)
\`\`\`
backend/
├── src/
│   ├── app.ts                 # Express application setup
│   ├── server.ts              # Entry point & connection initialization
│   ├── config/                # Environment, DB, Redis, and Logger configurations
│   ├── common/                # Shared utilities, interfaces, middleware, and errors
│   ├── modules/               # Domain-specific modules (e.g., users, rides, health)
│   └── routes/                # Global router composition
├── prisma/                    # Database schema and migrations
├── docker-compose.yml         # Infrastructure definitions
└── package.json
\`\`\`

## Quick Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   *(Adjust values if needed, default local config will work with Docker)*

3. **Start Infrastructure (PostgreSQL + PostGIS & Redis)**
   \`\`\`bash
   npm run docker:up
   \`\`\`

4. **Initialize Database Schema**
   \`\`\`bash
   npx prisma migrate dev --name init
   npm run prisma:generate
   \`\`\`

5. **Run the Application (Development Mode)**
   \`\`\`bash
   npm run dev
   \`\`\`

## Verification
- Health Check: \`curl http://localhost:8000/api/v1/health\`
- Readiness Check (DB & Redis tests): \`curl http://localhost:8000/api/v1/ready\`
