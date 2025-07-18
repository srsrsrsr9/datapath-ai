import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Clock,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import type { LearningModule, UserProgress } from "@shared/schema";

interface ProgressTrackerProps {
  userProgress: UserProgress[];
  modules: LearningModule[];
}

export function ProgressTracker({ userProgress, modules }: ProgressTrackerProps) {
  const getCurrentLearning = () => {
    return userProgress.filter(p => p.status === 'in_progress').slice(0, 2);
  };

  const getRecentAchievements = () => {
    return userProgress
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
      .slice(0, 3);
  };

  const getModuleName = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    return module?.name || `Module ${moduleId}`;
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Recently';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const currentLearning = getCurrentLearning();
  const recentAchievements = getRecentAchievements();

  return (
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
                <div key={progress.id} className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-slate-900 mb-2">
                    {getModuleName(progress.moduleId)}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">
                      Progress: {progress.progressPercentage}%
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      In Progress
                    </Badge>
                  </div>
                  <Progress value={progress.progressPercentage} className="h-2" />
                  {progress.startedAt && (
                    <div className="text-xs text-slate-500 mt-2">
                      Started {formatTimeAgo(progress.startedAt)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-2">No active learning modules</p>
                <p className="text-sm text-slate-400">
                  Click on a module in the roadmap to start learning!
                </p>
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
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">
                      {getModuleName(achievement.moduleId)} Complete
                    </div>
                    <div className="text-xs text-slate-600">
                      Completed {formatTimeAgo(achievement.completedAt)}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    +100 XP
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-2">No achievements yet</p>
                <p className="text-sm text-slate-400">
                  Complete modules to earn achievements and track your progress!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Progress Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Modules Started</span>
              <span className="font-semibold">{userProgress.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Modules Completed</span>
              <span className="font-semibold text-green-600">
                {userProgress.filter(p => p.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Current Streak</span>
              <span className="font-semibold text-accent">
                {Math.max(1, recentAchievements.length)} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Learning Time</span>
              <span className="font-semibold">
                {userProgress.reduce((total, p) => {
                  const module = modules.find(m => m.id === p.moduleId);
                  return total + (module?.estimatedHours || 0) * (p.progressPercentage / 100);
                }, 0).toFixed(1)}h
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
