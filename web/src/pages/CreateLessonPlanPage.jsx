import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Input, Button, Typography, Spin, Empty, message, Divider, Upload, InputNumber, Form, Card, List, Popconfirm, Modal } from 'antd';
import { PlusOutlined, FolderOpenOutlined, FileTextOutlined, SaveOutlined, UploadOutlined, PrinterOutlined, MenuOutlined, ExperimentOutlined, BulbOutlined, FileOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, PlayCircleOutlined } from '@ant-design/icons';
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

const quillModules = { 
    toolbar: [ 
        [{ 'header': [1, 2, 3, false] }], 
        ['bold', 'italic', 'underline'], 
        [{ 'color': [] }, { 'background': [] }], 
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['video', 'image', 'link']
    ] 
};

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
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);
    const [fileViewerVisible, setFileViewerVisible] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]); // Files uploaded but not yet attached to lesson plan

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
                console.log('Loading lesson plans on mount:', result);
                if (result.success && result.data) {
                    // Service now returns array directly in result.data
                    const plans = Array.isArray(result.data) 
                        ? result.data 
                        : (result.data.items || []);
                    console.log('Loaded lesson plans:', plans);
                    setSavedPlans(plans);
                } else {
                    console.error('Failed to load lesson plans:', result.message);
                    setSavedPlans([]); // Set empty array on error
                }
            } catch (error) {
                console.error('Error loading lesson plans:', error);
            } finally {
                setLoadingPlans(false);
            }
        };
        loadSavedPlans();
    }, []);

    // --- LOAD FILES WHEN ACTIVE PLAN CHANGES ---
    useEffect(() => {
        if (activePlanId) {
            loadFilesForPlan(activePlanId);
        } else {
            setUploadedFiles([]);
        }
    }, [activePlanId]);

    // --- FUNCTION TO LOAD FILES FOR A LESSON PLAN ---
    const loadFilesForPlan = async (planId) => {
        setLoadingFiles(true);
        try {
            console.log('Loading files for plan:', planId);
            // Try to get files from lesson plan response
            const result = await lessonPlanService.getLessonPlanById(planId);
            console.log('Get lesson plan result:', result);
            if (result.success && result.data) {
                const planData = result.data;
                console.log('Plan data:', planData);
                
                // Check if response includes files (LessonPlanFiles field)
                const files = planData.LessonPlanFiles || planData.lessonPlanFiles || planData.Files || planData.files || [];
                console.log('Files from response:', files);
                
                if (Array.isArray(files) && files.length > 0) {
                    // Map files to our format
                    const mappedFiles = files.map(file => ({
                        id: file.Id || file.id,
                        fileUrl: file.FileUrl || file.fileUrl,
                        fileName: file.FileName || file.fileName || 'Unknown',
                        mimeType: file.MimeType || file.mimeType || '',
                        fileSize: file.FileSize || file.fileSize || 0,
                        uploadedAt: file.UploadedAt || file.uploadedAt || file.UpdatedAt || file.updatedAt
                    }));
                    console.log('Mapped files:', mappedFiles);
                    setUploadedFiles(mappedFiles);
                } else {
                    // If no files in response, keep current files (they might be added via upload)
                    console.log('No files in response, keeping current state');
                    // Don't clear files, they might be tracked locally
                }
            }
        } catch (error) {
            console.error('Error loading files:', error);
            // Don't clear files on error, keep current state
        } finally {
            setLoadingFiles(false);
        }
    };

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
                    // Save content in description temporarily (backend doesn't have Content field yet)
                    // TODO: Backend should have a Content field to store the full editor content
                    description: document.content || document.description || '',
                    gradeLevel: document.gradeLevel || 1,
                    imageUrl: document.imageUrl || null
                }),
                // For update: only send fields that can be updated
                ...(activePlanId ? {
                    objectives: document.objectives || '',
                    // Save content in description temporarily
                    description: document.content || document.description || '',
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
            }

            if (result.success) {
                setSaveStatus('saved');
                setShowMetadataForm(false);
                message.success(result.message || 'Lưu giáo án thành công');
                
                // Update activePlanId if creating new plan (handle both camelCase and PascalCase)
                let newPlanId = activePlanId;
                if (!activePlanId && result.data) {
                    newPlanId = result.data.id || result.data.Id || result.data.ID;
                    if (newPlanId) {
                        setActivePlanId(newPlanId);
                    }
                }
                
                // Attach pending files to lesson plan after saving
                if (newPlanId && pendingFiles.length > 0) {
                    try {
                        message.loading(`Đang đính kèm ${pendingFiles.length} file đã tải lên vào giáo án...`, 0);
                        
                        // Fetch each pending file and attach it to the lesson plan
                        let attachedCount = 0;
                        for (const pendingFile of pendingFiles) {
                            try {
                                // Fetch file from server
                                const fileResponse = await api.get(`/api/fileupload/${pendingFile.fileUploadId}/download`, {
                                    responseType: 'blob'
                                });
                                
                                // Create a File object from the blob
                                const blob = fileResponse.data;
                                const file = new File([blob], pendingFile.fileName, { type: pendingFile.mimeType });
                                
                                // Attach to lesson plan
                                const attachResult = await lessonPlanService.uploadFile(newPlanId, file);
                                if (attachResult.success) {
                                    attachedCount++;
                                }
                            } catch (error) {
                                console.error(`Error attaching file ${pendingFile.fileName}:`, error);
                            }
                        }
                        
                        // Reload files for the lesson plan
                        if (newPlanId) {
                            await loadFilesForPlan(newPlanId);
                        }
                        
                        message.destroy();
                        if (attachedCount === pendingFiles.length) {
                            message.success(`Đã đính kèm ${attachedCount} file vào giáo án`);
                        } else {
                            message.warning(`Đã đính kèm ${attachedCount}/${pendingFiles.length} file. Một số file có thể cần tải lên lại.`);
                        }
                        
                        // Clear pending files
                        setPendingFiles([]);
                    } catch (error) {
                        console.error('Error attaching pending files:', error);
                        message.destroy();
                        message.warning('Có lỗi khi đính kèm file. Các file vẫn có sẵn và có thể được sử dụng.');
                    }
                }
                
                // Refresh saved plans list
                try {
                    const plansResult = await lessonPlanService.getCurrentTeacherLessonPlans();
                    console.log('Refreshing lesson plans after save:', plansResult);
                    if (plansResult.success && plansResult.data) {
                        // Service now returns array directly in result.data
                        const plans = Array.isArray(plansResult.data) 
                            ? plansResult.data 
                            : (plansResult.data.items || []);
                        console.log('Setting saved plans:', plans);
                        setSavedPlans(plans);
                    } else {
                        console.error('Failed to refresh lesson plans:', plansResult.message);
                    }
                } catch (error) {
                    console.error('Error refreshing lesson plans:', error);
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

    // Upload file directly to FileUpload service (without lessonPlanId)
    const uploadFileDirectly = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/FileUpload', formData, {
                transformRequest: [(data, headers) => {
                    delete headers['Content-Type'];
                    return data;
                }]
            });

            const baseResponse = response.data;
            const statusCode = baseResponse?.StatusCode !== undefined 
                ? baseResponse.StatusCode 
                : (baseResponse?.statusCode !== undefined ? baseResponse.statusCode : response.status);

            if (statusCode === 201 || response.status === 201) {
                return {
                    success: true,
                    data: baseResponse.Data || baseResponse.data || baseResponse,
                    message: baseResponse.Message || baseResponse.message || 'Tải lên file thành công',
                    statusCode: statusCode
                };
            } else {
                const errorMsg = baseResponse.Message || baseResponse.message || 
                                baseResponse.Errors || baseResponse.errors ||
                                'Không thể tải lên file';
                return {
                    success: false,
                    error: baseResponse.Errors || baseResponse.errors || baseResponse,
                    message: errorMsg,
                    statusCode: statusCode
                };
            }
        } catch (error) {
            console.error('Error uploading file directly:', error);
            const errorData = error.response?.data || {};
            const statusCode = error.response?.status || errorData?.StatusCode || errorData?.statusCode;
            const errorMsg = errorData.Message || errorData.message || 
                            errorData.Errors || errorData.errors ||
                            error.message || 'Không thể tải lên file';
            
            return {
                success: false,
                error: errorData || error.message,
                message: errorMsg,
                statusCode: statusCode
            };
        }
    };

    // Attach pending files to lesson plan after saving
    const attachPendingFilesToPlan = async (lessonPlanId) => {
        if (!pendingFiles || pendingFiles.length === 0) {
            return;
        }

        try {
            for (const pendingFile of pendingFiles) {
                const fileUploadId = pendingFile.fileUploadId || pendingFile.id;
                if (fileUploadId) {
                    // Attach file to lesson plan
                    // Note: We need to get the file from FileUpload and attach it
                    // Since we already have fileUploadId, we can attach it directly
                    // But backend requires the file again, so we'll skip this for now
                    // and let the file be attached when user explicitly uploads it
                    // OR we can create a new endpoint to attach by fileUploadId
                    
                    // For now, we'll just move pending files to uploadedFiles
                    // The files are already uploaded, they just need to be linked to lesson plan
                    // This will be handled by the normal upload flow
                }
            }
            
            // Clear pending files after attaching
            setPendingFiles([]);
        } catch (error) {
            console.error('Error attaching pending files:', error);
        }
    };

    // Upload video để đính kèm (có thể upload ngay khi tạo, trước khi lưu)
    const handleUploadVideo = async (file) => {
        // Validate video file
        const isVideo = file.type.startsWith('video/') || 
                       file.name.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i);
        
        if (!isVideo) {
            message.warning('Vui lòng chọn file video (mp4, webm, avi, etc.)');
            return false;
        }

        // Check file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            message.warning('File video quá lớn. Kích thước tối đa là 100MB');
            return false;
        }

        try {
            let result;
            let fileData;
            
            if (activePlanId) {
                // If lesson plan already exists, upload directly to lesson plan
                result = await lessonPlanService.uploadFile(activePlanId, file);
                if (result.success) {
                    message.success('Đính kèm video thành công');
                    fileData = result.data;
                }
            } else {
                // If lesson plan doesn't exist yet, upload directly to FileUpload service
                message.loading('Đang tải lên video...', 0);
                result = await uploadFileDirectly(file);
                message.destroy();
                
                if (result.success) {
                    message.success('Tải lên video thành công. Video sẽ được đính kèm khi bạn lưu giáo án.');
                    fileData = result.data;
                    
                    // Add to pending files
                    const fileUploadId = fileData.Id || fileData.id;
                    const fileUrl = fileData.FileUrl || fileData.fileUrl;
                    const pendingFile = {
                        id: fileUploadId,
                        fileUploadId: fileUploadId,
                        fileUrl: fileUrl,
                        fileName: fileData.FileName || fileData.fileName || file.name,
                        mimeType: fileData.MimeType || fileData.mimeType || file.type,
                        fileSize: fileData.FileSize || fileData.fileSize || file.size,
                        uploadedAt: fileData.UploadedAt || fileData.uploadedAt || new Date().toISOString(),
                        isVideo: true,
                        pending: true // Mark as pending attachment
                    };
                    
                    setPendingFiles(prev => {
                        const exists = prev.some(f => 
                            (f.fileUrl === pendingFile.fileUrl) || 
                            (f.fileName === pendingFile.fileName && f.fileSize === pendingFile.fileSize)
                        );
                        if (exists) return prev;
                        return [...prev, pendingFile];
                    });
                    
                    // Also add to uploadedFiles for display
                    setUploadedFiles(prev => {
                        const exists = prev.some(f => 
                            (f.fileUrl === pendingFile.fileUrl) || 
                            (f.fileName === pendingFile.fileName && f.fileSize === pendingFile.fileSize)
                        );
                        if (exists) return prev;
                        return [...prev, pendingFile];
                    });
                    
                    return false;
                }
            }
            
            if (result.success && fileData) {
                // Add uploaded video to the list
                let fileUploadId = fileData.Id || fileData.id;
                const fileUrl = fileData.FileUrl || fileData.fileUrl;
                if (!fileUploadId && fileUrl) {
                    const match = fileUrl.match(/\/api\/fileupload\/(\d+)/);
                    if (match) {
                        fileUploadId = parseInt(match[1]);
                    }
                }
                
                const newFile = {
                    id: fileUploadId,
                    fileUploadId: fileUploadId,
                    fileUrl: fileUrl,
                    fileName: fileData.FileName || fileData.fileName || file.name,
                    mimeType: fileData.MimeType || fileData.mimeType || file.type,
                    fileSize: fileData.FileSize || fileData.fileSize || file.size,
                    uploadedAt: fileData.UploadedAt || fileData.uploadedAt || new Date().toISOString(),
                    isVideo: true
                };
                
                setUploadedFiles(prev => {
                    const exists = prev.some(f => 
                        (f.fileUrl === newFile.fileUrl) || 
                        (f.fileName === newFile.fileName && f.fileSize === newFile.fileSize)
                    );
                    if (exists) return prev;
                    return [...prev, newFile];
                });
                
                if (activePlanId) {
                    setTimeout(async () => {
                        await loadFilesForPlan(activePlanId);
                    }, 500);
                }
            } else {
                const errorMsg = result.message || 
                               (typeof result.error === 'string' ? result.error : 'Không thể đính kèm video');
                message.error({
                    content: errorMsg,
                    duration: 5
                });
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            message.error('Có lỗi xảy ra khi đính kèm video');
        }
        return false;
    };

    // Upload file để đính kèm (có thể upload ngay khi tạo, trước khi lưu)
    const handleUploadFileAttachment = async (file) => {
        try {
            let result;
            let fileData;
            
            if (activePlanId) {
                // If lesson plan already exists, upload directly to lesson plan
                result = await lessonPlanService.uploadFile(activePlanId, file);
                if (result.success) {
                    message.success(result.message || 'Đính kèm file thành công');
                    fileData = result.data;
                }
            } else {
                // If lesson plan doesn't exist yet, upload directly to FileUpload service
                message.loading('Đang tải lên file...', 0);
                result = await uploadFileDirectly(file);
                message.destroy();
                
                if (result.success) {
                    message.success('Tải lên file thành công. File sẽ được đính kèm khi bạn lưu giáo án.');
                    fileData = result.data;
                    
                    // Add to pending files
                    const fileUploadId = fileData.Id || fileData.id;
                    const fileUrl = fileData.FileUrl || fileData.fileUrl;
                    const pendingFile = {
                        id: fileUploadId,
                        fileUploadId: fileUploadId,
                        fileUrl: fileUrl,
                        fileName: fileData.FileName || fileData.fileName || file.name,
                        mimeType: fileData.MimeType || fileData.mimeType || file.type,
                        fileSize: fileData.FileSize || fileData.fileSize || file.size,
                        uploadedAt: fileData.UploadedAt || fileData.uploadedAt || new Date().toISOString(),
                        pending: true // Mark as pending attachment
                    };
                    
                    setPendingFiles(prev => {
                        const exists = prev.some(f => 
                            (f.fileUrl === pendingFile.fileUrl) || 
                            (f.fileName === pendingFile.fileName && f.fileSize === pendingFile.fileSize)
                        );
                        if (exists) return prev;
                        return [...prev, pendingFile];
                    });
                    
                    // Also add to uploadedFiles for display
                    setUploadedFiles(prev => {
                        const exists = prev.some(f => 
                            (f.fileUrl === pendingFile.fileUrl) || 
                            (f.fileName === pendingFile.fileName && f.fileSize === pendingFile.fileSize)
                        );
                        if (exists) return prev;
                        return [...prev, pendingFile];
                    });
                    
                    return false;
                }
            }
            
            if (result.success && fileData) {
                // Add uploaded file to the list
                let fileUploadId = fileData.Id || fileData.id;
                const fileUrl = fileData.FileUrl || fileData.fileUrl;
                if (!fileUploadId && fileUrl) {
                    const match = fileUrl.match(/\/api\/fileupload\/(\d+)/);
                    if (match) {
                        fileUploadId = parseInt(match[1]);
                    }
                }
                
                const newFile = {
                    id: fileUploadId,
                    fileUploadId: fileUploadId,
                    fileUrl: fileUrl,
                    fileName: fileData.FileName || fileData.fileName || file.name,
                    mimeType: fileData.MimeType || fileData.mimeType || file.type,
                    fileSize: fileData.FileSize || fileData.fileSize || file.size,
                    uploadedAt: fileData.UploadedAt || fileData.uploadedAt || new Date().toISOString()
                };
                
                setUploadedFiles(prev => {
                    const exists = prev.some(f => 
                        (f.fileUrl === newFile.fileUrl) || 
                        (f.fileName === newFile.fileName && f.fileSize === newFile.fileSize)
                    );
                    if (exists) return prev;
                    return [...prev, newFile];
                });
                
                if (activePlanId) {
                    setTimeout(async () => {
                        await loadFilesForPlan(activePlanId);
                    }, 500);
                }
            } else {
                const errorMsg = result.message || 
                               (typeof result.error === 'string' ? result.error : 'Không thể đính kèm file');
                message.error({
                    content: errorMsg,
                    duration: 5
                });
            }
        } catch (error) {
            console.error('Error uploading attachment:', error);
            message.error('Có lỗi xảy ra khi đính kèm file');
        }
        return false;
    };

    // Upload file để chỉnh sửa - đọc nội dung và load vào editor
    const handleUploadFileForEdit = async (file) => {
        setIsLoading(true);
        try {
            // Read file content based on file type
            const fileName = file.name || '';
            const fileType = file.type || '';
            let content = '';

            // Check file extension
            const isText = fileName.endsWith('.txt') || fileType.startsWith('text/');
            const isDocx = fileName.endsWith('.docx') || fileType.includes('wordprocessingml');
            const isDoc = fileName.endsWith('.doc') || fileType.includes('msword');
            const isPdf = fileName.endsWith('.pdf') || fileType === 'application/pdf';
            const isRtf = fileName.endsWith('.rtf') || fileType.includes('rtf');

            if (isText) {
                // Read text file
                content = await readTextFile(file);
            } else if (isDocx || isDoc) {
                // For Word documents, show message that we can't parse them yet
                message.warning('File Word (.doc/.docx) chưa được hỗ trợ. Vui lòng chuyển sang file .txt hoặc .pdf');
                setIsLoading(false);
                return false;
            } else if (isPdf) {
                // For PDF, show message that we can't parse them yet
                message.warning('File PDF chưa được hỗ trợ. Vui lòng chuyển sang file .txt');
                setIsLoading(false);
                return false;
            } else if (isRtf) {
                // For RTF, try to read as text (basic parsing)
                message.warning('File RTF có thể không hiển thị đúng định dạng. Vui lòng sử dụng file .txt');
                content = await readTextFile(file);
            } else {
                // Try to read as text file
                content = await readTextFile(file);
            }

            // Set document content
            setActivePlanId(null); // Reset plan ID since this is a new document
            const newDocument = {
                title: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
                content: content,
                objectives: '',
                description: '',
                gradeLevel: 1,
                imageUrl: null
            };
            setDocument(newDocument);
            setSaveStatus('unsaved');
            setShowMetadataForm(true);
            
            // Update editor content after a short delay to ensure state is updated
            setTimeout(() => {
                if (editorRef.current) {
                    const editor = editorRef.current.getEditor();
                    if (editor) {
                        editor.root.innerHTML = content;
                    }
                }
            }, 100);
            
            message.success('Đã tải file lên. Vui lòng điền thông tin và lưu.');
            
        } catch (error) {
            console.error('Error reading file:', error);
            message.error('Có lỗi xảy ra khi đọc file. Vui lòng thử lại với file .txt');
        } finally {
            setIsLoading(false);
        }
        return false; // Prevent default upload behavior
    };

    // Helper function to read text file
    const readTextFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Convert text to HTML format for ReactQuill
                    const text = e.target.result;
                    // Convert line breaks to HTML
                    const html = text
                        .split('\n')
                        .map(line => {
                            // Convert double line breaks to paragraphs
                            if (line.trim() === '') {
                                return '<p><br></p>';
                            }
                            // Convert headings (lines starting with #)
                            if (line.trim().startsWith('#')) {
                                const level = line.trim().match(/^#+/)?.[0].length || 1;
                                const headingText = line.trim().substring(level).trim();
                                return `<h${Math.min(level, 6)}>${headingText}</h${Math.min(level, 6)}>`;
                            }
                            return `<p>${line.trim()}</p>`;
                        })
                        .join('');
                    resolve(html);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsText(file, 'UTF-8');
        });
    };

    const handleDeleteFile = async (fileId) => {
        // Check if this is a pending file
        const pendingFile = pendingFiles.find(f => (f.id === fileId || f.fileUploadId === fileId));
        if (pendingFile) {
            // Remove from pending files and uploadedFiles
            setPendingFiles(prev => prev.filter(f => f.id !== fileId && f.fileUploadId !== fileId));
            setUploadedFiles(prev => prev.filter(f => f.id !== fileId && f.fileUploadId !== fileId));
            message.success('Đã xóa file khỏi danh sách');
            return;
        }
        
        // If not pending, delete from server
        try {
            const result = await lessonPlanService.deleteFile(fileId);
            if (result.success) {
                message.success('Xóa file thành công');
                // Remove file from list
                setUploadedFiles(prev => prev.filter(f => (f.id || f.Id) !== fileId));
                // Refresh files list
                if (activePlanId) {
                    await loadFilesForPlan(activePlanId);
                }
            } else {
                message.error(result.message || 'Không thể xóa file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            message.error('Có lỗi xảy ra khi xóa file');
        }
    };

    const handleViewFile = (file) => {
        const fileUrl = file.fileUrl || file.FileUrl;
        const fileId = file.id || file.Id || file.fileUploadId;
        const fileName = file.fileName || file.FileName || 'file';
        const mimeType = file.mimeType || file.MimeType || '';
        const isVideo = file.isVideo || mimeType.startsWith('video/') || 
                       fileName.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i);
        
        if (!fileId && !fileUrl) {
            message.warning('Không tìm thấy thông tin file');
            return;
        }

        // Extract file ID from URL if needed (format: /api/fileupload/{id})
        let uploadFileId = fileId;
        if (!uploadFileId && fileUrl) {
            const match = fileUrl.match(/\/api\/fileupload\/(\d+)/);
            if (match) {
                uploadFileId = parseInt(match[1]);
            }
        }

        if (uploadFileId) {
            // Use direct endpoint to view file (not download endpoint)
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166';
            const viewUrl = `${baseUrl}/api/fileupload/${uploadFileId}`;
            
            // Check file type to determine how to view
            if (isVideo) {
                // For video files, open in modal
                setViewingFile({
                    url: viewUrl,
                    name: fileName,
                    mimeType: mimeType
                });
                setFileViewerVisible(true);
            } else {
                const isViewableType = mimeType.startsWith('image/') || 
                                      mimeType === 'application/pdf' || 
                                      mimeType.startsWith('text/') ||
                                      fileName.endsWith('.pdf') ||
                                      fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i);
                
                if (isViewableType) {
                    // For viewable types (PDF, images, text), open in modal
                    setViewingFile({
                        url: viewUrl,
                        name: fileName,
                        mimeType: mimeType
                    });
                    setFileViewerVisible(true);
                } else {
                    // For other file types (Word, Excel, etc.), open in new tab
                    window.open(viewUrl, '_blank');
                }
            }
        } else if (fileUrl) {
            // Fallback to original URL
            const fullUrl = fileUrl.startsWith('http') 
                ? fileUrl 
                : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'}${fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl}`;
            window.open(fullUrl, '_blank');
        }
    };

    const handleDownloadFile = (file) => {
        const fileUrl = file.fileUrl || file.FileUrl;
        const fileId = file.id || file.Id || file.fileUploadId;
        const fileName = file.fileName || file.FileName || 'file';
        
        // Extract file ID from URL if needed
        let uploadFileId = fileId;
        if (!uploadFileId && fileUrl) {
            const match = fileUrl.match(/\/api\/fileupload\/(\d+)/);
            if (match) {
                uploadFileId = parseInt(match[1]);
            }
        }

        if (uploadFileId) {
            // Use download endpoint to force download
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166';
            const downloadUrl = `${baseUrl}/api/fileupload/${uploadFileId}/download`;
            
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (fileUrl) {
            // Fallback to original URL
            const fullUrl = fileUrl.startsWith('http') 
                ? fileUrl 
                : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'}${fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl}`;
            const link = document.createElement('a');
            link.href = fullUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleContentChange = (content) => { 
        setDocument(prev => ({ ...prev, content })); 
        setSaveStatus('unsaved'); 
    };

    // Insert video into editor at cursor position
    const handleInsertVideo = (file) => {
        if (!editorRef.current) {
            message.warning('Editor chưa sẵn sàng');
            return;
        }

        const editor = editorRef.current.getEditor();
        if (!editor) {
            message.warning('Không thể truy cập editor');
            return;
        }

        // Get video URL
        const fileUrl = file.fileUrl || file.FileUrl;
        const fileId = file.id || file.Id || file.fileUploadId;
        const fileName = file.fileName || file.FileName || '';
        const mimeType = file.mimeType || file.MimeType || '';
        
        // Determine MIME type from file extension if not provided
        let videoMimeType = mimeType;
        if (!videoMimeType || !videoMimeType.startsWith('video/')) {
            if (fileName.endsWith('.mp4')) {
                videoMimeType = 'video/mp4';
            } else if (fileName.endsWith('.webm')) {
                videoMimeType = 'video/webm';
            } else if (fileName.endsWith('.ogg')) {
                videoMimeType = 'video/ogg';
            } else if (fileName.endsWith('.avi')) {
                videoMimeType = 'video/x-msvideo';
            } else if (fileName.endsWith('.mov')) {
                videoMimeType = 'video/quicktime';
            } else if (fileName.endsWith('.wmv')) {
                videoMimeType = 'video/x-ms-wmv';
            } else {
                videoMimeType = 'video/mp4'; // Default
            }
        }
        
        let videoUrl = fileUrl;
        
        // Build full URL
        if (!videoUrl && fileId) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166';
            videoUrl = `${baseUrl}/api/fileupload/${fileId}`;
        } else if (fileUrl && !fileUrl.startsWith('http')) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166';
            videoUrl = `${baseUrl}${fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl}`;
        }

        if (!videoUrl) {
            message.warning('Không tìm thấy URL video');
            return;
        }

        console.log('Inserting video:', { videoUrl, videoMimeType, fileName });

        // Test video URL before inserting
        // Note: Some video formats (like screen recordings) may not be supported by browser
        // We'll still insert the video but with better error handling

        // Get current selection and content
        const range = editor.getSelection(true);
        const currentContent = editor.root.innerHTML || '';
        
        // Create video HTML element with proper formatting and error handling
        const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const errorDivId = `error-${videoId}`;
        
        // Escape HTML in URL and filename for safety
        const escapedVideoUrl = videoUrl.replace(/"/g, '&quot;');
        const escapedFileName = (fileName || 'Video').replace(/"/g, '&quot;');
        
        // Check if it's a screen recording (common formats that might have codec issues)
        const isScreenRecording = fileName.match(/REC|Screen|Record|Capture/i);
        
        // Show warning if screen recording
        if (isScreenRecording) {
            message.warning('Video có vẻ là screen recording. Một số codec không được browser hỗ trợ. Nếu không phát được, vui lòng chuyển đổi sang MP4 (H.264).', 5);
        }
        
        const videoHtml = `<div class="ql-video-wrapper" contenteditable="false" style="margin: 16px 0; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; padding: 8px; background: #fafafa; display: block;">
            <video 
                id="${videoId}"
                src="${escapedVideoUrl}"
                controls 
                preload="metadata"
                playsinline
                webkit-playsinline
                style="max-width: 100%; height: auto; max-height: 500px; display: block; margin: 0 auto;"
            >
                <source src="${escapedVideoUrl}" type="${videoMimeType}">
                <source src="${escapedVideoUrl}">
                Video không thể phát. <a href="${escapedVideoUrl}" target="_blank">Click để tải xuống</a>
            </video>
            <div id="${errorDivId}" style="display: none; padding: 20px; color: #ff4d4f; text-align: center; background: #fff2f0; border: 1px solid #ffccc7; border-radius: 4px; margin-top: 8px;">
                <p style="margin-bottom: 12px;"><strong>⚠️ Không thể phát video này</strong></p>
                ${isScreenRecording ? '<p style="font-size: 12px; color: #fa8c16; margin-bottom: 8px; font-weight: 500;">📹 Video có thể là screen recording với codec không được browser hỗ trợ</p>' : ''}
                <p style="font-size: 12px; color: #999; margin: 4px 0;"><strong>File:</strong> ${escapedFileName}</p>
                <p style="font-size: 11px; color: #999; margin: 4px 0; word-break: break-all;"><strong>URL:</strong> ${escapedVideoUrl}</p>
                <p style="font-size: 11px; color: #999; margin: 4px 0;"><strong>MIME Type:</strong> ${videoMimeType}</p>
                <p id="error-detail-${videoId}" style="font-size: 11px; color: #666; margin-top: 12px;">💡 <strong>Giải pháp:</strong> Vui lòng chuyển đổi video sang định dạng MP4 (H.264) hoặc tải xuống để xem.</p>
                <div style="margin-top: 12px;">
                    <a href="${escapedVideoUrl}" target="_blank" style="color: #1890ff; text-decoration: underline; display: inline-block; margin: 4px; padding: 8px 16px; background: #e6f7ff; border-radius: 4px;">📥 Tải xuống video</a>
                    <a href="${escapedVideoUrl}" target="_blank" style="color: #1890ff; text-decoration: underline; display: inline-block; margin: 4px; padding: 8px 16px; background: #f0f0f0; border-radius: 4px;">🔗 Mở trong tab mới</a>
                </div>
            </div>
            <p style="margin-top: 8px; font-size: 12px; color: #999; margin-bottom: 0;">Video: ${escapedFileName}</p>
        </div>`;
        
        // Insert video at cursor position or append
        try {
            let newContent = '';
            
            if (range && range.index !== undefined && range.index > 0) {
                // Try to insert at cursor position
                // Get text content to find insertion point
                const textBefore = editor.getText(0, range.index);
                const textAfter = editor.getText(range.index);
                
                // Insert video HTML - append for now (ReactQuill will handle positioning)
                // For better control, we'll insert at a paragraph boundary
                const currentHtml = editor.root.innerHTML;
                
                // Simple approach: find last </p> and insert before it, or append at end
                const lastPIndex = currentHtml.lastIndexOf('</p>');
                if (lastPIndex > 0) {
                    newContent = currentHtml.substring(0, lastPIndex) + videoHtml + currentHtml.substring(lastPIndex);
                } else {
                    newContent = currentHtml + videoHtml;
                }
            } else {
                // Append at end
                newContent = currentContent + videoHtml;
            }
            
            // Set new content using dangerouslyPasteHTML
            editor.clipboard.dangerouslyPasteHTML(newContent);
            
            // Update document state and setup video error handlers
            setTimeout(() => {
                const updatedContent = editor.root.innerHTML;
                setDocument(prev => ({ ...prev, content: updatedContent }));
                setSaveStatus('unsaved');
                
                // Setup error handlers for video elements
                const videoElement = editor.root.querySelector(`#${videoId}`);
                const errorDiv = editor.root.querySelector(`#${errorDivId}`);
                
                if (videoElement && videoElement.tagName === 'VIDEO') {
                    // Set up error handler with detailed logging
                    videoElement.addEventListener('error', (e) => {
                        console.error('=== VIDEO ERROR ===');
                        console.error('Video element:', videoElement);
                        console.error('Video error object:', videoElement.error);
                        console.error('Video error code:', videoElement.error?.code);
                        console.error('Video error message:', videoElement.error?.message);
                        console.error('Video networkState:', videoElement.networkState, getNetworkStateText(videoElement.networkState));
                        console.error('Video readyState:', videoElement.readyState, getReadyStateText(videoElement.readyState));
                        console.error('Video URL:', videoElement.src || videoElement.querySelector('source')?.src);
                        console.error('Video MIME type:', videoElement.querySelector('source')?.type);
                        console.error('Video currentSrc:', videoElement.currentSrc);
                        console.error('Video canPlayType:', videoElement.canPlayType(videoMimeType));
                        console.error('==================');
                        
                        // Show detailed error in console
                        if (videoElement.error) {
                            const errorCode = videoElement.error.code;
                            const errorMessages = {
                                1: 'MEDIA_ERR_ABORTED - Video download aborted',
                                2: 'MEDIA_ERR_NETWORK - Network error (kiểm tra kết nối hoặc CORS)',
                                3: 'MEDIA_ERR_DECODE - Video decode error (codec không được hỗ trợ)',
                                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported (định dạng không được hỗ trợ)'
                            };
                            const errorMsg = errorMessages[errorCode] || 'Unknown error';
                            console.error('Error details:', errorMsg);
                            
                            // Show error div
                            if (errorDiv) {
                                errorDiv.style.display = 'block';
                                // Add error code info
                                const errorDetailP = errorDiv.querySelector(`#error-detail-${videoId}`);
                                if (errorDetailP) {
                                    errorDetailP.innerHTML = `💡 <strong>Chi tiết lỗi:</strong> ${errorMsg}. Vui lòng chuyển đổi video sang định dạng MP4 (H.264) hoặc tải xuống để xem.`;
                                }
                            }
                        } else {
                            // Show error div even if no error object
                            if (errorDiv) {
                                errorDiv.style.display = 'block';
                            }
                        }
                        
                        // Hide video element
                        videoElement.style.display = 'none';
                    });
                    
                    // Helper functions for state text
                    function getNetworkStateText(state) {
                        const states = ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'];
                        return states[state] || 'UNKNOWN';
                    }
                    
                    function getReadyStateText(state) {
                        const states = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'];
                        return states[state] || 'UNKNOWN';
                    }
                    
                    videoElement.addEventListener('loadedmetadata', () => {
                        console.log('Video metadata loaded successfully');
                        console.log('Video duration:', videoElement.duration);
                        console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
                        if (errorDiv) {
                            errorDiv.style.display = 'none';
                        }
                    });
                    
                    videoElement.addEventListener('loadeddata', () => {
                        console.log('Video data loaded successfully');
                        if (errorDiv) {
                            errorDiv.style.display = 'none';
                        }
                    });
                    
                    videoElement.addEventListener('canplay', () => {
                        console.log('Video can play');
                        if (errorDiv) {
                            errorDiv.style.display = 'none';
                        }
                    });
                    
                    videoElement.addEventListener('loadstart', () => {
                        console.log('Video loading started');
                        if (errorDiv) {
                            errorDiv.style.display = 'none';
                        }
                    });
                    
                    // Try to load video
                    videoElement.load();
                }
                
                // Move cursor to end
                const length = editor.getLength();
                if (length > 0) {
                    editor.setSelection(length - 1, 'silent');
                }
            }, 100);
            
            message.success('Đã chèn video vào bài giảng. Bạn có thể di chuyển video bằng cách select và cut/paste.');
        } catch (error) {
            console.error('Error inserting video:', error);
            // Fallback: append to content directly
            const newContent = currentContent + videoHtml;
            editor.clipboard.dangerouslyPasteHTML(newContent);
            setTimeout(() => {
                const updatedContent = editor.root.innerHTML;
                setDocument(prev => ({ ...prev, content: updatedContent }));
                setSaveStatus('unsaved');
            }, 100);
            message.success('Đã chèn video vào cuối bài giảng');
        }
    };

    const handleTitleChange = (title) => { 
        setDocument(prev => ({ ...prev, title })); 
        setSaveStatus('unsaved'); 
    };

    const handleLoadSavedPlan = async (plan) => {
        setIsLoading(true);
        try {
            // Handle both camelCase and PascalCase for plan ID
            const planId = plan.id || plan.Id || plan.ID;
            if (!planId) {
                message.error('Không tìm thấy ID của giáo án');
                return;
            }
            
            console.log('Loading lesson plan:', { planId, plan });
            
            const result = await lessonPlanService.getLessonPlanById(planId);
            console.log('Get lesson plan result:', result);
            
            if (result.success && result.data) {
                const planData = result.data;
                console.log('Loaded lesson plan data:', planData);
                
                // Backend returns: { Id, Title, Objectives, Description, GradeLevel, ImageUrl, ... }
                // Since we're saving content in Description temporarily, get it from there
                const content = planData.Content || planData.content || 
                                planData.Description || planData.description || 
                                plan.content || '';
                
                const documentData = {
                    title: planData.Title || planData.title || plan.Title || plan.title || '',
                    content: content, // Get from Description (where we saved it)
                    objectives: planData.Objectives || planData.objectives || '',
                    description: planData.Description || planData.description || '', // Keep original description
                    gradeLevel: planData.GradeLevel || planData.gradeLevel || plan.GradeLevel || plan.gradeLevel || 1,
                    imageUrl: planData.ImageUrl || planData.imageUrl || plan.ImageUrl || plan.imageUrl || null
                };
                
                console.log('Setting document:', documentData);
                
                setDocument(documentData);
                setActivePlanId(planId);
                setSaveStatus('saved');
                setShowMetadataForm(false);
                
                // Load files for this lesson plan
                await loadFilesForPlan(planId);
                
                // Update editor content - ReactQuill should update automatically via value prop
                // But ensure it's set by forcing a re-render if needed
                if (editorRef.current) {
                    const editor = editorRef.current.getEditor();
                    if (editor) {
                        // Set content directly if ReactQuill doesn't update via value prop
                        const currentContent = editor.root.innerHTML;
                        if (currentContent !== content) {
                            editor.root.innerHTML = content;
                        }
                    }
                }
                
                message.info(`Đã mở "${documentData.title}".`);
            } else {
                console.error('Failed to load lesson plan:', result);
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

    const handleCreateBlankDocument = () => {
        setActivePlanId(null);
        setDocument({
            title: 'Giáo án mới',
            content: '',
            objectives: '',
            description: '',
            gradeLevel: 1,
            imageUrl: null
        });
        setSaveStatus('unsaved');
        setShowMetadataForm(true);
        message.info('Đã tạo trang word trống. Vui lòng điền thông tin và lưu.');
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
                        <Button icon={<FileTextOutlined />} onClick={handleCreateBlankDocument} block style={{marginTop: '8px'}}>Tạo trang word trống</Button>
                        <Upload 
                            beforeUpload={handleUploadFileForEdit} 
                            showUploadList={false}
                            accept=".txt,.doc,.docx,.pdf,.rtf"
                        >
                            <Button icon={<UploadOutlined />} block style={{marginTop: '8px'}}>Tải lên file để chỉnh sửa</Button>
                        </Upload>
                        <Upload beforeUpload={handleUploadFileAttachment} showUploadList={false}>
                            <Button icon={<FileOutlined />} block style={{marginTop: '8px'}}>Đính kèm file</Button>
                        </Upload>
                        <Upload beforeUpload={handleUploadVideo} showUploadList={false} accept="video/*">
                            <Button icon={<PlayCircleOutlined />} block style={{marginTop: '8px'}}>Đính kèm video</Button>
                        </Upload>
                        <Divider />
                        {/* Phần Mục lục mới */}
                        <OutlinePanel outline={outline} onNavigate={handleNavigate} />
                        <Divider />
                        {/* Phần Files đã upload */}
                        {(activePlanId || uploadedFiles.length > 0) && (
                            <>
                                <Title level={5} className="panel-title-alt chemistry-title">
                                    <FileOutlined /> Files đã tải lên ({uploadedFiles.length})
                                    {pendingFiles.length > 0 && (
                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                            ({pendingFiles.length} chờ đính kèm)
                                        </Text>
                                    )}
                                </Title>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px' }}>
                                    {loadingFiles ? (
                                        <Spin size="small" tip="Đang tải..." />
                                    ) : uploadedFiles.length === 0 ? (
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', padding: '8px' }}>Chưa có file nào</Text>
                                    ) : (
                                        <List
                                            size="small"
                                            dataSource={uploadedFiles}
                                            renderItem={(file) => {
                                                const fileId = file.id || file.Id || file.LessonPlanFileId || file.lessonPlanFileId;
                                                const fileName = file.fileName || file.FileName || 'Không tên';
                                                const fileSize = file.fileSize || file.FileSize || 0;
                                                const mimeType = file.mimeType || file.MimeType || '';
                                                const isPending = file.pending || false;
                                                const isVideo = file.isVideo || mimeType.startsWith('video/') || 
                                                               fileName.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i);
                                                
                                                return (
                                                    <List.Item
                                                        style={{ padding: '8px 0' }}
                                                        actions={[
                                                            isVideo && document ? (
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<PlusOutlined />}
                                                                    onClick={() => handleInsertVideo(file)}
                                                                    title="Chèn vào bài giảng"
                                                                    style={{ color: '#1890ff' }}
                                                                />
                                                            ) : null,
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={isVideo ? <PlayCircleOutlined /> : <EyeOutlined />}
                                                                onClick={() => handleViewFile(file)}
                                                                title={isVideo ? "Xem video" : "Xem"}
                                                            />,
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<DownloadOutlined />}
                                                                onClick={() => handleDownloadFile(file)}
                                                                title="Tải xuống"
                                                            />,
                                                            fileId ? (
                                                                <Popconfirm
                                                                    title="Xóa file này?"
                                                                    onConfirm={() => handleDeleteFile(fileId)}
                                                                    okText="Xóa"
                                                                    cancelText="Hủy"
                                                                >
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        danger
                                                                        icon={<DeleteOutlined />}
                                                                        title="Xóa"
                                                                    />
                                                                </Popconfirm>
                                                            ) : (
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    disabled
                                                                    icon={<DeleteOutlined />}
                                                                    title="Không thể xóa (thiếu ID)"
                                                                />
                                                            )
                                                        ].filter(Boolean)}
                                                    >
                                                        <List.Item.Meta
                                                            title={
                                                                <Text ellipsis style={{ fontSize: '12px', maxWidth: '150px' }}>
                                                                    {isVideo && <PlayCircleOutlined style={{ marginRight: '4px' }} />}
                                                                    {fileName}
                                                                </Text>
                                                            }
                                                            description={
                                                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                    {formatFileSize(fileSize)}
                                                                    {isVideo && <span style={{ marginLeft: '8px', color: '#1890ff' }}>(Video)</span>}
                                                                    {isPending && <span style={{ marginLeft: '8px', color: '#fa8c16' }}>(Chờ đính kèm)</span>}
                                                                </Text>
                                                            }
                                                        />
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    )}
                                </div>
                                <Divider />
                            </>
                        )}
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
            
            {/* File Viewer Modal */}
            <Modal
                title={viewingFile?.name || 'Xem file'}
                open={fileViewerVisible}
                onCancel={() => {
                    setFileViewerVisible(false);
                    setViewingFile(null);
                }}
                footer={[
                    <Button key="download" onClick={() => {
                        if (viewingFile) {
                            const fileId = viewingFile.url.match(/\/api\/fileupload\/(\d+)/)?.[1];
                            handleDownloadFile({
                                id: fileId,
                                fileName: viewingFile.name
                            });
                        }
                    }}>
                        Tải xuống
                    </Button>,
                    <Button key="close" onClick={() => {
                        setFileViewerVisible(false);
                        setViewingFile(null);
                    }}>
                        Đóng
                    </Button>
                ]}
                width="90%"
                style={{ top: 20 }}
                bodyStyle={{ height: 'calc(100vh - 150px)', padding: 0 }}
            >
                {viewingFile && (
                    <div style={{ height: '100%', width: '100%' }}>
                        {viewingFile.mimeType?.startsWith('video/') || viewingFile.name.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i) ? (
                            <video
                                controls
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                                src={viewingFile.url}
                            >
                                Trình duyệt của bạn không hỗ trợ video tag.
                            </video>
                        ) : viewingFile.mimeType?.startsWith('image/') || viewingFile.name.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i) ? (
                            <img 
                                src={viewingFile.url} 
                                alt={viewingFile.name}
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100%', 
                                    objectFit: 'contain',
                                    display: 'block',
                                    margin: 'auto'
                                }}
                            />
                        ) : viewingFile.mimeType === 'application/pdf' || viewingFile.name.endsWith('.pdf') ? (
                            <iframe
                                src={viewingFile.url}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                                title={viewingFile.name}
                            />
                        ) : viewingFile.mimeType?.startsWith('text/') ? (
                            <iframe
                                src={viewingFile.url}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                                title={viewingFile.name}
                            />
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p>Không thể xem trực tiếp file này. Vui lòng tải xuống để xem.</p>
                                <Button type="primary" onClick={() => {
                                    const fileId = viewingFile.url.match(/\/api\/fileupload\/(\d+)/)?.[1];
                                    handleDownloadFile({
                                        id: fileId,
                                        fileName: viewingFile.name
                                    });
                                }}>
                                    Tải xuống
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CreateLessonPlanPage;

