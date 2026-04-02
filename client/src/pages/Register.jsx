import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/api";
import { FiMail, FiLock, FiUser, FiShield, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { useTheme } from "../hooks/useTheme";
import ThemeToggle from "../components/ThemeToggle";

function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      const message = "All fields are required.";
      setError(message);
      toast.error(message);
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register", { ...form, role: "Employee" });
      toast.success("Account created. Please sign in.");
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "24px" }}>
      <div style={{ position: "absolute", top: "24px", right: "24px" }}>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #2f6feb, #0ea5e9)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <FiShield size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Create Account</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Join the IT Governance Portal</p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          {error && <div style={{ padding: "12px 16px", borderRadius: "8px", background: "var(--danger-light)", color: "var(--danger)", fontSize: "14px", marginBottom: "20px" }}>{error}</div>}

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <FiUser size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input className="input-field" placeholder="Your full name" style={{ paddingLeft: "36px" }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <FiMail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input className="input-field" type="email" autoComplete="email" placeholder="you@company.com" style={{ paddingLeft: "36px" }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <FiLock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input className="input-field" type={showPassword ? "text" : "password"} placeholder="Create a password" style={{ paddingLeft: "36px", paddingRight: "40px" }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "4px" }}>
              {loading ? <><FiLoader size={15} style={{ animation: "spin 1s linear infinite" }} /> Creating account...</> : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account? <span style={{ color: "var(--accent)", fontWeight: 500, cursor: "pointer" }} onClick={() => navigate("/")}>Sign in</span>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Register;
