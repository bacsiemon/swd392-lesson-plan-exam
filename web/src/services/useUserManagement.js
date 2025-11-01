import { useState } from 'react';
import { message } from 'antd';

// Mock data
const MOCK_USERS = [
  { id: 1, name: 'Trần Văn An', email: 'an.tv@example.com', role: 'teacher', createdAt: '2025-10-10' },
  { id: 2, name: 'Nguyễn Thị Bình', email: 'binh.nt@example.com', role: 'student', createdAt: '2025-10-11' },
  { id: 3, name: 'Lê Minh Cường', email: 'cuong.lm@example.com', role: 'student', createdAt: '2025-10-12' },
  { id: 4, name: 'Phạm Thùy Dung', email: 'dung.pt@example.com', role: 'teacher', createdAt: '2025-10-13' },
];

export const useUserManagement = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [filteredUsers, setFilteredUsers] = useState(MOCK_USERS);
  const [filters, setFilters] = useState({
    role: undefined,
    search: ''
  });
  
  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);

  // Apply filters to users
  const applyFilters = (userList, filterState) => {
    let filtered = userList;
    
    if (filterState.role) {
      filtered = filtered.filter(user => user.role === filterState.role);
    }
    
    if (filterState.search) {
      const searchValue = filterState.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchValue) || 
        user.email.toLowerCase().includes(searchValue)
      );
    }
    
    setFilteredUsers(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(users, newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      role: undefined,
      search: ''
    });
    setFilteredUsers(users);
  };

  // CRUD operations
  const handleAddUser = (values) => {
    const newUser = {
      id: Date.now(),
      ...values,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const newUsers = [newUser, ...users];
    setUsers(newUsers);
    applyFilters(newUsers, filters);
    setIsAddModalVisible(false);
    message.success('Đã thêm tài khoản mới thành công!');
  };

  const handleEditUser = (values) => {
    const updatedUsers = users.map(user =>
      user.id === currentUserToEdit.id ? { ...user, ...values } : user
    );
    setUsers(updatedUsers);
    applyFilters(updatedUsers, filters);
    setIsEditModalVisible(false);
    message.success('Đã cập nhật thông tin tài khoản!');
  };

  const handleDelete = (userId) => {
    const newUsers = users.filter(user => user.id !== userId);
    setUsers(newUsers);
    applyFilters(newUsers, filters);
    message.success('Đã xóa tài khoản thành công!');
  };

  const showEditModal = (user) => {
    setCurrentUserToEdit(user);
    setIsEditModalVisible(true);
  };

  // Statistics
  const totalUsers = users.length;
  const totalTeachers = users.filter(user => user.role === 'teacher').length;
  const totalStudents = users.filter(user => user.role === 'student').length;

  return {
    // State
    users,
    filteredUsers,
    filters,
    isAddModalVisible,
    isEditModalVisible,
    currentUserToEdit,
    
    // Statistics
    totalUsers,
    totalTeachers,
    totalStudents,
    
    // Actions
    handleFilterChange,
    resetFilters,
    handleAddUser,
    handleEditUser,
    handleDelete,
    showEditModal,
    setIsAddModalVisible,
    setIsEditModalVisible
  };
};
