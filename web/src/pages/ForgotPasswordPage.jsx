import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Layout, notification, Steps, Alert } from 'antd';
import { MailOutlined, SafetyOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import Logo from '../Assets/Logo.png';
import ChemistryBackground from '../components/ChemistryBackground';

const { Title, Text, Link } = Typography;
const { Content } = Layout;
const { Step } = Steps;

const openNotification = (type, message, description) => {
    notification[type]({
        message: message,
        description: description,
        placement: 'topRight',
    });
};

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [emailForm] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    // Bước 1: Gửi email
    const onSendEmail = (values) => {
        setLoading(true);
        setUserEmail(values.email);

        setTimeout(() => {
            setLoading(false);
            openNotification(
                'success',
                'Đã gửi mã xác thực',
                `Mã xác thực đã được gửi đến email ${values.email}. Vui lòng kiểm tra hộp thư của bạn.`
            );
            setCurrentStep(1);
        }, 1500);
    };

    // Bước 2: Xác thực OTP
    const onVerifyOtp = (values) => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            if (values.otp === '123456') { // Mock OTP validation
                openNotification(
                    'success',
                    'Xác thực thành công',
                    'Mã xác thực chính xác. Bạn có thể đặt lại mật khẩu mới.'
                );
                setCurrentStep(2);
            } else {
                openNotification(
                    'error',
                    'Mã xác thực không đúng',
                    'Vui lòng kiểm tra lại mã xác thực hoặc yêu cầu gửi mã mới.'
                );
            }
        }, 1500);
    };

    // Bước 3: Đặt lại mật khẩu
    const onResetPassword = (values) => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            openNotification(
                'success',
                'Đổi mật khẩu thành công',
                'Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể đăng nhập với mật khẩu mới.'
            );

            // Chuyển về trang đăng nhập sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }, 1500);
    };

    // Gửi lại mã OTP
    const resendOtp = () => {
        openNotification(
            'info',
            'Đã gửi lại mã xác thực',
            `Mã xác thực mới đã được gửi đến email ${userEmail}.`
        );
    };

    // Quay về trang đăng nhập
    const handleBackToLogin = () => {
        navigate('/login');
    };

    // Render form theo từng bước
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Form
                        form={emailForm}
                        name="forgot_password_form"
                        onFinish={onSendEmail}
                        layout="vertical"
                    >
                        <Alert
                            message="Nhập email để nhận mã xác thực"
                            description="Chúng tôi sẽ gửi mã xác thực đến email của bạn để đặt lại mật khẩu."
                            type="info"
                            showIcon
                            style={{ marginBottom: '24px' }}
                        />

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                            label="Địa chỉ Email"
                        >
                            <Input
                                prefix={<MailOutlined className="site-form-item-icon" />}
                                placeholder="user@chemistry.edu.vn"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                style={{ width: '100%', marginTop: '16px' }}
                            >
                                Gửi mã xác thực
                            </Button>
                        </Form.Item>
                    </Form>
                );

            case 1:
                return (
                    <Form
                        form={otpForm}
                        name="verify_otp_form"
                        onFinish={onVerifyOtp}
                        layout="vertical"
                    >
                        <Alert
                            message="Nhập mã xác thực"
                            description={`Mã xác thực đã được gửi đến email ${userEmail}. Mã có hiệu lực trong 5 phút.`}
                            type="warning"
                            showIcon
                            style={{ marginBottom: '24px' }}
                        />

                        <Form.Item
                            name="otp"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã xác thực!' },
                                { len: 6, message: 'Mã xác thực phải có 6 chữ số!' }
                            ]}
                            label="Mã xác thực (6 chữ số)"
                        >
                            <Input
                                prefix={<SafetyOutlined className="site-form-item-icon" />}
                                placeholder="123456"
                                size="large"
                                maxLength={6}
                                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
                            />
                        </Form.Item>

                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <Text type="secondary">Không nhận được mã? </Text>
                            <Link onClick={resendOtp} style={{ color: '#1890ff' }}>
                                Gửi lại
                            </Link>
                        </div>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                style={{ width: '100%' }}
                            >
                                Xác thực mã
                            </Button>
                        </Form.Item>
                    </Form>
                );

            case 2:
                return (
                    <Form
                        form={resetForm}
                        name="reset_password_form"
                        onFinish={onResetPassword}
                        layout="vertical"
                    >
                        <Alert
                            message="Đặt mật khẩu mới"
                            description="Vui lòng nhập mật khẩu mới cho tài khoản của bạn."
                            type="success"
                            showIcon
                            style={{ marginBottom: '24px' }}
                        />

                        <Form.Item
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                            label="Mật khẩu mới"
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder="Mật khẩu mới"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                            label="Xác nhận mật khẩu mới"
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder="Xác nhận mật khẩu mới"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                style={{ width: '100%', marginTop: '16px' }}
                            >
                                Đặt lại mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                );

            default:
                return null;
        }
    };

    const stepTitles = [
        'Nhập Email',
        'Xác thực OTP',
        'Đặt lại mật khẩu'
    ];

    return (
        <Layout
            className="forgot-password-layout"
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
                    className="forgot-password-card"
                    style={{ maxWidth: 600, width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >

                    {/* Header */}
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
                                    height: '120px',
                                    maxWidth: '180px',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <Title level={3} style={{ marginTop: '16px' }}>
                            Đặt Lại Mật Khẩu
                        </Title>
                        <Text type="secondary">
                            Quên mật khẩu? Đừng lo lắng, chúng tôi sẽ giúp bạn tạo mật khẩu mới.
                        </Text>
                    </div>

                    {/* Steps Progress */}
                    <div style={{ marginBottom: '32px' }}>
                        <Steps current={currentStep} size="small">
                            {stepTitles.map((title, index) => (
                                <Step key={index} title={title} />
                            ))}
                        </Steps>
                    </div>

                    {/* Form Content */}
                    <div style={{ minHeight: '300px' }}>
                        {renderStepContent()}
                    </div>

                    {/* Back to Login */}
                    <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                        <Button
                            type="link"
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBackToLogin}
                            style={{ padding: 0, height: 'auto', color: '#595959' }}
                        >
                            Quay lại trang đăng nhập
                        </Button>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default ForgotPasswordPage;