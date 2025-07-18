import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChartLine, BookOpen, Trophy, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Check questionnaire completion
  const { data: questionnaireResponse, isLoading: questionnaireLoading } = useQuery({
    queryKey: ["/api/questionnaire"],
    enabled: !!user,
  });

  // Get user progress
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  // Redirect to questionnaire if not completed
  useEffect(() => {
    if (!authLoading && !questionnaireLoading && user && !questionnaireResponse) {
      setLocation("/questionnaire");
    }
  }, [user, questionnaireResponse, authLoading, questionnaireLoading, setLocation]);

  // Redirect to email verification if not verified
  useEffect(() => {
    if (user && !user.isEmailVerified) {
      setLocation("/verify-email");
    }
  }, [user, setLocation]);

  if (authLoading || questionnaireLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
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

  const getRecentAchievements = () => {
    if (!userProgress) return [];
    return userProgress
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
      .slice(0, 3);
  };

  const getCurrentLearning = () => {
    if (!userProgress) return [];
    return userProgress.filter(p => p.status === 'in_progress').slice(0, 2);
  };

  const overallProgress = calculateOverallProgress();
  const recentAchievements = getRecentAchievements();
  const currentLearning = getCurrentLearning();

  const goalMap = {
    'job': 'Land my first Data Analyst job',
    'promotion': 'Get a promotion in my current role',
    'switch': 'Switch careers into data',
    'freelance': 'Start freelancing as a Data Analyst',
    'personal': 'Just learning for personal interest'
  };

  const experienceMap = {
    'beginner': 'Complete Beginner',
    'some': 'Some Exposure',
    'intermediate': 'Intermediate / Advanced'
  };

  const codingMap = {
    'love': 'Code-heavy path',
    'neutral': 'Mixed approach',
    'avoid': 'No-code tools'
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Continue your Data Analyst journey. You're making great progress!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <ChartLine className="h-5 w-5 mr-2 text-primary" />
                    Your Progress Overview
                  </h2>
                  <Badge variant="secondary" className="text-2xl font-bold px-4 py-2">
                    {overallProgress}%
                  </Badge>
                </div>
                
                <Progress value={overallProgress} className="h-3 mb-4" />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-success">
                      {recentAchievements.length}
                    </div>
                    <div className="text-sm text-slate-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">
                      {currentLearning.length}
                    </div>
                    <div className="text-sm text-slate-600">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-400">
                      {userProgress ? 25 - userProgress.length : 25}
                    </div>
                    <div className="text-sm text-slate-600">Remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Profile */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Learning Profile</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-medium text-slate-700 mb-1">Goal</div>
                    <div className="text-primary font-medium">
                      {goalMap[questionnaireResponse.primaryGoal as keyof typeof goalMap]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-medium text-slate-700 mb-1">Experience</div>
                    <div className="text-primary font-medium">
                      {experienceMap[questionnaireResponse.experienceLevel as keyof typeof experienceMap]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-medium text-slate-700 mb-1">Coding Preference</div>
                    <div className="text-primary font-medium">
                      {codingMap[questionnaireResponse.codingPreference as keyof typeof codingMap]}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    className="h-16 flex items-center justify-between"
                    onClick={() => setLocation("/roadmap")}
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-3" />
                      <span>View Full Roadmap</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex items-center justify-between"
                    onClick={() => setLocation("/questionnaire")}
                  >
                    <div className="flex items-center">
                      <ChartLine className="h-5 w-5 mr-3" />
                      <span>Retake Assessment</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Learning */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Current Learning
                </h3>
                <div className="space-y-4">
                  {currentLearning.length > 0 ? (
                    currentLearning.map((progress) => (
                      <div key={progress.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-slate-900 mb-1">
                          Module {progress.moduleId}
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          Progress: {progress.progressPercentage}%
                        </div>
                        <Progress value={progress.progressPercentage} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 mb-4">No active learning modules</p>
                      <Button 
                        size="sm"
                        onClick={() => setLocation("/roadmap")}
                      >
                        Start Learning
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-accent" />
                  Recent Achievements
                </h3>
                <div className="space-y-3">
                  {recentAchievements.length > 0 ? (
                    recentAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Trophy className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900">
                            Module {achievement.moduleId} Complete
                          </div>
                          <div className="text-sm text-slate-600">
                            {achievement.completedAt ? 
                              new Date(achievement.completedAt).toLocaleDateString() 
                              : 'Recently'
                            }
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500">No achievements yet</p>
                      <p className="text-sm text-slate-400">Complete modules to earn achievements!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                    // TODO: Implement schedule learning functionality
                    alert("Schedule learning feature coming soon!");
                  }}
                >
                  Set Study Schedule
                </Button>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-slate-900 mb-1">Suggested</div>
                  <div className="text-sm text-slate-600">
                    30 minutes daily • Best time: 7:00 PM
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
