# Study Buddy AI

An intelligent learning companion that allows students to upload study materials (PDFs, documents) and chat with an AI assistant that uses those materials to provide personalized help.

## Features

- **Authentication System**: Email/password authentication with role-based access (Student/Teacher)
- **Material Upload**: Upload PDFs, TXT, and DOCX files (up to 10MB)
- **AI Chat**: Context-aware chat powered by Google Gemini that references uploaded materials
- **Chat History**: Save and manage multiple chat conversations
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Separated Architecture**: Clear separation between frontend and backend code

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Controllers
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage for file uploads
- **AI**: Google Gemini 1.5 Flash (FREE tier available)
- **Authentication**: JWT with bcrypt
- **ORM**: Prisma

## Project Structure (Separated Frontend/Backend)

```
studybuddy-ai/
├── backend/                    # 🔧 Backend Logic
│   ├── controllers/           # API business logic
│   │   ├── auth/             # Authentication controllers
│   │   ├── chats/            # Chat controllers
│   │   └── materials/        # Materials controllers
│   └── lib/                  # Server utilities
│       ├── prisma.ts         # Database client
│       ├── supabase.ts       # Supabase client
│       ├── jwt.ts            # JWT handling
│       ├── auth.ts           # Auth middleware
│       ├── gemini.ts         # Google Gemini integration
│       └── pdfParser.ts      # PDF text extraction
│
├── frontend/                   # 🎨 Frontend Code
│   ├── components/           # React components
│   │   ├── Sidebar.tsx
│   │   └── ChatInterface.tsx
│   ├── pages/                # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── MaterialsPage.tsx
│   ├── store/                # State management
│   │   └── authStore.ts      # Zustand auth store
│   └── styles/               # Stylesheets
│       └── globals.css
│
├── src/                        # Next.js App Router
│   └── app/                   # Route definitions (thin layer)
│       ├── api/              # API routes (call backend controllers)
│       ├── (auth)/           # Auth pages routes
│       ├── dashboard/        # Dashboard routes
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
│
├── prisma/                     # Database
│   └── schema.prisma         # Database schema
│
├── package.json
├── tsconfig.json
└── .env
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase (Required)

1. **Create a Supabase Account**
   - Go to https://supabase.com
   - Click "Start your project" and sign up

2. **Create a New Project**
   - Click "New Project"
   - Choose a name (e.g., "studybuddy")
   - Set a database password (save this!)
   - Choose a region close to you
   - Click "Create new project" (takes ~2 minutes)

3. **Get Your API Keys**
   - In your Supabase dashboard, go to **Settings** (gear icon) → **API**
   - Copy these values to your `.env` file:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

4. **Get Database Connection String**
   - Go to **Settings** → **Database**
   - Scroll to "Connection string" section
   - Select **URI** tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your database password
   - Paste into `DATABASE_URL` in `.env`

5. **Create Storage Bucket for File Uploads**
   - In Supabase dashboard, go to **Storage**
   - Click "Create a new bucket"
   - Name it: `study-materials`
   - Make it **Public**
   - Click "Create bucket"

### 3. Set Up Google Gemini API (Required - FREE!)

1. **Get Gemini API Key**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key to `GEMINI_API_KEY` in `.env`
   - **Note**: Free tier includes 60 requests per minute - no payment method required!

### 4. Configure Environment Variables

Edit the `.env` file with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres

# JWT Secret (you can keep the default or generate your own)
JWT_SECRET=super-secret-jwt-key-change-this-in-production

# Google Gemini API Key (FREE!)
GEMINI_API_KEY=your_gemini_api_key_here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Set Up Database Schema

```bash
npx prisma generate
npx prisma db push
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture Overview

### Backend Architecture
- **Controllers**: Handle business logic for each feature
- **Libraries**: Reusable server utilities (database, auth, AI)
- **API Routes**: Thin layer that calls controllers

### Frontend Architecture
- **Pages**: Full page components
- **Components**: Reusable UI components
- **Store**: Global state management with Zustand
- **Styles**: Tailwind CSS configuration and global styles

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Materials
- `POST /api/materials/upload` - Upload file
- `GET /api/materials/list` - List user's materials
- `DELETE /api/materials/delete/[id]` - Delete material

#### Chats
- `POST /api/chats/create` - Create new chat
- `GET /api/chats/list` - List user's chats
- `GET /api/chats/[id]` - Get chat with messages
- `DELETE /api/chats/[id]` - Delete chat
- `POST /api/chats/[id]/messages` - Send message

## User Roles

- **Student**: Can upload materials, create chats, and interact with AI
- **Teacher**: Full access to monitor and analyze student engagement through a comprehensive dashboard, including real-time activity tracking, detailed student metrics, and complete oversight of all learning materials and conversations, while maintaining standard student capabilities.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npx prisma studio
```

## Why Separated Architecture?

### Benefits:
1. **Clear Organization**: Easy to find backend logic vs frontend code
2. **Better Maintainability**: Changes to one layer don't affect the other
3. **Easier Testing**: Can test backend controllers independently
4. **Team Collaboration**: Frontend and backend developers can work separately
5. **Code Reusability**: Controllers can be reused across different routes

### How It Works:
- **Backend folder**: Contains all server-side logic (controllers, services, utilities)
- **Frontend folder**: Contains all client-side code (components, pages, state)
- **src/app**: Next.js routing layer - thin files that import from backend/frontend

## License

MIT
