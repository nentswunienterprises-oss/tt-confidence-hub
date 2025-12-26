import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Trophy, Zap, Target, TrendingUp, Flame } from "lucide-react";

interface StudentStats {
  bossBattlesCompleted: number;
  solutionsUnlocked: number;
  currentStreak: number;
  totalSessions: number;
  confidenceLevel: number;
}

export default function StudentDashboard() {
  // Fetch student stats
  const { data: stats, isLoading } = useQuery<StudentStats>({
    queryKey: ["/api/student/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch student info
  const { data: studentInfo } = useQuery<any>({
    queryKey: ["/api/student/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
          Welcome back, {studentInfo?.firstName || "Champion"}! 🎓
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground">Your progress at a glance</p>
      </div>

      {/* Gamified Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Boss Battles */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:shadow-lg transition-all">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center justify-between text-foreground">
                <span className="text-xs sm:text-sm font-medium">Boss Battles</span>
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-5xl font-bold text-primary mb-1 sm:mb-2">
                {stats?.bossBattlesCompleted || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Challenges conquered</p>
              <div className="mt-2 sm:mt-3 bg-primary/20 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-primary h-1.5 sm:h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(((stats?.bossBattlesCompleted || 0) / 10) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Next milestone: {Math.ceil(((stats?.bossBattlesCompleted || 0) + 1) / 10) * 10} battles
              </p>
            </CardContent>
          </Card>

          {/* Solutions Unlocked */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 hover:shadow-lg transition-all">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center justify-between text-purple-900">
                <span className="text-xs sm:text-sm font-medium">Solutions Unlocked</span>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-5xl font-bold text-purple-700 mb-1 sm:mb-2">
                {stats?.solutionsUnlocked || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-purple-800">3-layer concepts mastered</p>
              <div className="mt-2 sm:mt-3 bg-purple-200/50 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-purple-600 h-1.5 sm:h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(((stats?.solutionsUnlocked || 0) / 20) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-purple-700 mt-1">
                Next milestone: {Math.ceil(((stats?.solutionsUnlocked || 0) + 1) / 20) * 20} solutions
              </p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-300 hover:shadow-lg transition-all">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center justify-between text-orange-900">
                <span className="text-xs sm:text-sm font-medium">Current Streak</span>
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-5xl font-bold text-orange-700 mb-1 sm:mb-2">
                {stats?.currentStreak || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-orange-800">Days in a row</p>
              <div className="mt-2 sm:mt-3 flex gap-0.5 sm:gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-4 sm:h-8 rounded ${
                      i < (stats?.currentStreak || 0) % 7
                        ? 'bg-orange-500'
                        : 'bg-orange-200/50'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-orange-700 mt-1">Keep it going!</p>
            </CardContent>
          </Card>

          {/* Confidence Level */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:shadow-lg transition-all">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center justify-between text-green-900">
                <span className="text-xs sm:text-sm font-medium">Confidence</span>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-5xl font-bold text-green-700 mb-1 sm:mb-2">
                {stats?.confidenceLevel || 0}%
              </div>
              <p className="text-[10px] sm:text-xs text-green-800">Overall growth</p>
              <div className="mt-2 sm:mt-3 bg-green-200/50 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all"
                  style={{ width: `${stats?.confidenceLevel || 0}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-green-700 mt-1">
                {stats && stats.confidenceLevel >= 75 
                  ? "You're crushing it!" 
                  : stats && stats.confidenceLevel >= 50 
                  ? "Keep pushing forward!" 
                  : "Every session counts!"}}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How Stats Work */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="text-blue-900">🎮 How Your Stats Update</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              <strong className="text-yellow-700">🏆 Boss Battles:</strong> Each time your tutor marks a challenging problem as completed during a session, your Boss Battles count goes up!
            </p>
            <p>
              <strong className="text-purple-700">⚡ Solutions Unlocked:</strong> When your tutor logs a session and documents the 3-layer teaching (vocabulary, method, reasoning), you unlock a solution!
            </p>
            <p>
              <strong className="text-orange-700">🔥 Streak:</strong> Log in and complete your commitments daily to build your streak!
            </p>
            <p>
              <strong className="text-green-700">📈 Confidence:</strong> Based on your tutor's feedback and your session performance over time.
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                My Commitments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your daily goals and build habits
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Academic Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See what you've mastered and what's next
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                My Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Practice problems from your tutor
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
