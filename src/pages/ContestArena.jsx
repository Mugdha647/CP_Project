import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import "./ContestArena.css";

const starterTemplates = {
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your solution here
    
    return 0;
}`,
  python: `import sys

def solve():
    # Write your solution here
    pass

if __name__ == "__main__":
    solve()
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
  javascript: `const fs = require('fs');

function solve() {
    // Write your solution here
}

solve();`
};

const sampleArenaContest = {
  id: "sample-c1",
  title: "Weekly CP Master Challenge #1",
  startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  endTime: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
  durationMinutes: 120,
  problems: [
    {
      problemId: "p1",
      title: "Problem A: Sum of Two Elements",
      statement: "You are given an array of N integers and a target sum X. Your task is to find two distinct indices such that their sum equals X.",
      inputFormat: "The first line contains two integers N (2 <= N <= 10^5) and X. The next line contains N space-separated integers.",
      outputFormat: "Print the 1-based indices of the two elements, or -1 if no such pair exists.",
      constraints: "2 <= N <= 10^5, 1 <= X <= 10^9, 1 <= a[i] <= 10^9",
      sampleInput: "4 8\n2 7 5 1",
      sampleOutput: "2 4",
      points: 100
    },
    {
      problemId: "p2",
      title: "Problem B: Maximum Subarray Beauty",
      statement: "Given an array of integers, find the maximum possible sum of any contiguous non-empty subarray.",
      inputFormat: "The first line contains an integer N. The second line contains N integers.",
      outputFormat: "Print a single integer — the maximum contiguous subarray sum.",
      constraints: "1 <= N <= 2 * 10^5, -10^9 <= a[i] <= 10^9",
      sampleInput: "8\n-1 3 -2 5 3 -5 2 2",
      sampleOutput: "9",
      points: 250
    },
    {
      problemId: "p3",
      title: "Problem C: Shortest Grid Path",
      statement: "You are placed in an N x M labyrinth. Find the minimum number of steps to travel from start 'A' to destination 'B' avoiding obstacles '#'.",
      inputFormat: "The first line contains N and M. The next N lines contain strings of length M.",
      outputFormat: "Print 'YES' and the shortest distance, or 'NO' if no path exists.",
      constraints: "1 <= N, M <= 1000",
      sampleInput: "5 8\n########\n#.A#...#\n#.##.#B#\n#......#\n########",
      sampleOutput: "YES\n9",
      points: 400
    }
  ]
};

// Judge0 Client Code Evaluation Helper (free public CE endpoint)
const JUDGE0_API_URL = "https://ce.judge0.com";
const JUDGE0_LANGUAGES = {
  cpp: 105,
  python: 100,
  java: 91,
  javascript: 97
};

function toBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str || "")));
  } catch {
    return "";
  }
}

function fromBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str || "")));
  } catch {
    return str || "";
  }
}

