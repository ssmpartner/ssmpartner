import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Save, Key, Shield } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPw || newPw.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Passwort geändert");
      setCurrentPw("");
      setNewPw("");
    }
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Einstellungen</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">Konto- und Sicherheitseinstellungen.</p>

      {/* Account Info */}
      <div className="bg-card border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Konto</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="font-body text-xs text-muted-foreground">E-Mail</label>
            <p className="font-body text-sm text-foreground">{user?.email}</p>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground">Benutzer-ID</label>
            <p className="font-body text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded inline-block">{user?.id}</p>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Passwort ändern</h2>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Neues Passwort"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={handlePasswordChange}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Speichern..." : "Passwort speichern"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
