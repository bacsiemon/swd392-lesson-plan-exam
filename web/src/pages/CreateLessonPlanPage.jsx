import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Input, Button, Typography, Spin, Empty, message, Divider, Upload, InputNumber, Form, Card } from 'antd';
import { PlusOutlined, FolderOpenOutlined, FileTextOutlined, SaveOutlined, UploadOutlined, PrinterOutlined, MenuOutlined, ExperimentOutlined, BulbOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/CreateLessonPlanPage.css';
import lessonPlanService from '../services/lessonPlanService';
import api from '../services/axios';

const { Title, Paragraph, Text } = Typography;

// Helper function to get current user ID from JWT token
const getCurrentUserId = async () => {
  try {
    // Try to get from API
    const response = await api.get('/api/test/current-user');
    if (response.data?.data?.userId) {
      return response.data.data.userId;
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
    const [savedPlans, setSavedPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [showMetadataForm, setShowMetadataForm] = useState(false);
    const [form] = Form.useForm();
    const editorRef = useRef(null);

    // --- LOAD CURRENT USER ID ON MOUNT ---
    useEffect(() => {
        const loadUserId = async () => {
            const userId = await getCurrentUserId();
            setCurrentUserId(userId);
        };
        loadUserId();
    }, []);

    // --- LOAD SAVED LESSON PLANS ON MOUNT ---
    useEffect(() => {
        const loadSavedPlans = async () => {
            setLoadingPlans(true);
            try {
                const result = await lessonPlanService.getCurrentTeacherLessonPlans();
                if (result.success && result.data) {
                    // Transform API data to match component format
                    const plans = Array.isArray(result.data) ? result.data : (result.data.items || []);
                    setSavedPlans(plans);
                } else {
                    console.error('Failed to load lesson plans:', result.message);
                }
            } catch (error) {
                console.error('Error loading lesson plans:', error);
            } finally {
                setLoadingPlans(false);
            }
        };
        loadSavedPlans();
    }, []);

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
    const handleSave = async () => {
        if (!document || !document.title || !document.content) {
            message.warning('Vui lòng nhập tiêu đề và nội dung giáo án');
            return;
        }

        // Validate required fields for create
        if (!activePlanId) {
            if (!document.objectives || !document.description || !document.gradeLevel) {
                message.warning('Vui lòng điền đầy đủ thông tin: Mục tiêu, Mô tả và Khối lớp');
                setShowMetadataForm(true);
                return;
            }
        }

        setIsLoading(true);
        try {
            const lessonPlanData = {
                title: document.title,
                // For create: include all required fields
                ...(activePlanId ? {} : {
                    createdByTeacher: currentUserId || 1, // Server will override this anyway
                    objectives: document.objectives || '',
                    description: document.description || '',
                    gradeLevel: document.gradeLevel || 1,
                    imageUrl: document.imageUrl || null
                }),
                // For update: only send fields that can be updated
                ...(activePlanId ? {
                    objectives: document.objectives || '',
                    description: document.description || '',
                    gradeLevel: document.gradeLevel || 1,
                    imageUrl: document.imageUrl || null
                } : {})
            };

            let result;
            if (activePlanId) {
                // Update existing lesson plan
                result = await lessonPlanService.updateLessonPlan(activePlanId, lessonPlanData);
            } else {
                // Create new lesson plan
                result = await lessonPlanService.createLessonPlan(lessonPlanData);
                if (result.success && result.data?.id) {
                    setActivePlanId(result.data.id);
                }
            }

            if (result.success) {
                setSaveStatus('saved');
                setShowMetadataForm(false);
                message.success(result.message || 'Lưu giáo án thành công');
                // Refresh saved plans list
                const plansResult = await lessonPlanService.getCurrentTeacherLessonPlans();
                if (plansResult.success && plansResult.data) {
                    const plans = Array.isArray(plansResult.data) ? plansResult.data : (plansResult.data.items || []);
                    setSavedPlans(plans);
                }
            } else {
                // Show detailed error message
                const errorMsg = result.message || result.error?.message || result.error?.Message || 
                                (typeof result.error === 'string' ? result.error : 'Không thể lưu giáo án');
                const errorDetails = result.error?.errors || result.error?.Errors || result.error;
                console.error('❌ Failed to save lesson plan:', {
                    result,
                    error: errorDetails,
                    statusCode: result.statusCode
                });
                message.error({
                    content: errorMsg,
                    duration: 5
                });
            }
        } catch (error) {
            console.error('❌ Error saving lesson plan:', {
                error: error,
                response: error.response,
                data: error.response?.data,
                status: error.response?.status
            });
            const errorMsg = error.response?.data?.message || error.response?.data?.Message || 
                           error.response?.data?.errors || error.response?.data?.Errors ||
                           error.message || 'Có lỗi xảy ra khi lưu giáo án';
            message.error({
                content: errorMsg,
                duration: 5
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => { if (!document) return; window.print(); };

    const handleUpload = async (file) => {
        if (!activePlanId) {
            message.warning('Vui lòng lưu giáo án trước khi tải lên file');
            return false;
        }

        try {
            const result = await lessonPlanService.uploadFile(activePlanId, file);
            if (result.success) {
                message.success(result.message || 'Tải lên file thành công');
            } else {
                message.error(result.message || 'Không thể tải lên file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            message.error('Có lỗi xảy ra khi tải lên file');
        }
        return false; // Prevent default upload behavior
    };

    const handleContentChange = (content) => { 
        setDocument(prev => ({ ...prev, content })); 
        setSaveStatus('unsaved'); 
    };

    const handleTitleChange = (title) => { 
        setDocument(prev => ({ ...prev, title })); 
        setSaveStatus('unsaved'); 
    };

    const handleLoadSavedPlan = async (plan) => {
        setIsLoading(true);
        try {
            const result = await lessonPlanService.getLessonPlanById(plan.id);
            if (result.success && result.data) {
                const planData = result.data;
                setDocument({
                    title: planData.title || plan.title,
                    content: planData.content || plan.content || '',
                    objectives: planData.objectives || '',
                    description: planData.description || '',
                    gradeLevel: planData.gradeLevel || 1,
                    imageUrl: planData.imageUrl || null
                });
                setActivePlanId(plan.id);
                setSaveStatus('saved');
                setShowMetadataForm(false);
                message.info(`Đã mở "${planData.title || plan.title}".`);
            } else {
                message.error(result.message || 'Không thể tải giáo án');
            }
        } catch (error) {
            console.error('Error loading lesson plan:', error);
            message.error('Có lỗi xảy ra khi tải giáo án');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateClick = () => { 
        setIsLoading(true); 
        setActivePlanId(null); 
        setTimeout(() => { 
            setDocument({
                title: MOCK_SAVED_PLANS[0].title, 
                content: MOCK_SAVED_PLANS[0].content,
                objectives: '',
                description: '',
                gradeLevel: 1,
                imageUrl: null
            }); 
            setSaveStatus('unsaved');
            setShowMetadataForm(true);
            setIsLoading(false); 
            message.success('AI đã tạo giáo án mới!'); 
        }, 1500); 
    };

    const handleMetadataChange = (field, value) => {
        setDocument(prev => ({ ...prev, [field]: value }));
        setSaveStatus('unsaved');
    };
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
                            {loadingPlans ? (
                                <Spin size="small" tip="Đang tải..." />
                            ) : savedPlans.length === 0 ? (
                                <Text type="secondary">Chưa có giáo án nào</Text>
                            ) : (
                                savedPlans.map(plan => (
                                    <div key={plan.id} className={`saved-doc-item-alt ${plan.id === activePlanId ? 'active' : ''}`} onClick={() => handleLoadSavedPlan(plan)}>
                                        <Text strong ellipsis>{plan.title || plan.name}</Text>
                                        <Text type="secondary">
                                            {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('vi-VN') : 'Không có ngày'}
                                        </Text>
                                    </div>
                                ))
                            )}
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
                                    {/* Metadata Form */}
                                    {showMetadataForm && (
                                        <Card style={{ marginBottom: 16 }} title="Thông tin giáo án">
                                            <Row gutter={16}>
                                                <Col xs={24} sm={12}>
                                                    <Text strong>Mục tiêu bài học *</Text>
                                                    <Input.TextArea
                                                        rows={3}
                                                        placeholder="Nhập mục tiêu bài học..."
                                                        value={document.objectives || ''}
                                                        onChange={(e) => handleMetadataChange('objectives', e.target.value)}
                                                        style={{ marginTop: 8 }}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <Text strong>Mô tả *</Text>
                                                    <Input.TextArea
                                                        rows={3}
                                                        placeholder="Nhập mô tả bài học..."
                                                        value={document.description || ''}
                                                        onChange={(e) => handleMetadataChange('description', e.target.value)}
                                                        style={{ marginTop: 8 }}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <Text strong>Khối lớp *</Text>
                                                    <InputNumber
                                                        min={1}
                                                        max={12}
                                                        placeholder="Khối lớp"
                                                        value={document.gradeLevel || 1}
                                                        onChange={(value) => handleMetadataChange('gradeLevel', value || 1)}
                                                        style={{ width: '100%', marginTop: 8 }}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={16}>
                                                    <Text strong>URL ảnh (tùy chọn)</Text>
                                                    <Input
                                                        placeholder="https://example.com/image.jpg"
                                                        value={document.imageUrl || ''}
                                                        onChange={(e) => handleMetadataChange('imageUrl', e.target.value)}
                                                        style={{ marginTop: 8 }}
                                                    />
                                                </Col>
                                                <Col xs={24}>
                                                    <Button type="link" onClick={() => setShowMetadataForm(false)}>Ẩn thông tin</Button>
                                                </Col>
                                            </Row>
                                        </Card>
                                    )}
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

