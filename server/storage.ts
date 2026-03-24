import {
  type Achievement,
  type InsertAchievement,
  type InsertMessage,
  type InsertProject,
  type Message,
  type Project,
} from "../shared/schema.ts";
import { query, queryOne } from "./db.ts";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class PostgresStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const row = await queryOne<{
      id: number;
      name: string;
      email: string;
      message: string;
      created_at: string;
    }>(
      `INSERT INTO messages (name, email, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [insertMessage.name, insertMessage.email, insertMessage.message],
    );
    if (!row) throw new Error("Failed to create message: no row returned.");
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: row.created_at,
    };
  }

  async getMessages(): Promise<Message[]> {
    const rows = await query<{
      id: number;
      name: string;
      email: string;
      message: string;
      created_at: string;
    }>(`SELECT * FROM messages ORDER BY created_at DESC`);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: row.created_at,
    }));
  }

  async getProjects(): Promise<Project[]> {
    const rows = await query<{
      id: number;
      title: string;
      description: string;
      thumbnail: string;
      tech_stack: string[];
      live_url: string | null;
      github_url: string | null;
    }>(`SELECT * FROM projects ORDER BY id ASC`);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail,
      techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
      liveUrl: row.live_url,
      githubUrl: row.github_url,
    }));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const row = await queryOne<{
      id: number;
      title: string;
      description: string;
      thumbnail: string;
      tech_stack: string[];
      live_url: string | null;
      github_url: string | null;
    }>(
      `INSERT INTO projects (title, description, thumbnail, tech_stack, live_url, github_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        insertProject.title,
        insertProject.description,
        insertProject.thumbnail,
        JSON.stringify(insertProject.techStack),
        insertProject.liveUrl ?? null,
        insertProject.githubUrl ?? null,
      ],
    );
    if (!row) throw new Error("Failed to create project: no row returned.");
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail,
      techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
      liveUrl: row.live_url,
      githubUrl: row.github_url,
    };
  }

  async getAchievements(): Promise<Achievement[]> {
    const rows = await query<{
      id: number;
      title: string;
      description: string;
      date: string;
    }>(`SELECT * FROM achievements ORDER BY id ASC`);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
    }));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const row = await queryOne<{
      id: number;
      title: string;
      description: string;
      date: string;
    }>(
      `INSERT INTO achievements (title, description, date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [insertAchievement.title, insertAchievement.description, insertAchievement.date],
    );
    if (!row) throw new Error("Failed to create achievement: no row returned.");
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
    };
  }
}

export const storage = new PostgresStorage();
