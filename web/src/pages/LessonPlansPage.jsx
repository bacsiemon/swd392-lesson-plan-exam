import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Input, 
  Button, 
  Select,
  Card,
  Tag,
  Space,
  Badge,
  Progress,
  Modal,
  Divider
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined,
  StarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const LessonPlansPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mock lesson plans data
  const lessonPlans = [
    {
      id: 1,
      title: 'Cấu trúc nguyên tử và bảng tuần hoàn',
      description: 'Tìm hiểu về cấu trúc nguyên tử, các hạt cơ bản và cách sắp xếp các nguyên tố trong bảng tuần hoàn.',
      grade: '10',
      subject: 'Hóa học',
      teacher: 'Cô Nguyễn Thị Lan',
      duration: '45 phút',
      difficulty: 'Trung bình',
      status: 'available',
      progress: 0,
      content: {
        objectives: [
          'Hiểu được cấu trúc cơ bản của nguyên tử',
          'Nắm vững cách đọc bảng tuần hoàn',
          'Phân biệt được các nguyên tố kim loại và phi kim'
        ],
        materials: [
          'Mô hình nguyên tử',
          'Bảng tuần hoàn các nguyên tố',
          'Bài tập thực hành'
        ],
        activities: [
          'Quan sát mô hình nguyên tử',
          'Thực hành đọc bảng tuần hoàn',
          'Làm bài tập nhận biết nguyên tố'
        ]
      },
      attachments: ['bai-giang-nguyen-tu.pdf', 'bai-tap-thuc-hanh.docx'],
      createdAt: '2024-01-15',
      dueDate: '2024-01-25'
    },
    {
      id: 2,
      title: 'Liên kết hóa học và phân tử',
      description: 'Khám phá các loại liên kết hóa học: ion, cộng hóa trị và kim loại.',
      grade: '10',
      subject: 'Hóa học',
      teacher: 'Thầy Trần Văn Minh',
      duration: '50 phút',
      difficulty: 'Khó',
      status: 'available',
      progress: 30,
      content: {
        objectives: [
          'Hiểu được bản chất của liên kết ion',
          'Phân biệt liên kết cộng hóa trị phân cực và không phân cực',
          'Giải thích được tính chất của các hợp chất'
        ],
        materials: [
          'Mô hình phân tử',
          'Video minh họa',
          'Bài tập trắc nghiệm'
        ],
        activities: [
          'Xem video minh họa',
          'Thực hành với mô hình phân tử',
          'Làm bài tập trắc nghiệm'
        ]
      },
      attachments: ['video-lien-ket-hoa-hoc.mp4', 'bai-tap-trac-nghiem.pdf'],
      createdAt: '2024-01-12',
      dueDate: '2024-01-22'
    },
    {
      id: 3,
      title: 'Phản ứng oxi hóa - khử',
      description: 'Tìm hiểu về phản ứng oxi hóa - khử, cách cân bằng phương trình và ứng dụng trong thực tế.',
      grade: '11',
      subject: 'Hóa học',
      teacher: 'Cô Lê Thị Hoa',
      duration: '60 phút',
      difficulty: 'Khó',
      status: 'completed',
      progress: 100,
      content: {
        objectives: [
          'Hiểu được khái niệm oxi hóa - khử',
          'Biết cách cân bằng phương trình oxi hóa - khử',
          'Áp dụng vào các bài toán thực tế'
        ],
        materials: [
          'Bảng tính oxi hóa',
          'Bài tập cân bằng phương trình',
          'Video hướng dẫn'
        ],
        activities: [
          'Học lý thuyết oxi hóa - khử',
          'Thực hành cân bằng phương trình',
          'Làm bài tập ứng dụng'
        ]
      },
      attachments: ['ly-thuyet-oxi-hoa-khu.pdf', 'bai-tap-can-bang.pdf'],
      createdAt: '2024-01-10',
      dueDate: '2024-01-20'
    },
    {
      id: 4,
      title: 'Hidrocacbon no và không no',
      description: 'Nghiên cứu về các hợp chất hidrocacbon: ankan, anken, ankin và tính chất của chúng.',
      grade: '11',
      subject: 'Hóa học',
      teacher: 'Thầy Phạm Văn Đức',
      duration: '55 phút',
      difficulty: 'Trung bình',
      status: 'available',
      progress: 0,
      content: {
        objectives: [
          'Nhận biết được các loại hidrocacbon',
          'Hiểu được tính chất vật lý và hóa học',
          'Viết được công thức cấu tạo'
        ],
        materials: [
          'Mô hình phân tử hidrocacbon',
          'Bảng tính chất',
          'Bài tập nhận biết'
        ],
        activities: [
          'Quan sát mô hình phân tử',
          'Học tính chất các hidrocacbon',
          'Làm bài tập nhận biết'
        ]
      },
      attachments: ['mo-hinh-hidrocacbon.pdf', 'tinh-chat-hidrocacbon.docx'],
      createdAt: '2024-01-08',
      dueDate: '2024-01-18'
    }
  ];

  const grades = ['all', '10', '11', '12'];
  const subjects = ['all', 'Hóa học', 'Vật lý', 'Sinh học'];
  const difficulties = ['Dễ', 'Trung bình', 'Khó'];

  const filteredLessons = lessonPlans.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || lesson.grade === selectedGrade;
    const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject;
    
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'blue';
      case 'completed': return 'green';
      case 'overdue': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Có sẵn';
      case 'completed': return 'Đã hoàn thành';
      case 'overdue': return 'Quá hạn';
      default: return 'Không xác định';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Dễ': return 'green';
      case 'Trung bình': return 'orange';
      case 'Khó': return 'red';
      default: return 'default';
    }
  };

  const handleStudyLesson = (lesson) => {
    setSelectedLesson(lesson);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedLesson(null);
  };

  const LessonCard = ({ lesson }) => (
    <Col xs={24} sm={12} lg={8} style={{ marginBottom: 24 }}>
      <Card
        hoverable
        style={{
          height: '100%',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Tag color="blue">Lớp {lesson.grade}</Tag>
              <Tag color={getDifficultyColor(lesson.difficulty)}>{lesson.difficulty}</Tag>
            </div>
            <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: '16px' }}>
              {lesson.title}
            </Title>
            <Paragraph 
              ellipsis={{ rows: 2 }} 
              style={{ margin: 0, color: '#666', fontSize: '14px' }}
            >
              {lesson.description}
            </Paragraph>
          </div>

          {/* Teacher and Duration */}
          <div>
            <Space size="small">
              <UserOutlined style={{ color: '#1890ff' }} />
              <Text style={{ fontSize: '12px', color: '#666' }}>{lesson.teacher}</Text>
            </Space>
            <br />
            <Space size="small" style={{ marginTop: 4 }}>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: '12px', color: '#666' }}>{lesson.duration}</Text>
            </Space>
          </div>

          {/* Progress */}
          {lesson.progress > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: '12px' }}>Tiến độ</Text>
                <Text style={{ fontSize: '12px' }}>{lesson.progress}%</Text>
              </div>
              <Progress 
                percent={lesson.progress} 
                size="small" 
                strokeColor={lesson.progress === 100 ? '#52c41a' : '#1890ff'}
              />
            </div>
          )}

          {/* Status and Actions */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <Badge 
                status={lesson.status === 'completed' ? 'success' : 'processing'} 
                text={getStatusText(lesson.status)}
                style={{ fontSize: '12px' }}
              />
            </div>
            <Space>
              <Button 
                type="primary" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStudyLesson(lesson)}
              >
                Học ngay
              </Button>
              <Button 
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleStudyLesson(lesson)}
              >
                Xem chi tiết
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
    </Col>
  );

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
                  Bài giảng và Tài liệu học tập
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Khám phá các bài giảng được phân phối bởi giáo viên
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Button
              onClick={() => navigate('/student-dashboard')}
              size="large"
              style={{ height: 48, fontSize: '16px' }}
            >
              Quay lại Dashboard
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Lớp học:</Text>
            </div>
            <Select
              value={selectedGrade}
              onChange={setSelectedGrade}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="all">Tất cả lớp</Option>
              {grades.filter(g => g !== 'all').map(grade => (
                <Option key={grade} value={grade}>Lớp {grade}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Môn học:</Text>
            </div>
            <Select
              value={selectedSubject}
              onChange={setSelectedSubject}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="all">Tất cả môn</Option>
              {subjects.filter(s => s !== 'all').map(subject => (
                <Option key={subject} value={subject}>{subject}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Tìm kiếm bài giảng:</Text>
            </div>
            <Search
              placeholder="Nhập tên bài giảng hoặc nội dung..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Col>
        </Row>
      </Card>

      {/* Lesson Plans Grid */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            <BookOutlined style={{ marginRight: 8 }} />
            Danh sách bài giảng ({filteredLessons.length})
          </Title>
          <Text type="secondary">
            Chọn bài giảng để bắt đầu học tập
          </Text>
        </div>
        <Row gutter={[16, 16]}>
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </Row>
      </Card>

      {/* Lesson Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {selectedLesson?.title}
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
          <Button key="study" type="primary" icon={<PlayCircleOutlined />}>
            Bắt đầu học
          </Button>
        ]}
        width={800}
      >
        {selectedLesson && (
          <div>
            {/* Lesson Info */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong>Giáo viên: </Text>
                    <Text>{selectedLesson.teacher}</Text>
                  </div>
                  <div>
                    <Text strong>Lớp: </Text>
                    <Tag color="blue">Lớp {selectedLesson.grade}</Tag>
                  </div>
                  <div>
                    <Text strong>Thời lượng: </Text>
                    <Text>{selectedLesson.duration}</Text>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong>Độ khó: </Text>
                    <Tag color={getDifficultyColor(selectedLesson.difficulty)}>
                      {selectedLesson.difficulty}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Trạng thái: </Text>
                    <Badge 
                      status={selectedLesson.status === 'completed' ? 'success' : 'processing'} 
                      text={getStatusText(selectedLesson.status)}
                    />
                  </div>
                  <div>
                    <Text strong>Hạn nộp: </Text>
                    <Text>{new Date(selectedLesson.dueDate).toLocaleDateString('vi-VN')}</Text>
                  </div>
                </Space>
              </Col>
            </Row>

            <Divider />

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>Mô tả bài học</Title>
              <Paragraph>{selectedLesson.description}</Paragraph>
            </div>

            {/* Objectives */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>Mục tiêu học tập</Title>
              <ul>
                {selectedLesson.content.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            {/* Materials */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>Tài liệu học tập</Title>
              <ul>
                {selectedLesson.content.materials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>

            {/* Activities */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>Hoạt động học tập</Title>
              <ul>
                {selectedLesson.content.activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>

            {/* Attachments */}
            {selectedLesson.attachments && selectedLesson.attachments.length > 0 && (
              <div>
                <Title level={5}>Tài liệu đính kèm</Title>
                <Space direction="vertical">
                  {selectedLesson.attachments.map((attachment, index) => (
                    <Button 
                      key={index}
                      icon={<DownloadOutlined />}
                      size="small"
                    >
                      {attachment}
                    </Button>
                  ))}
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LessonPlansPage;
