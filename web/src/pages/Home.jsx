// web/src/pages/Home.jsx

import React from 'react';
import './Home.css';

function Home() {
  const handleCreateLesson = () => {
    // Navigate to AI lesson creation page
    console.log('Navigate to AI lesson creation');
  };

  const handleCreateQuiz = () => {
    // Navigate to quiz creation page
    console.log('Navigate to quiz creation');
  };

  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="chemistry-icon">
            <span className="atom-icon">⚛️</span>
          </div>
          <h1 className="hero-title">ChemLearn Pro</h1>
          <p className="hero-subtitle">
            Hệ thống tạo bài giảng và quiz hóa học thông minh
          </p>
          <div className="hero-description">
            <p>Tạo nội dung giáo dục hóa học chất lượng cao với công nghệ AI</p>
          </div>
        </div>
      </header>

      {/* Main Features Section */}
      <main className="features-section">
        <div className="features-container">
          <h2 className="section-title">Chọn chức năng</h2>
          
          <div className="feature-cards">
            {/* AI Lesson Creation Card */}
            <div className="feature-card ai-card">
              <div className="card-icon">
                <span className="icon">🧠</span>
              </div>
              <h3 className="card-title">Tạo Bài Giảng AI</h3>
              <p className="card-description">
                Sử dụng OpenAI để tạo bài giảng hóa học tự động với nội dung chất lượng cao
              </p>
              <ul className="card-features">
                <li>✨ Tự động tạo nội dung</li>
                <li>🔬 Tích hợp công thức hóa học</li>
                <li>📊 Biểu đồ và minh họa</li>
                <li>⚡ Nhanh chóng và chính xác</li>
              </ul>
              <button className="feature-button ai-button" onClick={handleCreateLesson}>
                <span className="button-icon">🚀</span>
                Tạo Bài Giảng
              </button>
            </div>

            {/* Quiz Creation Card */}
            <div className="feature-card quiz-card">
              <div className="card-icon">
                <span className="icon">📝</span>
              </div>
              <h3 className="card-title">Tạo Quiz Hóa Học</h3>
              <p className="card-description">
                Tạo và quản lý bộ câu hỏi từ question bank với nhiều dạng bài tập khác nhau
              </p>
              <ul className="card-features">
                <li>📚 Question Bank đa dạng</li>
                <li>🎯 Nhiều loại câu hỏi</li>
                <li>⚖️ Phân loại độ khó</li>
                <li>📈 Theo dõi kết quả</li>
              </ul>
              <button className="feature-button quiz-button" onClick={handleCreateQuiz}>
                <span className="button-icon">📋</span>
                Tạo Quiz
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Chemistry Elements Decoration */}
      <div className="chemistry-decoration">
        <div className="molecule molecule-1">
          <span>H₂O</span>
        </div>
        <div className="molecule molecule-2">
          <span>CO₂</span>
        </div>
        <div className="molecule molecule-3">
          <span>NaCl</span>
        </div>
        <div className="molecule molecule-4">
          <span>C₆H₁₂O₆</span>
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Bài giảng</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Câu hỏi</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Chủ đề</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;