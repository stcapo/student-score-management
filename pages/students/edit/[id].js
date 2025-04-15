import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

export default function EditStudent() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    gender: '',
    birthdate: '',
    class: '',
    department: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // 检查权限
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'teacher') {
        alert('您没有权限访问此页面');
        router.push('/');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    // 获取学生信息
    if (id) {
      fetchStudentData(id);
    }
  }, [id]);

  // 获取学生详情
  const fetchStudentData = async (studentId) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/students/${studentId}`);
      const data = await response.json();

      if (response.ok) {
        setFormData(data.student);
      } else {
        setError(data.message || '获取学生信息失败');
      }
    } catch (error) {
      console.error('获取学生信息错误:', error);
      setError('获取学生信息时发生错误');
    } finally {
      setLoading(false);
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
    
    // 姓名验证
    if (!formData.name.trim()) {
      newErrors.name = '请输入学生姓名';
    }
    
    // 学号验证
    if (!formData.studentId.trim()) {
      newErrors.studentId = '请输入学号';
    } else if (!/^\d+$/.test(formData.studentId.trim())) {
      newErrors.studentId = '学号应为数字';
    }
    
    // 邮箱验证（如果有值）
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    // 手机号验证（如果有值）
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
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
      setSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('学生信息更新成功！');
        router.push('/students');
      } else {
        setError(data.message || '更新学生信息失败');
      }
    } catch (error) {
      console.error('更新学生信息错误:', error);
      setError('更新学生信息时发生错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">加载中...</span>
          </div>
          <p className="mt-2">正在加载学生信息...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>编辑学生 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">编辑学生信息</h1>
          
          <Link
            href="/students"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            返回学生列表
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
              {/* 姓名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* 学号 */}
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                  学号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={`form-input ${errors.studentId ? 'border-red-500' : ''}`}
                  required
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>
                )}
              </div>

              {/* 性别 */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  性别
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              {/* 出生日期 */}
              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                  出生日期
                </label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* 班级 */}
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                  班级
                </label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* 院系 */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  院系
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* 邮箱 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* 电话 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  电话
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* 状态 */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  状态
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="active">在校</option>
                  <option value="inactive">已删除</option>
                </select>
              </div>
            </div>

            {/* 地址 */}
            <div className="mt-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                地址
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
              ></textarea>
            </div>

            {/* 按钮组 */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href="/students"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <FaTimes className="mr-2" />
                取消
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSave className="mr-2" />
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
