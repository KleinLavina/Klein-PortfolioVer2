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
        body: JSON.stringify({
          clientId: 'legacy-hook-client',
          message: message.trim(),
          history: [],
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.message || data.error || 'Failed to get response');
      }
      
      return data.reply || data.response || 'No response returned.';
      
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
