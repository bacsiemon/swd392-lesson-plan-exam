import React, { useState } from 'react';
import { Row, Col, Card, Input, Button, Typography, Spin, Empty, Popconfirm, message, Divider } from 'antd';
import { PlusOutlined, FolderOpenOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateSlidePage.css';

const { Title, Paragraph, Text } = Typography;

// --- DỮ LIỆU GIẢ LẬP ---
const MOCK_SAVED_DECKS = [
    { id: 'deck_01', title: 'Bài giảng về Axit và Bazơ', createdAt: '3 ngày trước', slides: [ { id: 1, title: 'Axit và Bazơ là gì?', content: '<h2>Thuyết Brønsted-Lowry</h2><p>Axit là chất <strong>cho</strong> proton (H⁺), Bazơ là chất <strong>nhận</strong> proton.</p><p>Ví dụ: HCl (axit) và NH₃ (bazơ).</p>' }, { id: 2, title: 'Thang đo pH', content: '<ul><li>pH &lt; 7: Môi trường axit.</li><li style="color: green;">pH = 7: Môi trường trung tính.</li><li>pH &gt; 7: Môi trường bazơ.</li></ul>' }, ] },
];

// --- THANH CÔNG CỤ TÙY CHỈNH ---
const CustomToolbar = () => (
    <div id="quill-toolbar">
      <span className="ql-formats">
        <select className="ql-header" defaultValue="">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="">Normal</option>
        </select>
        <select className="ql-font"></select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <button className="ql-underline"></button>
      </span>
      <span className="ql-formats">
        <select className="ql-color"></select>
        <select className="ql-background"></select>
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered"></button>
        <button className="ql-list" value="bullet"></button>
      </span>
    </div>
);


const quillModules = {
  toolbar: {
    container: '#quill-toolbar',
  },
};

const CreateSlidePage = () => {
  const [slides, setSlides] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState(null);
  const handleContentChange = (content) => { if (!slides) return; const newSlides = [...slides]; newSlides[currentIndex].content = content; setSlides(newSlides); };
  const handleTitleChange = (newTitle) => { if (!slides || !newTitle) return; const newSlides = [...slides]; newSlides[currentIndex].title = newTitle; setSlides(newSlides); };
  const handleAddSlide = () => { const newSlide = { id: Date.now(), title: 'Slide mới', content: '<p>Nội dung...</p>' }; const updatedSlides = slides ? [...slides, newSlide] : [newSlide]; setSlides(updatedSlides); setCurrentIndex(updatedSlides.length - 1); message.success('Đã thêm slide mới!'); };
  const handleDeleteSlide = (indexToDelete) => { const newSlides = slides.filter((_, index) => index !== indexToDelete); if (newSlides.length === 0) { setSlides(null); setActiveDeckId(null); } else { setSlides(newSlides); if (currentIndex >= indexToDelete && currentIndex > 0) { setCurrentIndex(currentIndex - 1); } else { setCurrentIndex(0); } } };
  const handleLoadSavedDeck = (deck) => { setIsLoading(true); setTimeout(() => { setSlides(deck.slides); setCurrentIndex(0); setActiveDeckId(deck.id); setIsLoading(false); message.info(`Đã mở "${deck.title}".`); }, 500); };
  const handleGenerateClick = () => { setIsLoading(true); setSlides(null); setActiveDeckId(null); setTimeout(() => { setSlides([{ id: Date.now(), title: 'Tiêu đề Slide Mới', content: '<h1>Nội dung Mới</h1><p>Bắt đầu chỉnh sửa tại đây...</p>' }]); setCurrentIndex(0); setIsLoading(false); message.success('Đã tạo bài giảng mới!'); }, 1500); };
  const currentSlide = slides ? slides[currentIndex] : null;

  return (
    <div className="create-slide-page-minimal">
      <Row gutter={[24, 24]}>
        {/* === CỘT ĐIỀU KHIỂN BÊN TRÁI === */}
        <Col xs={24} lg={7}>
          <div className="control-panel-minimal">
            <Title level={5} className="panel-title"><PlusOutlined /> Khơi nguồn Sáng tạo</Title>
            <Input.TextArea rows={3} placeholder="Ví dụ: Bảng tuần hoàn..." />
            <Button type="primary" className="minimal-button" icon={<PlusOutlined />} loading={isLoading && !activeDeckId} onClick={handleGenerateClick} block>
              Tạo bài giảng mới
            </Button>
            <Divider />
            <Title level={5} className="panel-title"><FolderOpenOutlined /> Thư viện Bài giảng</Title>
            <div className="saved-decks-list-minimal">
              {MOCK_SAVED_DECKS.map(deck => (
                <div key={deck.id} className={`saved-deck-item-minimal ${deck.id === activeDeckId ? 'active' : ''}`} onClick={() => handleLoadSavedDeck(deck)}>
                  <Text strong ellipsis>{deck.title}</Text>
                  <Text type="secondary">{deck.createdAt}</Text>
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* === WORKSPACE BÊN PHẢI === */}
        <Col xs={24} lg={17}>
          <div className="workspace-container">
            {/* Dàn bài (Navigator) */}
            <div className="slide-navigator-minimal">
              <div className="navigator-list">
                {slides && slides.map((slide, index) => (
                  <div key={slide.id} className={`thumbnail-item-minimal ${index === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(index)}>
                    <div className="thumbnail-number">{index + 1}</div>
                    <div className="thumbnail-preview">
                        <div dangerouslySetInnerHTML={{ __html: slide.content }} />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="dashed" icon={<PlusOutlined />} block onClick={handleAddSlide}>Thêm slide</Button>
            </div>
            {/* Khu vực Soạn thảo */}
            <div className="editor-workspace-minimal">
              {isLoading && (<div className="center-content-minimal"><Spin /></div>)}
              {!isLoading && !slides && (
                <div className="center-content-minimal">
                  <Empty description={<Paragraph type="secondary">Không gian sáng tạo của bạn</Paragraph>} />
                </div>
              )}
              {!isLoading && slides && currentSlide && (
                <>
                  <CustomToolbar />
                  <div className="canvas-container">
                    <div className="slide-canvas">
                      <ReactQuill theme="snow" value={currentSlide.content} onChange={handleContentChange} modules={quillModules} className="quill-editor-on-canvas" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreateSlidePage;