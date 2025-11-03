import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Layout, notification, Divider, DatePicker, Tabs } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import Logo from '../Assets/Logo.png';
import ChemistryBackground from '../components/ChemistryBackground';
import accountService from '../services/accountService';

const { Title, Text, Link } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const openNotification = (type, message, description) => {
    notification[type]({
        message: message,
        description: description,
        placement: 'topRight',
    });
};

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [activeTab, setActiveTab] = useState('student');
    const [studentForm] = Form.useForm();
    const [teacherForm] = Form.useForm();
    const navigate = useNavigate();

    // Update isMobile on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle Student Registration
    const onStudentFinish = async (values) => {
        setLoading(true);
        try {
            const registerData = {
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phone,
                password: values.password,
                confirmPassword: values.confirmPassword,
                dateOfBirth: values.dateOfBirth 
                    ? dayjs(values.dateOfBirth).startOf('day').toISOString() 
                    : undefined,
            };

            const result = await accountService.registerStudent(registerData);

            if (result.success) {
                openNotification(
                    'success',
                    result.message || 'Đăng ký học sinh thành công',
                    'Tài khoản học sinh của bạn đã được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
                );
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                handleRegistrationError(result, 'học sinh');
            }
        } catch (error) {
            console.error('Student registration error:', error);
            openNotification(
                'error',
                'Lỗi Đăng ký',
                'Có lỗi xảy ra khi đăng ký tài khoản học sinh. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle Teacher Registration
    const onTeacherFinish = async (values) => {
        setLoading(true);
        try {
            const registerData = {
                fullName: values.fullName,
                email: values.email,
                schoolName: values.schoolName, // Required for teacher
                phoneNumber: values.phone,
                password: values.password,
                confirmPassword: values.confirmPassword,
                dateOfBirth: values.dateOfBirth 
                    ? dayjs(values.dateOfBirth).startOf('day').toISOString() 
                    : undefined,
            };

            const result = await accountService.registerTeacher(registerData);

            if (result.success) {
                openNotification(
                    'success',
                    result.message || 'Đăng ký giáo viên thành công',
                    'Tài khoản giáo viên của bạn đã được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
                );
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                handleRegistrationError(result, 'giáo viên');
            }
        } catch (error) {
            console.error('Teacher registration error:', error);
            openNotification(
                'error',
                'Lỗi Đăng ký',
                'Có lỗi xảy ra khi đăng ký tài khoản giáo viên. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Common error handler for registration
    const handleRegistrationError = (result, userType) => {
        const errorDetails = result.error || {};
        let errorMsg = result.message || `Đăng ký ${userType} thất bại. Vui lòng thử lại.`;
        
        // Map common error codes to Vietnamese messages
        if (errorMsg.includes('EMAIL_ALREADY_EXISTS') || errorMsg.includes('email already exists')) {
            errorMsg = 'Email này đã được sử dụng. Vui lòng sử dụng email khác.';
        } else if (errorMsg.includes('PASSWORD_NOT_STRONG_ENOUGH') || errorMsg.includes('password not strong')) {
            errorMsg = 'Mật khẩu không đủ mạnh. Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
        } else if (errorMsg.includes('REGISTRATION_ERROR') || errorMsg.includes('registration error')) {
            errorMsg = 'Lỗi hệ thống khi đăng ký. Vui lòng thử lại sau.';
        } else if (errorMsg.includes('INVALID_EMAIL') || errorMsg.includes('invalid email')) {
            errorMsg = 'Email không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (errorMsg.includes('CONFIRM_PASSWORD') || errorMsg.includes('confirm password')) {
            errorMsg = 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.';
        } else if (errorMsg.includes('School name') || errorMsg.includes('school name')) {
            errorMsg = 'Vui lòng nhập tên trường học.';
        }
        
        openNotification(
            'error',
            'Lỗi Đăng ký',
            errorMsg
        );
        
        console.error(`Registration failed (${userType}):`, {
            message: errorMsg,
            statusCode: result.statusCode,
            error: errorDetails
        });
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
                position: 'relative',
                width: '100%',
                overflow: 'auto',
            }}
        >
            <ChemistryBackground />
            <Content style={{ 
                padding: '24px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-start', 
                background: 'transparent', 
                minHeight: '100vh',
                overflow: 'auto'
            }}>

                <Card
                    className="register-card"
                    bodyStyle={{ padding: '24px' }}
                    style={{ 
                        maxWidth: 960, 
                        width: '100%', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        margin: isMobile ? '16px auto' : '24px auto',
                    }}
                >

                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px'
                        }}>

                            <img
                                src={Logo}
                                alt="Logo Trang Web Hóa Học"
                                style={{
                                    height: isMobile ? '100px' : '120px',
                                    maxWidth: isMobile ? '150px' : '200px',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <Title level={isMobile ? 4 : 3} style={{ marginTop: '8px', fontSize: isMobile ? '18px' : '24px' }}>
                            Đăng Ký Tài Khoản Hệ Thống Giáo Dục
                        </Title>
                    </div>

                    <Row gutter={isMobile ? 24 : 48} justify="center" align="top">

                        {/* Cột 1: Form Đăng ký với Tabs */}
                        <Col xs={24} lg={12} style={{ borderRight: !isMobile ? '1px solid #f0f0f0' : 'none', paddingRight: !isMobile ? '24px' : '0', paddingBottom: isMobile ? '24px' : '0' }}>
                            <Title level={4} style={{ marginBottom: '16px' }}>Tạo tài khoản mới</Title>

                            <Tabs 
                                activeKey={activeTab} 
                                onChange={setActiveTab}
                                style={{ marginBottom: '16px' }}
                            >
                                {/* Tab Đăng ký Học sinh */}
                                <TabPane tab="Học sinh" key="student">
                                    <Form
                                        form={studentForm}
                                        name="student_register_form"
                                        onFinish={onStudentFinish}
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
                                                placeholder="student@chemistry.edu.vn"
                                                size="large"
                                            />
                                        </Form.Item>

                                        {/* Số điện thoại */}
                                        <Form.Item
                                            name="phone"
                                            rules={[
                                                { required: false, message: 'Vui lòng nhập số điện thoại!' },
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
                                                { required: false, message: 'Vui lòng chọn ngày sinh!' },
                                                {
                                                    validator: (_, value) => {
                                                        if (!value) {
                                                            return Promise.resolve();
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
                                                placeholder="Chọn ngày sinh (tùy chọn)"
                                                size="large"
                                                style={{ width: '100%' }}
                                                format="DD/MM/YYYY"
                                                suffixIcon={<CalendarOutlined />}
                                                disabledDate={(current) => {
                                                    return current && (current > dayjs().endOf('day') || current < dayjs().subtract(100, 'year'));
                                                }}
                                            />
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
                                                Đăng ký Học sinh
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>

                                {/* Tab Đăng ký Giáo viên */}
                                <TabPane tab="Giáo viên" key="teacher">
                                    <Form
                                        form={teacherForm}
                                        name="teacher_register_form"
                                        onFinish={onTeacherFinish}
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
                                                placeholder="teacher@chemistry.edu.vn"
                                                size="large"
                                            />
                                        </Form.Item>

                                        {/* Tên trường học - Required for Teacher */}
                                        <Form.Item
                                            name="schoolName"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập tên trường học!' },
                                                { min: 2, message: 'Tên trường học phải có ít nhất 2 ký tự!' }
                                            ]}
                                            label="Tên trường học"
                                        >
                                            <Input
                                                prefix={<BankOutlined className="site-form-item-icon" />}
                                                placeholder="Trường THPT ABC"
                                                size="large"
                                            />
                                        </Form.Item>

                                        {/* Số điện thoại */}
                                        <Form.Item
                                            name="phone"
                                            rules={[
                                                { required: false, message: 'Vui lòng nhập số điện thoại!' },
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
                                                { required: false, message: 'Vui lòng chọn ngày sinh!' },
                                                {
                                                    validator: (_, value) => {
                                                        if (!value) {
                                                            return Promise.resolve();
                                                        }
                                                        const age = dayjs().diff(value, 'year');
                                                        if (age < 18) {
                                                            return Promise.reject(new Error('Giáo viên phải ít nhất 18 tuổi!'));
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
                                                placeholder="Chọn ngày sinh (tùy chọn)"
                                                size="large"
                                                style={{ width: '100%' }}
                                                format="DD/MM/YYYY"
                                                suffixIcon={<CalendarOutlined />}
                                                disabledDate={(current) => {
                                                    return current && (current > dayjs().endOf('day') || current < dayjs().subtract(100, 'year'));
                                                }}
                                            />
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
                                                Đăng ký Giáo viên
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>
                            </Tabs>

                            {/* Link về trang đăng nhập */}
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Text type="secondary">Đã có tài khoản? </Text>
                                <Link onClick={handleBackToLogin} style={{ color: '#1890ff' }}>
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        </Col>

                        {/* Cột 2: Đăng ký bằng Google */}
                        <Col xs={24} lg={12} style={{ paddingTop: isMobile ? '24px' : '0' }}>
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
