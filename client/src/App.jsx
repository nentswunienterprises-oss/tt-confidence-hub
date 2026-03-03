import ExecutiveCOOTrackLeads from "@/pages/executive/coo/track-leads";
import { Routes, Route, Navigate } from "react-router-dom";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProtectedParentRoute } from "@/lib/parentGuard";
import { OfflineIndicator } from "@/components/OfflineIndicator";
// Clean up old localStorage cache on startup (we now use sessionStorage which is tab-specific)
if (typeof window !== 'undefined') {
    window.localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
    window.localStorage.removeItem('CURRENT_USER_ID');
}
// General Pages
import Landing from "@/pages/landing";
import PortalLanding from "@/pages/portal-landing";
import OnlineTutorsWanted from "@/pages/onlinetutors-wanted";
import OnlineTutorsWantedPlain from "@/pages/onlinetutorswanted";
import AuthPage from "@/pages/auth";
import AuthCallback from "@/pages/auth-callback";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import FAQPage from "@/pages/faq";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfUse from "@/pages/terms-of-use";
import EarlyInterventionReferralProgram from "@/pages/earlyinterventionreferralprogram";
import AboutTT from "@/pages/aboutTT";
import LeadershipDevelopmentPilot from "@/pages/leadershipdevelopmentpilot";
// Legacy Tutor Pages (kept for backwards compatibility)
import TutorPod from "@/pages/operational/tutor/pod";
import TutorGateway from "@/pages/operational/tutor/gateway";
import TutorGrowth from "@/pages/operational/tutor/growth";
import TutorAcademics from "@/pages/operational/tutor/academics";
import TutorSessions from "@/pages/operational/tutor/sessions";
import TutorUpdates from "@/pages/operational/tutor/updates";
import TutorProfile from "@/pages/operational/tutor/profile";
// Legacy TD Pages (kept for backwards compatibility)
import TDNoPod from "@/pages/operational/td/no-pod";
import TDDashboard from "@/pages/operational/td/dashboard";
import TDOverview from "@/pages/operational/td/overview";
import TDTutors from "@/pages/operational/td/tutors";
import TDReports from "@/pages/operational/td/reports";
import TDUpdates from "@/pages/operational/td/updates";
// Legacy COO Pages (kept for backwards compatibility)
import COODashboard from "@/pages/executive/coo/dashboard";
import COOApplications from "@/pages/executive/coo/applications";
import COOTutorApplications from "@/pages/executive/coo/tutor-applications";
import COOPods from "@/pages/executive/coo/pods";
import COOPodDetail from "@/pages/executive/coo/pod-detail";
import COOVerification from "@/pages/executive/coo/verification";
import COOBroadcast from "@/pages/executive/coo/broadcast";
import LeadershipPilotRequests from "@/pages/executive/coo/leadership-pilot-requests";
// NEW: Client Portal Pages
import ParentDashboard from "@/pages/client/parent/dashboard";
import ParentGateway from "@/pages/client/parent/gateway";
import ParentSessions from "@/pages/client/parent/sessions";
import ParentProgress from "@/pages/client/parent/progress";
import ParentUpdates from "@/pages/client/parent/updates";
import StudentLanding from "@/pages/client/student/StudentLanding";
import StudentDashboard from "@/pages/client/student/dashboard";
import StudentGrowth from "@/pages/client/student/growth";
import StudentAcademicTracker from "@/pages/client/student/academic-tracker";
import StudentAssignments from "@/pages/client/student/assignments";
import StudentUpdates from "@/pages/client/student/updates";
// NEW: Operational Portal Pages
import OperationalTutorDashboard from "@/pages/operational/tutor/dashboard";
import TutorBlueprint from "@/pages/operational/tutor/blueprint";
import TTOS from "@/pages/operational/tutor/tt-os";
import OperationalTDDashboard from "@/pages/operational/td/dashboard";
// NEW: Affiliate Portal Pages
import AffiliateDashboard from "@/pages/affiliate/affiliate/home";
import AffiliateDiscoverDeliver from "@/pages/affiliate/affiliate/discover-deliver";
import AffiliateTracking from "@/pages/affiliate/affiliate/tracking";
import AffiliateUpdates from "@/pages/affiliate/affiliate/updates";
import OutreachDirectorDashboard from "@/pages/affiliate/od/dashboard";
import ODEncounters from "@/pages/affiliate/od/encounters";
import ODAffiliates from "@/pages/affiliate/od/affiliates";
import ODUpdates from "@/pages/affiliate/od/updates";
// NEW: Executive Portal Pages
import ExecutiveCOODashboard from "@/pages/executive/coo/dashboard";
import ExecutiveHRDashboard from "@/pages/executive/hr/dashboard";
import ExecutiveHRTraffic from "@/pages/executive/hr/traffic";
import ExecutiveHRUpdates from "@/pages/executive/hr/updates";
import ExecutiveHRApplications from "@/pages/executive/hr/applications";
import ExecutiveHRBrain from "@/pages/executive/hr/brain";
import ExecutiveHRDisputes from "@/pages/executive/hr/disputes";
import ExecutiveCEODashboard from "@/pages/executive/ceo/dashboard";
import ExecutiveDashboard from "@/pages/executive/dashboard";
import RecruitmentPrivacy from "@/pages/executive/recruitment-privacy";
// NEW: Portal Landing Pages
import OperationalLanding from "@/pages/operational/landing";
import AffiliateLandingPage from "@/pages/affiliate/landing";
import ExecutiveLanding from "@/pages/executive/landing";
// NEW: Portal Signup Pages
import ClientSignup from "@/pages/client/signup";
import OperationalSignup from "@/pages/operational/signup";
import AffiliateSignup from "@/pages/affiliate/signup";
import ExecutiveSignup from "@/pages/executive/signup";
// Media Portal Pages
import MediaLanding from "@/pages/media/landing";
import CarouselSelect from "@/pages/media/carousel/select";
import CarouselCreate from "@/pages/media/carousel/create";
import CarouselLibrary from "@/pages/media/carousel/library";
function Router() {
    return (<Routes>
      {/* General Routes */}
      <Route path="/" element={<PortalLanding />}/>
      <Route path="/landing" element={<Landing />}/>
      <Route path="/auth" element={<AuthPage />}/>
      <Route path="/auth/callback" element={<AuthCallback />}/>
      <Route path="/login" element={<AuthPage />}/>
      <Route path="/signup" element={<AuthPage />}/>
      <Route path="/home" element={<Home />}/>
      <Route path="/privacy-policy" element={<PrivacyPolicy />}/>
      <Route path="/terms-of-use" element={<TermsOfUse />}/>
      <Route path="/faq" element={<FAQPage />}/>
      <Route path="/onlinetutors-wanted" element={<OnlineTutorsWanted />}/>
      <Route path="/onlinetutorswanted" element={<OnlineTutorsWantedPlain />}/>
      <Route path="/earlyinterventionreferralprogram" element={<EarlyInterventionReferralProgram />}/>
      <Route path="/aboutTT" element={<AboutTT />}/>
      <Route path="/leadershipdevelopmentpilot" element={<LeadershipDevelopmentPilot />}/>

      {/* ==================== CLIENT PORTAL ==================== */}
      {/* Client Signup */}
      <Route path="/client/signup" element={<ClientSignup />}/>
      {/* Parent Routes */}
      <Route path="/client/parent/gateway" element={<ParentGateway />}/>
      <Route path="/client/parent/dashboard" element={<ProtectedParentRoute><DashboardLayout><ParentDashboard /></DashboardLayout></ProtectedParentRoute>}/>
      <Route path="/client/parent/sessions" element={<ProtectedParentRoute><DashboardLayout><ParentSessions /></DashboardLayout></ProtectedParentRoute>}/>
      <Route path="/client/parent/progress" element={<ProtectedParentRoute><DashboardLayout><ParentProgress /></DashboardLayout></ProtectedParentRoute>}/>
      <Route path="/client/parent/updates" element={<ProtectedParentRoute><DashboardLayout><ParentUpdates /></DashboardLayout></ProtectedParentRoute>}/>

      {/* Student Routes */}
      <Route path="/student" element={<StudentLanding />}/>
      <Route path="/student/dashboard" element={<Navigate to="/client/student/dashboard" replace/>}/>
      <Route path="/client/student/dashboard" element={<DashboardLayout><StudentDashboard /></DashboardLayout>}/>
      <Route path="/client/student/growth" element={<DashboardLayout><StudentGrowth /></DashboardLayout>}/>
      <Route path="/client/student/academic-tracker" element={<DashboardLayout><StudentAcademicTracker /></DashboardLayout>}/>
      <Route path="/client/student/assignments" element={<DashboardLayout><StudentAssignments /></DashboardLayout>}/>
      <Route path="/client/student/updates" element={<DashboardLayout><StudentUpdates /></DashboardLayout>}/>

      {/* ==================== OPERATIONAL PORTAL ==================== */}
      {/* Operational Landing */}
      <Route path="/operational/landing" element={<OperationalLanding />}/>
      {/* Operational Signup */}
      <Route path="/operational/signup" element={<OperationalSignup />}/>

      {/* Tutor Routes */}
      <Route path="/operational/tutor/gateway" element={<TutorGateway />}/>
      <Route path="/operational/tutor/dashboard" element={<DashboardLayout><OperationalTutorDashboard /></DashboardLayout>}/>
      <Route path="/operational/tutor/my-pod" element={<DashboardLayout><OperationalTutorDashboard /></DashboardLayout>}/>
      <Route path="/tutor/blueprint" element={<DashboardLayout><TutorBlueprint /></DashboardLayout>}/>
      <Route path="/operational/tutor/tt-os" element={<TTOS />}/>
      <Route path="/operational/tutor/growth" element={<DashboardLayout><TutorGrowth /></DashboardLayout>}/>
      <Route path="/operational/tutor/academic-tracker" element={<DashboardLayout><TutorAcademics /></DashboardLayout>}/>
      <Route path="/operational/tutor/sessions" element={<DashboardLayout><TutorSessions /></DashboardLayout>}/>
      <Route path="/operational/tutor/profile" element={<DashboardLayout><TutorProfile /></DashboardLayout>}/>
      <Route path="/operational/tutor/updates" element={<DashboardLayout><TutorUpdates /></DashboardLayout>}/>

      {/* TD Routes */}
      <Route path="/operational/td/dashboard" element={<DashboardLayout><OperationalTDDashboard /></DashboardLayout>}/>
      <Route path="/operational/td/my-pods" element={<DashboardLayout><TDOverview /></DashboardLayout>}/>
      <Route path="/operational/td/reports" element={<DashboardLayout><TDReports /></DashboardLayout>}/>
      <Route path="/operational/td/updates" element={<DashboardLayout><TDUpdates /></DashboardLayout>}/>

      {/* ==================== AFFILIATE PORTAL ==================== */}
      {/* Affiliate Landing */}
      <Route path="/affiliate/landing" element={<AffiliateLandingPage />}/>
      {/* Affiliate Signup */}
      <Route path="/affiliate/signup" element={<AffiliateSignup />}/>

      {/* Affiliate Routes */}
      <Route path="/affiliate/affiliate/home" element={<AffiliateDashboard />}/>
      <Route path="/affiliate/affiliate/discover-deliver" element={<AffiliateDiscoverDeliver />}/>
      <Route path="/affiliate/affiliate/tracking" element={<AffiliateTracking />}/>
      <Route path="/affiliate/affiliate/updates" element={<AffiliateUpdates />}/>

      {/* Outreach Director Routes */}
      <Route path="/affiliate/od/dashboard" element={<OutreachDirectorDashboard />}/>
      <Route path="/affiliate/od/encounters" element={<ODEncounters />}/>
      <Route path="/affiliate/od/affiliates" element={<ODAffiliates />}/>
      <Route path="/affiliate/od/updates" element={<ODUpdates />}/>

      {/* ==================== EXECUTIVE PORTAL ==================== */}
      {/* Executive Landing */}
      <Route path="/executive" element={<ExecutiveLanding />}/>
      <Route path="/executive/landing" element={<ExecutiveLanding />}/>
      {/* Executive Signup */}
      <Route path="/executive/signup" element={<ExecutiveSignup />}/>
      {/* Executive Legal */}
      <Route path="/executive/recruitment-privacy" element={<RecruitmentPrivacy />}/>
      {/* Generic Executive Dashboard (used after signup) */}
      <Route path="/executive/dashboard" element={<DashboardLayout><ExecutiveDashboard /></DashboardLayout>}/>

      {/* COO Routes */}
      <Route path="/executive/coo/dashboard" element={<ExecutiveCOODashboard />}/>
      <Route path="/executive/coo/applications" element={<DashboardLayout><ExecutiveCOODashboard /></DashboardLayout>}/>
      <Route path="/executive/coo/pods" element={<DashboardLayout><ExecutiveCOODashboard /></DashboardLayout>}/>
      <Route path="/executive/coo/broadcast" element={<DashboardLayout><ExecutiveCOODashboard /></DashboardLayout>}/>
      <Route path="/executive/coo/track-leads" element={<ExecutiveCOOTrackLeads />}/>

      {/* HR Routes */}
      <Route path="/executive/hr/dashboard" element={<DashboardLayout><ExecutiveHRDashboard /></DashboardLayout>}/>
      <Route path="/executive/hr/traffic" element={<DashboardLayout><ExecutiveHRTraffic /></DashboardLayout>}/>
      <Route path="/executive/hr/updates" element={<DashboardLayout><ExecutiveHRUpdates /></DashboardLayout>}/>
      <Route path="/executive/hr/applications" element={<DashboardLayout><ExecutiveHRApplications /></DashboardLayout>}/>
      <Route path="/executive/hr/brain" element={<DashboardLayout><ExecutiveHRBrain /></DashboardLayout>}/>
      <Route path="/executive/hr/disputes" element={<DashboardLayout><ExecutiveHRDisputes /></DashboardLayout>}/>

      {/* CEO Routes */}
      <Route path="/executive/ceo/dashboard" element={<DashboardLayout><ExecutiveCEODashboard /></DashboardLayout>}/>

      {/* ==================== MEDIA PORTAL ==================== */}
      <Route path="/media" element={<MediaLanding />}/>
      <Route path="/media/carousel/library" element={<CarouselLibrary />}/>
      <Route path="/media/carousel/select" element={<CarouselSelect />}/>
      <Route path="/media/carousel/create" element={<CarouselCreate />}/>

      {/* ==================== LEGACY ROUTES (Backwards Compatibility) ==================== */}
      {/* Legacy Tutor Routes */}
      <Route path="/tutor/pod" element={<TutorPod />}/>
      <Route path="/tutor/growth" element={<TutorGrowth />}/>
      <Route path="/tutor/academics" element={<TutorAcademics />}/>
      <Route path="/tutor/sessions" element={<TutorSessions />}/>
      <Route path="/tutor/profile" element={<TutorProfile />}/>
      <Route path="/tutor/updates" element={<TutorUpdates />}/>

      {/* Legacy TD Routes */}
      <Route path="/td/no-pod" element={<TDNoPod />}/>
      <Route path="/td/dashboard" element={<TDDashboard />}/>
      <Route path="/td/overview" element={<TDOverview />}/>
      <Route path="/td/tutors" element={<TDTutors />}/>
      <Route path="/td/reports" element={<TDReports />}/>
      <Route path="/td/updates" element={<TDUpdates />}/>

      {/* Legacy COO Routes */}
      <Route path="/coo/dashboard" element={<COODashboard />}/>
      <Route path="/coo/applications" element={<COOApplications />}/>
      <Route path="/coo/tutor-applications" element={<COOTutorApplications />}/>
      <Route path="/coo/pods" element={<COOPods />}/>
      <Route path="/coo/pods/:podId" element={<COOPodDetail />}/>
      <Route path="/coo/verification" element={<COOVerification />}/>
      <Route path="/coo/broadcast" element={<COOBroadcast />}/>
      <Route path="/coo/leadership-pilot-requests" element={<LeadershipPilotRequests />}/>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />}/>
    </Routes>);
}
export default function App() {
    console.log("App component rendering...");
    return (<PersistQueryClientProvider client={queryClient} persistOptions={{ persister: persister }}>
      <TooltipProvider>
        <OfflineIndicator />
        <Toaster />
        <Router />
      </TooltipProvider>
    </PersistQueryClientProvider>);
}
