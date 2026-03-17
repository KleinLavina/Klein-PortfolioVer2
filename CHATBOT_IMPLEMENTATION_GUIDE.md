# AI Chatbot Implementation Guide

## Overview
Transform your existing FloatingChat component into an AI-powered assistant that answers questions about you efficiently.

## Architecture

```
User Question → Keyword Matching → Context Retrieval → AI API → Response
```

## Step 1: Create Knowledge Base

### 1.1 Create Knowledge Base File
```typescript
// server/knowledge-base.ts
export const KNOWLEDGE_BASE = {
  personal: {
    name: "Klein F. Lavina",
    role: "Fresh Graduate Full Stack Developer",
    location: "Philippines",
    education: "BSIT Graduate",
    certification: "PhilNITS Certified Passer",
    email: "kleinlav7@gmail.com",
    phone: "+639380734878",
    github: "https://github.com/KleinLavina",
    facebook: "https://www.facebook.com/klein.lavina.12"
  },
  
  skills: {
    frontend: ["React", "TypeScript", "HTML", "CSS", "JavaScript", "Tailwind CSS", "Bootstrap"],
    backend: ["Django", "PHP", "Node.js", "Express.js"],
    databases: ["PostgreSQL", "MySQL", "SQLite"],
    tools: ["Git", "GitHub", "VS Code", "Figma", "Postman", "Vite"],
    hosting: ["Netlify", "OnRender", "InfinityFree", "Cloudinary"]
  },
  
  projects: [
    {
      name: "RDFS - Real-time Dispatch and Finance System",
      description: "Capstone project featuring QR code-based driver queuing, live vehicle tracking, and automated fare validation for Maasin City Terminal",
      tech: ["JavaScript", "Django", "PostgreSQL", "Bootstrap", "Cloudinary", "OnRender"],
      url: "https://rdfsmaasin.onrender.com",
      github: "https://github.com/KleinLavina/RDFS",
      type: "capstone"
    },
    {
      name: "WISE-PENRO - Work Indicator Submission Engine",
      description: "Document tracking system for PENRO offices with workflow management and role-based access",
      tech: ["Django", "PostgreSQL", "JavaScript", "Cloudinary", "OnRender", "Brevo SMTP"],
      url: "https://r8penrowise.onrender.com",
      github: "https://github.com/KleinLavina/WISE-PENRO",
      type: "internship"
    }
    // Add other projects...
  ],
  
  experience: {
    internship: "Hands-on experience from internship and personal projects",
    approach: "I value honesty, ownership, and continuous learning. I believe in writing simple, maintainable code and building products with empathy.",
    learning: "Still learning every day - picking up new tools, breaking things, and figuring out why"
  },
  
  faqs: [
    {
      keywords: ["contact", "reach", "email", "phone"],
      answer: "You can reach me at kleinlav7@gmail.com or +639380734878. I'm also on GitHub (KleinLavina) and Facebook."
    },
    {
      keywords: ["experience", "years", "work"],
      answer: "I'm a fresh BSIT graduate with hands-on experience from internship and personal projects. I've built 8+ projects using Django, PHP, and React."
    },
    {
      keywords: ["skills", "technologies", "tech stack"],
      answer: "I specialize in Django, PHP, and React. I'm comfortable with PostgreSQL, MySQL, and modern deployment platforms like Netlify and OnRender."
    }
  ]
};

export const CONTEXT_TEMPLATES = {
  introduction: `I'm Klein F. Lavina, a fresh BSIT graduate and PhilNITS certified developer from the Philippines. I specialize in full-stack development with Django, PHP, and React.`,
  
  projects_summary: `I've built 8+ projects including RDFS (real-time dispatch system), WISE-PENRO (document tracking), and various e-commerce platforms. My capstone project handles live vehicle tracking and QR-based queuing.`,
  
  skills_summary: `Frontend: React, TypeScript, HTML/CSS, Tailwind. Backend: Django, PHP, Node.js. Databases: PostgreSQL, MySQL. Tools: Git, VS Code, Postman. Hosting: Netlify, OnRender, Cloudinary.`
};
```

## Step 2: Create Context Matcher

### 2.1 Smart Context Retrieval
```typescript
// server/context-matcher.ts
import { KNOWLEDGE_BASE, CONTEXT_TEMPLATES } from './knowledge-base';

export class ContextMatcher {
  private static getRelevantContext(question: string): string {
    const lowerQuestion = question.toLowerCase();
    let context = CONTEXT_TEMPLATES.introduction;
    
    // Check for specific topics
    if (this.matchesKeywords(lowerQuestion, ['project', 'work', 'built', 'rdfs', 'wise'])) {
      context += '\n\n' + CONTEXT_TEMPLATES.projects_summary;
      
      // Add specific project details if mentioned
      if (lowerQuestion.includes('rdfs')) {
        const rdfs = KNOWLEDGE_BASE.projects.find(p => p.name.includes('RDFS'));
        context += `\n\nRDFS Details: ${rdfs?.description}`;
      }
    }
    
    if (this.matchesKeywords(lowerQuestion, ['skill', 'tech', 'language', 'framework'])) {
      context += '\n\n' + CONTEXT_TEMPLATES.skills_summary;
    }
    
    if (this.matchesKeywords(lowerQuestion, ['contact', 'reach', 'email', 'phone'])) {
      context += `\n\nContact: ${KNOWLEDGE_BASE.personal.email}, ${KNOWLEDGE_BASE.personal.phone}`;
    }
    
    return context;
  }
  
