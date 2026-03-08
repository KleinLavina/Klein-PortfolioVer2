import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GITHUB_USERNAME = "KleinLavina";

interface GitHubStats {
  username: string;
  name: string;
  publicRepos: number;
  followers: number;
  following: number;
}

export function GithubContributions() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch GitHub stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/github/stats/${GITHUB_USERNAME}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load GitHub data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Get color intensity based on contribution count
  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-muted/30 dark:bg-muted/20';
    if (count < 3) return 'bg-green-300 dark:bg-green-900';
    if (count < 6) return 'bg-green-400 dark:bg-green-700';
    if (count < 9) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
          <Github className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">The Days I Code</h3>
          <p className="text-sm text-muted-foreground">@{GITHUB_USERNAME}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {error.includes("token") && (
              <div className="mt-2 text-xs">
                <p>To fix this:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">GitHub Settings → Tokens</a></li>
                  <li>Create a new token with 'read:user' scope</li>
                  <li>Add it to your .env file: GITHUB_TOKEN=your_token_here</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* GitHub Contribution Calendar - Using Image Embed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-6 rounded-3xl glass-card overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">
              GitHub Contribution Activity
            </p>
            
            {/* GitHub Contribution Chart */}
            <div className="flex justify-center items-center bg-background/50 rounded-2xl p-4 overflow-x-auto">
              <img 
                src={`https://ghchart.rshah.org/${GITHUB_USERNAME}`}
                alt={`${GITHUB_USERNAME}'s GitHub Contributions`}
                className="max-w-full h-auto"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Contribution graph powered by GitHub
            </p>
          </div>
        )}
      </motion.div>

      {/* Real Stats Footer */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl glass-card text-center"
          >
            <div className="text-2xl font-black text-secondary">{stats.publicRepos}</div>
            <div className="text-xs font-semibold text-muted-foreground mt-1">Repositories</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl glass-card text-center"
          >
            <div className="text-2xl font-black text-accent">{stats.followers}</div>
            <div className="text-xs font-semibold text-muted-foreground mt-1">Followers</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl glass-card text-center"
          >
            <div className="text-2xl font-black text-gradient">{stats.following}</div>
            <div className="text-xs font-semibold text-muted-foreground mt-1">Following</div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
