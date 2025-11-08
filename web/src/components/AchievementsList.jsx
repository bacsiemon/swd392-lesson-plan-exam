import React from 'react';
import { List, Avatar, Typography, Badge } from 'antd';
import { TrophyOutlined, StarOutlined } from '@ant-design/icons';

const { Text } = Typography;

const AchievementsList = ({ achievements }) => {
  return (
    <List
      dataSource={achievements}
      renderItem={(achievement) => (
        <List.Item
          style={{
            background: achievement.earned 
              ? '#f6ffed' 
              : '#fafafa',
            borderRadius: 12,
            marginBottom: 12,
            padding: '16px',
            border: achievement.earned 
              ? '1px solid #b7eb8f' 
              : '1px solid #e8e8e8',
            transition: 'all 0.3s ease',
            opacity: achievement.earned ? 1 : 0.7,
          }}
          onMouseEnter={(e) => {
            if (achievement.earned) {
              e.currentTarget.style.background = '#f0f9ff';
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(82, 196, 26, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (achievement.earned) {
              e.currentTarget.style.background = '#f6ffed';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <List.Item.Meta
            avatar={
              <div style={{ position: 'relative' }}>
                <Avatar
                  size={48}
                  style={{
                    backgroundColor: achievement.earned ? '#52c41a' : '#d9d9d9',
                    border: '2px solid #e8e8e8',
                    fontSize: '20px',
                  }}
                >
                  {achievement.icon}
                </Avatar>
                {achievement.earned && (
                  <Badge
                    count={<StarOutlined style={{ color: '#faad14' }} />}
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                  />
                )}
              </div>
            }
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text 
                  style={{ 
                    color: achievement.earned 
                      ? '#262626' 
                      : '#8c8c8c', 
                    fontWeight: 500,
                    fontSize: '16px'
                  }}
                >
                  {achievement.title}
                </Text>
                {achievement.earned && (
                  <TrophyOutlined style={{ color: '#faad14', fontSize: '16px' }} />
                )}
              </div>
            }
            description={
              <Text 
                style={{ 
                  color: achievement.earned 
                    ? '#595959' 
                    : '#bfbfbf',
                  fontSize: '14px'
                }}
              >
                {achievement.description}
              </Text>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default AchievementsList;
