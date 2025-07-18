import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  TrendingUp,
  Download,
  Circle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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

  // Check admin access
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, toast]);

  // Get admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.isAdmin,
  });

  // Get all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.isAdmin,
  });

  // Get all questionnaire responses
  const { data: responses, isLoading: responsesLoading } = useQuery({
    queryKey: ["/api/admin/responses"],
    enabled: !!user && user.isAdmin,
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return null; // Will redirect
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

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
    'neutral': 'Mixed',
    'avoid': 'No-code'
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <Circle className="h-2 w-2 mr-1 fill-current" />
              System Online
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalUsers || 0}
                  </div>
                  <div className="text-sm text-slate-600">Total Users</div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
              {!statsLoading && stats && (
                <div className="mt-2 text-sm text-success">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% this month
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.recentSignups || 0}
                  </div>
                  <div className="text-sm text-slate-600">New Signups Today</div>
                </div>
                <UserPlus className="h-8 w-8 text-accent" />
              </div>
              {!statsLoading && (
                <div className="mt-2 text-sm text-success">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +5% vs yesterday
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : `${Math.round((stats?.verifiedUsers || 0) / (stats?.totalUsers || 1) * 100)}%`}
                  </div>
                  <div className="text-sm text-slate-600">Email Verified</div>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              {!statsLoading && stats && (
                <div className="mt-2 text-sm text-slate-500">
                  {stats.verifiedUsers} verified accounts
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : `${stats?.averageCompletion || 0}%`}
                  </div>
                  <div className="text-sm text-slate-600">Avg. Completion</div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              {!statsLoading && (
                <div className="mt-2 text-sm text-success">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +3% this week
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {responsesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Goal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Coding Pref
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Verified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {responses?.slice(0, 10).map((response) => (
                      <tr key={response.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={response.user?.profileImageUrl || ''} />
                              <AvatarFallback>
                                {response.user?.firstName?.[0] || 'U'}
                                {response.user?.lastName?.[0] || ''}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900">
                                {response.user?.firstName} {response.user?.lastName}
                              </div>
                              <div className="text-sm text-slate-500">
                                {response.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {goalMap[response.primaryGoal as keyof typeof goalMap]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {experienceMap[response.experienceLevel as keyof typeof experienceMap]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {codingMap[response.codingPreference as keyof typeof codingMap]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={response.user?.isEmailVerified ? "default" : "secondary"}
                            className={response.user?.isEmailVerified ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}
                          >
                            {response.user?.isEmailVerified ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <Circle className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatTimeAgo(response.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {responses && responses.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No questionnaire responses yet
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
