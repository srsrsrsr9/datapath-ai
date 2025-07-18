import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  BookOpen, 
  CheckCircle, 
  PlayCircle, 
  Lock,
  Clock,
  TrendingUp
} from "lucide-react";
import type { LearningModule, UserProgress, RoadmapConfiguration } from "@shared/schema";

interface RoadmapVisualizationProps {
  modules: LearningModule[];
  userProgress: UserProgress[];
  roadmapConfig?: RoadmapConfiguration | null;
}

export function RoadmapVisualization({ modules, userProgress, roadmapConfig }: RoadmapVisualizationProps) {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async ({ moduleId, status, progressPercentage }: {
      moduleId: number;
      status: string;
      progressPercentage?: number;
    }) => {
      await apiRequest("POST", "/api/progress", {
        moduleId,
        status,
        progressPercentage: progressPercentage || 0,
        startedAt: status === 'in_progress' ? new Date().toISOString() : undefined,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({
        title: "Progress Updated",
        description: "Your learning progress has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getModuleProgress = (moduleId: number) => {
    return userProgress.find(p => p.moduleId === moduleId);
  };

  const getModuleStatus = (module: LearningModule) => {
    const progress = getModuleProgress(module.id);
    if (!progress) return 'not_started';
    return progress.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-yellow-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return PlayCircle;
      default: return Lock;
    }
  };

  const handleModuleClick = (module: LearningModule) => {
    setSelectedModule(module);
  };

  const handleStartModule = (module: LearningModule) => {
    updateProgressMutation.mutate({
      moduleId: module.id,
      status: 'in_progress',
      progressPercentage: 10,
    });
  };

  const handleCompleteModule = (module: LearningModule) => {
    updateProgressMutation.mutate({
      moduleId: module.id,
      status: 'completed',
      progressPercentage: 100,
    });
  };

  // Sort modules by roadmap configuration or default order
  const sortedModules = [...modules].sort((a, b) => {
    if (roadmapConfig) {
      const aIndex = roadmapConfig.moduleIds.indexOf(a.id);
      const bIndex = roadmapConfig.moduleIds.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
    }
    return a.order - b.order;
  });

  // Group modules by category
  const modulesByCategory = sortedModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, LearningModule[]>);

  const categoryTitles = {
    foundations: 'Phase 1: Foundations',
    tools: 'Phase 2: Tools & Techniques',
    advanced: 'Phase 3: Advanced Skills',
    career: 'Phase 4: Career Preparation'
  };

  return (
    <div className="space-y-8">
      {/* SVG Roadmap Visualization */}
      <div className="bg-slate-50 rounded-lg p-6 overflow-x-auto">
        <svg width="100%" height="600" viewBox="0 0 1200 600" className="min-w-[800px]">
          {/* Connection Lines */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>
          
          {Object.entries(modulesByCategory).map(([category, categoryModules], categoryIndex) => {
            const yOffset = categoryIndex * 120 + 80;
            
            return (
              <g key={category}>
                {/* Category Title */}
                <text x="50" y={yOffset - 20} className="text-lg font-semibold fill-slate-900">
                  {categoryTitles[category as keyof typeof categoryTitles] || category}
                </text>
                
                {categoryModules.map((module, moduleIndex) => {
                  const xOffset = moduleIndex * 180 + 100;
                  const status = getModuleStatus(module);
                  const progress = getModuleProgress(module.id);
                  
                  let fillColor = '#e2e8f0'; // default gray
                  if (status === 'completed') fillColor = '#10b981'; // green
                  else if (status === 'in_progress') fillColor = '#f59e0b'; // amber
                  
                  return (
                    <g key={module.id}>
                      {/* Connection line to next module */}
                      {moduleIndex < categoryModules.length - 1 && (
                        <line 
                          x1={xOffset + 25} 
                          y1={yOffset} 
                          x2={xOffset + 155} 
                          y2={yOffset} 
                          stroke="#64748b" 
                          strokeWidth="2" 
                          markerEnd="url(#arrowhead)"
                        />
                      )}
                      
                      {/* Module Node */}
                      <circle 
                        cx={xOffset} 
                        cy={yOffset} 
                        r="25" 
                        fill={fillColor}
                        stroke="white" 
                        strokeWidth="4" 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleModuleClick(module)}
                      />
                      
                      {/* Module Icon/Text */}
                      <text 
                        x={xOffset} 
                        y={yOffset + 5} 
                        textAnchor="middle" 
                        className="text-xs font-medium fill-white pointer-events-none"
                      >
                        {module.name.substring(0, 3)}
                      </text>
                      
                      {/* Module Label */}
                      <text 
                        x={xOffset} 
                        y={yOffset + 45} 
                        textAnchor="middle" 
                        className="text-sm fill-slate-700 pointer-events-none max-w-[120px]"
                      >
                        {module.name.length > 15 ? `${module.name.substring(0, 15)}...` : module.name}
                      </text>
                      
                      {/* Progress indicator for in-progress modules */}
                      {status === 'in_progress' && progress && (
                        <text 
                          x={xOffset} 
                          y={yOffset + 60} 
                          textAnchor="middle" 
                          className="text-xs fill-amber-600"
                        >
                          {progress.progressPercentage}%
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform="translate(950, 80)">
            <text x="0" y="0" className="text-sm font-semibold fill-slate-900">Legend</text>
            <circle cx="20" cy="25" r="8" fill="#10b981" />
            <text x="35" y="30" className="text-xs fill-slate-700">Completed</text>
            <circle cx="20" cy="45" r="8" fill="#f59e0b" />
            <text x="35" y="50" className="text-xs fill-slate-700">In Progress</text>
            <circle cx="20" cy="65" r="8" fill="#e2e8f0" />
            <text x="35" y="70" className="text-xs fill-slate-700">Not Started</text>
          </g>
        </svg>
      </div>

      {/* Module Details Modal */}
      {selectedModule && (
        <Card className="border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedModule.name}</h3>
                <p className="text-slate-600 mb-4">{selectedModule.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedModule(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">
                {selectedModule.category}
              </Badge>
              <Badge variant="outline">
                {selectedModule.difficulty}
              </Badge>
              {selectedModule.estimatedHours && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {selectedModule.estimatedHours}h
                </Badge>
              )}
              {selectedModule.isCodeHeavy && (
                <Badge variant="outline">
                  Code Heavy
                </Badge>
              )}
            </div>

            {/* Progress Section */}
            {(() => {
              const progress = getModuleProgress(selectedModule.id);
              const status = getModuleStatus(selectedModule);
              
              return (
                <div className="space-y-4">
                  {progress && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-slate-600">{progress.progressPercentage}%</span>
                      </div>
                      <Progress value={progress.progressPercentage} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {status === 'not_started' && (
                      <Button 
                        onClick={() => handleStartModule(selectedModule)}
                        disabled={updateProgressMutation.isPending}
                        className="flex-1"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    )}
                    
                    {status === 'in_progress' && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // TODO: Open module content
                            toast({
                              title: "Feature Coming Soon",
                              description: "Module content will be available soon!",
                            });
                          }}
                          className="flex-1"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                        <Button 
                          onClick={() => handleCompleteModule(selectedModule)}
                          disabled={updateProgressMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      </>
                    )}
                    
                    {status === 'completed' && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Module Completed",
                            description: "You can review this module anytime!",
                          });
                        }}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review Module
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            {selectedModule.prerequisites && selectedModule.prerequisites.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Prerequisites:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {selectedModule.prerequisites.map((prereq, index) => (
                    <li key={index}>• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
