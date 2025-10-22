// web/src/pages/Home.jsx


import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-landing-container">
      {/* Hero Section */}
      <section className="hero-landing-section">
        <div className="hero-landing-content">
          <div className="hero-landing-left">
            <div className="ai-badge">AI-Powered Chemistry Education</div>
            <h1 className="main-headline">
              Create Lessons &amp; Quizzes <span className="highlight">Intelligently</span>
            </h1>
            <p className="main-desc">
              ChemMaster helps Chemistry teachers generate engaging lessons and custom quizzes with AI. Save time, focus on teaching excellence.
            </p>
            <div className="hero-btn-group">
              <button className="main-btn primary">Start Creating Free</button>
              <button className="main-btn secondary">Watch Demo</button>
            </div>
          </div>
          <div className="hero-landing-right">
            <img
              src="https://chem-quest-maker.lovable.app/assets/hero-chemistry-CZtc_ENI.jpg"
              alt="Chemistry Illustration"
              className="hero-chem-img"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-landing-section">
        <div className="features-landing-container">
          <div className="feature-landing-card">
            <div className="feature-landing-icon" style={{background: 'linear-gradient(135deg,#1abc9c,#16a085)'}}>
              <span role="img" aria-label="AI">🧠</span>
            </div>
            <div className="feature-landing-title">AI Lesson Generator</div>
            <div className="feature-landing-desc">
              Enter any Chemistry topic and get a complete, structured lesson with objectives, theory, examples, and practice questions in seconds.
            </div>
            <ul className="feature-landing-list">
              <li>Full lesson structure</li>
              <li>Learning objectives</li>
              <li>Export to Word/PDF</li>
            </ul>
          </div>
          <div className="feature-landing-card">
            <div className="feature-landing-icon" style={{background: 'linear-gradient(135deg,#00b894,#00cec9)'}}>
              <span role="img" aria-label="Quiz">📝</span>
            </div>
            <div className="feature-landing-title">Smart Quiz Creator</div>
            <div className="feature-landing-desc">
              Generate custom quizzes tailored to grade level and difficulty. Multiple choice, true/false, and short answer questions with solutions.
            </div>
            <ul className="feature-landing-list">
              <li>Grade 8-12 support</li>
              <li>Adjustable difficulty</li>
              <li>Instant answers</li>
            </ul>
          </div>
          <div className="feature-landing-card">
            <div className="feature-landing-icon" style={{background: 'linear-gradient(135deg,#6c5ce7,#a29bfe)'}}>
              <span role="img" aria-label="Dashboard">🎓</span>
            </div>
            <div className="feature-landing-title">Personal Dashboard</div>
            <div className="feature-landing-desc">
              Organize all your lessons and quizzes in one place. Access, edit, and share your content anytime.
            </div>
            <ul className="feature-landing-list">
              <li>Save unlimited content</li>
              <li>Quick search</li>
              <li>Easy sharing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-landing-section">
        <div className="cta-landing-container">
          <h2 className="cta-headline">Ready to Transform Your Chemistry Teaching?</h2>
          <p className="cta-desc">Join Chemistry teachers who are saving hours every week with ChemMaster</p>
          <button className="main-btn primary cta-btn">Create Your Free Account</button>
        </div>
      </section>
    </div>
  );
}

export default Home;