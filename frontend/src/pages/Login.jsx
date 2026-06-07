import { useState } from "react";
import { login } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      const res = await login(formData);
      localStorage.setItem("token", res.data.access_token);
      navigate("/home");
    } catch {
      setError("INVALID CREDENTIALS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="scanline" />
      <div
        className="bg-arena flex items-center justify-center relative overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="orb"
          style={{
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
            top: "-150px",
            left: "-150px",
          }}
        />
        <div
          className="orb"
          style={{
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
            bottom: "-100px",
            right: "-100px",
          }}
        />

        <div
          className="glow-card relative w-full mx-4 p-8"
          style={{ maxWidth: "380px" }}
        >
          <div
            className="corner"
            style={{ top: 0, left: 0, borderWidth: "2px 0 0 2px" }}
          />
          <div
            className="corner"
            style={{ top: 0, right: 0, borderWidth: "2px 2px 0 0" }}
          />
          <div
            className="corner"
            style={{ bottom: 0, left: 0, borderWidth: "0 0 2px 2px" }}
          />
          <div
            className="corner"
            style={{ bottom: 0, right: 0, borderWidth: "0 2px 2px 0" }}
          />

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              className="logo-gradient"
              style={{
                fontSize: "38px",
                fontWeight: "900",
                letterSpacing: "6px",
              }}
            >
              ARENA
              <span
                style={{
                  background: "linear-gradient(135deg,#06b6d4,#22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                IQ
              </span>
            </h1>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "5px",
                color: "rgba(255,255,255,0.25)",
                marginTop: "4px",
              }}
            >
              GAMING TRIVIA BATTLE
            </p>
            <div className="divider" />
          </div>

          {error && <div className="error-box">{error}</div>}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label className="field-label">EMAIL</label>
              <input
                className="neon-input"
                type="email"
                placeholder="ENTER YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">PASSWORD</label>
              <input
                className="neon-input"
                type="password"
                placeholder="ENTER PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="arena-btn"
              type="submit"
              style={{ marginTop: "8px" }}
            >
              {loading ? "CONNECTING..." : "ENTER ARENA"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "12px",
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            NEW PLAYER?{" "}
            <Link
              to="/register"
              style={{
                color: "#06b6d4",
                textDecoration: "none",
                letterSpacing: "2px",
              }}
            >
              REGISTER
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
