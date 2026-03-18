import { Handler } from '@netlify/functions';

// Your knowledge base (copy from your server code)
const KLEIN_DATA = {
  identity: "Klein F. Lavina, Fresh BSIT Graduate, PhilNITS Certified, Philippines",
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
      databases: "PostgreSQL, MySQL, SQLite"
    },
    projects: {
      rdfs: {
        name: "RDFS - Real-time Dispatch System",
        desc: "Capstone: QR driver queuing, live tracking for Maasin Terminal",
        tech: "Django, PostgreSQL, JavaScript"
      },
      wise: {
        name: "WISE-PENRO - Document Tracking", 
        desc: "PENRO workflow system with role-based access",
        tech: "Django, PostgreSQL, Brevo SMTP"
      }
    },
    experience: {
      status: "Fresh graduate with internship + personal project experience",
      approach: "Values honesty, ownership, continuous learning",
      stats: "8+ projects built, 15+ tech stacks, PhilNITS certified"
    }
  }
};

// Instant responses (no AI needed)
const INSTANT_RESPONSES: Record<string, string> = {
  "hi|hello|hey": "Hi! I'm Klein's AI assistant. Ask me about his projects, skills, or contact info! 👋",
  "contact|email|phone|reach": "Contact Klein: kleinlav7@gmail.com or +639380734878. GitHub: github.com/KleinLavina",
  "location|where|philippines": "Klein is based in the Philippines 🇵🇭"
};

// Context matcher
function getInstantResponse(question: string): string | null {
  const q = question.toLowerCase();
  
  for (const [pattern, response] of Object.entries(INSTANT_RESPONSES)) {
    if (pattern.split('|').some(keyword => q.includes(keyword))) {
      return response;
    }
  }
  return null;
}

function buildContext(question: string): string {
  const q = question.toLowerCase();
  const { identity, categories } = KLEIN_DATA;
  
  let context = identity;
  
  if (matches(q, ['project', 'built', 'work', 'rdfs', 'wise'])) {
    context += `\n\nProjects: RDFS (capstone dispatch system), WISE-PENRO (document tracking)`;
  }
  
  if (matches(q, ['skill', 'tech', 'language', 'framework', 'know'])) {
    context += `\n\nSkills: ${categories.skills.primary}. Frontend: ${categories.skills.frontend}. Backend: ${categories.skills.backend}`;
  }
  
  if (matches(q, ['experience', 'background', 'graduate', 'work'])) {
    context += `\n\nExperience: ${categories.experience.status}. ${categories.experience.stats}`;
  }
  
  return context;
}

function matches(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword));
}

async function getAIResponse(question: string): Promise<string> {
  try {
    // Check for instant response first
    const instant = getInstantResponse(question);
    if (instant) return instant;
    
    const context = buildContext(question);
    const prompt = `You're Klein's portfolio assistant. Answer based on this context:

${context}

Rules:
- Be friendly and conversational
- Keep responses under 3 sentences
- If info not in context: "Contact Klein directly for more details"
- Don't invent information

Q: ${question}
A:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 
           "I'm having trouble right now. Try asking about Klein's projects or skills!";
           
  } catch (error) {
    console.error('AI Error:', error);
    return "I'm experiencing issues. Contact Klein at kleinlav7@gmail.com";
  }
}

export const handler: Handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');
    
    // Validation
    if (!message?.trim() || message.length > 200) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: "Please ask a question (max 200 characters)" 
        })
      };
    }

    const response = await getAIResponse(message.trim());
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        response,
        timestamp: Date.now()
      })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Something went wrong. Please try again!" 
      })
    };
  }
};