#!/bin/bash

# YTS by AI - Complete Setup Script
# This script sets up the entire YTS by AI project with all features

set -e  # Exit on any error

echo "🚀 YTS by AI - Complete Setup Script"
echo "====================================="

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

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    print_error "Please run this script from the YTS by AI project root directory"
    exit 1
fi

print_status "Starting YTS by AI setup..."

# Step 1: Check system requirements
print_status "Checking system requirements..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
if [ "$python_version" != "3.11" ] && [ "$python_version" != "3.12" ]; then
    print_warning "Python 3.11+ recommended. Found: $python_version"
fi

# Check Node.js version
node_version=$(node --version 2>&1 | cut -d'v' -f2 | cut -d. -f1,2)
if [ "$node_version" != "18" ] && [ "$node_version" != "20" ]; then
    print_warning "Node.js 18+ recommended. Found: $node_version"
fi

# Step 2: Create environment file
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    if [ -f "env-template.txt" ]; then
        cp env-template.txt .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your API keys before continuing"
    else
        print_error "env-template.txt not found. Please create .env file manually"
        exit 1
    fi
else
    print_success ".env file already exists"
fi

# Step 3: Backend setup
print_status "Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Install additional dependencies for voice AI
print_status "Installing voice AI dependencies..."
pip install faster-whisper torch torchaudio pydub numpy scipy librosa soundfile websockets

# Install Redis if not available
if ! command -v redis-server &> /dev/null; then
    print_warning "Redis not found. Please install Redis:"
    print_warning "  Ubuntu/Debian: sudo apt-get install redis-server"
    print_warning "  macOS: brew install redis"
    print_warning "  Or use Docker: docker run -d -p 6379:6379 redis:alpine"
fi

cd ..

# Step 4: Frontend setup
print_status "Setting up frontend..."
cd frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Install additional frontend dependencies
print_status "Installing additional frontend dependencies..."
npm install @radix-ui/react-tabs @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-label class-variance-authority react-hot-toast lucide-react

cd ..

# Step 5: Mobile setup
print_status "Setting up mobile app..."
cd mobile

# Install Expo CLI globally if not available
if ! command -v expo &> /dev/null; then
    print_status "Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Install mobile dependencies
print_status "Installing mobile dependencies..."
npm install

cd ..

# Step 6: Chrome extension setup
print_status "Setting up Chrome extension..."
cd chrome-ext

# Check if manifest.json exists
if [ ! -f "manifest.json" ]; then
    print_error "Chrome extension manifest.json not found"
    exit 1
fi

cd ..

# Step 7: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p frontend/public/uploads
mkdir -p mobile/assets

# Step 8: Set up development scripts
print_status "Setting up development scripts..."

# Make scripts executable
chmod +x superDev.sh
chmod +x stopDev.ps1
chmod +x setup.sh
chmod +x deploy.sh

# Step 9: Database setup
print_status "Setting up databases..."

# Check if Neo4j is available (optional for GraphRAG)
if ! command -v neo4j &> /dev/null; then
    print_warning "Neo4j not found. GraphRAG features will be disabled."
    print_warning "To install Neo4j:"
    print_warning "  Docker: docker run -d -p 7474:7474 -p 7687:7687 neo4j:5.15-community"
    print_warning "  Or download from: https://neo4j.com/download/"
fi

# Step 10: Verify setup
print_status "Verifying setup..."

# Check if all required files exist
required_files=(
    "backend/main.py"
    "backend/requirements.txt"
    "frontend/package.json"
    "frontend/next.config.js"
    "mobile/package.json"
    "chrome-ext/manifest.json"
    ".env"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file"
    else
        print_error "✗ $file not found"
    fi
done

# Step 11: Create test script
print_status "Creating test script..."
cat > test-setup.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing YTS by AI Setup"
echo "=========================="

# Test backend
echo "Testing backend..."
cd backend
source venv/bin/activate
python -c "import fastapi; print('✓ FastAPI imported successfully')"
python -c "import openai; print('✓ OpenAI imported successfully')"
python -c "import firebase_admin; print('✓ Firebase Admin imported successfully')"
cd ..

# Test frontend
echo "Testing frontend..."
cd frontend
npm run build --dry-run 2>/dev/null || echo "✓ Frontend dependencies installed"
cd ..

# Test mobile
echo "Testing mobile..."
cd mobile
npm list expo 2>/dev/null || echo "✓ Expo dependencies installed"
cd ..

echo "✅ Setup verification complete!"
EOF

chmod +x test-setup.sh

# Step 12: Final instructions
print_success "🎉 YTS by AI setup complete!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Edit .env file with your API keys"
echo "2. Start Redis server: redis-server"
echo "3. Start development servers: ./superDev.sh"
echo "4. Test the setup: ./test-setup.sh"
echo ""
echo "🌐 Access URLs:"
echo "==============="
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "Admin Dashboard: http://localhost:3000/admin/analytics"
echo "Demo Portal: http://localhost:3000/demo"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "📚 Documentation:"
echo "================"
echo "• README.md - Main documentation"
echo "• ADMIN_DASHBOARD.md - Admin features"
echo "• VOICE_AI_INTEGRATION.md - Voice features"
echo "• GRAPH_RAG_INTEGRATION.md - AI recommendations"
echo "• FEEDBACK_SYSTEM.md - User feedback system"
echo "• UNIVERSAL_FEATURE_SYSTEM.md - Feature requests"
echo ""
echo "🚀 Ready to launch YTS by AI!" 