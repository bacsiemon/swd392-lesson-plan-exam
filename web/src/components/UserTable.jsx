import React from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Popconfirm,
  Empty,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const UserTable = ({ 
  users, 
  filters, 
  onEdit, 
  onDelete, 
  onAddUser 
}) => {
  // Table columns
  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff', marginRight: 8 }}
            />
            <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.email}
          </Text>
        </div>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={role === 'teacher' ? 'blue' : 'green'} icon={role === 'teacher' ? <BookOutlined /> : <TeamOutlined />}>
          {role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
        </Tag>
      ),
      filters: [
        { text: 'Giáo viên', value: 'teacher' },
        { text: 'Học sinh', value: 'student' }
      ],
      filteredValue: filters.role !== undefined ? [filters.role] : null
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} của ${total} người dùng`,
        pageSizeOptions: ['10', '20', '50']
      }}
      scroll={{ x: 800 }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có người dùng nào"
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={onAddUser}>
              Thêm người dùng đầu tiên
            </Button>
          </Empty>
        )
      }}
    />
  );
};

export default UserTable;
