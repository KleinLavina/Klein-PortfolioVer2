import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Loader2 } from "lucide-react";

const GITHUB_USERNAME = "KleinLavina";

export function GithubContributions() {
  const [loading, setLoading] = useState(true);

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
          <a 
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 mt-1"
          >
            View full activity on GitHub (including private contributions)
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

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
        ) : null}
        
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
              onLoad={() => setLoading(false)}
            />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Contribution graph powered by GitHub
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
