import React, { useState } from 'react';
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
    Upload
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
    LoadingOutlined
} from '@ant-design/icons';
import './TeacherProfile.css';

const { Title, Text, Paragraph } = Typography;

// Mock data đơn giản 
const mockProfile = {
    avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face",
    full_name: "Lê Thị Hương",
    email: "le.thi.huong@chemistry.edu.vn",
    phone: "+84 987 654 321",
    date_of_birth: "1985-06-15",
    school_name: "Trường THPT Chuyên Lê Hồng Phong",
    bio: "Giáo viên Hóa học với 8 năm kinh nghiệm giảng dạy. Chuyên môn về Hóa vô cơ và Hóa phân tích."
};

const TeacherProfile = () => {
    const [profile] = useState(mockProfile);
    const [loading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [uploading] = useState(false);
    const [form] = Form.useForm();

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
        console.log('Save profile:', values);
        setEditing(false);
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
            <div className="teacher-profile-container">
                <Card className="profile-card">
                    <Skeleton avatar active paragraph={{ rows: 6 }} />
                </Card>
            </div>
        );
    }

    return (
        <div className="teacher-profile-container">
            <div className="profile-header">
                <Title level={2} className="page-title">
                    <UserOutlined /> Hồ Sơ Cá Nhân
                </Title>
                <Text className="page-subtitle">
                    Quản lý thông tin cá nhân và cài đặt tài khoản
                </Text>
            </div>

            <Card className="profile-card" loading={loading}>
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

                        {/* School */}
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
                    </Row>
                </div>
            </Card>

            {/* Edit Modal */}
            <Modal
                title="Chỉnh sửa hồ sơ"
                open={editing}
                onCancel={() => setEditing(false)}
                footer={null}
                width={600}
                className="edit-profile-modal"
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
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
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