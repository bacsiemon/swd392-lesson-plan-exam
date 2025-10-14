import React from 'react';
import { Card, Row, Col, Select, Input, Button } from 'antd';
import { SearchOutlined, FilterOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserFilters = ({ filters, onFilterChange, onResetFilters }) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col span={6}>
          <Select
            placeholder="Lọc theo vai trò"
            allowClear
            style={{ width: '100%' }}
            value={filters.role}
            onChange={(value) => onFilterChange('role', value)}
          >
            <Option value="teacher">
              <BookOutlined style={{ marginRight: 8 }} />
              Giáo viên
            </Option>
            <Option value="student">
              <TeamOutlined style={{ marginRight: 8 }} />
              Học sinh
            </Option>
          </Select>
        </Col>
        <Col span={16}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            prefix={<SearchOutlined />}
            allowClear
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </Col>
        <Col span={2}>
          <Button
            icon={<FilterOutlined />}
            onClick={onResetFilters}
            title="Xóa bộ lọc"
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default UserFilters;
