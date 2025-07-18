import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { emailService } from "./emailService";
import { 
  insertQuestionnaireResponseSchema,
  insertUserProgressSchema,
  insertLearningModuleSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email verification routes
  app.post('/api/auth/send-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const token = emailService.generateVerificationToken();
      await storage.updateEmailVerification(userId, token);
      await emailService.sendVerificationEmail(user.email!, token, user.firstName || undefined);

      res.json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      const user = await storage.verifyEmailToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      await storage.markEmailAsVerified(user.id);
      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Questionnaire routes
  app.post('/api/questionnaire', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertQuestionnaireResponseSchema.parse({
        ...req.body,
        userId,
      });

      const response = await storage.saveQuestionnaireResponse(validatedData);
      
      // Generate custom roadmap based on responses
      const customRoadmap = await generateCustomRoadmap(validatedData);
      await storage.saveRoadmapConfiguration({
        userId,
        moduleIds: customRoadmap.moduleIds,
        customOrder: customRoadmap.customOrder,
      });

      res.json(response);
    } catch (error) {
      console.error("Error saving questionnaire response:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid questionnaire data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save questionnaire response" });
      }
    }
  });

  app.get('/api/questionnaire', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const response = await storage.getQuestionnaireResponse(userId);
      res.json(response);
    } catch (error) {
      console.error("Error fetching questionnaire response:", error);
      res.status(500).json({ message: "Failed to fetch questionnaire response" });
    }
  });

  // Learning modules routes
  app.get('/api/modules', isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.getAllLearningModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching learning modules:", error);
      res.status(500).json({ message: "Failed to fetch learning modules" });
    }
  });

  app.post('/api/modules', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertLearningModuleSchema.parse(req.body);
      const module = await storage.createLearningModule(validatedData);
      res.json(module);
    } catch (error) {
      console.error("Error creating learning module:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid module data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create learning module" });
      }
    }
  });

  // Progress tracking routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.post('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertUserProgressSchema.parse({
        ...req.body,
        userId,
      });

      const progress = await storage.updateUserProgress(validatedData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating user progress:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user progress" });
      }
    }
  });

  // Roadmap configuration routes
  app.get('/api/roadmap', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const config = await storage.getRoadmapConfiguration(userId);
      
      if (!config) {
        // If no custom roadmap exists, generate default one
        const questionnaireResponse = await storage.getQuestionnaireResponse(userId);
        if (questionnaireResponse) {
          const customRoadmap = await generateCustomRoadmap(questionnaireResponse);
          const savedConfig = await storage.saveRoadmapConfiguration({
            userId,
            moduleIds: customRoadmap.moduleIds,
            customOrder: customRoadmap.customOrder,
          });
          return res.json(savedConfig);
        }
      }
      
      res.json(config);
    } catch (error) {
      console.error("Error fetching roadmap configuration:", error);
      res.status(500).json({ message: "Failed to fetch roadmap configuration" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/responses', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const responses = await storage.getAllQuestionnaireResponses();
      res.json(responses);
    } catch (error) {
      console.error("Error fetching questionnaire responses:", error);
      res.status(500).json({ message: "Failed to fetch questionnaire responses" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Custom roadmap generation algorithm
async function generateCustomRoadmap(questionnaire: {
  primaryGoal: string;
  experienceLevel: string;
  codingPreference: string;
}): Promise<{ moduleIds: number[]; customOrder: number[] }> {
  const allModules = await storage.getAllLearningModules();
  
  // Filter and order modules based on questionnaire responses
  let filteredModules = [...allModules];
  
  // Filter by coding preference
  if (questionnaire.codingPreference === 'avoid') {
    filteredModules = filteredModules.filter(module => !module.isCodeHeavy);
  } else if (questionnaire.codingPreference === 'love') {
    // Prioritize code-heavy modules
    filteredModules.sort((a, b) => {
      if (a.isCodeHeavy && !b.isCodeHeavy) return -1;
      if (!a.isCodeHeavy && b.isCodeHeavy) return 1;
      return 0;
    });
  }
  
  // Adjust based on experience level
  if (questionnaire.experienceLevel === 'beginner') {
    // Start with foundational modules
    filteredModules.sort((a, b) => {
      if (a.category === 'foundations' && b.category !== 'foundations') return -1;
      if (a.category !== 'foundations' && b.category === 'foundations') return 1;
      return a.order - b.order;
    });
  } else if (questionnaire.experienceLevel === 'intermediate') {
    // Skip some basics, focus on tools and advanced topics
    filteredModules = filteredModules.filter(module => 
      module.difficulty !== 'beginner' || module.category === 'tools'
    );
  }
  
  // Adjust based on primary goal
  if (questionnaire.primaryGoal === 'job' || questionnaire.primaryGoal === 'switch') {
    // Prioritize career preparation modules
    filteredModules.sort((a, b) => {
      if (a.category === 'career' && b.category !== 'career') return -1;
      if (a.category !== 'career' && b.category === 'career') return 1;
      return a.order - b.order;
    });
  }
  
  const moduleIds = filteredModules.map(module => module.id);
  const customOrder = filteredModules.map((_, index) => index + 1);
  
  return { moduleIds, customOrder };
}
