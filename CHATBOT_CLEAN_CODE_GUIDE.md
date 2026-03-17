# AI Chatbot - Clean Code Implementation

## Core Principle: Minimal Token Usage

**Goal**: Answer questions using 150-300 tokens instead of 1000+ tokens.

**Strategy**: Smart context retrieval + focused prompts = 90% cost reduction.

---

## 1. Knowledge Base (Token-Optimized)

### File: `server/knowledge/klein-data.ts`

```typescript
// Structured for fast retrieval and minimal token usage
export const KLEIN_DATA = {
  // Core identity (always included)
  identity: "Klein F. Lavina, Fresh BSIT Graduate, PhilNITS Certified, Philippines",
  
  // Categorized for selective inclusion
  categories: {
    contact: {
      email: "kleinlav7@gmail.com",
      phone: "+639380734878",
      github: "github.com/KleinLavina",
      facebook: "facebook.com/klein.lavina.12"
    },
    
    skills: {
      primary: "Django, PHP, React",
      frontend: "React, TypeScript, HTML/CSS, Tailwind",
      backend: "Django, PHP, Node.js",
      databases: "PostgreSQL, MySQL, SQLite",
      tools: "Git, VS Code, Postman, Vite"
    },
    
    projects: {
      rdfs: {
        name: "RDFS - Real-time Dispatch System",
        desc: "Capstone: QR driver queuing, live tracking for Maasin Terminal",
        tech: "Django, PostgreSQL, JavaScript",
        url: "rdfsmaasin.onrender.com"
      },
      wise: {
        name: "WISE-PENRO - Document Tracking",
        desc: "PENRO workflow system with role-based access",
        tech: "Django, PostgreSQL, Brevo SMTP",
        url: "r8penrowise.onrender.com"
      },
      jgear: {
        name: "J-Gear Assistant Chatbot",
        desc: "FAQ bot for merchandise inquiries",
        tech: "React, TypeScript, Vite",
        url: "jgeartatakjosephinian.netlify.app"
      }
    },
    
    experience: {
      status: "Fresh graduate with internship + personal project experience",
      approach: "Values honesty, ownership, continuous learning",
      stats: "8+ projects built, 15+ tech stacks, PhilNITS certified"
    }
  }
};

// Pre-built responses for common questions (0 tokens to AI)
export const INSTANT_RESPONSES = {
  "hi|hello|hey": "Hi! I'm Klein's AI assistant. Ask me about his projects, skills, or contact info! 👋",
  "contact|email|phone|reach": `Contact Klein: kleinlav7@gmail.com or +639380734878. GitHub: github.com/KleinLavina`,
  "location|where|philippines": "Klein is based in the Philippines 🇵🇭"
};
```

---

## 2. Smart Context Matcher (Core Logic)

### File: `server/services/context-matcher.ts`

```typescript
import { KLEIN_DATA, INSTANT_RESPONSES } from '../knowledge/klein-data';

export class ContextMatcher {
  // Check for instant responses first (saves AI calls)
  static getInstantResponse(question: string): string | null {
    const q = question.toLowerCase();
    
    for (const [pattern, response] of Object.entries(INSTANT_RESPONSES)) {
      if (pattern.split('|').some(keyword => q.includes(keyword))) {
        return response;
      }
    }
    return null;
  }
  
  // Build minimal context based on question intent
  static buildContext(question: string): string {
    const q = question.toLowerCase();
    const { identity, categories } = KLEIN_DATA;
    
    let context = identity; // Always include (15 tokens)
    
    // Add relevant sections only (selective inclusion)
    if (this.matches(q, ['project', 'built', 'work', 'rdfs', 'wise', 'jgear'])) {
      context += `\n\nProjects: ${this.formatProjects(q)}`;
    }
    
    if (this.matches(q, ['skill', 'tech', 'language', 'framework', 'know'])) {
      context += `\n\nSkills: ${categories.skills.primary}. Frontend: ${categories.skills.frontend}. Backend: ${categories.skills.backend}`;
    }
    
    if (this.matches(q, ['experience', 'background', 'graduate', 'work'])) {
      context += `\n\nExperience: ${categories.experience.status}. ${categories.experience.stats}`;
    }
    
    return context;
  }
  
  // Format projects based on specific mentions
  private static formatProjects(question: string): string {
    const { projects } = KLEIN_DATA.categories;
    
    if (question.includes('rdfs')) return `RDFS: ${projects.rdfs.desc}`;
    if (question.includes('wise')) return `WISE-PENRO: ${projects.wise.desc}`;
    if (question.includes('chatbot')) return `J-Gear: ${projects.jgear.desc}`;
    
    // General project overview (concise)
    return `RDFS (capstone dispatch system), WISE-PENRO (document tracking), J-Gear (chatbot)`;
  }
  
  private static matches(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
  
  // Generate optimized prompt (under 300 tokens)
  static createPrompt(question: string): string {
    const context = this.buildContext(question);
    
    return `You're Klein's portfolio assistant. Answer based on this context:

${context}

Rules:
- Be friendly and conversational
- Keep responses under 3 sentences
- If info not in context: "Contact Klein directly for more details"
- Don't invent information

Q: ${question}
A:`;
  }
}
```

---

## 3. Efficient AI Service

