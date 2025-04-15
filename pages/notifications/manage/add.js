import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

export default function AddNotification() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'public',
    targetRole: '',
    targetUserId: '',
    priority: 'normal',
    expireAt: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // 检查权限
      if (parsedUser.role !== 'admin') {
        alert('您没有权限访问此页面');
        router.push('/');
      }
    } else {
      router.push('/login');
    }
    
    // 如果通知类型是个人通知，获取用户列表
    if (formData.type === 'personal') {
      fetchUsers();
    }
  }, [formData.type, router]);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  // 处理表单字段变更
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

  // 验证表单
  const validateForm = () => {
    const newErrors = {};
    
    // 标题验证
    if (!formData.title.trim()) {
      newErrors.title = '请输入通知标题';
    }
    
    // 内容验证
    if (!formData.content.trim()) {
      newErrors.content = '请输入通知内容';
    }
    
    // 类型为角色通知时，必须选择目标角色
    if (formData.type === 'role' && !formData.targetRole) {
      newErrors.targetRole = '请选择目标角色';
    }
    
    // 类型为个人通知时，必须选择目标用户
    if (formData.type === 'personal' && !formData.targetUserId) {
      newErrors.targetUserId = '请选择目标用户';
    }
    
    // 过期时间验证，如果有值，必须是未来时间
    if (formData.expireAt) {
      const expireDate = new Date(formData.expireAt);
      const now = new Date();
      if (expireDate <= now) {
        newErrors.expireAt = '过期时间必须是未来时间';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      // 构建要提交的数据
      const notificationData = { ...formData };
      
      // 如果不是角色通知，清除targetRole字段
      if (formData.type !== 'role') {
        notificationData.targetRole = null;
      }
      
      // 如果不是个人通知，清除targetUserId字段
      if (formData.type !== 'personal') {
        notificationData.targetUserId = null;
      }
      
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(notificationData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('通知发布成功！');
        router.push('/notifications/manage');
      } else {
        setError(data.message || '发布通知失败');
      }
    } catch (error) {
      console.error('发布通知错误:', error);
      setError('发布通知时发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>发布通知 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">发布通知</h1>
          
          <Link
            href="/notifications/manage"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            返回通知列表
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 通知标题 */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  通知标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`}
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* 通知类型 */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  通知类型 <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="public">公共通知（所有用户）</option>
                  <option value="role">角色通知（指定角色）</option>
                  <option value="personal">个人通知（指定用户）</option>
                </select>
              </div>

              {/* 优先级 */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  优先级
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">低</option>
                  <option value="normal">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              {/* 目标角色（仅当类型为角色通知时显示） */}
              {formData.type === 'role' && (
                <div>
                  <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 mb-1">
                    目标角色 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="targetRole"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.targetRole ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">--请选择--</option>
                    <option value="student">学生</option>
                    <option value="teacher">教师</option>
                    <option value="admin">管理员</option>
                  </select>
                  {errors.targetRole && (
                    <p className="mt-1 text-sm text-red-500">{errors.targetRole}</p>
                  )}
                </div>
              )}

              {/* 目标用户（仅当类型为个人通知时显示） */}
              {formData.type === 'personal' && (
                <div>
                  <label htmlFor="targetUserId" className="block text-sm font-medium text-gray-700 mb-1">
                    目标用户 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="targetUserId"
                    name="targetUserId"
                    value={formData.targetUserId}
                    onChange={handleChange}
                    className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.targetUserId ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">--请选择--</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'})
                      </option>
                    ))}
                  </select>
                  {errors.targetUserId && (
                    <p className="mt-1 text-sm text-red-500">{errors.targetUserId}</p>
                  )}
                </div>
              )}

              {/* 过期时间 */}
              <div>
                <label htmlFor="expireAt" className="block text-sm font-medium text-gray-700 mb-1">
                  过期时间
                </label>
                <input
                  type="datetime-local"
                  id="expireAt"
                  name="expireAt"
                  value={formData.expireAt}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.expireAt ? 'border-red-500' : ''}`}
                />
                {errors.expireAt && (
                  <p className="mt-1 text-sm text-red-500">{errors.expireAt}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">留空表示永不过期</p>
              </div>
            </div>

            {/* 通知内容 */}
            <div className="mt-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                通知内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                rows="6"
                value={formData.content}
                onChange={handleChange}
                className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.content ? 'border-red-500' : ''}`}
                required
              ></textarea>
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content}</p>
              )}
            </div>

            {/* 按钮组 */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href="/notifications/manage"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <FaTimes className="mr-2" />
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSave className="mr-2" />
                {loading ? '发布中...' : '发布通知'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