async function evaluateWithJudge0Client(code, language, problem) {
  const cleanCode = (code || "").trim();
  if (cleanCode.length < 5) {
    return { verdict: "Wrong Answer", score: 0, reason: "Submission is too short to be valid." };
  }

  let testCases = (problem.testCases || []).filter(
    (tc) => tc && (tc.input !== undefined || tc.expectedOutput !== undefined)
  );
  if (testCases.length === 0 && (problem.sampleInput || problem.sampleOutput)) {
    testCases = [{ input: problem.sampleInput || "", expectedOutput: problem.sampleOutput || "", isSample: true }];
  }
  if (testCases.length === 0) {
    testCases = [{ input: "", expectedOutput: "", isSample: true }];
  }

  const langId = JUDGE0_LANGUAGES[language] || 105;
  const totalTests = testCases.length;

  try {
    const results = await Promise.all(
      testCases.map(async (tc) => {
        const payload = {
          source_code: toBase64(cleanCode),
          language_id: langId,
          stdin: toBase64(tc.input || ""),
          expected_output: toBase64(tc.expectedOutput || ""),
          cpu_time_limit: 2.5
        };

        const res = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Judge API responded with error");
        const data = await res.json();
        return {
          statusId: data.status?.id || 0,
          statusDescription: data.status?.description || "Error",
          stdout: fromBase64(data.stdout),
          stderr: fromBase64(data.stderr),
          compileOutput: fromBase64(data.compile_output),
          isSample: tc.isSample,
          expectedOutput: tc.expectedOutput || ""
        };
      })
    );

    const compileErr = results.find((r) => r.statusId === 6);
    if (compileErr) {
      return {
        verdict: "Compilation Error",
        score: 0,
        reason: "Compilation Error: Code failed to compile.",
        errorDetails: compileErr.compileOutput || compileErr.stderr || "Compilation failed."
      };
    }

    let testsPassed = 0;
    let firstFail = null;
    let firstFailIdx = -1;

    for (let i = 0; i < results.length; i++) {
      if (results[i].statusId === 3) {
        testsPassed++;
      } else if (!firstFail) {
        firstFail = results[i];
        firstFailIdx = i + 1;
      }
    }

    const maxPoints = problem.points || 100;
    const partialScore = Math.floor((testsPassed / totalTests) * maxPoints);

    if (testsPassed === totalTests) {
      return {
        verdict: "Accepted",
        score: maxPoints,
        reason: `All ${totalTests} test case${totalTests > 1 ? "s" : ""} passed successfully!`
      };
    }

    if (firstFail) {
      if (firstFail.statusId === 5) {
        return {
          verdict: "Time Limit Exceeded",
          score: partialScore,
          reason: `Time Limit Exceeded (> 2.0s) on test case ${firstFailIdx}/${totalTests}.`
        };
      }
      if (firstFail.statusId >= 7 && firstFail.statusId <= 12) {
        return {
          verdict: "Runtime Error",
          score: partialScore,
          reason: `Runtime Error (${firstFail.statusDescription}) on test case ${firstFailIdx}/${totalTests}.`,
          errorDetails: firstFail.stderr || firstFail.statusDescription
        };
      }
      return {
        verdict: "Wrong Answer",
        score: partialScore,
        reason: testsPassed > 0
          ? `Partial: Passed ${testsPassed}/${totalTests} test cases. Wrong Answer on test case ${firstFailIdx}.`
          : `Wrong Answer on test case ${firstFailIdx}/${totalTests}: Output did not match expected.`,
        errorDetails: firstFail.isSample
          ? `Sample test failed.\nYour output: ${firstFail.stdout.trim() || "(empty)"}\nExpected: ${firstFail.expectedOutput.trim()}`
          : ""
      };
    }

    return { verdict: "Wrong Answer", score: partialScore, reason: "Test evaluation failed." };
  } catch {
    return {
      verdict: "Wrong Answer",
      score: 0,
      reason: "Could not reach code evaluation judge. Please verify internet connection."
    };
  }
}

