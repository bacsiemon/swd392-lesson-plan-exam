import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, message, Spin, Empty } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import '../styles/CreateLessonPlanPage.css';
import lessonPlanService from '../services/lessonPlanService';
import api from '../services/axios';
import { getCurrentUserId, readTextFile } from '../utils/fileUtils';
import { insertVideoIntoEditor } from '../utils/videoUtils';
import { useFileUpload } from '../hooks/useFileUpload';
import LessonPlanControlPanel from '../components/LessonPlanControlPanel';
import LessonPlanEditor from '../components/LessonPlanEditor';
import LessonPlanMetadataForm from '../components/LessonPlanMetadataForm';
import FileViewerModal from '../components/FileViewerModal';

// --- DỮ LIỆU GIẢ LẬP ---
const MOCK_SAVED_PLANS = [
  { id: 'plan_01', title: 'Giáo án bài "Phản ứng Este hóa"', createdAt: 'Hôm qua', content: `<h1>I. MỤC TIÊU</h1><p>Học sinh có thể trình bày khái niệm và viết phương trình phản ứng este hóa.</p><h2>1. Kiến thức</h2><p>Nội dung kiến thức...</p><h2>2. Kỹ năng</h2><p>Nội dung kỹ năng...</p><h1>II. NỘI DUNG</h1><p>...</p><p style="page-break-before: always;"></p><h1>III. HOẠT ĐỘNG</h1><p>Hoạt động dạy và học...</p>` },
];

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
  const editorRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [viewingFile, setViewingFile] = useState(null);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  const { loadingFiles, setLoadingFiles, handleUploadVideo, handleUploadFileAttachment, uploadFileDirectly } = 
    useFileUpload(activePlanId, setUploadedFiles, setPendingFiles);

  // Load current user ID on mount
  useEffect(() => {
    const loadUserId = async () => {
      const userId = await getCurrentUserId(api);
      setCurrentUserId(userId);
    };
    loadUserId();
  }, []);

  // Load saved lesson plans on mount
  useEffect(() => {
    const loadSavedPlans = async () => {
      setLoadingPlans(true);
      try {
        const result = await lessonPlanService.getCurrentTeacherLessonPlans();
        if (result.success && result.data) {
          const plans = Array.isArray(result.data) ? result.data : (result.data.items || []);
          setSavedPlans(plans);
        } else {
          setSavedPlans([]);
        }
      } catch (error) {
        console.error('Error loading lesson plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    loadSavedPlans();
  }, []);

  // Load files when active plan changes
  useEffect(() => {
    if (activePlanId) {
      loadFilesForPlan(activePlanId);
    } else {
      setUploadedFiles([]);
    }
  }, [activePlanId]);

  // Auto-generate outline
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
          element: heading,
        });
      });
      setOutline(newOutline);
    } else {
      setOutline([]);
    }
  }, [document?.content]);

  // Load files for a lesson plan
  const loadFilesForPlan = async (planId) => {
    setLoadingFiles(true);
    try {
      const result = await lessonPlanService.getLessonPlanById(planId);
      if (result.success && result.data) {
        const planData = result.data;
        const files = planData.LessonPlanFiles || planData.lessonPlanFiles || planData.Files || planData.files || [];
        
        if (Array.isArray(files) && files.length > 0) {
          const mappedFiles = files.map(file => ({
            id: file.Id || file.id,
            fileUrl: file.FileUrl || file.fileUrl,
            fileName: file.FileName || file.fileName || 'Unknown',
            mimeType: file.MimeType || file.mimeType || '',
            fileSize: file.FileSize || file.fileSize || 0,
            uploadedAt: file.UploadedAt || file.uploadedAt || file.UpdatedAt || file.updatedAt
          }));
          setUploadedFiles(mappedFiles);
        }
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!document || !document.title || !document.content) {
      message.warning('Vui lòng nhập tiêu đề và nội dung giáo án');
      return;
    }

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
        ...(activePlanId ? {} : {
          createdByTeacher: currentUserId || 1,
          objectives: document.objectives || '',
          description: document.content || document.description || '',
          gradeLevel: document.gradeLevel || 1,
          imageUrl: document.imageUrl || null
        }),
        ...(activePlanId ? {
          objectives: document.objectives || '',
          description: document.content || document.description || '',
          gradeLevel: document.gradeLevel || 1,
          imageUrl: document.imageUrl || null
        } : {})
      };

      let result;
      if (activePlanId) {
        result = await lessonPlanService.updateLessonPlan(activePlanId, lessonPlanData);
      } else {
        result = await lessonPlanService.createLessonPlan(lessonPlanData);
      }

      if (result.success) {
        setSaveStatus('saved');
        setShowMetadataForm(false);
        message.success(result.message || 'Lưu giáo án thành công');
        
        let newPlanId = activePlanId;
        if (!activePlanId && result.data) {
          newPlanId = result.data.id || result.data.Id || result.data.ID;
          if (newPlanId) {
            setActivePlanId(newPlanId);
          }
        }
        
        // Attach pending files
        if (newPlanId && pendingFiles.length > 0) {
          try {
            message.loading(`Đang đính kèm ${pendingFiles.length} file đã tải lên vào giáo án...`, 0);
            
            let attachedCount = 0;
            for (const pendingFile of pendingFiles) {
              try {
                const fileResponse = await api.get(`/api/fileupload/${pendingFile.fileUploadId}/download`, {
                  responseType: 'blob'
                });
                
                const blob = fileResponse.data;
                const file = new File([blob], pendingFile.fileName, { type: pendingFile.mimeType });
                
                const attachResult = await lessonPlanService.uploadFile(newPlanId, file);
                if (attachResult.success) {
                  attachedCount++;
                }
              } catch (error) {
                console.error(`Error attaching file ${pendingFile.fileName}:`, error);
              }
            }
            
            if (newPlanId) {
              await loadFilesForPlan(newPlanId);
            }
            
            message.destroy();
            if (attachedCount === pendingFiles.length) {
              message.success(`Đã đính kèm ${attachedCount} file vào giáo án`);
            } else {
              message.warning(`Đã đính kèm ${attachedCount}/${pendingFiles.length} file. Một số file có thể cần tải lên lại.`);
            }
            
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
          if (plansResult.success && plansResult.data) {
            const plans = Array.isArray(plansResult.data) ? plansResult.data : (plansResult.data.items || []);
            setSavedPlans(plans);
          }
        } catch (error) {
          console.error('Error refreshing lesson plans:', error);
        }
      } else {
        const errorMsg = result.message || result.error?.message || result.error?.Message || 
                        (typeof result.error === 'string' ? result.error : 'Không thể lưu giáo án');
        message.error({ content: errorMsg, duration: 5 });
      }
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.Message || 
                     error.response?.data?.errors || error.response?.data?.Errors ||
                     error.message || 'Có lỗi xảy ra khi lưu giáo án';
      message.error({ content: errorMsg, duration: 5 });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!document) return;
    window.print();
  };

  // Upload file for edit
  const handleUploadFileForEdit = async (file) => {
    setIsLoading(true);
    try {
      const fileName = file.name || '';
      const fileType = file.type || '';
      let content = '';

      const isText = fileName.endsWith('.txt') || fileType.startsWith('text/');
      const isDocx = fileName.endsWith('.docx') || fileType.includes('wordprocessingml');
      const isDoc = fileName.endsWith('.doc') || fileType.includes('msword');
      const isPdf = fileName.endsWith('.pdf') || fileType === 'application/pdf';
      const isRtf = fileName.endsWith('.rtf') || fileType.includes('rtf');

      if (isText) {
        content = await readTextFile(file);
      } else if (isDocx || isDoc) {
        message.warning('File Word (.doc/.docx) chưa được hỗ trợ. Vui lòng chuyển sang file .txt hoặc .pdf');
        setIsLoading(false);
        return false;
      } else if (isPdf) {
        message.warning('File PDF chưa được hỗ trợ. Vui lòng chuyển sang file .txt');
        setIsLoading(false);
        return false;
      } else if (isRtf) {
        message.warning('File RTF có thể không hiển thị đúng định dạng. Vui lòng sử dụng file .txt');
        content = await readTextFile(file);
      } else {
        content = await readTextFile(file);
      }

      setActivePlanId(null);
      const newDocument = {
        title: fileName.replace(/\.[^/.]+$/, ''),
        content: content,
        objectives: '',
        description: '',
        gradeLevel: 1,
        imageUrl: null
      };
      setDocument(newDocument);
      setSaveStatus('unsaved');
      setShowMetadataForm(true);
      
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
    return false;
  };

  // Delete file
  const handleDeleteFile = async (fileId) => {
    const pendingFile = pendingFiles.find(f => (f.id === fileId || f.fileUploadId === fileId));
    if (pendingFile) {
      setPendingFiles(prev => prev.filter(f => f.id !== fileId && f.fileUploadId !== fileId));
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId && f.fileUploadId !== fileId));
      message.success('Đã xóa file khỏi danh sách');
      return;
    }
    
    try {
      const result = await lessonPlanService.deleteFile(fileId);
      if (result.success) {
        message.success('Xóa file thành công');
        setUploadedFiles(prev => prev.filter(f => (f.id || f.Id) !== fileId));
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

  // View file
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

    let uploadFileId = fileId;
    if (!uploadFileId && fileUrl) {
      const match = fileUrl.match(/\/api\/fileupload\/(\d+)/);
      if (match) {
        uploadFileId = parseInt(match[1]);
      }
    }

    if (uploadFileId) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166';
      const viewUrl = `${baseUrl}/api/fileupload/${uploadFileId}`;
      
      const isViewableType = mimeType.startsWith('image/') || 
                            mimeType === 'application/pdf' || 
                            mimeType.startsWith('text/') ||
                            fileName.endsWith('.pdf') ||
                            fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i);
      
      if (isVideo || isViewableType) {
        setViewingFile({
          url: viewUrl,
          name: fileName,
          mimeType: mimeType
        });
        setFileViewerVisible(true);
      } else {
        window.open(viewUrl, '_blank');
      }
    } else if (fileUrl) {
      const fullUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'}${fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  // Download file
  const handleDownloadFile = (file) => {
    const fileUrl = file.fileUrl || file.FileUrl;
    const fileId = file.id || file.Id || file.fileUploadId;
    const fileName = file.fileName || file.FileName || 'file';
    
    let uploadFileId = fileId;
    if (!uploadFileId && fileUrl) {
      const match = fileUrl.match(/\/api\/fileupload\/(\d+)/);
      if (match) {
        uploadFileId = parseInt(match[1]);
      }
    }

    if (uploadFileId) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166';
      const downloadUrl = `${baseUrl}/api/fileupload/${uploadFileId}/download`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (fileUrl) {
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

  // Insert video
  const handleInsertVideo = (file) => {
    insertVideoIntoEditor(editorRef, file, setDocument, setSaveStatus);
  };

  // Content and title change handlers
  const handleContentChange = (content) => {
    setDocument(prev => ({ ...prev, content }));
    setSaveStatus('unsaved');
  };

  const handleTitleChange = (title) => {
    setDocument(prev => ({ ...prev, title }));
    setSaveStatus('unsaved');
  };

  // Load saved plan
  const handleLoadSavedPlan = async (plan) => {
    setIsLoading(true);
    try {
      const planId = plan.id || plan.Id || plan.ID;
      if (!planId) {
        message.error('Không tìm thấy ID của giáo án');
        return;
      }
      
      const result = await lessonPlanService.getLessonPlanById(planId);
      
      if (result.success && result.data) {
        const planData = result.data;
        const content = planData.Content || planData.content || 
                        planData.Description || planData.description || 
                        plan.content || '';
        
        const documentData = {
          title: planData.Title || planData.title || plan.Title || plan.title || '',
          content: content,
          objectives: planData.Objectives || planData.objectives || '',
          description: planData.Description || planData.description || '',
          gradeLevel: planData.GradeLevel || planData.gradeLevel || plan.GradeLevel || plan.gradeLevel || 1,
          imageUrl: planData.ImageUrl || planData.imageUrl || plan.ImageUrl || plan.imageUrl || null
        };
        
        setDocument(documentData);
        setActivePlanId(planId);
        setSaveStatus('saved');
        setShowMetadataForm(false);
        
        await loadFilesForPlan(planId);
        
        if (editorRef.current) {
          const editor = editorRef.current.getEditor();
          if (editor) {
            const currentContent = editor.root.innerHTML;
            if (currentContent !== content) {
              editor.root.innerHTML = content;
            }
          }
        }
        
        message.info(`Đã mở "${documentData.title}".`);
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

  // Generate and create handlers
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
        <Col xs={24} lg={7}>
          <LessonPlanControlPanel
            isLoading={isLoading}
            activePlanId={activePlanId}
            document={document}
            outline={outline}
            uploadedFiles={uploadedFiles}
            loadingFiles={loadingFiles}
            pendingFiles={pendingFiles}
            savedPlans={savedPlans}
            loadingPlans={loadingPlans}
            onGenerateClick={handleGenerateClick}
            onCreateBlank={handleCreateBlankDocument}
            onUploadFileForEdit={handleUploadFileForEdit}
            onUploadFileAttachment={handleUploadFileAttachment}
            onUploadVideo={handleUploadVideo}
            onNavigate={handleNavigate}
            onInsertVideo={handleInsertVideo}
            onViewFile={handleViewFile}
            onDownloadFile={handleDownloadFile}
            onDeleteFile={handleDeleteFile}
            onPlanClick={handleLoadSavedPlan}
          />
        </Col>
        <Col xs={24} lg={17}>
          <div className="editor-workspace-alt chemistry-workspace">
            {isLoading ? (
              <div className="center-content-alt">
                <Spin size="large" tip="Đang xử lý..." className="chemistry-spinner" />
              </div>
            ) : !document ? (
              <div className="center-content-alt chemistry-empty">
                <Empty 
                  description="Nội dung sẽ xuất hiện ở đây" 
                  image={<ExperimentOutlined style={{ fontSize: '60px', color: '#b19cd9' }} />}
                />
              </div>
            ) : (
              <LessonPlanEditor
                document={document}
                saveStatus={saveStatus}
                editorRef={editorRef}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onSave={handleSave}
                onPrint={handlePrint}
                metadataForm={
                  showMetadataForm ? (
                    <LessonPlanMetadataForm
                      document={document}
                      onMetadataChange={handleMetadataChange}
                      onHide={() => setShowMetadataForm(false)}
                    />
                  ) : null
                }
              />
            )}
          </div>
        </Col>
      </Row>
      
      <FileViewerModal
        open={fileViewerVisible}
        file={viewingFile}
        onClose={() => {
          setFileViewerVisible(false);
          setViewingFile(null);
        }}
        onDownload={() => {
          if (viewingFile) {
            const fileId = viewingFile.url.match(/\/api\/fileupload\/(\d+)/)?.[1];
            handleDownloadFile({
              id: fileId,
              fileName: viewingFile.name
            });
          }
        }}
      />
    </div>
  );
};

export default CreateLessonPlanPage;
