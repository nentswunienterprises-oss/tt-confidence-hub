import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Users, LogOut, Mail } from "lucide-react";
import type { User } from "@shared/schema";
import { logout } from "@/lib/auth";

export default function TDNoPod() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with profile and logout only */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-bold text-lg text-foreground">
                TT Response Hub
              </h1>
              <p className="text-xs text-muted-foreground">Territory Director</p>
            </div>
          </div>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                data-testid="button-profile-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {user?.name || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => logout(user)}
                className="cursor-pointer"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content - Centered Message */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 md:p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Pod Assignment Pending
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              You haven't been assigned to a Pod yet. Our team will notify you
              once your assignment is ready.
            </p>
          </div>

          <div className="pt-4 space-y-4">
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-3">
                Questions or need assistance?
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  (window.location.href =
                    "mailto:territorialtutoring@gmail.com")
                }
                data-testid="button-contact-support"
              >
                <Mail className="w-4 h-4" />
                territorialtutoring@gmail.com
              </Button>
            </div>

            <p className="text-xs text-muted-foreground italic">
              Meanwhile, take a moment to prepare yourself. Your leadership will
              make a difference.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
