import React from 'react';
 import './CreateSlidePage.css';
import { useNavigate } from 'react-router-dom'; 
import { Card, Row, Col, Typography, Button, Space } from 'antd';
import {
  FileTextOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  TableOutlined,
  AreaChartOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const BRAND_COLORS = {
  SLIDE: '#1890ff',
  LESSON: '#52c41a',
  QUESTION: '#faad14',
  TEST: '#eb2f96',
  ANALYTICS: '#f5222d',
};

const aiTools = [
  {
    title: 'Tạo Slide Thuyết trình (AI)',
    description: 'Biến ý tưởng thành bài giảng hấp dẫn chỉ trong vài giây.',
    icon: <ProjectOutlined style={{ fontSize: '36px', color: BRAND_COLORS.SLIDE }} />,
    link: '/create-slide', 
    color: BRAND_COLORS.SLIDE,
  },
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
        link: '/create-test', 
        color: BRAND_COLORS.TEST,
    },
    {
        title: 'Phân tích Kết quả Học tập',
        description: 'Theo dõi tiến độ, điểm số và các lĩnh vực cần cải thiện của học sinh.',
        icon: <AreaChartOutlined style={{ fontSize: '36px', color: BRAND_COLORS.ANALYTICS }} />,
        link: '/analytics',
        color: BRAND_COLORS.ANALYTICS,
    },
];


const TeacherDashboard = () => {
  const navigate = useNavigate();
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
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderLeft: `5px solid ${color}`,
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Title level={4} style={{ margin: 0, marginLeft: 16, color: color }}>
              {title}
            </Title>
          </div>
          <p style={{ minHeight: 40 }}>{description}</p>
          <Button
            type="primary"
            size="large"
            style={{ backgroundColor: color, borderColor: color }}
          >
            Bắt đầu Ngay
          </Button>
        </Space>
      </Card>
    </Col>
  );

  return (
    <div className="create-slide-gradient-bg" style={{ minHeight: '100vh', width: '100%' }}>
      <div className="site-layout-content" style={{ background: '#fff', padding: 40, minHeight: 380, borderRadius: 12, boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)' }}>
        <Title level={2} style={{ color: '#001529' }}>Chào mừng, Giáo viên! 👋</Title>
        <p style={{ marginBottom: 40, fontSize: '16px', color: '#595959' }}>
          Chọn một công cụ dưới đây để bắt đầu tạo tài nguyên dạy học và quản lý lớp học Hóa học.
        </p>
        <Title level={3} style={{ borderBottom: '2px solid #e8e8e8', paddingBottom: 10, color: '#001529' }}>
          ✨ Công cụ Sáng tạo Nội dung AI
        </Title>
        <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
          {aiTools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </Row>
        <Title level={3} style={{ marginTop: 40, borderBottom: '2px solid #e8e8e8', paddingBottom: 10, color: '#001529' }}>
          📊 Quản lý & Đánh giá
        </Title>
        <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
          {managementTools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </Row>
      </div>
    </div>
  );
};

export default TeacherDashboard;