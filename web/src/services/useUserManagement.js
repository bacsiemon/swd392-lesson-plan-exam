import { useState, useEffect } from 'react';
import { message } from 'antd';
import accountService from './accountService';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Load accounts from API
  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await accountService.getAllAccounts();
        if (result.success && result.data) {
          // Map API response to user format
          const teachers = (result.data.teachers || result.data.Teachers || []).map(account => ({
            id: account.id || account.Id,
            name: account.fullName || account.FullName || '',
            email: account.email || account.Email || '',
            phone: account.phone || account.Phone || '',
            role: 'teacher',
            roleEnum: account.role || account.Role || 1,
            isActive: account.isActive !== undefined ? account.isActive : (account.IsActive !== undefined ? account.IsActive : true),
            emailVerified: account.emailVerified !== undefined ? account.emailVerified : (account.EmailVerified !== undefined ? account.EmailVerified : false),
            createdAt: account.createdAt || account.CreatedAt || new Date().toISOString(),
            updatedAt: account.updatedAt || account.UpdatedAt
          }));

          const students = (result.data.students || result.data.Students || []).map(account => ({
            id: account.id || account.Id,
            name: account.fullName || account.FullName || '',
            email: account.email || account.Email || '',
            phone: account.phone || account.Phone || '',
            role: 'student',
            roleEnum: account.role || account.Role || 2,
            isActive: account.isActive !== undefined ? account.isActive : (account.IsActive !== undefined ? account.IsActive : true),
            emailVerified: account.emailVerified !== undefined ? account.emailVerified : (account.EmailVerified !== undefined ? account.EmailVerified : false),
            createdAt: account.createdAt || account.CreatedAt || new Date().toISOString(),
            updatedAt: account.updatedAt || account.UpdatedAt
          }));

          const allUsers = [...teachers, ...students];
          setUsers(allUsers);
          setFilteredUsers(allUsers);
        } else {
          setError(result.message || 'Không thể tải danh sách tài khoản');
          message.error(result.message || 'Không thể tải danh sách tài khoản');
        }
      } catch (err) {
        console.error('Error loading accounts:', err);
        setError('Có lỗi xảy ra khi tải danh sách tài khoản');
        message.error('Có lỗi xảy ra khi tải danh sách tài khoản');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

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
  const handleAddUser = async (values) => {
    try {
      // TODO: Implement add user API call when available
      // For now, just add to local state
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
    } catch (err) {
      console.error('Error adding user:', err);
      message.error('Có lỗi xảy ra khi thêm tài khoản');
    }
  };

  const handleEditUser = async (values) => {
    try {
      // TODO: Implement update user API call when available
      // For now, just update local state
      const updatedUsers = users.map(user =>
        user.id === currentUserToEdit.id ? { ...user, ...values } : user
      );
      setUsers(updatedUsers);
      applyFilters(updatedUsers, filters);
      setIsEditModalVisible(false);
      message.success('Đã cập nhật thông tin tài khoản!');
    } catch (err) {
      console.error('Error editing user:', err);
      message.error('Có lỗi xảy ra khi cập nhật tài khoản');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const result = await accountService.deleteAccount(userId);
      if (result.success) {
        const newUsers = users.filter(user => user.id !== userId);
        setUsers(newUsers);
        applyFilters(newUsers, filters);
        message.success(result.message || 'Đã xóa tài khoản thành công!');
        
        // Reload accounts to ensure data is up to date
        const reloadResult = await accountService.getAllAccounts();
        if (reloadResult.success && reloadResult.data) {
          const teachers = (reloadResult.data.teachers || reloadResult.data.Teachers || []).map(account => ({
            id: account.id || account.Id,
            name: account.fullName || account.FullName || '',
            email: account.email || account.Email || '',
            phone: account.phone || account.Phone || '',
            role: 'teacher',
            roleEnum: account.role || account.Role || 1,
            isActive: account.isActive !== undefined ? account.isActive : (account.IsActive !== undefined ? account.IsActive : true),
            emailVerified: account.emailVerified !== undefined ? account.emailVerified : (account.EmailVerified !== undefined ? account.EmailVerified : false),
            createdAt: account.createdAt || account.CreatedAt || new Date().toISOString(),
            updatedAt: account.updatedAt || account.UpdatedAt
          }));

          const students = (reloadResult.data.students || reloadResult.data.Students || []).map(account => ({
            id: account.id || account.Id,
            name: account.fullName || account.FullName || '',
            email: account.email || account.Email || '',
            phone: account.phone || account.Phone || '',
            role: 'student',
            roleEnum: account.role || account.Role || 2,
            isActive: account.isActive !== undefined ? account.isActive : (account.IsActive !== undefined ? account.IsActive : true),
            emailVerified: account.emailVerified !== undefined ? account.emailVerified : (account.EmailVerified !== undefined ? account.EmailVerified : false),
            createdAt: account.createdAt || account.CreatedAt || new Date().toISOString(),
            updatedAt: account.updatedAt || account.UpdatedAt
          }));

          const allUsers = [...teachers, ...students];
          setUsers(allUsers);
          applyFilters(allUsers, filters);
        }
      } else {
        message.error(result.message || 'Không thể xóa tài khoản');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      message.error('Có lỗi xảy ra khi xóa tài khoản');
    }
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
    loading,
    error,
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
