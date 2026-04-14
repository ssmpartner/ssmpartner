import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Bot } from "lucide-react";
import { toast } from "sonner";

type KnowledgeEntry = {
  id: string;
  category: string;
  question: string;
  answer: string;
  active: boolean;
  sort_order: number;
};

const categories = [
  { value: "general", label: "Allgemein" },
  { value: "karriere", label: "Karriere" },
  { value: "agenturen", label: "Agenturen" },
  { value: "services", label: "Dienstleistungen" },
  { value: "unternehmen", label: "Unternehmen" },
  { value: "bewerbung", label: "Bewerbung" },
];

const AdminChatKnowledge = () => {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: "general", question: "", answer: "" });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["chatbot-knowledge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_knowledge")
        .select("*")
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data as KnowledgeEntry[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("chatbot_knowledge").insert({
        category: form.category,
        question: form.question,
        answer: form.answer,
        sort_order: entries.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      setForm({ category: "general", question: "", answer: "" });
      toast.success("Wissenseintrag hinzugefügt");
    },
    onError: () => toast.error("Fehler beim Speichern"),
  });

  const updateMutation = useMutation({
    mutationFn: async (entry: Partial<KnowledgeEntry> & { id: string }) => {
      const { id, ...rest } = entry;
      const { error } = await supabase.from("chatbot_knowledge").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      setEditId(null);
      toast.success("Aktualisiert");
    },
    onError: () => toast.error("Fehler beim Aktualisieren"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chatbot_knowledge").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      toast.success("Gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
          <Bot size={24} /> KI-Chat Wissensbasis
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Fragen und Antworten, die der KI-Assistent nutzt um Besucher zu beraten.
        </p>
      </div>

      {/* Add Form */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold">Neuer Eintrag</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={form.category} onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            placeholder="Frage / Thema"
            value={form.question}
            onChange={e => setForm(prev => ({ ...prev, question: e.target.value }))}
            className="md:col-span-3"
          />
        </div>
        <Textarea
          placeholder="Antwort / Information"
          value={form.answer}
          onChange={e => setForm(prev => ({ ...prev, answer: e.target.value }))}
          rows={3}
        />
        <Button
          onClick={() => addMutation.mutate()}
          disabled={!form.question.trim() || !form.answer.trim() || addMutation.isPending}
        >
          <Plus size={16} className="mr-1" /> Hinzufügen
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Laden...</p>}
        {entries.map((entry) => (
          <div key={entry.id} className="bg-card border rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <GripVertical size={16} className="text-muted-foreground mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-body px-2 py-0.5 rounded-full bg-[#B3B69C]/20 text-[#243e3a]">
                    {categories.find(c => c.value === entry.category)?.label || entry.category}
                  </span>
                  <Switch
                    checked={entry.active}
                    onCheckedChange={(active) => updateMutation.mutate({ id: entry.id, active })}
                  />
                </div>
                {editId === entry.id ? (
                  <div className="space-y-2">
                    <Input
                      defaultValue={entry.question}
                      onBlur={e => updateMutation.mutate({ id: entry.id, question: e.target.value })}
                    />
                    <Textarea
                      defaultValue={entry.answer}
                      rows={3}
                      onBlur={e => updateMutation.mutate({ id: entry.id, answer: e.target.value })}
                    />
                    <Button variant="outline" size="sm" onClick={() => setEditId(null)}>Fertig</Button>
                  </div>
                ) : (
                  <div onClick={() => setEditId(entry.id)} className="cursor-pointer">
                    <p className="font-body text-sm font-semibold text-foreground">{entry.question}</p>
                    <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">{entry.answer}</p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(entry.id)}
                className="text-destructive shrink-0"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Noch keine Einträge vorhanden. Fügen Sie Wissen hinzu, damit der Assistent Besucher beraten kann.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminChatKnowledge;
