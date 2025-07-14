#!/bin/bash

# YTS by AI - Super Development Script
# Professional SaaS Development Environment

echo "🚀 YTS by AI - Super Development Mode"
echo "Starting all development servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is in use. Killing existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
    fi
}

# Phase 1: Frontend Setup
print_status "Phase 1: Setting up Frontend..."
cd frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Kill any process on port 3000 (Next.js default)
kill_port 3000

# Start frontend in background
print_status "Starting frontend development server..."
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
print_success "Frontend started on http://localhost:3000"

# Phase 2: Backend Setup
print_status "Phase 2: Setting up Backend..."
cd ../backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
print_status "Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Kill any process on port 8000 (FastAPI default)
kill_port 8000

# Start backend in background
print_status "Starting backend development server..."
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
print_success "Backend started on http://localhost:8000"

# Phase 3: Mobile Setup
print_status "Phase 3: Setting up Mobile..."
cd ../mobile

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing mobile dependencies..."
    npm install
fi

# Kill any process on port 8081 (Expo default)
kill_port 8081

# Start mobile in background
print_status "Starting mobile development server..."
nohup npx expo start > ../logs/mobile.log 2>&1 &
MOBILE_PID=$!
echo $MOBILE_PID > ../logs/mobile.pid
print_success "Mobile started on exp://127.0.0.1:8081"

# Create logs directory if it doesn't exist
mkdir -p ../logs

# Return to root directory
cd ..

# Display status
echo ""
print_success "🎉 All development servers are running!"
echo ""
echo -e "${CYAN}📱 Frontend: http://localhost:3000${NC}"
echo -e "${CYAN}🔧 Backend:  http://localhost:8000${NC}"
echo -e "${CYAN}📱 Mobile:   exp://127.0.0.1:8081${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   - Frontend: Open in browser for web development"
echo -e "   - Backend:  API documentation at http://localhost:8000/docs"
echo -e "   - Mobile:   Scan QR code with Expo Go app"
echo ""
echo -e "${YELLOW}📊 Logs:${NC}"
echo -e "   - Frontend: tail -f logs/frontend.log"
echo -e "   - Backend:  tail -f logs/backend.log"
echo -e "   - Mobile:   tail -f logs/mobile.log"
echo ""
echo -e "${RED}🛑 To stop all servers: ./stopDev.sh${NC}"
echo ""

# Save PIDs for easy stopping
echo "FRONTEND_PID=$FRONTEND_PID" > logs/pids.env
echo "BACKEND_PID=$BACKEND_PID" >> logs/pids.env
echo "MOBILE_PID=$MOBILE_PID" >> logs/pids.env

print_success "Development environment ready! 🚀" 