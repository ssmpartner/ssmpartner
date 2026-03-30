import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import AdminMediaLibrary from "./pages/admin/AdminMediaLibrary";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
            <Route path="/ueber-uns" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/agenturen" element={<PublicLayout><Agencies /></PublicLayout>} />
            <Route path="/agenturen/:slug" element={<PublicLayout><AgencyDetail /></PublicLayout>} />
            <Route path="/karriere" element={<PublicLayout><Career /></PublicLayout>} />
            <Route path="/kontakt" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/rechtliches" element={<PublicLayout><Legal /></PublicLayout>} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

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
                <Route path="/admin/inquiries" element={<AdminInquiries />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/api-docs" element={<AdminApiDocs />} />
                <Route path="/admin/docs" element={<AdminDocs />} />
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
