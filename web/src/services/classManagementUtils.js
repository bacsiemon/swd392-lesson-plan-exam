// Mock data for class management
export const classes = [
  { value: 'CHEM101', label: 'Hóa học Cơ bản 10A' },
  { value: 'CHEM102', label: 'Hóa học Nâng cao 11B' },
  { value: 'CHEM201', label: 'Hóa học Hữu cơ 12A' },
];

export const students = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    studentId: 'HS001',
    email: 'an.nguyen@student.edu.vn',
    avatar: null,
    studyProgress: 85,
    testScores: [8.5, 9.0, 7.5, 8.0, 9.5],
    averageScore: 8.5,
    totalLessons: 24,
    completedLessons: 20,
    totalTests: 8,
    completedTests: 7,
    lastActive: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    studentId: 'HS002',
    email: 'binh.tran@student.edu.vn',
    avatar: null,
    studyProgress: 92,
    testScores: [9.0, 9.5, 8.5, 9.0, 9.5],
    averageScore: 9.1,
    totalLessons: 24,
    completedLessons: 22,
    totalTests: 8,
    completedTests: 8,
    lastActive: '2024-01-15',
    status: 'active'
  },
  {
    id: 3,
    name: 'Lê Văn Cường',
    studentId: 'HS003',
    email: 'cuong.le@student.edu.vn',
    avatar: null,
    studyProgress: 78,
    testScores: [7.0, 8.0, 7.5, 8.5, 7.0],
    averageScore: 7.6,
    totalLessons: 24,
    completedLessons: 19,
    totalTests: 8,
    completedTests: 6,
    lastActive: '2024-01-14',
    status: 'active'
  },
  {
    id: 4,
    name: 'Phạm Thị Dung',
    studentId: 'HS004',
    email: 'dung.pham@student.edu.vn',
    avatar: null,
    studyProgress: 95,
    testScores: [9.5, 9.0, 9.5, 9.5, 10.0],
    averageScore: 9.5,
    totalLessons: 24,
    completedLessons: 23,
    totalTests: 8,
    completedTests: 8,
    lastActive: '2024-01-15',
    status: 'active'
  },
  {
    id: 5,
    name: 'Hoàng Văn Em',
    studentId: 'HS005',
    email: 'em.hoang@student.edu.vn',
    avatar: null,
    studyProgress: 65,
    testScores: [6.5, 7.0, 6.0, 7.5, 6.5],
    averageScore: 6.7,
    totalLessons: 24,
    completedLessons: 16,
    totalTests: 8,
    completedTests: 5,
    lastActive: '2024-01-13',
    status: 'inactive'
  }
];

// Helper functions
export const getScoreColor = (score) => {
  if (score >= 9) return '#52c41a';
  if (score >= 8) return '#1890ff';
  if (score >= 7) return '#faad14';
  if (score >= 6) return '#fa8c16';
  return '#f5222d';
};

export const getProgressColor = (progress) => {
  if (progress >= 90) return '#52c41a';
  if (progress >= 80) return '#1890ff';
  if (progress >= 70) return '#faad14';
  if (progress >= 60) return '#fa8c16';
  return '#f5222d';
};

export const getStatusTag = (status) => {
  switch (status) {
    case 'active':
      return { color: 'green', text: 'Hoạt động' };
    case 'inactive':
      return { color: 'red', text: 'Không hoạt động' };
    default:
      return { color: 'default', text: 'Không xác định' };
  }
};

// Calculate class statistics
export const calculateClassStats = (students) => {
  return {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    averageScore: (students.reduce((sum, s) => sum + s.averageScore, 0) / students.length).toFixed(1),
    averageProgress: Math.round(students.reduce((sum, s) => sum + s.studyProgress, 0) / students.length),
    totalLessons: students[0]?.totalLessons || 0,
    totalTests: students[0]?.totalTests || 0,
  };
};

// Filter students based on search text
export const filterStudents = (students, searchText) => {
  return students.filter(student =>
    student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
    student.email.toLowerCase().includes(searchText.toLowerCase())
  );
};

// CSS for liquid glass animations and table styling
export const liquidGlassStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes floatReverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(20px) rotate(-180deg); }
  }

  .glass-table {
    background: transparent !important;
  }

  .glass-table .ant-table {
    background: transparent !important;
  }

  .glass-table .ant-table-container {
    background: transparent !important;
  }

  .glass-table .ant-table-content {
    background: transparent !important;
  }

  .glass-table .ant-table-thead > tr > th {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    font-weight: 600 !important;
  }

  .glass-table .ant-table-tbody > tr > td {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.8) !important;
  }

  .glass-table .ant-table-tbody > tr {
    background: rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(5px) !important;
    -webkit-backdrop-filter: blur(5px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    transition: all 0.3s ease !important;
  }

  .glass-table .ant-table-tbody > tr:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  }

  .glass-table .ant-table-tbody > tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.03) !important;
  }

  .glass-table .ant-table-tbody > tr:nth-child(odd) {
    background: rgba(255, 255, 255, 0.05) !important;
  }

  .glass-table .ant-pagination {
    color: rgba(255, 255, 255, 0.8) !important;
  }

  .glass-table .ant-pagination .ant-pagination-item {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }

  .glass-table .ant-pagination .ant-pagination-item a {
    color: rgba(255, 255, 255, 0.8) !important;
  }

  .glass-table .ant-pagination .ant-pagination-item-active {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
  }

  .glass-table .ant-pagination .ant-pagination-item-active a {
    color: rgba(255, 255, 255, 1) !important;
  }

  .glass-table .ant-pagination .ant-pagination-prev,
  .glass-table .ant-pagination .ant-pagination-next {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: rgba(255, 255, 255, 0.8) !important;
  }

  .glass-table .ant-pagination .ant-pagination-prev:hover,
  .glass-table .ant-pagination .ant-pagination-next:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    color: rgba(255, 255, 255, 1) !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = liquidGlassStyles;
  document.head.appendChild(styleSheet);
}
