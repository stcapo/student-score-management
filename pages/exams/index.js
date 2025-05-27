import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaFileAlt, FaSortAlphaDown, FaSortAlphaUp, FaBook } from 'react-icons/fa';

export default function ExamList() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc'); // 默认按日期降序
  const [selectedExams, setSelectedExams] = useState([]);
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('upcoming');

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 获取考试数据
    fetchExams();
  }, [filterStatus]);

  // 获取考试列表
  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');

      let url = '/api/exams';
      if (searchTerm) {
        url += `?query=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // 添加模拟的未来考试数据
        const mockFutureExams = [
          {
            id: 'mock-exam-001',
            title: '操作系统期中考试',
            description: '进程管理、内存管理、文件系统等核心概念',
            courseId: 'course-006',
            courseName: '操作系统',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
            duration: 120,
            location: '计算机楼A301',
            examType: 'midterm',
            totalScore: 100,
            passingScore: 60,
            creatorId: 'teacher-003',
            creatorName: '张老师',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mock-exam-002',
            title: '概率论与数理统计期末考试',
            description: '概率分布、假设检验、回归分析',
            courseId: 'course-007',
            courseName: '概率论与数理统计',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14天后
            duration: 150,
            location: '理学楼B205',
            examType: 'final',
            totalScore: 100,
            passingScore: 60,
            creatorId: 'teacher-004',
            creatorName: '赵老师',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mock-exam-003',
            title: '人工智能导论期中考试',
            description: '机器学习基础、神经网络、搜索算法',
            courseId: 'course-008',
            courseName: '人工智能导论',
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21天后
            duration: 120,
            location: '计算机楼B402',
            examType: 'midterm',
            totalScore: 100,
            passingScore: 60,
            creatorId: 'teacher-005',
            creatorName: '陈老师',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mock-exam-004',
            title: '编译原理期末考试',
            description: '词法分析、语法分析、代码生成',
            courseId: 'course-009',
            courseName: '编译原理',
            date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), // 28天后
            duration: 150,
            location: '计算机楼A205',
            examType: 'final',
            totalScore: 100,
            passingScore: 60,
            creatorId: 'teacher-006',
            creatorName: '刘老师',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mock-exam-005',
            title: '商务英语期中考试',
            description: '商务写作、口语表达、商务礼仪',
            courseId: 'course-010',
            courseName: '商务英语',
            date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // 35天后
            duration: 120,
            location: '外语楼C301',
            examType: 'midterm',
            totalScore: 100,
            passingScore: 60,
            creatorId: 'teacher-007',
            creatorName: '王老师',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mock-exam-006',
            title: '数据库系统实践考试',
            description: '数据库设计、SQL优化、事务处理',
            courseId: 'course-005',
            courseName: '数据库原理',
            date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(), // 42天后
            duration: 180,
            location: '实验楼D301',
            examType: 'practical',
            totalScore: 100,
            passingScore: 60,
            creatorId: 'teacher-002',
            creatorName: '李老师',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        // 为原始数据添加课程名称映射
        const courseNameMap = {
          'course-001': '数据结构与算法',
          'course-002': '高等数学',
          'course-003': '计算机网络',
          'course-004': '软件工程',
          'course-005': '数据库原理',
          'course-006': '操作系统',
          'course-007': '概率论与数理统计',
          'course-008': '人工智能导论',
          'course-009': '编译原理',
          'course-010': '商务英语',
          'a6db156c-eac4-44a5-a0af-a78e4048193c': 'English'
        };

        // 为原始数据添加courseName字段
        const enhancedOriginalExams = data.exams.map(exam => ({
          ...exam,
          courseName: courseNameMap[exam.courseId] || '未知课程'
        }));

        // 合并真实数据和模拟数据
        const allExams = [...enhancedOriginalExams, ...mockFutureExams];

        // 根据状态筛选
        let filteredExams = allExams;
        if (filterStatus !== 'all') {
          const now = new Date();
          if (filterStatus === 'upcoming') {
            filteredExams = allExams.filter(exam => new Date(exam.date) >= now);
          } else if (filterStatus === 'completed') {
            filteredExams = allExams.filter(exam => new Date(exam.date) < now);
          }
        }

        setExams(filteredExams);
      } else {
        setError(data.message || '获取考试列表失败');
      }
    } catch (error) {
      console.error('获取考试列表错误:', error);
      setError('获取考试列表时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    fetchExams();
  };

  // 处理排序
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 排序考试列表
  const sortedExams = [...exams].sort((a, b) => {
    let valueA = a[sortField] || '';
    let valueB = b[sortField] || '';

    // 日期特殊处理
    if (sortField === 'date') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    // 字符串比较
    else if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
    }
    if (typeof valueB === 'string') {
      valueB = valueB.toLowerCase();
    }

    // 排序方向
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // 处理考试选择
  const handleSelectExam = (id) => {
    if (selectedExams.includes(id)) {
      setSelectedExams(selectedExams.filter(examId => examId !== id));
    } else {
      setSelectedExams([...selectedExams, id]);
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedExams.length === sortedExams.length) {
      setSelectedExams([]);
    } else {
      setSelectedExams(sortedExams.map(exam => exam.id));
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedExams.length === 0) return;

    if (!confirm(`确定要删除选中的 ${selectedExams.length} 个考试吗？`)) {
      return;
    }

    try {
      // 逐个删除选中的考试
      for (const id of selectedExams) {
        await fetch(`/api/exams/${id}`, {
          method: 'DELETE',
        });
      }

      // 刷新列表
      fetchExams();
      setSelectedExams([]);
      alert('选中的考试已成功删除');
    } catch (error) {
      console.error('批量删除考试错误:', error);
      alert('批量删除考试时发生错误');
    }
  };

  // 处理单个删除
  const handleDelete = async (id, title) => {
    if (!confirm(`确定要删除考试 "${title}" 吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 刷新列表
        fetchExams();
        alert('考试已成功删除');
      } else {
        const data = await response.json();
        alert(data.message || '删除考试失败');
      }
    } catch (error) {
      console.error('删除考试错误:', error);
      alert('删除考试时发生错误');
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  // 判断考试状态
  const getExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);

    if (examDate > now) {
      return { label: '未开始', className: 'bg-blue-100 text-blue-800' };
    } else if (examDate <= now) {
      return { label: '已结束', className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <>
      <Head>
        <title>考试管理 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">考试管理</h1>

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <Link
              href="/exams/add"
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FaPlus className="mr-2" />
              添加考试
            </Link>
          )}
        </div>

        {/* 搜索和筛选工具栏 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* 搜索表单 */}
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="搜索考试（标题、课程或地点）"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                搜索
              </button>
            </form>

            {/* 筛选选项 */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">状态筛选：</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="upcoming">即将进行</option>
                <option value="completed">已结束</option>
                <option value="all">全部</option>
              </select>

              {/* 批量操作按钮 */}
              {selectedExams.length > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <FaTrash className="mr-2" />
                  删除所选({selectedExams.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 考试列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">加载中...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : exams.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              未找到考试记录{searchTerm ? `（搜索: "${searchTerm}"）` : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedExams.length === sortedExams.length && sortedExams.length > 0}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        考试标题
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('courseName')}
                    >
                      <div className="flex items-center">
                        关联课程
                        {sortField === 'courseName' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        考试时间
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center">
                        地点
                        {sortField === 'location' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('duration')}
                    >
                      <div className="flex items-center">
                        时长
                        {sortField === 'duration' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedExams.map((exam) => {
                    const status = getExamStatus(exam);
                    return (
                      <tr key={exam.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedExams.includes(exam.id)}
                            onChange={() => handleSelectExam(exam.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                              <FaFileAlt />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {exam.title}
                                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                                  {status.label}
                                </span>
                              </div>
                              {exam.examType && (
                                <div className="text-xs text-gray-500">
                                  类型: {exam.examType}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaBook className="mr-1 text-gray-400" />
                            <span className="text-sm text-gray-900">{exam.courseName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(exam.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{exam.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{exam.duration} 分钟</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/exams/${exam.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="查看考试详情"
                            >
                              <FaEye />
                            </Link>
                            {(user?.role === 'admin' || (user?.role === 'teacher' && user?.id === exam.creatorId)) && new Date(exam.date) > new Date() && (
                              <>
                                <Link
                                  href={`/exams/edit/${exam.id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="编辑考试信息"
                                >
                                  <FaEdit />
                                </Link>
                                <button
                                  onClick={() => handleDelete(exam.id, exam.title)}
                                  className="text-red-600 hover:text-red-900"
                                  title="删除考试"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
