import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Layout, notification, Divider, Checkbox } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import Logo from '../Assets/Logo.png';
import ChemistryBackground from '../components/ChemistryBackground';
const { Title, Text, Link } = Typography;
const { Content } = Layout;
const openNotification = (type, message, description) => {
    notification[type]({
        message: message,
        description: description,
        placement: 'topRight',
    });
};

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Load saved credentials on component mount
    useEffect(() => {
        const savedCredentials = localStorage.getItem('rememberedCredentials');
        setHasSavedCredentials(!!savedCredentials);
        
        if (savedCredentials) {
            try {
                const { username, password, remember } = JSON.parse(savedCredentials);
                if (remember) {
                    form.setFieldsValue({
                        username: username,
                        password: password,
                        remember: remember
                    });
                }
            } catch (error) {
                console.error('Error loading saved credentials:', error);
                localStorage.removeItem('rememberedCredentials');
                setHasSavedCredentials(false);
            }
        }
    }, [form]);
    const onFinish = (values) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (values.username === 'chemistry' && values.password === '123') {
                // Handle remember password functionality
                if (values.remember) {
                    // Save credentials to localStorage
                    const credentialsToSave = {
                        username: values.username,
                        password: values.password,
                        remember: true,
                        savedAt: new Date().toISOString()
                    };
                    localStorage.setItem('rememberedCredentials', JSON.stringify(credentialsToSave));
                    setHasSavedCredentials(true);
                } else {
                    // Remove saved credentials if remember is unchecked
                    localStorage.removeItem('rememberedCredentials');
                    setHasSavedCredentials(false);
                }

                openNotification(
                    'success',
                    'Đăng nhập thành công',
                    'Chào mừng bạn đến với Trang web Giáo dục Hóa học.'
                );

                // Navigate to appropriate dashboard based on user role
                // For demo purposes, navigate to student dashboard
                navigate('/student-dashboard');

            } else {
                openNotification(
                    'error',
                    'Lỗi Đăng nhập',
                    'Tên người dùng hoặc mật khẩu không đúng. Vui lòng thử lại.'
                );
            }
        }, 1500);
    };

    const handleGoogleLogin = () => {
        openNotification(
            'info',
            'Tích hợp Google',
            'Chức năng Đăng nhập bằng Google đang được triển khai.'
        );
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    const handleClearSavedCredentials = () => {
        localStorage.removeItem('rememberedCredentials');
        setHasSavedCredentials(false);
        form.resetFields();
        openNotification(
            'success',
            'Đã xóa thông tin đã lưu',
            'Thông tin đăng nhập đã được xóa khỏi trình duyệt.'
        );
    };
    return (
        <Layout
            className="login-layout"
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
                    className="login-card"
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
                            Cổng Đăng Nhập Hệ Thống Giáo Dục
                        </Title>
                    </div>

                    <Row gutter={48} justify="center" align="middle">

                        <Col xs={24} lg={12} style={{ borderRight: window.innerWidth >= 992 ? '1px solid #f0f0f0' : 'none', paddingRight: window.innerWidth >= 992 ? '24px' : '0' }}>
                            <Title level={4}>Đăng nhập</Title>

                            <Form
                                form={form}
                                name="login_form"
                                initialValues={{ remember: true }}
                                onFinish={onFinish}
                                layout="vertical"
                            >
                                <Form.Item
                                    name="username"
                                    rules={[{ required: true, message: 'Vui lòng nhập Tên người dùng!' }]}
                                    label="Tên người dùng (hoặc Email)"
                                >
                                    <Input
                                        prefix={<UserOutlined className="site-form-item-icon" />}
                                        placeholder="user@chemistry.edu.vn"
                                        size="large"
                                    />
                                </Form.Item>


                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                                    label="Mật khẩu"
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        placeholder="Mật khẩu"
                                        size="large"
                                    />
                                </Form.Item>

                                {/* Remember Password Checkbox */}
                                <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: '16px' }}>
                                    <Checkbox>Ghi nhớ mật khẩu</Checkbox>
                                </Form.Item>

                                {/* Nút Đăng nhập */}
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        loading={loading}
                                        style={{ width: '100%', marginTop: '16px' }}
                                    >
                                        Đăng nhập
                                    </Button>
                                </Form.Item>
                            </Form>

                            {/* Link Quên mật khẩu và Clear Saved Credentials */}
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Link onClick={handleForgotPassword} style={{ color: '#595959', marginRight: '16px' }}>
                                    Quên mật khẩu?
                                </Link>
                                {hasSavedCredentials && (
                                    <Link onClick={handleClearSavedCredentials} style={{ color: '#ff4d4f' }}>
                                        Xóa thông tin đã lưu
                                    </Link>
                                )}
                            </div>

                            {/* Nút Đăng ký tài khoản */}
                            <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                <Text type="secondary">Chưa có tài khoản? </Text>
                                <Button
                                    type="link"
                                    onClick={handleRegisterRedirect}
                                    style={{ padding: 0, height: 'auto', color: '#1890ff' }}
                                >
                                    Đăng ký ngay
                                </Button>
                            </div>
                        </Col>

                        {/* Cột 2: Đăng nhập bằng Google */}
                        <Col xs={24} lg={12} style={{ paddingTop: window.innerWidth < 992 ? '24px' : '0' }}>
                            <Title level={4}>Hoặc đăng nhập bằng</Title>

                            <Button
                                icon={<GoogleOutlined />}
                                size="large"
                                onClick={handleGoogleLogin}
                                style={{ width: '100%', marginBottom: '8px' }}
                            >
                                Đăng nhập bằng Google
                            </Button>

                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
                                Sử dụng tài khoản Google để truy cập nhanh chóng.
                            </Text>

                            {/* Thông báo bổ sung */}
                            <Divider style={{ margin: '32px 0 16px 0' }} />
                            <div style={{ textAlign: 'center' }}>
                                <Link style={{ color: '#faad14' }}>
                                    Thông báo về Cookie và Chính sách bảo mật
                                </Link>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Content>
        </Layout>
    );
};

export default LoginPage;