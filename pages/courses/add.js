import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

export default function AddCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 0,
    department: '',
    semester: '',
    teacherId: '',
    startDate: '',
    endDate: '',
    capacity: 0,
    location: ''
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
    
    // 获取教师列表
    fetchTeachers();
  }, [router]);

  // 获取教师列表
  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('获取教师列表失败:', error);
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
    
    // 课程名称验证
    if (!formData.name.trim()) {
      newErrors.name = '请输入课程名称';
    }
    
    // 课程代码验证
    if (!formData.code.trim()) {
      newErrors.code = '请输入课程代码';
    }
    
    // 学分验证
    if (formData.credits && (isNaN(formData.credits) || formData.credits < 0)) {
      newErrors.credits = '学分必须是大于等于0的数字';
    }
    
    // 容量验证
    if (formData.capacity && (isNaN(formData.capacity) || formData.capacity < 0)) {
      newErrors.capacity = '容量必须是大于等于0的整数';
    }
    
    // 日期验证
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = '结束日期必须晚于开始日期';
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
      
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('课程添加成功！');
        router.push('/courses');
      } else {
        setError(data.message || '添加课程失败');
      }
    } catch (error) {
      console.error('添加课程错误:', error);
      setError('添加课程时发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>添加课程 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">添加课程</h1>
          
          <Link
            href="/courses"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            返回课程列表
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
              {/* 课程名称 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  课程名称 <span className="text-red-500">*</span>
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

              {/* 课程代码 */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  课程代码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`form-input ${errors.code ? 'border-red-500' : ''}`}
                  required
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-500">{errors.code}</p>
                )}
              </div>

              {/* 学分 */}
              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
                  学分
                </label>
                <input
                  type="number"
                  id="credits"
                  name="credits"
                  min="0"
                  step="0.5"
                  value={formData.credits}
                  onChange={handleChange}
                  className={`form-input ${errors.credits ? 'border-red-500' : ''}`}
                />
                {errors.credits && (
                  <p className="mt-1 text-sm text-red-500">{errors.credits}</p>
                )}
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

              {/* 学期 */}
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  学期
                </label>
                <input
                  type="text"
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="例如：2023-2024学年第一学期"
                />
              </div>

              {/* 教师 */}
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                  任课教师
                </label>
                <select
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">--请选择--</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.role === 'admin' ? '管理员' : '教师'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 容量 */}
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  容量
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  min="0"
                  value={formData.capacity}
                  onChange={handleChange}
                  className={`form-input ${errors.capacity ? 'border-red-500' : ''}`}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>
                )}
              </div>

              {/* 上课地点 */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  上课地点
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* 开始日期 */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* 结束日期 */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  结束日期
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`form-input ${errors.endDate ? 'border-red-500' : ''}`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* 课程描述 */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                课程描述
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
              ></textarea>
            </div>

            {/* 按钮组 */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href="/courses"
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
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
