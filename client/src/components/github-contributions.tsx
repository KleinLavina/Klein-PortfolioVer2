import { useState } from "react";
import { Github, Loader2 } from "lucide-react";

const GITHUB_USERNAME = "KleinLavina";
const CHART_FRAME_MIN_HEIGHT = 220;

export function GithubContributions() {
  const [loading, setLoading] = useState(true);

  const handleChartLoad = () => {
    setLoading(false);
  };

  return (
    <section id="github" className="relative">
      <div className="relative box-border flex min-h-[100svh] flex-col justify-center py-16">
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">The Days I Code</h3>
                <p className="text-sm text-muted-foreground">@{GITHUB_USERNAME}</p>
                <a
                  href={`https://github.com/${GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
                >
                  View full activity on GitHub (including private contributions)
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="glass-card overflow-hidden rounded-3xl p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">
                    GitHub Contribution Activity
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-white">Less</span>
                    <div className="flex gap-1">
                      <div className="h-3 w-3 rounded-sm bg-[#ebedf0] dark:bg-[#161b22]" />
                      <div className="h-3 w-3 rounded-sm bg-[#d6e685]" />
                      <div className="h-3 w-3 rounded-sm bg-[#8cc665]" />
                      <div className="h-3 w-3 rounded-sm bg-[#44a340]" />
                      <div className="h-3 w-3 rounded-sm bg-[#1e6823]" />
                    </div>
                    <span>More</span>
                  </div>
                </div>

                <div
                  className="relative flex items-center justify-center overflow-x-auto rounded-2xl bg-background/50 p-4"
                  style={{ minHeight: `${CHART_FRAME_MIN_HEIGHT}px` }}
                >
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : null}

                  <img
                    src={`https://ghchart.rshah.org/${GITHUB_USERNAME}`}
                    alt={`${GITHUB_USERNAME}'s GitHub Contributions`}
                    className="h-auto max-w-full"
                    style={{
                      imageRendering: "crisp-edges",
                      opacity: loading ? 0 : 1,
                    }}
                    onLoad={handleChartLoad}
                    onError={handleChartLoad}
                  />
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Contribution graph powered by GitHub
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