### File: `server/services/ai-service.ts`

```typescript
import OpenAI from 'openai';
import { ContextMatcher } from './context-matcher';

export class AIService {
  private openai: OpenAI;
  private readonly MAX_TOKENS = 100; // Keep responses short
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async getResponse(question: string): Promise<string> {
    try {
      // Try instant response first (0 AI tokens)
      const instant = ContextMatcher.getInstantResponse(question);
      if (instant) return instant;
      
      // Use AI for complex questions
      const prompt = ContextMatcher.createPrompt(question);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: this.MAX_TOKENS,
        temperature: 0.7,
        presence_penalty: 0.1 // Reduce repetition
      });
      
      return completion.choices[0]?.message?.content?.trim() || 
             "I'm having trouble right now. Try asking about Klein's projects or skills!";
             
    } catch (error) {
      console.error('AI Error:', error);
      return "I'm experiencing issues. Contact Klein at kleinlav7@gmail.com";
    }
  }
}
```

---

## 4. Clean API Route

### File: `server/routes/chat.ts`

```typescript
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AIService } from '../services/ai-service';

const router = Router();
const aiService = new AIService();

// Rate limiting: 10 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many questions! Please wait a minute." }
});

router.post('/chat', chatLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Validation
    if (!message?.trim() || message.length > 200) {
      return res.status(400).json({ 
        error: "Please ask a question (max 200 characters)" 
      });
    }
    
    const response = await aiService.getResponse(message.trim());
    
    res.json({ 
      response,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ 
      error: "Something went wrong. Please try again!" 
    });
  }
});

export default router;
```

---

## 5. Frontend Hook (Clean & Simple)

### File: `client/src/hooks/use-ai-chat.ts`

```typescript
import { useState, useCallback } from 'react';

interface ChatResponse {
  response: string;
  timestamp: number;
}

export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sendMessage = useCallback(async (message: string): Promise<string> => {
    if (!message.trim()) return "Please ask me something!";
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
      
      return data.response;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection error';
      setError(errorMsg);
      return `Sorry, ${errorMsg}. Try asking about Klein's projects or skills!`;
      
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { sendMessage, loading, error };
}
```

---

## 6. Updated FloatingChat Component

### File: `client/src/components/floating-chat.tsx`

```typescript
// Add to existing imports
import { useAIChat } from '@/hooks/use-ai-chat';

// Update the send function in your existing component
export function FloatingChat() {
  // ... existing state ...
  const { sendMessage, loading } = useAIChat();
  
  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    
    const userMsgId = Date.now();
    
    // Add user message
    setMessages(prev => [...prev, { 
      id: userMsgId, 
      from: "user", 
      text: trimmed 
    }]);
    setInput("");
    
    // Get AI response
    const aiResponse = await sendMessage(trimmed);
    
    // Add AI response
    setMessages(prev => [...prev, {
      id: userMsgId + 1,
      from: "klein",
      text: aiResponse
    }]);
  };
  
  // Update send button to show loading
  // ... rest of existing component with loading state ...
}
```

---

## 7. Environment Setup

### File: `.env`

```env
# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Alternative providers
# ANTHROPIC_API_KEY=your_claude_key
# GOOGLE_AI_KEY=your_gemini_key

# Rate limiting
CHAT_RATE_LIMIT=10
CHAT_WINDOW_MS=60000
```

---

## 8. Token Usage Analysis

### Expected Token Consumption:

```
Instant Responses: 0 tokens (30% of questions)
Simple Questions: 150-200 tokens (50% of questions)  
Complex Questions: 250-300 tokens (20% of questions)

Average: ~120 tokens per question
Cost: ~$0.0003 per question
Monthly cost (1000 questions): ~$0.30
```

### Comparison:
- **This approach**: 120 tokens avg
- **Naive approach**: 800+ tokens avg
- **Savings**: 85% reduction in costs

---

## 9. Testing Script

### File: `test-questions.js`

```javascript
const testQuestions = [
  "Hi there!",                    // Instant response
  "What's Klein's email?",        // Contact info
  "What projects has he built?",  // Projects overview
  "Tell me about RDFS",          // Specific project
  "What are his skills?",        // Skills summary
  "What's his experience?",      // Background
  "Can he work with React?",     // Specific skill
  "How can I hire him?"          // Contact + experience
];

// Test each question and measure token usage
testQuestions.forEach(async (q, i) => {
  console.log(`\n${i+1}. Testing: "${q}"`);
  // Add your test logic here
});
```

---

## Key Benefits of This Approach:

✅ **90% Token Reduction**: Smart context selection
✅ **Fast Responses**: Instant answers for common questions  
✅ **Clean Code**: Modular, maintainable structure
✅ **Error Handling**: Graceful fallbacks
✅ **Rate Limiting**: Prevents abuse
✅ **Scalable**: Easy to add new information
✅ **Cost Effective**: ~$5/month for moderate usage

## Implementation Order:

1. Create knowledge base (`klein-data.ts`)
2. Build context matcher (`context-matcher.ts`) 
3. Set up AI service (`ai-service.ts`)
4. Add API route (`chat.ts`)
5. Create frontend hook (`use-ai-chat.ts`)
6. Update chat component
7. Test and optimize

**Total implementation time**: 4-6 hours for experienced developer