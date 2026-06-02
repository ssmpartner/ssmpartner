import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { usePageViewTracker } from "@/hooks/usePageViewTracker";
import SeoHead from "@/components/SeoHead";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Agencies from "./pages/Agencies";
import AgencyDetail from "./pages/AgencyDetail";
import Career from "./pages/Career";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Portal from "./pages/Portal";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSlider from "./pages/admin/AdminSlider";
import AdminContent from "./pages/admin/AdminContent";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminAgencies from "./pages/admin/AdminAgencies";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminNav from "./pages/admin/AdminNav";
import AdminHeroes from "./pages/admin/AdminHeroes";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminApiDocs from "./pages/admin/AdminApiDocs";
import AdminDocs from "./pages/admin/AdminDocs";
import AdminCareerVideos from "./pages/admin/AdminCareerVideos";
import AdminCareerFaqs from "./pages/admin/AdminCareerFaqs";
import AdminMediaLibrary from "./pages/admin/AdminMediaLibrary";
import AdminChatKnowledge from "./pages/admin/AdminChatKnowledge";
import AdminChatLogs from "./pages/admin/AdminChatLogs";
import AdminVag45 from "./pages/admin/AdminVag45";
import AdminOnlineCheck from "./pages/admin/AdminOnlineCheck";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSocialLinks from "./pages/admin/AdminSocialLinks";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSEO from "./pages/admin/AdminSEO";
import { Navigate } from "react-router-dom";
import AdminNews from "./pages/admin/AdminNews";
import AdminEvents from "./pages/admin/AdminEvents";
import PortalNews from "./pages/portal/PortalNews";
import PortalNewsDetail from "./pages/portal/PortalNewsDetail";
import PortalEvents from "./pages/portal/PortalEvents";
import ChatWidget from "@/components/ChatWidget";
import Vag45 from "./pages/Vag45";
import Legal from "./pages/Legal";
import OnlineCheck from "./pages/OnlineCheck";
import NotFound from "./pages/NotFound";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AnalyticsTracker = () => {
  usePageViewTracker();
  return null;
};

const queryClient = new QueryClient();

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
    <Footer />
    <ChatWidget />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AnalyticsTracker />
          <SeoHead />
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
            <Route path="/ueber-uns" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/agenturen" element={<PublicLayout><Agencies /></PublicLayout>} />
            <Route path="/agenturen/:slug" element={<PublicLayout><AgencyDetail /></PublicLayout>} />
            <Route path="/karriere" element={<PublicLayout><Career /></PublicLayout>} />
            <Route path="/kontakt" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/rechtliches" element={<PublicLayout><Legal /></PublicLayout>} />
            <Route path="/vag45" element={<PublicLayout><Vag45 /></PublicLayout>} />
            <Route path="/onlinecheck" element={<PublicLayout><OnlineCheck /></PublicLayout>} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/portal/news" element={<PortalNews />} />
            <Route path="/portal/news/:slug" element={<PortalNewsDetail />} />
            <Route path="/portal/events" element={<PortalEvents />} />

            {/* Admin CMS */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/slider" element={<AdminSlider />} />
                <Route path="/admin/heroes" element={<AdminHeroes />} />
                <Route path="/admin/nav" element={<AdminNav />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/team" element={<AdminTeam />} />
                <Route path="/admin/agencies" element={<AdminAgencies />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/career-videos" element={<AdminCareerVideos />} />
                <Route path="/admin/career-faqs" element={<AdminCareerFaqs />} />
                <Route path="/admin/media" element={<AdminMediaLibrary />} />
                <Route path="/admin/inquiries" element={<AdminInquiries />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/api-docs" element={<AdminApiDocs />} />
                <Route path="/admin/docs" element={<AdminDocs />} />
                <Route path="/admin/chat-knowledge" element={<AdminChatKnowledge />} />
                <Route path="/admin/chat-logs" element={<AdminChatLogs />} />
                <Route path="/admin/vag45" element={<AdminVag45 />} />
                <Route path="/admin/onlinecheck" element={<AdminOnlineCheck />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/social-links" element={<AdminSocialLinks />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/seo" element={<AdminSEO />} />
                <Route path="/admin/sso" element={<Navigate to="/admin/users" replace />} />
                <Route path="/admin/news" element={<AdminNews />} />
                <Route path="/admin/events" element={<AdminEvents />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
