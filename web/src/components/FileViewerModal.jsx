import React from 'react';
import { Modal, Button } from 'antd';

const FileViewerModal = ({ 
  visible, 
  file, 
  onClose, 
  onDownload 
}) => {
  if (!file) return null;

  const isVideo = file.mimeType?.startsWith('video/') || 
                  file.name.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i);
  const isImage = file.mimeType?.startsWith('image/') || 
                  file.name.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i);
  const isPdf = file.mimeType === 'application/pdf' || file.name.endsWith('.pdf');
  const isText = file.mimeType?.startsWith('text/');

  const renderContent = () => {
    if (isVideo) {
      return (
        <video
          controls
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          src={file.url}
        >
          Trình duyệt của bạn không hỗ trợ video tag.
        </video>
      );
    } else if (isImage) {
      return (
        <img 
          src={file.url} 
          alt={file.name}
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            objectFit: 'contain',
            display: 'block',
            margin: 'auto'
          }}
        />
      );
    } else if (isPdf || isText) {
      return (
        <iframe
          src={file.url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title={file.name}
        />
      );
    } else {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Không thể xem trực tiếp file này. Vui lòng tải xuống để xem.</p>
          <Button type="primary" onClick={onDownload}>
            Tải xuống
          </Button>
        </div>
      );
    }
  };

  return (
    <Modal
      title={file.name || 'Xem file'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="download" onClick={onDownload}>
          Tải xuống
        </Button>,
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width="90%"
      style={{ top: 20 }}
      bodyStyle={{ height: 'calc(100vh - 150px)', padding: 0 }}
    >
      <div style={{ height: '100%', width: '100%' }}>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default FileViewerModal;

