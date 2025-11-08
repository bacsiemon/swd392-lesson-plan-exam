import { useState } from 'react';
import { message } from 'antd';
import api from '../services/axios';
import lessonPlanService from '../services/lessonPlanService';

export const useFileUpload = (activePlanId, setUploadedFiles, setPendingFiles) => {
  const [loadingFiles, setLoadingFiles] = useState(false);

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

  const handleUploadVideo = async (file) => {
    const isVideo = file.type.startsWith('video/') || 
                   file.name.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i);
    
    if (!isVideo) {
      message.warning('Vui lòng chọn file video (mp4, webm, avi, etc.)');
      return false;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      message.warning('File video quá lớn. Kích thước tối đa là 100MB');
      return false;
    }

    try {
      let result;
      let fileData;
      
      if (activePlanId) {
        result = await lessonPlanService.uploadFile(activePlanId, file);
        if (result.success) {
          message.success('Đính kèm video thành công');
          fileData = result.data;
        }
      } else {
        message.loading('Đang tải lên video...', 0);
        result = await uploadFileDirectly(file);
        message.destroy();
        
        if (result.success) {
          message.success('Tải lên video thành công. Video sẽ được đính kèm khi bạn lưu giáo án.');
          fileData = result.data;
          
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
            pending: true
          };
          
          setPendingFiles(prev => {
            const exists = prev.some(f => 
              (f.fileUrl === pendingFile.fileUrl) || 
              (f.fileName === pendingFile.fileName && f.fileSize === pendingFile.fileSize)
            );
            if (exists) return prev;
            return [...prev, pendingFile];
          });
          
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

  const handleUploadFileAttachment = async (file) => {
    try {
      let result;
      let fileData;
      
      if (activePlanId) {
        result = await lessonPlanService.uploadFile(activePlanId, file);
        if (result.success) {
          message.success(result.message || 'Đính kèm file thành công');
          fileData = result.data;
        }
      } else {
        message.loading('Đang tải lên file...', 0);
        result = await uploadFileDirectly(file);
        message.destroy();
        
        if (result.success) {
          message.success('Tải lên file thành công. File sẽ được đính kèm khi bạn lưu giáo án.');
          fileData = result.data;
          
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
            pending: true
          };
          
          setPendingFiles(prev => {
            const exists = prev.some(f => 
              (f.fileUrl === pendingFile.fileUrl) || 
              (f.fileName === pendingFile.fileName && f.fileSize === pendingFile.fileSize)
            );
            if (exists) return prev;
            return [...prev, pendingFile];
          });
          
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

  return {
    loadingFiles,
    setLoadingFiles,
    handleUploadVideo,
    handleUploadFileAttachment,
    uploadFileDirectly
  };
};

