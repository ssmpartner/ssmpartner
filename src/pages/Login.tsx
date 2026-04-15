import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => localStorage.getItem("ssm_remember_email") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("ssm_remember_me") === "true");

  // SSO redirect params
  const ssoRedirect = searchParams.get("redirect_uri");
  const ssoProjectKey = searchParams.get("project_key");
  const ssoState = searchParams.get("state");

  if (loading) return <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">Laden...</div>;

  // If already logged in and no SSO redirect, go to admin
  if (user && !ssoRedirect) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);

    // SSO redirect flow: verify via SSO API, then redirect back
    if (ssoRedirect && ssoProjectKey) {
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sso-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify",
            email: email.trim(),
            password,
            project_key: ssoProjectKey,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Build redirect URL with token
        const redirectUrl = new URL(ssoRedirect);
        redirectUrl.searchParams.set("sso_token", data.sso_token);
        redirectUrl.searchParams.set("email", data.user.email);
        redirectUrl.searchParams.set("role", data.user.role || "");
        redirectUrl.searchParams.set("display_name", data.user.display_name || "");
        if (ssoState) redirectUrl.searchParams.set("state", ssoState);

        window.location.href = redirectUrl.toString();
        return;
      } catch (err: any) {
        setSubmitting(false);
        toast.error(err.message || "SSO-Authentifizierung fehlgeschlagen");
        return;
      }
    }

    // Normal login flow
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
      navigate("/portal");
    } else {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Ungültige Anmeldedaten. Bitte prüfen Sie E-Mail und Passwort."
          : error.message
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(160,18%,23%)] via-[hsl(160,18%,28%)] to-[hsl(160,18%,20%)] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white font-heading">
            SSM Partner AG
          </h1>
          <p className="mt-2 text-sm text-white/60 font-body">
            {ssoProjectKey
              ? `Anmelden für ${ssoProjectKey.replace("ssm-", "SSM ").replace(/\b\w/g, (c) => c.toUpperCase())}`
              : "Melden Sie sich an, um fortzufahren"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-8 shadow-lg space-y-5">
          {ssoProjectKey && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-center">
              <p className="font-body text-xs text-muted-foreground">Zentrale SSO-Anmeldung</p>
              <p className="font-body text-sm font-medium text-foreground mt-0.5">
                {ssoProjectKey.replace("ssm-", "SSM ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </div>
          )}

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

          {!ssoProjectKey && (
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
          )}

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
