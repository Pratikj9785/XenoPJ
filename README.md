# Xeno - Multi-Tenant Shopify Data Ingestion & Insights Service

## Overview

Xeno is a multi-tenant SaaS platform that helps enterprise retailers onboard, integrate, and analyze their Shopify store data. The system provides real-time data ingestion, comprehensive analytics, and business insights through an intuitive dashboard.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Shopify       │    │   Xeno Backend   │    │   PostgreSQL    │
│   Stores        │◄──►│   (Node.js)      │◄──►│   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │ Webhooks              │ REST API
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Real-time     │    │   Xeno Frontend  │
│   Data Sync     │    │   (Next.js)      │
└─────────────────┘    └──────────────────┘
```

### Technology Stack

**Backend:**
- Node.js with Express.js
- Prisma ORM for database operations
- PostgreSQL for data storage
- JWT for authentication
- bcryptjs for password hashing
- node-cron for scheduled tasks

**Frontend:**
- Next.js 14 with React 18
- Recharts for data visualization
- Tailwind CSS for styling

**Database:**
- PostgreSQL with multi-tenant architecture
- Prisma for type-safe database operations

## Key Features

### 1. Multi-Tenant Architecture
- Tenant isolation using `tenantId` in all data models
- Secure data separation between different Shopify stores
- Shared infrastructure with isolated data

### 2. Data Ingestion
- **Real-time Webhooks**: Instant data sync when events occur in Shopify
- **Scheduled Sync**: Periodic full and delta synchronization
- **Manual Sync**: On-demand data ingestion capabilities

### 3. Authentication & Authorization
- JWT-based authentication system
- Email/password registration and login
- Tenant-scoped access control
- Shop association management

### 4. Analytics Dashboard
- Total customers, orders, and revenue metrics
- Orders by date with date range filtering
- Top customers by spend analysis
- Interactive charts and visualizations

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new tenant with shop
- `POST /api/auth/login` - User login
- `POST /api/auth/add-shop` - Add additional shop to tenant

### Data Management
- `POST /api/ingest/run` - Trigger manual data ingestion
- `GET /api/metrics/overview` - Get dashboard overview metrics
- `GET /api/metrics/orders-by-date` - Get orders data by date range
- `GET /api/metrics/top-customers` - Get top customers by spend

### Webhooks
- `POST /webhooks/:topic` - Receive Shopify webhook events
  - Supported topics: `customers/create`, `customers/update`, `orders/create`, `orders/update`, `products/create`, `products/update`

## Data Models

### Core Entities

**User**
```sql
- id: String (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- tenantId: String (Unique)
- createdAt: DateTime
- updatedAt: DateTime
```

**Shop**
```sql
- id: String (Primary Key)
- tenantId: String (Foreign Key)
- shopDomain: String
- shopName: String
- accessToken: String
- isActive: Boolean
- lastSyncAt: DateTime
```

**Customer**
```sql
- id: String (Primary Key)
- tenantId: String (Foreign Key)
- shopId: String (Foreign Key)
- shopifyId: BigInt
- email: String
- firstName: String
- lastName: String
- totalSpent: Float
- ordersCount: Int
```

**Order**
```sql
- id: String (Primary Key)
- tenantId: String (Foreign Key)
- shopId: String (Foreign Key)
- shopifyId: BigInt
- totalPrice: Float
- processedAt: DateTime
- createdAt: DateTime
```

**Product**
```sql
- id: String (Primary Key)
- tenantId: String (Foreign Key)
- shopId: String (Foreign Key)
- shopifyId: BigInt
- title: String
- status: String
- createdAt: DateTime
```

## Assumptions Made

### 1. Security Assumptions
- JWT tokens are sufficient for API authentication
- Password hashing with bcryptjs provides adequate security
- Webhook HMAC verification ensures data integrity

### 2. Performance Assumptions
- PostgreSQL can handle moderate multi-tenant workloads
- 15-minute delta sync intervals provide acceptable data freshness
- In-memory caching is not required for MVP

### 3. Business Logic Assumptions
- One user can manage multiple Shopify stores
- Tenant isolation at the application level is sufficient
- Manual sync triggers are acceptable for initial onboarding

### 4. Integration Assumptions
- Shopify webhook delivery is reliable
- Standard Shopify API rate limits are manageable
- Demo access tokens are sufficient for development

## Deployment Options

### Option 1: Railway (Recommended)
```bash
# Deploy using Railway CLI
railway login
railway link
railway up
```

### Option 2: Render
```bash
# Connect GitHub repository to Render
# Configure environment variables
# Deploy using render.yaml configuration
```

### Option 3: Docker
```bash
# Build and run with Docker
docker build -t xeno-backend ./backend
docker run -p 4000:4000 xeno-backend
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/xeno"
JWT_SECRET="your-jwt-secret-key"
WEBHOOK_SECRET="your-webhook-secret"
SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
NODE_ENV="production"
PORT=4000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Next Steps to Production

### 1. Security Enhancements
- Implement rate limiting
- Add request validation middleware
- Set up HTTPS/SSL certificates
- Implement API key management for Shopify

### 2. Scalability Improvements
- Add Redis for caching and session management
- Implement database connection pooling
- Add horizontal scaling capabilities
- Set up load balancing

### 3. Monitoring & Observability
- Implement logging with Winston or similar
- Add application performance monitoring (APM)
- Set up error tracking with Sentry
- Create health check endpoints

### 4. Data Management
- Implement data retention policies
- Add data backup and recovery procedures
- Set up database migrations in CI/CD
- Implement data archiving for old records

### 5. DevOps & CI/CD
- Set up automated testing pipeline
- Implement database migration automation
- Add staging environment
- Create deployment rollback procedures

### 6. Advanced Features
- Implement real-time notifications
- Add advanced analytics and reporting
- Create data export functionality
- Implement multi-region deployment

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repository-url>
cd xeno

# Install backend dependencies
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Install frontend dependencies
cd ../frontend
npm install

# Start development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Database Setup
```bash
# Create database
createdb xeno

# Run migrations
cd backend
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
