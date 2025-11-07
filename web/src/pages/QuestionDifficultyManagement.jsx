import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Row,
  Col,
  Select,
  Input,
  message,
  Empty,
  Form,
  Modal,
  Popconfirm,
  Tag,
  Space,
  Typography,
  InputNumber
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import questionDifficultyService from '../services/questionDifficultyService';
import '../styles/chemistryTheme.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const QuestionDifficultyManagement = () => {
  const [loading, setLoading] = useState(false);
  const [questionDifficulties, setQuestionDifficulties] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} độ khó`
  });

  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [domainFilter, setDomainFilter] = useState('');
  const [difficultyLevelFilter, setDifficultyLevelFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestionDifficulties();
  }, [pagination.current, pagination.pageSize, domainFilter, difficultyLevelFilter]);

  const fetchQuestionDifficulties = async () => {
    setLoading(true);
    try {
      const result = await questionDifficultyService.getAllQuestionDifficulties({
        domain: domainFilter || undefined,
        difficultyLevel: difficultyLevelFilter || undefined,
        page: pagination.current,
        size: pagination.pageSize
      });

      console.log('QuestionDifficultyManagement - Fetch result:', result);
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        console.log('QuestionDifficultyManagement - Parsed data:', data);
        console.log('QuestionDifficultyManagement - Data length:', data.length);
        
        // Filter by search term if provided
        let filteredData = data;
        if (searchTerm && searchTerm.trim() !== '') {
          const searchLower = searchTerm.toLowerCase();
          filteredData = data.filter(item => {
            // Handle both camelCase and PascalCase
            const domain = (item.domain || item.Domain || '').toLowerCase();
            const description = (item.description || item.Description || '').toLowerCase();
            return domain.includes(searchLower) || description.includes(searchLower);
          });
        }
        
        setQuestionDifficulties(filteredData);
        setPagination(prev => ({ ...prev, total: filteredData.length }));
      } else {
        console.error('Failed to fetch question difficulties:', result);
        message.error(result.message || 'Có lỗi xảy ra khi tải dữ liệu');
        setQuestionDifficulties([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('Error fetching question difficulties:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
      setQuestionDifficulties([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsFormModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    // Map backend response to form fields
    // Handle both camelCase and PascalCase
    form.setFieldsValue({
      domain: record.domain || record.Domain || '',
      difficultyLevel: record.difficultyLevel !== undefined 
        ? record.difficultyLevel 
        : (record.DifficultyLevel !== undefined ? record.DifficultyLevel : 1),
      description: record.description || record.Description || ''
    });
    setIsFormModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await questionDifficultyService.deleteQuestionDifficulty(id);
      if (result.success) {
        message.success(result.message || 'Xóa độ khó thành công');
        fetchQuestionDifficulties();
      } else {
        const errorMsg = result.message || result.error || 'Có lỗi xảy ra khi xóa';
        if (errorMsg.includes('IN_USE') || errorMsg.includes('in use')) {
          message.error('Không thể xóa độ khó này vì đang được sử dụng bởi các câu hỏi');
        } else {
          message.error(errorMsg);
        }
      }
    } catch (error) {
      console.error('Error deleting question difficulty:', error);
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingRecord) {
        // Update
        const result = await questionDifficultyService.updateQuestionDifficulty(
          editingRecord.Id || editingRecord.id,
          values
        );
        
        if (result.success) {
          message.success(result.message || 'Cập nhật độ khó thành công');
          setIsFormModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
          fetchQuestionDifficulties();
        } else {
          message.error(result.message || 'Có lỗi xảy ra khi cập nhật');
        }
      } else {
        // Create
        const result = await questionDifficultyService.createQuestionDifficulty(values);
        
        if (result.success) {
          message.success(result.message || 'Tạo độ khó thành công');
          setIsFormModalVisible(false);
          form.resetFields();
          fetchQuestionDifficulties();
        } else {
          message.error(result.message || 'Có lỗi xảy ra khi tạo');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.errorFields) {
        // Form validation errors
        return;
      }
      message.error('Có lỗi xảy ra khi xử lý');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsFormModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleResetFilters = () => {
    setDomainFilter('');
    setDifficultyLevelFilter(null);
    setSearchTerm('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchQuestionDifficulties();
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  // Get unique domains for filter - handle both camelCase and PascalCase
  const uniqueDomains = [...new Set(questionDifficulties.map(item => 
    item.domain || item.Domain || ''
  ).filter(Boolean))];

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id, record) => record.id || record.Id || '-'
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (domain, record) => {
        // Handle both camelCase and PascalCase
        const domainValue = record.domain || record.Domain || '';
        return domainValue ? <Tag color="blue">{domainValue}</Tag> : '-';
      }
    },
    {
      title: 'Mức độ khó',
      dataIndex: 'difficultyLevel',
      key: 'difficultyLevel',
      width: 120,
      render: (level, record) => {
        // Handle both camelCase and PascalCase
        const levelValue = record.difficultyLevel !== undefined 
          ? record.difficultyLevel 
          : (record.DifficultyLevel !== undefined ? record.DifficultyLevel : '-');
        
        let color = 'default';
        if (levelValue === 1) color = 'green';
        else if (levelValue === 2) color = 'orange';
        else if (levelValue === 3) color = 'red';
        else if (levelValue >= 4) color = 'purple';
        
        return <Tag color={color}>Mức {levelValue}</Tag>;
      }
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description, record) => {
        // Handle both camelCase and PascalCase
        const desc = record.description || record.Description || '';
        return desc || '-';
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        // Handle both camelCase and PascalCase
        const id = record.id || record.Id;
        return (
          <Space size="small">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa độ khó"
              description="Bạn có chắc muốn xóa độ khó này? Nếu đang được sử dụng bởi câu hỏi, sẽ không thể xóa."
              onConfirm={() => handleDelete(id)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      
      {/* Header */}
      <Card className="chemistry-card" style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <ExperimentOutlined /> Quản lý độ khó câu hỏi
            </Title>
            <Text type="secondary">Quản lý các mức độ khó cho câu hỏi Hóa học</Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreate}
            >
              Tạo độ khó mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Content Card */}
      <Card className="chemistry-card">
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Input
              placeholder="Tìm kiếm theo domain hoặc mô tả..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              onPressEnter={fetchQuestionDifficulties}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Select
              placeholder="Lọc theo Domain"
              allowClear
              style={{ width: '100%' }}
              value={domainFilter || undefined}
              onChange={(value) => {
                setDomainFilter(value || '');
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
            >
              {uniqueDomains.map(domain => (
                <Option key={domain} value={domain}>
                  {domain}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Select
              placeholder="Lọc theo mức độ"
              allowClear
              style={{ width: '100%' }}
              value={difficultyLevelFilter || undefined}
              onChange={(value) => {
                setDifficultyLevelFilter(value || null);
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
            >
              <Option value={1}>Mức 1 - Dễ</Option>
              <Option value={2}>Mức 2 - Trung bình</Option>
              <Option value={3}>Mức 3 - Khó</Option>
              <Option value={4}>Mức 4 - Rất khó</Option>
              <Option value={5}>Mức 5 - Cực khó</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={handleResetFilters}
              style={{ width: '100%' }}
            >
              Đặt lại
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <div className="chemistry-table">
          <Table
            columns={columns}
            dataSource={questionDifficulties}
            rowKey={(record) => record.id || record.Id || 'id'}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <Empty
                  className="chemistry-empty"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có độ khó nào"
                />
              ),
            }}
          />
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        title={editingRecord ? 'Chỉnh sửa độ khó' : 'Tạo độ khó mới'}
        open={isFormModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        confirmLoading={submitting}
        width={600}
        okText={editingRecord ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            difficultyLevel: 1
          }}
        >
          <Form.Item
            label="Domain"
            name="domain"
            rules={[
              { required: true, message: 'Vui lòng nhập domain' },
              { max: 100, message: 'Domain không được quá 100 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: Organic Chemistry, Inorganic Chemistry..." />
          </Form.Item>

          <Form.Item
            label="Mức độ khó"
            name="difficultyLevel"
            rules={[
              { required: true, message: 'Vui lòng chọn mức độ khó' },
              { type: 'number', min: 1, max: 10, message: 'Mức độ khó phải từ 1 đến 10' }
            ]}
          >
            <InputNumber
              min={1}
              max={10}
              style={{ width: '100%' }}
              placeholder="Nhập mức độ khó (1-10)"
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { max: 1000, message: 'Mô tả không được quá 1000 ký tự' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về mức độ khó này..."
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionDifficultyManagement;

