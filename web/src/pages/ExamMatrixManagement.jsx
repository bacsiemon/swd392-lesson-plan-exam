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
  Avatar,
  Form,
  InputNumber
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
import examMatrixService from '../services/examMatrixService';
import '../styles/chemistryTheme.css';
import api from '../services/axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Helper function to get current user ID from JWT token
const getCurrentTeacherId = async () => {
  try {
    // Try to get from API
    const response = await api.get('/api/account/profile');
    if (response.data?.data?.id || response.data?.data?.Id) {
      return response.data.data.id || response.data.data.Id;
    }
    // Fallback: decode JWT token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      // Try different claim names that might contain user ID
      const userId = decoded.userId || decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.id;
      return parseInt(userId) || 1;
    }
  } catch (error) {
    console.error('Error getting current teacher ID:', error);
  }
  return 1; // Default fallback
};

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
  const [form] = Form.useForm();
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load current teacher ID first, then fetch exam matrices
    const loadData = async () => {
      const teacherId = await getCurrentTeacherId();
      setCurrentTeacherId(teacherId);
      // Fetch exam matrices after teacherId is loaded
      await fetchExamMatrixes();
    };
    loadData();
  }, []);

  // Fetch exam matrices when currentTeacherId changes (if needed)
  useEffect(() => {
    if (currentTeacherId) {
      // Optionally refetch when teacherId is loaded
      // Uncomment if you want to refetch when teacherId changes
      // fetchExamMatrixes();
    }
  }, [currentTeacherId]);

  const fetchExamMatrixes = async () => {
    setLoading(true);
    try {
      // Optionally filter by current teacher
      const filters = currentTeacherId ? { teacherId: currentTeacherId } : {};
      const result = await examMatrixService.getAllExamMatrices(filters);
      
      if (result.success) {
        // Backend returns array directly: IEnumerable<ExamMatrixResponse>
        // response.data should be an array
        let data = [];
        
        if (Array.isArray(result.data)) {
          data = result.data;
        } else if (result.data && typeof result.data === 'object') {
          // Handle wrapped response (BaseResponse or similar)
          if (Array.isArray(result.data.data)) {
            data = result.data.data;
          } else if (result.data.items && Array.isArray(result.data.items)) {
            data = result.data.items;
          } else {
            // Single object, convert to array
            data = [result.data];
          }
        }
        
        console.log('Fetched exam matrices:', data);
        setExamMatrixes(data);
        setPagination(prev => ({ ...prev, total: data.length }));
      } else {
        console.error('Failed to fetch exam matrices:', result);
        message.error(result.message || 'Có lỗi xảy ra khi tải dữ liệu');
        setExamMatrixes([]);
      }
    } catch (error) {
      console.error('Error fetching exam matrices:', error);
      console.error('Error response:', error.response?.data);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
      setExamMatrixes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    // Set teacherId in form
    if (currentTeacherId) {
      form.setFieldsValue({ 
        teacherId: currentTeacherId
      });
    }
    setIsFormModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    // Map backend response to form fields (convert PascalCase to camelCase)
    form.setFieldsValue({
      name: record.Name || record.name || '',
      description: record.Description || record.description || '',
      teacherId: record.TeacherId || record.teacherId || currentTeacherId,
      totalQuestions: record.TotalQuestions || record.totalQuestions || null,
      totalPoints: record.TotalPoints || record.totalPoints || null,
      configuration: record.Configuration || record.configuration || null
    });
    setIsFormModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await examMatrixService.deleteExamMatrix(id);
      if (result.success) {
        message.success(result.message || 'Xóa ma trận đề thành công');
        fetchExamMatrixes();
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error('Error deleting exam matrix:', error);
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handleFormSubmit = async () => {
    try {
      setSubmitting(true);
      // Validate form
      await form.validateFields();
      
      // Get form values
      const formValues = form.getFieldsValue();
      
      // Prepare data according to BE format
      // Order: name, description, teacherId, totalQuestions, totalPoints, configuration
      // teacherId is automatically set from currentTeacherId, not from form
      // configuration: if empty or null, send null; otherwise send the value
      const configValue = formValues.configuration;
      const configuration = (configValue === null || configValue === undefined || configValue === '' || configValue === 'null' || (typeof configValue === 'string' && configValue.trim() === ''))
        ? null  // Send null if empty
        : (typeof configValue === 'string' ? configValue : String(configValue));  // Send the value if provided
      
      const formData = {
        name: formValues.name || '',
        description: formValues.description || '',
        teacherId: currentTeacherId || formValues.teacherId || 1, // Auto-fill from token
        totalQuestions: formValues.totalQuestions || null,
        totalPoints: formValues.totalPoints || null,
        configuration: configuration
      };

      let result;
      if (editingRecord) {
        // Update existing exam matrix
        const id = editingRecord.Id || editingRecord.id;
        result = await examMatrixService.updateExamMatrix(id, formData);
      } else {
        // Create new exam matrix
        result = await examMatrixService.createExamMatrix(formData);
      }

      if (result.success) {
        message.success(result.message || (editingRecord ? 'Cập nhật ma trận đề thành công' : 'Tạo ma trận đề thành công'));
        setIsFormModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        fetchExamMatrixes();
      } else {
        message.error(result.message || (editingRecord ? 'Cập nhật ma trận đề thất bại' : 'Tạo ma trận đề thất bại'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.errorFields) {
        // Form validation errors
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      } else {
        message.error('Có lỗi xảy ra khi lưu ma trận đề');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsFormModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
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
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={async () => {
                try {
                  const result = await examMatrixService.getExamMatrixById(record.id);
                  if (result.success) {
                    // TODO: Show detail modal or navigate to detail page
                    message.info('Xem chi tiết ma trận đề');
                    console.log('Exam matrix details:', result.data);
                  } else {
                    message.error(result.message || 'Không thể lấy thông tin chi tiết');
                  }
                } catch (error) {
                  console.error('Error getting exam matrix details:', error);
                  message.error('Có lỗi xảy ra khi lấy thông tin chi tiết');
                }
              }}
            />
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
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="chemistry-btn-primary"
            loading={submitting}
            onClick={handleFormSubmit}
          >
            {editingRecord ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        ]}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="Tên ma trận đề"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên ma trận đề' },
              { max: 255, message: 'Tên ma trận đề không được vượt quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: Chemistry Grade 10 Exam" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Ví dụ: Random exam matrix for chemistry"
            />
          </Form.Item>

          {/* Hidden teacherId field - automatically filled from token */}
          <Form.Item
            name="teacherId"
            hidden
            rules={[
              { required: true, message: 'Teacher ID là bắt buộc' },
              { type: 'number', message: 'Teacher ID phải là số' }
            ]}
          >
            <InputNumber style={{ display: 'none' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tổng số câu hỏi"
                name="totalQuestions"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="50"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tổng điểm"
                name="totalPoints"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="100"
                  min={0}
                  step={0.1}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Configuration field - optional JSON string */}
          <Form.Item
            label="Cấu hình (JSON)"
            name="configuration"
            tooltip="Cấu hình chi tiết của ma trận đề dưới dạng JSON string (tùy chọn). Để trống sẽ gửi null."
          >
            <TextArea
              rows={4}
              placeholder='Ví dụ: {"timeLimit": 60, "randomizeOrder": true} hoặc để trống'
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamMatrixManagement;