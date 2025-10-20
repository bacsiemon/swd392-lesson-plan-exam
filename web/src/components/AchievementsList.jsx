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
              ? 'rgba(82, 196, 26, 0.1)' 
              : 'rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            marginBottom: 12,
            padding: '16px',
            border: achievement.earned 
              ? '1px solid rgba(82, 196, 26, 0.3)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            opacity: achievement.earned ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (achievement.earned) {
              e.currentTarget.style.background = 'rgba(82, 196, 26, 0.2)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }
          }}
          onMouseLeave={(e) => {
            if (achievement.earned) {
              e.currentTarget.style.background = 'rgba(82, 196, 26, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
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
                    border: '2px solid rgba(255, 255, 255, 0.2)',
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
                      ? 'rgba(255, 255, 255, 0.95)' 
                      : 'rgba(255, 255, 255, 0.6)', 
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
                    ? 'rgba(255, 255, 255, 0.8)' 
                    : 'rgba(255, 255, 255, 0.5)',
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
