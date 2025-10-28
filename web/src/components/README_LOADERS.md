# Chemistry Loaders - Hướng dẫn Sử dụng

Dự án có 2 loại loader với chủ đề hóa học:

## 1. ChemistryPageLoader (Chuyển trang)

### Mô tả
Hiệu ứng loading toàn màn hình với animation phức tạp, tự động hiển thị khi chuyển trang.

### Tính năng
- ⚛️ Cấu trúc phân tử với electron quay quanh hạt nhân
- 🧪 Ống nghiệm với chất lỏng màu sắc và bọt khí
- 📝 Công thức hóa học bay lượn (H₂O, CO₂, NaCl, H₂SO₄)
- ✨ Background gradient đẹp mắt
- 📱 Responsive trên mọi thiết bị

### Sử dụng
Đã được tích hợp tự động trong `App.jsx` - không cần import thêm.

```jsx
// Đã tự động hoạt động khi chuyển trang
// Được quản lý bởi usePageTransition hook
```

### Tùy chỉnh thời gian
Trong `App.jsx`, tìm dòng:
```jsx
const isLoading = usePageTransition(1000); // 1000ms = 1 giây
```

## 2. ChemistryLoader (Inline Loader)

### Mô tả
Loader nhỏ gọn để sử dụng trong các component, card, hoặc khi loading data.

### Tính năng
- ⚛️ Phân tử hóa học đơn giản với hiệu ứng xoay
- 🎨 3 kích thước: small, medium, large
- 💬 Text tùy chỉnh
- 🌈 Light/Dark theme

### Sử dụng

#### Import
```jsx
import ChemistryLoader from '../components/ChemistryLoader';
```

#### Các props
```jsx
<ChemistryLoader 
  size="medium"           // 'small' | 'medium' | 'large'
  text="Đang tải..."     // String hoặc null để ẩn text
/>
```

#### Ví dụ

**1. Loader kích thước trung bình với text**
```jsx
{loading && (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <ChemistryLoader size="medium" text="Đang tải dữ liệu..." />
  </div>
)}
```

**2. Loader nhỏ không có text**
```jsx
{isProcessing && (
  <ChemistryLoader size="small" text={null} />
)}
```

**3. Loader lớn cho trang loading**
```jsx
<div className="loading-container">
  <ChemistryLoader 
    size="large" 
    text="Vui lòng đợi trong giây lát..." 
  />
</div>
```

**4. Trong Card**
```jsx
<Card>
  {loading ? (
    <ChemistryLoader size="small" text="Loading..." />
  ) : (
    <YourContent />
  )}
</Card>
```

## Ví dụ Thực tế

### Trong TeacherDashboard
```jsx
{loading ? (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <ChemistryLoader size="large" text="Đang tải thống kê..." />
  </div>
) : (
  <Dashboard data={stats} />
)}
```

### Trong Button
```jsx
<Button 
  loading={isSubmitting}
  icon={isSubmitting && <ChemistryLoader size="small" />}
>
  Gửi
</Button>
```

## CSS Classes

### ChemistryPageLoader
- `.chemistry-loader-overlay` - Container toàn màn hình
- `.molecule-structure` - Cấu trúc phân tử chính
- `.test-tubes` - Nhóm ống nghiệm
- `.chemical-formulas` - Công thức hóa học

### ChemistryLoader
- `.chemistry-loader` - Container chính
- `.chemistry-loader-small/medium/large` - Size variants
- `.simple-molecule` - Phân tử đơn giản
- `.loader-text` - Text hiển thị

## Tùy chỉnh Màu sắc

### Trong CSS
Chỉnh sửa gradient và màu sắc trong file CSS:

**ChemistryPageLoader.css**
```css
.chemistry-loader-overlay {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}
```

**ChemistryLoader.css**
```css
.center-atom {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
```

## Performance Tips

1. **Page Loader**: Thời gian tối ưu là 800-1200ms
2. **Inline Loader**: Sử dụng size="small" cho UI components
3. **Lazy Loading**: Combine với React.lazy() và Suspense

```jsx
const LazyComponent = React.lazy(() => import('./MyComponent'));

<Suspense fallback={<ChemistryLoader size="large" />}>
  <LazyComponent />
</Suspense>
```

## Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (webkit-backdrop-filter supported)
- ✅ Mobile browsers

## Notes
- Animation được optimize với CSS transform
- Không blocking user interaction (khi cần)
- Accessible với semantic HTML
