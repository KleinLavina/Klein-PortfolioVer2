# Klein F. Lavina Portfolio - Codebase Context

## Project Overview

This is a **full-stack developer portfolio** for Klein F. Lavina, a fresh BSIT graduate from the Philippines. The portfolio showcases his projects, skills, and professional journey through an interactive, modern web application.

## Architecture & Tech Stack

### **Frontend**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 3.4.19 + CSS animations
- **UI Components**: Radix UI (headless components)
- **Icons**: Lucide React + Font Awesome
- **Animations**: Framer Motion 11.13.1
- **State Management**: React hooks + TanStack Query 5.60.5
- **Routing**: Wouter 3.3.5 (lightweight routing)

### **Backend**
- **Runtime**: Node.js with Express 5.0.1
- **Language**: TypeScript with TSX execution
- **Database**: Supabase PostgreSQL
- **Server Data Access**: Supabase service-role client + PostgREST/RPC
- **Authentication**: Passport.js with local strategy
- **Session Management**: Express-session with MemoryStore
- **WebSockets**: ws 8.18.0 for real-time features

### **Development & Build**
- **Package Manager**: npm
- **TypeScript**: 5.9.3
- **Bundling**: Vite + ESBuild 0.25.12
- **CSS Processing**: PostCSS + Autoprefixer
- **Development**: TSX for TypeScript execution
- **Environment**: Replit-optimized with custom plugins

## Project Structure

```
Klein-portfolioVer2/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Shadcn/ui components (58 files)
│   │   │   ├── layout/     # Layout components (Shell, Sidebar)
│   │   │   ├── floating-chat.tsx
│   │   │   ├── github-contributions.tsx
│   │   │   └── developer-timeline.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── home.tsx    # Main portfolio page (907 lines)
│   │   │   └── not-found.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React contexts
│   │   └── lib/           # Utilities and configurations
│   ├── public/            # Static assets (images, favicon)
│   └── index.html         # Entry HTML file
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database configuration
│   ├── storage.ts       # Database operations
│   └── static.ts        # Static file serving
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Drizzle database schemas
│   └── routes.ts        # API route definitions
└── script/             # Build scripts
    └── build.ts        # Production build script
```

## Key Features & Components

### **1. Portfolio Sections**
- **Hero Section**: Introduction with animated stats and CTAs
- **About Me**: Personal info with JSON terminal, git log, and values
- **Technical Arsenal**: Skills organized by category with proficiency levels
- **GitHub Integration**: Live contribution graph display
- **Featured Projects**: 6 projects with detailed descriptions and tech stacks
- **Developer Timeline**: Career journey with milestones
- **Scroll Text Reveal**: Animated text reveal on scroll
- **Contact Section**: QR code with vCard data for instant contact sharing

### **2. Interactive Elements**
- **Floating Chat**: "Ask Klein" chatbot interface (currently template)
- **Magnetic Buttons**: Hover effects with magnetic attraction
- **3D Project Cards**: Perspective transforms on hover
- **Animated Backgrounds**: Bubble animations with scroll-based opacity
- **Smooth Scrolling**: Custom scroll behavior and progress indicators

### **3. Technical Implementation Details**

#### **Database Schema** (Supabase PostgreSQL)
```typescript
// Messages table
messages: { id, name, email, message, createdAt }

// Projects table
projects: { id, title, description, thumbnail, techStack, liveUrl, githubUrl }

// Achievements table
achievements: { id, title, description, date }

// CMS tables
chatbot_content: { id, category, label, content, isActive, sortOrder, createdAt, updatedAt }
portfolio_memory_entries: { id, sectionKey, title, eyebrow, summary, context, accent, facts, items, links, isActive, sortOrder, createdAt, updatedAt }
```

#### **Current Project Data** (Hardcoded in home.tsx)
1. **RDFS** - Real-time Dispatch and Finance System (Capstone)
   - Tech: JavaScript, Django, PostgreSQL, Bootstrap, Cloudinary, OnRender
   - Live: https://rdfsmaasin.onrender.com

2. **WISE-PENRO** - Work Indicator Submission Engine
   - Tech: Django, PostgreSQL, JavaScript, Cloudinary, OnRender, Brevo SMTP
   - Live: https://r8penrowise.onrender.com

3. **J-Gear Assistant Chatbot**
   - Tech: TypeScript, React, CSS, HTML, Vite, Netlify
   - Live: https://jgeartatakjosephinian.netlify.app/

