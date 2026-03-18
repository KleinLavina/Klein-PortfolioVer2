type AppHandler = (req: any, res: any) => any;

declare global {
  // Cache the initialized Express app across warm invocations.
  var __kleinVercelApp: Promise<AppHandler> | undefined;
}

export default async function handler(req: any, res: any) {
  try {
    if (!globalThis.__kleinVercelApp) {
      globalThis.__kleinVercelApp = (async () => {
        const { createApp } = await import("../server/app.ts");
        const { app } = await createApp("none");
        return app as AppHandler;
      })();
    }

    const app = await globalThis.__kleinVercelApp;
    return app(req, res);
  } catch (error) {
    console.error("Vercel API bootstrap failed:", error);
    return res.status(500).json({
      message: "Server bootstrap failed.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
