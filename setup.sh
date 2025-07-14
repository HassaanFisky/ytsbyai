#!/bin/bash

# YTS by AI - Full Stack Setup Script
echo "🚀 Setting up YTS by AI - Full Stack AI SaaS"

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3.10+ is required but not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 18+ is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    print_success "System requirements met"
}

# Setup Backend
setup_backend() {
    print_status "Setting up Backend (FastAPI)..."
    cd backend
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install dependencies
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cp ../.env.example .env
        print_warning "Created .env file. Please update with your API keys."
    fi
    
    cd ..
    print_success "Backend setup complete"
}

# Setup Frontend
setup_frontend() {
    print_status "Setting up Frontend (Next.js)..."
    cd frontend
    
    # Install dependencies
    npm install
    
    # Create .env.local file if it doesn't exist
    if [ ! -f .env.local ]; then
        cp ../.env.example .env.local
        print_warning "Created .env.local file. Please update with your API keys."
    fi
    
    cd ..
    print_success "Frontend setup complete"
}

# Setup Mobile
setup_mobile() {
    print_status "Setting up Mobile App (Expo)..."
    cd mobile
    
    # Install dependencies
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cp ../.env.example .env
        print_warning "Created .env file. Please update with your API keys."
    fi
    
    cd ..
    print_success "Mobile app setup complete"
}

# Setup Chrome Extension
setup_chrome_extension() {
    print_status "Setting up Chrome Extension..."
    cd chrome-ext
    
    # Create icons directory if it doesn't exist
    mkdir -p icons
    
    # Create placeholder icon files
    touch icons/icon16.png
    touch icons/icon32.png
    touch icons/icon48.png
    touch icons/icon128.png
    
    print_warning "Chrome extension icons need to be created manually"
    print_success "Chrome extension setup complete"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Backend dev script
    cat > backend/dev.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
EOF
    chmod +x backend/dev.sh
    
    # Frontend dev script
    cat > frontend/dev.sh << 'EOF'
#!/bin/bash
cd frontend
npm run dev
EOF
    chmod +x frontend/dev.sh
    
    # Mobile dev script
    cat > mobile/dev.sh << 'EOF'
#!/bin/bash
cd mobile
npx expo start
EOF
    chmod +x mobile/dev.sh
    
    print_success "Development scripts created"
}

# Main setup function
main() {
    print_status "Starting YTS by AI setup..."
    
    check_requirements
    setup_backend
    setup_frontend
    setup_mobile
    setup_chrome_extension
    create_dev_scripts
    
    echo ""
    print_success "🎉 YTS by AI setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment variables in:"
    echo "   - backend/.env"
    echo "   - frontend/.env.local"
    echo "   - mobile/.env"
    echo ""
    echo "2. Start development servers:"
    echo "   - Backend: ./backend/dev.sh"
    echo "   - Frontend: ./frontend/dev.sh"
    echo "   - Mobile: ./mobile/dev.sh"
    echo ""
    echo "3. Load Chrome extension:"
    echo "   - Open Chrome"
    echo "   - Go to chrome://extensions/"
    echo "   - Enable Developer mode"
    echo "   - Load unpacked: ./chrome-ext"
    echo ""
    print_warning "Don't forget to set up your API keys and deploy to production!"
}

# Run main function
main 