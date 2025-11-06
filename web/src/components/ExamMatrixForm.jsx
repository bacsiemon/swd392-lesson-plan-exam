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
  const [matrixId, setMatrixId] = useState(null);

  // Load question banks
  useEffect(() => {
    if (visible) {
      loadQuestionBanks();
      if (editingRecord) {
        const id = editingRecord.Id || editingRecord.id;
        setMatrixId(id);
        loadItems(id);
      } else {
        setMatrixId(null);
        setItems([]);
      }
    }
  }, [visible, editingRecord]);

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

  const handleAddItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    setIsItemModalVisible(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    itemForm.setFieldsValue({
      questionBankId: item.QuestionBankId || item.questionBankId,
      domain: item.Domain || item.domain || '',
      difficultyLevel: item.DifficultyLevel !== undefined && item.DifficultyLevel !== null 
        ? item.DifficultyLevel 
        : (item.difficultyLevel !== undefined && item.difficultyLevel !== null ? item.difficultyLevel : null),
      questionCount: item.QuestionCount || item.questionCount || 0,
      pointsPerQuestion: item.PointsPerQuestion !== undefined && item.PointsPerQuestion !== null
        ? item.PointsPerQuestion
        : (item.pointsPerQuestion !== undefined && item.pointsPerQuestion !== null ? item.pointsPerQuestion : null)
    });
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

      let result;
      if (editingItem) {
        const itemId = editingItem.Id || editingItem.id;
        result = await examMatrixService.updateItemInExamMatrix(matrixId, itemId, itemData);
      } else {
        result = await examMatrixService.addItemToExamMatrix(matrixId, itemData);
      }

      if (result.success) {
        message.success(editingItem ? 'Cập nhật item thành công' : 'Thêm item thành công');
        setIsItemModalVisible(false);
        setEditingItem(null);
        itemForm.resetFields();
        loadItems(matrixId);
      } else {
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
      await form.validateFields();
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
          if (onSuccess) {
            onSuccess(result.data);
          }
        } else {
          message.success('Cập nhật ma trận đề thành công');
          if (onSuccess) {
            onSuccess(result.data);
          }
        }
        // Don't call onSubmit here - let the user manage items first
        // if (onSubmit) {
        //   onSubmit();
        // }
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
        const bankId = record.QuestionBankId || record.questionBankId;
        const bank = questionBanks.find(b => (b.Id || b.id) === bankId);
        return bank ? (bank.Name || bank.name || `Bank #${bankId}`) : `Bank #${bankId}`;
      }
    },
    {
      title: 'Domain',
      dataIndex: 'Domain',
      key: 'domain',
      render: (text) => text || '-'
    },
    {
      title: 'Độ khó',
      dataIndex: 'DifficultyLevel',
      key: 'difficultyLevel',
      render: (level) => level !== null && level !== undefined ? level : '-'
    },
    {
      title: 'Số câu',
      dataIndex: 'QuestionCount',
      key: 'questionCount',
      align: 'center'
    },
    {
      title: 'Điểm/câu',
      dataIndex: 'PointsPerQuestion',
      key: 'pointsPerQuestion',
      render: (points) => points !== null && points !== undefined ? points : '-',
      align: 'center'
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

  return (
    <>
      <Modal
        className="chemistry-modal"
        title={editingRecord ? 'Chỉnh sửa ma trận đề' : 'Tạo ma trận đề mới'}
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
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
        width={900}
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

          {/* Items Management - Show if editing existing matrix OR after creating new matrix */}
          {matrixId && (
            <>
              <Divider>Quản lý Items</Divider>
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
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsItemModalVisible(false);
            setEditingItem(null);
            itemForm.resetFields();
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
            >
              {questionBanks.map(bank => (
                <Option key={bank.Id || bank.id} value={bank.Id || bank.id}>
                  {bank.Name || bank.name || `Bank #${bank.Id || bank.id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Domain"
            name="domain"
            tooltip="Lĩnh vực câu hỏi (tùy chọn)"
          >
            <Input placeholder="Ví dụ: Organic Chemistry" />
          </Form.Item>

          <Form.Item
            label="Độ khó (ID)"
            name="difficultyLevel"
            tooltip="ID độ khó từ database (tùy chọn)"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập ID độ khó"
              min={1}
            />
          </Form.Item>

          <Form.Item
            label="Số câu hỏi"
            name="questionCount"
            rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="10"
              min={1}
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
