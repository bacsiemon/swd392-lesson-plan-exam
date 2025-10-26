import React from 'react';
import { Modal, Tabs, Descriptions, Tag, List } from 'antd';
import { categoryColors } from '../constants/elementsBasicData';
import { detailedElementsData } from '../constants/elementsDetailedData';

const { TabPane } = Tabs;

const ElementDetailModal = ({ element, visible, onClose }) => {
  if (!element) return null;
  
  const detailedData = detailedElementsData[element.atomicNumber];
  const bgColor = categoryColors[element.category] || '#E0E0E0';
  
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
  
  // If no detailed data available, show basic info only
  if (!detailedData) {
    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
                border: '3px solid #2c3e50',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2c3e50' }}>{element.atomicNumber}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>{element.symbol}</div>
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#1890ff' }}>{element.name}</h2>
              <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px', marginTop: '4px' }}>
                {categoryTranslations[element.category] || element.category}
              </Tag>
            </div>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
          Thông tin chi tiết cho nguyên tố này chưa có sẵn.
        </p>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Số hiệu nguyên tử">{element.atomicNumber}</Descriptions.Item>
          <Descriptions.Item label="Ký hiệu">{element.symbol}</Descriptions.Item>
          <Descriptions.Item label="Phân loại">{categoryTranslations[element.category] || element.category}</Descriptions.Item>
          <Descriptions.Item label="Nhóm">{element.group}</Descriptions.Item>
          <Descriptions.Item label="Chu kỳ">{element.period}</Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  }
  
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
              border: '3px solid #2c3e50',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2c3e50' }}>{element.atomicNumber}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>{element.symbol}</div>
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#1890ff', fontSize: '24px' }}>{element.name}</h2>
            <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px', marginTop: '4px' }}>
              {categoryTranslations[element.category] || element.category}
            </Tag>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      style={{ top: 20 }}
    >
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="📋 Thông Tin Cơ Bản" key="1">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Số hiệu nguyên tử">{element.atomicNumber}</Descriptions.Item>
            <Descriptions.Item label="Ký hiệu hóa học">{element.symbol}</Descriptions.Item>
            <Descriptions.Item label="Khối lượng nguyên tử">{detailedData.atomicMass}</Descriptions.Item>
            <Descriptions.Item label="Phân loại">{categoryTranslations[element.category] || element.category}</Descriptions.Item>
            <Descriptions.Item label="Nhóm">{element.group}</Descriptions.Item>
            <Descriptions.Item label="Chu kỳ">{element.period}</Descriptions.Item>
            <Descriptions.Item label="Phân lớp" span={2}>{element.block}</Descriptions.Item>
            <Descriptions.Item label="Cấu hình electron" span={2}>
              {detailedData.electronConfiguration}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
        
        <TabPane tab="📜 Lịch Sử Khám Phá" key="2">
          <div style={{ padding: '16px 0' }}>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="Năm khám phá">{detailedData.discoveryYear}</Descriptions.Item>
              <Descriptions.Item label="Người khám phá">{detailedData.discoveredBy}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>Lịch Sử Khám Phá</h4>
            <p style={{ textAlign: 'justify', lineHeight: '1.8', padding: '12px', background: '#f0f5ff', borderRadius: '8px' }}>
              {detailedData.discoveryHistory}
            </p>
          </div>
        </TabPane>
        
        <TabPane tab="⚛️ Tính Chất Vật Lý" key="3">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Nhiệt độ nóng chảy">
              {detailedData.physicalProperties.meltingPoint}
            </Descriptions.Item>
            <Descriptions.Item label="Nhiệt độ sôi">
              {detailedData.physicalProperties.boilingPoint}
            </Descriptions.Item>
            <Descriptions.Item label="Khối lượng riêng">
              {detailedData.physicalProperties.density}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái ở nhiệt độ phòng">
              {detailedData.physicalProperties.state}
            </Descriptions.Item>
            <Descriptions.Item label="Bán kính nguyên tử">
              {detailedData.physicalProperties.atomicRadius}
            </Descriptions.Item>
            <Descriptions.Item label="Hình dạng bên ngoài" span={1}>
              {detailedData.physicalProperties.appearance}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
        
        <TabPane tab="🧬 Tính Chất Hóa Học" key="4">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Độ âm điện">
              {detailedData.chemicalProperties.electronegativity}
            </Descriptions.Item>
            <Descriptions.Item label="Năng lượng ion hóa">
              {detailedData.chemicalProperties.ionizationEnergy}
            </Descriptions.Item>
            <Descriptions.Item label="Số oxi hóa">
              {detailedData.chemicalProperties.oxidationStates}
            </Descriptions.Item>
            <Descriptions.Item label="Hóa trị">
              {detailedData.chemicalProperties.valence}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
        
        <TabPane tab="🧪 Hợp Chất & Ứng Dụng" key="5">
          <div style={{ padding: '8px 0' }}>
            <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>Hợp Chất Phổ Biến</h4>
            <List
              size="small"
              bordered
              dataSource={detailedData.commonCompounds}
              renderItem={(item) => <List.Item style={{ padding: '12px' }}>{item}</List.Item>}
              style={{ marginBottom: '24px', borderRadius: '8px' }}
            />
            
            <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>Ứng Dụng Thực Tiễn</h4>
            <List
              size="small"
              bordered
              dataSource={detailedData.applications}
              renderItem={(item) => <List.Item style={{ padding: '12px' }}>{item}</List.Item>}
              style={{ borderRadius: '8px' }}
            />
          </div>
        </TabPane>
        
        <TabPane tab="🌱 Vai Trò & Sự Thật Thú Vị" key="6">
          <div style={{ padding: '16px 0' }}>
            <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>Vai Trò Sinh Học</h4>
            <p style={{ 
              textAlign: 'justify', 
              lineHeight: '1.8', 
              padding: '16px', 
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '12px',
              border: '2px solid #bae6fd',
              fontSize: '15px'
            }}>
              {detailedData.biologicalRole}
            </p>
            
            <h4 style={{ marginTop: '24px', color: '#1890ff', marginBottom: '12px' }}>Sự Thật Thú Vị</h4>
            <List
              size="small"
              bordered
              dataSource={detailedData.interestingFacts}
              renderItem={(item, index) => (
                <List.Item style={{ padding: '12px', fontSize: '14px' }}>
                  <span style={{ fontWeight: 'bold', marginRight: '8px', fontSize: '18px' }}>🔬</span>
                  {item}
                </List.Item>
              )}
              style={{ borderRadius: '8px' }}
            />
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ElementDetailModal;
