#!/bin/bash

# YTS by AI Demo Portal Setup Script
# This script sets up the demo portal with Redis and all dependencies

set -e

echo "🚀 Setting up YTS by AI Demo Portal..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Redis is installed and running
check_redis() {
    print_status "Checking Redis installation..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            print_success "Redis is running"
            return 0
        else
            print_warning "Redis is installed but not running"
            return 1
        fi
    else
        print_warning "Redis is not installed"
        return 1
    fi
}

# Install Redis based on OS
install_redis() {
    print_status "Installing Redis..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y redis-server
        elif command -v yum &> /dev/null; then
            sudo yum install -y redis
        else
            print_error "Unsupported Linux distribution"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install redis
        else
            print_error "Homebrew is required for macOS installation"
            exit 1
        fi
    else
        print_error "Unsupported operating system"
        exit 1
    fi
    
    print_success "Redis installed successfully"
}

# Start Redis
start_redis() {
    print_status "Starting Redis..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start redis
    fi
    
    # Wait for Redis to start
    sleep 2
    
    if redis-cli ping &> /dev/null; then
        print_success "Redis started successfully"
    else
        print_error "Failed to start Redis"
        exit 1
    fi
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    print_success "Backend dependencies installed"
    cd ..
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    cd frontend
    
    # Install npm dependencies
    npm install
    
    print_success "Frontend dependencies installed"
    cd ..
}

# Create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=YTS by AI

# CORS
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:3001","https://ytsbyai.vercel.app","chrome-extension://*"]

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=ytsbyai-summaries

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j

# Redis (for demo portal)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
STRIPE_PRICE_ID=price_1OqX2X2X2X2X2X2X2X2X2X2X

# Firebase
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_APP_ID=your_firebase_app_id_here

# JWT
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10

# Trial Settings
TRIAL_DAYS=30

# Demo Portal Settings
DEMO_ENABLED=true
DEMO_SUMMARY_LIMIT=3
DEMO_TRANSCRIPTION_LIMIT=2
DEMO_AUDIO_MAX_DURATION=30
DEMO_SESSION_DURATION=86400

# Environment
ENVIRONMENT=development
DEBUG=true
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
}

# Test demo portal
test_demo_portal() {
    print_status "Testing demo portal..."
    
    # Test Redis connection
    if redis-cli ping &> /dev/null; then
        print_success "Redis connection test passed"
    else
        print_error "Redis connection test failed"
        exit 1
    fi
    
    # Test backend health
    cd backend
    source venv/bin/activate
    
    # Start backend in background
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    # Test health endpoint
    if curl -s http://localhost:8000/health &> /dev/null; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # Kill backend
    kill $BACKEND_PID 2>/dev/null || true
    cd ..
}

# Main setup function
main() {
    print_status "Starting YTS by AI Demo Portal setup..."
    
    # Check and install Redis
    if ! check_redis; then
        install_redis
        start_redis
    fi
    
    # Install dependencies
    install_backend_deps
    install_frontend_deps
    
    # Create environment file
    create_env_file
    
    # Test setup
    test_demo_portal
    
    print_success "Demo portal setup completed successfully!"
    echo ""
    echo "🎉 Next steps:"
    echo "1. Update your .env file with your API keys"
    echo "2. Start the backend: cd backend && source venv/bin/activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
    echo "3. Start the frontend: cd frontend && npm run dev"
    echo "4. Visit http://localhost:3000/demo to try the demo portal"
    echo ""
    echo "📚 For more information, see DEMO_PORTAL_INTEGRATION.md"
}

# Run main function
main "$@" 