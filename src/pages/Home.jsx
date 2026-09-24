import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      <section className="mugdha">
        
        <div className="mugdha-content">

          <p className="mugdha-small-title">
            YOUR COMPETITIVE PROGRAMMING JOURNEY
          </p>

          <h1>
            Master Competitive
            <span> Programming</span>
          </h1>

          <p className="m-description">
            Learn algorithms, practice problems, participate in contests,
            and improve your problem-solving skills with CP Master.
          </p>

          <div className="m-buttons">

            <Link to="/roadmap" className="primary-button">
              Start Learning
            </Link>

            <Link to="/contest" className="secondary-button">
              Explore Contests
            </Link>

          </div>

        </div>

        <div className="m-code">

          <div className="code-box">

            <p>
              <span>int</span> solve() {"{"}
            </p>

            <p className="code-indent">
              <span>while</span> (problem) {"{"}
            </p>

            <p className="code-indent-2">
              learn();
            </p>

            <p className="code-indent-2">
              practice();
            </p>

            <p className="code-indent-2">
              improve();
            </p>

            <p className="code-indent">
              {"}"}
            </p>

            <p>
              <span>return</span> success;
            </p>

            <p>
              {"}"}
            </p>

          </div>

        </div>

      </section>


      { /* Features */ }
      <section className="features-section">

        <div className="section-title">

          <p>WHAT WE OFFER</p>

          <h2>
            Everything you need to improve
          </h2>

        </div>


        <div className="features">

          <div className="feature-card">

            <div className="feature-icon">
              📚
            </div>

            <h3>Learning Roadmap</h3>

            <p>
              Follow a structured roadmap and learn competitive
              programming topics step by step.
            </p>

            <Link to="/roadmap">
              Explore Roadmap →
            </Link>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🏆
            </div>

            <h3>Programming Contests</h3>

            <p>
              Find contests, challenge yourself, and improve your
              competitive programming skills.
            </p>

            <Link to="/contest">
              View Contests →
            </Link>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              💻
            </div>

            <h3>Problem Solving</h3>

            <p>
              Practice different types of problems and develop
              strong algorithmic thinking.
            </p>

            <Link to="/roadmap">
              Start Practicing →
            </Link>

          </div>

        </div>

      </section>


      {/* Journey Section */}
      <section className="journey-section">

        <div className="journey-content">

          <p className="section-label">
            YOUR JOURNEY
          </p>

          <h2>
            Learn. Practice. Compete. Improve.
          </h2>

          <p>
            CP Master helps you stay consistent with your
            competitive programming journey. Follow the roadmap,
            solve problems, participate in contests, and track
            your progress.
          </p>

          <Link to="/signup" className="primary-button">
            Join CP-Master
          </Link>

        </div>

      </section>

    </div>
  );
}

export default Home;