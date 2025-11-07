import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Analytics from "@/pages/Analytics";
import Campaigns from "@/pages/Campaigns";
import NewCampaign from "@/pages/NewCampaign";
import CampaignDetails from "@/pages/CampaignDetails";
import Offers from "@/pages/Offers";
import AIAssistant from "@/pages/AIAssistant";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Analytics} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaigns/new" component={NewCampaign} />
      <Route path="/campaigns/:id" component={CampaignDetails} />
      <Route path="/offers" component={Offers} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route component={NotFound} />
    </Switch>
  );
}

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
        <AppSidebar activePath={location} userEmail={user?.email} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
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
