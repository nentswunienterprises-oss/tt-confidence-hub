import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Home, FolderKanban, TrendingUp, AlertCircle, LogOut, User } from "lucide-react";
import { useState } from "react";

export default function AffiliateDiscoverDeliver() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex justify-center flex-1 gap-4">
            <Link to="/affiliate/affiliate/home">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <Link to="/affiliate/affiliate/discover-deliver">
              <Button variant="default" size="sm" className="gap-2">
                <FolderKanban className="w-4 h-4" />
                Discover & Deliver
              </Button>
            </Link>
            <Link to="/affiliate/affiliate/tracking">
              <Button variant="ghost" size="sm" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Tracking
              </Button>
            </Link>
            <Link to="/affiliate/affiliate/updates">
              <Button variant="ghost" size="sm" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                Updates
              </Button>
            </Link>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 rounded-full p-0 flex items-center justify-center"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User className="w-5 h-5" />
            </Button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-card border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b">
                  <p className="font-semibold text-foreground">{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Affiliate'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-accent text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-r from-primary/10 to-amber-500/10 border-b p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Sales Intro: Discovery & Delivery</h1>
            <p className="text-lg text-muted-foreground">
              Master the art of connecting with people and showing them solutions that work for their world.
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* What is Sales */}
            <section>
              <h2 className="text-2xl font-bold mb-4">What is Sales?</h2>
              <p className="text-foreground mb-4">
                Sales is simply <strong>contacting people to learn about their situation</strong> - and checking if your product can genuinely help.
              </p>
              <p className="text-foreground mb-4">
                If you discover that it can, your job is to <strong>show them what that solution looks like in their world</strong>.
              </p>
              <p className="text-lg font-semibold text-primary">
                → In other words: <strong>Discovery and Delivery.</strong>
              </p>
            </section>

            <div className="border-t border-muted" />

            {/* Discovery Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <h2 className="text-2xl font-bold">Discovery</h2>
              </div>

              <Card className="p-6 mb-6 border-l-4 border-l-primary bg-card hover:shadow-md transition-shadow">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-3">What are we discovering?</h3>
                    <ul className="space-y-3 ml-4">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>Who they are (person, role, priorities)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>Their situation (struggles, pain points, goals)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-muted pt-4">
                    <h3 className="text-lg font-bold text-primary mb-3">How are we discovering?</h3>
                    <ul className="space-y-3 ml-4">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>By listening well</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>By asking <strong>strategic questions</strong> (not interrogations)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>By making them feel understood</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-accent/50 p-5 rounded-lg border border-accent mt-6">
                    <p className="font-semibold text-foreground mb-2">⚡ Rule:</p>
                    <p className="text-foreground">The better your Discovery, the smoother your Delivery.</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Delivery Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <h2 className="text-2xl font-bold">Delivery</h2>
              </div>

              <Card className="p-6 mb-6 border-l-4 border-l-primary bg-card hover:shadow-md transition-shadow">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-3">What are we delivering?</h3>
                    <ul className="space-y-3 ml-4">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>The <strong>message of the solution</strong> to their problem</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-muted pt-4">
                    <h3 className="text-lg font-bold text-primary mb-3">How are we delivering it?</h3>
                    <p className="font-semibold mb-4">Using the <strong>90/10 Framework:</strong></p>
                    <ul className="space-y-3 ml-4 mb-6">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span><strong>10%</strong> = What it is + how it works</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span><strong>90%</strong> = Why it matters + why it works <em>for them</em></span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-accent/50 p-5 rounded-lg border border-accent">
                    <p className="font-semibold text-foreground mb-3">Mirror + match body language and tone (if in person or on video)</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>People subconsciously think the way they move/talk is "right."</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>If you use <em>their style</em> while delivering <em>your solution,</em> they will trust you.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            <div className="border-t border-muted" />

            {/* Simple Summary */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Simple Summary</h2>

              <Card className="p-6 mb-6 bg-primary/5 border border-primary/20 hover:shadow-md transition-shadow">
                <div className="space-y-6">
                  <div>
                    <p className="font-bold text-lg text-primary mb-3">1. Sales Definition:</p>
                    <p className="ml-4 text-foreground"><strong>Contacting people to learn about their situation</strong> - to see if your product can help them.</p>
                  </div>

                  <div className="border-t border-primary/10 pt-4">
                    <p className="font-bold text-lg text-primary mb-3">2. Sales System:</p>
                    <p className="ml-4 font-bold text-foreground text-lg">Discovery → Delivery</p>
                    <ul className="space-y-2 ml-4 mt-3">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold">•</span>
                        <span><strong>Discovery:</strong> Learn their situation.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold">•</span>
                        <span><strong>Delivery:</strong> Show how your solution fits.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <p className="text-foreground mb-8">
                This is the <strong>best system to follow for prospecting encounters</strong> - whether it's parents for TT, partners in outreach, or potential exec members.
              </p>
            </section>

            <div className="border-t border-muted" />

            {/* Conclusion */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Conclusion</h2>

              <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/50 border border-primary/20 hover:shadow-md transition-shadow">
                <blockquote className="italic text-lg font-semibold text-foreground border-l-4 border-l-primary pl-6">
                  "Sales isn't about pushing. It's about finding out if we can help - and if we can, showing them why it matters and how it'll look in their world."
                </blockquote>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
