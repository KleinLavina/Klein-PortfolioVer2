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
      // Use Netlify function instead of /api/chat
      const response = await fetch('/.netlify/functions/chat', {
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