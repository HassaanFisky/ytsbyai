#!/bin/bash

echo "💬 Setting up Feedback System for YTS by AI..."

# Backend setup
echo "📦 Setting up backend feedback dependencies..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install additional dependencies for feedback
echo "Installing feedback dependencies..."
pip install httpx

# Check if all required packages are installed
python -c "import httpx" 2>/dev/null || pip install httpx

cd ..

# Frontend setup
echo "📦 Setting up frontend feedback components..."
cd frontend

# Check if dependencies are installed
if ! npm list @radix-ui/react-select >/dev/null 2>&1; then
    echo "Installing missing UI dependencies..."
    npm install @radix-ui/react-select @radix-ui/react-label
fi

cd ..

# Environment setup
echo "🔧 Setting up feedback environment variables..."

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "# Backend environment variables" > backend/.env
fi

# Add feedback configuration to backend .env
if ! grep -q "FEEDBACK_ALERT_EMAIL" backend/.env; then
    echo "" >> backend/.env
    echo "# Feedback System Configuration" >> backend/.env
    echo "SENDGRID_API_KEY=your_sendgrid_api_key_here" >> backend/.env
    echo "FEEDBACK_ALERT_EMAIL=feedback@ytsbyai.com" >> backend/.env
    echo "SLACK_WEBHOOK_FEEDBACK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" >> backend/.env
fi

# Check if .env.local exists in frontend
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    echo "# Frontend environment variables" > frontend/.env.local
fi

echo "✅ Feedback System setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure SendGrid:"
echo "   - Sign up at https://sendgrid.com"
echo "   - Generate API key in dashboard"
echo "   - Verify sender email (feedback@ytsbyai.com)"
echo "   - Update SENDGRID_API_KEY in backend/.env"
echo ""
echo "2. Configure Slack (optional):"
echo "   - Create Slack app in your workspace"
echo "   - Add Incoming Webhooks integration"
echo "   - Copy webhook URL to SLACK_WEBHOOK_FEEDBACK in backend/.env"
echo ""
echo "3. Test the feedback system:"
echo "   - Start backend: cd backend && python main.py"
echo "   - Start frontend: cd frontend && npm run dev"
echo "   - Add feedback button to your components:"
echo "     import FeedbackForm from '@/components/FeedbackForm'"
echo "   - Access admin panel: http://localhost:3000/admin/analytics"
echo ""
echo "🔒 Security Note: Update the environment variables with your actual API keys!" 