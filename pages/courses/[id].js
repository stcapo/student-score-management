import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FaChartBar,
  FaClipboardList,
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaBook, 
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaUniversity,
  FaGraduationCap,
  FaInfoCircle
} from 'react-icons/fa';

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // 获取课程信息
    if (id) {
      fetchCourseData(id);
    }
  }, [id]);

  // 获取课程详情
  const fetchCourseData = async (courseId) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (response.ok) {
        setCourse(data.course);
      } else {
        setError(data.message || '获取课程信息失败');
      }
    } catch (error) {
      console.error('获取课程信息错误:', error);
      setError('获取课程信息时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除课程
  const handleDelete = async () => {
    if (!course) return;
    
    if (!confirm(`确定要删除课程 "${course.name}" 吗？`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('课程已成功删除');
        router.push('/courses');
      } else {
        const data = await response.json();
        alert(data.message || '删除课程失败');
      }
    } catch (error) {
      console.error('删除课程错误:', error);
      alert('删除课程时发生错误');
    }
  };

  // 检查用户是否有编辑权限
  const hasEditPermission = () => {
    if (!user || !course) return false;
    return user.role === 'admin' || (user.role === 'teacher' && user.id === course.teacherId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">加载中...</span>
          </div>
          <p className="mt-2">正在加载课程信息...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            href="/courses"
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FaArrowLeft className="mr-2" />
            返回课程列表
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">未找到课程信息</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            href="/courses"
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FaArrowLeft className="mr-2" />
            返回课程列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{course.name} - 课程详情 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">课程详情</h1>
          
          <div className="flex space-x-2">
            <Link
              href="/courses"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FaArrowLeft className="mr-2" />
              返回列表
            </Link>
            
            {hasEditPermission() && course.status !== 'inactive' && (
              <>
                <Link
                  href={`/courses/edit/${course.id}`}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  <FaEdit className="mr-2" />
                  编辑
                </Link>
                
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <FaTrash className="mr-2" />
                  删除
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 课程头部信息 */}
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 text-blue-600 text-3xl mb-4 md:mb-0 md:mr-6">
                <FaBook />
              </div>
              <div>
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {course.name}
                  </h2>
                  {course.status === 'inactive' && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      已结束
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">课程代码: {course.code}</p>
                <div className="mt-2 flex flex-wrap items-center text-sm text-gray-600">
                  {course.credits && (
                    <div className="flex items-center mr-4">
                      <FaGraduationCap className="mr-1" />
                      <span>学分：{course.credits}</span>
                    </div>
                  )}
                  {course.semester && (
                    <div className="flex items-center mr-4">
                      <FaCalendarAlt className="mr-1" />
                      <span>学期：{course.semester}</span>
                    </div>
                  )}
                  {course.department && (
                    <div className="flex items-center">
                      <FaUniversity className="mr-1" />
                      <span>院系：{course.department}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 课程详细信息 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">基本信息</h3>
                
                {course.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">课程描述</h4>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                    <FaCalendarAlt />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="text-gray-500">开始日期：</span>
                    <span className="text-gray-900">{course.startDate ? new Date(course.startDate).toLocaleDateString() : '未设置'}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                    <FaCalendarAlt />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="text-gray-500">结束日期：</span>
                    <span className="text-gray-900">{course.endDate ? new Date(course.endDate).toLocaleDateString() : '未设置'}</span>
                  </div>
                </div>
                
                {course.location && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-500">上课地点：</span>
                      <span className="text-gray-900">{course.location}</span>
                    </div>
                  </div>
                )}
                
                {course.capacity > 0 && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FaInfoCircle />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-500">课程容量：</span>
                      <span className="text-gray-900">{course.capacity}人</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">教师信息</h3>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                    <FaUser />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="text-gray-500">任课教师：</span>
                    <span className="text-gray-900">{course.teacherName || '未分配'}</span>
                  </div>
                </div>
                
                {course.teacherEmail && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-500">教师邮箱：</span>
                      <a href={`mailto:${course.teacherEmail}`} className="text-blue-600 hover:text-blue-800">
                        {course.teacherEmail}
                      </a>
                    </div>
                  </div>
                )}
                
                {/* 添加相关链接 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">相关操作</h4>
                  <div className="space-y-2">
                    <Link
                      href={`/grades?courseId=${course.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FaChartBar className="mr-2" />
                      <span>查看该课程成绩</span>
                    </Link>
                    
                    <Link
                      href={`/exams?courseId=${course.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FaClipboardList className="mr-2" />
                      <span>查看该课程考试</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 系统信息 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">系统信息</h3>
              <div className="mt-2 text-xs text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span>创建时间：</span>
                  <span>{new Date(course.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span>最后更新：</span>
                  <span>{new Date(course.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
