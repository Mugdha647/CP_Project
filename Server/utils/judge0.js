// ==========================================
// Judge0 CE Code Execution Integration
// Free community edition API: https://ce.judge0.com
// ==========================================

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";

// Supported Judge0 CE Language IDs:
// C++ (GCC 14.1.0): 105
// Python (3.12.5): 100
// Java (JDK 17.0.6): 91
// JavaScript (Node.js 20.17.0): 97
const LANGUAGE_MAP = {
  cpp: 105,
  python: 100,
  java: 91,
  javascript: 97
};

/**
 * Execute code with a single test case against Judge0 CE.
 */
async function executeTestCase(code, language, input = "", expectedOutput = "", timeoutMs = 12000) {
  const langId = LANGUAGE_MAP[language] || 105;

  const payload = {
    source_code: Buffer.from(code || "").toString("base64"),
    language_id: langId,
    stdin: Buffer.from(input || "").toString("base64"),
    expected_output: Buffer.from(expectedOutput || "").toString("base64"),
    cpu_time_limit: 2.5,
    memory_limit: 128000
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Judge0 API error (${response.status}): ${errText}`);
    }

    const data = await response.json();

    return {
      statusId: data.status ? data.status.id : 0,
      statusDescription: data.status ? data.status.description : "Unknown",
      stdout: data.stdout ? Buffer.from(data.stdout, "base64").toString("utf8") : "",
      stderr: data.stderr ? Buffer.from(data.stderr, "base64").toString("utf8") : "",
      compileOutput: data.compile_output ? Buffer.from(data.compile_output, "base64").toString("utf8") : "",
      time: data.time,
      memory: data.memory
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Judge execution request timed out");
    }
    throw err;
  }
}

/**
 * Evaluate code against all problem test cases.
 */
async function evaluateSubmissionWithJudge0(code, language, problem) {
  const cleanCode = (code || "").trim();
  if (cleanCode.length < 5) {
    return {
      verdict: "Wrong Answer",
      score: 0,
      testsPassed: 0,
      totalTests: 1,
      reason: "Submission is too short to be a valid solution."
    };
  }

  // Collect test cases
  let testCases = (problem.testCases || []).filter(
    (tc) => tc && (tc.input !== undefined || tc.expectedOutput !== undefined)
  );

  // Fallback to sample input/output if no testCases array defined
  if (testCases.length === 0 && (problem.sampleInput || problem.sampleOutput)) {
    testCases = [
      {
        input: problem.sampleInput || "",
        expectedOutput: problem.sampleOutput || "",
        isSample: true
      }
    ];
  }

  // If completely empty, run with empty input to at least verify compilation and syntax
  if (testCases.length === 0) {
    testCases = [{ input: "", expectedOutput: "", isSample: true }];
  }

  const totalTests = testCases.length;

  try {
    // Run test cases in parallel for speed
    const results = await Promise.all(
      testCases.map((tc) =>
        executeTestCase(cleanCode, language, tc.input || "", tc.expectedOutput || "")
      )
    );

    // 1. Check for Compilation Error (Status ID 6)
    const compileErr = results.find((r) => r.statusId === 6);
    if (compileErr) {
      const details = compileErr.compileOutput || compileErr.stderr || "Compilation failed.";
      return {
        verdict: "Compilation Error",
        score: 0,
        testsPassed: 0,
        totalTests,
        reason: "Compilation Error: Code failed to compile.",
        errorDetails: details
      };
    }

    // 2. Find first failing test case
    let testsPassed = 0;
    let firstFail = null;
    let firstFailIdx = -1;

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.statusId === 3) {
        // Status ID 3: Accepted
        testsPassed++;
      } else if (!firstFail) {
        firstFail = r;
        firstFailIdx = i + 1;
      }
    }

    const maxPoints = problem.points || 100;
    const partialScore = Math.floor((testsPassed / totalTests) * maxPoints);

    // If all tests passed
    if (testsPassed === totalTests) {
      return {
        verdict: "Accepted",
        score: maxPoints,
        testsPassed,
        totalTests,
        reason: `All ${totalTests} test case${totalTests > 1 ? "s" : ""} passed successfully!`
      };
    }

    // Handled failure types
    if (firstFail) {
      if (firstFail.statusId === 5) {
        // Time Limit Exceeded
        return {
          verdict: "Time Limit Exceeded",
          score: partialScore,
          testsPassed,
          totalTests,
          reason: `Time Limit Exceeded (> 2.0s) on test case ${firstFailIdx}/${totalTests}.`,
          errorDetails: `Execution time exceeded limit on test ${firstFailIdx}.`
        };
      }

      if (firstFail.statusId >= 7 && firstFail.statusId <= 12) {
        // Runtime Error (SIGSEGV, NZEC, etc.)
        return {
          verdict: "Runtime Error",
          score: partialScore,
          testsPassed,
          totalTests,
          reason: `Runtime Error (${firstFail.statusDescription}) on test case ${firstFailIdx}/${totalTests}.`,
          errorDetails: firstFail.stderr || firstFail.statusDescription
        };
      }

      // Wrong Answer (Status ID 4 or others)
      return {
        verdict: "Wrong Answer",
        score: partialScore,
        testsPassed,
        totalTests,
        reason: testsPassed > 0
          ? `Partial: Passed ${testsPassed}/${totalTests} test cases. Wrong Answer on test case ${firstFailIdx}.`
          : `Wrong Answer on test case ${firstFailIdx}/${totalTests}: Output did not match expected.`,
        errorDetails: testCases[firstFailIdx - 1]?.isSample
          ? `Sample test failed.\nYour output: ${firstFail.stdout.trim() || "(empty)"}\nExpected: ${testCases[firstFailIdx - 1].expectedOutput.trim()}`
          : "Hidden test case output mismatch."
      };
    }

    return {
      verdict: "Wrong Answer",
      score: partialScore,
      testsPassed,
      totalTests,
      reason: `Failed test evaluation.`
    };
  } catch (err) {
    console.error("Judge0 API execution error:", err.message);
    return {
      verdict: "Wrong Answer",
      score: 0,
      testsPassed: 0,
      totalTests,
      reason: `Judge execution error: ${err.message}. Please retry in a moment.`
    };
  }
}

module.exports = {
  executeTestCase,
  evaluateSubmissionWithJudge0,
  LANGUAGE_MAP
};
