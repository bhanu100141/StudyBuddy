# Project Structure - Study Buddy AI

## 📁 Complete Folder Structure

```
studybuddy-ai/
│
├── 🔧 backend/                         # BACKEND CODE
│   ├── controllers/                    # Business logic
│   │   ├── auth/
│   │   │   └── authController.ts      # Login & Register logic
│   │   ├── chats/
│   │   │   └── chatsController.ts     # Chat management logic
│   │   └── materials/
│   │       └── materialsController.ts # File upload logic
│   │
│   └── lib/                           # Server utilities
│       ├── prisma.ts                  # Database client
│       ├── supabase.ts                # Storage client
│       ├── jwt.ts                     # JWT token handling
│       ├── auth.ts                    # Auth middleware
│       ├── openai.ts                  # AI integration
│       └── pdfParser.ts               # PDF text extraction
│
├── 🎨 frontend/                        # FRONTEND CODE
│   ├── components/                    # Reusable components
│   │   ├── Sidebar.tsx               # Chat sidebar
│   │   └── ChatInterface.tsx         # Chat UI
│   │
│   ├── pages/                        # Page components
│   │   ├── HomePage.tsx              # Landing page
│   │   ├── LoginPage.tsx             # Login page
│   │   ├── SignupPage.tsx            # Signup page
│   │   ├── DashboardPage.tsx         # Main dashboard
│   │   └── MaterialsPage.tsx         # Materials management
│   │
│   ├── store/                        # State management
│   │   └── authStore.ts              # Zustand auth store
│   │
│   └── styles/                       # Stylesheets
│       └── globals.css               # Global CSS
│
├── 🚏 src/app/                         # NEXT.JS ROUTING (Thin Layer)
│   ├── api/                          # API route handlers
│   │   ├── auth/
│   │   │   ├── register/route.ts    # Calls AuthController.register()
│   │   │   └── login/route.ts       # Calls AuthController.login()
│   │   ├── chats/
│   │   │   ├── create/route.ts      # Calls ChatsController.createChat()
│   │   │   ├── list/route.ts        # Calls ChatsController.listChats()
│   │   │   └── [id]/
│   │   │       ├── route.ts         # Calls ChatsController.getChat()
│   │   │       └── messages/route.ts # Calls ChatsController.sendMessage()
│   │   └── materials/
│   │       ├── upload/route.ts      # Calls MaterialsController.uploadMaterial()
│   │       ├── list/route.ts        # Calls MaterialsController.listMaterials()
│   │       └── delete/[id]/route.ts # Calls MaterialsController.deleteMaterial()
│   │
│   ├── (auth)/                      # Auth page routes
│   │   ├── login/page.tsx          # Imports LoginPage component
│   │   └── signup/page.tsx         # Imports SignupPage component
│   │
│   ├── dashboard/                   # Dashboard routes
│   │   ├── page.tsx                # Imports DashboardPage component
│   │   └── materials/page.tsx      # Imports MaterialsPage component
│   │
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Imports HomePage component
│   └── globals.css                 # Imports from frontend/styles/
│
├── 💾 prisma/                          # DATABASE
│   └── schema.prisma               # Database schema (Users, Chats, Materials, Messages)
│
├── 📄 Configuration Files
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config (with path aliases)
│   ├── tailwind.config.ts          # Tailwind CSS config
│   ├── next.config.js              # Next.js config
│   ├── .env                        # Environment variables
│   ├── .env.example                # Example env file
│   └── .gitignore                  # Git ignore rules
│
└── 📖 Documentation
    ├── README.md                   # Main documentation
    └── PROJECT_STRUCTURE.md        # This file
```

## 🔄 Request Flow

### Example: User sends a chat message

```
1. User types message in ChatInterface component (frontend/components/ChatInterface.tsx)
   ↓
2. Component calls API: POST /api/chats/[id]/messages
   ↓
3. API route handler (src/app/api/chats/[id]/messages/route.ts)
   - Authenticates user
   - Calls ChatsController.sendMessage()
   ↓
4. ChatsController (backend/controllers/chats/chatsController.ts)
   - Validates input
   - Gets user's materials
   - Calls Gemini API service
   - Saves messages to database
   ↓
5. Returns response
   ↓
6. ChatInterface updates UI with new messages
```

## 📝 Import Path Examples

### Backend imports:
```typescript
import { AuthController } from '@/backend/controllers/auth/authController';
import { prisma } from '@/backend/lib/prisma';
import { requireAuth } from '@/backend/lib/auth';
```

### Frontend imports:
```typescript
import { useAuthStore } from '@/frontend/store/authStore';
import Sidebar from '@/frontend/components/Sidebar';
import HomePage from '@/frontend/pages/HomePage';
```

## 🎯 Key Principles

### Backend Folder:
- ✅ Contains ALL server-side logic
- ✅ No React components
- ✅ No UI code
- ✅ Controllers handle business logic
- ✅ Libraries provide utilities
- ✅ Can be tested independently

### Frontend Folder:
- ✅ Contains ALL client-side code
- ✅ React components only
- ✅ No database access
- ✅ Makes API calls to backend
- ✅ Manages UI state
- ✅ Handles user interactions

### src/app Folder:
- ✅ Thin routing layer
- ✅ Route files import from backend/frontend
- ✅ Minimal logic
- ✅ Just connects routes to controllers/components

## 🚀 Benefits

1. **Clear Separation**: Easy to know where code belongs
2. **Maintainable**: Changes don't affect unrelated code
3. **Testable**: Backend can be tested without frontend
4. **Scalable**: Easy to add new features
5. **Team-Friendly**: Multiple developers can work simultaneously
6. **Reusable**: Controllers can be used by multiple routes
