import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">Laden...</div>;
  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-foreground text-center mb-2">SSM Partner AG</h1>
        <p className="font-body text-sm text-muted-foreground text-center mb-8">Admin Dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail"
            required
            className="w-full bg-card border border-border px-4 py-3 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            required
            className="w-full bg-card border border-border px-4 py-3 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="font-body text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full gradient-primary text-primary-foreground font-body text-sm font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Anmelden..." : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
