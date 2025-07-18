import { db } from "./db";
import { learningModules } from "@shared/schema";

const sampleModules = [
  // Foundation modules
  {
    name: "Excel Fundamentals",
    description: "Master the basics of Excel including formulas, functions, and data formatting",
    category: "foundations",
    difficulty: "beginner",
    estimatedHours: 8,
    prerequisites: [],
    isCodeHeavy: false,
    order: 1
  },
  {
    name: "Data Literacy Fundamentals", 
    description: "Understand different types of data, data quality concepts, and basic statistics",
    category: "foundations",
    difficulty: "beginner",
    estimatedHours: 6,
    prerequisites: [],
    isCodeHeavy: false,
    order: 2
  },
  {
    name: "SQL for Data Analysis",
    description: "Learn SQL basics for querying databases and extracting insights",
    category: "tools",
    difficulty: "intermediate",
    estimatedHours: 12,
    prerequisites: ["Data Literacy Fundamentals"],
    isCodeHeavy: true,
    order: 3
  },
  {
    name: "Tableau Fundamentals",
    description: "Create interactive dashboards and visualizations using Tableau",
    category: "tools", 
    difficulty: "intermediate",
    estimatedHours: 10,
    prerequisites: ["Excel Fundamentals", "Data Literacy Fundamentals"],
    isCodeHeavy: false,
    order: 4
  },
  {
    name: "Python for Data Analysis",
    description: "Use Python libraries like pandas and numpy for data manipulation",
    category: "tools",
    difficulty: "intermediate", 
    estimatedHours: 16,
    prerequisites: ["SQL for Data Analysis"],
    isCodeHeavy: true,
    order: 5
  },
  {
    name: "Statistical Analysis Methods",
    description: "Apply statistical methods to analyze data and test hypotheses",
    category: "advanced",
    difficulty: "advanced",
    estimatedHours: 14,
    prerequisites: ["Python for Data Analysis", "SQL for Data Analysis"],
    isCodeHeavy: true,
    order: 6
  },
  {
    name: "Introduction to Machine Learning",
    description: "Understand ML concepts and apply basic algorithms for predictions",
    category: "advanced",
    difficulty: "advanced",
    estimatedHours: 18,
    prerequisites: ["Python for Data Analysis", "Statistical Analysis Methods"],
    isCodeHeavy: true,
    order: 7
  },
  {
    name: "Business Intelligence Tools",
    description: "Master BI tools like Power BI for enterprise reporting and analytics",
    category: "career",
    difficulty: "intermediate",
    estimatedHours: 12,
    prerequisites: ["Tableau Fundamentals", "SQL for Data Analysis"], 
    isCodeHeavy: false,
    order: 8
  },
  {
    name: "Data Storytelling & Communication",
    description: "Learn to communicate insights effectively through data narratives",
    category: "career",
    difficulty: "intermediate",
    estimatedHours: 8,
    prerequisites: ["Tableau Fundamentals"],
    isCodeHeavy: false,
    order: 9
  }
];

export async function seedLearningModules() {
  try {
    console.log("Seeding learning modules...");
    
    for (const module of sampleModules) {
      await db.insert(learningModules).values(module).onConflictDoNothing();
    }
    
    console.log(`Successfully seeded ${sampleModules.length} learning modules`);
  } catch (error) {
    console.error("Error seeding learning modules:", error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await seedLearningModules();
  process.exit(0);
}