import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Input, Button, Typography, Spin, Empty, message, Divider, Upload } from 'antd';
import { PlusOutlined, FolderOpenOutlined, FileTextOutlined, SaveOutlined, UploadOutlined, PrinterOutlined, MenuOutlined, ExperimentOutlined, BulbOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateLessonPlanPage.css';

const { Title, Paragraph, Text } = Typography;

// --- DỮ LIỆU GIẢ LẬP ---
const MOCK_SAVED_PLANS = [
    { id: 'plan_01', title: 'Giáo án bài "Phản ứng Este hóa"', createdAt: 'Hôm qua', content: `<h1>I. MỤC TIÊU</h1><p>Học sinh có thể trình bày khái niệm và viết phương trình phản ứng este hóa.</p><h2>1. Kiến thức</h2><p>Nội dung kiến thức...</p><h2>2. Kỹ năng</h2><p>Nội dung kỹ năng...</p><h1>II. NỘI DUNG</h1><p>...</p><p style="page-break-before: always;"></p><h1>III. HOẠT ĐỘNG</h1><p>Hoạt động dạy và học...</p>` },
];

const quillModules = { toolbar: [ [{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline'], [{ 'color': [] }, { 'background': [] }], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ] };

const OutlinePanel = ({ outline, onNavigate }) => (
    <div className="outline-panel chemistry-panel">
        <Title level={5} className="panel-title-alt chemistry-title"><MenuOutlined /> Mục lục</Title>
        {outline.length === 0 ? (
            <Text type="secondary">Chưa có tiêu đề nào.</Text>
        ) : (
            <div className="outline-list">
                {outline.map((item, index) => (
                    <a key={index} onClick={() => onNavigate(item.element)} className={`outline-item level-${item.level}`}>
                        {item.text}
                    </a>
                ))}
            </div>
        )}
    </div>
);

// ===================================================================
// === COMPONENT CHÍNH ===
// ===================================================================
const CreateLessonPlanPage = () => {
    const [document, setDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activePlanId, setActivePlanId] = useState(null);
    const [saveStatus, setSaveStatus] = useState('saved');
    const [outline, setOutline] = useState([]);
    const editorRef = useRef(null);

    // --- TỰ ĐỘNG TẠO MỤC LỤC ---
    useEffect(() => {
        if (document?.content) {
            const editor = editorRef.current?.getEditor();
            if (!editor) return;

            const newOutline = [];
            const headings = editor.root.querySelectorAll('h1, h2, h3');
            headings.forEach(heading => {
                newOutline.push({
                    level: parseInt(heading.tagName.substring(1)),
                    text: heading.innerText,
                    element: heading, // Lưu tham chiếu đến element
                });
            });
            setOutline(newOutline);
        } else {
            setOutline([]);
        }
    }, [document?.content]);

    // --- CÁC HÀM XỬ LÝ ---
    const handleSave = () => { /* Giữ nguyên */ };
    const handlePrint = () => { if (!document) return; window.print(); };
    const handleUpload = (file) => { /* Giữ nguyên */ };
    const handleContentChange = (content) => { setDocument(prev => ({ ...prev, content })); setSaveStatus('unsaved'); };
    const handleTitleChange = (title) => { setDocument(prev => ({ ...prev, title })); setSaveStatus('unsaved'); };
    const handleLoadSavedPlan = (plan) => { setIsLoading(true); setTimeout(() => { setDocument({title: plan.title, content: plan.content}); setActivePlanId(plan.id); setSaveStatus('saved'); setIsLoading(false); message.info(`Đã mở "${plan.title}".`); }, 500); };
    const handleGenerateClick = () => { setIsLoading(true); setActivePlanId(null); setTimeout(() => { setDocument({title: MOCK_SAVED_PLANS[0].title, content: MOCK_SAVED_PLANS[0].content}); setSaveStatus('unsaved'); setIsLoading(false); message.success('AI đã tạo giáo án mới!'); }, 1500); };
    const handleNavigate = (element) => {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="create-lesson-plan-page-alt">
            <Row gutter={[24, 24]}>
                {/* === CỘT ĐIỀU KHIỂN BÊN TRÁI === */}
                <Col xs={24} lg={7}>
                    <div className="control-panel-alt chemistry-control-panel">
                        <div className="chemistry-molecules"></div>
                        {/* Phần Tạo mới và Thư viện */}
                        <Title level={5} className="panel-title-alt chemistry-title"><ExperimentOutlined /> Tạo giáo án mới</Title>
                        <Input.TextArea rows={4} placeholder="Yêu cầu AI soạn giáo án bài..." />
                        <Button type="primary" className="alt-button chemistry-button" icon={<BulbOutlined />} loading={isLoading && !activePlanId} onClick={handleGenerateClick} block>Bắt đầu tạo với AI</Button>
                        <Upload beforeUpload={handleUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />} block style={{marginTop: '8px'}}>Tải lên từ máy tính</Button>
                        </Upload>
                        <Divider />
                        {/* Phần Mục lục mới */}
                        <OutlinePanel outline={outline} onNavigate={handleNavigate} />
                        <Divider />
                        <Title level={5} className="panel-title-alt chemistry-title"><FolderOpenOutlined /> Thư viện Giáo án</Title>
                        <div className="saved-docs-list-alt">
                            {MOCK_SAVED_PLANS.map(plan => (
                                <div key={plan.id} className={`saved-doc-item-alt ${plan.id === activePlanId ? 'active' : ''}`} onClick={() => handleLoadSavedPlan(plan)}>
                                    <Text strong ellipsis>{plan.title}</Text>
                                    <Text type="secondary">{plan.createdAt}</Text>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
                {/* === WORKSPACE BÊN PHẢI === */}
                <Col xs={24} lg={17}>
                    <div className="editor-workspace-alt chemistry-workspace">
                        {isLoading ? <div className="center-content-alt"><Spin size="large" tip="Đang xử lý..." className="chemistry-spinner" /></div>
                            : (
                            !document
                            ? <div className="center-content-alt chemistry-empty"><Empty description="Nội dung sẽ xuất hiện ở đây" image={<ExperimentOutlined style={{fontSize: '60px', color: '#b19cd9'}}/>}/></div>
                            : (
                                <>
                                    <div className="editor-header-alt chemistry-header">
                                        <Title level={4} editable={{ onChange: handleTitleChange }} className="document-title-alt">{document.title}</Title>
                                        <div className="editor-actions-alt">
                                            <Text type="secondary" className={`save-status-alt ${saveStatus}`}>{saveStatus === 'saved' ? 'Đã lưu' : 'Chưa lưu'}</Text>
                                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} disabled={saveStatus !== 'unsaved'}>Lưu</Button>
                                            <Button icon={<PrinterOutlined />} onClick={handlePrint}>In / Xuất PDF</Button>
                                        </div>
                                    </div>
                                    <div className="canvas-container-alt chemistry-canvas">
                                        {/* Quill Editor giờ đây render trong một cấu trúc mô phỏng trang giấy */}
                                        <ReactQuill ref={editorRef} theme="snow" value={document.content} onChange={handleContentChange} modules={quillModules} className="quill-editor-alt" />
                                    </div>
                                </>
                            )
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default CreateLessonPlanPage;

