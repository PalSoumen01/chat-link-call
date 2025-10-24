import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Video, Users, History, LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import ContactsList from "@/components/ContactsList";
import CallHistory from "@/components/CallHistory";
import GroupRooms from "@/components/GroupRooms";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VidCall
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back!
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-card p-1">
            <TabsTrigger value="contacts" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Video className="w-4 h-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <ContactsList userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <GroupRooms userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <CallHistory userId={user?.id || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
