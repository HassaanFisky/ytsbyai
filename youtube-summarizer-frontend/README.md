# YouTube Summarizer Frontend

A modern, responsive React frontend built with Next.js, TypeScript, TailwindCSS, and ShadCN UI that integrates with a FastAPI + Firebase backend to create AI-powered YouTube video summaries.

## ✨ Features

- **🎥 YouTube Integration**: Paste any YouTube URL to generate intelligent summaries
- **🔐 Firebase Authentication**: Secure email/password authentication with user management
- **📱 Responsive Design**: Mobile-first UI that works perfectly on all devices
- **🎨 Modern UI**: Beautiful interface built with TailwindCSS and ShadCN UI components
- **⚡ Real-time Updates**: Live loading states and instant notifications
- **📊 Dashboard**: Comprehensive dashboard to manage all your summaries
- **🔍 Search & Filter**: Easily find and organize your video summaries
- **📋 Copy & Share**: One-click copying and sharing of summaries
- **🌙 Accessibility**: Built with accessibility best practices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: ShadCN UI
- **Authentication**: Firebase Auth
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd youtube-summarizer-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Firebase and API configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Get your Firebase configuration from Project Settings
4. Add the configuration to your `.env.local` file

### API Integration

The frontend expects a FastAPI backend with the following endpoints:

- `POST /summary` - Create a new YouTube summary
- `GET /summaries` - Get all summaries for authenticated user
- `GET /summary/{id}` - Get specific summary by ID
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── summary/          # Summary creation page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── ui/               # ShadCN UI components
│   ├── Navbar.tsx        # Navigation component
│   ├── SummaryCard.tsx   # Summary display component
│   └── UploadCard.tsx    # YouTube URL upload component
├── hooks/                # Custom React hooks
│   └── useAuth.ts        # Firebase authentication hook
└── lib/                  # Utility libraries
    ├── api.ts            # API client and methods
    ├── firebase.ts       # Firebase configuration
    └── utils.ts          # Utility functions
```

## 🎨 UI Components

The project uses ShadCN UI components for a consistent and beautiful interface:

- **Form Components**: Input, Label, Button, Textarea
- **Layout Components**: Card, Container, Separator
- **Feedback Components**: Toast notifications, Loading states
- **Navigation Components**: Responsive navbar with mobile menu
- **Data Display**: Badges, formatted dates, statistics cards

## 🔒 Authentication Flow

1. **Sign Up**: Users create accounts with email/password
2. **Sign In**: Secure authentication with Firebase
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Token Management**: Automatic token refresh and API integration
5. **User Profile**: Display and update user information

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Optimized for phones with touch-friendly interfaces
- **Tablet**: Adaptive layouts for medium screens
- **Desktop**: Full-featured experience with sidebar navigation
- **Large Screens**: Utilizes extra space efficiently

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables**
   Add your environment variables in the Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

1. **Build the image**
   ```bash
   docker build -t youtube-summarizer-frontend .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 youtube-summarizer-frontend
   ```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Quality

- **ESLint**: Configured with Next.js and TypeScript rules
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (configure in your editor)

## 🔧 Customization

### Theming

Colors and styling can be customized in:
- `tailwind.config.ts` - TailwindCSS configuration
- `src/app/globals.css` - CSS custom properties

### Components

ShadCN UI components can be customized by:
1. Modifying the component files in `src/components/ui/`
2. Updating the theme in `tailwind.config.ts`
3. Adding new variants in component definitions

## 📄 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔗 Related Projects

- **Backend**: YouTube Summarizer FastAPI Backend
- **API Documentation**: Available at `/docs` endpoint of your FastAPI backend

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
