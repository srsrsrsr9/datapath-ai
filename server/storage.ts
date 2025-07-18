import {
  users,
  questionnaireResponses,
  learningModules,
  userProgress,
  roadmapConfigurations,
  type User,
  type UpsertUser,
  type QuestionnaireResponse,
  type InsertQuestionnaireResponse,
  type LearningModule,
  type InsertLearningModule,
  type UserProgress,
  type InsertUserProgress,
  type RoadmapConfiguration,
  type InsertRoadmapConfiguration,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gt } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Email verification
  updateEmailVerification(userId: string, token: string): Promise<void>;
  verifyEmailToken(token: string): Promise<User | undefined>;
  markEmailAsVerified(userId: string): Promise<void>;
  
  // Questionnaire operations
  saveQuestionnaireResponse(response: InsertQuestionnaireResponse): Promise<QuestionnaireResponse>;
  getQuestionnaireResponse(userId: string): Promise<QuestionnaireResponse | undefined>;
  
  // Learning modules
  getAllLearningModules(): Promise<LearningModule[]>;
  createLearningModule(module: InsertLearningModule): Promise<LearningModule>;
  
  // Progress tracking
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getModuleProgress(userId: string, moduleId: number): Promise<UserProgress | undefined>;
  
  // Roadmap configuration
  saveRoadmapConfiguration(config: InsertRoadmapConfiguration): Promise<RoadmapConfiguration>;
  getRoadmapConfiguration(userId: string): Promise<RoadmapConfiguration | undefined>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllQuestionnaireResponses(): Promise<(QuestionnaireResponse & { user: User })[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    recentSignups: number;
    averageCompletion: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Email verification
  async updateEmailVerification(userId: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        emailVerificationToken: token,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async verifyEmailToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));
    return user;
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        isEmailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Questionnaire operations
  async saveQuestionnaireResponse(response: InsertQuestionnaireResponse): Promise<QuestionnaireResponse> {
    const [savedResponse] = await db
      .insert(questionnaireResponses)
      .values(response)
      .returning();
    return savedResponse;
  }

  async getQuestionnaireResponse(userId: string): Promise<QuestionnaireResponse | undefined> {
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, userId))
      .orderBy(desc(questionnaireResponses.createdAt));
    return response;
  }

  // Learning modules
  async getAllLearningModules(): Promise<LearningModule[]> {
    return await db
      .select()
      .from(learningModules)
      .orderBy(learningModules.order);
  }

  async createLearningModule(module: InsertLearningModule): Promise<LearningModule> {
    const [created] = await db
      .insert(learningModules)
      .values(module)
      .returning();
    return created;
  }

  // Progress tracking
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getModuleProgress(progress.userId, progress.moduleId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          ...progress,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userProgress.userId, progress.userId),
          eq(userProgress.moduleId, progress.moduleId)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values(progress)
        .returning();
      return created;
    }
  }

  async getModuleProgress(userId: string, moduleId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.moduleId, moduleId)
      ));
    return progress;
  }

  // Roadmap configuration
  async saveRoadmapConfiguration(config: InsertRoadmapConfiguration): Promise<RoadmapConfiguration> {
    const existing = await this.getRoadmapConfiguration(config.userId);
    
    if (existing) {
      const [updated] = await db
        .update(roadmapConfigurations)
        .set(config)
        .where(eq(roadmapConfigurations.userId, config.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(roadmapConfigurations)
        .values(config)
        .returning();
      return created;
    }
  }

  async getRoadmapConfiguration(userId: string): Promise<RoadmapConfiguration | undefined> {
    const [config] = await db
      .select()
      .from(roadmapConfigurations)
      .where(eq(roadmapConfigurations.userId, userId));
    return config;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getAllQuestionnaireResponses(): Promise<(QuestionnaireResponse & { user: User })[]> {
    const results = await db
      .select({
        id: questionnaireResponses.id,
        userId: questionnaireResponses.userId,
        primaryGoal: questionnaireResponses.primaryGoal,
        experienceLevel: questionnaireResponses.experienceLevel,
        codingPreference: questionnaireResponses.codingPreference,
        createdAt: questionnaireResponses.createdAt,
        user: users,
      })
      .from(questionnaireResponses)
      .leftJoin(users, eq(questionnaireResponses.userId, users.id))
      .orderBy(desc(questionnaireResponses.createdAt));
    
    return results.filter(r => r.user !== null) as (QuestionnaireResponse & { user: User })[];
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    recentSignups: number;
    averageCompletion: number;
  }> {
    // Get total users
    const totalUsersResult = await db.select().from(users);
    const totalUsers = totalUsersResult.length;

    // Get verified users
    const verifiedUsersResult = await db.select().from(users).where(eq(users.isEmailVerified, true));
    const verifiedUsers = verifiedUsersResult.length;

    // Get recent signups (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentSignupsResult = await db.select().from(users).where(gt(users.createdAt, yesterday));
    const recentSignups = recentSignupsResult.length;

    // Calculate average completion (simplified)
    const allProgress = await db.select().from(userProgress);
    const averageCompletion = allProgress.length > 0 
      ? allProgress.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / allProgress.length
      : 0;

    return {
      totalUsers: Number(totalUsers),
      verifiedUsers: Number(verifiedUsers),
      recentSignups: Number(recentSignups),
      averageCompletion: Math.round(averageCompletion),
    };
  }
}

export const storage = new DatabaseStorage();
