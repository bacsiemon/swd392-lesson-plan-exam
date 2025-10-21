import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, List, Divider, Progress, Space, Switch, notification } from 'antd';
import './LessonPlanDetails.css';

const { Title, Paragraph, Text } = Typography;

// Mock lesson plans (in real app fetch from API)
const MOCK_LESSONS = {
  "1": {
    id: '1',
    title: 'Axit và Bazơ - Bài học cơ bản',
    objectives: ['Hiểu định nghĩa axit/bazơ', 'Biết pH và thang đo'],
    slides: [
      { title: 'Axit và Bazơ là gì?', notes: ['Thuyết Brønsted-Lowry', 'Ví dụ: HCl, NH3'] },
      { title: 'Thang đo pH', notes: ['pH < 7 axit', 'pH = 7 trung tính'] },
    ],
    author: 'Giáo viên A',
    duration: '35 phút'
  },
  "2": {
    id: '2',
    title: 'Phản ứng Oxi hóa - Khử',
    objectives: ['Nhận diện chất oxi hóa/khử', 'Cân bằng phản ứng'],
    slides: [
      { title: 'Định nghĩa', notes: ['Chất oxi hóa nhận electron'] },
      { title: 'Ví dụ', notes: ['KMnO4 + HCl'] }
    ],
    author: 'Giáo viên B',
    duration: '45 phút'
  }
};

const LessonPlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lesson = MOCK_LESSONS[id] || null;

  // study state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const videoTimerRef = useRef(null);

  const storageKey = `lesson_progress_${id}`;

  useEffect(() => {
    // load progress
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const state = JSON.parse(raw);
        setCurrentIndex(state.currentIndex || 0);
        setCompleted(!!state.completed);
        setVideoWatched(!!state.videoWatched);
      }
    } catch (e) {
      console.warn('Failed loading progress', e);
    }
    return () => {
      clearInterval(videoTimerRef.current);
    };
  }, [storageKey]);

  useEffect(() => {
    // persist progress
    const state = { currentIndex, completed, videoWatched };
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch(e) {}
  }, [currentIndex, completed, videoWatched, storageKey]);

  if (!lesson) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={4}>Bài học không tìm thấy</Title>
          <Paragraph>Không tìm thấy bài học với id: {id}</Paragraph>
          <Link to="/">Quay về trang chủ</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="lesson-details" style={{ padding: 24 }}>
      <Card className="lesson-card">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title style={{ margin: 0 }}>{lesson.title}</Title>
              <Text type="secondary">Tác giả: {lesson.author} • Thời lượng: {lesson.duration}</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text>Tiến độ chương: </Text>
              <Progress percent={Math.round(((currentIndex+1)/lesson.slides.length)*100)} size="small" style={{ width: 160 }} />
              <div style={{ marginTop: 8 }}>
                <Text>{completed ? 'Hoàn thành' : 'Chưa hoàn thành'}</Text>
              </div>
            </div>
          </div>

          <Divider />

          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ width: '40%' }}>
              <Title level={4}>Mục tiêu</Title>
              <List dataSource={lesson.objectives} renderItem={o => (<List.Item>{o}</List.Item>)} />

              <Divider />

              <Title level={4}>Slides</Title>
              <List
                dataSource={lesson.slides}
                renderItem={(s, idx) => (
                  <List.Item style={{ cursor: 'pointer', background: idx === currentIndex ? '#e6f7ff' : 'transparent' }} onClick={() => setCurrentIndex(idx)}>
                    <Text strong>{idx+1}. {s.title}</Text>
                  </List.Item>
                )}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Title level={4}>{lesson.slides[currentIndex].title}</Title>
              <Paragraph>
                {lesson.slides[currentIndex].notes.map((n,i) => (<div key={i}>- {n}</div>))}
              </Paragraph>

              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <Button onClick={() => setCurrentIndex(i => Math.max(0, i-1))} disabled={currentIndex===0}>Trước</Button>
                <Button onClick={() => setCurrentIndex(i => Math.min(lesson.slides.length-1, i+1))} disabled={currentIndex===lesson.slides.length-1}>Tiếp</Button>
                <Button onClick={() => { setCompleted(true); notification.success({ message: 'Đã hoàn thành bài học' }); }}>Đánh dấu hoàn thành</Button>
              </div>

              <Divider />

              <div>
                <Title level={5}>Video hướng dẫn (nếu có)</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Switch checked={videoPlaying} onChange={(v) => {
                    setVideoPlaying(v);
                    if (v) {
                      // simulate watching and mark watched after 5s
                      videoTimerRef.current = setTimeout(() => { setVideoWatched(true); setVideoPlaying(false); notification.info({ message: 'Video được đánh dấu là đã xem' }); }, 5000);
                    } else {
                      clearTimeout(videoTimerRef.current);
                    }
                  }} />
                  <Text>{videoWatched ? 'Đã xem video' : (videoPlaying ? 'Đang xem...' : 'Bắt đầu xem video')}</Text>
                </div>
              </div>

            </div>
          </div>

          <Divider />

          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="primary" onClick={() => { setCompleted(true); navigate('/lesson-plans'); }}>Hoàn tất và về danh sách</Button>
            <Button onClick={() => { setCompleted(true); }}>Đánh dấu đã đọc</Button>
            <Link to="/lesson-plans">Quay lại danh sách</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LessonPlanDetails;