  private static matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
  
  public static buildPrompt(question: string): string {
    const context = this.getRelevantContext(question);
    
    return `You are Klein F. Lavina's portfolio assistant. Answer questions about Klein based on this context:

${context}

Guidelines:
- Be conversational and friendly
- Keep responses concise (2-3 sentences max)
- If asked about something not in the context, say "I don't have that specific information, but you can contact Klein directly"
- Don't make up information

Question: ${question}

Answer:`;
  }
}
```

## Step 3: Set Up AI Integration

### 3.1 Choose AI Provider
**Recommended Options:**
- **OpenAI GPT-3.5-turbo** (most popular, $0.002/1K tokens)
- **Anthropic Claude** (good reasoning, similar pricing)
- **Google Gemini** (free tier available)
- **Groq** (very fast, free tier)

### 3.2 Install Dependencies
```bash
npm install openai
# or
npm install @anthropic-ai/sdk
```

### 3.3 Environment Variables
```env
# .env
OPENAI_API_KEY=your_openai_api_key_here
# or
ANTHROPIC_API_KEY=your_anthropic_key_here
```

## Step 4: Create AI Service

### 4.1 AI Service Implementation
```typescript
// server/ai-service.ts
import OpenAI from 'openai';
import { ContextMatcher } from './context-matcher';

export class AIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async generateResponse(question: string): Promise<string> {
    try {
      const prompt = ContextMatcher.buildPrompt(question);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150, // Keep responses short
        temperature: 0.7
      });
      
      return completion.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again!";
      
    } catch (error) {
      console.error('AI Service Error:', error);
      return "I'm experiencing technical difficulties. Please contact Klein directly at kleinlav7@gmail.com";
    }
  }
}
```

## Step 5: Update Backend Routes

### 5.1 Add Chat Route
```typescript
// server/routes.ts (add this route)
import { AIService } from './ai-service';

const aiService = new AIService();

// Add this route to your existing routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Rate limiting (simple version)
    // In production, use proper rate limiting middleware
    
    const response = await aiService.generateResponse(message);
    
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Step 6: Update Frontend Component

### 6.1 Create Chat Hook
```typescript
// client/src/hooks/use-chat.ts
import { useState } from 'react';

export function useChat() {
  const [loading, setLoading] = useState(false);
  
  const sendMessage = async (message: string): Promise<string> => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      return data.response;
      
    } catch (error) {
      console.error('Chat error:', error);
      return "Sorry, I'm having trouble connecting right now. Please try again or contact Klein directly.";
    } finally {
      setLoading(false);
    }
  };
  
  return { sendMessage, loading };
}
```

### 6.2 Update FloatingChat Component
```typescript
// client/src/components/floating-chat.tsx (update the send function)
import { useChat } from '@/hooks/use-chat';

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const { sendMessage, loading } = useChat();
  
  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    
    const userMessageId = Date.now();
    
    // Add user message
    setMessages((prev) => [...prev, { 
      id: userMessageId, 
      from: "user", 
      text: trimmed 
    }]);
    setInput("");
    
    // Get AI response
    const aiResponse = await sendMessage(trimmed);
    
    // Add AI response
    setMessages((prev) => [...prev, {
      id: userMessageId + 1,
      from: "klein",
      text: aiResponse,
    }]);
  };
  
  // Update the send button to show loading state
  // Add loading indicator in the input area
}
```

## Step 7: Testing & Optimization

### 7.1 Test Questions
- "What are your skills?"
- "Tell me about your projects"
- "How can I contact you?"
- "What's your experience?"
- "What technologies do you use?"

### 7.2 Token Optimization
- **Average tokens per request**: ~200-300 (vs 1000+ without context matching)
- **Cost per conversation**: ~$0.0006 (very affordable)
- **Response time**: 1-3 seconds

## Step 8: Deployment Considerations

### 8.1 Environment Setup
```bash
# Production environment variables
OPENAI_API_KEY=your_production_key
NODE_ENV=production
```

### 8.2 Rate Limiting
```typescript
// Add rate limiting middleware
import rateLimit from 'express-rate-limit';

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many chat requests, please try again later.'
});

app.use('/api/chat', chatLimiter);
```

## Next Steps

1. **Start with Step 1**: Create the knowledge base
2. **Test locally**: Use a free API key to test
3. **Iterate**: Improve context matching based on common questions
4. **Deploy**: Add to your existing hosting setup
5. **Monitor**: Track usage and costs

## Learning Resources

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Rate Limiting**: https://www.npmjs.com/package/express-rate-limit
- **Context Optimization**: Study RAG (Retrieval-Augmented Generation) patterns

This approach will give you a smart, cost-effective chatbot that provides accurate information about you while keeping token usage minimal!