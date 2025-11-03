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
    Alert
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
    ExperimentOutlined
} from '@ant-design/icons';
import accountService from '../services/accountService';
import '../styles/chemistryTheme.css';
import '../styles/TeacherProfile.css';

const { Title, Text, Paragraph } = Typography;

// Universal Profile component for both students and teachers
const TeacherProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [uploading] = useState(false);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();

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
                        <Button
                            type="primary"
                            className="chemistry-btn-primary"
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                            size="large"
                        >
                            Chỉnh sửa hồ sơ
                        </Button>
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
                                    {profile.phone}
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

                        {/* School */}
                        {profile.school_name && (
                            <Col xs={24}>
                                <div className="info-item">
                                    <div className="info-label">
                                        <HomeOutlined className="info-icon" />
                                        <span>Trường công tác</span>
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
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="date_of_birth"
                                label="Ngày sinh"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
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
                                label="Trường công tác"
                                rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
                            >
                                <Input placeholder="Nhập tên trường công tác" />
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item
                                name="bio"
                                label="Giới thiệu bản thân"
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Giới thiệu về bản thân, kinh nghiệm giảng dạy..."
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
        </div>
    );
};

export default TeacherProfile;