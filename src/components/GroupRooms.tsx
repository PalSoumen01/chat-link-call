import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, Copy, LogIn } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Room {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  participant_count: number;
}

const GroupRooms = ({ userId }: { userId: string }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [userId]);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("room_participants")
        .select(`
          room_id,
          group_rooms!inner (
            id,
            name,
            invite_code,
            created_at
          )
        `)
        .eq("user_id", userId) as any;

      if (error) throw error;

      const roomsList = await Promise.all(
        (data || []).map(async (item: any) => {
          const { count } = await supabase
            .from("room_participants")
            .select("*", { count: "exact", head: true })
            .eq("room_id", item.group_rooms.id) as any;

          return {
            id: item.group_rooms.id,
            name: item.group_rooms.name,
            invite_code: item.group_rooms.invite_code,
            created_at: item.group_rooms.created_at,
            participant_count: count || 0,
          };
        })
      );

      setRooms(roomsList);
    } catch (error: any) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    try {
      const inviteCode = Math.random().toString(36).substring(2, 10);
      
      const { data: room, error: roomError } = await supabase
        .from("group_rooms")
        .insert({
          name: newRoomName,
          creator_id: userId,
          invite_code: inviteCode,
        })
        .select()
        .single() as any;

      if (roomError) throw roomError;

      const { error: participantError } = await supabase
        .from("room_participants")
        .insert({
          room_id: room.id,
          user_id: userId,
        }) as any;

      if (participantError) throw participantError;

      toast.success("Room created successfully!");
      setNewRoomName("");
      setCreateDialogOpen(false);
      fetchRooms();
    } catch (error: any) {
      toast.error("Failed to create room");
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    try {
      const { data: room, error: roomError } = await supabase
        .from("group_rooms")
        .select("id")
        .eq("invite_code", joinCode.trim())
        .single() as any;

      if (roomError || !room) {
        toast.error("Invalid invite code");
        return;
      }

      const { error: participantError } = await supabase
        .from("room_participants")
        .insert({
          room_id: room.id,
          user_id: userId,
        }) as any;

      if (participantError) {
        if (participantError.code === "23505") {
          toast.error("You're already in this room");
        } else {
          throw participantError;
        }
        return;
      }

      toast.success("Joined room successfully!");
      setJoinCode("");
      setJoinDialogOpen(false);
      fetchRooms();
    } catch (error: any) {
      toast.error("Failed to join room");
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  };

  const startGroupCall = (roomId: string) => {
    toast.info("Group call feature coming soon!");
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading rooms...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader>
              <DialogTitle>Create Group Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input
                  placeholder="Enter room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createRoom()}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <Button onClick={createRoom} className="w-full gradient-primary">
                Create Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-accent">
              <LogIn className="w-4 h-4 mr-2" />
              Join Room
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader>
              <DialogTitle>Join Group Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Invite Code</Label>
                <Input
                  placeholder="Enter invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <Button onClick={joinRoom} className="w-full gradient-accent">
                Join Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rooms.length === 0 ? (
        <Card className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No group rooms yet. Create or join one to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.id} className="glass-card p-6 hover:shadow-glow transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {room.participant_count} {room.participant_count === 1 ? "participant" : "participants"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                  <code className="text-sm flex-1">{room.invite_code}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyInviteCode(room.invite_code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => startGroupCall(room.id)}
                  className="w-full gradient-primary"
                >
                  Start Call
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupRooms;
