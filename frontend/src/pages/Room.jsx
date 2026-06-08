import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getRoom, loadQuestions } from "../services/api";

const decodeHTML = (text) => {
  if (!text) return "";
  const doc = new DOMParser().parseFromString(text, "text/html");
  return doc.documentElement.textContent;
};

function Room() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const gameName = searchParams.get("game");
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [gameState, setGameState] = useState("lobby");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [scores, setScores] = useState([]);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [statusMsg, setStatusMsg] = useState("WAITING FOR PLAYERS...");
  const [isHost, setIsHost] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(!gameName);
  const [username, setUsername] = useState("");

  const wsRef = useRef(null);
  const userIdRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    //commmit again
    const payload = JSON.parse(atob(token.split(".")[1]));
    const uid = parseInt(payload.sub);
    userIdRef.current = uid;
    setUsername(payload.username || "PLAYER");

    if (!loadedRef.current) {
      loadedRef.current = true;
      fetchRoom(uid);
    }

    connectWS(uid);
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const fetchRoom = async (uid) => {
    try {
      const res = await getRoom(code);
      setPlayers(res.data.players);
      setHostId(res.data.host_id);
      setScores(res.data.players);
      if (res.data.host_id === uid) {
        setIsHost(true);
        if (gameName) {
          setStatusMsg(`LOADING ${gameName.toUpperCase()} QUESTIONS...`);
          await loadQuestions(code, gameName);
          setQuestionsReady(true);
          setStatusMsg("QUESTIONS READY — START WHEN READY");
        }
      }
    } catch {
      navigate("/home");
    }
  };

  const connectWS = (uid) => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${code}/${uid}`);
    wsRef.current = ws;
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      switch (data.type) {
        case "player_joined":
        case "player_left":
          setStatusMsg(data.message.toUpperCase());
          break;
        case "question":
          setCurrentQuestion(data);
          setSelectedAnswer(null);
          setLastAnswer(null);
          setGameState("question");
          break;
        case "score_update":
          setScores(data.scores);
          setLastAnswer(data.last_answer);
          break;
        case "error":
          setStatusMsg(data.message);
          break;
      }
    };
    ws.onclose = () => setStatusMsg("DISCONNECTED");
    ws.onerror = () => setStatusMsg("CONNECTION ERROR");
  };

  const send = (msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const submitAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    send({
      type: "answer",
      question_id: currentQuestion.question_id,
      answer_index: index,
    });
  };

  const optionLabels = ["A", "B", "C", "D"];

  // LOBBY
  if (gameState === "lobby") {
    return (
      <>
        <div className="scanline" />
        <div
          className="bg-arena"
          style={{ minHeight: "100vh", padding: "40px 24px" }}
        >
          <div
            className="orb"
            style={{
              width: "400px",
              height: "400px",
              background:
                "radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)",
              top: "-100px",
              left: "-100px",
            }}
          />

          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "40px",
              }}
            >
              <h1
                className="logo-gradient"
                style={{
                  fontSize: "24px",
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
              <button
                onClick={() => navigate("/home")}
                style={{
                  fontFamily: "Rajdhani",
                  fontSize: "11px",
                  letterSpacing: "3px",
                  color: "rgba(255,255,255,0.3)",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "6px 14px",
                  cursor: "pointer",
                }}
              >
                LEAVE
              </button>
            </div>

            <div
              className="glow-card relative p-8 text-center"
              style={{ marginBottom: "20px" }}
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
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "5px",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: "8px",
                }}
              >
                ROOM CODE
              </p>
              <div
                style={{
                  fontFamily: "Orbitron",
                  fontSize: "52px",
                  fontWeight: "900",
                  letterSpacing: "12px",
                  background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {code}
              </div>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "3px",
                  color: "rgba(255,255,255,0.25)",
                  marginTop: "8px",
                }}
              >
                SHARE THIS CODE WITH FRIENDS
              </p>
              {gameName && (
                <div
                  style={{
                    marginTop: "16px",
                    display: "inline-block",
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    padding: "4px 16px",
                    fontSize: "12px",
                    letterSpacing: "3px",
                    color: "rgba(167,139,250,0.8)",
                  }}
                >
                  {gameName.toUpperCase()}
                </div>
              )}
            </div>

            <div
              className="glow-card relative p-6"
              style={{ marginBottom: "20px" }}
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
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "4px",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: "16px",
                }}
              >
                PLAYERS — {players.length}
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {players.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(124,58,237,0.15)",
                      borderRadius: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Orbitron",
                        fontSize: "11px",
                        color: "rgba(167,139,250,0.5)",
                        width: "20px",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: "Rajdhani",
                        fontSize: "15px",
                        letterSpacing: "2px",
                        color: "white",
                        flex: 1,
                      }}
                    >
                      {p.username.toUpperCase()}
                    </span>
                    {i === 0 && (
                      <span
                        style={{
                          fontSize: "10px",
                          letterSpacing: "2px",
                          color: "rgba(6,182,212,0.7)",
                        }}
                      >
                        HOST
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "3px",
                  color: "rgba(167,139,250,0.6)",
                  marginBottom: "20px",
                }}
              >
                {statusMsg}
              </p>
              {isHost && questionsReady && (
                <button
                  className="arena-btn"
                  onClick={() =>
                    send({ type: "start_game", game_name: gameName || "" })
                  }
                  style={{ marginTop: "16px", maxWidth: "200px" }}
                >
                  START BATTLE
                </button>
              )}
              {isHost && !questionsReady && (
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "3px",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  LOADING QUESTIONS...
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // GAME VIEW
  return (
    <>
      <div className="scanline" />
      <div className="bg-arena" style={{ minHeight: "100vh", padding: "24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h1
              className="logo-gradient"
              style={{
                fontSize: "20px",
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
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {gameName && (
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "3px",
                    color: "rgba(167,139,250,0.6)",
                  }}
                >
                  {gameName.toUpperCase()}
                </span>
              )}
              <span
                style={{
                  fontFamily: "Orbitron",
                  fontSize: "12px",
                  letterSpacing: "3px",
                  color: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  padding: "4px 12px",
                }}
              >
                {code}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: "20px",
            }}
          >
            <div>
              {currentQuestion && (
                <>
                  <div
                    className="glow-card relative p-6"
                    style={{ marginBottom: "16px" }}
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
                      style={{
                        bottom: 0,
                        right: 0,
                        borderWidth: "0 2px 2px 0",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "10px",
                        letterSpacing: "4px",
                        color: "rgba(6,182,212,0.6)",
                        marginBottom: "12px",
                      }}
                    >
                      {currentQuestion.category}
                    </p>
                    <p
                      style={{
                        fontFamily: "Rajdhani",
                        fontSize: "20px",
                        fontWeight: "600",
                        letterSpacing: "1px",
                        lineHeight: "1.4",
                        color: "white",
                      }}
                    >
                      {decodeHTML(currentQuestion.text)}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    {currentQuestion.options.map((opt, i) => {
                      const isSelected = selectedAnswer === i;
                      return (
                        <button
                          key={i}
                          onClick={() => submitAnswer(i)}
                          disabled={selectedAnswer !== null}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "16px 18px",
                            textAlign: "left",
                            cursor:
                              selectedAnswer !== null ? "default" : "pointer",
                            background: isSelected
                              ? "rgba(124,58,237,0.25)"
                              : "rgba(255,255,255,0.02)",
                            border: isSelected
                              ? "1px solid rgba(124,58,237,0.8)"
                              : "1px solid rgba(124,58,237,0.15)",
                            borderRadius: "4px",
                            boxShadow: isSelected
                              ? "0 0 20px rgba(124,58,237,0.2)"
                              : "none",
                            transition: "all 0.2s",
                            clipPath:
                              "polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "Orbitron",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: isSelected
                                ? "rgba(167,139,250,1)"
                                : "rgba(167,139,250,0.4)",
                              minWidth: "20px",
                            }}
                          >
                            {optionLabels[i]}
                          </span>
                          <span
                            style={{
                              fontFamily: "Rajdhani",
                              fontSize: "14px",
                              letterSpacing: "1px",
                              color: isSelected
                                ? "white"
                                : "rgba(255,255,255,0.7)",
                            }}
                          >
                            {decodeHTML(opt)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswer !== null && (
                    <p
                      style={{
                        textAlign: "center",
                        marginTop: "16px",
                        fontSize: "11px",
                        letterSpacing: "3px",
                        color: "rgba(167,139,250,0.6)",
                      }}
                    >
                      ANSWER SUBMITTED — WAITING FOR OTHERS...
                    </p>
                  )}

                  {isHost && selectedAnswer !== null && (
                    <button
                      className="arena-btn"
                      onClick={() =>
                        send({ type: "start_game", game_name: gameName || "" })
                      }
                      style={{ marginTop: "16px", maxWidth: "200px" }}
                    >
                      NEXT QUESTION
                    </button>
                  )}

                  {lastAnswer && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px 16px",
                        background: lastAnswer.correct
                          ? "rgba(34,197,94,0.08)"
                          : "rgba(239,68,68,0.08)",
                        border: `1px solid ${lastAnswer.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                        fontSize: "12px",
                        letterSpacing: "2px",
                        color: lastAnswer.correct ? "#86efac" : "#fca5a5",
                        clipPath:
                          "polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)",
                      }}
                    >
                      {lastAnswer.username.toUpperCase()} —{" "}
                      {lastAnswer.correct
                        ? `+${lastAnswer.points} PTS`
                        : "WRONG"}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Leaderboard */}
            <div
              className="glow-card relative p-5"
              style={{ height: "fit-content" }}
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
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "4px",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: "16px",
                }}
              >
                LEADERBOARD
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[...scores]
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        background:
                          i === 0
                            ? "rgba(124,58,237,0.12)"
                            : "rgba(255,255,255,0.02)",
                        border:
                          i === 0
                            ? "1px solid rgba(124,58,237,0.3)"
                            : "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Orbitron",
                          fontSize: "10px",
                          color:
                            i === 0
                              ? "rgba(167,139,250,0.8)"
                              : "rgba(255,255,255,0.3)",
                          width: "18px",
                        }}
                      >
                        {i === 0 ? "#1" : `0${i + 1}`}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontFamily: "Rajdhani",
                          fontSize: "13px",
                          letterSpacing: "1px",
                          color:
                            p.username === username
                              ? "rgba(6,182,212,0.9)"
                              : "rgba(255,255,255,0.7)",
                        }}
                      >
                        {p.username.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontFamily: "Orbitron",
                          fontSize: "12px",
                          fontWeight: "700",
                          color:
                            i === 0
                              ? "rgba(167,139,250,1)"
                              : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {p.score}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Room;
