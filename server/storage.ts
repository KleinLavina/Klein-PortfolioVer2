import { query, queryOne } from "./db.ts";
import type {
  Achievement,
  InsertAchievement,
  InsertMessage,
  InsertProject,
  Message,
  Project,
} from "../shared/schema.ts";

type MessageRow = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type ProjectRow = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
};

type AchievementRow = {
  id: number;
  title: string;
  description: string;
  date: string;
};

function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
  };
}

function mapProjectRow(row: ProjectRow): Project {
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

function mapAchievementRow(row: AchievementRow): Achievement {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
  };
}

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
    const row = await queryOne<MessageRow>(
      `INSERT INTO public.messages (name, email, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [insertMessage.name, insertMessage.email, insertMessage.message],
    );
    if (!row) throw new Error("Failed to create message: no row returned.");
    return mapMessageRow(row);
  }

  async getMessages(): Promise<Message[]> {
    const rows = await query<MessageRow>(
      `SELECT * FROM public.messages ORDER BY created_at DESC`,
    );
    return rows.map(mapMessageRow);
  }

  async getProjects(): Promise<Project[]> {
    const rows = await query<ProjectRow>(
      `SELECT * FROM public.projects ORDER BY id ASC`,
    );
    return rows.map(mapProjectRow);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const row = await queryOne<ProjectRow>(
      `INSERT INTO public.projects (title, description, thumbnail, tech_stack, live_url, github_url)
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
    return mapProjectRow(row);
  }

  async getAchievements(): Promise<Achievement[]> {
    const rows = await query<AchievementRow>(
      `SELECT * FROM public.achievements ORDER BY id ASC`,
    );
    return rows.map(mapAchievementRow);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const row = await queryOne<AchievementRow>(
      `INSERT INTO public.achievements (title, description, date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [insertAchievement.title, insertAchievement.description, insertAchievement.date],
    );
    if (!row) throw new Error("Failed to create achievement: no row returned.");
    return mapAchievementRow(row);
  }
}

export const storage = new PostgresStorage();
