import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ENSLogo } from "@/components/ENSLogo";
import { useAuth } from "@/hooks/useAuth";
import { lazy, Suspense, memo } from "react";
import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { motion, AnimatePresence } from 'framer-motion';

// Eager load critical pages for instant navigation
import Analytics from "@/pages/Analytics";
import Campaigns from "@/pages/Campaigns";
import Login from "@/pages/Login";

// Lazy load less frequently used pages
const NewCampaign = lazy(() => import("@/pages/NewCampaign"));
const CampaignDetails = lazy(() => import("@/pages/CampaignDetails"));
const Offers = lazy(() => import("@/pages/Offers"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
const NotFound = lazy(() => import("@/pages/not-found"));

function reportWebVitals(metric: Metric) {
  console.log('[Performance]', metric.name, Math.round(metric.value), 'ms');
}

if (typeof window !== 'undefined') {
  onCLS(reportWebVitals);
  onINP(reportWebVitals);
  onLCP(reportWebVitals);
  onFCP(reportWebVitals);
  onTTFB(reportWebVitals);
}

function PageLoader() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </motion.div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2
};

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Suspense fallback={<PageLoader />}>
          <Switch location={location}>
            <Route path="/" component={Analytics} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/campaigns" component={Campaigns} />
            <Route path="/campaigns/new" component={NewCampaign} />
            <Route path="/campaigns/:id" component={CampaignDetails} />
            <Route path="/offers" component={Offers} />
            <Route path="/ai-assistant" component={AIAssistant} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const MemoizedAppSidebar = memo(AppSidebar);

function MainApp() {
  const [location] = useLocation();
  const { user } = useAuth();

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <MemoizedAppSidebar activePath={location} userEmail={user?.email} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ENSLogo width={100} height={32} />
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {user ? <MainApp /> : <Login />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
