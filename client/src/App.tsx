import { Route, Switch } from "wouter";
import { Home } from "@/pages/Home";
import { Health } from "@/pages/Health";
import SanctuaryHub from "@/pages/sanctuary/SanctuaryHub";
import SanctuaryProfiles from "@/pages/sanctuary/SanctuaryProfiles";
import SanctuaryIntimacy from "@/pages/sanctuary/SanctuaryIntimacy";
import VisionBoard from "@/pages/sanctuary/VisionBoard";
import { Goals } from "@/pages/Goals";
import { Budget } from "@/pages/Budget";
import { Chat } from "@/pages/Chat";
import { ChatConversation } from "@/pages/ChatConversation";
import { EquipmentPage } from "@/pages/Equipment";
import { Happiness } from "@/pages/Happiness";
import { Loyalty } from "@/pages/Loyalty";
import { Wardrobe } from "@/pages/Wardrobe";
import { Shopping } from "@/pages/Shopping";
import { Tasks } from "@/pages/Tasks";
import { LifeScriptPage } from "@/pages/LifeScript";
import { Documents } from "@/pages/Documents";
import { Investments } from "@/pages/Investments";
import { InvestmentDetail } from "@/pages/InvestmentDetail";
import NetWorth from "@/pages/NetWorth";
import { CrmHub } from "@/pages/CrmHub";
import { CrmContactDetail } from "@/pages/crm/CrmContactDetail";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ConfettiDots } from "@/components/whimsy/ConfettiDots";
import { DoodleAccents } from "@/components/whimsy/DoodleAccents";
import { PaperPlane } from "@/components/whimsy/PaperPlane";
import { UserProvider } from "@/context/UserContext";
import { UserPickerOverlay } from "@/components/UserSelector";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-normal">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-4 inline-block text-primary hover:underline">
          Go back home
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <SidebarProvider defaultOpen={true}>
        <ConfettiDots />
        <DoodleAccents />
        <PaperPlane />
        <UserPickerOverlay />
        <div className="relative z-10 flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/health" component={Health} />
              <Route path="/goals" component={Goals} />
              <Route path="/faith/life-script" component={LifeScriptPage} />
              <Route path="/budget" component={Budget} />
              <Route path="/chat" component={Chat} />
              <Route path="/chat/:id" component={ChatConversation} />
              <Route path="/home/equipment" component={EquipmentPage} />
              <Route path="/home/wardrobe" component={Wardrobe} />
              <Route path="/home/documents" component={Documents} />
              <Route path="/wealth/net-worth" component={NetWorth} />
              <Route path="/wealth/investments" component={Investments} />
              <Route path="/wealth/investments/:id" component={InvestmentDetail} />
              <Route path="/happiness" component={Happiness} />
              <Route path="/loyalty" component={Loyalty} />
              <Route path="/family/shopping" component={Shopping} />
              <Route path="/family/tasks" component={Tasks} />
              <Route path="/family/crm" component={CrmHub} />
              <Route path="/family/crm/:id" component={CrmContactDetail} />
              <Route path="/sanctuary" component={SanctuaryHub} />
              <Route path="/sanctuary/profiles" component={SanctuaryProfiles} />
              <Route path="/sanctuary/intimacy" component={SanctuaryIntimacy} />
              <Route path="/sanctuary/vision-board" component={VisionBoard} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}

export default App;
