import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem("ssm_remember_email") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("ssm_remember_me") === "true");

  if (loading) return <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">Laden...</div>;
  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (!error) {
      if (rememberMe) {
        localStorage.setItem("ssm_remember_me", "true");
        localStorage.setItem("ssm_remember_email", email.trim());
      } else {
        localStorage.removeItem("ssm_remember_me");
        localStorage.removeItem("ssm_remember_email");
      }
      navigate("/admin");
    } else {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Ungültige Anmeldedaten. Bitte prüfen Sie E-Mail und Passwort."
          : error.message
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground font-heading">
            SSM Partner AG
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-body">Melden Sie sich an, um fortzufahren</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-8 shadow-lg space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground font-body">E-Mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border bg-background px-4 text-sm font-body outline-none focus:ring-2 focus:ring-ring transition-shadow"
              placeholder="name@ssmpartner.ch"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground font-body">Passwort</label>
            </div>
            <div className="relative mt-1">
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border bg-background px-4 pr-10 text-sm font-body outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border border-primary accent-primary cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-sm text-muted-foreground font-body cursor-pointer select-none">
              Angemeldet bleiben
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground font-body hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {submitting ? "Wird angemeldet..." : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
