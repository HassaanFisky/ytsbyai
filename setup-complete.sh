#!/bin/bash

# YTS by AI - Complete Setup Script
# This script sets up the entire YTS by AI project from scratch

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python 3.8+ is required but not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js 18+ is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    # Check Git
    if ! command_exists git; then
        print_error "Git is required but not installed"
        exit 1
    fi
    
    # Check Docker (optional)
    if ! command_exists docker; then
        print_warning "Docker not found - some features may not work"
    fi
    
    print_success "System requirements check passed"
}

# Function to setup Python environment
setup_python() {
    print_status "Setting up Python environment..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Created Python virtual environment"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install requirements
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_success "Installed Python dependencies"
    else
        print_error "requirements.txt not found"
        exit 1
    fi
    
    cd ..
}

# Function to setup Node.js environment
setup_nodejs() {
    print_status "Setting up Node.js environment..."
    
    cd frontend
    
    # Install dependencies
    if [ -f "package.json" ]; then
        npm install
        print_success "Installed Node.js dependencies"
    else
        print_error "package.json not found"
        exit 1
    fi
    
    cd ..
}

# Function to setup mobile environment
setup_mobile() {
    print_status "Setting up mobile environment..."
    
    cd mobile
    
    # Check if Expo CLI is installed
    if ! command_exists expo; then
        print_status "Installing Expo CLI..."
        npm install -g @expo/cli
    fi
    
    # Install dependencies
    if [ -f "package.json" ]; then
        npm install
        print_success "Installed mobile dependencies"
    else
        print_warning "Mobile package.json not found - skipping mobile setup"
    fi
    
    cd ..
}

# Function to setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env-template.txt" ]; then
            cp env-template.txt .env
            print_success "Created .env file from template"
            print_warning "Please edit .env file with your actual API keys"
        else
            print_error "env-template.txt not found"
            exit 1
        fi
    else
        print_warning ".env file already exists - skipping"
    fi
}

# Function to setup databases
setup_databases() {
    print_status "Setting up databases..."
    
    # Check if Docker is available
    if command_exists docker; then
        print_status "Starting Redis with Docker..."
        docker run -d --name ytsbyai-redis -p 6379:6379 redis:alpine || true
        
        print_status "Starting Neo4j with Docker..."
        docker run -d --name ytsbyai-neo4j -p 7474:7474 -p 7687:7687 \
            -e NEO4J_AUTH=neo4j/password \
            -e NEO4J_PLUGINS='["apoc"]' \
            neo4j:latest || true
        
        print_success "Databases started with Docker"
    else
        print_warning "Docker not available - please start Redis and Neo4j manually"
        print_status "Redis should be running on localhost:6379"
        print_status "Neo4j should be running on localhost:7687"
    fi
}

# Function to setup Chrome extension
setup_chrome_extension() {
    print_status "Setting up Chrome extension..."
    
    cd chrome-ext
    
    if [ -f "manifest.json" ]; then
        print_success "Chrome extension files found"
        print_status "To install:"
        print_status "1. Open Chrome and go to chrome://extensions/"
        print_status "2. Enable 'Developer mode'"
        print_status "3. Click 'Load unpacked' and select the chrome-ext folder"
    else
        print_warning "Chrome extension files not found"
    fi
    
    cd ..
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    cd backend
    if [ -d "tests" ]; then
        source venv/bin/activate
        python -m pytest tests/ -v || print_warning "Some backend tests failed"
    else
        print_warning "Backend tests directory not found"
    fi
    cd ..
    
    # Frontend tests
    cd frontend
    if [ -f "package.json" ]; then
        npm run test || print_warning "Some frontend tests failed"
    fi
    cd ..
}

# Function to build applications
build_applications() {
    print_status "Building applications..."
    
    # Build frontend
    cd frontend
    if [ -f "package.json" ]; then
        npm run build
        print_success "Frontend built successfully"
    fi
    cd ..
    
    # Build mobile (if Expo is available)
    cd mobile
    if command_exists expo && [ -f "package.json" ]; then
        expo build:web
        print_success "Mobile web build completed"
    fi
    cd ..
}

# Function to create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Create superDev.sh
    cat > superDev.sh << 'EOF'
#!/bin/bash
# YTS by AI - Development Startup Script

echo "🚀 Starting YTS by AI development environment..."

# Start backend
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start mobile (optional)
if command -v expo >/dev/null 2>&1; then
    cd mobile
    expo start --web &
    MOBILE_PID=$!
    cd ..
fi

echo "✅ Development servers started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "Admin: http://localhost:3000/admin/analytics"
echo "Demo: http://localhost:3000/demo"

# Wait for interrupt
trap "echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID $MOBILE_PID 2>/dev/null; exit" INT
wait
EOF

    chmod +x superDev.sh
    print_success "Created superDev.sh startup script"
    
    # Create test script
    cat > test-setup.sh << 'EOF'
#!/bin/bash
# YTS by AI - Test Setup Script

echo "🧪 Testing YTS by AI setup..."

# Test backend
echo "Testing backend..."
cd backend
source venv/bin/activate
python -c "import fastapi; print('✅ FastAPI imported successfully')"
python -c "from app.core.config import settings; print('✅ Settings loaded successfully')"
cd ..

# Test frontend
echo "Testing frontend..."
cd frontend
npm run type-check
echo "✅ Frontend type check passed"
cd ..

# Test environment
if [ -f ".env" ]; then
    echo "✅ Environment file exists"
else
    echo "❌ Environment file missing"
fi

echo "🎉 Setup test completed!"
EOF

    chmod +x test-setup.sh
    print_success "Created test-setup.sh script"
}

# Function to display final instructions
display_instructions() {
    echo ""
    echo "🎉 YTS by AI setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env file with your API keys"
    echo "2. Start development servers: ./superDev.sh"
    echo "3. Test the setup: ./test-setup.sh"
    echo "4. Access the application: http://localhost:3000"
    echo ""
    echo "🔧 Available commands:"
    echo "  ./superDev.sh     - Start development servers"
    echo "  ./test-setup.sh   - Test the setup"
    echo "  ./deploy.sh       - Deploy to production"
    echo ""
    echo "📚 Documentation:"
    echo "  README.md         - Main documentation"
    echo "  ADMIN_DASHBOARD.md - Admin features"
    echo "  VOICE_AI_INTEGRATION.md - Voice features"
    echo ""
    echo "🚀 Happy coding!"
}

# Main setup function
main() {
    echo "🚀 YTS by AI - Complete Setup Script"
    echo "====================================="
    echo ""
    
    # Check requirements
    check_requirements
    
    # Setup environments
    setup_python
    setup_nodejs
    setup_mobile
    
    # Setup configuration
    setup_env
    setup_databases
    setup_chrome_extension
    
    # Create scripts
    create_startup_scripts
    
    # Run tests (optional)
    if [ "$1" = "--test" ]; then
        run_tests
    fi
    
    # Build applications (optional)
    if [ "$1" = "--build" ]; then
        build_applications
    fi
    
    # Display instructions
    display_instructions
}

# Run main function with arguments
main "$@" 