function ContestArena() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [activeTab, setActiveTab] = useState("arena");
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterTemplates.cpp);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [verdictReason, setVerdictReason] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [solvedMap, setSolvedMap] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState("01:30:00");
  const [isEnded, setIsEnded] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { username: "Guest Coder", id: "guest" };
    } catch {
      return { username: "Guest Coder", id: "guest" };
    }
  })();

  const token = localStorage.getItem("token");

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`https://cp-project-el4p.onrender.com/api/contests/${id}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
        return;
      }
    } catch {
      // Fallback
    }

    const currentScore = Object.values(solvedMap).reduce((a, b) => a + b, 0);
    if (currentScore > 0) {
      setLeaderboard([
        {
          username: user.username,
          totalScore: currentScore,
          problemsSolved: solvedMap,
          lastSubmissionTime: new Date().toISOString()
        }
      ]);
    } else {
      setLeaderboard([]);
    }
  }, [id, user.username, solvedMap]);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await fetch(`https://cp-project-el4p.onrender.com/api/contests/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.problems && data.problems.length > 0) {
            setContest(data);
            return;
          }
        }
      } catch (err) {
        console.warn("Using sample contest arena data:", err);
      }
      setContest(sampleArenaContest);
    };

    fetchContest();
  }, [id]);

  // Real-time countdown timer
  useEffect(() => {
    if (!contest) return;

    const tick = () => {
      const now = Date.now();
      let targetEnd = contest.endTime ? new Date(contest.endTime).getTime() : null;

      if (!targetEnd || isNaN(targetEnd)) {
        const start = contest.startTime ? new Date(contest.startTime).getTime() : now - 1000 * 60 * 30;
        targetEnd = start + (contest.durationMinutes || 120) * 60 * 1000;
      }

      const diff = targetEnd - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00 (Ended)");
        setIsEnded(true);
        return;
      }

      setIsEnded(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      setTimeLeft(formatted);
    };

    tick();
    const timerId = setInterval(tick, 1000);

    return () => clearInterval(timerId);
  }, [contest]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard();
    }
  }, [activeTab, fetchLeaderboard]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(starterTemplates[newLang] || "");
    setVerdict(null);
    setVerdictReason("");
    setErrorDetails("");
  };

  const handleSubmit = async () => {
    if (isEnded) {
      alert("This contest has ended. Submissions are no longer evaluated for score.");
      return;
    }

    if (!code || !code.trim()) {
      alert("Please write some code before submitting.");
      return;
    }

    const currentProblem = contest.problems[currentProblemIdx];
    const problemId = currentProblem.problemId || currentProblem._id;

    setSubmitting(true);
    setVerdict(null);
    setVerdictReason("");
    setErrorDetails("");

    try {
      const res = await fetch(`https://cp-project-el4p.onrender.com/api/contests/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId,
          language,
          code
        })
      });

      if (res.ok) {
        const data = await res.json();
        const v = data.submission.verdict;
        setVerdict(v);
        setVerdictReason(data.reason || (v === "Accepted" ? "All test cases passed!" : "Did not match expected output"));
        setErrorDetails(data.errorDetails || "");
        if (v === "Accepted") {
          setSolvedMap((prev) => ({ ...prev, [problemId]: currentProblem.points || 100 }));
        }
        setSubmitting(false);
        return;
      }
    } catch {
      // Local client evaluation fallback via Judge0 CE
    }

    try {
      const result = await evaluateWithJudge0Client(code, language, currentProblem);
      setVerdict(result.verdict);
      setVerdictReason(result.reason);
      setErrorDetails(result.errorDetails || "");

      if (result.verdict === "Accepted") {
        setSolvedMap((prev) => ({ ...prev, [problemId]: currentProblem.points || 100 }));
      }
    } catch (err) {
      setVerdict("Wrong Answer");
      setVerdictReason("Judge evaluation failed: " + err.message);
      setErrorDetails("");
    } finally {
      setSubmitting(false);
    }
  };

  if (!contest) {
    return <div style={{ color: "white", padding: "50px", textAlign: "center" }}>Loading contest arena...</div>;
  }

  const currentProblem = contest.problems[currentProblemIdx] || contest.problems[0];

  return (
    <div className="arena-page">
      {/* Top Header */}
      <header className="arena-header">
        <div className="arena-header-left">
          <Link to="/contest" className="back-link">
            ← Exit Arena
          </Link>
          <h2 className="arena-title">{contest.title}</h2>
        </div>

        <div className="arena-header-right">
          <div className={`arena-timer ${isEnded ? "ended" : ""}`}>
            ⏱ Time Left: {timeLeft}
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${activeTab === "arena" ? "active" : ""}`}
              onClick={() => setActiveTab("arena")}
            >
              Coding Arena
            </button>
            <button
              className={`toggle-btn ${activeTab === "leaderboard" ? "active" : ""}`}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </button>
          </div>
        </div>
      </header>

      {activeTab === "arena" ? (
        <>
          {/* Problem Selector Tabs */}
          <div className="problem-nav-bar">
            {contest.problems.map((p, idx) => {
              const pId = p.problemId || p._id;
              const isSolved = Boolean(solvedMap[pId]);
              return (
                <button
                  key={pId}
                  className={`prob-tab ${currentProblemIdx === idx ? "active" : ""}`}
                  onClick={() => {
                    setCurrentProblemIdx(idx);
                    setVerdict(null);
                    setVerdictReason("");
                    setErrorDetails("");
                  }}
                >
                  <span className={`prob-status-dot ${isSolved ? "solved" : ""}`} />
                  {p.title || `Problem ${String.fromCharCode(65 + idx)}`}
                </button>
              );
            })}
          </div>

          {/* Split Screen View */}
          <div className="arena-main">
            {/* Statement Panel */}
            <div className="statement-panel">
              <div className="statement-title-box">
                <h2>{currentProblem.title}</h2>
                <div className="statement-meta">
                  <span>Score: {currentProblem.points || 100} pts</span>
                  <span>Time Limit: 1.0s</span>
                  <span>Memory: 256MB</span>
                </div>
              </div>

              <div className="section-block">
                <h4>Problem Statement</h4>
                <p>{currentProblem.statement}</p>
              </div>

              <div className="section-block">
                <h4>Input Format</h4>
                <p>{currentProblem.inputFormat}</p>
              </div>

              <div className="section-block">
                <h4>Output Format</h4>
                <p>{currentProblem.outputFormat}</p>
              </div>

              {currentProblem.constraints && (
                <div className="section-block">
                  <h4>Constraints</h4>
                  <pre>{currentProblem.constraints}</pre>
                </div>
              )}

              <div className="section-block">
                <h4>Sample Cases</h4>
                {(() => {
                  // Use sampleTestCases array (from backend) if available; otherwise fall back to sampleInput/sampleOutput fields
                  const samples = (currentProblem.sampleTestCases && currentProblem.sampleTestCases.length > 0)
                    ? currentProblem.sampleTestCases
                    : (currentProblem.sampleInput || currentProblem.sampleOutput)
                      ? [{ input: currentProblem.sampleInput || "", expectedOutput: currentProblem.sampleOutput || "" }]
                      : [];

                  if (samples.length === 0) {
                    return (
                      <div className="sample-box">
                        <p style={{ color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "12px 0" }}>
                          No sample test cases provided for this problem.
                        </p>
                      </div>
                    );
                  }

                  return samples.map((sample, sIdx) => (
                    <div key={sIdx} className="sample-box" style={{ marginBottom: sIdx < samples.length - 1 ? "12px" : 0 }}>
                      {samples.length > 1 && (
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>
                          Sample {sIdx + 1}
                        </div>
                      )}
                      <div className="sample-block">
                        <div className="sample-label">Sample Input</div>
                        <pre>{sample.input || "(empty)"}</pre>
                      </div>
                      <div className="sample-block">
                        <div className="sample-label">Sample Output</div>
                        <pre>{sample.expectedOutput || "(empty)"}</pre>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Code Editor Panel */}
            <div className="editor-panel">
              <div className="editor-toolbar">
                <select
                  className="lang-select"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="cpp">C++ 20 (GCC 13)</option>
                  <option value="python">Python 3.11</option>
                  <option value="java">Java 17</option>
                  <option value="javascript">JavaScript (Node.js)</option>
                </select>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Coder: <strong style={{ color: "#38bdf8" }}>{user.username}</strong>
                </span>
              </div>

              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your solution here..."
                spellCheck="false"
              />

              <div className="editor-footer">
                <div>
                  {verdict && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "450px" }}>
                      <span className={`verdict-box ${verdict.replace(/\s+/g, "-")}`}>
                        {verdict === "Accepted" ? "✓ Accepted" : `✗ ${verdict}`}
                      </span>
                      {verdictReason && (
                        <span style={{ fontSize: "12px", color: verdict === "Accepted" ? "#34d399" : "#fca5a5" }}>
                          {verdictReason}
                        </span>
                      )}
                      {errorDetails && (
                        <pre className="verdict-error-details">
                          {errorDetails}
                        </pre>
                      )}
                    </div>
                  )}
                </div>

                <div className="editor-actions">
                  <button
                    className="btn-submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Evaluating..." : "Submit Solution"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Leaderboard View */
        <div className="leaderboard-container">
          <h2 style={{ marginBottom: "20px" }}>Contest Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px", background: "#1e293b", borderRadius: "10px", border: "1px solid #334155", color: "#94a3b8" }}>
              <h3 style={{ margin: "0 0 8px", color: "#f8fafc" }}>No Submissions Yet</h3>
              <p>Be the first participant to submit a solution and take #1 on the leaderboard!</p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Participant</th>
                  <th>Score</th>
                  <th>Last Solved</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`rank-badge ${idx < 3 ? `rank-${idx + 1}` : ""}`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <strong>{row.username}</strong> {row.username === user.username && "(You)"}
                    </td>
                    <td style={{ color: "#34d399", fontWeight: "700" }}>{row.totalScore} pts</td>
                    <td style={{ color: "#94a3b8", fontSize: "13px" }}>
                      {new Date(row.lastSubmissionTime).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default ContestArena;
