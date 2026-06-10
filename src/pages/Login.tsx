import { useState, useEffect } from "react";
import ssmLogoWhite from "@/assets/SSM_logo-white.png";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => localStorage.getItem("ssm_remember_email") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("ssm_remember_me") === "true");
  const [authError, setAuthError] = useState<string | null>(null);
  const [ssoLoading, setSsoLoading] = useState(false);

  // SSO redirect params
  const ssoRedirect = searchParams.get("redirect_uri");
  const ssoProjectKey = searchParams.get("project_key");
  const ssoState = searchParams.get("state");

  const handleEntraSso = async () => {
    const domain = email.trim().split("@")[1]?.toLowerCase();
    if (!domain) {
      toast.error("Bitte zuerst deine Firmen-E-Mail eintragen");
      return;
    }
    setSsoLoading(true);
    const { data, error } = await supabase.auth.signInWithSSO({
      domain,
      options: { redirectTo: `${window.location.origin}/portal` },
    });
    setSsoLoading(false);
    if (error) {
      toast.error("Für diese Domain ist kein SSO aktiv.");
      return;
    }
    if (data?.url) window.location.href = data.url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">Laden...</div>;

  // If already logged in and no SSO redirect, go to admin
  if (user && !ssoRedirect) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setAuthError(null);
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
        const msg = err.message || "SSO-Authentifizierung fehlgeschlagen";
        setAuthError(msg);
        toast.error(msg);
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
      const msg =
        error.message === "Invalid login credentials"
          ? "Passwort oder E-Mail ist nicht korrekt."
          : error.message;
      setAuthError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(160,18%,23%)] via-[hsl(160,18%,28%)] to-[hsl(160,18%,20%)] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center flex flex-col items-center">
          <img src={ssmLogoWhite} alt="SSM Partner AG" className="h-12 mb-4" />
          <p className="text-sm text-white/50 font-body tracking-widest uppercase">SSM Single Sign On</p>
          <p className="mt-3 text-sm text-white/60 font-body">
            {ssoProjectKey
              ? `Anmelden für ${ssoProjectKey.replace("ssm-", "SSM ").replace(/\b\w/g, (c) => c.toUpperCase())}`
              : "Melden Sie sich an, um fortzufahren"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-8 shadow-lg space-y-5">
          {ssoProjectKey && (
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="font-body text-xs text-white/50">Zentrale SSO-Anmeldung</p>
              <p className="font-body text-sm font-medium text-white mt-0.5">
                {ssoProjectKey.replace("ssm-", "SSM ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-white font-body">E-Mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white font-body outline-none focus:ring-2 focus:ring-white/30 transition-shadow placeholder:text-white/40"
              placeholder="name@ssmpartner.ch"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white font-body">Passwort</label>
            </div>
            <div className="relative mt-1">
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (authError) setAuthError(null); }}
                className={`h-11 w-full rounded-xl border bg-white/10 px-4 pr-10 text-sm text-white font-body outline-none focus:ring-2 transition-shadow placeholder:text-white/40 ${authError ? "border-red-400 focus:ring-red-400/50" : "border-white/20 focus:ring-white/30"}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {authError && (
              <p className="mt-2 text-xs font-body text-red-300">{authError}</p>
            )}
          </div>

          {!ssoProjectKey && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border border-white/30 accent-white cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-sm text-white/60 font-body cursor-pointer select-none">
                Angemeldet bleiben
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[hsl(160,18%,23%)] font-body hover:bg-white/90 transition-opacity disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {submitting ? "Wird angemeldet..." : "Anmelden"}
          </button>

          {!ssoProjectKey && (
            <>
              <div className="relative flex items-center my-1">
                <div className="flex-1 h-px bg-white/15" />
                <span className="px-3 text-[10px] uppercase tracking-widest text-white/40 font-body">oder</span>
                <div className="flex-1 h-px bg-white/15" />
              </div>
              <button
                type="button"
                onClick={handleEntraSso}
                disabled={ssoLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-sm font-medium text-white font-body hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {ssoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden="true">
                    <rect width="10" height="10" x="1" y="1" fill="#F25022" />
                    <rect width="10" height="10" x="12" y="1" fill="#7FBA00" />
                    <rect width="10" height="10" x="1" y="12" fill="#00A4EF" />
                    <rect width="10" height="10" x="12" y="12" fill="#FFB900" />
                  </svg>
                )}
                Mit Microsoft anmelden (SSO)
              </button>
            </>
          )}
        </form>
        <p className="text-center text-xs text-white/50 font-body">
          SSM Partner AG. Eine Tochtergesellschaft der Visana-Gruppe. Gebundener Vermittler gemäss VAG.
        </p>
      </div>
    </div>
  );
};

export default Login;
