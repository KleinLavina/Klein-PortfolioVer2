import {
  type Achievement,
  type InsertAchievement,
  type InsertMessage,
  type InsertProject,
  type Message,
  type Project,
} from "../shared/schema.ts";
import { getServerSupabase, unwrapSupabaseResult } from "./supabase.ts";

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

export class SupabaseStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("messages")
      .insert({
        name: insertMessage.name,
        email: insertMessage.email,
        message: insertMessage.message,
      })
      .select("*")
      .single();

    const row = unwrapSupabaseResult(
      result.data as MessageRow | null,
      result.error,
      "Failed to create message",
    );
    if (!row) {
      throw new Error("Failed to create message: Supabase returned no row.");
    }

    return mapMessageRow(row);
  }

  async getMessages(): Promise<Message[]> {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    const rows = unwrapSupabaseResult(
      (result.data ?? []) as MessageRow[],
      result.error,
      "Failed to load messages",
    );

    return rows.map(mapMessageRow);
  }

  async getProjects(): Promise<Project[]> {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: true });

    const rows = unwrapSupabaseResult(
      (result.data ?? []) as ProjectRow[],
      result.error,
      "Failed to load projects",
    );

    return rows.map(mapProjectRow);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("projects")
      .insert({
        title: insertProject.title,
        description: insertProject.description,
        thumbnail: insertProject.thumbnail,
        tech_stack: insertProject.techStack,
        live_url: insertProject.liveUrl ?? null,
        github_url: insertProject.githubUrl ?? null,
      })
      .select("*")
      .single();

    const row = unwrapSupabaseResult(
      result.data as ProjectRow | null,
      result.error,
      "Failed to create project",
    );
    if (!row) {
      throw new Error("Failed to create project: Supabase returned no row.");
    }

    return mapProjectRow(row);
  }

  async getAchievements(): Promise<Achievement[]> {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("achievements")
      .select("*")
      .order("id", { ascending: true });

    const rows = unwrapSupabaseResult(
      (result.data ?? []) as AchievementRow[],
      result.error,
      "Failed to load achievements",
    );

    return rows.map(mapAchievementRow);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("achievements")
      .insert({
        title: insertAchievement.title,
        description: insertAchievement.description,
        date: insertAchievement.date,
      })
      .select("*")
      .single();

    const row = unwrapSupabaseResult(
      result.data as AchievementRow | null,
      result.error,
      "Failed to create achievement",
    );
    if (!row) {
      throw new Error("Failed to create achievement: Supabase returned no row.");
    }

    return mapAchievementRow(row);
  }
}

export const storage = new SupabaseStorage();
