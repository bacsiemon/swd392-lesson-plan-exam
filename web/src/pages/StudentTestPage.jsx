import React, { useState } from 'react';
import './Home.css'; // Tái sử dụng style landing page

const mockTest = {
  title: 'Bài kiểm tra Hóa học - Chương 1',
  description: 'Kiểm tra kiến thức cơ bản về nguyên tử, bảng tuần hoàn và liên kết hóa học.',
  duration: 30, // phút
  questions: [
    {
      id: 1,
      type: 'multiple-choice',
      question: 'Nguyên tử là gì?',
      options: [
        'Hạt nhỏ nhất cấu tạo nên vật chất',
        'Một loại phân tử',
        'Một loại ion',
        'Một loại hợp chất'
      ]
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: 'Nguyên tố nào sau đây thuộc nhóm Halogen?',
      options: [
        'Oxy',
        'Natri',
        'Clo',
        'Magie'
      ]
    },
    {
      id: 3,
      type: 'multiple-choice',
      question: 'Liên kết hóa học là gì?',
      options: [
        'Sự hút giữa các nguyên tử tạo thành phân tử hoặc tinh thể',
        'Sự phân hủy của nguyên tử',
        'Sự chuyển động của electron',
        'Sự kết hợp giữa proton và neutron'
      ]
    }
  ]
};

function StudentTestPage() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleOptionChange = (qid, idx) => {
    setAnswers({ ...answers, [qid]: idx });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Gửi đáp án lên server hoặc xử lý kết quả
  };

  return (
    <div className="home-landing-container" style={{ minHeight: '100vh', background: '#f8fafd' }}>
      <section className="hero-landing-section" style={{padding: '32px 0 16px 0'}}>
        <div className="hero-landing-content" style={{gap: 32}}>
          <div className="hero-landing-left" style={{alignItems: 'flex-start'}}>
            <div className="ai-badge" style={{background: '#e6fcf5', color: '#16a085'}}>Làm bài kiểm tra</div>
            <h1 className="main-headline" style={{fontSize: '2.2rem', marginBottom: 10}}>{mockTest.title}</h1>
            <p className="main-desc" style={{marginBottom: 18}}>{mockTest.description}</p>
            <div style={{color: '#16a085', fontWeight: 600, marginBottom: 8}}>
              ⏰ Thời gian: {mockTest.duration} phút | {mockTest.questions.length} câu hỏi
            </div>
          </div>
        </div>
      </section>

      <section className="features-landing-section" style={{padding: '0 0 32px 0'}}>
        <form className="features-landing-container" style={{flexDirection: 'column', gap: 32, maxWidth: 700}} onSubmit={handleSubmit}>
          {mockTest.questions.map((q, idx) => (
            <div key={q.id} className="feature-landing-card" style={{alignItems: 'flex-start', width: '100%', maxWidth: '100%'}}>
              <div className="feature-landing-title" style={{marginBottom: 8, color: '#16a085'}}>
                Câu {idx + 1}:
              </div>
              <div className="feature-landing-desc" style={{marginBottom: 12, color: '#222', fontWeight: 600}}>
                {q.question}
              </div>
              <div style={{width: '100%'}}>
                {q.options.map((opt, oidx) => (
                  <label key={oidx} style={{display: 'block', marginBottom: 8, cursor: 'pointer', fontSize: '1rem', color: '#444'}}>
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={oidx}
                      checked={answers[q.id] === oidx}
                      onChange={() => handleOptionChange(q.id, oidx)}
                      style={{marginRight: 10, accentColor: '#16a085'}}
                      disabled={submitted}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {submitted && (
                <div style={{marginTop: 8, color: '#16a085', fontWeight: 500}}>
                  Đáp án đã lưu!
                </div>
              )}
            </div>
          ))}
          <button
            className="main-btn primary"
            type="submit"
            style={{margin: '0 auto', marginTop: 12, minWidth: 220, fontSize: '1.15rem'}}
            disabled={submitted}
          >
            {submitted ? 'Đã nộp bài' : 'Nộp bài kiểm tra'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default StudentTestPage;
