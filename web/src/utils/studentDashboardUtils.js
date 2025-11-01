// Brand colors for the student dashboard
export const BRAND_COLORS = {
  LESSON: '#1890ff',
  EXAM: '#52c41a',
  PROGRESS: '#faad14',
  ACHIEVEMENT: '#eb2f96',
  STUDY: '#722ed1',
};

// Mock student statistics data
export const studentStats = {
  totalLessons: 24,
  completedLessons: 18,
  totalExams: 8,
  completedExams: 6,
  averageScore: 85,
  studyStreak: 7,
};

// Mock recent lessons data
export const recentLessons = [
  {
    id: 1,
    title: 'Phản ứng oxi hóa - khử',
    subject: 'Hóa học 10',
    progress: 100,
    status: 'completed',
    date: '2024-01-15',
  },
  {
    id: 2,
    title: 'Cân bằng phương trình hóa học',
    subject: 'Hóa học 10',
    progress: 75,
    status: 'in-progress',
    date: '2024-01-14',
  },
  {
    id: 3,
    title: 'Tính chất của kim loại',
    subject: 'Hóa học 10',
    progress: 0,
    status: 'not-started',
    date: '2024-01-16',
  },
];

// Mock upcoming exams data
export const upcomingExams = [
  {
    id: 1,
    title: 'Kiểm tra 1 tiết - Chương 1',
    subject: 'Hóa học 10',
    date: '2024-01-20',
    time: '08:00',
    duration: 45,
    type: 'exam',
  },
  {
    id: 2,
    title: 'Bài tập về nhà - Phản ứng hóa học',
    subject: 'Hóa học 10',
    date: '2024-01-18',
    time: '23:59',
    duration: 30,
    type: 'homework',
  },
];

// Mock achievements data
export const achievements = [
  {
    id: 1,
    title: 'Học sinh chăm chỉ',
    description: 'Hoàn thành 5 bài học liên tiếp',
    icon: '🏆',
    earned: true,
  },
  {
    id: 2,
    title: 'Thiên tài hóa học',
    description: 'Đạt điểm 10 trong 3 bài kiểm tra',
    icon: '🧪',
    earned: false,
  },
  {
    id: 3,
    title: 'Người học nhanh',
    description: 'Hoàn thành bài học trong thời gian kỷ lục',
    icon: '⚡',
    earned: true,
  },
];

// CSS for liquid glass animations
export const liquidGlassStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes floatReverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(20px) rotate(-180deg); }
  }
`;

// Function to inject CSS styles
export const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = liquidGlassStyles;
    document.head.appendChild(styleSheet);
  }
};
