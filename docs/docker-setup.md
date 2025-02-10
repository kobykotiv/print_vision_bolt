# Docker Infrastructure Setup

## Overview

The development environment consists of:
1. Next.js application
2. Local Supabase instance
3. Redis for caching
4. Adminer for database management

## Components

### Next.js Application
- Node.js 18 Alpine base
- Multi-stage build for optimization
- Development and production configurations
- Environment variable management
- Hot reloading for development

### Supabase
- Local self-hosted instance
- PostgreSQL database
- PostgREST API
- GoTrue auth service
- Storage service
- Edge Functions support

### Redis
- Alpine-based Redis instance
- Persistence enabled
- Cache management for rate limiting and session storage

### Adminer
- Database management interface
- Connected to Supabase PostgreSQL
- Easy access to database operations

## Docker Compose Configuration

### Development Setup
```yaml
version: '3.8'

services:
  # Next.js Application
  app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - supabase
      - redis

  # Supabase
  supabase:
    image: supabase/supabase-docker:latest
    ports:
      - "54321:54321"
      - "54322:54322"
    environment:
      POSTGRES_PASSWORD: your-super-secret-password
      JWT_SECRET: your-super-secret-jwt-token
      DASHBOARD_USERNAME: admin
      DASHBOARD_PASSWORD: admin
    volumes:
      - supabase-data:/var/lib/postgresql/data
      - ./supabase/migrations:/supabase/migrations

  # Redis
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  # Adminer
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: supabase
      ADMINER_DESIGN: dracula

volumes:
  supabase-data:
  redis-data:
```

### Production Setup
- Remove development-specific services (Adminer)
- Use production build target
- Add health checks
- Configure logging
- Set up proper networking

## Dockerfile Configuration

```dockerfile
# Base stage
FROM node:18-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["pnpm", "dev"]

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## Admin Features

### Database Management
- Access through Adminer interface
- Direct SQL execution
- Table management
- Backup and restore

### User Management
- View and manage user accounts
- Role assignments
- Subscription management
- Usage monitoring

### System Monitoring
- Container health status
- Resource usage
- Error logs
- Performance metrics

## Development Workflow

1. Start environment:
   ```bash
   docker-compose up -d
   ```

2. Access services:
   - Next.js app: http://localhost:3000
   - Supabase Studio: http://localhost:54321
   - Adminer: http://localhost:8080
   - Redis Commander: http://localhost:8081

3. Database migrations:
   ```bash
   docker-compose exec supabase supabase db reset
   ```

4. View logs:
   ```bash
   docker-compose logs -f [service]
   ```

## Security Considerations

1. Environment Variables
   - Use .env files for development
   - Use secrets management in production
   - Never commit sensitive data

2. Network Security
   - Internal network for services
   - Expose only necessary ports
   - Use SSL/TLS in production

3. Access Control
   - Strong admin passwords
   - Role-based access
   - API key management

## Monitoring and Maintenance

1. Health Checks
   - Container status
   - Service availability
   - Database connections
   - Cache performance

2. Backups
   - Automated database backups
   - Volume persistence
   - Backup rotation

3. Updates
   - Regular security updates
   - Version management
   - Dependency updates

## Troubleshooting

1. Container Issues
   ```bash
   # Check container status
   docker-compose ps
   
   # View logs
   docker-compose logs -f service_name
   
   # Restart service
   docker-compose restart service_name
   ```

2. Database Issues
   ```bash
   # Access PostgreSQL
   docker-compose exec supabase psql
   
   # Reset database
   docker-compose exec supabase supabase db reset
   ```

3. Cache Issues
   ```bash
   # Access Redis CLI
   docker-compose exec redis redis-cli
   
   # Clear cache
   docker-compose exec redis redis-cli FLUSHALL