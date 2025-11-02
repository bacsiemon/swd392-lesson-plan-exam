import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Layout, notification, Divider, Select, DatePicker } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import Logo from '../Assets/Logo.png';
import ChemistryBackground from '../components/ChemistryBackground';
import accountService from '../services/accountService';

const { Title, Text, Link } = Typography;
const { Content } = Layout;
const { Option } = Select;

const openNotification = (type, message, description) => {
    notification[type]({
        message: message,
        description: description,
        placement: 'topRight',
    });
};

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Prepare registration data (remove confirmPassword as it's not needed in API)
            const registerData = {
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phone, // Backend expects phoneNumber, not phone
                password: values.password,
                confirmPassword: values.confirmPassword, // Backend requires confirmPassword
                role: values.role === 'teacher' ? 1 : 2, // Convert to enum: 1=Teacher, 2=Student
                // Format date properly - backend expects DateTime?
                dateOfBirth: values.dateOfBirth 
                    ? dayjs(values.dateOfBirth).startOf('day').toISOString() 
                    : undefined, // Use undefined instead of null for optional fields
            };

            const result = await accountService.register(registerData);

            if (result.success) {
                openNotification(
                    'success',
                    result.message || 'Đăng ký thành công',
                    'Tài khoản của bạn đã được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
                );
                // Chuyển về trang login sau khi đăng ký thành công
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Show detailed error message
                const errorDetails = result.error || {};
                let errorMsg = result.message || 'Đăng ký thất bại. Vui lòng thử lại.';
                
                // Map common error codes to Vietnamese messages
                if (errorMsg.includes('EMAIL_ALREADY_EXISTS')) {
                    errorMsg = 'Email này đã được sử dụng. Vui lòng sử dụng email khác.';
                } else if (errorMsg.includes('PASSWORD_NOT_STRONG_ENOUGH')) {
                    errorMsg = 'Mật khẩu không đủ mạnh. Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
                } else if (errorMsg.includes('REGISTRATION_ERROR')) {
                    errorMsg = 'Lỗi hệ thống khi đăng ký. Vui lòng thử lại sau.';
                }
                
                openNotification(
                    'error',
                    'Lỗi Đăng ký',
                    errorMsg
                );
                
                // Log full error for debugging
                console.error('Registration failed:', {
                    message: errorMsg,
                    statusCode: result.statusCode,
                    error: errorDetails
                });
            }
        } catch (error) {
            console.error('Register error:', error);
            openNotification(
                'error',
                'Lỗi Đăng ký',
                'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        openNotification(
            'info',
            'Tích hợp Google',
            'Chức năng Đăng ký bằng Google đang được triển khai.'
        );
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <Layout
            className="register-layout"
            style={{
                minHeight: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
            }}
        >
            <ChemistryBackground />
            <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', minHeight: '100vh' }}>

                <Card
                    className="register-card"
                    style={{ maxWidth: 960, width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px'
                        }}>

                            <img
                                src={Logo}
                                alt="Logo Trang Web Hóa Học"
                                style={{
                                    height: '180px',
                                    maxWidth: '260px',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <Title level={3} style={{ marginTop: '16px' }}>
                            Đăng Ký Tài Khoản Hệ Thống Giáo Dục
                        </Title>
                    </div>

                    <Row gutter={48} justify="center" align="middle">

                        {/* Cột 1: Form Đăng ký */}
                        <Col xs={24} lg={12} style={{ borderRight: window.innerWidth >= 992 ? '1px solid #f0f0f0' : 'none', paddingRight: window.innerWidth >= 992 ? '24px' : '0' }}>
                            <Title level={4}>Tạo tài khoản mới</Title>

                            <Form
                                form={form}
                                name="register_form"
                                onFinish={onFinish}
                                layout="vertical"
                                scrollToFirstError
                            >
                                {/* Họ và tên */}
                                <Form.Item
                                    name="fullName"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập họ và tên!' },
                                        { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                                    ]}
                                    label="Họ và tên"
                                >
                                    <Input
                                        prefix={<UserOutlined className="site-form-item-icon" />}
                                        placeholder="Nguyễn Văn A"
                                        size="large"
                                    />
                                </Form.Item>

                                {/* Email */}
                                <Form.Item
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email!' },
                                        { type: 'email', message: 'Email không hợp lệ!' }
                                    ]}
                                    label="Email"
                                >
                                    <Input
                                        prefix={<MailOutlined className="site-form-item-icon" />}
                                        placeholder="user@chemistry.edu.vn"
                                        size="large"
                                    />
                                </Form.Item>

                                {/* Số điện thoại */}
                                <Form.Item
                                    name="phone"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
                                    ]}
                                    label="Số điện thoại"
                                >
                                    <Input
                                        prefix={<PhoneOutlined className="site-form-item-icon" />}
                                        placeholder="0123456789"
                                        size="large"
                                    />
                                </Form.Item>

                                {/* Ngày sinh */}
                                <Form.Item
                                    name="dateOfBirth"
                                    rules={[
                                        { required: true, message: 'Vui lòng chọn ngày sinh!' },
                                        {
                                            validator: (_, value) => {
                                                if (!value) {
                                                    return Promise.reject(new Error('Vui lòng chọn ngày sinh!'));
                                                }
                                                const age = dayjs().diff(value, 'year');
                                                if (age < 13) {
                                                    return Promise.reject(new Error('Bạn phải ít nhất 13 tuổi để đăng ký!'));
                                                }
                                                if (age > 100) {
                                                    return Promise.reject(new Error('Ngày sinh không hợp lệ!'));
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                    label="Ngày sinh"
                                >
                                    <DatePicker
                                        placeholder="Chọn ngày sinh"
                                        size="large"
                                        style={{ width: '100%' }}
                                        format="DD/MM/YYYY"
                                        suffixIcon={<CalendarOutlined />}
                                        disabledDate={(current) => {
                                            // Disable future dates and dates more than 100 years ago
                                            return current && (current > dayjs().endOf('day') || current < dayjs().subtract(100, 'year'));
                                        }}
                                    />
                                </Form.Item>

                                {/* Vai trò */}
                                <Form.Item
                                    name="role"
                                    rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                                    label="Vai trò"
                                >
                                    <Select
                                        placeholder="Chọn vai trò của bạn"
                                        size="large"
                                    >
                                        <Option value="teacher">Giáo viên</Option>
                                        <Option value="student">Học sinh</Option>
                                    </Select>
                                </Form.Item>

                                {/* Mật khẩu */}
                                <Form.Item
                                    name="password"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                    ]}
                                    label="Mật khẩu"
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        placeholder="Mật khẩu"
                                        size="large"
                                    />
                                </Form.Item>

                                {/* Xác nhận mật khẩu */}
                                <Form.Item
                                    name="confirmPassword"
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                            },
                                        }),
                                    ]}
                                    label="Xác nhận mật khẩu"
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        placeholder="Xác nhận mật khẩu"
                                        size="large"
                                    />
                                </Form.Item>

                                {/* Nút Đăng ký */}
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        loading={loading}
                                        style={{ width: '100%', marginTop: '16px' }}
                                    >
                                        Đăng ký
                                    </Button>
                                </Form.Item>
                            </Form>

                            {/* Link về trang đăng nhập */}
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Text type="secondary">Đã có tài khoản? </Text>
                                <Link onClick={handleBackToLogin} style={{ color: '#1890ff' }}>
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        </Col>

                        {/* Cột 2: Đăng ký bằng Google */}
                        <Col xs={24} lg={12} style={{ paddingTop: window.innerWidth < 992 ? '24px' : '0' }}>
                            <Title level={4}>Hoặc đăng ký bằng</Title>

                            <Button
                                icon={<GoogleOutlined />}
                                size="large"
                                onClick={handleGoogleRegister}
                                style={{ width: '100%', marginBottom: '8px' }}
                            >
                                Đăng ký bằng Google
                            </Button>

                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
                                Sử dụng tài khoản Google để đăng ký nhanh chóng.
                            </Text>

                            {/* Thông báo bổ sung */}
                            <Divider style={{ margin: '32px 0 16px 0' }} />
                            <div style={{ textAlign: 'center' }}>
                                <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                    Bằng việc đăng ký, bạn đồng ý với{' '}
                                    <Link style={{ color: '#faad14' }}>Điều khoản sử dụng</Link>
                                    {' '}và{' '}
                                    <Link style={{ color: '#faad14' }}>Chính sách bảo mật</Link>
                                    {' '}của chúng tôi.
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Content>
        </Layout>
    );
};

export default RegisterPage;
