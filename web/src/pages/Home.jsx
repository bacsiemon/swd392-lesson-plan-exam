// web/src/pages/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperimentOutlined, BulbOutlined, RocketOutlined } from '@ant-design/icons';
import '../styles/chemistryTheme.css';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-landing-container chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      {/* Hero Section */}
      <section className="hero-landing-section chemistry-hero">
        <div className="hero-landing-content">
          <div className="hero-landing-left">
            <div className="ai-badge chemistry-badge">
              <ExperimentOutlined style={{ marginRight: 8 }} />
              Giáo dục Hóa học được hỗ trợ bởi AI
            </div>
            <h1 className="main-headline">
              Tạo Giáo án &amp; Bài Kiểm tra <span className="highlight">Thông minh</span>
            </h1>
            <p className="main-desc">
              ChemMaster giúp giáo viên Hóa học tạo ra các bài giảng hấp dẫn và bài kiểm tra tùy chỉnh với AI. Tiết kiệm thời gian, tập trung vào sự xuất sắc trong giảng dạy.
            </p>
            <div className="hero-btn-group">
              <button className="main-btn primary chemistry-btn-hero" onClick={() => navigate('/register')}>
                <RocketOutlined style={{ marginRight: 8 }} />
                Bắt đầu Tạo Miễn phí
              </button>
              <button className="main-btn secondary chemistry-btn-secondary-hero">Xem Demo</button>
            </div>
          </div>
          <div className="hero-landing-right">
            <img
              src="https://chem-quest-maker.lovable.app/assets/hero-chemistry-CZtc_ENI.jpg"
              alt="Minh họa Hóa học"
              className="hero-chem-img"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-landing-section">
        <div className="features-landing-container">
          <div className="feature-landing-card chemistry-feature-card">
            <div className="feature-landing-icon chemistry-icon" style={{background: 'linear-gradient(135deg, var(--chem-purple), var(--chem-blue))'}}>
              <span role="img" aria-label="AI">🧠</span>
            </div>
            <div className="feature-landing-title">Trình tạo Giáo án AI</div>
            <div className="feature-landing-desc">
              Nhập bất kỳ chủ đề Hóa học nào và nhận một bài học hoàn chỉnh, có cấu trúc với mục tiêu, lý thuyết, ví dụ và câu hỏi thực hành chỉ trong vài giây.
            </div>
            <ul className="feature-landing-list">
              <li>Cấu trúc bài học đầy đủ</li>
              <li>Mục tiêu học tập</li>
              <li>Xuất ra Word/PDF</li>
            </ul>
          </div>
          <div className="feature-landing-card chemistry-feature-card">
            <div className="feature-landing-icon chemistry-icon" style={{background: 'linear-gradient(135deg, var(--chem-blue), var(--chem-purple-dark))'}}>
              <span role="img" aria-label="Quiz">📝</span>
            </div>
            <div className="feature-landing-title">Trình tạo Bài kiểm tra Thông minh</div>
            <div className="feature-landing-desc">
              Tạo bài kiểm tra tùy chỉnh phù hợp với cấp độ và độ khó. Câu hỏi trắc nghiệm, đúng/sai và câu trả lời ngắn có đáp án.
            </div>
            <ul className="feature-landing-list">
              <li>Hỗ trợ lớp 8-12</li>
              <li>Điều chỉnh độ khó</li>
              <li>Đáp án ngay lập tức</li>
            </ul>
          </div>
          <div className="feature-landing-card chemistry-feature-card">
            <div className="feature-landing-icon chemistry-icon" style={{background: 'linear-gradient(135deg, var(--chem-purple-dark), var(--chem-blue-dark))'}}>
              <span role="img" aria-label="Dashboard">🎓</span>
            </div>
            <div className="feature-landing-title">Bảng điều khiển Cá nhân</div>
            <div className="feature-landing-desc">
              Tổ chức tất cả các bài học và bài kiểm tra của bạn ở một nơi. Truy cập, chỉnh sửa và chia sẻ nội dung của bạn bất cứ lúc nào.
            </div>
            <ul className="feature-landing-list">
              <li>Lưu nội dung không giới hạn</li>
              <li>Tìm kiếm nhanh</li>
              <li>Chia sẻ dễ dàng</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-landing-section chemistry-cta">
        <div className="cta-landing-container">
          <h2 className="cta-headline">Sẵn sàng Cải thiện Phương pháp Giảng dạy Hóa học?</h2>
          <p className="cta-desc">Tham gia cùng các giáo viên Hóa học đang tiết kiệm hàng giờ mỗi tuần với ChemMaster</p>
          <button className="main-btn primary cta-btn chemistry-btn-cta" onClick={() => navigate('/register')}>
            <BulbOutlined style={{ marginRight: 8 }} />
            Tạo Tài khoản Miễn phí
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;