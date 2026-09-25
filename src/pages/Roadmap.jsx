import { useState, useEffect } from "react";
import { roadmapData as defaultRoadmap } from "../data/roadmapData";
import "./Roadmap.css";

function Roadmap() {
  const [stages, setStages] = useState(() => {
    try {
      const custom = localStorage.getItem("cp_custom_roadmap");
      return custom ? JSON.parse(custom) : defaultRoadmap;
    } catch {
      return defaultRoadmap;
    }
  });

  const [activeLevel, setActiveLevel] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [completedProblems, setCompletedProblems] = useState(() => {
    try {
      const saved = localStorage.getItem("cp_completed_problems");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [expandedTopics, setExpandedTopics] = useState({});

  useEffect(() => {
    const fetchLatestRoadmap = async () => {
      try {
        const res = await fetch("https://cp-project-el4p.onrender.com/api/roadmap");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setStages(data);
            localStorage.setItem("cp_custom_roadmap", JSON.stringify(data));
          }
        }
      } catch {
        // use local/default
      }
    };

    fetchLatestRoadmap();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cp_completed_problems", JSON.stringify(completedProblems));
    } catch (e) {
      console.error("Failed to save progress to localStorage:", e);
    }
  }, [completedProblems]);

  const toggleProblem = (problemId) => {
    setCompletedProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
  };

  const toggleAccordion = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !(prev[topicId] ?? true)
    }));
  };

  // Calculate total problems & completion rate
  let totalProblems = 0;
  stages.forEach((stage) => {
    if (stage.topics) {
      stage.topics.forEach((t) => {
        if (t.problems) {
          totalProblems += t.problems.length;
        }
      });
    }
  });

  const solvedCount = completedProblems.length;
  const progressPercent = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Filter roadmap by selected level and search term
  const filteredStages = stages
    .filter((stage) => activeLevel === "All" || stage.level === activeLevel)
    .map((stage) => ({
      ...stage,
      topics: (stage.topics || []).filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.problems && t.problems.some((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }))
    .filter((stage) => stage.topics.length > 0);

  return (
    <div className="roadmap-page">
      {/* Header & Progress Banner */}
      <section className="roadmap-header">
        <p className="roadmap-tag">LEARNING PATHWAY</p>
        <h1>Competitive Programming Roadmap</h1>
        <p className="roadmap-desc">
          Follow a structured curriculum from fundamentals to advanced algorithmic paradigms.
          Solve the curated practice problems and track your progress along the journey!
        </p>

        <div className="progress-card">
          <div className="progress-info">
            <span>Overall Completion</span>
            <span className="progress-stat">
              {solvedCount} / {totalProblems} Solved ({progressPercent}%)
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Filter and Search controls */}
      <section className="roadmap-controls">
        <div className="level-buttons">
          {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
            <button
              key={level}
              type="button"
              className={`filter-btn ${activeLevel === level ? "active" : ""}`}
              onClick={() => setActiveLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search topics or problems (e.g. Binary Search, CSES, DP)..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>

      {/* Roadmap Stages */}
      <div className="stages-container">
        {filteredStages.length === 0 ? (
          <div className="empty-state">
            <h3>No topics match your search</h3>
            <p>Try searching for a different keyword or reset your difficulty filter.</p>
          </div>
        ) : (
          filteredStages.map((stage) => (
            <div key={stage.id} className="stage-card">
              <div className="stage-header">
                <span
                  className="stage-badge"
                  style={{ backgroundColor: `${stage.levelColor}15`, color: stage.levelColor }}
                >
                  {stage.level}
                </span>
                <h2>{stage.title}</h2>
                <p>{stage.description}</p>
              </div>

              <div className="topics-list">
                {stage.topics.map((topic) => {
                  const topicSolved = (topic.problems || []).filter((p) =>
                    completedProblems.includes(p.id)
                  ).length;
                  const isExpanded = expandedTopics[topic.id] ?? true;

                  return (
                    <div key={topic.id} className="topic-card">
                      <div
                        className="topic-header"
                        onClick={() => toggleAccordion(topic.id)}
                      >
                        <div className="topic-title-box">
                          <h3>{topic.name}</h3>
                          <p>{topic.summary}</p>
                        </div>
                        <div className="topic-meta">
                          <span className="topic-count">
                            {topicSolved} / {topic.problems ? topic.problems.length : 0} Done
                          </span>
                          <span className="accordion-arrow">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="topic-body">
                          {/* Theory Resources */}
                          {topic.resources?.length > 0 && (
                            <div className="resources-section">
                              <strong>Study Material: </strong>
                              <div className="resource-links">
                                {topic.resources.map((res, i) => (
                                  <a
                                    key={i}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="resource-link"
                                  >
                                    📖 {res.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Problems List */}
                          <div className="problems-table">
                            {(topic.problems || []).map((prob) => {
                              const isDone = completedProblems.includes(prob.id);
                              return (
                                <div
                                  key={prob.id}
                                  className={`problem-row ${isDone ? "completed" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="problem-checkbox"
                                    checked={isDone}
                                    onChange={() => toggleProblem(prob.id)}
                                    aria-label={`Mark ${prob.title} as completed`}
                                  />

                                  <a
                                    href={prob.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="problem-link"
                                  >
                                    {prob.title}
                                  </a>

                                  <div className="problem-tags">
                                    <span className="platform-tag">
                                      {prob.platform}
                                    </span>
                                    <span className="difficulty-tag">
                                      {prob.difficulty}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Roadmap;