import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaBook, FaChalkboardTeacher, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 检查用户是否登录
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/login';
      return;
    }

    // 获取学生的课程
    fetchMyCourses();
  }, []);

  // 获取学生的课程
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError('');

      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // 获取选课记录
      const response = await fetch('/api/course-registrations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        const registrations = data.registrations || [];
        
        // 获取每个课程的详细信息
        const courseDetails = [];
        
        // 这里我们已经在API中添加了必要的课程信息，直接使用
        setCourses(registrations);
      } else {
        setError(data.message || '获取课程失败');
      }
    } catch (error) {
      console.error('获取课程错误:', error);
      setError('获取课程时发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>我的课程 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">我的课程</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaBook className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">暂无课程</h3>
            <p className="mt-1 text-sm text-gray-500">
              您目前没有选修任何课程
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaBook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{course.courseName}</h3>
                      <p className="text-sm text-gray-500">课程代码: {course.courseCode}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="mr-2" />
                      <span>教师: {course.teacherName || '未分配'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      <span>学期: {course.semester || '未设置'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>地点: {course.location || '未设置'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      <span>状态: {course.status === 'active' ? '进行中' : '已结束'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link 
                      href={`/courses/${course.courseId}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
