import React from 'react';
import { List, Button, Popconfirm, Typography, Spin } from 'antd';
import { PlusOutlined, EyeOutlined, DownloadOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { formatFileSize } from '../utils/fileUtils';

const { Text } = Typography;

const FileList = ({ 
  files, 
  loading, 
  pendingFiles, 
  document,
  onInsertVideo,
  onViewFile,
  onDownloadFile,
  onDeleteFile 
}) => {
  if (loading) {
    return <Spin size="small" tip="Đang tải..." />;
  }

  if (files.length === 0) {
    return (
      <Text type="secondary" style={{ fontSize: '12px', display: 'block', padding: '8px' }}>
        Chưa có file nào
      </Text>
    );
  }

  return (
    <List
      size="small"
      dataSource={files}
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
                  key="insert"
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => onInsertVideo(file)}
                  title="Chèn vào bài giảng"
                  style={{ color: '#1890ff' }}
                />
              ) : null,
              <Button
                key="view"
                type="text"
                size="small"
                icon={isVideo ? <PlayCircleOutlined /> : <EyeOutlined />}
                onClick={() => onViewFile(file)}
                title={isVideo ? "Xem video" : "Xem"}
              />,
              <Button
                key="download"
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => onDownloadFile(file)}
                title="Tải xuống"
              />,
              fileId ? (
                <Popconfirm
                  key="delete"
                  title="Xóa file này?"
                  onConfirm={() => onDeleteFile(fileId)}
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
                  key="delete-disabled"
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
  );
};

export default FileList;

