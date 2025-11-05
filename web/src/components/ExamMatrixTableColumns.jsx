import React from 'react';
import { Button, Space, Tag, Tooltip, Typography, Popconfirm, Badge, Avatar } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import examMatrixService from '../services/examMatrixService';
import { message } from 'antd';

const { Text } = Typography;

export const createExamMatrixColumns = ({
  currentTeacherId,
  currentUserName,
  onEdit,
  onDelete
}) => {
  const getStatusTag = (status) => {
    const statusMap = {
      active: { color: 'success', text: 'Đang sử dụng' },
      draft: { color: 'default', text: 'Bản nháp' },
      archived: { color: 'warning', text: 'Lưu trữ' }
    };
    
    const config = statusMap[status] || statusMap.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return [
    {
      title: 'Tên ma trận',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#1890ff' }}>{name || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.subject || 'N/A'} - {record.gradeLevel || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      width: 120,
      align: 'center',
      render: (count) => <Badge count={count || 0} showZero color="#52c41a" />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 130,
      render: (name, record) => {
        const recordTeacherId = record.TeacherId || record.teacherId;
        const isCurrentUser = recordTeacherId && currentTeacherId && recordTeacherId === currentTeacherId;
        
        let displayName = name;
        if (!displayName && isCurrentUser) {
          displayName = currentUserName || localStorage.getItem('user_name');
        }
        if (!displayName) {
          displayName = localStorage.getItem('user_name');
        }
        if (!displayName) {
          displayName = record.teacherEmail || record.TeacherEmail || 
                       (recordTeacherId ? `ID: ${recordTeacherId}` : 'N/A');
        }
        
        const avatarChar = displayName && displayName.length > 0 && displayName !== 'N/A' && !displayName.startsWith('ID:')
          ? displayName.charAt(displayName.length - 1).toUpperCase()
          : '?';
        
        return (
          <div style={{ textAlign: 'center' }}>
            <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
              {avatarChar}
            </Avatar>
            <br />
            <Text style={{ fontSize: '12px' }}>{displayName}</Text>
          </div>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date, record) => {
        const dateValue = date || 
                         record.CreatedAt || 
                         record.createdAt || 
                         record.CreatedDate || 
                         record.createdDate ||
                         record.DateCreated ||
                         record.dateCreated ||
                         record.CreatedTime ||
                         record.createdTime;
        
        if (!dateValue) {
          return <Text style={{ fontSize: '12px' }}>N/A</Text>;
        }
        
        try {
          const dateObj = new Date(dateValue);
          
          if (isNaN(dateObj.getTime())) {
            return <Text style={{ fontSize: '12px' }}>{dateValue}</Text>;
          }
          
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = dateObj.getFullYear();
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          
          const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
          
          return (
            <Text style={{ fontSize: '12px' }}>
              {formattedDate}
            </Text>
          );
        } catch (error) {
          console.error('Error formatting date:', error);
          return <Text style={{ fontSize: '12px' }}>{dateValue}</Text>;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={async () => {
                try {
                  const result = await examMatrixService.getExamMatrixById(record.id);
                  if (result.success) {
                    message.info('Xem chi tiết ma trận đề');
                    console.log('Exam matrix details:', result.data);
                  } else {
                    message.error(result.message || 'Không thể lấy thông tin chi tiết');
                  }
                } catch (error) {
                  console.error('Error getting exam matrix details:', error);
                  message.error('Có lỗi xảy ra khi lấy thông tin chi tiết');
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa ma trận này?"
              onConfirm={() => onDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
};
