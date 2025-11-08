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
  Descriptions,
  Tag,
  Typography,
  Space,
  Alert,
  Spin,
  Divider
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
import { questionBankService } from '../services/questionBankService';
import questionService from '../services/questionService';
import questionDifficultyService from '../services/questionDifficultyService';

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
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [matrixItems, setMatrixItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [questionDifficulties, setQuestionDifficulties] = useState([]);
  const [itemsQuestionCounts, setItemsQuestionCounts] = useState({}); // { itemId: count }
  const [form] = Form.useForm();
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

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
      setInitialLoadDone(true);
    };
    loadData();
  }, []);

  // Fetch exam matrices when search term changes (with debounce)
  // Note: Initial fetch is handled in the first useEffect
  useEffect(() => {
    // Skip if initial load hasn't completed yet
    if (!initialLoadDone) {
      return;
    }
    
    const timer = setTimeout(() => {
      fetchExamMatrixes();
    }, 500); // Debounce search by 500ms
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchExamMatrixes = async () => {
    setLoading(true);
    try {
      // Build filters according to API: teacherId (int?) and q (string?)
      const filters = {};
      if (currentTeacherId) {
        filters.teacherId = currentTeacherId;
      }
      if (searchTerm && searchTerm.trim() !== '') {
        filters.q = searchTerm.trim();
      }
      
      const result = await examMatrixService.getAllExamMatrices(filters);
      
      if (result.success) {
        // API returns IEnumerable<ExamMatrixResponse> directly as array
        // result.data should be an array of ExamMatrixResponse objects
        const data = Array.isArray(result.data) ? result.data : [];
        
        console.log('Fetched exam matrices:', data);
        setExamMatrixes(data);
        setPagination(prev => ({ ...prev, total: data.length }));
      } else {
        console.error('Failed to fetch exam matrices:', result);
        message.error(result.message || 'Có lỗi xảy ra khi tải dữ liệu');
        setExamMatrixes([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('Error fetching exam matrices:', error);
      console.error('Error response:', error.response?.data);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
      setExamMatrixes([]);
      setPagination(prev => ({ ...prev, total: 0 }));
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
    // Reset matrixId in ExamMatrixForm by passing a key prop that changes
    setIsFormModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    // Map backend response to form fields
    // Backend returns PascalCase: Id, Name, Description, TeacherId, TotalQuestions, TotalPoints, Configuration
    form.setFieldsValue({
      name: record.Name || '',
      description: record.Description || '',
      teacherId: record.TeacherId || currentTeacherId,
      totalQuestions: record.TotalQuestions || null,
      totalPoints: record.TotalPoints || null
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
    // Don't close modal immediately - let user add items
    // Modal will stay open until user clicks "Đóng"
  };
  
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const handleSearchSubmit = () => {
    fetchExamMatrixes();
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchExamMatrixes();
  };
  
  const handleTableChange = (newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  const handleCancel = () => {
    setIsFormModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // Handle view details
  const handleView = async (record) => {
    const matrixId = record.Id || record.id;
    if (!matrixId) {
      message.error('Không tìm thấy ID ma trận đề');
      return;
    }
    
    setViewingRecord(record);
    setIsDetailModalVisible(true);
    await loadMatrixItems(matrixId);
  };

  // Load matrix items for detail view
  const loadMatrixItems = async (matrixId) => {
    setLoadingItems(true);
    try {
      const result = await examMatrixService.getItemsForExamMatrix(matrixId);
      if (result.success && result.data) {
        const items = Array.isArray(result.data) ? result.data : [];
        setMatrixItems(items);
        
        // Load available question count for each item
        await loadItemsQuestionCounts(items);
      } else {
        console.error('Failed to load matrix items:', result.message);
        setMatrixItems([]);
      }
    } catch (error) {
      console.error('Error loading matrix items:', error);
      setMatrixItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Load available question count for each item
  const loadItemsQuestionCounts = async (items) => {
    const counts = {};
    
    // Load question banks and difficulties for display
    if (questionBanks.length === 0) {
      try {
        const banksResult = await questionBankService.getQuestionBanks({
          teacherId: currentTeacherId,
          status: 1,
          page: 1,
          pageSize: 1000
        });
        if (banksResult.success && banksResult.data) {
          const banks = Array.isArray(banksResult.data) ? banksResult.data : (banksResult.data.data || banksResult.data.items || []);
          setQuestionBanks(banks);
        }
      } catch (error) {
        console.error('Error loading question banks:', error);
      }
    }
    
    if (questionDifficulties.length === 0) {
      try {
        const difficultiesResult = await questionDifficultyService.getAllQuestionDifficulties({
          page: 1,
          size: 1000
        });
        if (difficultiesResult.success && difficultiesResult.data) {
          const difficulties = Array.isArray(difficultiesResult.data) ? difficultiesResult.data : [];
          setQuestionDifficulties(difficulties);
        }
      } catch (error) {
        console.error('Error loading question difficulties:', error);
      }
    }
    
    // Load question count for each item
    for (const item of items) {
      const questionBankId = item.questionBankId || item.QuestionBankId;
      const difficultyLevel = item.difficultyLevel !== undefined && item.difficultyLevel !== null
        ? item.difficultyLevel
        : (item.DifficultyLevel !== undefined && item.DifficultyLevel !== null ? item.DifficultyLevel : null);
      
      if (questionBankId) {
        try {
          const params = {
            bankId: questionBankId,
            active: true
          };
          
          if (difficultyLevel !== null && difficultyLevel !== undefined) {
            params.difficultyId = difficultyLevel;
          }
          
          const questionsResult = await questionService.getQuestions(params);
          if (questionsResult.success && questionsResult.data) {
            const count = Array.isArray(questionsResult.data) ? questionsResult.data.length : 0;
            const itemId = item.Id || item.id;
            counts[itemId] = count;
          }
        } catch (error) {
          console.error(`Error loading question count for item ${item.Id || item.id}:`, error);
        }
      }
    }
    
    setItemsQuestionCounts(counts);
  };

  // Create table columns
  const columns = createExamMatrixColumns({
    currentTeacherId,
    currentUserName,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView
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
          <Col xs={24} sm={12} md={8} lg={8}>
            <Input
              placeholder="Tìm kiếm ma trận (tên hoặc mô tả)..."
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
            dataSource={examMatrixes}
            rowKey={(record) => record.Id || record.id}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
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

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Chi tiết ma trận đề
            </Typography.Title>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setViewingRecord(null);
          setMatrixItems([]);
          setItemsQuestionCounts({});
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsDetailModalVisible(false);
            setViewingRecord(null);
            setMatrixItems([]);
            setItemsQuestionCounts({});
          }}>
            Đóng
          </Button>
        ]}
        width={900}
      >
        {loadingItems ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" tip="Đang tải chi tiết ma trận..." />
          </div>
        ) : viewingRecord ? (
          <>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Tên ma trận" span={2}>
                <Typography.Text strong>{viewingRecord.Name || viewingRecord.name || 'N/A'}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {viewingRecord.Description || viewingRecord.description || 'Không có mô tả'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số câu hỏi">
                {viewingRecord.TotalQuestions || viewingRecord.totalQuestions || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng điểm">
                {viewingRecord.TotalPoints || viewingRecord.totalPoints || 0}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Danh sách Items</Divider>

            {matrixItems.length === 0 ? (
              <Empty description="Ma trận này chưa có items nào" />
            ) : (
              <Table
                columns={[
                  {
                    title: 'STT',
                    key: 'index',
                    width: 60,
                    render: (_, __, index) => index + 1
                  },
                  {
                    title: 'Ngân hàng câu hỏi',
                    key: 'questionBank',
                    render: (record) => {
                      const bankId = record.questionBankId || record.QuestionBankId;
                      const bank = questionBanks.find(b => (b.id || b.Id) === bankId);
                      return bank ? (bank.name || bank.Name || `Bank #${bankId}`) : `Bank #${bankId}`;
                    }
                  },
                  {
                    title: 'Domain',
                    dataIndex: 'domain',
                    key: 'domain',
                    render: (text, record) => {
                      const domain = record.domain || record.Domain || text || '-';
                      return domain;
                    }
                  },
                  {
                    title: 'Độ khó',
                    key: 'difficulty',
                    render: (record) => {
                      const difficultyId = record.difficultyLevel !== undefined && record.difficultyLevel !== null
                        ? record.difficultyLevel
                        : (record.DifficultyLevel !== undefined && record.DifficultyLevel !== null ? record.DifficultyLevel : null);
                      
                      if (difficultyId) {
                        const difficulty = questionDifficulties.find(d => {
                          const id = d.id !== undefined ? d.id : d.Id;
                          return id === difficultyId;
                        });
                        
                        if (difficulty) {
                          const domain = difficulty.domain || difficulty.Domain || '';
                          const level = difficulty.difficultyLevel !== undefined 
                            ? difficulty.difficultyLevel 
                            : (difficulty.DifficultyLevel !== undefined ? difficulty.DifficultyLevel : '');
                          const description = difficulty.description || difficulty.Description || '';
                          
                          const displayText = description 
                            ? `${domain} - Mức ${level} (${description})`
                            : `${domain} - Mức ${level}`;
                          
                          return <Tag color="blue">{displayText}</Tag>;
                        }
                      }
                      return '-';
                    }
                  },
                  {
                    title: 'Số câu yêu cầu',
                    dataIndex: 'questionCount',
                    key: 'questionCount',
                    align: 'center',
                    render: (count, record) => {
                      const questionCount = record.questionCount || record.QuestionCount || count || 0;
                      return <Typography.Text strong>{questionCount}</Typography.Text>;
                    }
                  },
                  {
                    title: 'Số câu có sẵn',
                    key: 'availableCount',
                    align: 'center',
                    render: (record) => {
                      const itemId = record.Id || record.id;
                      const availableCount = itemsQuestionCounts[itemId] !== undefined ? itemsQuestionCounts[itemId] : null;
                      
                      if (availableCount === null) {
                        return <Spin size="small" />;
                      }
                      
                      const questionCount = record.questionCount || record.QuestionCount || 0;
                      const isEnough = availableCount >= questionCount;
                      
                      return (
                        <Tag color={isEnough ? 'success' : 'error'}>
                          {availableCount}
                        </Tag>
                      );
                    }
                  },
                  {
                    title: 'Điểm/câu',
                    dataIndex: 'pointsPerQuestion',
                    key: 'pointsPerQuestion',
                    align: 'center',
                    render: (points, record) => {
                      const pointsValue = record.pointsPerQuestion !== undefined && record.pointsPerQuestion !== null
                        ? record.pointsPerQuestion
                        : (record.PointsPerQuestion !== undefined && record.PointsPerQuestion !== null ? record.PointsPerQuestion : points);
                      return pointsValue !== null && pointsValue !== undefined ? pointsValue.toFixed(1) : '-';
                    }
                  }
                ]}
                dataSource={matrixItems}
                rowKey={(record) => record.Id || record.id || Math.random()}
                pagination={false}
                size="small"
                loading={loadingItems}
              />
            )}

            {/* Validation Status */}
            {matrixItems.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Alert
                  message="Trạng thái kiểm tra"
                  description={
                    <div>
                      {Object.keys(itemsQuestionCounts).length === matrixItems.length ? (
                        (() => {
                          let allEnough = true;
                          const shortageItems = [];
                          
                          matrixItems.forEach(item => {
                            const itemId = item.Id || item.id;
                            const availableCount = itemsQuestionCounts[itemId] || 0;
                            const questionCount = item.questionCount || item.QuestionCount || 0;
                            
                            if (availableCount < questionCount) {
                              allEnough = false;
                              shortageItems.push({
                                itemId,
                                needed: questionCount,
                                available: availableCount
                              });
                            }
                          });
                          
                          if (allEnough) {
                            return (
                              <Typography.Text type="success">
                                ✓ Tất cả items đều có đủ câu hỏi để tạo đề thi.
                              </Typography.Text>
                            );
                          } else {
                            return (
                              <div>
                                <Typography.Text type="warning">
                                  ⚠ Một số items không đủ câu hỏi:
                                </Typography.Text>
                                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                                  {shortageItems.map((s, idx) => (
                                    <li key={idx}>
                                      Item #{s.itemId}: Cần {s.needed} câu nhưng chỉ có {s.available} câu
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                        })()
                      ) : (
                        <Space>
                          <Spin size="small" />
                          <Typography.Text>Đang kiểm tra số lượng câu hỏi có sẵn...</Typography.Text>
                        </Space>
                      )}
                    </div>
                  }
                  type={(() => {
                    if (Object.keys(itemsQuestionCounts).length < matrixItems.length) {
                      return 'info';
                    }
                    let allEnough = true;
                    matrixItems.forEach(item => {
                      const itemId = item.Id || item.id;
                      const availableCount = itemsQuestionCounts[itemId] || 0;
                      const questionCount = item.questionCount || item.QuestionCount || 0;
                      if (availableCount < questionCount) {
                        allEnough = false;
                      }
                    });
                    return allEnough ? 'success' : 'warning';
                  })()}
                  showIcon
                />
              </div>
            )}
          </>
        ) : (
          <Empty description="Không có dữ liệu" />
        )}
      </Modal>
    </div>
  );
};

export default ExamMatrixManagement;