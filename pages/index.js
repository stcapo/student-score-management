import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  FaUserGraduate,
  FaBook,
  FaChartBar,
  FaClipboardList,
  FaBullhorn,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    exams: 0,
    notifications: 0,
  });

  useEffect(() => {
    // 检查用户是否已登录
    const userData = localStorage.getItem('user');

    if (userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    }

    // 模拟获取统计数据
    // 实际项目中应该从API获取
    setTimeout(() => {
      setStats({
        students: 120,
        courses: 15,
        exams: 8,
        notifications: 3,
      });
    }, 1000);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <>
      <Head>
        <title>控制面板 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">控制面板</h1>

        {/* 欢迎信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">欢迎回来，{user?.name || user?.username}！</h2>
          <p className="text-gray-600">
            这是学生成绩管理系统的控制面板。您可以在这里查看系统概况和快速访问常用功能。
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* 学生数量 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                <FaUserGraduate className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">学生总数</p>
                <p className="text-xl font-bold">11</p>
              </div>
            </div>
            <Link
              href="/students"
              className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
            >
              查看详情 →
            </Link>
          </div>

          {/* 课程数量 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <FaBook className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">课程总数</p>
                <p className="text-xl font-bold">{stats.courses}</p>
              </div>
            </div>
            <Link
              href="/courses"
              className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
            >
              查看详情 →
            </Link>
          </div>

          {/* 考试数量 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <FaClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">考试安排</p>
                <p className="text-xl font-bold">{stats.exams}</p>
              </div>
            </div>
            <Link
              href="/exams"
              className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
            >
              查看详情 →
            </Link>
          </div>

          {/* 通知数量 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                <FaBullhorn className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">未读通知</p>
                <p className="text-xl font-bold">{stats.notifications}</p>
              </div>
            </div>
            <Link
              href="/notifications"
              className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
            >
              查看详情 →
            </Link>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.role === 'admin' || user?.role === 'teacher' ? (
              <>
                <Link
                  href="/students/add"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-blue-100 text-blue-500 mr-3">
                    <FaUserGraduate className="w-5 h-5" />
                  </div>
                  <span>添加学生</span>
                </Link>

                <Link
                  href="/courses/add"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-green-100 text-green-500 mr-3">
                    <FaBook className="w-5 h-5" />
                  </div>
                  <span>添加课程</span>
                </Link>

                <Link
                  href="/grades/add"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-500 mr-3">
                    <FaChartBar className="w-5 h-5" />
                  </div>
                  <span>录入成绩</span>
                </Link>

                <Link
                  href="/analysis"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-teal-100 text-teal-500 mr-3">
                    <FaChartBar className="w-5 h-5" />
                  </div>
                  <span>成绩分析</span>
                </Link>

                <Link
                  href="/exams/add"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-purple-100 text-purple-500 mr-3">
                    <FaClipboardList className="w-5 h-5" />
                  </div>
                  <span>添加考试</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/my-grades"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-500 mr-3">
                    <FaChartBar className="w-5 h-5" />
                  </div>
                  <span>查看成绩</span>
                </Link>

                <Link
                  href="/my-courses"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-green-100 text-green-500 mr-3">
                    <FaBook className="w-5 h-5" />
                  </div>
                  <span>我的课程</span>
                </Link>

                <Link
                  href="/my-exams"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-purple-100 text-purple-500 mr-3">
                    <FaClipboardList className="w-5 h-5" />
                  </div>
                  <span>考试安排</span>
                </Link>
              </>
            )}

            <Link
              href="/notifications"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-500 mr-3">
                <FaBullhorn className="w-5 h-5" />
              </div>
              <span>查看通知</span>
            </Link>
          </div>
        </div>

        {/* 系统状态 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">系统状态</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <FaCheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">数据库连接正常</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">用户认证系统正常</span>
            </div>
            <div className="flex items-center">
              <FaExclamationCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-sm">上次系统备份: 7天前</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
