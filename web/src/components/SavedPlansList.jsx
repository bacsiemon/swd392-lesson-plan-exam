import React from 'react';
import { Typography, Spin } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SavedPlansList = ({ plans, loading, activePlanId, onPlanClick }) => {
  return (
    <>
      <Title level={5} className="panel-title-alt chemistry-title">
        <FolderOpenOutlined /> Thư viện Giáo án
      </Title>
      <div className="saved-docs-list-alt">
        {loading ? (
          <Spin size="small" tip="Đang tải..." />
        ) : plans.length === 0 ? (
          <Text type="secondary">Chưa có giáo án nào</Text>
        ) : (
          plans.map(plan => (
            <div 
              key={plan.id || plan.Id} 
              className={`saved-doc-item-alt ${(plan.id || plan.Id) === activePlanId ? 'active' : ''}`} 
              onClick={() => onPlanClick(plan)}
            >
              <Text strong ellipsis>{plan.title || plan.Title || plan.name || plan.Name}</Text>
              <Text type="secondary">
                {plan.createdAt || plan.CreatedAt 
                  ? new Date(plan.createdAt || plan.CreatedAt).toLocaleDateString('vi-VN') 
                  : 'Không có ngày'}
              </Text>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default SavedPlansList;

