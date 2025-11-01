import React, { useState, useEffect } from 'react';
import { Card, Tag, Space } from 'antd';
import ElementCard from '../components/ElementCard';
import ElementDetailModal from '../components/ElementDetailModal';
import { elementsBasicData, categoryColors } from '../constants/elementsBasicData';

const PeriodicTablePage = () => {
  // Add animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(30px, -50px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
      }
      @keyframes floatReverse {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(-30px, 50px) rotate(-120deg); }
        66% { transform: translate(20px, -20px) rotate(-240deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [selectedElement, setSelectedElement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleElementClick = (element) => {
    setSelectedElement(element);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Create a 2D grid for the periodic table
  const createPeriodicGrid = () => {
    const grid = [];
    
    // Initialize 10 periods (7 main + 2 for lanthanides/actinides with spacing)
    for (let i = 0; i < 10; i++) {
      grid[i] = new Array(18).fill(null);
    }
    
    // Place elements in the grid
    elementsBasicData.forEach((element) => {
      const row = element.period - 1;
      const col = element.group - 1;
      
      // Handle lanthanides and actinides (shown separately)
      if (element.category === 'lanthanide') {
        const lanthanideRow = 7; // Row 8 (index 7)
        const lanthanideCol = element.atomicNumber - 58 + 3; // Start from column 4
        if (lanthanideRow < grid.length && lanthanideCol < 18) {
          grid[lanthanideRow][lanthanideCol] = element;
        }
        return;
      }
      
      if (element.category === 'actinide') {
        const actinideRow = 8; // Row 9 (index 8)
        const actinideCol = element.atomicNumber - 90 + 3; // Start from column 4
        if (actinideRow < grid.length && actinideCol < 18) {
          grid[actinideRow][actinideCol] = element;
        }
        return;
      }
      
      // Place regular elements
      if (row < 7 && col >= 0 && col < 18) {
        grid[row][col] = element;
      }
    });
    
    return grid;
  };

  const grid = createPeriodicGrid();

  const categoryTranslations = {
    'nonmetal': 'Phi kim',
    'noble gas': 'Khí hiếm',
    'alkali metal': 'Kim loại kiềm',
    'alkaline earth metal': 'Kim loại kiềm thổ',
    'metalloid': 'Á kim',
    'halogen': 'Halogen',
    'transition metal': 'Kim loại chuyển tiếp',
    'post-transition metal': 'Kim loại sau chuyển tiếp',
    'lanthanide': 'Lanthanide',
    'actinide': 'Actinide',
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements for liquid glass effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-30%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        animation: 'floatReverse 15s ease-in-out infinite',
        zIndex: 0
      }} />

      <Card style={{ 
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
        }}>
          <h1 style={{ 
            margin: 0,
            color: '#fff',
            fontSize: '36px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            marginBottom: '8px'
          }}>
            🧪 Bảng Tuần Hoàn Các Nguyên Tố Hóa Học
          </h1>
          <p style={{ 
            margin: 0,
            color: '#fff',
            fontSize: '16px',
            opacity: 0.95,
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            Nhấp vào bất kỳ nguyên tố nào để xem thông tin chi tiết về lịch sử khám phá, tính chất, hợp chất và ứng dụng
          </p>
        </div>

        {/* Legend */}
        <div style={{ 
          marginBottom: '32px', 
          padding: '20px', 
          background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
          borderRadius: '12px',
          border: '2px solid #dee2e6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ 
            marginBottom: '16px',
            color: '#495057',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📊</span> Phân Loại Nguyên Tố
          </h3>
          <Space wrap size="middle">
            {Object.entries(categoryColors).map(([category, color]) => (
              <Tag
                key={category}
                color={color}
                style={{
                  border: '2px solid #333',
                  color: '#000',
                  fontWeight: '600',
                  padding: '6px 16px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s',
                  cursor: 'default'
                }}
              >
                {categoryTranslations[category] || category}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Periodic Table Grid */}
        <div style={{ overflowX: 'auto' }}>
          <div
            style={{
              display: 'inline-block',
              minWidth: '1400px',
              padding: '16px',
            }}
          >
            {grid.map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: rowIndex === 6 ? '24px' : '4px', // Extra space before lanthanides
                }}
              >
                {row.map((element, colIndex) => (
                  <div
                    key={colIndex}
                    style={{
                      width: '70px',
                      height: element ? '90px' : '90px',
                    }}
                  >
                    {element ? (
                      <ElementCard element={element} onClick={handleElementClick} />
                    ) : (
                      <div style={{ width: '70px', height: '90px' }} />
                    )}
                  </div>
                ))}
              </div>
            ))}
            
            {/* Labels for Lanthanides and Actinides */}
            <div style={{ 
              marginTop: '12px', 
              fontSize: '13px', 
              color: '#495057', 
              paddingLeft: '4px',
              fontWeight: '500'
            }}>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#CE93D8', fontWeight: 'bold' }}>*</span> Lanthanide (Hàng 8)
              </div>
              <div>
                <span style={{ color: '#F48FB1', fontWeight: 'bold' }}>**</span> Actinide (Hàng 9)
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRadius: '12px',
          border: '2px solid #90caf9',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
        }}>
          <h4 style={{ 
            color: '#1565c0',
            marginBottom: '12px',
            fontSize: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📚</span> Về Bảng Tuần Hoàn
          </h4>
          <p style={{ 
            margin: 0, 
            color: '#424242', 
            lineHeight: '1.8',
            fontSize: '15px',
            textAlign: 'justify'
          }}>
            Bảng tuần hoàn sắp xếp tất cả các nguyên tố hóa học đã biết theo số hiệu nguyên tử, cấu hình electron 
            và tính chất hóa học tuần hoàn. Các nguyên tố được sắp xếp theo thứ tự tăng dần số hiệu nguyên tử thành 
            các hàng gọi là "chu kỳ" và các cột gọi là "nhóm". Các nguyên tố có tính chất hóa học tương tự nhau 
            xuất hiện trong cùng một nhóm. Đây là công cụ quan trọng trong hóa học, giúp dự đoán hành vi của các 
            nguyên tố và hợp chất của chúng.
          </p>
        </div>
      </Card>

      {/* Element Detail Modal */}
      <ElementDetailModal
        element={selectedElement}
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PeriodicTablePage;
