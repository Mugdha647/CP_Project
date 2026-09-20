import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { roadmapData } from "../data/roadmapData";
import "./Profile.css";

function Profile() {
  const fileInputRef = useRef(null);

  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem("cp_user_avatar") || "";
    } catch {
      return "";
    }
  });

  const [completedProblems] = useState(() => {
    try {
      const saved = localStorage.getItem("cp_completed_problems");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [registeredContests] = useState(() => {
    try {
      const saved = localStorage.getItem("cp_registered_contests");
      return saved ? Object.keys(JSON.parse(saved)).length : 0;
    } catch {
      return 0;
    }
  });

  // Calculate real metrics
  const solvedCount = completedProblems.length;
  let totalCurriculumProblems = 0;
  roadmapData.forEach((s) => {
    s.topics.forEach((t) => {
      totalCurriculumProblems += t.problems.length;
    });
  });

  // Dynamic Rating and Title Calculation (starts from 0)
  const realRating = user ? (solvedCount * 25) + (registeredContests * 50) : 0;

  const getRankTier = (rating) => {
    if (rating >= 1100) return { title: "Candidate Master", color: "#aa00aa", bg: "#faf5ff" };
    if (rating >= 800) return { title: "Expert", color: "#2563eb", bg: "#eff6ff" };
    if (rating >= 600) return { title: "Specialist", color: "#0284c7", bg: "#f0f9ff" };
    if (rating >= 400) return { title: "Pupil", color: "#16a34a", bg: "#f0fdf4" };
    if (rating >= 100) return { title: "Apprentice", color: "#f59e0b", bg: "#fffbeb" };
    return { title: "Newbie", color: "#64748b", bg: "#f1f5f9" };
  };

  const rankTier = getRankTier(realRating);

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setAvatar(result);
      try {
        localStorage.setItem("cp_user_avatar", result);
      } catch (err) {
        console.warn("Local storage image error:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar("");
    localStorage.removeItem("cp_user_avatar");
  };

  // Get user initial for monogram
  const userInitial = (user?.username || "G").charAt(0).toUpperCase();

  // Stage completion statistics
  const stageStats = roadmapData.map((stage) => {
    let stageTotal = 0;
    let stageSolved = 0;
    stage.topics.forEach((t) => {
      stageTotal += t.problems.length;
      t.problems.forEach((p) => {
        if (completedProblems.includes(p.id)) stageSolved++;
      });
    });
    const pct = stageTotal > 0 ? Math.round((stageSolved / stageTotal) * 100) : 0;
    return { title: stage.title, level: stage.level, color: stage.levelColor, solved: stageSolved, total: stageTotal, pct };
  });

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Notice for Guest */}
        {!user && (
          <div className="guest-notice">
            <span>You are viewing as <strong>Guest</strong>. Sign in or create an account to save your ratings and achievements across devices!</span>
            <Link to="/login" style={{ color: "#2563eb", fontWeight: "700", textDecoration: "none" }}>
              Sign In →
            </Link>
          </div>
        )}

        {/* Hero Card */}
        <div className="profile-hero-card">
          <div className="profile-banner"></div>

          <div className="profile-hero-body">
            <div style={{ display: "flex", gap: "25px", alignItems: "flex-end", flexWrap: "wrap" }}>
              {/* Avatar Upload */}
              <div className="avatar-wrapper">
                {avatar ? (
                  <img src={avatar} alt="Profile Avatar" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar">
                    {userInitial}
                  </div>
                )}

                <label className="photo-upload-btn" title="Upload profile photo">
                  📷
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </label>

                {avatar && (
                  <button
                    className="photo-remove-btn"
                    onClick={handleRemovePhoto}
                    title="Remove profile photo"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="profile-user-info">
                <h1>
                  {user ? user.username : "Guest Coder"}
                  <span className={`role-badge ${user?.role === "admin" ? "admin" : "user"}`}>
                    {user?.role === "admin" ? "Admin" : "Coder"}
                  </span>
                </h1>
                <p className="profile-email">
                  {user?.email || "guest@cpmaster.local"} • Joined {user ? "August 2026" : "Guest Mode"}
                </p>
              </div>
            </div>

            {/* Rank Card */}
            <div className="profile-rank-card">
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                  Current Division
                </div>
                <span
                  className="rank-tier-badge"
                  style={{ color: rankTier.color, backgroundColor: rankTier.bg }}
                >
                  {rankTier.title} ({realRating})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div className="p-stat-card">
            <div className="p-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              🎯
            </div>
            <div>
              <div className="p-stat-label">Rating</div>
              <div className="p-stat-value">{realRating}</div>
            </div>
          </div>

          <div className="p-stat-card">
            <div className="p-stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              🧩
            </div>
            <div>
              <div className="p-stat-label">Roadmap Solved</div>
              <div className="p-stat-value">{solvedCount} <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>/ {totalCurriculumProblems}</span></div>
            </div>
          </div>

          <div className="p-stat-card">
            <div className="p-stat-icon" style={{ background: "#faf5ff", color: "#9333ea" }}>
              🏆
            </div>
            <div>
              <div className="p-stat-label">Contests Registered</div>
              <div className="p-stat-value">{registeredContests}</div>
            </div>
          </div>

          <div className="p-stat-card">
            <div className="p-stat-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
              🔥
            </div>
            <div>
              <div className="p-stat-label">Problem Streak</div>
              <div className="p-stat-value">{solvedCount > 0 ? `${solvedCount} Days` : "0 Days"}</div>
            </div>
          </div>
        </div>

        {/* Details & Stage Progress */}
        <div className="profile-content-grid">
          {/* Stage Progress */}
          <div className="profile-section-card">
            <h3>Curriculum Mastery</h3>
            {stageStats.map((stage, idx) => (
              <div key={idx} className="skill-bar-row">
                <div className="skill-bar-info">
                  <span>{stage.title}</span>
                  <span style={{ color: stage.color }}>{stage.solved} / {stage.total} ({stage.pct}%)</span>
                </div>
                <div className="skill-bar-bg">
                  <div
                    className="skill-bar-fill"
                    style={{ width: `${stage.pct}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="profile-section-card">
            <h3>Quick Actions</h3>
            <div className="profile-actions">
              <Link to="/roadmap" className="profile-btn primary">
                🚀 Continue Roadmap Learning
              </Link>
              <Link to="/contest" className="profile-btn secondary">
                🏆 Explore Active Contests
              </Link>
              {user?.role === "admin" && (
                <Link to="/admin" className="profile-btn secondary" style={{ color: "#ef4444", borderColor: "#fca5a5" }}>
                  ⚙️ Open Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;