import api from './axios';

/**
 * AI Service - Tích hợp với Gemini API qua backend
 */

/**
 * Tạo giáo án sử dụng AI (Gemini 2.5 Flash)
 * @param {Object} params - Tham số tạo giáo án
 * @param {string} params.prompt - Mô tả chi tiết về nội dung giáo án (tiếng Việt)
 * @param {number} params.gradeLevel - Cấp lớp (8-12)
 * @param {number} params.numberOfSlots - Số tiết học (mặc định: 3, tối đa: 60)
 * @param {number} params.durationMinutesPerSlot - Thời lượng mỗi tiết (phút, mặc định: 45, tối đa: 240)
 * @returns {Promise<Object>} Giáo án được tạo bởi AI
 */
export const generateLessonPlanWithAI = async ({
  prompt,
  gradeLevel,
  numberOfSlots = 3,
  durationMinutesPerSlot = 45
}) => {
  try {
    const response = await api.post('/api/lessonplan/generate-doc-ai', {
      prompt,
      gradeLevel,
      numberOfSlots,
      durationMinutesPerSlot
    }, {
      responseType: 'blob' // Backend trả về file Word
    });

    return {
      success: true,
      data: response.data,
      message: 'Tạo giáo án thành công với AI'
    };
  } catch (error) {
    console.error('AI Generation Error:', error);
    
    let errorMessage = 'Có lỗi xảy ra khi tạo giáo án với AI';
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400) {
        errorMessage = 'Thông tin không hợp lệ. Vui lòng kiểm tra lại prompt và các tham số.';
      } else if (status === 401) {
        errorMessage = 'Bạn cần đăng nhập với tài khoản giáo viên để sử dụng tính năng này.';
      } else if (status === 500) {
        errorMessage = 'AI không thể tạo giáo án. Vui lòng thử lại sau.';
      }
      
      // Nếu backend trả về message cụ thể
      if (data && data.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.';
    }

    return {
      success: false,
      error: errorMessage,
      message: errorMessage
    };
  }
};

/**
 * Download file Word được tạo bởi AI
 * @param {Blob} blob - File blob từ response
 * @param {string} fileName - Tên file (mặc định: giaoan_YYYYMMDD_HHmmss.docx)
 */
export const downloadAIGeneratedFile = (blob, fileName) => {
  if (!fileName) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    fileName = `giaoan_${dateStr}_${timeStr}.docx`;
  }

  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default {
  generateLessonPlanWithAI,
  downloadAIGeneratedFile
};
