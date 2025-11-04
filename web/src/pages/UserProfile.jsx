import React, { useState, useEffect } from 'react';
import {
    Card,
    Avatar,
    Row,
    Col,
    Typography,
    Divider,
    Button,
    Space,
    Skeleton,
    Modal,
    Form,
    Input,
    Upload,
    message,
    Alert,
    Tabs
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    HomeOutlined,
    CameraOutlined,
    SaveOutlined,
    LoadingOutlined,
    ExperimentOutlined,
    LockOutlined,
    KeyOutlined
} from '@ant-design/icons';
import accountService from '../services/accountService';
import '../styles/chemistryTheme.css';
import '../styles/TeacherProfile.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Password } = Input;

// Universal Profile component for both students and teachers
const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [uploading] = useState(false);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordMethod, setPasswordMethod] = useState('change'); // 'change' or 'forgot'
    const [changePasswordForm] = Form.useForm();
    const [forgotPasswordForm] = Form.useForm();
    const [resetPasswordForm] = Form.useForm();
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

    // Load profile from API
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await accountService.getProfile();
                console.log('Profile result:', result);
                
                if (result.success && result.data) {
                    // Map API response to component format
                    // Backend AccountResponse: { Id, Email, FullName, Phone, DateOfBirth, AvatarUrl, Role, IsActive, EmailVerified }
                    const profileData = result.data;
                    console.log('Profile data:', profileData);
                    
                    setProfile({
                        avatar_url: profileData.AvatarUrl || profileData.avatarUrl || profileData.avatar_url || null,
                        full_name: profileData.FullName || profileData.fullName || profileData.full_name || profileData.Name || profileData.name || '',
                        email: profileData.Email || profileData.email || '',
                        phone: profileData.Phone || profileData.phone || '',
                        date_of_birth: profileData.DateOfBirth || profileData.dateOfBirth || profileData.date_of_birth || null,
                        school_name: profileData.SchoolName || profileData.schoolName || profileData.school_name || '',
                        bio: profileData.Bio || profileData.bio || profileData.biography || '',
                        role: profileData.Role !== undefined ? profileData.Role : (profileData.role !== undefined ? profileData.role : (profileData.roleEnum !== undefined ? profileData.roleEnum : null)),
                        // Store raw data for update
                        rawData: profileData
                    });
                } else {
                    const errorMsg = result.message || 'Không thể tải thông tin profile';
                    setError(errorMsg);
                    message.error(errorMsg);
                    console.error('Profile loading failed:', result);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('Có lỗi xảy ra khi tải thông tin profile');
                message.error('Có lỗi xảy ra khi tải thông tin profile');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    // Handle avatar upload
    const handleAvatarChange = (info) => {
        console.log('Avatar upload:', info);
    };

    // Handle edit profile
    const handleEdit = () => {
        form.setFieldsValue({
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone,
            date_of_birth: profile.date_of_birth,
            school_name: profile.school_name,
            bio: profile.bio
        });
        setEditing(true);
    };

    // Handle save profile
    const handleSave = async (values) => {
        try {
            // TODO: Implement update profile API call when available
            // const result = await accountService.updateProfile(values);
            // if (result.success) {
            //     message.success('Cập nhật profile thành công');
            //     setProfile({ ...profile, ...values });
            //     setEditing(false);
            // } else {
            //     message.error(result.message || 'Không thể cập nhật profile');
            // }
            
            // Temporary: just update local state
            setProfile({ ...profile, ...values });
            setEditing(false);
            message.success('Cập nhật profile thành công (chưa lưu lên server)');
        } catch (err) {
            console.error('Error saving profile:', err);
            message.error('Có lỗi xảy ra khi lưu profile');
        }
    };

    const uploadButton = (
        <div className="avatar-upload-button">
            {uploading ? <LoadingOutlined /> : <CameraOutlined />}
            <div style={{ marginTop: 8, fontSize: '12px' }}>
                {uploading ? 'Đang tải...' : 'Thay đổi'}
            </div>
        </div>
    );

    if (loading && !profile) {
        return (
            <div className="teacher-profile-container chemistry-page">
                <div className="chemistry-molecules-bg"></div>
                <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
                    <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8 }}>
                        <ExperimentOutlined /> Hồ Sơ Cá Nhân
                    </Title>
                    <Text className="chemistry-subtitle" style={{ fontSize: 16 }}>
                        Quản lý thông tin cá nhân và cài đặt tài khoản
                    </Text>
                </Card>
                <Card className="profile-card">
                    <Skeleton avatar active paragraph={{ rows: 6 }} />
                </Card>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="teacher-profile-container chemistry-page">
                <div className="chemistry-molecules-bg"></div>
                <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
                    <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8 }}>
                        <ExperimentOutlined /> Hồ Sơ Cá Nhân
                    </Title>
                    <Text className="chemistry-subtitle" style={{ fontSize: 16 }}>
                        Quản lý thông tin cá nhân và cài đặt tài khoản
                    </Text>
                </Card>
                <Card className="profile-card chemistry-card">
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                    />
                </Card>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="teacher-profile-container chemistry-page">
            <div className="chemistry-molecules-bg"></div>
            <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
                <Title level={2} className="chemistry-title" style={{ margin: 0, marginBottom: 8 }}>
                    <ExperimentOutlined /> Hồ Sơ Cá Nhân
                </Title>
                <Text className="chemistry-subtitle" style={{ fontSize: 16 }}>
                    Quản lý thông tin cá nhân và cài đặt tài khoản
                </Text>
            </Card>

            <Card className="profile-card chemistry-card" loading={loading}>
                {/* Header with Avatar and Basic Info */}
                <div className="profile-header-section">
                    <Row gutter={24} align="middle">
                        <Col xs={24} sm={8} md={6} className="avatar-section">
                            <div className="avatar-container">
                                <Avatar
                                    size={120}
                                    src={profile.avatar_url}
                                    icon={<UserOutlined />}
                                    className="profile-avatar"
                                />
                                <Upload
                                    name="avatar"
                                    listType="picture"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    action="/api/upload"
                                    beforeUpload={() => false}
                                    onChange={handleAvatarChange}
                                >
                                    {uploadButton}
                                </Upload>
                            </div>
                        </Col>

                        <Col xs={24} sm={16} md={18}>
                            <div className="basic-info">
                                <Title level={3} className="profile-name">
                                    {profile.full_name}
                                </Title>
                                <Paragraph className="profile-bio" ellipsis={{ rows: 2, expandable: true }}>
                                    {profile.bio}
                                </Paragraph>
                            </div>
                        </Col>
                    </Row>

                    <div className="action-buttons">
                        <Space>
                            <Button
                                type="primary"
                                className="chemistry-btn-primary"
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                                size="large"
                            >
                                Chỉnh sửa hồ sơ
                            </Button>
                            <Button
                                icon={<LockOutlined />}
                                onClick={() => {
                                    setPasswordMethod('change');
                                    setPasswordModalVisible(true);
                                    setForgotPasswordSent(false);
                                    changePasswordForm.resetFields();
                                    forgotPasswordForm.resetFields();
                                    resetPasswordForm.resetFields();
                                }}
                                size="large"
                            >
                                Đổi mật khẩu
                            </Button>
                        </Space>
                    </div>
                </div>

                <Divider />

                {/* Detailed Information */}
                <div className="profile-details">
                    <Title level={4} className="section-title">Thông Tin Chi Tiết</Title>

                    <Row gutter={[24, 16]}>
                        {/* Email */}
                        <Col xs={24} sm={12}>
                            <div className="info-item">
                                <div className="info-label">
                                    <MailOutlined className="info-icon" />
                                    <span>Email</span>
                                </div>
                                <Text className="info-value" copyable>
                                    {profile.email}
                                </Text>
                            </div>
                        </Col>

                        {/* Phone */}
                        <Col xs={24} sm={12}>
                            <div className="info-item">
                                <div className="info-label">
                                    <PhoneOutlined className="info-icon" />
                                    <span>Số điện thoại</span>
                                </div>
                                <Text className="info-value" copyable>
                                    {profile.phone || 'Chưa cập nhật'}
                                </Text>
                            </div>
                        </Col>

                        {/* Date of Birth */}
                        {profile.date_of_birth && (
                            <Col xs={24} sm={12}>
                                <div className="info-item">
                                    <div className="info-label">
                                        <CalendarOutlined className="info-icon" />
                                        <span>Ngày sinh</span>
                                    </div>
                                    <Text className="info-value">
                                        {new Date(profile.date_of_birth).toLocaleDateString('vi-VN')}
                                    </Text>
                                </div>
                            </Col>
                        )}

                        {/* School - Only show for teachers */}
                        {profile.school_name && (
                            <Col xs={24}>
                                <div className="info-item">
                                    <div className="info-label">
                                        <HomeOutlined className="info-icon" />
                                        <span>{profile.role === 'Student' || profile.role === 'student' || profile.role === 2 ? 'Trường học' : 'Trường công tác'}</span>
                                    </div>
                                    <Text className="info-value">
                                        {profile.school_name}
                                    </Text>
                                </div>
                            </Col>
                        )}
                    </Row>
                </div>
            </Card>

            {/* Edit Modal */}
            <Modal
                className="chemistry-modal"
                title="Chỉnh sửa hồ sơ"
                open={editing}
                onCancel={() => setEditing(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className="edit-profile-form"
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="full_name"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                            >
                                <Input placeholder="Nhập họ và tên" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="date_of_birth"
                                label="Ngày sinh"
                            >
                                <Input
                                    type="date"
                                    placeholder="Chọn ngày sinh"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item
                                name="school_name"
                                label={profile.role === 'Student' || profile.role === 'student' || profile.role === 2 ? 'Trường học' : 'Trường công tác'}
                            >
                                <Input placeholder={profile.role === 'Student' || profile.role === 'student' || profile.role === 2 ? 'Nhập tên trường học' : 'Nhập tên trường công tác'} />
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item
                                name="bio"
                                label="Giới thiệu bản thân"
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Giới thiệu về bản thân..."
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="form-actions">
                        <Space>
                            <Button onClick={() => setEditing(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" className="chemistry-btn-primary" htmlType="submit" icon={<SaveOutlined />}>
                                Lưu thay đổi
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>

            {/* Password Reset Modal */}
            <Modal
                className="chemistry-modal"
                title={
                    <div>
                        <LockOutlined style={{ marginRight: 8 }} />
                        Đổi mật khẩu
                    </div>
                }
                open={passwordModalVisible}
                onCancel={() => {
                    setPasswordModalVisible(false);
                    setForgotPasswordSent(false);
                    setPasswordMethod('change');
                    changePasswordForm.resetFields();
                    forgotPasswordForm.resetFields();
                    resetPasswordForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Tabs
                    activeKey={passwordMethod}
                    onChange={(key) => {
                        setPasswordMethod(key);
                        setForgotPasswordSent(false);
                        changePasswordForm.resetFields();
                        forgotPasswordForm.resetFields();
                        resetPasswordForm.resetFields();
                    }}
                >
                    {/* Tab 1: Change Password (Nhập mật khẩu hiện tại) */}
                    <TabPane
                        tab={
                            <span>
                                <KeyOutlined />
                                Nhập mật khẩu hiện tại
                            </span>
                        }
                        key="change"
                    >
                        <Form
                            form={changePasswordForm}
                            layout="vertical"
                            onFinish={async (values) => {
                                setPasswordLoading(true);
                                try {
                                    const result = await accountService.changePassword({
                                        currentPassword: values.currentPassword,
                                        newPassword: values.newPassword,
                                        confirmPassword: values.confirmPassword
                                    });

                                    if (result.success) {
                                        message.success(result.message || 'Đổi mật khẩu thành công');
                                        setPasswordModalVisible(false);
                                        changePasswordForm.resetFields();
                                    } else {
                                        // Map backend error messages to Vietnamese
                                        let errorMsg = result.message || 'Không thể đổi mật khẩu';
                                        if (result.message && result.message.includes('INVALID_CURRENT_PASSWORD')) {
                                            errorMsg = 'Mật khẩu hiện tại không đúng';
                                        } else if (result.message && result.message.includes('PASSWORD_NOT_STRONG_ENOUGH')) {
                                            errorMsg = 'Mật khẩu mới không đủ mạnh. Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
                                        }
                                        message.error(errorMsg);
                                    }
                                } catch (error) {
                                    console.error('Error changing password:', error);
                                    message.error('Có lỗi xảy ra khi đổi mật khẩu');
                                } finally {
                                    setPasswordLoading(false);
                                }
                            }}
                        >
                            <Form.Item
                                name="currentPassword"
                                label="Mật khẩu hiện tại"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                            >
                                <Password placeholder="Nhập mật khẩu hiện tại" />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                                    {
                                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/,
                                        message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
                                    }
                                ]}
                            >
                                <Password placeholder="Nhập mật khẩu mới" />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu mới"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                        },
                                    }),
                                ]}
                            >
                                <Password placeholder="Nhập lại mật khẩu mới" />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button onClick={() => setPasswordModalVisible(false)}>
                                        Hủy
                                    </Button>
                                    <Button type="primary" className="chemistry-btn-primary" htmlType="submit" loading={passwordLoading}>
                                        Đổi mật khẩu
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    {/* Tab 2: Forgot Password (Gửi xác nhận qua email) */}
                    <TabPane
                        tab={
                            <span>
                                <MailOutlined />
                                Gửi xác nhận qua email
                            </span>
                        }
                        key="forgot"
                    >
                        {!forgotPasswordSent ? (
                            // Step 1: Request password reset email
                            <Form
                                form={forgotPasswordForm}
                                layout="vertical"
                                onFinish={async (values) => {
                                    setPasswordLoading(true);
                                    try {
                                        const result = await accountService.forgotPassword(values.email);

                                        if (result.success) {
                                            message.success(result.message || 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
                                            setForgotPasswordSent(true);
                                            // Pre-fill email in reset form
                                            resetPasswordForm.setFieldsValue({ email: values.email });
                                        } else {
                                            let errorMsg = result.message || 'Không thể gửi email đặt lại mật khẩu';
                                            if (result.message && result.message.includes('EMAIL_NOT_FOUND')) {
                                                errorMsg = 'Không tìm thấy tài khoản với email này';
                                            } else if (result.message && result.message.includes('FAILED_TO_SEND_EMAIL')) {
                                                errorMsg = 'Không thể gửi email. Vui lòng thử lại sau.';
                                            }
                                            message.error(errorMsg);
                                        }
                                    } catch (error) {
                                        console.error('Error requesting password reset:', error);
                                        message.error('Có lỗi xảy ra khi gửi email đặt lại mật khẩu');
                                    } finally {
                                        setPasswordLoading(false);
                                    }
                                }}
                                initialValues={{
                                    email: profile?.email || ''
                                }}
                            >
                                <Alert
                                    message="Gửi xác nhận qua email"
                                    description="Chúng tôi sẽ gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam)."
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />

                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không hợp lệ' }
                                    ]}
                                >
                                    <Input placeholder="Nhập email của bạn" prefix={<MailOutlined />} />
                                </Form.Item>

                                <Form.Item>
                                    <Space>
                                        <Button onClick={() => setPasswordModalVisible(false)}>
                                            Hủy
                                        </Button>
                                        <Button type="primary" className="chemistry-btn-primary" htmlType="submit" loading={passwordLoading}>
                                            Gửi email xác nhận
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        ) : (
                            // Step 2: Reset password with token
                            <Form
                                form={resetPasswordForm}
                                layout="vertical"
                                onFinish={async (values) => {
                                    setPasswordLoading(true);
                                    try {
                                        const result = await accountService.resetPassword({
                                            email: values.email,
                                            resetToken: values.resetToken,
                                            newPassword: values.newPassword,
                                            confirmPassword: values.confirmPassword
                                        });

                                        if (result.success) {
                                            message.success(result.message || 'Đặt lại mật khẩu thành công');
                                            setPasswordModalVisible(false);
                                            setForgotPasswordSent(false);
                                            resetPasswordForm.resetFields();
                                        } else {
                                            let errorMsg = result.message || 'Không thể đặt lại mật khẩu';
                                            if (result.message && result.message.includes('INVALID_TOKEN')) {
                                                errorMsg = 'Mã xác nhận không đúng hoặc đã hết hạn';
                                            } else if (result.message && result.message.includes('PASSWORD_NOT_STRONG_ENOUGH')) {
                                                errorMsg = 'Mật khẩu mới không đủ mạnh. Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
                                            } else if (result.message && result.message.includes('RESET_PASSWORD_FEATURE_NOT_IMPLEMENTED_YET')) {
                                                errorMsg = 'Tính năng đặt lại mật khẩu qua email chưa được triển khai đầy đủ ở backend';
                                            }
                                            message.error(errorMsg);
                                        }
                                    } catch (error) {
                                        console.error('Error resetting password:', error);
                                        message.error('Có lỗi xảy ra khi đặt lại mật khẩu');
                                    } finally {
                                        setPasswordLoading(false);
                                    }
                                }}
                            >
                                <Alert
                                    message="Nhập mã xác nhận"
                                    description="Vui lòng nhập mã xác nhận đã được gửi đến email của bạn và mật khẩu mới."
                                    type="success"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />

                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không hợp lệ' }
                                    ]}
                                >
                                    <Input placeholder="Nhập email" prefix={<MailOutlined />} disabled />
                                </Form.Item>

                                <Form.Item
                                    name="resetToken"
                                    label="Mã xác nhận"
                                    rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận' }]}
                                >
                                    <Input placeholder="Nhập mã xác nhận từ email" maxLength={6} />
                                </Form.Item>

                                <Form.Item
                                    name="newPassword"
                                    label="Mật khẩu mới"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                                        {
                                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/,
                                            message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
                                        }
                                    ]}
                                >
                                    <Password placeholder="Nhập mật khẩu mới" />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    label="Xác nhận mật khẩu mới"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Password placeholder="Nhập lại mật khẩu mới" />
                                </Form.Item>

                                <Form.Item>
                                    <Space>
                                        <Button onClick={() => {
                                            setForgotPasswordSent(false);
                                            resetPasswordForm.resetFields();
                                        }}>
                                            Quay lại
                                        </Button>
                                        <Button type="primary" className="chemistry-btn-primary" htmlType="submit" loading={passwordLoading}>
                                            Đặt lại mật khẩu
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        )}
                    </TabPane>
                </Tabs>
            </Modal>
        </div>
    );
};

export default UserProfile;

