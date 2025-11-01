import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Select,
  Input,
  Tooltip,
  Typography,
  Popconfirm,
  Statistic,
  Empty,
  Badge,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TableOutlined,
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import '../styles/chemistryTheme.css';

const { Title, Text } = Typography;
const { Option } = Select;

const ExamMatrixManagement = () => {
  const [loading, setLoading] = useState(false);
  const [examMatrixes, setExamMatrixes] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ma trận`
  });

  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Mock data for demonstration
  const mockData = [
    {
      id: 1,
      name: 'Ma trận đề Hóa học lớp 10 - HK1',
      subject: 'Hóa học',
      gradeLevel: 'Lớp 10',
      totalQuestions: 30,
      createdBy: 'Nguyễn Văn A',
      createdAt: '2024-10-01',
      status: 'active'
    },
    {
      id: 2,
      name: 'Ma trận đề Hóa học lớp 11 - HK2', 
      subject: 'Hóa học',
      gradeLevel: 'Lớp 11',
      totalQuestions: 25,
      createdBy: 'Trần Thị B',
      createdAt: '2024-10-03',
      status: 'draft'
    }
  ];

  useEffect(() => {
    fetchExamMatrixes();
  }, []);

  const fetchExamMatrixes = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setExamMatrixes(mockData);
        setPagination(prev => ({ ...prev, total: mockData.length }));
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setIsFormModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsFormModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      message.success('Xóa ma trận đề thành công');
      fetchExamMatrixes();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handleFormSubmit = () => {
    message.success(editingRecord ? 'Cập nhật ma trận đề thành công' : 'Tạo ma trận đề thành công');
    setIsFormModalVisible(false);
    fetchExamMatrixes();
  };

  const getStatusTag = (status) => {
    const statusMap = {
      active: { color: 'success', text: 'Đang sử dụng' },
      draft: { color: 'default', text: 'Bản nháp' },
      archived: { color: 'warning', text: 'Lưu trữ' }
    };
    
    const config = statusMap[status] || statusMap.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Tên ma trận',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#1890ff' }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.subject} - {record.gradeLevel}
          </Text>
        </div>
      ),
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      width: 120,
      align: 'center',
      render: (count) => <Badge count={count} showZero color="#52c41a" />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 130,
      render: (name) => (
        <div style={{ textAlign: 'center' }}>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {name.charAt(name.length - 1)}
          </Avatar>
          <br />
          <Text style={{ fontSize: '12px' }}>{name}</Text>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => <Text style={{ fontSize: '12px' }}>{date}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa ma trận này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      {/* Header */}
      <Card className="chemistry-header-card" style={{ marginBottom: '24px' }}>
        <Title level={2} className="chemistry-title" style={{ margin: 0 }}>
          <ExperimentOutlined />
          Quản lý Ma trận Đề thi
        </Title>
        <Text className="chemistry-subtitle">Tạo và quản lý ma trận đề thi hóa học</Text>
      </Card>

      {/* Main Content Card */}
      <Card className="chemistry-card">
        {/* Filters and Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm ma trận..."
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Select placeholder="Khối lớp" allowClear style={{ width: '100%' }}>
              <Option value="10">Lớp 10</Option>
              <Option value="11">Lớp 11</Option>
              <Option value="12">Lớp 12</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Select placeholder="Trạng thái" allowClear style={{ width: '100%' }}>
              <Option value="active">Đang sử dụng</Option>
              <Option value="draft">Bản nháp</Option>
              <Option value="archived">Lưu trữ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button icon={<FilterOutlined />}>Đặt lại</Button>
              <Button
                type="primary"
                className="chemistry-btn-primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Tạo ma trận đề
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <div className="chemistry-table">
          <Table
            columns={columns}
            dataSource={examMatrixes}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <Empty
                  className="chemistry-empty"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có ma trận đề nào"
                />
              ),
            }}
          />
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        className="chemistry-modal"
        title={editingRecord ? 'Chỉnh sửa ma trận đề' : 'Tạo ma trận đề mới'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div style={{ padding: '20px 0' }}>
          <Text>Form tạo ma trận đề sẽ được implement ở đây</Text>
          <br />
          <Button 
            type="primary"
            className="chemistry-btn-primary"
            onClick={handleFormSubmit}
            style={{ marginTop: '16px' }}
          >
            {editingRecord ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ExamMatrixManagement;