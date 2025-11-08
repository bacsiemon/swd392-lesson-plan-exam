import React from 'react';
import { Typography, Button } from 'antd';
import { SaveOutlined, PrinterOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title, Text } = Typography;

const quillModules = { 
  toolbar: [ 
    [{ 'header': [1, 2, 3, false] }], 
    ['bold', 'italic', 'underline'], 
    [{ 'color': [] }, { 'background': [] }], 
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['video', 'image', 'link']
  ] 
};

const LessonPlanEditor = ({ 
  document, 
  saveStatus, 
  editorRef,
  onTitleChange, 
  onContentChange, 
  onSave, 
  onPrint,
  metadataForm 
}) => {
  return (
    <>
      <div className="editor-header-alt chemistry-header">
        <Title 
          level={4} 
          editable={{ onChange: onTitleChange }} 
          className="document-title-alt"
        >
          {document.title}
        </Title>
        <div className="editor-actions-alt">
          <Text type="secondary" className={`save-status-alt ${saveStatus}`}>
            {saveStatus === 'saved' ? 'Đã lưu' : 'Chưa lưu'}
          </Text>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={onSave} 
            disabled={saveStatus !== 'unsaved'}
          >
            Lưu
          </Button>
          <Button icon={<PrinterOutlined />} onClick={onPrint}>
            In / Xuất PDF
          </Button>
        </div>
      </div>
      {metadataForm}
      <div className="canvas-container-alt chemistry-canvas">
        <ReactQuill 
          ref={editorRef} 
          theme="snow" 
          value={document.content} 
          onChange={onContentChange} 
          modules={quillModules} 
          className="quill-editor-alt" 
        />
      </div>
    </>
  );
};

export default LessonPlanEditor;

