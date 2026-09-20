import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Contest.css";

// Default initial fallback contests
const defaultContests = [
  {
    id: "sample-c1",
    title: "Weekly CP Master Challenge #1",
    description: "Standard algorithmic competition covering basic data structures, math, and greedy algorithms.",
    startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
    durationMinutes: 120,
    status: "active",
    problemCount: 4,
    participantCount: 0,
    registeredUsers: []
  },
  {
    id: "sample-c2",
    title: "Beginner Friendly Contest - Div 3",
    description: "Designed for beginners to practice implementation, arrays, strings, and brute force techniques.",
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 120).toISOString(),
    durationMinutes: 120,
    status: "upcoming",
    problemCount: 5,
    participantCount: 0,
    registeredUsers: []
  },
  {
    id: "sample-c3",
    title: "Graph & Tree Master Cup",
    description: "Challenging graph theory problems: BFS, DFS, Dijkstra, Topo Sort, and Disjoint Set Union.",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 150).toISOString(),
    durationMinutes: 150,
    status: "ended",
    problemCount: 4,
    participantCount: 0,
    registeredUsers: []
  }
];

function Contest() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'active' | 'upcoming' | 'ended' | 'leaderboard'
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredMap, setRegisteredMap] = useState(() => {
    try {
      const saved = localStorage.getItem("cp_registered_contests");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Leaderboard states
  const [selectedContestScope, setSelectedContestScope] = useState("global");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/contests");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setContests(data);
        } else {
          setContests(defaultContests);
        }
      } else {
        setContests(defaultContests);
      }
    } catch (err) {
      console.warn("Backend not available, using sample contests:", err);
      setContests(defaultContests);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async (scope) => {
    try {
      setLeaderboardLoading(true);
      let url = "http://localhost:5000/api/contests/leaderboard/global";
      if (scope !== "global") {
        url = `http://localhost:5000/api/contests/${scope}/leaderboard`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data || []);
        return;
      }
      setLeaderboardData([]);
    } catch {
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard(selectedContestScope);
    }
  }, [activeTab, selectedContestScope, fetchLeaderboard]);

  const handleRegister = async (contestId) => {
    if (!token) {
      alert("Please login to register for this contest.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/contests/${contestId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("Registered successfully!");
      }
    } catch {
      // Offline fallback
    }

    const updated = { ...registeredMap, [contestId]: true };
    setRegisteredMap(updated);
    localStorage.setItem("cp_registered_contests", JSON.stringify(updated));

    setContests((prev) =>
      prev.map((c) =>
        (c.id === contestId || c._id === contestId)
          ? { ...c, participantCount: (c.participantCount || 0) + 1 }
          : c
      )
    );
  };

  const handleOpenContestStandings = (contestId) => {
    setSelectedContestScope(contestId);
    setActiveTab("leaderboard");
  };

  const filteredContests = contests.filter((c) => {
    if (activeTab === "all") return true;
    return c.status === activeTab;
  });

  const filteredLeaderboard = leaderboardData.filter((entry) =>
    entry.username.toLowerCase().includes(leaderboardSearch.toLowerCase())
  );

  return (
    <div className="contest-page">
      {/* Header */}
      <section className="contest-header">
        <p className="contest-tag">COMPETITIVE ARENA</p>
        <h1>Programming Contests</h1>
        <p className="contest-desc">
          Test your problem-solving speed, track contest standings, and climb the real-time ranking leaderboard!
        </p>
      </section>

      {/* Filter Tabs */}
      <div className="contest-tabs">
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Contests
        </button>
        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          🔴 Live Now
        </button>
        <button
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          📅 Upcoming
        </button>
        <button
          className={`tab-btn ${activeTab === "ended" ? "active" : ""}`}
          onClick={() => setActiveTab("ended")}
        >
          🏁 Past Contests
        </button>
        <button
          className={`tab-btn ${activeTab === "leaderboard" ? "active" : ""}`}
          onClick={() => setActiveTab("leaderboard")}
          style={{ background: activeTab === "leaderboard" ? "#9333ea" : "", borderColor: activeTab === "leaderboard" ? "#9333ea" : "" }}
        >
          🏆 Standings & Leaderboard
        </button>
      </div>

      {/* ========================================================
          CONTESTS LIST VIEW
      ======================================================== */}
      {activeTab !== "leaderboard" && (
        <>
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px", color: "#64748b" }}>Loading contests...</div>
          ) : (
            <div className="contests-grid">
              {filteredContests.length === 0 ? (
                <div className="no-contests">
                  <h3>No {activeTab} contests found</h3>
                  <p>Check back later or explore other categories.</p>
                </div>
              ) : (
                filteredContests.map((c) => {
                  const cId = c.id || c._id;
                  const isRegistered =
                    registeredMap[cId] ||
                    (user && c.registeredUsers && c.registeredUsers.includes(user.id));

                  return (
                    <div key={cId} className="contest-card">
                      <div className="contest-card-top">
                        <div className="contest-badges">
                          <span className={`status-badge ${c.status}`}>
                            {c.status === "active" ? "● Live Now" : c.status}
                          </span>
                          <span className="duration-badge">⏱ {c.durationMinutes} mins</span>
                        </div>

                        <h3>{c.title}</h3>
                        <p className="contest-card-desc">{c.description}</p>

                        <div className="contest-info-list">
                          <div className="info-item">
                            <span>Start Time</span>
                            <span>{new Date(c.startTime).toLocaleString()}</span>
                          </div>
                          <div className="info-item">
                            <span>Problems</span>
                            <span>{c.problemCount || (c.problems ? c.problems.length : 0)} Problems</span>
                          </div>
                          <div className="info-item">
                            <span>Participants</span>
                            <span>{c.participantCount || (c.registeredUsers ? c.registeredUsers.length : 0)} registered</span>
                          </div>
                        </div>
                      </div>

                      <div className="contest-card-actions">
                        {c.status === "active" && (
                          <Link to={`/contest/${cId}`} className="btn-success">
                            Enter Live Arena →
                          </Link>
                        )}

                        {c.status === "upcoming" && (
                          isRegistered ? (
                            <button className="btn-registered" disabled>
                              ✓ Registered
                            </button>
                          ) : (
                            <button
                              className="btn-primary"
                              onClick={() => handleRegister(cId)}
                            >
                              Register Now
                            </button>
                          )
                        )}

                        {c.status === "ended" && (
                          <Link to={`/contest/${cId}`} className="btn-secondary">
                            View Problems
                          </Link>
                        )}

                        <button
                          className="btn-standings"
                          onClick={() => handleOpenContestStandings(cId)}
                          title="View Contest Standings"
                        >
                          🏆 Standings
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================
          LEADERBOARD VIEW (ONLY REAL USERS)
      ======================================================== */}
      {activeTab === "leaderboard" && (
        <section className="leaderboard-section">
          {/* Controls: Scope Selector and Search */}
          <div className="leaderboard-controls-card">
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                Select Contest Standings:
              </label>
              <select
                className="scope-select"
                value={selectedContestScope}
                onChange={(e) => setSelectedContestScope(e.target.value)}
              >
                <option value="global">🌐 All-Time Global Rating</option>
                {contests.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    🏆 {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                Search Participant:
              </label>
              <input
                type="text"
                placeholder="Search username..."
                className="leaderboard-search"
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Podium Cards - Only show for real users with score > 0 */}
          {filteredLeaderboard.length >= 3 && !leaderboardSearch && (
            <div className="podium-grid">
              {/* 2nd Place */}
              <div className="podium-card rank-2">
                <div className="podium-medal">🥈</div>
                <h3 className="podium-name">{filteredLeaderboard[1]?.username}</h3>
                <div className="podium-score">{filteredLeaderboard[1]?.totalScore} pts</div>
                <div className="podium-detail">Rank #2 • Rating: {filteredLeaderboard[1]?.rating || 850}</div>
              </div>

              {/* 1st Place (Winner) */}
              <div className="podium-card rank-1">
                <div className="podium-medal">👑 🥇</div>
                <h3 className="podium-name">{filteredLeaderboard[0]?.username}</h3>
                <div className="podium-score">{filteredLeaderboard[0]?.totalScore} pts</div>
                <div className="podium-detail">Champion • Rating: {filteredLeaderboard[0]?.rating || 950}</div>
              </div>

              {/* 3rd Place */}
              <div className="podium-card rank-3">
                <div className="podium-medal">🥉</div>
                <h3 className="podium-name">{filteredLeaderboard[2]?.username}</h3>
                <div className="podium-score">{filteredLeaderboard[2]?.totalScore} pts</div>
                <div className="podium-detail">Rank #3 • Rating: {filteredLeaderboard[2]?.rating || 800}</div>
              </div>
            </div>
          )}

          {/* Standings Table */}
          <div className="standings-table-card">
            {leaderboardLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading standings...</div>
            ) : filteredLeaderboard.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "#64748b" }}>
                <h3 style={{ margin: "0 0 8px", color: "#111827" }}>No Submissions Recorded Yet</h3>
                <p style={{ margin: 0 }}>Be the first participant to solve a problem and claim #1 on the leaderboard!</p>
              </div>
            ) : (
              <table className="standings-table">
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>Rank</th>
                    <th>Coder / Participant</th>
                    <th>Rating</th>
                    <th>Score / Points</th>
                    <th>Problems Solved</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((row, idx) => {
                    const isCurrentUser = user && row.username === user.username;
                    const rankClass = idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : "normal";

                    return (
                      <tr key={idx} className={isCurrentUser ? "current-user-row" : ""}>
                        <td>
                          <span className={`rank-tag ${rankClass}`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td>
                          <strong>{row.username}</strong> {isCurrentUser && <span style={{ color: "#2563eb", fontWeight: "600", fontSize: "12px" }}>(You)</span>}
                        </td>
                        <td>
                          <span className="rating-tag">
                            {row.rating || (800 + Math.min(row.totalScore, 1500))}
                          </span>
                        </td>
                        <td style={{ fontWeight: "700", color: "#16a34a" }}>
                          {row.totalScore} pts
                        </td>
                        <td>
                          {row.problemsSolved !== undefined && typeof row.problemsSolved === "number"
                            ? `${row.problemsSolved} solved`
                            : typeof row.problemsSolved === "object" && row.problemsSolved !== null
                            ? `${Object.keys(row.problemsSolved).length} solved`
                            : "0 solved"}
                        </td>
                        <td style={{ color: "#64748b", fontSize: "13px" }}>
                          {row.lastActive ? new Date(row.lastActive).toLocaleDateString() : (row.lastSubmissionTime ? new Date(row.lastSubmissionTime).toLocaleTimeString() : "Recent")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default Contest;