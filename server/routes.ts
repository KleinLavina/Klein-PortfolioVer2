import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GitHub API routes
  app.get("/api/github/contributions/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const { year } = req.query;

      const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();
      
      // Use GitHub's contribution graph SVG as fallback
      // This provides visual data without requiring authentication
      const svgUrl = `https://ghchart.rshah.org/${username}`;
      
      // For now, return a simplified response that the frontend can handle
      // The actual contribution data requires GraphQL API with token
      res.json({
        username,
        year: selectedYear,
        totalContributions: 0,
        weeks: [],
        useFallback: true,
        svgUrl
      });

    } catch (error) {
      console.error("Error fetching GitHub contributions:", error);
      res.status(500).json({ 
        error: "Failed to fetch contributions",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/github/stats/:username", async (req, res) => {
    try {
      const { username } = req.params;

      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      res.json({
        username: data.login,
        name: data.name,
        avatarUrl: data.avatar_url,
        publicRepos: data.public_repos,
        followers: data.followers,
        following: data.following,
        bio: data.bio,
        location: data.location,
        company: data.company,
      });

    } catch (error) {
      console.error("Error fetching GitHub stats:", error);
      res.status(500).json({ 
        error: "Failed to fetch user stats",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Messages API
  app.get(api.messages.list.path, async (req, res) => {
    const allMessages = await storage.getMessages();
    res.json(allMessages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Projects API
  app.get(api.projects.list.path, async (req, res) => {
    const allProjects = await storage.getProjects();
    res.json(allProjects);
  });

  // Achievements API
  app.get(api.achievements.list.path, async (req, res) => {
    const allAchievements = await storage.getAchievements();
    res.json(allAchievements);
  });

  // Seed data function
  async function seedDatabase() {
    try {
      const existingProjects = await storage.getProjects();
      if (existingProjects.length === 0) {
        await storage.createProject({
          title: "E-Commerce Platform",
          description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration.",
          thumbnail: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80",
          techStack: ["React", "Node.js", "Express", "PostgreSQL", "Stripe"],
          liveUrl: "https://example.com",
          githubUrl: "https://github.com"
        });
        await storage.createProject({
          title: "Task Management App",
          description: "A collaborative task management tool with real-time updates using WebSockets.",
          thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80",
          techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
          liveUrl: "https://example.com",
          githubUrl: "https://github.com"
        });
        await storage.createProject({
          title: "Portfolio Website",
          description: "A modern developer portfolio built with React and Framer Motion.",
          thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
          techStack: ["React", "Framer Motion", "Tailwind CSS"],
          githubUrl: "https://github.com"
        });
      }

      const existingAchievements = await storage.getAchievements();
      if (existingAchievements.length === 0) {
        await storage.createAchievement({
          title: "AWS Certified Solutions Architect",
          description: "Achieved the associate level certification for AWS.",
          date: "2025"
        });
        await storage.createAchievement({
          title: "Hackathon Winner",
          description: "First place at the Global Tech Hackathon for an innovative AI solution.",
          date: "2024"
        });
        await storage.createAchievement({
          title: "Open Source Contributor",
          description: "Major contributions to popular React UI libraries.",
          date: "2023 - Present"
        });
      }
    } catch (e) {
      console.error("Error seeding database", e);
    }
  }

  // Call seed function
  seedDatabase();

  return httpServer;
}
