// Constants cho Question Bank Management dành cho giáo viên Hóa học

export const CHEMISTRY_GRADES = [
  { value: 8, label: 'Lớp 8' },
  { value: 9, label: 'Lớp 9' },
  { value: 10, label: 'Lớp 10' },
  { value: 11, label: 'Lớp 11' },
  { value: 12, label: 'Lớp 12' }
];

export const CHEMISTRY_TOPICS = {
  8: [
    'Không khí - Oxi',
    'Hiđro - Nước',
    'Dung dịch',
    'Axit - Bazơ - Muối'
  ],
  9: [
    'Phi kim',
    'Kim loại',
    'Cacbon và hợp chất của cacbon',
    'Nhóm nitơ và photpho'
  ],
  10: [
    'Nguyên tử',
    'Bảng tuần hoàn',
    'Liên kết hóa học',
    'Phản ứng oxi hóa - khử',
    'Nhóm halogen',
    'Oxi - lưu huỳnh'
  ],
  11: [
    'Cấu tạo nguyên tử',
    'Bảng tuần hoàn và định luật tuần hoàn',
    'Liên kết hóa học',
    'Phản ứng trong dung dịch nước',
    'Nitơ và photpho',
    'Cacbon và silic',
    'Kim loại'
  ],
  12: [
    'Este - Lipit',
    'Cacbohiđrat',
    'Amin - Amino axit - Protein',
    'Polime',
    'Đại cương về kim loại',
    'Kim loại kiềm, kiềm thổ, nhôm',
    'Sắt và một số kim loại quan trọng'
  ]
};

// Loại câu hỏi dựa trên backend EQuestionType enum
export const QUESTION_TYPES = [
  { value: 0, label: 'Trắc nghiệm', key: 'MultipleChoice' },
  { value: 1, label: 'Điền vào chỗ trống', key: 'FillBlank' }
];

// Độ khó câu hỏi
export const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Dễ', color: 'green' },
  { value: 2, label: 'Trung bình', color: 'orange' },
  { value: 3, label: 'Khó', color: 'red' }
];

// Trạng thái phê duyệt dựa trên backend EApprovalStatus enum
export const APPROVAL_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2
};

export const APPROVAL_STATUS_LABELS = [
  { value: 0, label: 'Chờ duyệt', color: 'processing' },
  { value: 1, label: 'Đã duyệt', color: 'success' },
  { value: 2, label: 'Bị từ chối', color: 'error' }
];

// Cấu hình pagination mặc định
export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
};

// Cấu hình form validation
export const VALIDATION_RULES = {
  questionBankName: {
    required: { required: true, message: 'Vui lòng nhập tên ngân hàng câu hỏi' },
    minLength: { min: 5, message: 'Tên phải có ít nhất 5 ký tự' },
    maxLength: { max: 200, message: 'Tên không được quá 200 ký tự' }
  },
  description: {
    required: { required: true, message: 'Vui lòng nhập mô tả' },
    minLength: { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
    maxLength: { max: 500, message: 'Mô tả không được quá 500 ký tự' }
  },
  questionTitle: {
    required: { required: true, message: 'Vui lòng nhập tiêu đề câu hỏi' },
    minLength: { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
    maxLength: { max: 200, message: 'Tiêu đề không được quá 200 ký tự' }
  },
  questionContent: {
    required: { required: true, message: 'Vui lòng nhập nội dung câu hỏi' },
    minLength: { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự' },
    maxLength: { max: 1000, message: 'Nội dung không được quá 1000 ký tự' }
  }
};