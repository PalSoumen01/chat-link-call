import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Video, Phone, PhoneMissed, PhoneOff } from "lucide-react";
import { format } from "date-fns";

interface CallRecord {
  id: string;
  call_type: string;
  status: string;
  duration: number;
  started_at: string;
  caller: { username: string };
  receiver: { username: string };
  is_caller: boolean;
}

const CallHistory = ({ userId }: { userId: string }) => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallHistory();
  }, [userId]);

  const fetchCallHistory = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("call_history")
        .select(`
          id,
          call_type,
          status,
          duration,
          started_at,
          caller_id,
          receiver_id,
          caller:profiles!call_history_caller_id_fkey (username),
          receiver:profiles!call_history_receiver_id_fkey (username)
        `)
        .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("started_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const callsList = data?.map((call: any) => ({
        ...call,
        is_caller: call.caller_id === userId,
      })) || [];

      setCalls(callsList);
    } catch (error: any) {
      console.error("Failed to load call history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Video className="w-4 h-4 text-green-500" />;
      case "missed":
        return <PhoneMissed className="w-4 h-4 text-yellow-500" />;
      case "declined":
        return <PhoneOff className="w-4 h-4 text-red-500" />;
      default:
        return <Phone className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading call history...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Call History</h2>
      
      {calls.length === 0 ? (
        <Card className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No call history yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <Card key={call.id} className="glass-card p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(call.status)}
                  <div>
                    <p className="font-medium">
                      {call.is_caller ? call.receiver.username : call.caller.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {call.is_caller ? "Outgoing" : "Incoming"} • {format(new Date(call.started_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">{call.status}</p>
                  {call.duration > 0 && (
                    <p className="text-xs text-muted-foreground">{formatDuration(call.duration)}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CallHistory;
