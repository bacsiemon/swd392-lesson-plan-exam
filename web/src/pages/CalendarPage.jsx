import React, { useState } from 'react';
import { Calendar, Badge, Card, Typography, Row, Col, Tag, Modal, Button, Space, Divider } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Add CSS for liquid glass animations
const liquidGlassStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes floatReverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(20px) rotate(-180deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = liquidGlassStyles;
  document.head.appendChild(styleSheet);
}

const CalendarPage = ({ userRole = 'teacher' }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);

  // Mock data for events (can be replaced with API data)
  const events = {
    teacher: [
      { date: '2025-10-24', type: 'lesson', title: 'Bài học: Phản ứng Oxi hóa', time: '08:00', class: 'Lớp 10A1' },
      { date: '2025-10-24', type: 'exam', title: 'Kiểm tra: Hóa học vô cơ', time: '14:00', class: 'Lớp 11B2' },
      { date: '2025-10-25', type: 'lesson', title: 'Bài học: Liên kết hóa học', time: '10:00', class: 'Lớp 10A2' },
      { date: '2025-10-26', type: 'meeting', title: 'Họp giáo viên', time: '15:00', class: 'Phòng họp' },
      { date: '2025-10-27', type: 'exam', title: 'Kiểm tra giữa kỳ', time: '08:00', class: 'Lớp 10A1, 10A2' },
    ],
    student: [
      { date: '2025-10-24', type: 'lesson', title: 'Bài học: Phản ứng Oxi hóa', time: '08:00', teacher: 'GV. Nguyễn Văn A' },
      { date: '2025-10-24', type: 'exam', title: 'Kiểm tra: Hóa học vô cơ', time: '14:00', teacher: 'GV. Trần Thị B' },
      { date: '2025-10-25', type: 'lesson', title: 'Bài học: Liên kết hóa học', time: '10:00', teacher: 'GV. Nguyễn Văn A' },
      { date: '2025-10-27', type: 'exam', title: 'Kiểm tra giữa kỳ', time: '08:00', teacher: 'GV. Nguyễn Văn A' },
      { date: '2025-10-28', type: 'lesson', title: 'Bài học: Dung dịch', time: '09:00', teacher: 'GV. Lê Văn C' },
    ],
  };

  const currentEvents = events[userRole] || events.teacher;

  // Get events for a specific date
  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    return currentEvents.filter((event) => event.date === dateStr);
  };

  // Render date cell with badges
  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index} style={{ marginBottom: 4 }}>
            <Badge
              status={
                item.type === 'exam'
                  ? 'error'
                  : item.type === 'lesson'
                  ? 'success'
                  : 'processing'
              }
              text={
                <Text
                  style={{
                    fontSize: '12px',
                    color: 'rgba(0, 0, 0, 0.85)',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.title}
                </Text>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  // Handle date select
  const onSelect = (value) => {
    setSelectedDate(value);
    const listData = getListData(value);
    if (listData.length > 0) {
      setSelectedEvents(listData);
      setIsModalVisible(true);
    }
  };

  // Get event type color
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'lesson':
        return '#52c41a';
      case 'exam':
        return '#f5222d';
      case 'meeting':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  // Get event type icon
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'lesson':
        return <BookOutlined />;
      case 'exam':
        return <FileTextOutlined />;
      case 'meeting':
        return <TeamOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '-30%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          animation: 'floatReverse 15s ease-in-out infinite',
          zIndex: 0,
        }}
      />

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '40px 20px',
          minHeight: '100vh',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <Title
            level={2}
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: 8,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CalendarOutlined style={{ marginRight: 12 }} />
            {userRole === 'teacher' ? 'Lịch làm việc' : 'Lịch học'}
          </Title>
          <Text style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Quản lý và theo dõi lịch trình của bạn
          </Text>
        </div>

        {/* Legend */}
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Space size="large" wrap>
            <Space>
              <Badge status="success" />
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Bài học</Text>
            </Space>
            <Space>
              <Badge status="error" />
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Kiểm tra</Text>
            </Space>
            {userRole === 'teacher' && (
              <Space>
                <Badge status="processing" />
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Họp/Sự kiện</Text>
              </Space>
            )}
          </Space>
        </Card>

        {/* Calendar */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Calendar
                value={selectedDate}
                onSelect={onSelect}
                dateCellRender={dateCellRender}
                style={{
                  borderRadius: 12,
                }}
              />
            </Card>
          </Col>

          {/* Event List for Selected Date */}
          <Col xs={24} lg={8}>
            <Card
              style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                minHeight: '500px',
              }}
            >
              <Title
                level={4}
                style={{ color: 'rgba(255, 255, 255, 0.95)', marginBottom: 16 }}
              >
                {selectedDate.format('DD/MM/YYYY')}
              </Title>
              {getListData(selectedDate).length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  {getListData(selectedDate).map((event, index) => (
                    <Card
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderLeft: `4px solid ${getEventTypeColor(event.type)}`,
                        borderRadius: 8,
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space>
                          {getEventTypeIcon(event.type)}
                          <Text strong style={{ fontSize: '14px' }}>
                            {event.title}
                          </Text>
                        </Space>
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">{event.time}</Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {userRole === 'teacher' ? event.class : event.teacher}
                        </Text>
                      </Space>
                    </Card>
                  ))}
                </Space>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Không có sự kiện nào trong ngày này
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Event Details Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            {selectedDate.format('DD/MM/YYYY')}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {selectedEvents.map((event, index) => (
            <div key={index}>
              {index > 0 && <Divider />}
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  {getEventTypeIcon(event.type)}
                  <Text strong style={{ fontSize: '16px' }}>
                    {event.title}
                  </Text>
                  <Tag color={getEventTypeColor(event.type)}>
                    {event.type === 'lesson'
                      ? 'Bài học'
                      : event.type === 'exam'
                      ? 'Kiểm tra'
                      : 'Họp'}
                  </Tag>
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text>Thời gian: {event.time}</Text>
                </Space>
                <Text type="secondary">
                  {userRole === 'teacher'
                    ? `Lớp: ${event.class}`
                    : `Giáo viên: ${event.teacher}`}
                </Text>
              </Space>
            </div>
          ))}
        </Space>
      </Modal>
    </div>
  );
};

export default CalendarPage;
