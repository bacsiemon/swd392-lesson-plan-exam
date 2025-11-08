import React from 'react';
import { List, Avatar, Tag, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const UpcomingExamsList = ({ exams }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'exam': return <QuestionCircleOutlined style={{ color: '#f5222d' }} />;
      case 'homework': return <FileTextOutlined style={{ color: '#faad14' }} />;
      default: return <CalendarOutlined />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'red';
      case 'homework': return 'orange';
      default: return 'blue';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'exam': return 'Kiểm tra';
      case 'homework': return 'Bài tập';
      default: return 'Khác';
    }
  };

  return (
    <List
      dataSource={exams}
      renderItem={(exam) => (
        <List.Item
          style={{
            background: '#fafafa',
            borderRadius: 12,
            marginBottom: 12,
            padding: '16px',
            border: '1px solid #e8e8e8',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f0f0';
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fafafa';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <List.Item.Meta
            avatar={
              <Avatar
                style={{
                  backgroundColor: exam.type === 'exam' ? '#f5222d' : '#faad14',
                  border: '2px solid #e8e8e8',
                }}
                icon={getTypeIcon(exam.type)}
              />
            }
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#262626', fontWeight: 500 }}>
                  {exam.title}
                </Text>
                <Tag color={getTypeColor(exam.type)} style={{ fontSize: '11px' }}>
                  {getTypeText(exam.type)}
                </Tag>
              </div>
            }
            description={
              <div>
                <div style={{ marginBottom: 4 }}>
                  <Text style={{ color: '#595959', fontSize: '14px' }}>
                    {exam.subject}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarOutlined style={{ color: '#8c8c8c', marginRight: 4 }} />
                    <Text style={{ color: '#595959', fontSize: '12px' }}>
                      {new Date(exam.date).toLocaleDateString('vi-VN')}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ClockCircleOutlined style={{ color: '#8c8c8c', marginRight: 4 }} />
                    <Text style={{ color: '#595959', fontSize: '12px' }}>
                      {exam.time} ({exam.duration} phút)
                    </Text>
                  </div>
                </div>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default UpcomingExamsList;
