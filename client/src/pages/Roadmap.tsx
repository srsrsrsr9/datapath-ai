import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { RoadmapVisualization } from "@/components/RoadmapVisualization";
import { ProgressTracker } from "@/components/ProgressTracker";
import { 
  ChartLine, 
  BookOpen, 
  Trophy, 
  Clock, 
  Target,
  Users,
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Roadmap() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Redirect to email verification if not verified
  useEffect(() => {
    if (user && !user.isEmailVerified) {
      setLocation("/verify-email");
    }
  }, [user, setLocation]);

  // Get questionnaire response
  const { data: questionnaireResponse, isLoading: questionnaireLoading } = useQuery({
    queryKey: ["/api/questionnaire"],
    enabled: !!user && user.isEmailVerified,
  });

  // Get user progress
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user && user.isEmailVerified,
  });

  // Get learning modules
  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/modules"],
    enabled: !!user && user.isEmailVerified,
  });

  // Get roadmap configuration
  const { data: roadmapConfig, isLoading: configLoading } = useQuery({
    queryKey: ["/api/roadmap"],
    enabled: !!user && user.isEmailVerified,
  });

  // Redirect to questionnaire if not completed
  useEffect(() => {
    if (!questionnaireLoading && user && user.isEmailVerified && !questionnaireResponse) {
      setLocation("/questionnaire");
    }
  }, [user, questionnaireResponse, questionnaireLoading, setLocation]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user.isEmailVerified) {
    return null; // Will redirect to email verification
  }

  if (questionnaireLoading || progressLoading || modulesLoading || configLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!questionnaireResponse) {
    return null; // Will redirect to questionnaire
  }

  const calculateOverallProgress = () => {
    if (!userProgress || userProgress.length === 0) return 0;
    const totalProgress = userProgress.reduce((sum, p) => sum + p.progressPercentage, 0);
    return Math.round(totalProgress / userProgress.length);
  };

  const getProgressStats = () => {
    if (!userProgress) return { completed: 0, inProgress: 0, remaining: 25 };
    
    const completed = userProgress.filter(p => p.status === 'completed').length;
    const inProgress = userProgress.filter(p => p.status === 'in_progress').length;
    const remaining = Math.max(0, 25 - userProgress.length);
    
    return { completed, inProgress, remaining };
  };

  const overallProgress = calculateOverallProgress();
  const stats = getProgressStats();

  const goalMap = {
    'job': 'Land first job',
    'promotion': 'Get promotion', 
    'switch': 'Career switch',
    'freelance': 'Start freelancing',
    'personal': 'Personal interest'
  };

  const experienceMap = {
    'beginner': 'Beginner',
    'some': 'Some exposure',
    'intermediate': 'Intermediate'
  };

  const codingMap = {
    'love': 'Code-heavy',
    'neutral': 'Mixed approach',
    'avoid': 'No-code'
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Your Personalized Data Analyst Roadmap
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Customized based on your goals and experience level
          </p>
          
          {/* User Profile Summary */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Learning Profile</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-slate-700">Goal</div>
                  <div className="text-primary">
                    {goalMap[questionnaireResponse.primaryGoal as keyof typeof goalMap]}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-slate-700">Experience</div>
                  <div className="text-primary">
                    {experienceMap[questionnaireResponse.experienceLevel as keyof typeof experienceMap]}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-slate-700">Coding Preference</div>
                  <div className="text-primary">
                    {codingMap[questionnaireResponse.codingPreference as keyof typeof codingMap]}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Overall Progress</h3>
                <Badge variant="secondary" className="text-2xl font-bold px-4 py-2">
                  {overallProgress}%
                </Badge>
              </div>
              <Progress value={overallProgress} className="h-3 mb-4" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{stats.completed}</div>
                  <div className="text-slate-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{stats.inProgress}</div>
                  <div className="text-slate-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-400">{stats.remaining}</div>
                  <div className="text-slate-600">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Roadmap Visualization */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-8 text-center">Your Learning Path</h2>
                <RoadmapVisualization 
                  modules={modules || []}
                  userProgress={userProgress || []}
                  roadmapConfig={roadmapConfig}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Tracker */}
            <ProgressTracker 
              userProgress={userProgress || []}
              modules={modules || []}
            />

            {/* Study Schedule */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-slate-500" />
                  Study Schedule
                </h3>
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Schedule learning feature will be available soon!",
                    });
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Learning Time
                </Button>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-slate-900 mb-1">Suggested</div>
                  <div className="text-sm text-slate-600">
                    30 minutes daily • Consistent progress
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setLocation("/questionnaire")}
                  >
                    <ChartLine className="h-4 w-4 mr-2" />
                    Retake Assessment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setLocation("/")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Community features will be available soon!",
                      });
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Community
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
