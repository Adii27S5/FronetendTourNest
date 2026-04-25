import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CustomCursor from "@/components/CustomCursor";
import AnimatedBackground from "@/components/AnimatedBackground";
import Homestays from "./pages/Homestays";
import HomestayDetails from "./pages/HomestayDetails";
import Attractions from "./pages/Attractions";
import AttractionDetails from "./pages/AttractionDetails";
import Favorites from "./pages/Favorites";
import SignIn from "./pages/SignIn";
import BecomeHost from "./pages/BecomeHost";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TouristDashboard from "./pages/TouristDashboard";
import HostDashboard from "./pages/HostDashboard";
import GuideDashboard from "./pages/GuideDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import HotelBooking from "./pages/HotelBooking";
import SubmitTour from "./pages/SubmitTour";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <AnimatedBackground />
            <CustomCursor />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<SignIn />} />
                <Route path="/homestays" element={<Homestays />} />
                <Route path="/homestay/:id" element={<HomestayDetails />} />
                <Route path="/attractions" element={<Attractions />} />
                <Route path="/attraction/:id" element={<AttractionDetails />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/become-host" element={<BecomeHost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotel/:id" element={<HotelDetails />} />
                <Route path="/hotel-book" element={<HotelBooking />} />

                {/* Role-based Dashboards */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/tourist-dashboard" element={<TouristDashboard />} />
                  <Route path="/host-dashboard" element={<HostDashboard />} />
                  <Route path="/guide-dashboard" element={<GuideDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/submit-tour" element={<SubmitTour />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
