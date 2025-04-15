import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaInfoCircle, FaLock, FaSave, FaImage } from 'react-icons/fa';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // 获取用户详细信息
      fetchUserDetails(parsedUser.id);
    } else {
      router.push('/login');
    }
  }, [router]);

  // 获取用户详情
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      setError('');

      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          bio: data.user.bio || '',
          avatar: data.user.avatar || ''
        });
      } else {
        setError(data.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息错误:', error);
      setError('获取用户信息时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理个人信息表单字段变更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // 处理密码表单字段变更
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // 清除对应字段的错误
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ''
      });
    }
  };

  // 验证个人信息表单
  const validateProfileForm = () => {
    const newErrors = {};
    
    // 姓名验证
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    
    // 邮箱验证
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    // 电话验证（可选）
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 验证密码表单
  const validatePasswordForm = () => {
    const newErrors = {};
    
    // 旧密码验证
    if (!passwordData.oldPassword) {
      newErrors.oldPassword = '请输入旧密码';
    }
    
    // 新密码验证
    if (!passwordData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = '新密码长度至少为6位';
    }
    
    // 确认密码验证
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理个人信息表单提交
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('个人信息更新成功！');
        
        // 更新本地存储的用户信息
        const updatedUser = { ...user, name: formData.name, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.message || '更新个人信息失败');
      }
    } catch (error) {
      console.error('更新个人信息错误:', error);
      setError('更新个人信息时发生错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 处理密码表单提交
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('密码修改成功！');
        
        // 清空密码表单
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.message || '修改密码失败');
      }
    } catch (error) {
      console.error('修改密码错误:', error);
      setError('修改密码时发生错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 获取用户角色文本
  const getUserRoleText = (role) => {
    switch (role) {
      case 'admin':
        return '管理员';
      case 'teacher':
        return '教师';
      case 'student':
        return '学生';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-10">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>个人信息 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">个人信息</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 导航标签 */}
          <div className="flex border-b">
            <button
              className={`py-3 px-6 font-medium focus:outline-none ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              个人资料
            </button>
            <button
              className={`py-3 px-6 font-medium focus:outline-none ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('password')}
            >
              修改密码
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                <p>{success}</p>
              </div>
            )}

            {/* 个人资料表单 */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  {/* 左侧：头像和基本信息 */}
                  <div className="md:w-1/3 mb-6 md:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                        {formData.avatar ? (
                          <img src={formData.avatar} alt="用户头像" className="w-full h-full object-cover" />
                        ) : (
                          <FaUser className="text-gray-400 w-16 h-16" />
                        )}
                      </div>
                      
                      <div className="text-center mb-4">
                        <h2 className="text-xl font-medium">{user.name || user.username}</h2>
                        <p className="text-gray-500">{getUserRoleText(user.role)}</p>
                      </div>
                      
                      {/* 上传头像功能（示例，实际需要实现文件上传） */}
                      <button
                        type="button"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <FaImage className="mr-2" />
                        更换头像
                      </button>
                    </div>
                  </div>

                  {/* 右侧：个人资料表单 */}
                  <div className="md:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 姓名 */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          姓名 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border ${
                              errors.name ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            required
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      {/* 邮箱 */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          邮箱 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      {/* 电话 */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          电话
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                      </div>

                      {/* 地址 */}
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          地址
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaMapMarkerAlt className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 个人简介 */}
                    <div className="mt-6">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        个人简介
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                          <FaInfoCircle className="text-gray-400" />
                        </div>
                        <textarea
                          id="bio"
                          name="bio"
                          rows="4"
                          value={formData.bio}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="写一些关于你自己的介绍..."
                        ></textarea>
                      </div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaSave className="mr-2" />
                        {saving ? '保存中...' : '保存修改'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* 修改密码表单 */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="max-w-md mx-auto">
                {/* 旧密码 */}
                <div className="mb-4">
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    旧密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="oldPassword"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        passwordErrors.oldPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.oldPassword}</p>
                  )}
                </div>

                {/* 新密码 */}
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    新密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* 确认新密码 */}
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    确认新密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* 提交按钮 */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaSave className="mr-2" />
                    {saving ? '保存中...' : '修改密码'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
