import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space, Alert, Divider, Row, Col, message } from 'antd';
import {
  SearchOutlined,
  LockOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

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

const ClassEnrollmentPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classFound, setClassFound] = useState(false);
  const [classInfo, setClassInfo] = useState(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  // Mock class data - in real app, this would come from API
  const mockClasses = [
    {
      code: 'CHEM101',
      name: 'Hóa học Cơ bản 10A',
      teacher: 'Cô Nguyễn Thị Lan',
      password: 'chem2024',
      description: 'Lớp học Hóa học cơ bản dành cho học sinh lớp 10',
      studentCount: 25,
      maxStudents: 30,
    },
    {
      code: 'CHEM102',
      name: 'Hóa học Nâng cao 11B',
      teacher: 'Thầy Trần Văn Minh',
      password: 'advanced2024',
      description: 'Lớp học Hóa học nâng cao cho học sinh lớp 11',
      studentCount: 18,
      maxStudents: 25,
    },
    {
      code: 'CHEM201',
      name: 'Hóa học Hữu cơ 12A',
      teacher: 'Cô Lê Thị Hương',
      password: 'organic2024',
      description: 'Lớp học chuyên sâu về Hóa học hữu cơ',
      studentCount: 22,
      maxStudents: 28,
    },
  ];

  const handleSearchClass = async (values) => {
    setLoading(true);
    const { classCode } = values;

    // Simulate API call
    setTimeout(() => {
      const foundClass = mockClasses.find(cls => cls.code.toUpperCase() === classCode.toUpperCase());
      
      if (foundClass) {
        setClassFound(true);
        setClassInfo(foundClass);
        message.success('Tìm thấy lớp học!');
      } else {
        setClassFound(false);
        setClassInfo(null);
        message.error('Không tìm thấy lớp học với mã này.');
      }
      setLoading(false);
    }, 1000);
  };

  const handleEnroll = async (values) => {
    setLoading(true);
    const { password } = values;

    // Simulate API call for enrollment
    setTimeout(() => {
      if (password === classInfo.password) {
        setEnrollmentSuccess(true);
        message.success('Đăng ký thành công! Bạn đã tham gia lớp học.');
        
        // Redirect to student dashboard after successful enrollment
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 2000);
      } else {
        message.error('Mật khẩu không đúng. Vui lòng thử lại.');
      }
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setClassFound(false);
    setClassInfo(null);
    setEnrollmentSuccess(false);
    form.resetFields();
  };

  const GlassCard = ({ children, style = {} }) => (
    <Card
      style={{
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {children}
    </Card>
  );

  if (enrollmentSuccess) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Animated background elements */}
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
        
        <GlassCard style={{ maxWidth: 500, textAlign: 'center', zIndex: 1 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
            <Title level={2} style={{ color: 'rgba(255, 255, 255, 0.95)', margin: 0 }}>
              Đăng ký thành công! 🎉
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
              Bạn đã tham gia lớp <strong>{classInfo?.name}</strong> thành công.
              <br />
              Bây giờ bạn có thể truy cập các bài học và bài kiểm tra.
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Đang chuyển hướng đến trang chủ...
            </Text>
          </Space>
        </GlassCard>
      </div>
    );
  }

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
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={1} style={{ color: 'rgba(255, 255, 255, 0.95)', marginBottom: 16, textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              Tham gia lớp học 📚
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '18px' }}>
              Nhập mã lớp học để tìm và tham gia lớp học của bạn
            </Text>
          </div>

          {/* Search Class Form */}
          {!classFound && (
            <GlassCard>
              <Form
                form={form}
                onFinish={handleSearchClass}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="classCode"
                  label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Mã lớp học</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã lớp học!' },
                    { min: 3, message: 'Mã lớp học phải có ít nhất 3 ký tự!' }
                  ]}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                    placeholder="Ví dụ: CHEM101"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 8
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(45deg, #1890ff, #52c41a)',
                      border: 'none',
                      borderRadius: 8,
                      height: 48,
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    <SearchOutlined /> Tìm lớp học
                  </Button>
                </Form.Item>
              </Form>
            </GlassCard>
          )}

          {/* Class Found - Enrollment Form */}
          {classFound && classInfo && (
            <GlassCard>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Class Information */}
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <TeamOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
                  <Title level={3} style={{ color: 'rgba(255, 255, 255, 0.95)', marginBottom: 8 }}>
                    {classInfo.name}
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
                    Giáo viên: <strong>{classInfo.teacher}</strong>
                  </Text>
                  <br />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                    {classInfo.description}
                  </Text>
                  <br />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                    {classInfo.studentCount}/{classInfo.maxStudents} học sinh
                  </Text>
                </div>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                {/* Enrollment Form */}
                <Form
                  onFinish={handleEnroll}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="password"
                    label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Mật khẩu lớp học</span>}
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu lớp học!' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                      placeholder="Nhập mật khẩu để tham gia"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 8
                      }}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Button
                        size="large"
                        onClick={handleReset}
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 8,
                          height: 48
                        }}
                      >
                        Quay lại
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        style={{
                          width: '100%',
                          background: 'linear-gradient(45deg, #52c41a, #1890ff)',
                          border: 'none',
                          borderRadius: 8,
                          height: 48,
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        <CheckCircleOutlined /> Tham gia lớp
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Space>
            </GlassCard>
          )}

          {/* Help Section */}
          <GlassCard style={{ marginTop: 24, textAlign: 'center' }}>
            <Space direction="vertical" size="small">
              <BookOutlined style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.6)' }} />
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Cần hỗ trợ? Liên hệ với giáo viên để lấy mã lớp học và mật khẩu.
              </Text>
            </Space>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ClassEnrollmentPage;
