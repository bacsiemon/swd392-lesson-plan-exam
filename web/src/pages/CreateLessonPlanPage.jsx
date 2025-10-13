import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Typography,
  Spin,
  Empty,
  message,
  Divider,
} from 'antd';
import { PlusOutlined, FolderOpenOutlined, FileTextOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateLessonPlanPage.css'; 

const { Title, Paragraph, Text } = Typography;
const MOCK_SAVED_PLANS = [
  {
    id: 'plan_01',
    title: 'Giáo án bài "Phản ứng Este hóa"',
    createdAt: 'Hôm qua',
    content: `
      <h1>Giáo án: Phản ứng Este hóa (Hóa học 12)</h1>
      <h2>I. MỤC TIÊU BÀI HỌC</h2>
      <ul>
        <li><strong>Kiến thức:</strong> Nêu được khái niệm phản ứng este hóa, viết được phương trình tổng quát.</li>
        <li><strong>Kỹ năng:</strong> Cân bằng được phương trình phản ứng, nhận biết sản phẩm.</li>
        <li><strong>Thái độ:</strong> Hiểu được ứng dụng của este trong đời sống và sản xuất.</li>
      </ul>
      <h2>II. CHUẨN BỊ</h2>
      <p><strong>Giáo viên:</strong> Dụng cụ thí nghiệm, hóa chất (axit axetic, ancol etylic, H₂SO₄ đặc).</p>
      <p><strong>Học sinh:</strong> Ôn lại kiến thức về axit cacboxylic và ancol.</p>
      <h2>III. HOẠT ĐỘNG DẠY HỌC</h2>
      <p>...</p>
    `,
  },
];

const CustomToolbar = () => (
    <div id="quill-toolbar-doc">
      <span className="ql-formats">
        <select className="ql-header" defaultValue=""><option value="1">Heading 1</option><option value="2">Heading 2</option><option value="">Normal</option></select>
        <select className="ql-font"></select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold"></button><button className="ql-italic"></button><button className="ql-underline"></button>
      </span>
      <span className="ql-formats">
        <select className="ql-color"></select><select className="ql-background"></select>
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered"></button><button className="ql-list" value="bullet"></button>
        <button className="ql-indent" value="-1"></button><button className="ql-indent" value="+1"></button>
      </span>
    </div>
);


const quillModules = {
  toolbar: { container: '#quill-toolbar-doc' },
};

const CreateLessonPlanPage = () => {
  const [lessonPlanContent, setLessonPlanContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePlanId, setActivePlanId] = useState(null);
  const handleContentChange = (content) => { setLessonPlanContent(content); };
  const handleLoadSavedPlan = (plan) => { setIsLoading(true); setTimeout(() => { setLessonPlanContent(plan.content); setActivePlanId(plan.id); setIsLoading(false); message.info(`Đã mở "${plan.title}".`); }, 500); };
  const handleGenerateClick = () => { setIsLoading(true); setActivePlanId(null); setTimeout(() => { setLessonPlanContent(MOCK_SAVED_PLANS[0].content); setIsLoading(false); message.success('AI đã tạo giáo án mới!'); }, 1500); };

  return (
    <div className="create-lesson-plan-page">
      <Row gutter={[24, 24]}>
        {/* === CỘT ĐIỀU KHIỂN BÊN TRÁI === */}
        <Col xs={24} lg={7}>
          <div className="control-panel-doc">
            <Title level={5} className="panel-title-doc"><PlusOutlined /> Tạo giáo án mới</Title>
            <Paragraph type="secondary">Nhập yêu cầu chi tiết, AI sẽ biên soạn nội dung cho bạn.</Paragraph>
            <Input.TextArea rows={4} placeholder="Ví dụ: Soạn giáo án bài 'Định luật Bảo toàn khối lượng' cho lớp 8, kèm 3 bài tập vận dụng." />
            <Button type="primary" className="doc-button" icon={<PlusOutlined />} loading={isLoading && !activePlanId} onClick={handleGenerateClick} block>
              Bắt đầu tạo
            </Button>
            <Divider />
            <Title level={5} className="panel-title-doc"><FolderOpenOutlined /> Thư viện Giáo án</Title>
            <div className="saved-docs-list">
              {MOCK_SAVED_PLANS.map(plan => (
                <div key={plan.id} className={`saved-doc-item ${plan.id === activePlanId ? 'active' : ''}`} onClick={() => handleLoadSavedPlan(plan)}>
                  <Text strong ellipsis>{plan.title}</Text>
                  <Text type="secondary">{plan.createdAt}</Text>
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* === WORKSPACE BÊN PHẢI === */}
        <Col xs={24} lg={17}>
          <div className="editor-workspace-doc">
            {isLoading && (<div className="center-content-doc"><Spin size="large" /></div>)}
            {!isLoading && !lessonPlanContent && (
              <div className="center-content-doc">
                <Empty description={<Paragraph type="secondary">Nội dung giáo án sẽ xuất hiện ở đây</Paragraph>} image={<FileTextOutlined style={{fontSize: '60px', color: '#ccc'}}/>}/>
              </div>
            )}
            {!isLoading && lessonPlanContent && (
              <>
                <CustomToolbar />
                <div className="canvas-container-doc">
                  <div className="document-canvas">
                    <ReactQuill theme="snow" value={lessonPlanContent} onChange={handleContentChange} modules={quillModules} className="quill-editor-on-doc" />
                  </div>
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreateLessonPlanPage;