4. **Tag-os Elementary School Website**
   - Tech: React, JavaScript, CSS, Vite, HTML, Netlify
   - Live: https://tagoselementary.netlify.app/

5. **Cracken Gear Fits** (3rd year school project variant)
   - Tech: PHP, JavaScript, HTML, CSS, MySQL, InfinityFree
   - Live: https://cgearfits.rf.gd/

6. **Cracken Furniture** (3rd year school project variant)
   - Tech: PHP, JavaScript, HTML, CSS, MySQL, InfinityFree
   - Live: https://cfurniture.rf.gd/

#### **Skills Categories**
- **Frontend**: HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind, Bootstrap
- **Backend**: Django, PHP
- **Databases**: MySQL, PostgreSQL
- **Languages**: Java, Python, R
- **Tools**: VS Code, Git, GitHub, Figma, Postman, Cloudinary, Replit, Render, Canva

#### **Professional Skills**
- Problem Solving, Team Collaboration, Technical Troubleshooting
- Adaptability, Continuous Learning, Communication

## Personal Information (Klein F. Lavina)

### **Identity**
- **Name**: Klein F. Lavina
- **Role**: Fresh Graduate · Full Stack Developer
- **Education**: BSIT Graduate
- **Location**: Philippines 🇵🇭
- **Certification**: PhilNITS Certified Passer
- **Status**: Open to work

### **Contact Information**
- **Email**: kleinlav7@gmail.com
- **Phone**: +639380734878
- **GitHub**: https://github.com/KleinLavina
- **Facebook**: https://www.facebook.com/klein.lavina.12

### **Professional Stats**
- **8+ Projects Built**
- **15+ Tech Stacks**
- **PhilNITS Certified Passer**

### **Developer Philosophy**
- "I value honesty, ownership, and continuous learning"
- "I believe in writing simple, maintainable code"
- "Building products with empathy for the people who use them"
- "Passed PhilNITS. Still googling CSS flexbox." (humorous quote)

## Current State & Planned Enhancements

### **Completed Features**
- ✅ Full portfolio with 6 sections
- ✅ Responsive design with modern animations
- ✅ GitHub integration for contribution display
- ✅ Interactive floating chat UI (template only)
- ✅ QR code contact sharing
- ✅ Project showcase with live demos
- ✅ Developer timeline with career milestones

### **Database Usage Status**
- ❌ **Messages API**: Removed (was for contact form)
- ❌ **Projects API**: Not used (hardcoded data preferred)
- ❌ **Achievements API**: Not used
- ✅ **GitHub API**: Active (for contribution graphs)

### **Planned AI Chatbot Enhancement**
The floating chat component is currently a template. Plans include:
- **AI Integration**: OpenAI GPT-3.5-turbo or similar
- **Token Optimization**: RAG (Retrieval-Augmented Generation) approach
- **Context Matching**: Smart information retrieval based on questions
- **Cost Efficiency**: ~90% token reduction through selective context
- **Knowledge Base**: Structured data about Klein's projects, skills, experience

## Development Environment

### **Scripts**
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build
- `npm run build:frontend`: Frontend-only build (for static hosting)
- `npm run start`: Production server
- `npm run check`: TypeScript checking
### **Environment Variables**
- Supabase URL, anon key, and service-role key
- API keys for external services
- Development/production environment flags

### **Deployment Considerations**
- **Full-stack**: Requires Node.js server (Render, Railway, Vercel)
- **Static**: Frontend-only deployment possible (Netlify, Vercel)
- **Database**: Supabase PostgreSQL for local and deployed CMS data

## Code Quality & Patterns

### **TypeScript Usage**
- Strict type checking enabled
- Zod schemas for runtime validation
- Proper interface definitions for all data structures

### **Component Architecture**
- Functional components with hooks
- Custom hooks for reusable logic
- Compound component patterns (Radix UI)
- Motion components for animations

### **Styling Approach**
- Tailwind CSS utility classes
- CSS custom properties for theming
- Framer Motion for complex animations
- Responsive design with mobile-first approach

### **Performance Optimizations**
- Code splitting with dynamic imports
- Image optimization and lazy loading
- Efficient re-renders with proper dependency arrays
- Scroll-based animations with passive listeners

This codebase represents a modern, full-stack portfolio showcasing both technical skills and attention to user experience design. The planned AI chatbot integration will demonstrate advanced AI integration patterns while maintaining cost efficiency.
