import React from 'react';
import { Input, Button, Upload, Divider, Typography } from 'antd';
import { 
  ExperimentOutlined, 
  BulbOutlined, 
  FileTextOutlined, 
  UploadOutlined, 
  FileOutlined, 
  PlayCircleOutlined 
} from '@ant-design/icons';
import OutlinePanel from './OutlinePanel';
import FileList from './FileList';
import SavedPlansList from './SavedPlansList';

const { Title, Text } = Typography;

const LessonPlanControlPanel = ({
  isLoading,
  activePlanId,
  document,
  outline,
  uploadedFiles,
  loadingFiles,
  pendingFiles,
  savedPlans,
  loadingPlans,
  onGenerateClick,
  onCreateBlank,
  onUploadFileForEdit,
  onUploadFileAttachment,
  onUploadVideo,
  onNavigate,
  onInsertVideo,
  onViewFile,
  onDownloadFile,
  onDeleteFile,
  onPlanClick
}) => {
  return (
    <div className="control-panel-alt chemistry-control-panel">
      <div className="chemistry-molecules"></div>
      
      {/* Phần Tạo mới */}
      <Title level={5} className="panel-title-alt chemistry-title">
        <ExperimentOutlined /> Tạo giáo án mới
      </Title>
      <Input.TextArea rows={4} placeholder="Yêu cầu AI soạn giáo án bài..." />
      <Button 
        type="primary" 
        className="alt-button chemistry-button" 
        icon={<BulbOutlined />} 
        loading={isLoading && !activePlanId} 
        onClick={onGenerateClick} 
        block
      >
        Bắt đầu tạo với AI
      </Button>
      <Button 
        icon={<FileTextOutlined />} 
        onClick={onCreateBlank} 
        block 
        style={{ marginTop: '8px' }}
      >
        Tạo trang word trống
      </Button>
      <Upload 
        beforeUpload={onUploadFileForEdit} 
        showUploadList={false}
        accept=".txt,.doc,.docx,.pdf,.rtf"
      >
        <Button icon={<UploadOutlined />} block style={{ marginTop: '8px' }}>
          Tải lên file để chỉnh sửa
        </Button>
      </Upload>
      <Upload beforeUpload={onUploadFileAttachment} showUploadList={false}>
        <Button icon={<FileOutlined />} block style={{ marginTop: '8px' }}>
          Đính kèm file
        </Button>
      </Upload>
      <Upload beforeUpload={onUploadVideo} showUploadList={false} accept="video/*">
        <Button icon={<PlayCircleOutlined />} block style={{ marginTop: '8px' }}>
          Đính kèm video
        </Button>
      </Upload>
      
      <Divider />
      
      {/* Mục lục */}
      <OutlinePanel outline={outline} onNavigate={onNavigate} />
      
      <Divider />
      
      {/* Files đã upload */}
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
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            marginBottom: '16px', 
            border: '1px solid #f0f0f0', 
            borderRadius: '4px', 
            padding: '8px' 
          }}>
            <FileList
              files={uploadedFiles}
              loading={loadingFiles}
              pendingFiles={pendingFiles}
              document={document}
              onInsertVideo={onInsertVideo}
              onViewFile={onViewFile}
              onDownloadFile={onDownloadFile}
              onDeleteFile={onDeleteFile}
            />
          </div>
          <Divider />
        </>
      )}
      
      {/* Thư viện Giáo án */}
      <SavedPlansList
        plans={savedPlans}
        loading={loadingPlans}
        activePlanId={activePlanId}
        onPlanClick={onPlanClick}
      />
    </div>
  );
};

export default LessonPlanControlPanel;

