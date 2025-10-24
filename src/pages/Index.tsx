import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Video, Users, History, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-glow animate-pulse-slow">
          <Video className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            VidCall
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect face-to-face with crystal-clear video calls. One-on-one conversations or group meetings, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-8">
          <div className="glass-card p-6 rounded-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">One-to-One Calls</h3>
            <p className="text-sm text-muted-foreground">Private video calls with accept/decline control and call history</p>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg">Group Rooms</h3>
            <p className="text-sm text-muted-foreground">Create shareable room links with controlled access</p>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <History className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Call History</h3>
            <p className="text-sm text-muted-foreground">Track all your calls with detailed history</p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/auth")}
          className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 shadow-glow"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
