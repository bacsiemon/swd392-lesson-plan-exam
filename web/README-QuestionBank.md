# Hệ thống Quản lý Ngân hàng Câu hỏi Hóa học

## 🧪 Giới thiệu

Hệ thống này được thiết kế đặc biệt cho giáo viên Hóa học từ lớp 8 đến lớp 12, giúp tạo và quản lý ngân hàng câu hỏi một cách hiệu quả và chuyên nghiệp.

## ✨ Tính năng chính

### 🏦 Quản lý Ngân hàng Câu hỏi
- **Tạo ngân hàng mới**: Tạo ngân hàng câu hỏi cho từng lớp và chủ đề cụ thể
- **Phân loại theo lớp**: Hỗ trợ từ lớp 8 đến lớp 12 với các chủ đề Hóa học phù hợp
- **Quản lý trạng thái**: Theo dõi trạng thái duyệt (Chờ duyệt, Đã duyệt, Bị từ chối)
- **Tìm kiếm và lọc**: Lọc theo lớp, trạng thái, tìm kiếm theo tên

### ❓ Quản lý Câu hỏi
- **Loại câu hỏi đa dạng**: 
  - Trắc nghiệm (Multiple Choice)
  - Điền vào chỗ trống (Fill in the Blank)
- **Phân cấp độ khó**: Dễ, Trung bình, Khó
- **Xem trước câu hỏi**: Preview câu hỏi trước khi lưu
- **Giải thích đáp án**: Thêm giải thích chi tiết cho từng câu hỏi

### 📊 Thống kê và Báo cáo
- **Dashboard tổng quan**: Số liệu thống kê về ngân hàng và câu hỏi
- **Phân tích theo độ khó**: Theo dõi tỉ lệ câu hỏi dễ/trung bình/khó
- **Số lượng câu hỏi**: Đếm số câu hỏi trong mỗi ngân hàng

## 🚀 Hướng dẫn sử dụng

### Bước 1: Truy cập hệ thống
1. Mở trình duyệt và truy cập vào ứng dụng
2. Đăng nhập với tài khoản giáo viên
3. Chọn "Ngân hàng câu hỏi" trong menu navigation

### Bước 2: Tạo Ngân hàng Câu hỏi
1. Click nút **"Tạo ngân hàng mới"**
2. Điền thông tin:
   - **Tên ngân hàng**: Đặt tên rõ ràng, ví dụ "Ngân hàng câu hỏi Hóa học 10 - Nguyên tử"
   - **Lớp học**: Chọn từ lớp 8-12
   - **Chủ đề**: Chọn chủ đề phù hợp với lớp học
   - **Mô tả**: Mô tả chi tiết nội dung và mục đích
3. Click **"Tạo ngân hàng"**

### Bước 3: Thêm Câu hỏi
1. Trong danh sách ngân hàng, click vào biểu tượng **👁️** (Xem) để quản lý câu hỏi
2. Click **"Thêm câu hỏi mới"**
3. Điền thông tin câu hỏi:
   - **Tiêu đề**: Tên ngắn gọn của câu hỏi
   - **Nội dung**: Nội dung chi tiết câu hỏi
   - **Loại câu hỏi**: Chọn Trắc nghiệm hoặc Điền chỗ trống
   - **Độ khó**: Chọn mức độ phù hợp

#### Đối với câu hỏi Trắc nghiệm:
- Thêm các lựa chọn A, B, C, D
- Đánh dấu đáp án đúng
- Có thể thêm giải thích

#### Đối với câu hỏi Điền chỗ trống:
- Trong nội dung câu hỏi, sử dụng `_____` để đánh dấu chỗ trống
- Cung cấp đáp án đúng cho từng chỗ trống
- Có thể thêm đáp án thay thế

### Bước 4: Quản lý và Theo dõi
- **Xem trước**: Sử dụng tính năng preview để kiểm tra câu hỏi
- **Chỉnh sửa**: Cập nhật thông tin khi cần thiết
- **Thống kê**: Theo dõi số liệu trên dashboard

## 🎯 Lợi ích

### Cho Giáo viên:
- ⏰ **Tiết kiệm thời gian**: Tạo và quản lý câu hỏi hiệu quả
- 📚 **Tổ chức tốt**: Phân loại rõ ràng theo lớp và chủ đề
- 🔍 **Dễ tìm kiếm**: Hệ thống lọc và tìm kiếm mạnh mẽ
- 📊 **Theo dõi tiến độ**: Dashboard và thống kê chi tiết

### Cho Học sinh:
- 🎯 **Câu hỏi chất lượng**: Được thiết kế bởi giáo viên chuyên môn
- 📖 **Giải thích rõ ràng**: Mỗi câu hỏi đều có giải thích chi tiết
- 🔄 **Đa dạng hình thức**: Nhiều loại câu hỏi khác nhau

## 💡 Mẹo sử dụng hiệu quả

1. **Đặt tên có ý nghĩa**: Sử dụng quy tắc đặt tên thống nhất
2. **Phân loại rõ ràng**: Tạo ngân hàng riêng cho từng chủ đề
3. **Cân bằng độ khó**: Phối hợp câu dễ, trung bình và khó
4. **Kiểm tra kỹ**: Luôn xem trước câu hỏi trước khi lưu
5. **Cập nhật thường xuyên**: Bổ sung và cải thiện liên tục

## 🛠️ Công nghệ sử dụng

### Frontend:
- **React 18**: Framework JavaScript hiện đại
- **Ant Design**: Thư viện UI components đẹp và chuyên nghiệp
- **React Router**: Điều hướng SPA
- **Vite**: Build tool nhanh chóng

### Architecture:
- **Component-based**: Tách biệt rõ ràng các thành phần
- **Service Layer**: Quản lý API calls tập trung
- **Constants**: Quản lý hằng số và cấu hình
- **Modern ES6+**: Sử dụng JavaScript hiện đại

## 📋 Cấu trúc Project

```
src/
├── components/          # Các component tái sử dụng
│   ├── QuestionBankForm.jsx
│   ├── QuestionForm.jsx
│   ├── QuestionPreview.jsx
│   ├── QuestionManagement.jsx
│   └── ...
├── pages/              # Các trang chính
│   ├── QuestionBankManagement.jsx
│   └── ...
├── services/           # API services
│   └── questionBankService.js
├── constants/          # Constants và configs
│   └── questionBankConstants.js
└── ...
```

## 🔮 Phát triển tương lai

- 🤖 **AI hỗ trợ**: Tạo câu hỏi tự động bằng AI
- 📱 **Mobile App**: Ứng dụng di động
- 🔄 **Import/Export**: Nhập/xuất câu hỏi từ Excel
- 👥 **Chia sẻ**: Chia sẻ ngân hàng câu hỏi giữa các giáo viên
- 📈 **Analytics**: Phân tích chi tiết hơn

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:
- 📧 Email: support@chemistrybank.edu.vn
- 📱 Hotline: 1900-xxx-xxx

---

**Chemistry Bank** - *Giải pháp quản lý câu hỏi Hóa học chuyên nghiệp cho giáo viên Việt Nam* 🇻🇳