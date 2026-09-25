import { useState, useEffect, useCallback } from "react";
import { roadmapData as defaultRoadmap } from "../../data/roadmapData";
import "./AdminDashboard.css";

const INITIAL_CONTEST_FORM = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  durationMinutes: 120,
  problems: [
    {
      problemId: "p1",
      title: "Problem A: ",
      statement: "",
      inputFormat: "",
      outputFormat: "",
      constraints: "1 <= N <= 10^5",
      sampleInput: "",
      sampleOutput: "",
      points: 100,
      testCases: [
        { input: "", expectedOutput: "", isSample: true },   // visible sample
        { input: "", expectedOutput: "", isSample: false }   // hidden test case
      ]
    }
  ]
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'contests' | 'roadmap' | 'users'
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { username: "Admin" };
    } catch {
      return { username: "Admin" };
    }
  });

  const token = localStorage.getItem("token");

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 1,
    totalContests: 3,
    totalTopics: 8,
    totalProblems: 24,
    totalSubmissions: 0
  });

  // Contests State
  const [contests, setContests] = useState([]);
  const [showContestForm, setShowContestForm] = useState(false);
  const [contestForm, setContestForm] = useState(INITIAL_CONTEST_FORM);

  // Roadmap State (Admin Control)
  const [stages, setStages] = useState(defaultRoadmap);
  const [newStage, setNewStage] = useState({ level: "Beginner", title: "", description: "" });
  const [newTopic, setNewTopic] = useState({ stageId: "", name: "", summary: "", resourceName: "", resourceUrl: "" });
  const [newProblem, setNewProblem] = useState({ stageId: "", topicId: "", title: "", platform: "Codeforces", difficulty: "Easy", url: "" });

  // Users State
  const [usersList, setUsersList] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Fallback
    }
  }, [token]);

  const fetchContests = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/contests");
      if (res.ok) {
        const data = await res.json();
        setContests(data);
      }
    } catch {
      // Fallback
    }
  }, []);

  const fetchRoadmap = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/roadmap");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setStages(data);
          return;
        }
      }
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem("cp_custom_roadmap");
    if (saved) {
      try {
        setStages(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch {
      setUsersList([
        { _id: "1", username: user.username, email: user.email || "admin@cpmaster.com", role: "admin", createdAt: new Date() }
      ]);
    }
  }, [token, user.email, user.username]);

  useEffect(() => {
    fetchStats();
    fetchContests();
    fetchRoadmap();
    fetchUsers();
  }, [fetchStats, fetchContests, fetchRoadmap, fetchUsers]);

  // ==========================================
  // CONTEST CREATION & MANAGEMENT
  // ==========================================
  const handleAddProblemField = () => {
    const nextIdx = contestForm.problems.length + 1;
    const char = String.fromCharCode(64 + nextIdx);
    setContestForm((prev) => ({
      ...prev,
      problems: [
        ...prev.problems,
        {
          problemId: `p${nextIdx}`,
          title: `Problem ${char}: `,
          statement: "",
          inputFormat: "Standard Input",
          outputFormat: "Standard Output",
          constraints: "1 <= N <= 10^5",
          sampleInput: "",
          sampleOutput: "",
          points: 100 * nextIdx,
          testCases: [
            { input: "", expectedOutput: "", isSample: true },
            { input: "", expectedOutput: "", isSample: false }
          ]
        }
      ]
    }));
  };

  const handleProblemChange = (idx, field, value) => {
    const updated = [...contestForm.problems];
    updated[idx][field] = value;
    setContestForm((prev) => ({ ...prev, problems: updated }));
  };

  // Add a new test case to a problem
  const handleAddTestCase = (probIdx) => {
    const updated = [...contestForm.problems];
    updated[probIdx].testCases = [
      ...(updated[probIdx].testCases || []),
      { input: "", expectedOutput: "", isSample: false }
    ];
    setContestForm((prev) => ({ ...prev, problems: updated }));
  };

  // Remove a test case from a problem
  const handleRemoveTestCase = (probIdx, tcIdx) => {
    const updated = [...contestForm.problems];
    updated[probIdx].testCases = updated[probIdx].testCases.filter((_, i) => i !== tcIdx);
    setContestForm((prev) => ({ ...prev, problems: updated }));
  };

  // Update a specific test case field
  const handleTestCaseChange = (probIdx, tcIdx, field, value) => {
    const updated = [...contestForm.problems];
    updated[probIdx].testCases[tcIdx] = { ...updated[probIdx].testCases[tcIdx], [field]: value };
    setContestForm((prev) => ({ ...prev, problems: updated }));
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    if (!contestForm.title || !contestForm.startTime || !contestForm.endTime) {
      alert("Please fill in contest title, start time, and end time.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/contests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contestForm)
      });

      if (res.ok) {
        alert("Contest created and uploaded successfully!");
        setContestForm(INITIAL_CONTEST_FORM); // reset form for next creation
        setShowContestForm(false);
        fetchContests();
        fetchStats();
        return;
      }
    } catch (err) {
      console.warn("Backend error creating contest:", err);
    }

    // Local fallback
    const newEntry = {
      id: `contest-${Date.now()}`,
      ...contestForm,
      status: "upcoming",
      problemCount: contestForm.problems.length,
      participantCount: 0
    };
    setContests((prev) => [newEntry, ...prev]);
    setShowContestForm(false);
    alert("Contest created locally!");
  };

  const handleDeleteContest = async (contestId) => {
    if (!window.confirm("Are you sure you want to delete this contest?")) return;

    try {
      await fetch(`http://localhost:5000/api/contests/${contestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // ignore
    }

    setContests((prev) => prev.filter((c) => (c.id || c._id) !== contestId));
    alert("Contest deleted.");
  };

  // ==========================================
  // ROADMAP MANAGEMENT (Admin Control)
  // ==========================================
  const saveRoadmapChanges = async (newStagesList) => {
    setStages(newStagesList);
    localStorage.setItem("cp_custom_roadmap", JSON.stringify(newStagesList));

    try {
      await fetch("http://localhost:5000/api/roadmap/save-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stages: newStagesList })
      });
    } catch (err) {
      console.warn("Could not save roadmap to backend:", err);
    }
  };

  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newStage.title) return;

    const newId = `stage-${Date.now()}`;
    const levelColors = { Beginner: "#10b981", Intermediate: "#3b82f6", Advanced: "#8b5cf6" };

    const created = {
      id: newId,
      level: newStage.level,
      levelColor: levelColors[newStage.level] || "#10b981",
      title: newStage.title,
      description: newStage.description,
      topics: []
    };

    const updated = [...stages, created];
    saveRoadmapChanges(updated);
    setNewStage({ level: "Beginner", title: "", description: "" });
    alert("Stage added successfully!");
  };

  const handleDeleteStage = (stageId) => {
    if (!window.confirm("Delete this entire stage and all its topics?")) return;
    const updated = stages.filter((s) => s.id !== stageId);
    saveRoadmapChanges(updated);
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopic.stageId || !newTopic.name) {
      alert("Please select a stage and provide a topic name.");
      return;
    }

    const topicEntry = {
      id: `topic-${Date.now()}`,
      name: newTopic.name,
      summary: newTopic.summary,
      resources: newTopic.resourceName && newTopic.resourceUrl ? [{ name: newTopic.resourceName, url: newTopic.resourceUrl }] : [],
      problems: []
    };

    const updated = stages.map((s) => {
      if (s.id === newTopic.stageId) {
        return { ...s, topics: [...s.topics, topicEntry] };
      }
      return s;
    });

    saveRoadmapChanges(updated);
    setNewTopic({ stageId: "", name: "", summary: "", resourceName: "", resourceUrl: "" });
    alert("Topic added successfully!");
  };

  const handleDeleteTopic = (stageId, topicId) => {
    if (!window.confirm("Delete this topic?")) return;
    const updated = stages.map((s) => {
      if (s.id === stageId) {
        return { ...s, topics: s.topics.filter((t) => t.id !== topicId) };
      }
      return s;
    });
    saveRoadmapChanges(updated);
  };

  const handleAddProblem = (e) => {
    e.preventDefault();
    if (!newProblem.stageId || !newProblem.topicId || !newProblem.title || !newProblem.url) {
      alert("Please select a stage, topic, and enter problem title and URL.");
      return;
    }

    const problemEntry = {
      id: `p-${Date.now()}`,
      title: newProblem.title,
      platform: newProblem.platform,
      difficulty: newProblem.difficulty,
      url: newProblem.url
    };

    const updated = stages.map((s) => {
      if (s.id === newProblem.stageId) {
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (t.id === newProblem.topicId) {
              return { ...t, problems: [...t.problems, problemEntry] };
            }
            return t;
          })
        };
      }
      return s;
    });

    saveRoadmapChanges(updated);
    setNewProblem({ stageId: "", topicId: "", title: "", platform: "Codeforces", difficulty: "Easy", url: "" });
    alert("Problem added to roadmap!");
  };

  const handleDeleteProblem = (stageId, topicId, problemId) => {
    const updated = stages.map((s) => {
      if (s.id === stageId) {
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (t.id === topicId) {
              return { ...t, problems: t.problems.filter((p) => p.id !== problemId) };
            }
            return t;
          })
        };
      }
      return s;
    });
    saveRoadmapChanges(updated);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div>
          <span className="admin-badge">Admin Portal</span>
          <h1>Admin Dashboard</h1>
          <p style={{ margin: "5px 0 0", color: "#841ccf" }}>
            Welcome back, <strong>{user.username}</strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-nav">
        <button
          className={`admin-nav-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "contests" ? "active" : ""}`}
          onClick={() => setActiveTab("contests")}
        >
          🏆 Contest Manager
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "roadmap" ? "active" : ""}`}
          onClick={() => setActiveTab("roadmap")}
        >
          🗺️ Roadmap Control
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 User Management
        </button>
      </div>

      {/* ========================================================
          OVERVIEW TAB
      ======================================================== */}
      {activeTab === "overview" && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Contests Created</div>
              <div className="stat-value">{contests.length || stats.totalContests}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Roadmap Stages</div>
              <div className="stat-value">{stages.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Submissions</div>
              <div className="stat-value">{stats.totalSubmissions || 12}</div>
            </div>
          </div>

          <div className="admin-card-section">
            <h2>Quick Actions</h2>
            <div style={{ display: "flex", gap: "20px", marginTop: "15px", flexWrap: "wrap" }}>
              <button
                className="btn-create"
                onClick={() => {
                  setActiveTab("contests");
                  setShowContestForm(true);
                }}
              >
                + Upload New Contest
              </button>
              <button
                className="btn-create"
                style={{ background: "#8b5cf6" }}
                onClick={() => setActiveTab("roadmap")}
              >
                + Manage Roadmap Curriculum
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          CONTEST MANAGER TAB
      ======================================================== */}
      {activeTab === "contests" && (
        <div className="admin-card-section">
          <div className="section-top">
            <h2>Uploaded Contests</h2>
            <button
              className="btn-create"
              onClick={() => setShowContestForm(!showContestForm)}
            >
              {showContestForm ? "Close Form" : "+ Create / Upload Contest"}
            </button>
          </div>

          {/* Create Contest Form */}
          {showContestForm && (
            <form onSubmit={handleCreateContest} style={{ marginBottom: "30px", background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ marginTop: 0 }}>Create & Publish Contest</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Contest Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Div 3 Weekly Contest #1"
                    value={contestForm.title}
                    onChange={(e) => setContestForm({ ...contestForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (Minutes)</label>
                  <input
                    type="number"
                    value={contestForm.durationMinutes}
                    onChange={(e) => setContestForm({ ...contestForm, durationMinutes: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    value={contestForm.startTime}
                    onChange={(e) => setContestForm({ ...contestForm, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="datetime-local"
                    value={contestForm.endTime}
                    onChange={(e) => setContestForm({ ...contestForm, endTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full">
                  <label>Contest Description & Rules</label>
                  <textarea
                    placeholder="Describe contest topics, rules, and point distribution...."
                    value={contestForm.description}
                    onChange={(e) => setContestForm({ ...contestForm, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Dynamic Problems Builder */}
              <h3>Contest Problem Set ({contestForm.problems.length} Problems)</h3>
              {contestForm.problems.map((prob, idx) => (
                <div key={idx} className="problem-box-form">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <strong>Problem {idx + 1} — {prob.title || `Problem ${String.fromCharCode(65 + idx)}`}</strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{prob.points} pts • {(prob.testCases || []).length} test cases</span>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Problem Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Problem A: Sum of Two Elements"
                        value={prob.title}
                        onChange={(e) => handleProblemChange(idx, "title", e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Points Value</label>
                      <input
                        type="number"
                        value={prob.points}
                        onChange={(e) => handleProblemChange(idx, "points", Number(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Constraints</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 <= N <= 10^5"
                        value={prob.constraints}
                        onChange={(e) => handleProblemChange(idx, "constraints", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Difficulty</label>
                      <select
                        value={prob.difficulty || "Easy"}
                        onChange={(e) => handleProblemChange(idx, "difficulty", e.target.value)}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="form-group full">
                      <label>Problem Statement</label>
                      <textarea
                        placeholder="Full problem description — explain the task clearly..."
                        value={prob.statement}
                        onChange={(e) => handleProblemChange(idx, "statement", e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Input Format</label>
                      <textarea
                        placeholder="Input Format"
                        value={prob.inputFormat}
                        onChange={(e) => handleProblemChange(idx, "inputFormat", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Output Format</label>
                      <textarea
                        placeholder="Describe the expected output format..."
                        value={prob.outputFormat}
                        onChange={(e) => handleProblemChange(idx, "outputFormat", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Test Cases Editor */}
                  <div style={{ marginTop: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <strong style={{ fontSize: "14px", color: "#374151" }}>
                        🧪 Test Cases ({(prob.testCases || []).length} total — {(prob.testCases || []).filter(t => t.isSample).length} visible, {(prob.testCases || []).filter(t => !t.isSample).length} hidden)
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleAddTestCase(idx)}
                        style={{ background: "#e0f2fe", border: "1px solid #7dd3fc", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#0369a1", fontSize: "12px" }}
                      >
                        + Add Test Case
                      </button>
                    </div>

                    {(prob.testCases || []).map((tc, tcIdx) => (
                      <div
                        key={tcIdx}
                        style={{
                          background: tc.isSample ? "#f0fdf4" : "#fef3c7",
                          border: `1px solid ${tc.isSample ? "#86efac" : "#fcd34d"}`,
                          borderRadius: "8px",
                          padding: "12px",
                          marginBottom: "10px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: tc.isSample ? "#15803d" : "#b45309" }}>
                              {tc.isSample ? "👁 Visible Sample" : `🔒 Hidden Test #${tcIdx + 1}`}
                            </span>
                            <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={tc.isSample}
                                onChange={(e) => handleTestCaseChange(idx, tcIdx, "isSample", e.target.checked)}
                              />
                              Make Visible to Users
                            </label>
                          </div>
                          {(prob.testCases || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTestCase(idx, tcIdx)}
                              style={{ background: "#fee2e2", border: "none", color: "#ef4444", padding: "3px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>
                              Input
                            </label>
                            <textarea
                              placeholder="Test case input..."
                              value={tc.input}
                              onChange={(e) => handleTestCaseChange(idx, tcIdx, "input", e.target.value)}
                              style={{ width: "100%", minHeight: "70px", fontFamily: "monospace", fontSize: "12px", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", resize: "vertical", boxSizing: "border-box" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>
                              Expected Output
                            </label>
                            <textarea
                              placeholder="Expected output for this input..."
                              value={tc.expectedOutput}
                              onChange={(e) => handleTestCaseChange(idx, tcIdx, "expectedOutput", e.target.value)}
                              style={{ width: "100%", minHeight: "70px", fontFamily: "monospace", fontSize: "12px", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", resize: "vertical", boxSizing: "border-box" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  type="button"
                  onClick={handleAddProblemField}
                  style={{ background: "#f3f4f6", border: "1px solid #d1d5db", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  + Add Another Problem
                </button>
                <button type="submit" className="btn-create">
                  Publish Contest
                </button>
              </div>
            </form>
          )}

          {/* Contests Table */}
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Start Time</th>
                <th>Problems</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contests.map((c) => {
                const cId = c.id || c._id;
                return (
                  <tr key={cId}>
                    <td><strong>{c.title}</strong></td>
                    <td>
                      <span style={{ textTransform: "capitalize", fontWeight: "600", color: c.status === "active" ? "#ef4444" : "#2563eb" }}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.durationMinutes} mins</td>
                    <td>{new Date(c.startTime).toLocaleString()}</td>
                    <td>{c.problemCount || (c.problems ? c.problems.length : 0)}</td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteContest(cId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          ROADMAP CONTROL TAB (Admin Full Control)
      ======================================================== */}
      {activeTab === "roadmap" && (
        <div>
          <div className="admin-card-section">
            <div className="section-top">
              <h2>Roadmap Curriculum Control</h2>
              <button
                className="btn-create"
                onClick={() => saveRoadmapChanges(stages)}
              >
                💾 Sync & Save All to Database
              </button>
            </div>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: 0 }}>
              Add, remove, or modify learning stages, topics, study resources, and practice problems in real time.
            </p>

            {/* Add Stage Form */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "25px" }}>
              <h4 style={{ margin: "0 0 10px" }}>+ Add New Learning Stage</h4>
              <form onSubmit={handleAddStage} className="form-grid">
                <div className="form-group">
                  <label>Difficulty Tier</label>
                  <select
                    value={newStage.level}
                    onChange={(e) => setNewStage({ ...newStage, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stage Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Stage 4: Advanced Dynamic Programming"
                    value={newStage.title}
                    onChange={(e) => setNewStage({ ...newStage, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="What skills will users acquire in this stage?"
                    value={newStage.description}
                    onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" className="btn-create">
                    Add Stage
                  </button>
                </div>
              </form>
            </div>

            {/* Add Topic Form */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "25px" }}>
              <h4 style={{ margin: "0 0 10px" }}>+ Add New Topic to Stage</h4>
              <form onSubmit={handleAddTopic} className="form-grid">
                <div className="form-group">
                  <label>Target Stage</label>
                  <select
                    value={newTopic.stageId}
                    onChange={(e) => setNewTopic({ ...newTopic, stageId: e.target.value })}
                    required
                  >
                    <option value="">-- Select Stage --</option>
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.level}: {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Topic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Disjoint Set Union (DSU)"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group full">
                  <label>Topic Summary</label>
                  <input
                    type="text"
                    placeholder="Key concepts to learn..."
                    value={newTopic.summary}
                    onChange={(e) => setNewTopic({ ...newTopic, summary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Resource Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CP-Algorithms DSU"
                    value={newTopic.resourceName}
                    onChange={(e) => setNewTopic({ ...newTopic, resourceName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Resource URL</label>
                  <input
                    type="url"
                    placeholder="https://cp-algorithms.com/..."
                    value={newTopic.resourceUrl}
                    onChange={(e) => setNewTopic({ ...newTopic, resourceUrl: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" className="btn-create">
                    Add Topic
                  </button>
                </div>
              </form>
            </div>

            {/* Add Problem Form */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "25px" }}>
              <h4 style={{ margin: "0 0 10px" }}>+ Add Practice Problem to Topic</h4>
              <form onSubmit={handleAddProblem} className="form-grid">
                <div className="form-group">
                  <label>Stage</label>
                  <select
                    value={newProblem.stageId}
                    onChange={(e) => setNewProblem({ ...newProblem, stageId: e.target.value, topicId: "" })}
                    required
                  >
                    <option value="">-- Select Stage --</option>
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.level}: {s.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Topic</label>
                  <select
                    value={newProblem.topicId}
                    onChange={(e) => setNewProblem({ ...newProblem, topicId: e.target.value })}
                    required
                  >
                    <option value="">-- Select Topic --</option>
                    {stages.find((s) => s.id === newProblem.stageId)?.topics?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Problem Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Counting Rooms"
                    value={newProblem.title}
                    onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Platform</label>
                  <select
                    value={newProblem.platform}
                    onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                  >
                    <option value="Codeforces">Codeforces</option>
                    <option value="CSES">CSES</option>
                    <option value="LeetCode">LeetCode</option>
                    <option value="AtCoder">AtCoder</option>
                    <option value="HackerRank">HackerRank</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty Rating</label>
                  <input
                    type="text"
                    placeholder="e.g. 1200 or Medium"
                    value={newProblem.difficulty}
                    onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Problem Link URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newProblem.url}
                    onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })}
                    required
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" className="btn-create">
                    Add Problem
                  </button>
                </div>
              </form>
            </div>

            {/* Stages Display */}
            <h3>Live Roadmap Structure</h3>
            {stages.map((stage) => (
              <div key={stage.id} className="roadmap-stage-manage">
                <div className="stage-title-row">
                  <div>
                    <span style={{ color: stage.levelColor, fontWeight: "700", marginRight: "10px" }}>
                      [{stage.level}]
                    </span>
                    <strong>{stage.title}</strong>
                    <span style={{ color: "#64748b", marginLeft: "10px", fontSize: "13px" }}>
                      ({stage.topics ? stage.topics.length : 0} topics)
                    </span>
                  </div>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteStage(stage.id)}
                  >
                    Delete Stage
                  </button>
                </div>

                {stage.topics?.map((topic) => (
                  <div key={topic.id} className="topic-manage-card">
                    <div className="topic-manage-header">
                      <div>
                        <h4>{topic.name}</h4>
                        <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>{topic.summary}</p>
                      </div>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteTopic(stage.id, topic.id)}
                      >
                        Delete Topic
                      </button>
                    </div>

                    <div className="problem-pill-list">
                      {topic.problems?.map((p) => (
                        <span key={p.id} className="problem-pill">
                          {p.title} ({p.difficulty})
                          <span
                            className="pill-delete"
                            onClick={() => handleDeleteProblem(stage.id, topic.id, p.id)}
                            title="Delete problem"
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          USERS TAB
      ======================================================== */}
      {activeTab === "users" && (
        <div className="admin-card-section">
          <h2>Registered Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u._id || u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{ fontWeight: "600", color: u.role === "admin" ? "#ef4444" : "#2563eb" }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;