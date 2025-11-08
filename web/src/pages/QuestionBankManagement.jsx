import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  message,
  Row,
  Col,
  Input,
  Tooltip,
  Typography,
  Popconfirm,
  Empty,
  Badge
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import '../styles/chemistryTheme.css';
import { questionBankService } from '../services/questionBankService';
import QuestionBankForm from '../components/QuestionBankForm';
import QuestionManagement from '../components/QuestionManagement';
import QuestionBankHeader from '../components/QuestionBankHeader';

const { Text } = Typography;

const QuestionBankManagement = () => {
  const [loading, setLoading] = useState(false);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ngân hàng`
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedQuestionBank, setSelectedQuestionBank] = useState(null);

  // Fetch question banks
  useEffect(() => {
    fetchQuestionBanks();
    setInitialLoadDone(true);
  }, []);

  // Fetch question banks when search term changes (with debounce)
  useEffect(() => {
    if (!initialLoadDone) {
      return;
    }
    
    const timer = setTimeout(() => {
      fetchQuestionBanks();
    }, 500); // Debounce search by 500ms
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchQuestionBanks = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (searchTerm && searchTerm.trim() !== '') {
        filters.q = searchTerm.trim();
      }
      
      const result = await questionBankService.getQuestionBanks({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters
      });

      if (result.success) {
        // Map backend response to frontend format
        const mappedData = (result.data || []).map(item => ({
          ...item,
          questionCount: item.totalQuestions || item.questionCount || 0
        }));
        
        setQuestionBanks(mappedData);
        setPagination(prev => ({
          ...prev,
          current: result.pagination?.current || pagination.current,
          pageSize: result.pagination?.pageSize || pagination.pageSize,
          total: result.pagination?.total || mappedData.length
        }));
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi tải dữ liệu');
        setQuestionBanks([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('Error fetching question banks:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
      setQuestionBanks([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

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

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const handleSearchSubmit = () => {
    fetchQuestionBanks();
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchQuestionBanks();
  };
  
  const handleTableChange = (newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  // Table columns
  const columns = [
    {
      title: 'Ngân hàng câu hỏi',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#1890ff' }}>{name || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description || 'Không có mô tả'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: 120,
      align: 'center',
      render: (count) => <Badge count={count || 0} showZero color="#52c41a" />,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date, record) => {
        const dateValue = date || record.CreatedAt || record.createdAt;
        
        if (!dateValue) {
          return <Text style={{ fontSize: '12px' }}>N/A</Text>;
        }
        
        try {
          const dateObj = new Date(dateValue);
          
          if (isNaN(dateObj.getTime())) {
            return <Text style={{ fontSize: '12px' }}>{dateValue}</Text>;
          }
          
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = dateObj.getFullYear();
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          
          const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
          
          return (
            <Text style={{ fontSize: '12px' }}>
              {formattedDate}
            </Text>
          );
        } catch (error) {
          console.error('Error formatting date:', error);
          return <Text style={{ fontSize: '12px' }}>{dateValue}</Text>;
        }
      },
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
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      {/* Header */}
      <QuestionBankHeader onCreate={handleCreate} />

      {/* Main Content Card */}
      <Card className="chemistry-card">
        {/* Filters and Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Input
              placeholder="Tìm kiếm ngân hàng (tên hoặc mô tả)..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onPressEnter={handleSearchSubmit}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
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
            dataSource={questionBanks}
            rowKey={(record) => record.id || record.Id}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <Empty
                  className="chemistry-empty"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có ngân hàng câu hỏi nào"
                />
              ),
            }}
          />
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        className="chemistry-modal"
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
        className="chemistry-modal"
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