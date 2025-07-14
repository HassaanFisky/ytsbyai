#!/bin/bash

echo "🚨 Setting up Smart Alerts System for YTS by AI..."

# Backend setup
echo "📦 Setting up backend alerts dependencies..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install additional dependencies for alerts
echo "Installing alerts dependencies..."
pip install httpx

# Check if all required packages are installed
python -c "import httpx" 2>/dev/null || pip install httpx

cd ..

# Frontend setup
echo "📦 Setting up frontend alerts components..."
cd frontend

# Check if dependencies are installed
if ! npm list @radix-ui/react-tabs >/dev/null 2>&1; then
    echo "Installing missing UI dependencies..."
    npm install @radix-ui/react-tabs class-variance-authority
fi

cd ..

# Environment setup
echo "🔧 Setting up alerts environment variables..."

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "# Backend environment variables" > backend/.env
fi

# Add alerts configuration to backend .env
if ! grep -q "SENDGRID_API_KEY" backend/.env; then
    echo "" >> backend/.env
    echo "# Alert System Configuration" >> backend/.env
    echo "SENDGRID_API_KEY=your_sendgrid_api_key_here" >> backend/.env
    echo "ALERT_EMAIL=alerts@ytsbyai.com" >> backend/.env
    echo "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" >> backend/.env
fi

# Check if .env.local exists in frontend
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    echo "# Frontend environment variables" > frontend/.env.local
fi

echo "✅ Alerts System setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure SendGrid:"
echo "   - Sign up at https://sendgrid.com"
echo "   - Generate API key in dashboard"
echo "   - Verify sender email (alerts@ytsbyai.com)"
echo "   - Update SENDGRID_API_KEY in backend/.env"
echo ""
echo "2. Configure Slack (optional):"
echo "   - Create Slack app in your workspace"
echo "   - Add Incoming Webhooks integration"
echo "   - Copy webhook URL to SLACK_WEBHOOK_URL in backend/.env"
echo ""
echo "3. Test the alerts system:"
echo "   - Start backend: cd backend && python main.py"
echo "   - Start frontend: cd frontend && npm run dev"
echo "   - Access admin dashboard: http://localhost:3000/admin/analytics"
echo "   - Click 'Test Alert' button to verify system"
echo ""
echo "🔒 Security Note: Update the environment variables with your actual API keys!" 