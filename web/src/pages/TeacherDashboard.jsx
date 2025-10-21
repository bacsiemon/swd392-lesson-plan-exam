import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Card, Row, Col, Typography, Button, Space } from 'antd';
import {
  FileTextOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  TableOutlined,
  AreaChartOutlined,
} from '@ant-design/icons';

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

const { Title, Text } = Typography;
const BRAND_COLORS = {
  SLIDE: '#1890ff',
  LESSON: '#52c41a',
  QUESTION: '#faad14',
  TEST: '#eb2f96',
  ANALYTICS: '#f5222d',
};

const aiTools = [
  
  {
    title: 'Xây dựng Giáo án Bài giảng (AI)',
    description: 'Thiết kế giáo án chi tiết và cấu trúc cho bất kỳ chủ đề Hóa học nào.',
    icon: <FileTextOutlined style={{ fontSize: '36px', color: BRAND_COLORS.LESSON }} />,
    link: '/create-lesson-plan',
    color: BRAND_COLORS.LESSON,
  },
  {
    title: 'Ngân hàng Câu hỏi & Ôn tập (AI)',
    description: 'Tự động tạo câu hỏi trắc nghiệm và tự luận chất lượng cao.',
    icon: <QuestionCircleOutlined style={{ fontSize: '36px', color: BRAND_COLORS.QUESTION }} />,
    link: '/question-banks',
    color: BRAND_COLORS.QUESTION,
  },
];

const managementTools = [
    {
        title: 'Quản lý Đề kiểm tra',
        description: 'Tạo, phân phối và chấm điểm các bài kiểm tra từ ngân hàng câu hỏi.',
        icon: <TableOutlined style={{ fontSize: '36px', color: BRAND_COLORS.TEST }} />,
        link: '/manage-tests', 
        color: BRAND_COLORS.TEST,
    },
    {
        title: 'Phân tích Kết quả Học tập',
        description: 'Theo dõi tiến độ, điểm số và các lĩnh vực cần cải thiện của học sinh.',
        icon: <AreaChartOutlined style={{ fontSize: '36px', color: BRAND_COLORS.ANALYTICS }} />,
        link: '/manage-tests',
        color: BRAND_COLORS.ANALYTICS,
    },
];


const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [currentTime] = useState(new Date().toLocaleDateString('vi-VN'));
  
  const handleToolClick = (link) => {
    navigate(link); 
  };

  const ToolCard = ({ title, description, icon, link, color }) => (
    <Col xs={24} sm={12} lg={8} style={{ marginBottom: 24 }}>
      <Card
        hoverable
        onClick={() => handleToolClick(link)}
        style={{
          height: '100%',
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          borderLeft: `4px solid ${color}`,
          transition: 'all 0.3s ease',
          transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Title level={4} style={{ margin: 0, marginLeft: 16, color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              {title}
            </Title>
          </div>
          <p style={{ minHeight: 40, color: 'rgba(255, 255, 255, 0.8)' }}>{description}</p>
          <Button
            type="primary"
            size="large"
            style={{ 
              backgroundColor: color, 
              borderColor: color,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            Bắt đầu Ngay
          </Button>
        </Space>
      </Card>
    </Col>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements for liquid glass effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-30%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        animation: 'floatReverse 15s ease-in-out infinite',
        zIndex: 0
      }} />
      
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.15)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '40px 20px', 
        minHeight: '100vh', 
        borderRadius: 0, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: 'rgba(255, 255, 255, 0.95)', marginBottom: 8, textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            Chào mừng, Giáo viên! 👋
          </Title>
          <Text style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Hôm nay là {currentTime} - Chọn một công cụ dưới đây để bắt đầu tạo tài nguyên dạy học và quản lý lớp học Hóa học.
          </Text>
        </div>

        {/* AI Tools Section */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3} style={{ 
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
            paddingBottom: 10, 
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            ✨ Công cụ Sáng tạo Nội dung AI
          </Title>
          <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
            {aiTools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </Row>
        </div>

        {/* Management Tools Section */}
        <div style={{ marginTop: 40 }}>
          <Title level={3} style={{ 
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
            paddingBottom: 10, 
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            📊 Quản lý & Đánh giá
          </Title>
          <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
            {managementTools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;