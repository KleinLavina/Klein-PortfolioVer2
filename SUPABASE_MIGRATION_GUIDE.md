# Supabase Migration Guide

## Overview
Migrate from SQLite + Drizzle to Supabase PostgreSQL for better deployment and features.

## Step 1: Setup Supabase Project

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create new project
4. Choose region (closest to your users)
5. Set database password (save this!)

### 1.2 Get Connection Details
From your Supabase dashboard:
- **Project URL**: `https://your-project.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

## Step 2: Install Supabase Client

```bash
npm install @supabase/supabase-js
npm uninstall better-sqlite3 drizzle-orm drizzle-kit drizzle-zod
```

## Step 3: Environment Variables

### Update `.env`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Remove SQLite configs
# DATABASE_URL=./local.db (delete this)
```

### Update `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 4: Create Database Schema

### 4.1 In Supabase SQL Editor, run:

```sql
-- Messages table (for contact form)
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (if you want dynamic projects)
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  tech_stack JSONB NOT NULL,
  live_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table (if you want dynamic achievements)
CREATE TABLE achievements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies (public read, authenticated write)
CREATE POLICY "Anyone can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT WITH CHECK (true);
```

## Step 5: Create Supabase Client

### File: `client/src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for your tables
export interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  created_at: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  created_at: string;
}
```

## Step 6: Update Hooks

### File: `client/src/hooks/use-supabase-messages.ts`
```typescript
import { useState } from 'react';
import { supabase, type Message } from '@/lib/supabase';

export function useCreateMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMessage = async (data: { name: string; email: string; message: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error } = await supabase
        .from('messages')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { createMessage, loading, error };
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, fetchMessages };
}
```

### File: `client/src/hooks/use-supabase-projects.ts`
```typescript
import { useState, useEffect } from 'react';
import { supabase, type Project } from '@/lib/supabase';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, refetch: fetchProjects };
}
```

## Step 7: Update Netlify Function (Optional)

### File: `netlify/functions/supabase-chat.ts`
```typescript
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
);

export const handler: Handler = async (event, context) => {
  // Your existing chat logic here
  // Now you can also save chat logs to Supabase if needed
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');
    
    // Your AI response logic here...
    const response = "Your AI response";
    
    // Optionally log to Supabase
    await supabase.from('chat_logs').insert([{
      message,
      response,
      timestamp: new Date().toISOString()
    }]);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

## Step 8: Remove Old Files

Delete these files:
- `drizzle.config.ts`
- `local.db`
- `server/db.ts`
- `server/storage.ts`
- `shared/schema.ts`
- `migrations/` folder

## Step 9: Update Package.json

Remove these scripts:
```json
{
  "scripts": {
    // Remove this line:
    // "db:push": "drizzle-kit push"
  }
}
```

## Step 10: Seed Data (Optional)

### In Supabase SQL Editor:
```sql
-- Insert your projects
INSERT INTO projects (title, description, thumbnail, tech_stack, live_url, github_url) VALUES
('RDFS - Real-time Dispatch System', 'Capstone project featuring QR code-based driver queuing...', '/rdfs.png', '["JavaScript", "Django", "PostgreSQL"]', 'https://rdfsmaasin.onrender.com', 'https://github.com/KleinLavina/RDFS'),
('WISE-PENRO - Document Tracking', 'Document tracking system for PENRO offices...', '/wise-penro.png', '["Django", "PostgreSQL", "JavaScript"]', 'https://r8penrowise.onrender.com', 'https://github.com/KleinLavina/WISE-PENRO');

-- Insert achievements
INSERT INTO achievements (title, description, date) VALUES
('PhilNITS Certified', 'Passed the Philippine National IT Standards certification', '2025'),
('Capstone Project Completed', 'Successfully delivered RDFS real-time dispatch system', '2024');
```

## Benefits After Migration

### ✅ **Deployment Ready**
- Works perfectly with Netlify
- No database deployment issues
- Cloud-hosted and scalable

### ✅ **Real-time Features**
```typescript
// Real-time message updates
supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

### ✅ **Built-in Authentication** (Future)
```typescript
// Easy auth integration
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
});
```

### ✅ **File Storage** (Future)
```typescript
// Upload project images
const { data, error } = await supabase.storage
  .from('project-images')
  .upload('rdfs.png', file);
```

### ✅ **Auto-generated APIs**
- REST API: `https://your-project.supabase.co/rest/v1/projects`
- GraphQL: Available out of the box
- Real-time subscriptions

## Migration Checklist

- [ ] Create Supabase project
- [ ] Install Supabase client
- [ ] Update environment variables
- [ ] Create database schema
- [ ] Create Supabase client file
- [ ] Update hooks to use Supabase
- [ ] Test locally
- [ ] Deploy to Netlify
- [ ] Update Netlify environment variables
- [ ] Remove old SQLite files
- [ ] Seed initial data

## Cost Comparison

**SQLite (Current):**
- ✅ Free
- ❌ Local only, deployment issues

**Supabase:**
- ✅ Free tier: 500MB database, 1GB bandwidth, 50MB file storage
- ✅ Perfect for portfolios
- ✅ Scales as you grow

The free tier is more than enough for a portfolio website!