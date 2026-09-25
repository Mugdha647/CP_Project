import { useState, useRef } from "react";
import { Link } from "react-router-dom";
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
    try { return localStorage.getItem("cp_user_avatar") || ""; } catch { return ""; }
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload a valid image file."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("File too large. Max 2MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      try { localStorage.setItem("cp_user_avatar", reader.result); } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar("");
    localStorage.removeItem("cp_user_avatar");
  };

  const userInitial = (user?.username || "G").charAt(0).toUpperCase();
  const isAdmin = user?.role === "admin";

  return (
    <div className="profile-page">
      {!user && (
        <div className="profile-guest-bar">
          Not signed in.{" "}
          <Link to="/login">Sign in</Link> to save progress.
        </div>
      )}

      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar-wrap">
          {avatar ? (
            <img src={avatar} alt="avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar profile-avatar-initial">{userInitial}</div>
          )}

          <label className="avatar-edit-btn" title="Change photo">
            ✎
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </label>

          {avatar && (
            <button className="avatar-remove-btn" onClick={handleRemovePhoto} title="Remove photo">×</button>
          )}
        </div>

        {/* Info */}
        <div className="profile-info">
          <div className="profile-name">
            {user ? user.username : "Guest"}
            <span className={`profile-role ${isAdmin ? "admin" : "user"}`}>
              {isAdmin ? "Admin" : "Coder"}
            </span>
          </div>
          <div className="profile-email">{user?.email || "—"}</div>

          <div className="profile-meta">
            <span>Joined August 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;