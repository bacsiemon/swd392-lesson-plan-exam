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
  Form
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import examMatrixService from '../services/examMatrixService';
import '../styles/chemistryTheme.css';
import accountService from '../services/accountService';
import ExamMatrixHeader from '../components/ExamMatrixHeader';
import ExamMatrixForm from '../components/ExamMatrixForm';
import { createExamMatrixColumns } from '../components/ExamMatrixTableColumns';
import { getCurrentTeacherId } from '../utils/getCurrentTeacherId';

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
  const [form] = Form.useForm();
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    // Load current teacher ID and profile first, then fetch exam matrices
    const loadData = async () => {
      const teacherId = await getCurrentTeacherId();
      setCurrentTeacherId(teacherId);
      
      // Load current user profile to get name
      try {
        // First try to get from localStorage (fast)
        const savedName = localStorage.getItem('user_name');
        if (savedName) {
          setCurrentUserName(savedName);
        }
        
        // Then try to get from API (more reliable)
        const profileResult = await accountService.getProfile();
        if (profileResult.success && profileResult.data) {
          const fullName = profileResult.data.FullName || profileResult.data.fullName || profileResult.data.Name || profileResult.data.name || savedName || '';
          if (fullName) {
            setCurrentUserName(fullName);
            localStorage.setItem('user_name', fullName);
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to localStorage if API fails
        const savedName = localStorage.getItem('user_name');
        if (savedName) {
          setCurrentUserName(savedName);
        }
      }
      
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
      totalPoints: record.TotalPoints || record.totalPoints || null
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
    // This will be handled by ExamMatrixForm component
    // We just need to refresh the list after success
  };

  const handleFormSuccess = (createdData) => {
    // After creating/updating, refresh the list
    fetchExamMatrixes();
    // If it's a new matrix, we might want to keep the modal open to add items
    // But for now, we'll close it
    if (editingRecord) {
      setIsFormModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsFormModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // Create table columns
  const columns = createExamMatrixColumns({
    currentTeacherId,
    currentUserName,
    onEdit: handleEdit,
    onDelete: handleDelete
  });

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      {/* Header */}
      <ExamMatrixHeader onCreate={handleCreate} />

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
            <Button icon={<FilterOutlined />}>Đặt lại</Button>
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
      <ExamMatrixForm
        visible={isFormModalVisible}
        editingRecord={editingRecord}
        form={form}
        submitting={submitting}
        onCancel={handleCancel}
        onSubmit={handleFormSubmit}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default ExamMatrixManagement;