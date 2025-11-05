import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Input, 
  Button, 
  Select,
  Statistic,
  Card,
  Tabs,
  Table,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Switch,
  Space,
  Tag,
  Progress,
  message,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  BarChartOutlined,
  TrophyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  SettingOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import '../styles/chemistryTheme.css';
import dayjs from 'dayjs';
import examService from '../services/examService';
import examMatrixService from '../services/examMatrixService';
import { questionBankService } from '../services/questionBankService';
import api from '../services/axios';

// Helper function to get current user ID from JWT token
const getCurrentUserId = async () => {
  try {
    // Try to get from API
    const response = await api.get('/api/test/current-user');
    if (response.data?.data?.userId || response.data?.data?.UserId) {
      return response.data.data.userId || response.data.data.UserId;
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
    console.error('Error getting current user ID:', error);
  }
  return 1; // Default fallback
};

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Mock data - replace with actual API calls
const mockTests = [
  {
    id: 1,
    title: "Kiểm tra Hóa học Chương 1",
    difficulty: "Trung bình",
    learningLevel: "Lớp 10",
    questionBank: "Ngân hàng câu hỏi Hóa học 10",
    testMatrix: "Ma trận đề kiểm tra 15 phút",
    status: "active",
    totalQuestions: 20,
    totalPoints: 100,
    duration: 45,
    createdAt: "2024-01-15",
    studentAttempts: 25,
    averageScore: 7.8,
    passRate: 68
  },
  {
    id: 2,
    title: "Bài kiểm tra cuối kỳ",
    difficulty: "Khó",
    learningLevel: "Lớp 11",
    questionBank: "Ngân hàng câu hỏi Hóa học 11",
    testMatrix: "Ma trận đề thi cuối kỳ",
    status: "draft",
    totalQuestions: 50,
    totalPoints: 100,
    duration: 90,
    createdAt: "2024-01-10",
    studentAttempts: 0,
    averageScore: 0,
    passRate: 0
  }
];


const mockStudents = [
  { id: 1, name: "Nguyễn Văn A", studentId: "HS001", score: 8.5, attemptTime: "2024-01-20 14:30", status: "completed" },
  { id: 2, name: "Trần Thị B", studentId: "HS002", score: 7.2, attemptTime: "2024-01-20 15:15", status: "completed" },
  { id: 3, name: "Lê Văn C", studentId: "HS003", score: 6.8, attemptTime: "2024-01-20 16:00", status: "completed" }
];

const ManageTestPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // null = all, 0=Draft, 1=Inactive, 2=Active
  const [questionBanks, setQuestionBanks] = useState([]);
  const [examMatrices, setExamMatrices] = useState([]);
  const [loadingQuestionBanks, setLoadingQuestionBanks] = useState(false);
  const [loadingExamMatrices, setLoadingExamMatrices] = useState(false);

  // Load current user ID and initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      
      // Load question banks
      await loadQuestionBanks(userId);
      
      // Load exam matrices
      await loadExamMatrices(userId);
    };
    loadInitialData();
  }, []);

  // Load exams when component mounts or filters change
  useEffect(() => {
    if (currentUserId !== null) {
      loadExams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchText, currentUserId]);

  // Load question banks
  const loadQuestionBanks = async (teacherId) => {
    setLoadingQuestionBanks(true);
    try {
      const result = await questionBankService.getQuestionBanks({
        teacherId: teacherId,
        page: 1,
        pageSize: 100 // Get all available question banks
      });
      
      if (result.success && result.data) {
        // Map backend data to display format
        const mappedBanks = result.data.map(bank => ({
          id: bank.id || bank.Id || null,
          name: bank.name || bank.Name || '',
          gradeLevel: bank.gradeLevel || bank.GradeLevel || null,
          questionCount: bank.questionCount || bank.QuestionCount || bank.totalQuestions || bank.TotalQuestions || 0
        }));
        setQuestionBanks(mappedBanks);
      } else {
        console.error('Failed to load question banks:', result.message);
        setQuestionBanks([]);
      }
    } catch (error) {
      console.error('Error loading question banks:', error);
      setQuestionBanks([]);
    } finally {
      setLoadingQuestionBanks(false);
    }
  };

  // Load exam matrices
  const loadExamMatrices = async (teacherId) => {
    setLoadingExamMatrices(true);
    try {
      const result = await examMatrixService.getAllExamMatrices({
        teacherId: teacherId
      });
      
      if (result.success && result.data) {
        // Map backend data to display format
        let matricesArray = [];
        if (Array.isArray(result.data)) {
          matricesArray = result.data;
        } else if (result.data && typeof result.data === 'object') {
          if (Array.isArray(result.data.data)) {
            matricesArray = result.data.data;
          } else if (Array.isArray(result.data.items)) {
            matricesArray = result.data.items;
          } else {
            matricesArray = [result.data];
          }
        }
        
        const mappedMatrices = matricesArray.map(matrix => ({
          id: matrix.id || matrix.Id || null,
          name: matrix.name || matrix.Name || '',
          totalQuestions: matrix.totalQuestions || matrix.TotalQuestions || 0,
          totalPoints: matrix.totalPoints || matrix.TotalPoints || 0,
          description: matrix.description || matrix.Description || ''
        }));
        setExamMatrices(mappedMatrices);
      } else {
        console.error('Failed to load exam matrices:', result.message);
        setExamMatrices([]);
      }
    } catch (error) {
      console.error('Error loading exam matrices:', error);
      setExamMatrices([]);
    } finally {
      setLoadingExamMatrices(false);
    }
  };

  const loadExams = async () => {
    setFetching(true);
    try {
      const params = {
        teacherId: currentUserId || undefined,
        status: statusFilter !== null ? statusFilter : undefined,
        q: searchText || undefined
      };

      console.log('Loading exams with params:', params);
      const result = await examService.getExams(params);
      
      if (result.success && result.data) {
        // Map backend ExamResponse to display format
        // Backend returns camelCase: { id, title, description, statusEnum, durationMinutes, totalQuestions, totalPoints, ... }
        // Handle both camelCase and PascalCase for compatibility
        let examsArray = [];
        if (Array.isArray(result.data)) {
          examsArray = result.data;
        } else if (result.data && typeof result.data === 'object') {
          if (Array.isArray(result.data.data)) {
            examsArray = result.data.data;
          } else if (Array.isArray(result.data.items)) {
            examsArray = result.data.items;
          } else {
            examsArray = [result.data];
          }
        }
        
        const mappedTests = examsArray.map(exam => {
          // Handle both camelCase and PascalCase
          const examId = exam.id !== undefined ? exam.id : (exam.Id !== undefined ? exam.Id : null);
          const examTitle = exam.title !== undefined ? exam.title : (exam.Title !== undefined ? exam.Title : '');
          const examDescription = exam.description !== undefined ? exam.description : (exam.Description !== undefined ? exam.Description : '');
          const examStatusEnum = exam.statusEnum !== undefined ? exam.statusEnum : (exam.StatusEnum !== undefined ? exam.StatusEnum : 0);
          const examTotalQuestions = exam.totalQuestions !== undefined ? exam.totalQuestions : (exam.TotalQuestions !== undefined ? exam.TotalQuestions : 0);
          const examTotalPoints = exam.totalPoints !== undefined ? exam.totalPoints : (exam.TotalPoints !== undefined ? exam.TotalPoints : 0);
          const examDurationMinutes = exam.durationMinutes !== undefined ? exam.durationMinutes : (exam.DurationMinutes !== undefined ? exam.DurationMinutes : 0);
          const examGradeLevel = exam.gradeLevel !== undefined ? exam.gradeLevel : (exam.GradeLevel !== undefined ? exam.GradeLevel : null);
          const examCreatedAt = exam.createdAt !== undefined ? exam.createdAt : (exam.CreatedAt !== undefined ? exam.CreatedAt : null);
          
          // Map StatusEnum: 0=Draft, 1=Inactive, 2=Active to string
          const status = examStatusEnum === 0 ? 'draft' : (examStatusEnum === 2 ? 'active' : 'inactive');
          
          return {
            id: examId,
            title: examTitle,
            description: examDescription,
            status: status,
            statusEnum: examStatusEnum,
            totalQuestions: examTotalQuestions,
            totalPoints: examTotalPoints,
            duration: examDurationMinutes,
            gradeLevel: examGradeLevel,
            createdAt: examCreatedAt,
            // These might not be in ExamResponse, set defaults
            studentAttempts: exam.studentAttempts || exam.StudentAttempts || 0,
            averageScore: exam.averageScore || exam.AverageScore || 0,
            passRate: exam.passRate || exam.PassRate || 0,
            // Keep original data for details
            rawData: exam
          };
        });
        
        console.log('Loaded and mapped exams:', mappedTests);
        setTests(mappedTests);
      } else {
        console.error('Failed to load exams:', result.message);
        message.error(result.message || 'Không thể tải danh sách bài kiểm tra');
        setTests([]);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      message.error('Có lỗi xảy ra khi tải danh sách bài kiểm tra');
      setTests([]);
    } finally {
      setFetching(false);
    }
  };

  const filteredTests = tests.filter(test => 
    test.title.toLowerCase().includes(searchText.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleCreateTest = async (values) => {
    setLoading(true);
    try {
      // Prepare exam data for API
      // Check if creating from matrix or manually
      // examMatrixId should be the ID from the select dropdown
      const examMatrixId = values.examMatrixId !== undefined && values.examMatrixId !== null && values.examMatrixId !== ''
        ? (typeof values.examMatrixId === 'number' ? values.examMatrixId : parseInt(values.examMatrixId))
        : null;
      
      const isFromMatrix = examMatrixId !== null && !isNaN(examMatrixId);
      
      // Format dates for API
      const startTime = values.startTime ? dayjs(values.startTime).toISOString() : null;
      const endTime = values.endTime ? dayjs(values.endTime).toISOString() : null;
      
      // Ensure password is always a string or null
      let passwordValue = null;
      if (values.password !== undefined && values.password !== null && values.password !== '') {
        // Convert to string explicitly to handle numbers
        passwordValue = String(values.password).trim();
        // If after trimming it's empty, set to null
        if (passwordValue === '') {
          passwordValue = null;
        }
      }
      
      const examData = {
        title: values.title || '',
        description: values.description || '',
        createdByTeacher: currentUserId || 1, // Backend will override from JWT anyway
        gradeLevel: values.learningLevel ? parseInt(values.learningLevel.replace('Lớp ', '')) : null,
        durationMinutes: values.duration || null,
        passThreshold: values.passThreshold !== undefined && values.passThreshold !== null ? values.passThreshold : null,
        showResultsImmediately: values.showResultsImmediately !== undefined ? values.showResultsImmediately : null,
        showCorrectAnswers: values.showCorrectAnswers !== undefined ? values.showCorrectAnswers : null,
        randomizeQuestions: values.randomizeQuestions !== undefined ? values.randomizeQuestions : null,
        randomizeAnswers: values.randomizeAnswers !== undefined ? values.randomizeAnswers : null,
        scoringMethodEnum: values.scoringMethodEnum !== undefined && values.scoringMethodEnum !== null ? values.scoringMethodEnum : null,
        maxAttempts: values.maxAttempts !== undefined && values.maxAttempts !== null ? values.maxAttempts : null,
        startTime: startTime,
        endTime: endTime,
        password: passwordValue,
        statusEnum: 0, // Draft
        examMatrixId: examMatrixId,
        totalQuestions: values.totalQuestions || null,
        totalPoints: values.totalPoints || null
      };

      console.log('Creating exam with data:', examData);

      let result;
      if (isFromMatrix && examMatrixId) {
        // Create from matrix - examMatrixId is required
        result = await examService.createExamFromMatrix(examData);
      } else {
        // Create manually - no examMatrixId
        const { examMatrixId: _, ...examDataWithoutMatrix } = examData; // Remove examMatrixId for manual creation
        result = await examService.createExam(examDataWithoutMatrix);
      }

      if (result.success) {
        message.success(result.message || 'Tạo bài kiểm tra thành công!');
        setIsCreateModalVisible(false);
        form.resetFields();
        setSelectedTest(null);
        // Refresh exams list
        await loadExams();
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi tạo bài kiểm tra!');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      message.error('Có lỗi xảy ra khi tạo bài kiểm tra!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTest = async (test) => {
    setLoading(true);
    try {
      // Load full exam details first
      const examId = test.id || test.Id || test.ID;
      if (!examId) {
        message.error('Không tìm thấy ID của bài kiểm tra');
        return;
      }

      const result = await examService.getExamById(examId);
      if (result.success && result.data) {
        const examData = result.data;
        // Map backend data to form format
        // Parse dates from backend
        const startTimeValue = examData.startTime || examData.StartTime;
        const endTimeValue = examData.endTime || examData.EndTime;
        
        form.setFieldsValue({
          title: examData.title || examData.Title || '',
          description: examData.description || examData.Description || '',
          learningLevel: examData.gradeLevel || examData.GradeLevel ? `Lớp ${examData.gradeLevel || examData.GradeLevel}` : undefined,
          duration: examData.durationMinutes || examData.DurationMinutes || null,
          totalQuestions: examData.totalQuestions || examData.TotalQuestions || null,
          totalPoints: examData.totalPoints || examData.TotalPoints || null,
          passThreshold: examData.passThreshold !== undefined ? examData.passThreshold : (examData.PassThreshold !== undefined ? examData.PassThreshold : null),
          showResultsImmediately: examData.showResultsImmediately !== undefined ? examData.showResultsImmediately : (examData.ShowResultsImmediately !== undefined ? examData.ShowResultsImmediately : null),
          showCorrectAnswers: examData.showCorrectAnswers !== undefined ? examData.showCorrectAnswers : (examData.ShowCorrectAnswers !== undefined ? examData.ShowCorrectAnswers : null),
          randomizeQuestions: examData.randomizeQuestions !== undefined ? examData.randomizeQuestions : (examData.RandomizeQuestions !== undefined ? examData.RandomizeQuestions : null),
          randomizeAnswers: examData.randomizeAnswers !== undefined ? examData.randomizeAnswers : (examData.RandomizeAnswers !== undefined ? examData.RandomizeAnswers : null),
          scoringMethodEnum: examData.scoringMethodEnum !== undefined ? examData.scoringMethodEnum : (examData.ScoringMethodEnum !== undefined ? examData.ScoringMethodEnum : null),
          maxAttempts: examData.maxAttempts !== undefined ? examData.maxAttempts : (examData.MaxAttempts !== undefined ? examData.MaxAttempts : null),
          startTime: startTimeValue ? dayjs(startTimeValue) : null,
          endTime: endTimeValue ? dayjs(endTimeValue) : null,
          password: examData.password || examData.Password || null,
          examMatrixId: examData.examMatrixId !== undefined && examData.examMatrixId !== null 
            ? (typeof examData.examMatrixId === 'number' ? examData.examMatrixId : parseInt(examData.examMatrixId))
            : (examData.ExamMatrixId !== undefined && examData.ExamMatrixId !== null ? (typeof examData.ExamMatrixId === 'number' ? examData.ExamMatrixId : parseInt(examData.ExamMatrixId)) : null)
        });
        
        setSelectedTest({ ...examData, id: examId });
        setIsCreateModalVisible(true);
      } else {
        message.error(result.message || 'Không thể tải thông tin bài kiểm tra');
      }
    } catch (error) {
      console.error('Error loading exam for edit:', error);
      message.error('Có lỗi xảy ra khi tải thông tin bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (test) => {
    setLoading(true);
    try {
      // Load full exam details with questions
      const examId = test.id || test.Id || test.ID;
      if (!examId) {
        message.error('Không tìm thấy ID của bài kiểm tra');
        return;
      }

      const result = await examService.getExamById(examId);
      if (result.success && result.data) {
        // Also load questions if available
        const questionsResult = await examService.getExamQuestions(examId);
        const examWithQuestions = {
          ...result.data,
          questions: questionsResult.success ? questionsResult.data : []
        };
        
        setSelectedTest(examWithQuestions);
        setIsDetailsModalVisible(true);
      } else {
        message.error(result.message || 'Không thể tải thông tin bài kiểm tra');
      }
    } catch (error) {
      console.error('Error loading exam details:', error);
      message.error('Có lỗi xảy ra khi tải thông tin bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = async (values) => {
    if (!selectedTest || !selectedTest.id) {
      message.error('Không tìm thấy bài kiểm tra để cập nhật');
      return;
    }

    setLoading(true);
    try {
      const examId = selectedTest.id || selectedTest.Id || selectedTest.ID;
      
      // Format dates for API
      const startTime = values.startTime ? dayjs(values.startTime).toISOString() : null;
      const endTime = values.endTime ? dayjs(values.endTime).toISOString() : null;
      
      // Ensure password is always a string or null
      let passwordValue = null;
      if (values.password !== undefined && values.password !== null && values.password !== '') {
        // Convert to string explicitly to handle numbers
        passwordValue = String(values.password).trim();
        // If after trimming it's empty, set to null
        if (passwordValue === '') {
          passwordValue = null;
        }
      }
      
      const examData = {
        title: values.title || '',
        description: values.description || '',
        createdByTeacher: currentUserId || 1, // Backend will override from JWT anyway, but required field
        gradeLevel: values.learningLevel ? parseInt(values.learningLevel.replace('Lớp ', '')) : null,
        durationMinutes: values.duration || null,
        passThreshold: values.passThreshold !== undefined && values.passThreshold !== null ? values.passThreshold : null,
        showResultsImmediately: values.showResultsImmediately !== undefined ? values.showResultsImmediately : null,
        showCorrectAnswers: values.showCorrectAnswers !== undefined ? values.showCorrectAnswers : null,
        randomizeQuestions: values.randomizeQuestions !== undefined ? values.randomizeQuestions : null,
        randomizeAnswers: values.randomizeAnswers !== undefined ? values.randomizeAnswers : null,
        scoringMethodEnum: values.scoringMethodEnum !== undefined && values.scoringMethodEnum !== null ? values.scoringMethodEnum : null,
        maxAttempts: values.maxAttempts !== undefined && values.maxAttempts !== null ? values.maxAttempts : null,
        startTime: startTime,
        endTime: endTime,
        password: passwordValue,
        totalPoints: values.totalPoints || null,
        totalQuestions: values.totalQuestions || null
      };

      const result = await examService.updateExam(examId, examData);
      
      if (result.success) {
        message.success(result.message || 'Cập nhật bài kiểm tra thành công!');
        setIsCreateModalVisible(false);
        form.resetFields();
        setSelectedTest(null);
        // Refresh exams list
        await loadExams();
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi cập nhật bài kiểm tra!');
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      message.error('Có lỗi xảy ra khi cập nhật bài kiểm tra!');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (testId) => {
    try {
      // Find current test to get current status
      const test = tests.find(t => (t.id || t.Id) === testId);
      if (!test) {
        message.error('Không tìm thấy bài kiểm tra');
        return;
      }

      // Determine new status: Draft(0) <-> Active(2), Inactive(1) <-> Active(2)
      const currentStatusEnum = test.statusEnum !== undefined ? test.statusEnum : (test.status === 'active' ? 2 : (test.status === 'inactive' ? 1 : 0));
      const newStatusEnum = currentStatusEnum === 2 ? 0 : 2; // Toggle between Active(2) and Draft(0)

      const result = await examService.updateExamStatus(testId, newStatusEnum);
      
      if (result.success) {
        message.success('Cập nhật trạng thái thành công!');
        // Refresh exams list
        await loadExams();
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi cập nhật trạng thái!');
      }
    } catch (error) {
      console.error('Error updating exam status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const handleDeleteTest = (testId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài kiểm tra này? Hành động này không thể hoàn tác.',
      onOk: async () => {
        // Note: Backend doesn't have delete exam endpoint in the image
        // For now, we'll just show a message
        // If delete endpoint exists, call examService.deleteExam(testId)
        message.warning('Chức năng xóa bài kiểm tra chưa được triển khai ở backend');
      }
    });
  };

  const getStatusTag = (status, statusEnum) => {
    // Handle both string status and numeric statusEnum
    let statusValue = status;
    if (statusEnum !== undefined && statusEnum !== null) {
      statusValue = statusEnum === 0 ? 'draft' : (statusEnum === 2 ? 'active' : 'inactive');
    }
    
    const statusConfig = {
      active: { color: 'green', text: 'Đang hoạt động' },
      draft: { color: 'orange', text: 'Bản nháp' },
      inactive: { color: 'red', text: 'Tạm dừng' }
    };
    const config = statusConfig[statusValue] || { color: 'default', text: statusValue || status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const testColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.learningLevel} • {record.difficulty}
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => getStatusTag(status, record.statusEnum)
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      render: (count, record) => {
        const questionCount = count || record.TotalQuestions || 0;
        return `${questionCount} câu`;
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration, record) => {
        const durationMinutes = duration || record.DurationMinutes || 0;
        return `${durationMinutes} phút`;
      }
    },
    {
      title: 'Lần thử',
      dataIndex: 'studentAttempts',
      key: 'studentAttempts',
      render: (attempts) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{attempts}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>học sinh</div>
        </div>
      )
    },
    {
      title: 'Điểm TB',
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score) => score > 0 ? `${score}/10` : '-'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditTest(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}>
            <Button 
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
              size="small"
              onClick={() => handleToggleStatus(record.id)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              icon={<DeleteOutlined />} 
              size="small"
              danger
              onClick={() => handleDeleteTest(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const studentColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mã học sinh',
      dataIndex: 'studentId',
      key: 'studentId'
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <Tag color={score >= 8 ? 'green' : score >= 6 ? 'orange' : 'red'}>
          {score}/10
        </Tag>
      )
    },
    {
      title: 'Thời gian làm bài',
      dataIndex: 'attemptTime',
      key: 'attemptTime'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? 'Hoàn thành' : 'Đang làm'}
        </Tag>
      )
    }
  ];

  return (
    <div className="chemistry-page">
      <div className="chemistry-molecules-bg"></div>
      {/* Header */}
      <Card className="chemistry-header-card" style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ExperimentOutlined style={{ fontSize: 32, marginRight: 16 }} />
              <div>
                <Title level={2} className="chemistry-title" style={{ margin: 0 }}>
                  Quản lý Bài kiểm tra
                </Title>
                <Text className="chemistry-subtitle" style={{ fontSize: '16px' }}>
                  Tạo và quản lý các bài kiểm tra cho học sinh
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Space>
              <Button
                onClick={() => navigate('/dashboard')}
                size="large"
                style={{ height: 48, fontSize: '16px' }}
              >
                Quay lại Dashboard
              </Button>
              <Button
                type="primary"
                className="chemistry-btn-primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsCreateModalVisible(true)}
                style={{ height: 48, fontSize: '16px' }}
              >
                Tạo bài kiểm tra
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="chemistry-stat-card">
            <Statistic
              title="Tổng bài kiểm tra"
              value={tests.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="chemistry-stat-card">
            <Statistic
              title="Đang hoạt động"
              value={tests.filter(t => t.status === 'active').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="chemistry-stat-card">
            <Statistic
              title="Tổng lần thử"
              value={tests.reduce((sum, test) => sum + test.studentAttempts, 0)}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="chemistry-stat-card">
            <Statistic
              title="Điểm TB"
              value={tests.length > 0 ? (tests.reduce((sum, test) => sum + test.averageScore, 0) / tests.length).toFixed(1) : 0}
              suffix="/10"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Card className="chemistry-card" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={10}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Tìm kiếm bài kiểm tra:</Text>
            </div>
            <Search
              placeholder="Nhập tiêu đề hoặc mô tả..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => loadExams()}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Lọc theo trạng thái:</Text>
            </div>
            <Select
              placeholder="Tất cả"
              allowClear
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value={0}>Bản nháp</Option>
              <Option value={1}>Tạm dừng</Option>
              <Option value={2}>Đang hoạt động</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Test List */}
      <Card className="chemistry-card">
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Danh sách bài kiểm tra
          </Title>
          <Text type="secondary">
            Hiển thị {filteredTests.length} bài kiểm tra
          </Text>
        </div>
        <div className="chemistry-table">
          <Table
            columns={testColumns}
            dataSource={filteredTests}
            rowKey={(record) => record.id || record.Id || Math.random()}
            loading={fetching}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài kiểm tra`
            }}
          />
        </div>
      </Card>

      {/* Create/Edit Test Modal */}
      <Modal
        className="chemistry-modal"
        title={selectedTest ? "Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra mới"}
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setSelectedTest(null);
          form.resetFields();
        }}
        afterClose={() => {
          setSelectedTest(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedTest ? handleUpdateTest : handleCreateTest}
          initialValues={{
            duration: 45,
            totalQuestions: 20,
            totalPoints: 100,
            showResultsImmediately: true,
            showCorrectAnswers: true,
            randomizeQuestions: false,
            randomizeAnswers: false
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tiêu đề bài kiểm tra"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input placeholder="Nhập tiêu đề bài kiểm tra..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="learningLevel"
                label="Cấp độ học"
                rules={[{ required: true, message: 'Vui lòng chọn cấp độ học!' }]}
              >
                <Select placeholder="Chọn cấp độ học">
                  <Option value="Lớp 10">Lớp 10</Option>
                  <Option value="Lớp 11">Lớp 11</Option>
                  <Option value="Lớp 12">Lớp 12</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="questionBankId"
                label="Ngân hàng câu hỏi"
                tooltip="Chọn ngân hàng câu hỏi (tùy chọn - chỉ để tham khảo)"
              >
                <Select 
                  placeholder="Chọn ngân hàng câu hỏi (tùy chọn)"
                  loading={loadingQuestionBanks}
                  allowClear
                >
                  {questionBanks.map(bank => (
                    <Option key={bank.id} value={bank.id}>
                      {bank.name} {bank.gradeLevel ? `(Lớp ${bank.gradeLevel})` : ''} - {bank.questionCount} câu hỏi
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="examMatrixId"
                label="Ma trận đề"
                tooltip="Chọn ma trận đề để tạo bài thi tự động từ ma trận. Nếu không chọn, bạn sẽ tạo bài thi thủ công."
              >
                <Select 
                  placeholder="Chọn ma trận đề (tùy chọn)"
                  loading={loadingExamMatrices}
                  allowClear
                >
                  {examMatrices.map(matrix => (
                    <Option key={matrix.id} value={matrix.id}>
                      {matrix.name} ({matrix.totalQuestions} câu, {matrix.totalPoints} điểm)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.examMatrixId !== currentValues.examMatrixId}>
            {({ getFieldValue }) => {
              const examMatrixId = getFieldValue('examMatrixId');
              if (examMatrixId) {
                return (
                  <Row>
                    <Col span={24}>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 16 }}>
                        <ExperimentOutlined /> Bài thi sẽ được tạo tự động từ ma trận đề đã chọn. Các câu hỏi sẽ được chọn ngẫu nhiên theo cấu hình ma trận.
                      </Text>
                    </Col>
                  </Row>
                );
              }
              return null;
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="duration"
                label="Thời gian (phút)"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
              >
                <InputNumber min={1} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="totalQuestions"
                label="Số câu hỏi"
                rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi!' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="totalPoints"
                label="Tổng điểm"
                rules={[{ required: true, message: 'Vui lòng nhập tổng điểm!' }]}
              >
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả bài kiểm tra..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="passThreshold"
                label="Ngưỡng điểm đạt"
                tooltip="Điểm tối thiểu để đạt (ví dụ: 5.0)"
              >
                <InputNumber 
                  min={0} 
                  max={10} 
                  step={0.1}
                  style={{ width: '100%' }} 
                  placeholder="5.0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxAttempts"
                label="Số lần thử tối đa"
                tooltip="Số lần học sinh có thể làm bài (0 = không giới hạn)"
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="1"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="scoringMethodEnum"
                label="Phương thức chấm điểm"
                tooltip="0=Trung bình, 1=Cao nhất, 2=Lần làm gần nhất"
              >
                <Select style={{ width: '100%' }} placeholder="Chọn phương thức">
                  <Option value={0}>Trung bình các lần làm</Option>
                  <Option value={1}>Điểm cao nhất</Option>
                  <Option value={2}>Lần làm gần nhất</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Thời gian bắt đầu"
                tooltip="Thời gian bắt đầu cho phép làm bài"
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian bắt đầu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="Thời gian kết thúc"
                tooltip="Thời gian kết thúc cho phép làm bài"
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian kết thúc"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Mật khẩu truy cập"
            tooltip="Mật khẩu để học sinh có thể truy cập bài thi (tùy chọn)"
          >
            <Input.Password 
              placeholder="Nhập mật khẩu (để trống nếu không cần)"
              allowClear
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="showResultsImmediately"
                label="Hiển thị kết quả ngay"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="showCorrectAnswers"
                label="Hiển thị đáp án đúng"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="randomizeQuestions"
                label="Xáo trộn câu hỏi"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="randomizeAnswers"
                label="Xáo trộn đáp án"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" className="chemistry-btn-primary" htmlType="submit" loading={loading}>
                {selectedTest ? 'Cập nhật' : 'Tạo bài kiểm tra'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Test Details Modal */}
      <Modal
        className="chemistry-modal"
        title={`Chi tiết bài kiểm tra: ${selectedTest?.title}`}
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedTest && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card className="chemistry-stat-card">
                  <Statistic
                    title="Tổng lần thử"
                    value={selectedTest.studentAttempts}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="chemistry-stat-card">
                  <Statistic
                    title="Điểm trung bình"
                    value={selectedTest.averageScore}
                    suffix="/10"
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="chemistry-stat-card">
                  <Statistic
                    title="Tỷ lệ đạt"
                    value={selectedTest.passRate}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Thông tin bài kiểm tra</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Tiêu đề:</Text> {selectedTest.title}
                </Col>
                <Col span={12}>
                  <Text strong>Độ khó:</Text> {selectedTest.difficulty}
                </Col>
                <Col span={12}>
                  <Text strong>Cấp độ học:</Text> {selectedTest.learningLevel}
                </Col>
                <Col span={12}>
                  <Text strong>Thời gian:</Text> {selectedTest.duration} phút
                </Col>
                <Col span={12}>
                  <Text strong>Số câu hỏi:</Text> {selectedTest.totalQuestions}
                </Col>
                <Col span={12}>
                  <Text strong>Tổng điểm:</Text> {selectedTest.totalPoints}
                </Col>
              </Row>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Danh sách học sinh đã làm bài</Title>
              <Table
                columns={studentColumns}
                dataSource={mockStudents}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </div>

            <div>
              <Title level={5}>Biểu đồ thống kê điểm số</Title>
              <div style={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 8
              }}>
                <Text type="secondary">Biểu đồ thống kê điểm số sẽ được hiển thị ở đây</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageTestPage;
