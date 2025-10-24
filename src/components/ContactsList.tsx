import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Phone, UserPlus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Contact {
  id: string;
  username: string;
  status: string;
  avatar_url?: string;
}

const ContactsList = ({ userId }: { userId: string }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [userId]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("contacts")
        .select(`
          contact_id,
          profiles!contacts_contact_id_fkey (
            id,
            username,
            status,
            avatar_url
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;

      const contactsList = data?.map((item: any) => ({
        id: item.profiles.id,
        username: item.profiles.username,
        status: item.profiles.status,
        avatar_url: item.profiles.avatar_url,
      })) || [];

      setContacts(contactsList);
    } catch (error: any) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    try {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, username, status, avatar_url")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", userId)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast.error("Search failed");
    }
  };

  const addContact = async (contactId: string) => {
    try {
      const { error } = await (supabase as any).from("contacts").insert({
        user_id: userId,
        contact_id: contactId,
      });

      if (error) throw error;
      toast.success("Contact added!");
      fetchContacts();
      setSearchQuery("");
      setSearchResults([]);
    } catch (error: any) {
      toast.error("Failed to add contact");
    }
  };

  const initiateCall = (contactId: string, callType: "video" | "audio") => {
    toast.info(`${callType === "video" ? "Video" : "Audio"} call feature coming soon!`);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading contacts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Contacts</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-accent">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                  className="bg-secondary/50 border-border"
                />
                <Button onClick={searchUsers} className="gradient-primary">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-medium">{user.username}</span>
                    <Button
                      size="sm"
                      onClick={() => addContact(user.id)}
                      className="gradient-accent"
                    >
                      Add
                    </Button>
                  </div>
                ))}
                {searchQuery && searchResults.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No users found</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
        <Card className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No contacts yet. Add someone to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((contact) => (
            <Card key={contact.id} className="glass-card p-6 hover:shadow-glow transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {contact.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{contact.username}</h3>
                    <span
                      className={`text-xs ${
                        contact.status === "online" ? "text-green-500" : "text-muted-foreground"
                      }`}
                    >
                      {contact.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    onClick={() => initiateCall(contact.id, "video")}
                    className="gradient-primary hover:opacity-90"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => initiateCall(contact.id, "audio")}
                    className="hover:gradient-accent hover:text-white"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsList;
