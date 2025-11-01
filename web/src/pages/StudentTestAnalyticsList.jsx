import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Tag, Space, Progress, Button } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import studentTestService from '../services/studentTestService';

const { Title, Text } = Typography;

function StudentTestAnalyticsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    studentTestService.getAnalyticsList().then(res => {
      if (!mounted) return;
      if (res.success) setItems(res.data);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>

      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <Space align="center" size="large">
          <BarChartOutlined style={{ fontSize: 40 }} />
          <div>
            <Title level={2} className="chemistry-title" style={{ margin: 0 }}>Thống kê theo bài học / bài kiểm tra</Title>
            <Text className="chemistry-subtitle">Chọn 1 mục để xem phân tích chi tiết</Text>
          </div>
        </Space>
      </Card>

      <Card className="chemistry-card">
        <List
          loading={loading}
          dataSource={items}
          renderItem={(it) => {
            const viewRate = Math.round((it.viewed / it.totalStudents) * 100);
            const completionRate = Math.round((it.completed / it.totalStudents) * 100);
            return (
              <List.Item
                actions={[
                  <Link key="detail" to={`/student-test/analytics/${it.id}`}><Button type="primary">Xem chi tiết</Button></Link>
                ]}
              >
                <List.Item.Meta
                  title={<Space size="small">{it.title} <Tag>{it.type}</Tag></Space>}
                  description={
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      <div>
                        <Text strong>Tổng HS:</Text>
                        <div>{it.totalStudents}</div>
                      </div>
                      <div>
                        <Text strong>Đã xem:</Text>
                        <Progress percent={viewRate} size="small" />
                      </div>
                      <div>
                        <Text strong>Hoàn thành:</Text>
                        <Progress percent={completionRate} size="small" />
                      </div>
                      <div>
                        <Text strong>Điểm TB:</Text>
                        <div>{it.avgScore}/10</div>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
}

export default StudentTestAnalyticsList;


