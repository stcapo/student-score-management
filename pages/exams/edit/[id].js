import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

export default function EditExam() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    date: '',
    startTime: '',
    duration: 120,
    location: '',
    examType: 'final',
    totalScore: 100,
    passingScore: 60
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
    
    // 获取课程列表
    fetchCourses();
    
    // 如果有ID，获取考试数据
    if (id) {
      fetchExam();
    }
  }, [router, id]);

  // 获取课程列表
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('获取课程列表失败:', error);
    }
  };

  // 获取考试数据
  const fetchExam = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/exams/${id}`);
      const data = await response.json();

      if (response.ok) {
        const exam = data.exam;
        
        // 检查权限
        if (user && user.role !== 'admin' && user.id !== exam.creatorId) {
          alert('您没有权限编辑此考试');
          router.push('/exams');
          return;
        }
        
        // 提取日期和时间
        const examDate = new Date(exam.date);
        const dateString = examDate.toISOString().split('T')[0];
        const timeString = examDate.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit'
        });
        
        setFormData({
          title: exam.title || '',
          description: exam.description || '',
          courseId: exam.courseId || '',
          date: dateString,
          startTime: timeString,
          duration: exam.duration || 120,
          location: exam.location || '',
          examType: exam.examType || 'final',
          totalScore: exam.totalScore || 100,
          passingScore: exam.passingScore || 60
        });
      } else {
        setError(data.message || '获取考试数据失败');
      }
    } catch (error) {
      console.error('获取考试数据错误:', error);
      setError('获取考试数据时发生错误');
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
    
    // 考试标题验证
    if (!formData.title.trim()) {
      newErrors.title = '请输入考试标题';
    }
    
    // 课程验证
    if (!formData.courseId) {
      newErrors.courseId = '请选择关联课程';
    }
    
    // 日期验证
    if (!formData.date) {
      newErrors.date = '请选择考试日期';
    }
    
    // 时间验证
    if (!formData.startTime) {
      newErrors.startTime = '请选择开始时间';
    }
    
    // 时长验证
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = '请输入有效的考试时长';
    }
    
    // 地点验证
    if (!formData.location.trim()) {
      newErrors.location = '请输入考试地点';
    }
    
    // 总分验证
    if (formData.totalScore && (isNaN(formData.totalScore) || formData.totalScore <= 0)) {
      newErrors.totalScore = '总分必须是大于0的数字';
    }
    
    // 及格分验证
    if (formData.passingScore && (isNaN(formData.passingScore) || formData.passingScore < 0)) {
      newErrors.passingScore = '及格分数必须是大于等于0的数字';
    }
    
    if (formData.totalScore && formData.passingScore && Number(formData.passingScore) > Number(formData.totalScore)) {
      newErrors.passingScore = '及格分数不能大于总分';
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
      setSaving(true);
      setError('');
      
      // 合并日期和时间
      const dateTime = new Date(`${formData.date}T${formData.startTime}`);
      
      // 构建要提交的数据
      const examData = {
        ...formData,
        date: dateTime.toISOString()
      };
      // 删除startTime，因为已经合并到date中
      delete examData.startTime;
      
      const response = await fetch(`/api/exams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('考试更新成功！');
        router.push(`/exams/${id}`);
      } else {
        setError(data.message || '更新考试失败');
      }
    } catch (error) {
      console.error('更新考试错误:', error);
      setError('更新考试时发生错误，请稍后重试');
    } finally {
      setSaving(false);
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
        <title>编辑考试 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">编辑考试</h1>
          
          <Link
            href={`/exams/${id}`}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            返回考试详情
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
              {/* 考试标题 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  考试标题 <span className="text-red-500">*</span>
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

              {/* 关联课程 */}
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                  关联课程 <span className="text-red-500">*</span>
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.courseId ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">--请选择课程--</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="mt-1 text-sm text-red-500">{errors.courseId}</p>
                )}
              </div>

              {/* 考试日期 */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  考试日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.date ? 'border-red-500' : ''}`}
                  required
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              {/* 开始时间 */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  开始时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.startTime ? 'border-red-500' : ''}`}
                  required
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
                )}
              </div>

              {/* 考试时长 */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  考试时长(分钟) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.duration ? 'border-red-500' : ''}`}
                  required
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
                )}
              </div>

              {/* 考试地点 */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  考试地点 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.location ? 'border-red-500' : ''}`}
                  required
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              {/* 考试类型 */}
              <div>
                <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-1">
                  考试类型
                </label>
                <select
                  id="examType"
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="final">期末考试</option>
                  <option value="midterm">期中考试</option>
                  <option value="quiz">测验</option>
                  <option value="makeup">补考</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {/* 总分 */}
              <div>
                <label htmlFor="totalScore" className="block text-sm font-medium text-gray-700 mb-1">
                  总分
                </label>
                <input
                  type="number"
                  id="totalScore"
                  name="totalScore"
                  min="0"
                  value={formData.totalScore}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.totalScore ? 'border-red-500' : ''}`}
                />
                {errors.totalScore && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalScore}</p>
                )}
              </div>

              {/* 及格分数 */}
              <div>
                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                  及格分数
                </label>
                <input
                  type="number"
                  id="passingScore"
                  name="passingScore"
                  min="0"
                  value={formData.passingScore}
                  onChange={handleChange}
                  className={`form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.passingScore ? 'border-red-500' : ''}`}
                />
                {errors.passingScore && (
                  <p className="mt-1 text-sm text-red-500">{errors.passingScore}</p>
                )}
              </div>
            </div>

            {/* 考试描述 */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                考试描述
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* 按钮组 */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href={`/exams/${id}`}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <FaTimes className="mr-2" />
                取消
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSave className="mr-2" />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
