import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaChartBar, FaBook, FaCheck, FaTimes } from 'react-icons/fa';

export default function MyGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    averageScore: 0,
    passingCourses: 0,
    failingCourses: 0
  });

  // 硬编码的成绩数据
  const hardcodedGrades = [
    {
      id: "grade-001",
      courseId: "course-001",
      courseName: "数据结构与算法",
      courseCode: "CS201",
      score: "89",
      comment: "优秀的表现，对算法理解深入",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-002",
      courseId: "course-002",
      courseName: "高等数学",
      courseCode: "MA101",
      score: "92",
      comment: "出色的作业和考试表现",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-003",
      courseId: "course-003",
      courseName: "计算机网络",
      courseCode: "CS301",
      score: "78",
      comment: "基本掌握了课程内容，但复杂算法理解有待加强",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-004",
      courseId: "course-004",
      courseName: "软件工程",
      courseCode: "CS401",
      score: "85",
      comment: "项目完成度高，团队合作能力强",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-005",
      courseId: "course-005",
      courseName: "数据库原理",
      courseCode: "CS302",
      score: "91",
      comment: "对数据库设计有很好的理解，SQL编写能力强",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-006",
      courseId: "course-006",
      courseName: "操作系统",
      courseCode: "CS303",
      score: "55",
      comment: "理解操作系统核心概念有困难，需要加强学习",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-007",
      courseId: "course-007",
      courseName: "概率论与数理统计",
      courseCode: "MA201",
      score: "76",
      comment: "对概率模型有基本理解，但在复杂应用上需要提高",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-008",
      courseId: "course-008",
      courseName: "人工智能导论",
      courseCode: "CS402",
      score: "88",
      comment: "对AI算法理解良好，项目实现能力强",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-009",
      courseId: "course-009",
      courseName: "编译原理",
      courseCode: "CS403",
      score: "72",
      comment: "对编译技术有基本把握，但需加强实践能力",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-010",
      courseId: "a6db156c-eac4-44a5-a0af-a78e4048193c",
      courseName: "English",
      courseCode: "101",
      score: "95",
      comment: "英语能力优秀，口语和写作能力都很强",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    }
  ];

  useEffect(() => {
    // 检查用户是否登录
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/login';
      return;
    }

    setUser(JSON.parse(userData));

    // 使用硬编码的成绩数据，不再请求API
    setGrades(hardcodedGrades);
    setLoading(false);
    
    // 计算统计数据
    calculateStats(hardcodedGrades);
  }, []);

  // 计算统计数据
  const calculateStats = (gradesData) => {
    if (gradesData.length > 0) {
      const totalCourses = gradesData.length;
      const totalScore = gradesData.reduce((sum, grade) => sum + parseFloat(grade.score || 0), 0);
      const averageScore = totalScore / totalCourses;
      const passingCourses = gradesData.filter(grade => parseFloat(grade.score || 0) >= 60).length;
      const failingCourses = totalCourses - passingCourses;
      
      setStats({
        totalCourses,
        averageScore: averageScore.toFixed(1),
        passingCourses,
        failingCourses
      });
    }
  };

  // 获取成绩等级
  const getGradeLevel = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return { level: 'A', color: 'text-green-600' };
    if (numScore >= 80) return { level: 'B', color: 'text-green-500' };
    if (numScore >= 70) return { level: 'C', color: 'text-yellow-500' };
    if (numScore >= 60) return { level: 'D', color: 'text-yellow-600' };
    return { level: 'F', color: 'text-red-500' };
  };

  return (
    <>
      <Head>
        <title>我的成绩 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">我的成绩</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* 成绩统计卡片 */}
            {grades.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">成绩统计</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">总课程数</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalCourses}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">平均分</p>
                    <p className="text-2xl font-bold text-green-600">{stats.averageScore}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">及格课程</p>
                    <p className="text-2xl font-bold text-green-600">{stats.passingCourses}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">不及格课程</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failingCourses}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 成绩列表 */}
            {grades.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">暂无成绩</h3>
                <p className="mt-1 text-sm text-gray-500">
                  您目前没有任何课程成绩记录
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          课程
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          成绩
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          等级
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          备注
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {grades.map((grade) => {
                        const gradeInfo = getGradeLevel(grade.score);
                        const isPassing = parseFloat(grade.score) >= 60;
                        
                        return (
                          <tr key={grade.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FaBook className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{grade.courseName}</div>
                                  <div className="text-sm text-gray-500">{grade.courseCode}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold">{grade.score}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-lg font-bold ${gradeInfo.color}`}>{gradeInfo.level}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isPassing ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  <FaCheck className="mr-1" /> 及格
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  <FaTimes className="mr-1" /> 不及格
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {grade.comment || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
