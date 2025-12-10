import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch student user data
  const { data: studentUser, isLoading } = useQuery<any>({
    queryKey: ["/api/student/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/student/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Logged Out",
          description: "See you next time!",
        });
        navigate("/student");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentUser) {
    navigate("/student");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">TT Student Portal</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {studentUser.firstName || "Student"}!
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl">🎓 Welcome to Your Learning Journey!</CardTitle>
              <CardDescription>
                Your personalized math transformation dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                <p className="text-lg mb-4">
                  You're all set up and ready to begin your transformation journey with us!
                </p>
                <p className="text-muted-foreground">
                  Your tutor will be in touch soon with your first session details. 
                  In the meantime, get excited about building your math confidence!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {studentUser.firstName} {studentUser.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{studentUser.email}</p>
                </div>
              </div>
              {studentUser.studentId && (
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-mono text-sm">{studentUser.studentId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coming Soon Section */}
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Features we're building for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">📚</span>
                  </div>
                  <div>
                    <p className="font-medium">Session History</p>
                    <p className="text-sm text-muted-foreground">
                      Track all your tutoring sessions and progress
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">📊</span>
                  </div>
                  <div>
                    <p className="font-medium">Progress Dashboard</p>
                    <p className="text-sm text-muted-foreground">
                      Visualize your confidence and skill growth over time
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="font-medium">Goals & Achievements</p>
                    <p className="text-sm text-muted-foreground">
                      Set goals and celebrate milestones
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">💬</span>
                  </div>
                  <div>
                    <p className="font-medium">Tutor Messaging</p>
                    <p className="text-sm text-muted-foreground">
                      Connect with your tutor between sessions
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
