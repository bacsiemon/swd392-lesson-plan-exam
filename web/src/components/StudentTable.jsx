import React from 'react';
import { Table, Space, Avatar, Progress, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getScoreColor, getProgressColor, getStatusTag } from '../utils/classManagementUtils';

const StudentTable = ({ students }) => {
  const studentColumns = [
    {
      title: 'Học sinh',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>
              {record.name}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {record.studentId}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tiến độ học tập',
      key: 'progress',
      render: (_, record) => (
        <div style={{ minWidth: 120 }}>
          <Progress
            percent={record.studyProgress}
            size="small"
            strokeColor={getProgressColor(record.studyProgress)}
            format={() => `${record.completedLessons}/${record.totalLessons}`}
          />
        </div>
      ),
    },
    {
      title: 'Điểm TB',
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score) => (
        <span style={{ 
          color: getScoreColor(score), 
          fontWeight: 600,
          fontSize: '16px'
        }}>
          {score}
        </span>
      ),
      sorter: (a, b) => a.averageScore - b.averageScore,
    },
    {
      title: 'Bài kiểm tra',
      key: 'tests',
      render: (_, record) => (
        <span>
          {record.completedTests}/{record.totalTests}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = getStatusTag(status);
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Hoạt động cuối',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (date) => (
        <span style={{ fontSize: '12px' }}>
          {new Date(date).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={studentColumns}
      dataSource={students}
      rowKey="id"
      pagination={{ 
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} của ${total} học sinh`
      }}
      size="middle"
    />
  );
};

export default StudentTable;
