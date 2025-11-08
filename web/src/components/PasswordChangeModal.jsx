import React from 'react';
import { Modal, Form, Input, Tabs, Button, Space, Alert, message } from 'antd';
import { LockOutlined, KeyOutlined, MailOutlined } from '@ant-design/icons';
import accountService from '../services/accountService';

const { TabPane } = Tabs;
const { Password } = Input;

const PasswordChangeModal = ({
  open,
  profile,
  passwordMethod,
  passwordLoading,
  forgotPasswordSent,
  changePasswordForm,
  forgotPasswordForm,
  resetPasswordForm,
  onCancel,
  onMethodChange,
  onForgotPasswordSentChange,
  onPasswordLoadingChange
}) => {
  const handleChangePassword = async (values) => {
    onPasswordLoadingChange(true);
    try {
      const result = await accountService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      if (result.success) {
        message.success(result.message || 'Đổi mật khẩu thành công');
        onCancel();
        changePasswordForm.resetFields();
      } else {
        let errorMsg = result.message || 'Không thể đổi mật khẩu';
        if (result.message?.includes('INVALID_CURRENT_PASSWORD')) {
          errorMsg = 'Mật khẩu hiện tại không đúng';
        } else if (result.message?.includes('PASSWORD_NOT_STRONG_ENOUGH')) {
          errorMsg = 'Mật khẩu mới không đủ mạnh. Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
        }
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      onPasswordLoadingChange(false);
    }
  };

  const handleForgotPassword = async (values) => {
    onPasswordLoadingChange(true);
    try {
      const result = await accountService.forgotPassword(values.email);

      if (result.success) {
        message.success(result.message || 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
        onForgotPasswordSentChange(true);
        resetPasswordForm.setFieldsValue({ email: values.email });
      } else {
        let errorMsg = result.message || 'Không thể gửi email đặt lại mật khẩu';
        if (result.message?.includes('EMAIL_NOT_FOUND')) {
          errorMsg = 'Không tìm thấy tài khoản với email này';
        } else if (result.message?.includes('FAILED_TO_SEND_EMAIL')) {
          errorMsg = 'Không thể gửi email. Vui lòng thử lại sau.';
        }
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      message.error('Có lỗi xảy ra khi gửi email đặt lại mật khẩu');
    } finally {
      onPasswordLoadingChange(false);
    }
  };

  const handleResetPassword = async (values) => {
    onPasswordLoadingChange(true);
    try {
      const result = await accountService.resetPassword({
        email: values.email,
        resetToken: values.resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      if (result.success) {
        message.success(result.message || 'Đặt lại mật khẩu thành công');
        onCancel();
        onForgotPasswordSentChange(false);
        resetPasswordForm.resetFields();
      } else {
        let errorMsg = result.message || 'Không thể đặt lại mật khẩu';
        if (result.message?.includes('INVALID_TOKEN')) {
          errorMsg = 'Mã xác nhận không đúng hoặc đã hết hạn';
        } else if (result.message?.includes('PASSWORD_NOT_STRONG_ENOUGH')) {
          errorMsg = 'Mật khẩu mới không đủ mạnh. Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
        } else if (result.message?.includes('RESET_PASSWORD_FEATURE_NOT_IMPLEMENTED_YET')) {
          errorMsg = 'Tính năng đặt lại mật khẩu qua email chưa được triển khai đầy đủ ở backend';
        }
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      onPasswordLoadingChange(false);
    }
  };

  const passwordRules = [
    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/,
      message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
    }
  ];

  const confirmPasswordRules = [
    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('newPassword') === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
      },
    }),
  ];

  return (
    <Modal
      className="chemistry-modal"
      title={
        <div>
          <LockOutlined style={{ marginRight: 8 }} />
          Đổi mật khẩu
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Tabs
        activeKey={passwordMethod}
        onChange={(key) => {
          onMethodChange(key);
          onForgotPasswordSentChange(false);
          changePasswordForm.resetFields();
          forgotPasswordForm.resetFields();
          resetPasswordForm.resetFields();
        }}
      >
        <TabPane
          tab={
            <span>
              <KeyOutlined />
              Nhập mật khẩu hiện tại
            </span>
          }
          key="change"
        >
          <Form
            form={changePasswordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
            >
              <Password placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={passwordRules}
            >
              <Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={['newPassword']}
              rules={confirmPasswordRules}
            >
              <Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={onCancel}>Hủy</Button>
                <Button type="primary" className="chemistry-btn-primary" htmlType="submit" loading={passwordLoading}>
                  Đổi mật khẩu
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <span>
              <MailOutlined />
              Gửi xác nhận qua email
            </span>
          }
          key="forgot"
        >
          {!forgotPasswordSent ? (
            <Form
              form={forgotPasswordForm}
              layout="vertical"
              onFinish={handleForgotPassword}
              initialValues={{ email: profile?.email || '' }}
            >
              <Alert
                message="Gửi xác nhận qua email"
                description="Chúng tôi sẽ gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam)."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email của bạn" prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={onCancel}>Hủy</Button>
                  <Button type="primary" className="chemistry-btn-primary" htmlType="submit" loading={passwordLoading}>
                    Gửi email xác nhận
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <Form
              form={resetPasswordForm}
              layout="vertical"
              onFinish={handleResetPassword}
            >
              <Alert
                message="Nhập mã xác nhận"
                description="Vui lòng nhập mã xác nhận đã được gửi đến email của bạn và mật khẩu mới."
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" prefix={<MailOutlined />} disabled />
              </Form.Item>

              <Form.Item
                name="resetToken"
                label="Mã xác nhận"
                rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận' }]}
              >
                <Input placeholder="Nhập mã xác nhận từ email" maxLength={6} />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={passwordRules}
              >
                <Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={confirmPasswordRules}
              >
                <Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={() => {
                    onForgotPasswordSentChange(false);
                    resetPasswordForm.resetFields();
                  }}>
                    Quay lại
                  </Button>
                  <Button type="primary" className="chemistry-btn-primary" htmlType="submit" loading={passwordLoading}>
                    Đặt lại mật khẩu
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default PasswordChangeModal;

