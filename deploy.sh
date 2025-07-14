#!/bin/bash

# YTS by AI - Full Stack Deployment Script
echo "🚀 Deploying YTS by AI - Full Stack"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
check_deployment_tools() {
    print_status "Checking deployment tools..."
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Install with: npm i -g vercel"
    fi
    
    # Check EAS CLI
    if ! command -v eas &> /dev/null; then
        print_warning "EAS CLI not found. Install with: npm i -g @expo/eas-cli"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is required but not installed"
        exit 1
    fi
}

# Deploy Backend to Render
deploy_backend() {
    print_status "Deploying Backend to Render..."
    
    cd backend
    
    # Check if render.yaml exists
    if [ ! -f render.yaml ]; then
        print_error "render.yaml not found in backend directory"
        return 1
    fi
    
    print_warning "To deploy to Render:"
    echo "1. Go to https://render.com"
    echo "2. Connect your GitHub repository"
    echo "3. Create a new Web Service"
    echo "4. Select the backend directory"
    echo "5. Set environment variables in Render dashboard"
    echo "6. Deploy!"
    
    cd ..
    print_success "Backend deployment instructions provided"
}

# Deploy Frontend to Vercel
deploy_frontend() {
    print_status "Deploying Frontend to Vercel..."
    
    cd frontend
    
    # Check if vercel.json exists
    if [ ! -f vercel.json ]; then
        print_error "vercel.json not found in frontend directory"
        return 1
    fi
    
    # Check if Vercel CLI is installed
    if command -v vercel &> /dev/null; then
        print_status "Using Vercel CLI..."
        
        # Deploy to Vercel
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_success "Frontend deployed to Vercel successfully!"
        else
            print_error "Frontend deployment failed"
            return 1
        fi
    else
        print_warning "Vercel CLI not found. Manual deployment required:"
        echo "1. Go to https://vercel.com"
        echo "2. Connect your GitHub repository"
        echo "3. Import the frontend directory"
        echo "4. Set environment variables in Vercel dashboard"
        echo "5. Deploy!"
    fi
    
    cd ..
}

# Deploy Mobile App to Expo
deploy_mobile() {
    print_status "Deploying Mobile App to Expo..."
    
    cd mobile
    
    # Check if eas.json exists
    if [ ! -f eas.json ]; then
        print_error "eas.json not found in mobile directory"
        return 1
    fi
    
    # Check if EAS CLI is installed
    if command -v eas &> /dev/null; then
        print_status "Using EAS CLI..."
        
        # Login to Expo
        eas login
        
        # Build for preview
        eas build --platform all --profile preview
        
        if [ $? -eq 0 ]; then
            print_success "Mobile app built successfully!"
            print_warning "To publish to stores, run:"
            echo "eas submit --platform all"
        else
            print_error "Mobile app build failed"
            return 1
        fi
    else
        print_warning "EAS CLI not found. Manual deployment required:"
        echo "1. Install EAS CLI: npm i -g @expo/eas-cli"
        echo "2. Run: eas login"
        echo "3. Run: eas build --platform all"
        echo "4. Run: eas submit --platform all"
    fi
    
    cd ..
}

# Package Chrome Extension
package_chrome_extension() {
    print_status "Packaging Chrome Extension..."
    
    cd chrome-ext
    
    # Check if manifest.json exists
    if [ ! -f manifest.json ]; then
        print_error "manifest.json not found in chrome-ext directory"
        return 1
    fi
    
    # Create zip file for Chrome Web Store
    zip -r ../ytsbyai-chrome-extension.zip . -x "*.git*" "*.DS_Store*"
    
    if [ $? -eq 0 ]; then
        print_success "Chrome extension packaged as ytsbyai-chrome-extension.zip"
        print_warning "To publish to Chrome Web Store:"
        echo "1. Go to https://chrome.google.com/webstore/devconsole"
        echo "2. Upload ytsbyai-chrome-extension.zip"
        echo "3. Fill in store listing details"
        echo "4. Submit for review"
    else
        print_error "Chrome extension packaging failed"
        return 1
    fi
    
    cd ..
}

# Update environment variables
update_env_vars() {
    print_status "Updating environment variables..."
    
    print_warning "Please update the following files with your production URLs:"
    echo ""
    echo "1. frontend/vercel.json - Update API_BASE_URL"
    echo "2. chrome-ext/background.js - Update API_BASE_URL"
    echo "3. All .env files with production API keys"
    echo ""
    echo "Required environment variables:"
    echo "- OPENAI_API_KEY"
    echo "- STRIPE_SECRET_KEY"
    echo "- STRIPE_WEBHOOK_SECRET"
    echo "- FIREBASE_* (all Firebase config)"
    echo "- JWT_SECRET_KEY"
    echo "- NEXT_PUBLIC_* (all public keys)"
}

# Main deployment function
main() {
    print_status "Starting YTS by AI deployment..."
    
    check_deployment_tools
    update_env_vars
    
    echo ""
    print_status "Deploying components..."
    
    deploy_backend
    deploy_frontend
    deploy_mobile
    package_chrome_extension
    
    echo ""
    print_success "🎉 Deployment process completed!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment variables with production values"
    echo "2. Deploy backend to Render"
    echo "3. Deploy frontend to Vercel"
    echo "4. Build and submit mobile app to stores"
    echo "5. Submit Chrome extension to Web Store"
    echo ""
    echo "Production URLs will be:"
    echo "- Frontend: https://ytsbyai.vercel.app"
    echo "- Backend: https://your-backend-url.onrender.com"
    echo "- Mobile: Available on App Store & Google Play"
    echo "- Chrome Extension: Available on Chrome Web Store"
}

# Run main function
main 