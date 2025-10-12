import React, { useState, useEffect } from 'react';
import {
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
  Card,
  Statistic,
  Empty,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { questionService } from '../services/questionBankService';
import {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  DEFAULT_PAGINATION
} from '../constants/questionBankConstants';
import QuestionForm from './QuestionForm';
import QuestionPreview from './QuestionPreview';

const { Title, Text } = Typography;
const { Option } = Select;

const QuestionManagement = ({ questionBank }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState({
    questionType: undefined,
    difficulty: undefined,
    search: ''
  });

  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [previewingRecord, setPreviewingRecord] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    multipleChoice: 0,
    fillBlank: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });

  // Fetch questions
  const fetchQuestions = async (params = {}) => {
    setLoading(true);
    try {
      const result = await questionService.getQuestions(questionBank.id, {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
        ...params
      });

      if (result.success) {
        setQuestions(result.data);
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
      // Get all questions for statistics (not paginated)
      const result = await questionService.getQuestions(questionBank.id, {
        page: 1,
        pageSize: 1000 // Get all questions
      });

      if (result.success) {
        const allQuestions = result.data;
        const newStats = {
          total: allQuestions.length,
          multipleChoice: allQuestions.filter(q => q.questionTypeEnum === 0).length,
          fillBlank: allQuestions.filter(q => q.questionTypeEnum === 1).length,
          easy: allQuestions.filter(q => q.questionDifficultyId === 1).length,
          medium: allQuestions.filter(q => q.questionDifficultyId === 2).length,
          hard: allQuestions.filter(q => q.questionDifficultyId === 3).length
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    if (questionBank?.id) {
      fetchQuestions();
    }
  }, [questionBank?.id]);

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
      const result = await questionService.deleteQuestion(id);
      if (result.success) {
        message.success(result.message);
        fetchQuestions();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handlePreview = (record) => {
    setPreviewingRecord(record);
    setIsPreviewModalVisible(true);
  };

  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      const questionData = {
        ...values,
        questionBankId: questionBank.id
      };

      let result;
      if (editingRecord) {
        result = await questionService.updateQuestion(editingRecord.id, questionData);
      } else {
        result = await questionService.createQuestion(questionData);
      }

      if (result.success) {
        message.success(result.message);
        setIsFormModalVisible(false);
        fetchQuestions();
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
    fetchQuestions({ ...newFilters, page: 1 });
  };

  // Handle pagination change
  const handleTableChange = (paginationData) => {
    setPagination(paginationData);
    fetchQuestions({
      page: paginationData.current,
      pageSize: paginationData.pageSize
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      questionType: undefined,
      difficulty: undefined,
      search: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchQuestions({ page: 1 });
  };

  // Get question type label
  const getQuestionTypeLabel = (type) => {
    const typeInfo = QUESTION_TYPES.find(t => t.value === type);
    return typeInfo ? (
      <Tag color={type === 0 ? 'blue' : 'green'}>{typeInfo.label}</Tag>
    ) : null;
  };

  // Get difficulty label
  const getDifficultyLabel = (difficultyId) => {
    const difficulty = DIFFICULTY_LEVELS.find(d => d.value === difficultyId);
    return difficulty ? (
      <Tag color={difficulty.color}>{difficulty.label}</Tag>
    ) : null;
  };

  // Table columns
  const columns = [
    {
      title: 'Câu hỏi',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          <br />
          <Text type="secondary" ellipsis style={{ fontSize: '12px' }}>
            {record.content?.length > 100
              ? `${record.content.substring(0, 100)}...`
              : record.content
            }
          </Text>
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'questionTypeEnum',
      key: 'questionTypeEnum',
      width: 120,
      render: getQuestionTypeLabel,
      filters: QUESTION_TYPES.map(type => ({
        text: type.label,
        value: type.value
      })),
      filteredValue: filters.questionType !== undefined ? [filters.questionType] : null
    },
    {
      title: 'Độ khó',
      dataIndex: 'questionDifficultyId',
      key: 'questionDifficultyId',
      width: 100,
      render: getDifficultyLabel,
      filters: DIFFICULTY_LEVELS.map(level => ({
        text: level.label,
        value: level.value
      })),
      filteredValue: filters.difficulty !== undefined ? [filters.difficulty] : null
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Kích hoạt' : 'Tạm dừng'}
        </Tag>
      )
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
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem trước">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa câu hỏi"
            description="Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
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
    <div>
      {/* Question Bank Info */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              📚 {questionBank.name}
            </Title>
            <Text type="secondary">{questionBank.description}</Text>
          </Col>
          <Col>
            <Tag color="blue">Lớp {questionBank.gradeLevel}</Tag>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng câu hỏi"
              value={stats.total}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Trắc nghiệm"
              value={stats.multipleChoice}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Điền chỗ trống"
              value={stats.fillBlank}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Câu khó"
              value={stats.hard}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <QuestionCircleOutlined style={{ marginRight: 8 }} />
            Danh sách câu hỏi
          </Title>
          <Text type="secondary">
            Quản lý {stats.total} câu hỏi trong ngân hàng
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
          >
            Thêm câu hỏi mới
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              placeholder="Lọc theo loại câu hỏi"
              allowClear
              style={{ width: '100%' }}
              value={filters.questionType}
              onChange={(value) => handleFilterChange('questionType', value)}
            >
              {QUESTION_TYPES.map(type => (
                <Option key={type.value} value={type.value}>
                  <Tag color={type.value === 0 ? 'blue' : 'green'}>
                    {type.label}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Lọc theo độ khó"
              allowClear
              style={{ width: '100%' }}
              value={filters.difficulty}
              onChange={(value) => handleFilterChange('difficulty', value)}
            >
              {DIFFICULTY_LEVELS.map(level => (
                <Option key={level.value} value={level.value}>
                  <Tag color={level.color}>{level.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={10}>
            <Input
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung câu hỏi..."
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
          dataSource={questions}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} câu hỏi`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có câu hỏi nào"
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  Tạo câu hỏi đầu tiên
                </Button>
              </Empty>
            )
          }}
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={editingRecord ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        <QuestionForm
          initialValues={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalVisible(false)}
        />
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Xem trước câu hỏi"
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            setIsPreviewModalVisible(false);
            handleEdit(previewingRecord);
          }}>
            Chỉnh sửa
          </Button>,
          <Button key="close" onClick={() => setIsPreviewModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width="80%"
        style={{ top: 20 }}
      >
        {previewingRecord && <QuestionPreview question={previewingRecord} />}
      </Modal>
    </div>
  );
};

export default QuestionManagement;