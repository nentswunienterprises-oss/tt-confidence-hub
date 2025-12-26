import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AffiliateDiscoverDeliver() {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-8">
        {/* Welcome Hero */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">Sales Intro: Discovery & Delivery</h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Master the art of connecting with people and showing them solutions that work for their world.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
            {/* What is Sales */}
            <section>
              <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">What is Sales?</h2>
              <p className="text-sm sm:text-base text-foreground mb-3 sm:mb-4">
                Sales is simply <strong>contacting people to learn about their situation</strong> - and checking if your product can genuinely help.
              </p>
              <p className="text-sm sm:text-base text-foreground mb-3 sm:mb-4">
                If you discover that it can, your job is to <strong>show them what that solution looks like in their world</strong>.
              </p>
              <p className="text-base sm:text-lg font-semibold text-primary">
                → In other words: <strong>Discovery and Delivery.</strong>
              </p>
            </section>

            <div className="border-t border-muted" />

            {/* Discovery Section */}
            <section>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
                  1
                </div>
                <h2 className="text-lg sm:text-2xl font-bold">Discovery</h2>
              </div>

              <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-l-primary bg-card hover:shadow-md transition-shadow">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-primary mb-2 sm:mb-3">What are we discovering?</h3>
                    <ul className="space-y-2 sm:space-y-3 ml-2 sm:ml-4 list-disc list-inside">
                      <li className="text-xs sm:text-base">Who they are (person, role, priorities)</li>
                      <li className="text-xs sm:text-base">Their situation (struggles, pain points, goals)</li>
                    </ul>
                  </div>

                  <div className="border-t border-muted pt-3 sm:pt-4">
                    <h3 className="text-sm sm:text-lg font-bold text-primary mb-2 sm:mb-3">How are we discovering?</h3>
                    <ul className="space-y-2 sm:space-y-3 ml-2 sm:ml-4 list-disc list-inside">
                      <li className="text-xs sm:text-base">By listening well</li>
                      <li className="text-xs sm:text-base">By asking <strong>strategic questions</strong> (not interrogations)</li>
                      <li className="text-xs sm:text-base">By making them feel understood</li>
                    </ul>
                  </div>

                  <div className="bg-accent/50 p-3 sm:p-5 rounded-lg border border-accent mt-4 sm:mt-6">
                    <p className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">⚡ Rule:</p>
                    <p className="text-foreground text-xs sm:text-base">The better your Discovery, the smoother your Delivery.</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Delivery Section */}
            <section>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
                  2
                </div>
                <h2 className="text-lg sm:text-2xl font-bold">Delivery</h2>
              </div>

              <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-l-primary bg-card hover:shadow-md transition-shadow">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-primary mb-2 sm:mb-3">What are we delivering?</h3>
                    <ul className="space-y-2 sm:space-y-3 ml-2 sm:ml-4 list-disc list-inside">
                      <li className="text-xs sm:text-base">The <strong>message of the solution</strong> to their problem</li>
                    </ul>
                  </div>

                  <div className="border-t border-muted pt-3 sm:pt-4">
                    <h3 className="text-sm sm:text-lg font-bold text-primary mb-2 sm:mb-3">How are we delivering it?</h3>
                    <p className="font-semibold mb-3 sm:mb-4 text-xs sm:text-base">Using the <strong>90/10 Framework:</strong></p>
                    <ul className="space-y-2 sm:space-y-3 ml-2 sm:ml-4 mb-4 sm:mb-6 list-disc list-inside">
                      <li className="text-xs sm:text-base"><strong>10%</strong> = What it is + how it works</li>
                      <li className="text-xs sm:text-base"><strong>90%</strong> = Why it matters + why it works <em>for them</em></li>
                    </ul>
                  </div>

                  <div className="bg-accent/50 p-3 sm:p-5 rounded-lg border border-accent">
                    <p className="font-semibold text-foreground mb-2 sm:mb-3 text-xs sm:text-base">Mirror + match body language and tone (if in person or on video)</p>
                    <ul className="space-y-2 ml-2 sm:ml-4 list-disc list-inside">
                      <li className="text-xs sm:text-base">People subconsciously think the way they move/talk is "right."</li>
                      <li className="text-xs sm:text-base">If you use <em>their style</em> while delivering <em>your solution,</em> they will trust you.</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            <div className="border-t border-muted" />

            {/* Simple Summary */}
            <section>
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Simple Summary</h2>

              <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-primary/5 border border-primary/20 hover:shadow-md transition-shadow">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <p className="font-bold text-base sm:text-lg text-primary mb-2 sm:mb-3">1. Sales Definition:</p>
                    <p className="ml-2 sm:ml-4 text-foreground text-xs sm:text-base"><strong>Contacting people to learn about their situation</strong> - to see if your product can help them.</p>
                  </div>

                  <div className="border-t border-primary/10 pt-3 sm:pt-4">
                    <p className="font-bold text-base sm:text-lg text-primary mb-2 sm:mb-3">2. Sales System:</p>
                    <p className="ml-2 sm:ml-4 font-bold text-foreground text-base sm:text-lg">Discovery → Delivery</p>
                    <ul className="space-y-2 ml-2 sm:ml-4 mt-2 sm:mt-3 list-disc list-inside">
                      <li className="text-xs sm:text-base"><strong>Discovery:</strong> Learn their situation.</li>
                      <li className="text-xs sm:text-base"><strong>Delivery:</strong> Show how your solution fits.</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <p className="text-foreground mb-6 sm:mb-8 text-sm sm:text-base">
                This is the <strong>best system to follow for prospecting encounters</strong> - whether it's parents for TT, partners in outreach, or potential exec members.
              </p>
            </section>

            <div className="border-t border-muted" />

            {/* Conclusion */}
            <section>
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Conclusion</h2>

              <Card className="p-4 sm:p-8 bg-gradient-to-r from-primary/5 to-accent/50 border border-primary/20 hover:shadow-md transition-shadow">
                <blockquote className="italic text-sm sm:text-lg font-semibold text-foreground border-l-4 border-l-primary pl-4 sm:pl-6">
                  "Sales isn't about pushing. It's about finding out if we can help - and if we can, showing them why it matters and how it'll look in their world."
                </blockquote>
              </Card>
            </section>
          </div>
        </div>
    </DashboardLayout>
  );
}
