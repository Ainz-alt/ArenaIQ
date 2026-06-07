import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../services/api";

function Home() {
  const [username, setUsername] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [gameName, setGameName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUsername(payload.username || "PLAYER");
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handleCreate = async () => {
    if (!gameName) {
      setError("ENTER A GAME NAME FIRST");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await createRoom();
      const code = res.data.room_code;
      navigate(`/room/${code}?game=${gameName}`);
    } catch {
      setError("FAILED TO CREATE ROOM");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode) {
      setError("ENTER A ROOM CODE");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await joinRoom(joinCode.toUpperCase());
      navigate(`/room/${joinCode.toUpperCase()}`);
    } catch (err) {
      setError(
        err.response?.data?.detail?.toUpperCase() || "FAILED TO JOIN ROOM",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <div className="scanline" />
      <div
        className="bg-arena relative overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="orb"
          style={{
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
            top: "-200px",
            left: "-200px",
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

        {/* Navbar */}
        <nav
          style={{
            borderBottom: "1px solid rgba(124,58,237,0.2)",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            className="logo-gradient"
            style={{
              fontSize: "22px",
              fontWeight: "900",
              letterSpacing: "4px",
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
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span
              style={{
                fontSize: "12px",
                letterSpacing: "3px",
                color: "rgba(167,139,250,0.8)",
              }}
            >
              ◆ {username}
            </span>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "Rajdhani",
                fontSize: "11px",
                letterSpacing: "3px",
                color: "rgba(255,255,255,0.3)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "6px 14px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              LOGOUT
            </button>
          </div>
        </nav>

        <div
          style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}
        >
          {/* Hero */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "60px",
              animation: "slideUp 0.5s ease forwards",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "6px",
                color: "rgba(6,182,212,0.7)",
                marginBottom: "16px",
              }}
            >
              WELCOME BACK, PLAYER
            </p>
            <h2
              style={{
                fontFamily: "Orbitron",
                fontSize: "42px",
                fontWeight: "900",
                lineHeight: "1.1",
                marginBottom: "16px",
              }}
            >
              READY TO
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BATTLE?
              </span>
            </h2>
            <p
              style={{
                fontSize: "14px",
                letterSpacing: "2px",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              CREATE A ROOM OR JOIN AN EXISTING ONE
            </p>
          </div>

          {error && (
            <div
              className="error-box"
              style={{ maxWidth: "500px", margin: "0 auto 24px" }}
            >
              {error}
            </div>
          )}

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Create Room */}
            <div className="glow-card relative p-6">
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

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "4px",
                    color: "rgba(167,139,250,0.6)",
                    marginBottom: "4px",
                  }}
                >
                  01
                </p>
                <h3
                  style={{
                    fontFamily: "Orbitron",
                    fontSize: "18px",
                    fontWeight: "700",
                    letterSpacing: "2px",
                  }}
                >
                  CREATE ROOM
                </h3>
                <div className="divider" style={{ margin: "12px 0" }} />
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "1px",
                    lineHeight: "1.6",
                  }}
                >
                  Pick any game, generate AI questions, and host a battle with
                  your friends.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label className="field-label">GAME NAME</label>
                  <input
                    className="neon-input"
                    type="text"
                    placeholder="E.G. VALORANT, MINECRAFT..."
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                  />
                </div>
                <button
                  className="arena-btn"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? "CREATING..." : "CREATE ROOM"}
                </button>
              </div>
            </div>

            {/* Join Room */}
            <div className="glow-card relative p-6">
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

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "4px",
                    color: "rgba(6,182,212,0.6)",
                    marginBottom: "4px",
                  }}
                >
                  02
                </p>
                <h3
                  style={{
                    fontFamily: "Orbitron",
                    fontSize: "18px",
                    fontWeight: "700",
                    letterSpacing: "2px",
                  }}
                >
                  JOIN ROOM
                </h3>
                <div
                  className="divider"
                  style={{
                    margin: "12px 0",
                    background:
                      "linear-gradient(90deg,transparent,#06b6d4,transparent)",
                  }}
                />
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "1px",
                    lineHeight: "1.6",
                  }}
                >
                  Enter the 6-character room code shared by the host to join the
                  battle.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    className="field-label"
                    style={{ color: "rgba(6,182,212,0.7)" }}
                  >
                    ROOM CODE
                  </label>
                  <input
                    className="neon-input"
                    type="text"
                    placeholder="ENTER 6-CHAR CODE"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{
                      letterSpacing: "6px",
                      fontSize: "18px",
                      textAlign: "center",
                    }}
                  />
                </div>
                <button
                  className="arena-btn"
                  onClick={handleJoin}
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg,#0891b2,#0e7490)",
                  }}
                >
                  {loading ? "JOINING..." : "JOIN ROOM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
