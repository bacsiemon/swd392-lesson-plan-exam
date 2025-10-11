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
  BookOutlined,
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { questionBankService } from '../services/questionBankService';
import {
  CHEMISTRY_GRADES,
  APPROVAL_STATUS_LABELS,
  DEFAULT_PAGINATION
} from '../constants/questionBankConstants';
import QuestionBankForm from '../components/QuestionBankForm';
import QuestionManagement from '../components/QuestionManagement';

const { Title, Text } = Typography;
const { Option } = Select;

const QuestionBankManagement = () => {
  const [loading, setLoading] = useState(false);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState({
    gradeLevel: undefined,
    status: undefined,
    search: ''
  });

  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedQuestionBank, setSelectedQuestionBank] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // Fetch question banks
  const fetchQuestionBanks = async (params = {}) => {
    setLoading(true);
    try {
      const result = await questionBankService.getQuestionBanks({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
        ...params
      });

      if (result.success) {
        setQuestionBanks(result.data);
        setPagination(prev => ({
          ...prev,
          ...result.pagination
        }));

        // Calculate statistics
        await calculateStats();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      // Get all question banks for statistics
      const result = await questionBankService.getQuestionBanks({
        page: 1,
        pageSize: 1000 // Get all
      });

      if (result.success) {
        const allBanks = result.data;
        const newStats = {
          total: allBanks.length,
          approved: allBanks.filter(bank => bank.statusEnum === 1).length,
          pending: allBanks.filter(bank => bank.statusEnum === 0).length,
          rejected: allBanks.filter(bank => bank.statusEnum === 2).length
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  // Handle table actions
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
      const result = await questionBankService.deleteQuestionBank(id);
      if (result.success) {
        message.success(result.message);
        fetchQuestionBanks();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handleViewQuestions = (record) => {
    setSelectedQuestionBank(record);
    setIsQuestionModalVisible(true);
  };

  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      let result;
      if (editingRecord) {
        result = await questionBankService.updateQuestionBank(editingRecord.id, values);
      } else {
        result = await questionBankService.createQuestionBank(values);
      }

      if (result.success) {
        message.success(result.message);
        setIsFormModalVisible(false);
        fetchQuestionBanks();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchQuestionBanks({ ...newFilters, page: 1 });
  };

  // Handle pagination change
  const handleTableChange = (paginationData) => {
    setPagination(paginationData);
    fetchQuestionBanks({
      page: paginationData.current,
      pageSize: paginationData.pageSize
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      gradeLevel: undefined,
      status: undefined,
      search: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchQuestionBanks({ page: 1 });
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusInfo = APPROVAL_STATUS_LABELS.find(s => s.value === status);
    if (!statusInfo) return null;

    const icons = {
      0: <ClockCircleOutlined />,
      1: <CheckCircleOutlined />,
      2: <ExclamationCircleOutlined />
    };

    return (
      <Tag color={statusInfo.color} icon={icons[status]}>
        {statusInfo.label}
      </Tag>
    );
  };

  // Get grade label
  const getGradeLabel = (gradeLevel) => {
    const grade = CHEMISTRY_GRADES.find(g => g.value === gradeLevel);
    return grade ? grade.label : `Lớp ${gradeLevel}`;
  };

  // Table columns
  const columns = [
    {
      title: 'Ngân hàng câu hỏi',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Avatar
              size="small"
              icon={<BookOutlined />}
              style={{ backgroundColor: '#1890ff', marginRight: 8 }}
            />
            <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description?.length > 100
              ? `${record.description.substring(0, 100)}...`
              : record.description
            }
          </Text>
        </div>
      )
    },
    {
      title: 'Lớp',
      dataIndex: 'gradeLevel',
      key: 'gradeLevel',
      width: 100,
      render: (gradeLevel) => (
        <Tag color="blue" icon={<BookOutlined />}>
          {getGradeLabel(gradeLevel)}
        </Tag>
      ),
      filters: CHEMISTRY_GRADES.map(grade => ({
        text: grade.label,
        value: grade.value
      })),
      filteredValue: filters.gradeLevel !== undefined ? [filters.gradeLevel] : null
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: 120,
      render: (count) => (
        <Badge
          count={count || 0}
          style={{ backgroundColor: '#52c41a' }}
          overflowCount={999}
        >
          <QuestionCircleOutlined style={{ fontSize: 16 }} />
        </Badge>
      ),
      sorter: (a, b) => (a.questionCount || 0) - (b.questionCount || 0)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'statusEnum',
      key: 'statusEnum',
      width: 120,
      render: getStatusLabel,
      filters: APPROVAL_STATUS_LABELS.map(status => ({
        text: status.label,
        value: status.value
      })),
      filteredValue: filters.status !== undefined ? [filters.status] : null
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Quản lý câu hỏi">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewQuestions(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa ngân hàng câu hỏi"
            description="Bạn có chắc muốn xóa ngân hàng này? Tất cả câu hỏi bên trong cũng sẽ bị xóa."
            onConfirm={() => handleDelete(record.id)}
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
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BookOutlined style={{ fontSize: 32, color: '#1890ff', marginRight: 16 }} />
              <div>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  Quản lý Ngân hàng Câu hỏi Hóa học
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Tạo và quản lý ngân hàng câu hỏi cho các lớp từ 8 đến 12
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
              style={{ height: 48, fontSize: '16px' }}
            >
              Tạo ngân hàng mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng ngân hàng"
              value={stats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Bị từ chối"
              value={stats.rejected}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              placeholder="Lọc theo lớp học"
              allowClear
              style={{ width: '100%' }}
              value={filters.gradeLevel}
              onChange={(value) => handleFilterChange('gradeLevel', value)}
            >
              {CHEMISTRY_GRADES.map(grade => (
                <Option key={grade.value} value={grade.value}>
                  <BookOutlined style={{ marginRight: 8 }} />
                  {grade.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              {APPROVAL_STATUS_LABELS.map(status => (
                <Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={10}>
            <Input
              placeholder="Tìm kiếm theo tên ngân hàng hoặc mô tả..."
              prefix={<SearchOutlined />}
              allowClear
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Col>
          <Col span={2}>
            <Button
              icon={<FilterOutlined />}
              onClick={resetFilters}
              title="Xóa bộ lọc"
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={questionBanks}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} ngân hàng câu hỏi`,
            pageSizeOptions: ['10', '20', '50']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có ngân hàng câu hỏi nào"
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  Tạo ngân hàng đầu tiên
                </Button>
              </Empty>
            )
          }}
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={null}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        <QuestionBankForm
          initialValues={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalVisible(false)}
        />
      </Modal>

      {/* Question Management Modal */}
      <Modal
        title={null}
        open={isQuestionModalVisible}
        onCancel={() => setIsQuestionModalVisible(false)}
        footer={null}
        width="95%"
        style={{ top: 20 }}
        destroyOnClose
      >
        {selectedQuestionBank && (
          <QuestionManagement questionBank={selectedQuestionBank} />
        )}
      </Modal>
    </div>
  );
};

export default QuestionBankManagement;