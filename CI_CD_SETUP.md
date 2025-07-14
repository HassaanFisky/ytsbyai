# CI/CD Pipeline Setup for YTS by AI

## Overview

Complete CI/CD automation with GitHub Actions, Docker, and Render deployment for the YTS by AI application.

## Architecture

### Components
- **GitHub Actions**: CI/CD orchestration
- **Docker**: Containerization for frontend and backend
- **Render**: Production deployment platform
- **Nginx**: Reverse proxy and SSL termination
- **Security Scanning**: Automated vulnerability detection

## Quick Start

### 1. GitHub Secrets Setup

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
# Docker Hub
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password

# Render API
RENDER_API_KEY=your_render_api_key
RENDER_BACKEND_SERVICE_ID=your_backend_service_id
RENDER_FRONTEND_SERVICE_ID=your_frontend_service_id

# Application URLs
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com

# Database
NEO4J_URI=bolt://your-neo4j-instance:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password

# AI Services
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_pinecone_env
PINECONE_INDEX_NAME=yts-summaries
OPENAI_API_KEY=your_openai_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Frontend Environment
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Render Setup

#### Backend Service
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from secrets

#### Frontend Service
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd frontend && npm ci && npm run build`
4. Set start command: `cd frontend && npm start`
5. Add environment variables from secrets

### 3. Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up --build
```

## Pipeline Workflow

### 1. Test Stage
- **Lint**: Python (black, flake8) and TypeScript (ESLint)
- **Test**: pytest for backend, Jest for frontend
- **Coverage**: Code coverage reporting
- **Security**: Dependency vulnerability scanning

### 2. Build Stage
- **Docker Build**: Multi-stage builds for optimization
- **Image Push**: Push to Docker Hub with tags
- **Cache**: GitHub Actions cache for faster builds

### 3. Deploy Stage
- **Backend**: Deploy to Render backend service
- **Frontend**: Deploy to Render frontend service
- **Health Check**: Verify deployment success
- **Rollback**: Automatic rollback on failure

### 4. Security Stage
- **Container Scan**: Trivy vulnerability scanning
- **Code Analysis**: CodeQL security analysis
- **Secret Scan**: TruffleHog for exposed secrets
- **License Check**: Dependency license compliance

## Docker Configuration

### Backend Dockerfile
```dockerfile
# Multi-stage build for optimization
FROM python:3.11-slim AS builder
# ... build dependencies

FROM python:3.11-slim AS runtime
# ... runtime configuration
```

### Frontend Dockerfile
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
# ... build stage

FROM node:18-alpine AS runtime
# ... runtime stage
```

### Docker Compose
```yaml
services:
  neo4j:
    image: neo4j:5.15-community
    # ... Neo4j configuration
  
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    # ... Backend configuration
  
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    # ... Frontend configuration
```

## Security Features

### Automated Scanning
- **Dependencies**: Safety (Python) and npm audit (Node.js)
- **Containers**: Trivy vulnerability scanning
- **Code**: CodeQL static analysis
- **Secrets**: TruffleHog secret detection

### Security Headers
```nginx
# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Rate Limiting
```nginx
# API rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;
```

## Monitoring & Health Checks

### Health Endpoints
- **Backend**: `GET /health`
- **Frontend**: `GET /api/health`

### Docker Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
```

### GitHub Actions Health Check
```yaml
- name: Check Backend Health
  run: |
    curl -f ${{ secrets.BACKEND_URL }}/health || exit 1
```

## Deployment Strategies

### Blue-Green Deployment
1. Deploy to staging environment
2. Run health checks and tests
3. Switch traffic to new version
4. Monitor for issues
5. Rollback if necessary

### Canary Deployment
1. Deploy to small percentage of users
2. Monitor metrics and errors
3. Gradually increase traffic
4. Full deployment if successful

### Rollback Strategy
```yaml
rollback:
  needs: [deploy-backend, deploy-frontend, health-check]
  if: failure()
  steps:
    - name: Rollback Backend
      run: |
        curl -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_BACKEND_SERVICE_ID }}/deploys"
```

## Environment Management

### Development
```bash
# Local development with Docker Compose
docker-compose up -d

# Environment variables
cp .env.example .env
# Edit .env with local values
```

### Staging
```bash
# Staging deployment
git push origin develop
# Automatic deployment to staging environment
```

### Production
```bash
# Production deployment
git push origin main
# Automatic deployment to production environment
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Docker build logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild without cache
docker-compose build --no-cache
```

#### Deployment Failures
```bash
# Check Render logs
# Go to Render dashboard > Services > Logs

# Check GitHub Actions logs
# Go to GitHub > Actions > Workflow runs
```

#### Health Check Failures
```bash
# Test health endpoints manually
curl -f https://your-backend.onrender.com/health
curl -f https://your-frontend.onrender.com/api/health
```

### Debug Commands
```bash
# Check container status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec backend python -c "import app; print('Backend OK')"
docker-compose exec frontend npm run build
```

## Performance Optimization

### Docker Optimizations
- Multi-stage builds
- Layer caching
- Minimal base images
- Health checks

### Nginx Optimizations
- Gzip compression
- Static file caching
- Connection pooling
- SSL optimization

### GitHub Actions Optimizations
- Dependency caching
- Build caching
- Parallel jobs
- Conditional execution

## Security Best Practices

### Secrets Management
- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use least privilege principle

### Container Security
- Non-root users
- Minimal base images
- Regular security updates
- Vulnerability scanning

### Network Security
- HTTPS everywhere
- Rate limiting
- Input validation
- SQL injection prevention

## Compliance

### GDPR Compliance
- Data encryption at rest and in transit
- User consent management
- Data retention policies
- Right to be forgotten

### SOC 2 Compliance
- Access controls
- Audit logging
- Incident response
- Security monitoring

## Cost Optimization

### Render Optimization
- Use appropriate plan sizes
- Monitor resource usage
- Implement auto-scaling
- Optimize build times

### Docker Optimization
- Multi-stage builds
- Layer caching
- Minimal images
- Efficient base images

## Monitoring & Alerting

### Metrics to Monitor
- Response times
- Error rates
- Resource usage
- Security events

### Alerting Setup
- GitHub Actions notifications
- Render deployment alerts
- Security vulnerability alerts
- Performance degradation alerts

## Backup & Recovery

### Database Backups
```bash
# Neo4j backup
docker-compose exec neo4j neo4j-admin backup --database=neo4j --to=/backups/

# Restore from backup
docker-compose exec neo4j neo4j-admin restore --database=neo4j --from=/backups/
```

### Application Backups
- GitHub repository as code backup
- Docker images as application backup
- Environment configuration backup
- Database backup automation

## Future Enhancements

### Planned Features
- Kubernetes deployment
- Multi-region deployment
- Advanced monitoring (Prometheus/Grafana)
- Automated performance testing
- Chaos engineering
- Advanced security scanning

### Scalability Improvements
- Horizontal scaling
- Load balancing
- CDN integration
- Database clustering
- Microservices architecture

This CI/CD setup provides a production-ready, secure, and scalable deployment pipeline for the YTS by AI application. 