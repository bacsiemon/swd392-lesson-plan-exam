import React, { useState } from 'react';
import { Card, Table, Typography, Row, Col, Space, Tag, Badge, Select, Input, Statistic, Timeline, Avatar } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  LoginOutlined,
  LogoutOutlined,
  FileTextOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import '../styles/adminTheme.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const AdminActivityStatus = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Mock data for user accounts and their activity
  const accountsData = [
    {
      key: '1',
      userId: 'U001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      role: 'teacher',
      status: 'online',
      lastActive: '2025-10-24 17:15:00',
      loginTime: '2025-10-24 08:30:00',
      totalSessions: 45,
      activitiesCount: 128,
      location: 'Hà Nội',
    },
    {
      key: '2',
      userId: 'U002',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      role: 'student',
      status: 'online',
      lastActive: '2025-10-24 17:10:00',
      loginTime: '2025-10-24 09:00:00',
      totalSessions: 32,
      activitiesCount: 95,
      location: 'Hồ Chí Minh',
    },
    {
      key: '3',
      userId: 'U003',
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      role: 'teacher',
      status: 'idle',
      lastActive: '2025-10-24 16:30:00',
      loginTime: '2025-10-24 07:45:00',
      totalSessions: 67,
      activitiesCount: 203,
      location: 'Đà Nẵng',
    },
    {
      key: '4',
      userId: 'U004',
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      role: 'student',
      status: 'offline',
      lastActive: '2025-10-24 12:00:00',
      loginTime: '2025-10-24 08:00:00',
      totalSessions: 28,
      activitiesCount: 78,
      location: 'Hải Phòng',
    },
    {
      key: '5',
      userId: 'U005',
      name: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      role: 'student',
      status: 'online',
      lastActive: '2025-10-24 17:12:00',
      loginTime: '2025-10-24 10:15:00',
      totalSessions: 15,
      activitiesCount: 42,
      location: 'Cần Thơ',
    },
  ];

  // Mock recent activity data
  const recentActivities = [
    {
      key: '1',
      user: 'Nguyễn Văn A',
      action: 'Đã tạo giáo án mới',
      time: '5 phút trước',
      type: 'create',
    },
    {
      key: '2',
      user: 'Trần Thị B',
      action: 'Đã hoàn thành bài kiểm tra',
      time: '10 phút trước',
      type: 'complete',
    },
    {
      key: '3',
      user: 'Lê Văn C',
      action: 'Đã đăng nhập',
      time: '15 phút trước',
      type: 'login',
    },
    {
      key: '4',
      user: 'Phạm Thị D',
      action: 'Đã đăng xuất',
      time: '5 giờ trước',
      type: 'logout',
    },
    {
      key: '5',
      user: 'Hoàng Văn E',
      action: 'Đã xem bài học',
      time: '8 phút trước',
      type: 'view',
    },
  ];

  // Calculate statistics
  const totalAccounts = accountsData.length;
  const onlineUsers = accountsData.filter(user => user.status === 'online').length;
  const idleUsers = accountsData.filter(user => user.status === 'idle').length;
  const offlineUsers = accountsData.filter(user => user.status === 'offline').length;

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      online: { status: 'success', text: 'Trực tuyến', color: '#52c41a' },
      idle: { status: 'warning', text: 'Không hoạt động', color: '#faad14' },
      offline: { status: 'default', text: 'Ngoại tuyến', color: '#d9d9d9' },
    };
    const config = statusConfig[status];
    return <Badge status={config.status} text={config.text} />;
  };

  // Get role tag
  const getRoleTag = (role) => {
    const roleConfig = {
      teacher: { color: 'blue', text: 'Giáo viên' },
      student: { color: 'green', text: 'Học sinh' },
      admin: { color: 'red', text: 'Quản trị viên' },
    };
    const config = roleConfig[role];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Filter data
  const filteredData = accountsData.filter((account) => {
    const statusMatch = filterStatus === 'all' || account.status === filterStatus;
    const roleMatch = filterRole === 'all' || account.role === filterRole;
    const searchMatch =
      searchText === '' ||
      account.name.toLowerCase().includes(searchText.toLowerCase()) ||
      account.email.toLowerCase().includes(searchText.toLowerCase()) ||
      account.userId.toLowerCase().includes(searchText.toLowerCase());
    return statusMatch && roleMatch && searchMatch;
  });

  // Table columns
  const columns = [
    {
      title: 'Mã người dùng',
      dataIndex: 'userId',
      key: 'userId',
      width: '10%',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Thông tin người dùng',
      key: 'userInfo',
      width: '25%',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.status === 'online' ? '#52c41a' : '#d9d9d9' }} />
            <div>
              <Text strong>{record.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
            </div>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: '12%',
      align: 'center',
      render: (role) => getRoleTag(role),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Hoạt động gần nhất',
      dataIndex: 'lastActive',
      key: 'lastActive',
      width: '15%',
      render: (time) => (
        <Space>
          <ClockCircleOutlined />
          <Text style={{ fontSize: '12px' }}>{new Date(time).toLocaleString('vi-VN')}</Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.lastActive) - new Date(b.lastActive),
    },
    {
      title: 'Số hoạt động',
      dataIndex: 'activitiesCount',
      key: 'activitiesCount',
      width: '10%',
      align: 'center',
      render: (count) => <Badge count={count} showZero style={{ backgroundColor: '#1890ff' }} />,
      sorter: (a, b) => a.activitiesCount - b.activitiesCount,
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: '13%',
      render: (location) => <Text type="secondary">{location}</Text>,
    },
  ];

  // Activity icon
  const getActivityIcon = (type) => {
    const icons = {
      create: <FileTextOutlined style={{ color: '#1890ff' }} />,
      complete: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      login: <LoginOutlined style={{ color: '#722ed1' }} />,
      logout: <LogoutOutlined style={{ color: '#f5222d' }} />,
      view: <EyeOutlined style={{ color: '#faad14' }} />,
    };
    return icons[type] || <ClockCircleOutlined />;
  };

  return (
    <div className="admin-page" style={{ position: 'relative', padding: '24px' }}>
      {/* Background decoration */}
      <div className="admin-alert-bg"></div>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#c92a2a', margin: 0 }}>
          <TeamOutlined /> Trạng thái hoạt động tài khoản
        </Title>
        <Text type="secondary">Theo dõi và giám sát hoạt động của người dùng trong hệ thống</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="admin-card">
            <Statistic
              title="Tổng tài khoản"
              value={totalAccounts}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="admin-card">
            <Statistic
              title="Đang trực tuyến"
              value={onlineUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="admin-card">
            <Statistic
              title="Không hoạt động"
              value={idleUsers}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="admin-card">
            <Statistic
              title="Ngoại tuyến"
              value={offlineUsers}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Account Table */}
        <Col xs={24} lg={16}>
          <Card 
            className="admin-card"
            title={
              <Space>
                <UserOutlined />
                <span>Danh sách tài khoản</span>
              </Space>
            }
          >
            {/* Filters */}
            <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }} size="middle">
              <Search
                placeholder="Tìm kiếm theo tên, email, mã..."
                allowClear
                style={{ width: 300 }}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 180 }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="online">Trực tuyến</Option>
                <Option value="idle">Không hoạt động</Option>
                <Option value="offline">Ngoại tuyến</Option>
              </Select>
              <Select
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả vai trò</Option>
                <Option value="teacher">Giáo viên</Option>
                <Option value="student">Học sinh</Option>
              </Select>
            </Space>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} tài khoản`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={8}>
          <Card
            className="admin-card"
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Hoạt động gần đây</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Timeline
              items={recentActivities.map((activity) => ({
                dot: getActivityIcon(activity.type),
                children: (
                  <Space direction="vertical" size="small">
                    <Text strong>{activity.user}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {activity.action}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      <ClockCircleOutlined /> {activity.time}
                    </Text>
                  </Space>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminActivityStatus;
