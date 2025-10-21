// useTeacherProfile.js - Custom hook cho teacher profile management
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import teacherProfileService from '../services/teacherProfileService';

export const useTeacherProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    // Load profile data
    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await teacherProfileService.getProfile();

            if (result.success) {
                setProfile(result.data);
            } else {
                setError(result.message);
                message.error(result.message);
            }
        } catch (err) {
            const errorMessage = 'Có lỗi xảy ra khi tải hồ sơ';
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load teaching statistics
    const loadStats = useCallback(async () => {
        try {
            const result = await teacherProfileService.getTeachingStats();

            if (result.success) {
                setStats(result.data);
            } else {
                console.warn('Failed to load stats:', result.message);
            }
        } catch (err) {
            console.warn('Error loading stats:', err.message);
        }
    }, []);

    // Update profile
    const updateProfile = useCallback(async (profileData) => {
        setLoading(true);
        setError(null);

        try {
            // Validate data before sending
            const validation = teacherProfileService.validateProfile(profileData);

            if (!validation.isValid) {
                const errorMessage = Object.values(validation.errors)[0];
                message.error(errorMessage);
                setLoading(false);
                return false;
            }

            const result = await teacherProfileService.updateProfile(profileData);

            if (result.success) {
                setProfile(result.data);
                setEditing(false);
                message.success('Cập nhật hồ sơ thành công!');
                return true;
            } else {
                setError(result.message);
                message.error(result.message);
                return false;
            }
        } catch (err) {
            const errorMessage = 'Có lỗi xảy ra khi cập nhật hồ sơ';
            setError(errorMessage);
            message.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Upload avatar
    const uploadAvatar = useCallback(async (file) => {
        setUploading(true);
        setError(null);

        try {
            // Validate file
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Vui lòng chọn file hình ảnh!');
                setUploading(false);
                return false;
            }

            const isLessThan5MB = file.size / 1024 / 1024 < 5;
            if (!isLessThan5MB) {
                message.error('Kích thước file phải nhỏ hơn 5MB!');
                setUploading(false);
                return false;
            }

            const result = await teacherProfileService.uploadAvatar(file);

            if (result.success) {
                setProfile(prev => ({
                    ...prev,
                    avatar_url: result.data.avatar_url
                }));
                message.success('Cập nhật ảnh đại diện thành công!');
                return true;
            } else {
                setError(result.message);
                message.error(result.message);
                return false;
            }
        } catch (err) {
            const errorMessage = 'Có lỗi xảy ra khi tải ảnh lên';
            setError(errorMessage);
            message.error(errorMessage);
            return false;
        } finally {
            setUploading(false);
        }
    }, []);

    // Start editing mode
    const startEditing = useCallback(() => {
        setEditing(true);
        setError(null);
    }, []);

    // Cancel editing mode
    const cancelEditing = useCallback(() => {
        setEditing(false);
        setError(null);
    }, []);

    // Refresh profile data
    const refreshProfile = useCallback(() => {
        loadProfile();
        loadStats();
    }, [loadProfile, loadStats]);

    // Get formatted profile data for display
    const getFormattedProfile = useCallback(() => {
        if (!profile) return null;

        return {
            ...profile,
            formatted_date_of_birth: teacherProfileService.formatDate(profile.date_of_birth),
            age: teacherProfileService.calculateAge(profile.date_of_birth),
            formatted_created_at: teacherProfileService.formatDate(profile.created_at),
            formatted_updated_at: teacherProfileService.formatDate(profile.updated_at)
        };
    }, [profile]);

    // Load initial data on mount
    useEffect(() => {
        loadProfile();
        loadStats();
    }, [loadProfile, loadStats]);

    return {
        // State
        profile,
        formattedProfile: getFormattedProfile(),
        loading,
        editing,
        uploading,
        stats,
        error,

        // Actions
        updateProfile,
        uploadAvatar,
        startEditing,
        cancelEditing,
        refreshProfile,
        loadProfile,
        loadStats,

        // Helper functions
        formatDate: teacherProfileService.formatDate,
        calculateAge: teacherProfileService.calculateAge,
        validateProfile: teacherProfileService.validateProfile
    };
};