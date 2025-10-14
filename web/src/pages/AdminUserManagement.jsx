import React from 'react';
import { Card, Modal } from 'antd';
import { useUserManagement } from '../services/useUserManagement';
import UserManagementHeader from '../components/UserManagementHeader';
import UserStats from '../components/UserStats';
import UserFilters from '../components/UserFilters';
import UserTable from '../components/UserTable';
import AddUserModal from '../components/AddUserModals'; 
import EditUserModal from '../components/EditUserModals';

const AdminUserManagement = () => {
  const {
    // State
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
  } = useUserManagement();

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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
      <Card>
        <UserTable
          users={filteredUsers}
          filters={filters}
          onEdit={showEditModal}
          onDelete={handleDelete}
          onAddUser={() => setIsAddModalVisible(true)}
        />
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

