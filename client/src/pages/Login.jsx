import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (mode === "register" && !form.name.trim()) return setError("Enter your name");
    if (!form.email.trim()) return setError("Enter your email");
    if (mode === "register" && form.password.length < 8) return setError("Use a password with at least 8 characters");
    setBusy(true);
    try {
      if (mode === "login") await login({ email: form.email, password: form.password });
      else await register(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="panel auth-card" onSubmit={submit} noValidate>
        <h1>SpendWise</h1>
        <p className="muted">{mode === "login" ? "Log in to see your money at a glance." : "Create an account to start tracking."}</p>
        {mode === "register" && <label>Name<input value={form.name} onChange={set("name")} autoComplete="name" /></label>}
        <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Password<input type="password" value={form.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
