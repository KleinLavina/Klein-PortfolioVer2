import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
      }
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(5);

      if (error) throw error;

      setProjects(data || []);
      setStatus('success');
      console.log('✅ Supabase connected! Projects:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
      console.error('❌ Supabase connection failed:', err);
    }
  };

  if (status === 'testing') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">🔄 Testing Supabase connection...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">❌ Supabase connection failed:</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-800 font-semibold">✅ Supabase connected successfully!</p>
      <p className="text-green-700 text-sm mt-1">
        Found {projects.length} project(s) in database
      </p>
      {projects.length > 0 && (
        <div className="mt-2">
          <p className="text-green-600 text-xs">Sample project:</p>
          <p className="text-green-800 text-sm font-medium">{projects[0].title}</p>
        </div>
      )}
    </div>
  );
}
