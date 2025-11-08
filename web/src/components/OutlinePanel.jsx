import React from 'react';
import { Typography } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const OutlinePanel = ({ outline, onNavigate }) => {
  return (
    <div className="outline-panel chemistry-panel">
      <Title level={5} className="panel-title-alt chemistry-title">
        <MenuOutlined /> Mục lục
      </Title>
      {outline.length === 0 ? (
        <Text type="secondary">Chưa có tiêu đề nào.</Text>
      ) : (
        <div className="outline-list">
          {outline.map((item, index) => (
            <a 
              key={index} 
              onClick={() => onNavigate(item.element)} 
              className={`outline-item level-${item.level}`}
            >
              {item.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutlinePanel;

