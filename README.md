# Study Buddy AI

An intelligent learning companion that allows students to upload study materials (PDFs, documents) and chat with an AI assistant that uses those materials to provide personalized help.

## Features

### Core Features
- **Authentication System**: Email/password authentication with role-based access (Student/Teacher)
- **Material Upload**: Upload PDFs, TXT, and DOCX files (up to 10MB)
- **AI Chat**: Context-aware chat powered by Google Gemini that references uploaded materials
- **Chat History**: Save and manage multiple chat conversations with file attachments
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Separated Architecture**: Clear separation between frontend and backend code

### Student Productivity Tools
- **📚 Course Management**: Create and organize courses with custom colors, codes, instructors, and credits
- **📅 Schedule & Calendar**:
  - Manage classes, assignments, exams, and tasks
  - Set priorities (Low, Medium, High)
  - Link events to courses
  - Track completion status
  - Filter by event type
- **🎯 Focus Mode**:
  - Pomodoro timer with customizable durations
  - Auto-start options for breaks/focus sessions
  - Session tracking
  - Sound notifications
  - Beautiful circular progress indicator

### Teacher Features
- **Teacher Dashboard**: Comprehensive analytics and monitoring of student activity

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
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

**Note**: If `prisma generate` fails with a file permission error on Windows, close all Node.js processes (including your dev server and VS Code), then try again.

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
- `PATCH /api/chats/[id]` - Update chat title
- `DELETE /api/chats/[id]` - Delete chat
- `POST /api/chats/[id]/messages` - Send message (with optional file attachment)

#### Courses
- `POST /api/courses/create` - Create new course
- `GET /api/courses/list` - List user's courses
- `GET /api/courses/[id]` - Get course details
- `PATCH /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

#### Schedules
- `POST /api/schedules/create` - Create new schedule
- `GET /api/schedules/list` - List schedules (with filters)
- `GET /api/schedules/[id]` - Get schedule details
- `PATCH /api/schedules/[id]` - Update schedule
- `PATCH /api/schedules/[id]/toggle` - Toggle completion status
- `DELETE /api/schedules/[id]` - Delete schedule

#### Teacher
- `GET /api/teacher/stats` - Get teacher dashboard statistics

## User Roles

- **Student**:
  - Upload and manage study materials
  - Chat with AI assistant
  - Manage courses and schedules
  - Use focus mode for productivity
  - Track assignments and exams

- **Teacher**:
  - All student capabilities
  - Monitor student engagement through analytics dashboard
  - Track real-time activity
  - View detailed student metrics
  - Oversight of learning materials and conversations

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

## Database Schema

The application uses the following database models:

- **User**: Stores user accounts (email, password, role)
- **Material**: Uploaded study materials (PDFs, docs) with extracted text
- **Chat**: Chat conversations between user and AI
- **Message**: Individual messages within chats (supports file attachments)
- **Course**: Student courses with details (name, code, instructor, color)
- **Schedule**: Calendar events (classes, assignments, exams, tasks)

**Enums**:
- `UserRole`: STUDENT, TEACHER
- `ScheduleType`: CLASS, ASSIGNMENT, EXAM, TASK, OTHER
- `Priority`: LOW, MEDIUM, HIGH

## Troubleshooting

### Prisma Client Generation Error (Windows)
If you get `EPERM: operation not permitted` error:
1. Stop all Node.js processes (Ctrl+C in terminals)
2. Close VS Code completely
3. Delete `node_modules\.prisma` folder
4. Run `npx prisma generate` again

### Database Connection Error on Vercel
Make sure to use **connection pooling** URL instead of direct connection:
- Go to Supabase → Settings → Database → Connection pooling
- Use port **6543** (not 5432)
- Add `?pgbouncer=true` at the end

## License

MIT
