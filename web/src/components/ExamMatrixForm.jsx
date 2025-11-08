import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Row, 
  Col, 
  Button, 
  Table, 
  Space, 
  message, 
  Popconfirm,
  Select,
  Divider,
  Typography,
  Tag,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import examMatrixService from '../services/examMatrixService';
import { questionBankService } from '../services/questionBankService';
import questionDifficultyService from '../services/questionDifficultyService';
import questionService from '../services/questionService';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const ExamMatrixForm = ({
  visible,
  editingRecord,
  form,
  submitting,
  onCancel,
  onSubmit,
  onSuccess
}) => {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm] = Form.useForm();
  const [questionBanks, setQuestionBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [questionDifficulties, setQuestionDifficulties] = useState([]);
  const [loadingDifficulties, setLoadingDifficulties] = useState(false);
  const [matrixId, setMatrixId] = useState(null);
  const [availableQuestionCount, setAvailableQuestionCount] = useState(0);
  const [loadingQuestionCount, setLoadingQuestionCount] = useState(false);

  // Reset matrixId when modal closes and we're creating new (not editing existing)
  useEffect(() => {
    if (!visible) {
      // Only reset if we were creating new (no editingRecord)
      // If editingRecord exists, we want to keep state for next time
      if (!editingRecord) {
        // Small delay to allow state to persist during modal close animation
        const timer = setTimeout(() => {
          setMatrixId(null);
          setItems([]);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, editingRecord]);

  // Load question banks and difficulties
  useEffect(() => {
    if (visible) {
      loadQuestionBanks();
      loadQuestionDifficulties();
      if (editingRecord) {
        const id = editingRecord.Id || editingRecord.id;
        setMatrixId(id);
        loadItems(id);
        // Load form values from editingRecord
        form.setFieldsValue({
          name: editingRecord.Name || editingRecord.name || '',
          description: editingRecord.Description || editingRecord.description || '',
          teacherId: editingRecord.TeacherId || editingRecord.teacherId || form.getFieldValue('teacherId'),
          totalQuestions: editingRecord.TotalQuestions !== undefined && editingRecord.TotalQuestions !== null 
            ? editingRecord.TotalQuestions 
            : (editingRecord.totalQuestions !== undefined && editingRecord.totalQuestions !== null ? editingRecord.totalQuestions : null),
          totalPoints: editingRecord.TotalPoints !== undefined && editingRecord.TotalPoints !== null 
            ? editingRecord.TotalPoints 
            : (editingRecord.totalPoints !== undefined && editingRecord.totalPoints !== null ? editingRecord.totalPoints : null)
        });
      } else if (!matrixId) {
        // Only reset items if we're creating new and don't have matrixId yet
        setItems([]);
      }
      // If matrixId exists (from previous creation), keep it and load items
      if (matrixId && !editingRecord) {
        loadItems(matrixId);
      }
    }
  }, [visible, editingRecord]);

  const loadQuestionDifficulties = async () => {
    setLoadingDifficulties(true);
    try {
      const result = await questionDifficultyService.getAllQuestionDifficulties({
        page: 1,
        size: 1000 // Get all
      });
      
      if (result.success && result.data) {
        const data = Array.isArray(result.data) ? result.data : [];
        setQuestionDifficulties(data);
      } else {
        console.error('Failed to load question difficulties:', result.message);
        setQuestionDifficulties([]);
      }
    } catch (error) {
      console.error('Error loading question difficulties:', error);
      setQuestionDifficulties([]);
    } finally {
      setLoadingDifficulties(false);
    }
  };

  const loadQuestionBanks = async () => {
    setLoadingBanks(true);
    try {
      const teacherId = form.getFieldValue('teacherId');
      const result = await questionBankService.getQuestionBanks({
        teacherId: teacherId,
        status: 1, // Active
        page: 1,
        pageSize: 100
      });
      
      if (result.success && result.data) {
        const banks = Array.isArray(result.data) ? result.data : (result.data.data || result.data.items || []);
        setQuestionBanks(banks);
      }
    } catch (error) {
      console.error('Error loading question banks:', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const loadItems = async (id) => {
    setLoadingItems(true);
    try {
      const result = await examMatrixService.getItemsForExamMatrix(id);
      if (result.success && result.data) {
        const itemsData = Array.isArray(result.data) ? result.data : [];
        setItems(itemsData);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      message.error('Không thể tải danh sách items');
    } finally {
      setLoadingItems(false);
    }
  };

  // Load available question count when questionBankId or difficultyLevel changes
  const loadAvailableQuestionCount = async (questionBankId, difficultyLevel) => {
    if (!questionBankId) {
      setAvailableQuestionCount(0);
      return;
    }

    setLoadingQuestionCount(true);
    try {
      const params = {
        bankId: questionBankId,
        active: true // Only active questions
      };

      // If difficultyLevel is selected, filter by it
      if (difficultyLevel !== undefined && difficultyLevel !== null) {
        params.difficultyId = difficultyLevel;
      }

      const result = await questionService.getQuestions(params);
      
      if (result.success && result.data) {
        const count = Array.isArray(result.data) ? result.data.length : 0;
        setAvailableQuestionCount(count);
        console.log(`[ExamMatrixForm] Available questions: ${count} for bankId=${questionBankId}, difficultyId=${difficultyLevel}`);
      } else {
        setAvailableQuestionCount(0);
        console.error('Failed to load question count:', result.message);
      }
    } catch (error) {
      console.error('Error loading question count:', error);
      setAvailableQuestionCount(0);
    } finally {
      setLoadingQuestionCount(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    setAvailableQuestionCount(0);
    setIsItemModalVisible(true);
  };

  const handleEditItem = async (item) => {
    setEditingItem(item);
    // Handle both camelCase and PascalCase - prioritize camelCase
    const questionBankId = item.questionBankId || item.QuestionBankId;
    const difficultyLevel = item.difficultyLevel !== undefined && item.difficultyLevel !== null 
      ? item.difficultyLevel 
      : (item.DifficultyLevel !== undefined && item.DifficultyLevel !== null ? item.DifficultyLevel : null);
    
    itemForm.setFieldsValue({
      questionBankId: questionBankId,
      domain: item.domain || item.Domain || '',
      difficultyLevel: difficultyLevel,
      questionCount: item.questionCount || item.QuestionCount || 0,
      pointsPerQuestion: item.pointsPerQuestion !== undefined && item.pointsPerQuestion !== null
        ? item.pointsPerQuestion
        : (item.PointsPerQuestion !== undefined && item.PointsPerQuestion !== null ? item.PointsPerQuestion : null)
    });
    
    // Load available question count for editing
    if (questionBankId) {
      await loadAvailableQuestionCount(questionBankId, difficultyLevel);
    }
    
    setIsItemModalVisible(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!matrixId) return;
    try {
      const result = await examMatrixService.deleteItemFromExamMatrix(matrixId, itemId);
      if (result.success) {
        message.success('Xóa item thành công');
        loadItems(matrixId);
      } else {
        message.error(result.message || 'Xóa item thất bại');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Có lỗi xảy ra khi xóa item');
    }
  };

  const handleItemSubmit = async () => {
    try {
      await itemForm.validateFields();
      const values = itemForm.getFieldsValue();
      
      if (!matrixId) {
        message.error('Vui lòng lưu ma trận đề trước khi thêm items');
        return;
      }

      const itemData = {
        questionBankId: values.questionBankId,
        domain: values.domain || null,
        difficultyLevel: values.difficultyLevel !== undefined && values.difficultyLevel !== null ? values.difficultyLevel : null,
        questionCount: values.questionCount || 0,
        pointsPerQuestion: values.pointsPerQuestion !== undefined && values.pointsPerQuestion !== null ? values.pointsPerQuestion : null
      };

      // Debug logging
      console.log('[ExamMatrixForm] Submitting item data:', {
        rawValues: values,
        processedItemData: itemData,
        matrixId: matrixId
      });

      let result;
      if (editingItem) {
        const itemId = editingItem.Id || editingItem.id;
        result = await examMatrixService.updateItemInExamMatrix(matrixId, itemId, itemData);
      } else {
        result = await examMatrixService.addItemToExamMatrix(matrixId, itemData);
      }

      if (result.success) {
        console.log('[ExamMatrixForm] Item saved successfully:', result.data);
        message.success(editingItem ? 'Cập nhật item thành công' : 'Thêm item thành công');
        setIsItemModalVisible(false);
        setEditingItem(null);
        itemForm.resetFields();
        setAvailableQuestionCount(0);
        // Reload items to show the updated data
        await loadItems(matrixId);
      } else {
        console.error('[ExamMatrixForm] Failed to save item:', result);
        message.error(result.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Error submitting item:', error);
      if (error.errorFields) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      } else {
        message.error('Có lỗi xảy ra khi lưu item');
      }
    }
  };

  const handleFormSubmit = async () => {
    try {
      // Only validate basic info fields if matrixId is not set (creating new matrix)
      if (!matrixId) {
        await form.validateFields(['name', 'teacherId']);
      }
      
      const formValues = form.getFieldsValue();
      
      const formData = {
        name: formValues.name || '',
        description: formValues.description !== undefined ? (formValues.description || null) : null,
        teacherId: formValues.teacherId,
        totalQuestions: formValues.totalQuestions !== undefined && formValues.totalQuestions !== null ? formValues.totalQuestions : null,
        totalPoints: formValues.totalPoints !== undefined && formValues.totalPoints !== null ? formValues.totalPoints : null,
        configuration: null
      };

      let result;
      if (editingRecord) {
        const id = editingRecord.Id || editingRecord.id;
        result = await examMatrixService.updateExamMatrix(id, formData);
      } else {
        result = await examMatrixService.createExamMatrix(formData);
      }

      if (result.success) {
        const createdId = result.data?.Id || result.data?.id;
        if (createdId && !editingRecord) {
          // After creating new matrix, set matrixId and load items
          setMatrixId(createdId);
          // Load items for the newly created matrix
          loadItems(createdId);
          message.success('Tạo ma trận đề thành công! Bạn có thể thêm items bây giờ.');
          // Don't call onSuccess yet - let user manage items first
          // Modal stays open so user can add items
        } else if (editingRecord) {
          message.success('Cập nhật ma trận đề thành công');
          // Reload items if editing
          if (createdId) {
            loadItems(createdId);
          }
          // Don't close modal when editing - let user continue managing items
        }
      } else {
        message.error(result.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.errorFields) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      } else {
        message.error('Có lỗi xảy ra khi lưu ma trận đề');
      }
    }
  };

  // Handle update basic info separately (when user clicks "Cập nhật thông tin")
  const handleUpdateBasicInfo = async () => {
    try {
      await form.validateFields(['name', 'teacherId']);
      const formValues = form.getFieldsValue();
      
      if (!matrixId && !editingRecord) {
        message.error('Vui lòng tạo ma trận đề trước');
        return;
      }
      
      const formData = {
        name: formValues.name || '',
        description: formValues.description !== undefined ? (formValues.description || null) : null,
        teacherId: formValues.teacherId,
        totalQuestions: formValues.totalQuestions !== undefined && formValues.totalQuestions !== null ? formValues.totalQuestions : null,
        totalPoints: formValues.totalPoints !== undefined && formValues.totalPoints !== null ? formValues.totalPoints : null,
        configuration: null
      };

      const id = matrixId || (editingRecord?.Id || editingRecord?.id);
      if (!id) {
        message.error('Không tìm thấy ID ma trận đề');
        return;
      }
      
      const result = await examMatrixService.updateExamMatrix(id, formData);
      
      if (result.success) {
        message.success('Cập nhật thông tin ma trận đề thành công');
      } else {
        message.error(result.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating basic info:', error);
      if (error.errorFields) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      } else {
        message.error('Có lỗi xảy ra khi cập nhật');
      }
    }
  };

  const itemColumns = [
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
        // Handle both camelCase and PascalCase
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
        // Handle both camelCase and PascalCase
        const domain = record.domain || record.Domain || text || '-';
        return domain;
      }
    },
    {
      title: 'Độ khó',
      dataIndex: 'DifficultyLevel',
      key: 'difficultyLevel',
      render: (level, record) => {
        // level is actually QuestionDifficultyId
        if (level === null || level === undefined) return '-';
        
        // Find the difficulty from questionDifficulties
        const difficulty = questionDifficulties.find(d => {
          const id = d.id !== undefined ? d.id : d.Id;
          return id === level;
        });
        
        if (difficulty) {
          const domain = difficulty.domain || difficulty.Domain || '';
          const difficultyLevel = difficulty.difficultyLevel !== undefined 
            ? difficulty.difficultyLevel 
            : (difficulty.DifficultyLevel !== undefined ? difficulty.DifficultyLevel : '');
          const description = difficulty.description || difficulty.Description || '';
          
          let color = 'default';
          if (difficultyLevel === 1) color = 'green';
          else if (difficultyLevel === 2) color = 'orange';
          else if (difficultyLevel === 3) color = 'red';
          else if (difficultyLevel >= 4) color = 'purple';
          
          const displayText = description 
            ? `${domain} - Mức ${difficultyLevel} (${description})`
            : `${domain} - Mức ${difficultyLevel}`;
          
          return <Tag color={color}>{displayText}</Tag>;
        }
        
        // Fallback: just show the ID
        return <Tag>ID: {level}</Tag>;
      }
    },
    {
      title: 'Số câu',
      dataIndex: 'questionCount',
      key: 'questionCount',
      align: 'center',
      render: (count, record) => {
        // Handle both camelCase and PascalCase
        return record.questionCount || record.QuestionCount || count || 0;
      }
    },
    {
      title: 'Điểm/câu',
      dataIndex: 'pointsPerQuestion',
      key: 'pointsPerQuestion',
      align: 'center',
      render: (points, record) => {
        // Handle both camelCase and PascalCase
        const pointsValue = record.pointsPerQuestion !== undefined && record.pointsPerQuestion !== null
          ? record.pointsPerQuestion
          : (record.PointsPerQuestion !== undefined && record.PointsPerQuestion !== null ? record.PointsPerQuestion : points);
        return pointsValue !== null && pointsValue !== undefined ? pointsValue.toFixed(1) : '-';
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => {
        const itemId = record.Id || record.id;
        return (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditItem(record)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa item này?"
              onConfirm={() => handleDeleteItem(itemId)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                type="link"
                danger
                size="small"
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

  // Determine if basic info fields should be disabled
  const isBasicInfoDisabled = matrixId !== null; // Disable if matrix already exists

  return (
    <>
      <Modal
        className="chemistry-modal"
        title={editingRecord || matrixId ? 'Quản lý ma trận đề' : 'Tạo ma trận đề mới'}
        open={visible}
        onCancel={onCancel}
        footer={
          (() => {
            const footerButtons = [
              <Button key="cancel" onClick={onCancel}>
                {matrixId ? 'Đóng' : 'Hủy'}
              </Button>
            ];
            
            if (!matrixId) {
              footerButtons.push(
                <Button
                  key="submit"
                  type="primary"
                  className="chemistry-btn-primary"
                  loading={submitting}
                  onClick={handleFormSubmit}
                >
                  Tạo mới
                </Button>
              );
            } else {
              footerButtons.push(
                <Button
                  key="update"
                  type="default"
                  onClick={handleUpdateBasicInfo}
                >
                  Cập nhật thông tin
                </Button>
              );
            }
            
            return footerButtons;
          })()
        }
        width={900}
        destroyOnClose={false} // Don't destroy on close to preserve form state
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          {/* Basic Info Section */}
          <Divider orientation="left">Thông tin cơ bản</Divider>
          
          <Form.Item
            label="Tên ma trận đề"
            name="name"
            rules={[
              { required: !matrixId, message: 'Vui lòng nhập tên ma trận đề' },
              { max: 255, message: 'Tên ma trận đề không được vượt quá 255 ký tự' }
            ]}
          >
            <Input 
              placeholder="Ví dụ: Chemistry Grade 10 Exam" 
              disabled={isBasicInfoDisabled}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Ví dụ: Random exam matrix for chemistry"
              disabled={isBasicInfoDisabled}
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
                  disabled={isBasicInfoDisabled}
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
                  disabled={isBasicInfoDisabled}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Show info message when basic info is disabled */}
          {isBasicInfoDisabled && (
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
              <Text type="secondary">
                💡 Thông tin cơ bản đã được lưu. Bạn có thể quản lý items bên dưới. 
                Nhấn "Cập nhật thông tin" nếu muốn thay đổi thông tin cơ bản.
              </Text>
            </div>
          )}

          {/* Items Management - Show if editing existing matrix OR after creating new matrix */}
          {matrixId && (
            <>
              <Divider orientation="left">Quản lý Items</Divider>
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                >
                  Thêm Item
                </Button>
              </div>
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey={(record) => record.Id || record.id || Math.random()}
                loading={loadingItems}
                pagination={false}
                size="small"
                locale={{
                  emptyText: <Empty description="Chưa có item nào" />
                }}
              />
            </>
          )}

          {/* Show message if matrix is not created yet */}
          {!matrixId && !editingRecord && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
              <Text type="secondary">
                💡 Vui lòng tạo ma trận đề trước khi thêm items. Nhấn "Tạo mới" để tạo ma trận đề.
              </Text>
            </div>
          )}
        </Form>
      </Modal>

      {/* Item Form Modal */}
      <Modal
        title={editingItem ? 'Chỉnh sửa Item' : 'Thêm Item mới'}
        open={isItemModalVisible}
        onCancel={() => {
          setIsItemModalVisible(false);
          setEditingItem(null);
          itemForm.resetFields();
          setAvailableQuestionCount(0);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsItemModalVisible(false);
            setEditingItem(null);
            itemForm.resetFields();
            setAvailableQuestionCount(0);
          }}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleItemSubmit}
          >
            {editingItem ? 'Cập nhật' : 'Thêm'}
          </Button>
        ]}
        width={600}
      >
        <Form
          form={itemForm}
          layout="vertical"
        >
          <Form.Item
            label="Ngân hàng câu hỏi"
            name="questionBankId"
            rules={[{ required: true, message: 'Vui lòng chọn ngân hàng câu hỏi' }]}
          >
            <Select
              placeholder="Chọn ngân hàng câu hỏi"
              loading={loadingBanks}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                // Load available question count when question bank changes
                const difficultyLevel = itemForm.getFieldValue('difficultyLevel');
                loadAvailableQuestionCount(value, difficultyLevel);
              }}
            >
              {questionBanks.map(bank => (
                <Option key={bank.Id || bank.id} value={bank.Id || bank.id}>
                  {bank.Name || bank.name || `Bank #${bank.Id || bank.id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Domain field - hidden but still exists for auto-fill from difficulty level */}
          <Form.Item
            name="domain"
            style={{ display: 'none' }}
          >
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            label="Độ khó"
            name="difficultyLevel"
            tooltip="Chọn độ khó từ danh sách đã tạo. Domain sẽ được tự động điền từ độ khó đã chọn."
          >
            <Select
              placeholder="Chọn độ khó (tùy chọn)"
              allowClear
              loading={loadingDifficulties}
              showSearch
              optionLabelProp="label"
              onChange={(value) => {
                // Auto-fill domain from selected difficulty level
                if (value) {
                  const selectedDifficulty = questionDifficulties.find(d => {
                    const id = d.id !== undefined ? d.id : d.Id;
                    return id === value;
                  });
                  
                  if (selectedDifficulty) {
                    const domain = selectedDifficulty.domain || selectedDifficulty.Domain || '';
                    // Always set domain when difficulty is selected (field is hidden, so always auto-fill)
                    if (domain) {
                      itemForm.setFieldsValue({ domain: domain });
                    }
                  }
                } else {
                  // Clear domain when difficulty is cleared
                  itemForm.setFieldsValue({ domain: null });
                }
                
                // Load available question count when difficulty changes
                const questionBankId = itemForm.getFieldValue('questionBankId');
                if (questionBankId) {
                  loadAvailableQuestionCount(questionBankId, value);
                }
              }}
              filterOption={(input, option) => {
                const label = option?.label || '';
                return label.toLowerCase().includes(input.toLowerCase());
              }}
              notFoundContent={loadingDifficulties ? 'Đang tải...' : (questionDifficulties.length === 0 ? 'Không có dữ liệu độ khó' : 'Không tìm thấy')}
            >
              {questionDifficulties && questionDifficulties.length > 0 ? questionDifficulties
                .filter((difficulty) => {
                  const id = difficulty.id !== undefined ? difficulty.id : difficulty.Id;
                  return id !== null && id !== undefined && !isNaN(parseInt(id));
                })
                .map((difficulty) => {
                  const id = difficulty.id !== undefined ? difficulty.id : difficulty.Id;
                  const domain = difficulty.domain || difficulty.Domain || '';
                  const level = difficulty.difficultyLevel !== undefined 
                    ? difficulty.difficultyLevel 
                    : (difficulty.DifficultyLevel !== undefined ? difficulty.DifficultyLevel : '');
                  const description = difficulty.description || difficulty.Description || '';
                  
                  const displayText = description 
                    ? `${domain} - Mức ${level} (${description})`
                    : `${domain} - Mức ${level}`;
                  
                  return (
                    <Option key={id} value={id} label={displayText}>
                      <div>
                        <div>
                          <Text strong>{domain}</Text>
                          <Text type="secondary"> - Mức {level}</Text>
                        </div>
                        {description && (
                          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                            {description}
                          </div>
                        )}
                      </div>
                    </Option>
                  );
                })
                .filter(Boolean)
              : (
                <Option disabled value="no-data">
                  {loadingDifficulties ? 'Đang tải...' : 'Chưa có độ khó nào. Vui lòng tạo độ khó trước.'}
                </Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span>
                Số câu hỏi
                {loadingQuestionCount && <Text type="secondary" style={{ marginLeft: 8 }}>(Đang kiểm tra...)</Text>}
                {!loadingQuestionCount && availableQuestionCount > 0 && (
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    (Có sẵn: {availableQuestionCount} câu)
                  </Text>
                )}
                {!loadingQuestionCount && availableQuestionCount === 0 && (
                  <Text type="warning" style={{ marginLeft: 8 }}>
                    (Không có câu hỏi phù hợp)
                  </Text>
                )}
              </span>
            }
            name="questionCount"
            rules={[
              { required: true, message: 'Vui lòng nhập số câu hỏi' },
              {
                validator: (_, value) => {
                  if (value && availableQuestionCount > 0 && value > availableQuestionCount) {
                    return Promise.reject(new Error(`Số câu hỏi không được vượt quá ${availableQuestionCount} câu có sẵn`));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="10"
              min={1}
              max={availableQuestionCount > 0 ? availableQuestionCount : undefined}
            />
          </Form.Item>

          <Form.Item
            label="Điểm mỗi câu"
            name="pointsPerQuestion"
            tooltip="Điểm cho mỗi câu hỏi (tùy chọn)"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="2.0"
              min={0}
              step={0.1}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ExamMatrixForm;
