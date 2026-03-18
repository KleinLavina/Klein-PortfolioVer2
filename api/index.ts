import { createApp } from "../server/app";

const appPromise = createApp("none");

export default async function handler(req: any, res: any) {
  try {
    const { app } = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error("Vercel API bootstrap failed:", error);
    return res.status(500).json({
      message: "Server bootstrap failed.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
