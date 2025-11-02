import React from 'react';
import { Card, Modal, Spin, Alert } from 'antd';
import { useUserManagement } from '../services/useUserManagement';
import UserManagementHeader from '../components/UserManagementHeader';
import UserStats from '../components/UserStats';
import UserFilters from '../components/UserFilters';
import UserTable from '../components/UserTable';
import AddUserModal from '../components/AddUserModals'; 
import EditUserModal from '../components/EditUserModals';
import '../styles/adminTheme.css';

const AdminUserManagement = () => {
  const {
    // State
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
  } = useUserManagement();

  return (
    <div className="admin-page" style={{ position: 'relative' }}>
      {/* Admin background decoration */}
      <div className="admin-alert-bg"></div>
      {/* Header */}
      <UserManagementHeader onAddUser={() => setIsAddModalVisible(true)} />

      {/* Statistics */}
      <UserStats 
        totalUsers={totalUsers}
        totalTeachers={totalTeachers}
        totalStudents={totalStudents}
      />

      {/* Filters */}
      <UserFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />

      {/* Table */}
      <Card className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" tip="Đang tải danh sách tài khoản..." />
          </div>
        ) : error ? (
          <Alert
            message="Lỗi tải dữ liệu"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <div className="admin-table">
            <UserTable
              users={filteredUsers}
              filters={filters}
              onEdit={showEditModal}
              onDelete={handleDelete}
              onAddUser={() => setIsAddModalVisible(true)}
            />
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        title={null}
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
        className="admin-modal"
      >
        <AddUserModal
          visible={isAddModalVisible}
          onAdd={handleAddUser}
          onCancel={() => setIsAddModalVisible(false)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title={null}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
        className="admin-modal"
      >
        <EditUserModal
          visible={isEditModalVisible}
          user={currentUserToEdit}
          onEdit={handleEditUser}
          onCancel={() => setIsEditModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminUserManagement;

