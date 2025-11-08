import { message } from 'antd';

export const insertVideoIntoEditor = (editorRef, file, setDocument, setSaveStatus) => {
  if (!editorRef.current) {
    message.warning('Editor chưa sẵn sàng');
    return;
  }

  const editor = editorRef.current.getEditor();
  if (!editor) {
    message.warning('Không thể truy cập editor');
    return;
  }

  const fileUrl = file.fileUrl || file.FileUrl;
  const fileId = file.id || file.Id || file.fileUploadId;
  const fileName = file.fileName || file.FileName || '';
  const mimeType = file.mimeType || file.MimeType || '';
  
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
      videoMimeType = 'video/mp4';
    }
  }
  
  let videoUrl = fileUrl;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166';
  
  if (!videoUrl && fileId) {
    videoUrl = `${baseUrl}/api/fileupload/${fileId}`;
  } else if (fileUrl && !fileUrl.startsWith('http')) {
    videoUrl = `${baseUrl}${fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl}`;
  }

  if (!videoUrl) {
    message.warning('Không tìm thấy URL video');
    return;
  }

  const range = editor.getSelection(true);
  const currentContent = editor.root.innerHTML || '';
  
  const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const errorDivId = `error-${videoId}`;
  const escapedVideoUrl = videoUrl.replace(/"/g, '&quot;');
  const escapedFileName = (fileName || 'Video').replace(/"/g, '&quot;');
  const isScreenRecording = fileName.match(/REC|Screen|Record|Capture/i);
  
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
  
  try {
    let newContent = '';
    const currentHtml = editor.root.innerHTML;
    const lastPIndex = currentHtml.lastIndexOf('</p>');
    
    if (lastPIndex > 0) {
      newContent = currentHtml.substring(0, lastPIndex) + videoHtml + currentHtml.substring(lastPIndex);
    } else {
      newContent = currentContent + videoHtml;
    }
    
    editor.clipboard.dangerouslyPasteHTML(newContent);
    
    setTimeout(() => {
      const updatedContent = editor.root.innerHTML;
      setDocument(prev => ({ ...prev, content: updatedContent }));
      setSaveStatus('unsaved');
      
      setupVideoErrorHandlers(editor, videoId, errorDivId, videoMimeType, fileName, isScreenRecording);
      
      const length = editor.getLength();
      if (length > 0) {
        editor.setSelection(length - 1, 'silent');
      }
    }, 100);
    
    message.success('Đã chèn video vào bài giảng. Bạn có thể di chuyển video bằng cách select và cut/paste.');
  } catch (error) {
    console.error('Error inserting video:', error);
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

const setupVideoErrorHandlers = (editor, videoId, errorDivId, videoMimeType, fileName, isScreenRecording) => {
  const videoElement = editor.root.querySelector(`#${videoId}`);
  const errorDiv = editor.root.querySelector(`#${errorDivId}`);
  
  if (videoElement && videoElement.tagName === 'VIDEO') {
    videoElement.addEventListener('error', (e) => {
      console.error('=== VIDEO ERROR ===');
      if (videoElement.error) {
        const errorCode = videoElement.error.code;
        const errorMessages = {
          1: 'MEDIA_ERR_ABORTED - Video download aborted',
          2: 'MEDIA_ERR_NETWORK - Network error (kiểm tra kết nối hoặc CORS)',
          3: 'MEDIA_ERR_DECODE - Video decode error (codec không được hỗ trợ)',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported (định dạng không được hỗ trợ)'
        };
        const errorMsg = errorMessages[errorCode] || 'Unknown error';
        
        if (errorDiv) {
          errorDiv.style.display = 'block';
          const errorDetailP = errorDiv.querySelector(`#error-detail-${videoId}`);
          if (errorDetailP) {
            errorDetailP.innerHTML = `💡 <strong>Chi tiết lỗi:</strong> ${errorMsg}. Vui lòng chuyển đổi video sang định dạng MP4 (H.264) hoặc tải xuống để xem.`;
          }
        }
      } else if (errorDiv) {
        errorDiv.style.display = 'block';
      }
      videoElement.style.display = 'none';
    });
    
    ['loadedmetadata', 'loadeddata', 'canplay', 'loadstart'].forEach(event => {
      videoElement.addEventListener(event, () => {
        if (errorDiv) {
          errorDiv.style.display = 'none';
        }
      });
    });
    
    videoElement.load();
  }
};

