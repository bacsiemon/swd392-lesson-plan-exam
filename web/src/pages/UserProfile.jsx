import React, { useState, useEffect } from 'react';
import { Card, Divider, Skeleton, Form, message, Alert } from 'antd';
import accountService from '../services/accountService';
import '../styles/chemistryTheme.css';
import '../styles/TeacherProfile.css';
import ProfileHeaderCard from '../components/ProfileHeaderCard';
import ProfileHeaderSection from '../components/ProfileHeaderSection';
import ProfileDetailsSection from '../components/ProfileDetailsSection';
import EditProfileModal from '../components/EditProfileModal';
import PasswordChangeModal from '../components/PasswordChangeModal';

// Universal Profile component for both students and teachers
const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [uploading] = useState(false);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordMethod, setPasswordMethod] = useState('change'); // 'change' or 'forgot'
    const [changePasswordForm] = Form.useForm();
    const [forgotPasswordForm] = Form.useForm();
    const [resetPasswordForm] = Form.useForm();
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

    // Load profile from API
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await accountService.getProfile();
                console.log('Profile result:', result);
                
                if (result.success && result.data) {
                    // Map API response to component format
                    // Backend AccountResponse: { Id, Email, FullName, Phone, DateOfBirth, AvatarUrl, Role, IsActive, EmailVerified }
                    const profileData = result.data;
                    console.log('Profile data:', profileData);
                    
                    setProfile({
                        avatar_url: profileData.AvatarUrl || profileData.avatarUrl || profileData.avatar_url || null,
                        full_name: profileData.FullName || profileData.fullName || profileData.full_name || profileData.Name || profileData.name || '',
                        email: profileData.Email || profileData.email || '',
                        phone: profileData.Phone || profileData.phone || '',
                        date_of_birth: profileData.DateOfBirth || profileData.dateOfBirth || profileData.date_of_birth || null,
                        school_name: profileData.SchoolName || profileData.schoolName || profileData.school_name || '',
                        bio: profileData.Bio || profileData.bio || profileData.biography || '',
                        role: profileData.Role !== undefined ? profileData.Role : (profileData.role !== undefined ? profileData.role : (profileData.roleEnum !== undefined ? profileData.roleEnum : null)),
                        // Store raw data for update
                        rawData: profileData
                    });
                } else {
                    const errorMsg = result.message || 'Không thể tải thông tin profile';
                    setError(errorMsg);
                    message.error(errorMsg);
                    console.error('Profile loading failed:', result);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('Có lỗi xảy ra khi tải thông tin profile');
                message.error('Có lỗi xảy ra khi tải thông tin profile');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleAvatarChange = (info) => {
        console.log('Avatar upload:', info);
    };

    const handleEdit = () => {
        form.setFieldsValue({
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone,
            date_of_birth: profile.date_of_birth,
            school_name: profile.school_name,
            bio: profile.bio
        });
        setEditing(true);
    };

    const handleSave = async (values) => {
        try {
            // TODO: Implement update profile API call when available
            setProfile({ ...profile, ...values });
            setEditing(false);
            message.success('Cập nhật profile thành công (chưa lưu lên server)');
        } catch (err) {
            console.error('Error saving profile:', err);
            message.error('Có lỗi xảy ra khi lưu profile');
        }
    };

    const handlePasswordModalOpen = () => {
        setPasswordMethod('change');
        setPasswordModalVisible(true);
        setForgotPasswordSent(false);
        changePasswordForm.resetFields();
        forgotPasswordForm.resetFields();
        resetPasswordForm.resetFields();
    };

    const handlePasswordModalClose = () => {
        setPasswordModalVisible(false);
        setForgotPasswordSent(false);
        setPasswordMethod('change');
        changePasswordForm.resetFields();
        forgotPasswordForm.resetFields();
        resetPasswordForm.resetFields();
    };

    if (loading && !profile) {
        return (
            <div className="teacher-profile-container chemistry-page">
                <div className="chemistry-molecules-bg"></div>
                <ProfileHeaderCard />
                <Card className="profile-card">
                    <Skeleton avatar active paragraph={{ rows: 6 }} />
                </Card>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="teacher-profile-container chemistry-page">
                <div className="chemistry-molecules-bg"></div>
                <ProfileHeaderCard />
                <Card className="profile-card chemistry-card">
                    <Alert message="Lỗi" description={error} type="error" showIcon />
                </Card>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="teacher-profile-container chemistry-page">
            <div className="chemistry-molecules-bg"></div>
            <ProfileHeaderCard />

            <Card className="profile-card chemistry-card" loading={loading}>
                <ProfileHeaderSection
                    profile={profile}
                    uploading={uploading}
                    onEdit={handleEdit}
                    onChangePassword={handlePasswordModalOpen}
                    onAvatarChange={handleAvatarChange}
                />
                <Divider />
                <ProfileDetailsSection profile={profile} />
            </Card>

            <EditProfileModal
                open={editing}
                form={form}
                profile={profile}
                onCancel={() => setEditing(false)}
                onSave={handleSave}
            />

            <PasswordChangeModal
                open={passwordModalVisible}
                profile={profile}
                passwordMethod={passwordMethod}
                passwordLoading={passwordLoading}
                forgotPasswordSent={forgotPasswordSent}
                changePasswordForm={changePasswordForm}
                forgotPasswordForm={forgotPasswordForm}
                resetPasswordForm={resetPasswordForm}
                onCancel={handlePasswordModalClose}
                onMethodChange={setPasswordMethod}
                onForgotPasswordSentChange={setForgotPasswordSent}
                onPasswordLoadingChange={setPasswordLoading}
            />
        </div>
    );
};

export default UserProfile;

