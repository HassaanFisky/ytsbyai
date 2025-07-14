#!/bin/bash

echo "🚀 Setting up Admin Dashboard for YTS by AI..."

# Backend setup
echo "📦 Setting up backend dependencies..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install backend dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if Firebase Admin SDK is installed
if ! python -c "import firebase_admin" 2>/dev/null; then
    echo "Installing Firebase Admin SDK..."
    pip install firebase-admin==6.2.0
fi

cd ..

# Frontend setup
echo "📦 Setting up frontend dependencies..."
cd frontend

# Install frontend dependencies
echo "Installing Node.js dependencies..."
npm install

# Install additional admin dashboard dependencies
echo "Installing admin dashboard dependencies..."
npm install @radix-ui/react-tabs class-variance-authority

# Check if dependencies are installed
if ! npm list @radix-ui/react-tabs >/dev/null 2>&1; then
    echo "⚠️  Warning: @radix-ui/react-tabs not installed"
fi

if ! npm list class-variance-authority >/dev/null 2>&1; then
    echo "⚠️  Warning: class-variance-authority not installed"
fi

cd ..

# Environment setup
echo "🔧 Setting up environment variables..."

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "# Backend environment variables" > backend/.env
fi

# Add admin configuration to backend .env
if ! grep -q "ADMIN_EMAILS" backend/.env; then
    echo "" >> backend/.env
    echo "# Admin Dashboard Configuration" >> backend/.env
    echo "ADMIN_EMAILS=admin@ytsbyai.com,founder@ytsbyai.com,growth@ytsbyai.com,analytics@ytsbyai.com" >> backend/.env
fi

# Check if .env exists in frontend
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    echo "# Frontend environment variables" > frontend/.env.local
fi

echo "✅ Admin Dashboard setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Firebase in your project"
echo "2. Update admin email whitelist in:"
echo "   - backend/app/core/admin_auth.py"
echo "   - frontend/components/admin/AdminAuthGate.tsx"
echo "3. Start the development servers:"
echo "   - cd backend && python main.py"
echo "   - cd frontend && npm run dev"
echo "4. Access admin dashboard at: http://localhost:3000/admin/analytics"
echo ""
echo "🔒 Security Note: Update the admin email whitelist with your actual admin emails!" 