import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { question: "", answer: "" };

const AdminCareerFaqs = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin-career-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("career_faqs").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: typeof form & { id?: string }) => {
      if (item.id) {
        const { error } = await supabase.from("career_faqs").update({ question: item.question, answer: item.answer }).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("career_faqs").insert({ question: item.question, answer: item.answer, sort_order: faqs?.length || 0 });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-career-faqs"] }); setEditingId(null); setForm(emptyForm); toast.success("Gespeichert"); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("career_faqs").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-career-faqs"] }); toast.success("Gelöscht"); },
  });

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("career_faqs").update({ active: !active }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-career-faqs"] });
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Karriere FAQ</h1>
        <button onClick={() => { setEditingId("new"); setForm(emptyForm); }} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90">
          <Plus size={18} /> FAQ hinzufügen
        </button>
      </div>

      {editingId && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <input placeholder="Frage" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={inputClass} />
          <textarea placeholder="Antwort" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} className={inputClass} />
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate(editingId === "new" ? form : { ...form, id: editingId })} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90">
              <Save size={16} /> Speichern
            </button>
            <button onClick={() => setEditingId(null)} className="font-body text-sm text-muted-foreground px-4 py-2">Abbrechen</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="space-y-3">
          {faqs?.map((faq, idx) => (
            <div key={faq.id} className={`bg-card border rounded-xl p-5 ${editingId === faq.id ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-semibold text-foreground">{faq.question}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(faq.id, faq.active)} className={`font-body text-[10px] px-2 py-1 rounded-full ${faq.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {faq.active ? "Aktiv" : "Inaktiv"}
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        if (idx > 0 && faqs) {
                          const prev = faqs[idx - 1];
                          Promise.all([
                            supabase.from("career_faqs").update({ sort_order: prev.sort_order }).eq("id", faq.id),
                            supabase.from("career_faqs").update({ sort_order: faq.sort_order }).eq("id", prev.id),
                          ]).then(() => queryClient.invalidateQueries({ queryKey: ["admin-career-faqs"] }));
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >▲</button>
                    <button
                      onClick={() => {
                        if (faqs && idx < faqs.length - 1) {
                          const next = faqs[idx + 1];
                          Promise.all([
                            supabase.from("career_faqs").update({ sort_order: next.sort_order }).eq("id", faq.id),
                            supabase.from("career_faqs").update({ sort_order: faq.sort_order }).eq("id", next.id),
                          ]).then(() => queryClient.invalidateQueries({ queryKey: ["admin-career-faqs"] }));
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >▼</button>
                  </div>
                  <button onClick={() => { setEditingId(faq.id); setForm({ question: faq.question, answer: faq.answer }); }} className="font-body text-xs text-primary hover:text-primary/80">Bearbeiten</button>
                  <button onClick={() => deleteMutation.mutate(faq.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {(!faqs || faqs.length === 0) && (
            <p className="font-body text-sm text-muted-foreground text-center py-8">Noch keine FAQs vorhanden.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCareerFaqs;
