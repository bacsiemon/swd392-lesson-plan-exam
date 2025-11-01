// teacherProfileService.js - API service cho teacher profile
class TeacherProfileService {
    constructor() {
        this.baseURL = '/api/teacher'; // Base URL cho teacher API
    }

    // Mock data cho development
    mockProfile = {
        avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face",
        full_name: "Lê Thị Hương",
        email: "le.thi.huong@chemistry.edu.vn",
        phone: "+84 987 654 321",
        date_of_birth: "1985-06-15",
        school_name: "Trường THPT Chuyên Lê Hồng Phong",
        subject_specialization: "Hóa học",
        teaching_experience: "8 năm",
        education_level: "Thạc sĩ Hóa học",
        bio: "Giáo viên Hóa học với 8 năm kinh nghiệm giảng dạy. Chuyên môn về Hóa vô cơ và Hóa phân tích. Đam mê ứng dụng công nghệ AI trong giảng dạy để tạo ra những bài học sinh động và hiệu quả.",
        created_at: "2020-08-15",
        updated_at: "2024-10-20",
        status: "active"
    };

    // Simulate network delay
    delay(ms = 800) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get teacher profile
    async getProfile(teacherId = 'current') {
        await this.delay();

        try {
            // In production, replace with actual API call
            // const response = await fetch(`${this.baseURL}/profile/${teacherId}`);
            // const data = await response.json();

            // Mock response for development
            return {
                success: true,
                data: this.mockProfile,
                message: 'Profile loaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to load profile'
            };
        }
    }

    // Update teacher profile
    async updateProfile(profileData) {
        await this.delay(1200);

        try {
            // In production, replace with actual API call
            // const response = await fetch(`${this.baseURL}/profile`, {
            //   method: 'PUT',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'Authorization': `Bearer ${localStorage.getItem('token')}`
            //   },
            //   body: JSON.stringify(profileData)
            // });
            // const data = await response.json();

            // Mock successful update
            this.mockProfile = {
                ...this.mockProfile,
                ...profileData,
                updated_at: new Date().toISOString()
            };

            return {
                success: true,
                data: this.mockProfile,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update profile'
            };
        }
    }

    // Upload avatar
    async uploadAvatar(file) {
        await this.delay(1500);

        try {
            // In production, replace with actual API call
            // const formData = new FormData();
            // formData.append('avatar', file);
            // const response = await fetch(`${this.baseURL}/avatar`, {
            //   method: 'POST',
            //   headers: {
            //     'Authorization': `Bearer ${localStorage.getItem('token')}`
            //   },
            //   body: formData
            // });
            // const data = await response.json();

            // Mock successful upload
            const mockAvatarURL = URL.createObjectURL(file);
            this.mockProfile.avatar_url = mockAvatarURL;

            return {
                success: true,
                data: {
                    avatar_url: mockAvatarURL
                },
                message: 'Avatar uploaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to upload avatar'
            };
        }
    }

    // Get teaching statistics
    async getTeachingStats() {
        await this.delay(600);

        try {
            const mockStats = {
                total_lessons: 156,
                total_students: 342,
                total_courses: 8,
                average_rating: 4.8,
                completion_rate: 94,
                active_courses: 3
            };

            return {
                success: true,
                data: mockStats,
                message: 'Statistics loaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to load statistics'
            };
        }
    }

    // Validate profile data
    validateProfile(profileData) {
        const errors = {};

        if (!profileData.full_name || profileData.full_name.trim().length < 2) {
            errors.full_name = 'Họ tên phải có ít nhất 2 ký tự';
        }

        if (!profileData.email || !this.isValidEmail(profileData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (!profileData.phone || !this.isValidPhone(profileData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!profileData.date_of_birth) {
            errors.date_of_birth = 'Vui lòng nhập ngày sinh';
        }

        if (!profileData.school_name || profileData.school_name.trim().length < 3) {
            errors.school_name = 'Tên trường phải có ít nhất 3 ký tự';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Helper functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Format date for display
    formatDate(dateString, locale = 'vi-VN') {
        try {
            return new Date(dateString).toLocaleDateString(locale);
        } catch (error) {
            return dateString;
        }
    }

    // Calculate age from date of birth
    calculateAge(dateOfBirth) {
        try {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return age;
        } catch (error) {
            return null;
        }
    }
}

// Export singleton instance
const teacherProfileService = new TeacherProfileService();
export default teacherProfileService;