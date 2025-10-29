import React, { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Space, Progress, Statistic, Row, Col, Tag, Divider, Spin, Button } from 'antd';
import { BarChartOutlined, PieChartOutlined, LineChartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import studentTestService from '../services/studentTestService';

const { Title, Text } = Typography;

// Lightweight helpers to render simple charts without extra deps
function Histogram({ buckets, maxCount }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${buckets.length}, 1fr)`, gap: 8, alignItems: 'end', height: 160 }}>
      {buckets.map((b, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: '100%', background: 'var(--chem-blue-light)', borderRadius: 6, height: 140, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: `${maxCount ? Math.round((b.count / maxCount) * 100) : 0}%`,
              background: 'linear-gradient(180deg, var(--chem-blue), var(--chem-purple))',
              borderRadius: 6
            }} />
          </div>
          <Text style={{ fontSize: 12 }}>{b.label}</Text>
        </div>
      ))}
    </div>
  );
}

function SimpleLineChart({ points, width = 560, height = 200 }) {
  if (!points.length) return null;
  const maxY = Math.max(...points.map(p => p.y)) || 1;
  const maxX = Math.max(...points.map(p => p.x)) || 1;
  const path = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${((p.x / maxX) * (width - 32)) + 16} ${height - 24 - ((p.y / maxY) * (height - 48))}`).join(' ');
  return (
    <svg width={width} height={height} style={{ width: '100%' }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chem-purple)" />
          <stop offset="100%" stopColor="var(--chem-blue)" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth={3} />
      {points.map((p, idx) => (
        <circle key={idx} cx={((p.x / maxX) * (width - 32)) + 16} cy={height - 24 - ((p.y / maxY) * (height - 48))} r={4} fill="var(--chem-purple-dark)" />
      ))}
    </svg>
  );
}

function StudentTestAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (!id) {
      navigate('/student-test/analytics', { replace: true });
      return;
    }
    let mounted = true;
    studentTestService.getAnalyticsById(id).then(res => {
      if (!mounted) return;
      if (res.success) setItem(res.data);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [id]);

  // Always run hooks (useMemo...)
  // Provide defaults or safe values so hooks always run the same order
  const data = item ? item : {
    totalStudents: 1,
    viewed: 0,
    completed: 0,
    attempts: [],
    scores: [],
    title: ''
  };
  const isLesson = data.type === 'lesson';
  const completionRate = useMemo(() => {
    if (isLesson) return 0;
    return data.totalStudents ? Math.round((data.completed / data.totalStudents) * 100) : 0;
  }, [data, isLesson]);
  const viewRate = useMemo(() =>
    data.totalStudents ? Math.round((data.viewed / data.totalStudents) * 100) : 0,
    [data]
  );
  const avgScore = useMemo(() => {
    if (!data.scores.length) return 0;
    return Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10;
  }, [data.scores]);
  const passRate = useMemo(() => {
    if (!data.scores.length) return 0;
    const passes = data.scores.filter(s => s >= 5).length;
    return Math.round((passes / data.scores.length) * 100);
  }, [data.scores]);
  const buckets = useMemo(() => {
    const labels = ['0-<3', '3-<5', '5-<6.5', '6.5-<8', '8-10'];
    const ranges = [
      (s) => s < 3,
      (s) => s >= 3 && s < 5,
      (s) => s >= 5 && s < 6.5,
      (s) => s >= 6.5 && s < 8,
      (s) => s >= 8
    ];
    const counts = ranges.map(fn => data.scores.filter(fn).length);
    const maxCount = Math.max(...counts, 1);
    return {
      buckets: labels.map((label, i) => ({ label, count: counts[i] })),
      maxCount
    };
  }, [data.scores]);

  // Now we handle render logic
  if (loading) {
    return (
      <div className="chemistry-page">
        <div className="chemistry-molecules-bg"></div>
        <Card className="chemistry-card" style={{ textAlign: 'center' }}>
          <Spin />
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="chemistry-page">
        <div className="chemistry-molecules-bg"></div>
        <Card className="chemistry-card" style={{ textAlign: 'center' }}>
          <Title level={4}>Không tìm thấy dữ liệu</Title>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/student-test/analytics')}>Quay lại danh sách</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>

      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <Space direction="horizontal" size="large" align="center">
          <PieChartOutlined style={{ fontSize: 40 }} />
          <div>
            <Title level={2} className="chemistry-title" style={{ margin: 0 }}>{data.title}</Title>
            <Text className="chemistry-subtitle">Tỷ lệ tham gia, thống kê điểm số và lượt làm bài</Text>
          </div>
        </Space>
        <div style={{ marginTop: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/student-test/analytics')}>Quay lại danh sách</Button>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <Card className="chemistry-card">
            <Statistic title="Tổng số học sinh" value={data.totalStudents} />
            <Divider style={{ margin: '12px 0' }} />
            <Tag color="blue">Mẫu dữ liệu mô phỏng</Tag>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card className="chemistry-card">
            <Statistic title="Đã xem bài" value={`${viewRate}%`} />
            <Progress percent={viewRate} size="small" status="active" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        {!isLesson && (
          <>
            <Col xs={24} md={12} lg={6}>
              <Card className="chemistry-card">
                <Statistic title="Đã hoàn thành" value={`${completionRate}%`} />
                <Progress percent={completionRate} size="small" status="active" style={{ marginTop: 8 }} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card className="chemistry-card">
                <Statistic title="Điểm trung bình" value={avgScore} suffix="/ 10" />
                <Progress percent={Math.round((avgScore / 10) * 100)} size="small" style={{ marginTop: 8 }} />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {!isLesson && (
        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          <Col xs={24} lg={12}>
            <Card className="chemistry-card" title={<span><BarChartOutlined /> Phân bố điểm số</span>}>
              <Histogram buckets={buckets.buckets} maxCount={buckets.maxCount} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                {buckets.buckets.map((b, i) => (
                  <Text key={i} style={{ fontSize: 12 }}>{b.count}</Text>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card className="chemistry-card" title={<span><LineChartOutlined /> Lượt làm bài theo lần</span>}>
              <SimpleLineChart points={data.attempts} />
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: -8 }}>
                {data.attempts.map((p, i) => (
                  <Text key={i} type="secondary">Lần {p.x}: {p.y}</Text>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col xs={24} md={12}>
          <Card className="chemistry-card" title="Tỷ lệ đã xem vs chưa xem">
            <Space size="large">
              <div style={{ textAlign: 'center' }}>
                <Progress type="circle" percent={viewRate} width={120} strokeColor={{ '0%': '#7c4dff', '100%': '#00bcd4' }} />
                <div style={{ marginTop: 8 }}><Text strong>Đã xem</Text></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Progress type="circle" percent={100 - viewRate} width={120} />
                <div style={{ marginTop: 8 }}><Text strong>Chưa xem</Text></div>
              </div>
            </Space>
          </Card>
        </Col>
        {!isLesson && (
          <Col xs={24} md={12}>
            <Card className="chemistry-card" title="Tỷ lệ đạt yêu cầu (>=5)">
              <Space size="large">
                <div style={{ textAlign: 'center' }}>
                  <Progress type="circle" percent={passRate} width={120} strokeColor={{ '0%': '#00c853', '100%': '#64dd17' }} />
                  <div style={{ marginTop: 8 }}><Text strong>Đạt</Text></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Progress type="circle" percent={100 - passRate} width={120} />
                  <div style={{ marginTop: 8 }}><Text strong>Chưa đạt</Text></div>
                </div>
              </Space>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default StudentTestAnalytics;


