import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Chart from 'chart.js/auto';
import { 
  FaArrowLeft, 
  FaChartBar, 
  FaChartPie, 
  FaTable,
  FaDownload,
  FaTrophy,
  FaFileExport
} from 'react-icons/fa';

export default function GradesAnalysis() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [statsData, setStatsData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [rankingsData, setRankingsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Chart refs
  const distributionChartRef = useRef(null);
  const distributionChart = useRef(null);
  const comparisonChartRef = useRef(null);
  const comparisonChart = useRef(null);

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // 如果是学生用户，自动设置selectedStudent
      if (parsedUser.role === 'student') {
        setSelectedStudent(parsedUser.id);
      }
    } else {
      router.push('/login');
    }
    
    // 获取课程和学生列表
    fetchCourses();
    
    // 如果不是学生，获取学生列表
    if (JSON.parse(userData)?.role !== 'student') {
      fetchStudents();
    }
    
    // 检查URL查询参数
    if (router.query.courseId) {
      setSelectedCourse(router.query.courseId);
    }
    
    if (router.query.studentId) {
      setSelectedStudent(router.query.studentId);
    }
  }, [router.query]);

  // 当选择变化时，获取统计数据
  useEffect(() => {
    if (selectedCourse || selectedStudent) {
      fetchGradesStatistics();
    }
  }, [selectedCourse, selectedStudent]);

  // 当统计数据变化时，更新图表
  useEffect(() => {
    if (statsData) {
      renderDistributionChart();
    }
  }, [statsData]);

  // 当比较数据变化时，更新比较图表
  useEffect(() => {
    if (comparisonData) {
      renderComparisonChart();
    }
  }, [comparisonData]);

  // 获取课程列表
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        let coursesList = data.courses || [];
        
        // 如果是教师，只显示他们教授的课程
        if (user && user.role === 'teacher') {
          coursesList = coursesList.filter(course => course.teacherId === user.id);
        }
        
        setCourses(coursesList);
      }
    } catch (error) {
      console.error('获取课程列表失败:', error);
    }
  };

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students.filter(student => student.status === 'active'));
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
    }
  };

  // 获取成绩统计数据
  const fetchGradesStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/api/grades/statistics?';
      const params = [];
      
      if (selectedCourse) {
        params.push(`courseId=${selectedCourse}`);
      }
      
      if (selectedStudent) {
        params.push(`studentId=${selectedStudent}`);
      }
      
      // 获取基本统计数据
      const response = await fetch(url + params.join('&'));
      
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      } else {
        const data = await response.json();
        setError(data.message || '获取统计数据失败');
      }
      
      // 如果选择了学生，获取课程比较数据
      if (selectedStudent) {
        const compareUrl = `/api/grades/statistics?studentId=${selectedStudent}&type=course-comparison`;
        const compareResponse = await fetch(compareUrl);
        
        if (compareResponse.ok) {
          const compareData = await compareResponse.json();
          setComparisonData(compareData);
        }
      }
      
      // 如果选择了课程，获取排名数据
      if (selectedCourse) {
        const rankUrl = `/api/grades/statistics?courseId=${selectedCourse}&type=student-ranking`;
        const rankResponse = await fetch(rankUrl);
        
        if (rankResponse.ok) {
          const rankData = await rankResponse.json();
          setRankingsData(rankData);
        }
      }
    } catch (error) {
      console.error('获取统计数据错误:', error);
      setError('获取统计数据时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 渲染分数分布图表
  const renderDistributionChart = () => {
    if (!statsData || !statsData.statistics || !distributionChartRef.current) return;
    
    const { distribution } = statsData.statistics;
    
    // 如果图表已存在，销毁它
    if (distributionChart.current) {
      distributionChart.current.destroy();
    }
    
    const ctx = distributionChartRef.current.getContext('2d');
    
    distributionChart.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: distribution.map(item => item.range),
        datasets: [{
          label: '学生人数',
          data: distribution.map(item => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',  // 红色 (0-59)
            'rgba(255, 159, 64, 0.5)',  // 橙色 (60-69)
            'rgba(255, 205, 86, 0.5)',  // 黄色 (70-79)
            'rgba(75, 192, 192, 0.5)',  // 青色 (80-89)
            'rgba(54, 162, 235, 0.5)'   // 蓝色 (90-100)
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '成绩分布'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '学生人数'
            },
            ticks: {
              stepSize: 1
            }
          },
          x: {
            title: {
              display: true,
              text: '分数区间'
            }
          }
        }
      }
    });
  };

  // 渲染课程比较图表
  const renderComparisonChart = () => {
    if (!comparisonData || !comparisonData.courseComparison || !comparisonChartRef.current) return;
    
    const courseComparison = comparisonData.courseComparison;
    
    // 如果图表已存在，销毁它
    if (comparisonChart.current) {
      comparisonChart.current.destroy();
    }
    
    const ctx = comparisonChartRef.current.getContext('2d');
    
    comparisonChart.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: courseComparison.map(item => item.courseName || `课程 ${item.courseId.substring(0, 6)}`),
        datasets: [{
          label: '平均分',
          data: courseComparison.map(item => item.average),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '各课程成绩对比'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: '分数'
            }
          },
          x: {
            title: {
              display: true,
              text: '课程'
            }
          }
        }
      }
    });
  };

  // 导出分析数据为PDF (简单实现，实际项目可能需要使用PDF生成库)
  const exportAnalysisData = () => {
    alert('此功能将在将来的版本中实现。目前，您可以截图或使用浏览器的打印功能保存分析结果。');
  };

  return (
    <>
      <Head>
        <title>成绩分析 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">成绩分析</h1>
          
          <div className="flex space-x-2">
            <Link
              href="/grades"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FaArrowLeft className="mr-2" />
              返回成绩列表
            </Link>
            
            <button
              onClick={exportAnalysisData}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              disabled={!statsData}
            >
              <FaFileExport className="mr-2" />
              导出分析结果
            </button>
          </div>
        </div>

        {/* 筛选工具栏 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* 课程筛选 */}
            <div className="flex-grow md:flex-grow-0 md:w-1/3">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                选择课程
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">所有课程</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            
            {/* 学生筛选（非学生用户可见） */}
            {user?.role !== 'student' && (
              <div className="flex-grow md:flex-grow-0 md:w-1/3">
                <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                  选择学生
                </label>
                <select
                  id="student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">所有学生</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {error && (
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
        )}

        {!selectedCourse && !selectedStudent ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">选择分析对象</h3>
            <p className="mt-1 text-sm text-gray-500">
              请选择课程或学生以查看详细的成绩分析
            </p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="spinner-border inline-block w-8 h-8 border-4 rounded-full border-blue-500 border-t-transparent animate-spin"></div>
            <p className="mt-2 text-gray-500">正在加载分析数据...</p>
          </div>
        ) : statsData && statsData.total === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">暂无成绩数据</h3>
            <p className="mt-1 text-sm text-gray-500">
              当前选择的条件下没有可用的成绩数据进行分析
            </p>
          </div>
        ) : statsData ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 分析选项卡 */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaChartPie className="inline-block mr-2" />
                  总体分析
                </button>
                {selectedCourse && (
                  <button
                    onClick={() => setActiveTab('rankings')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'rankings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FaTrophy className="inline-block mr-2" />
                    成绩排名
                  </button>
                )}
                {selectedStudent && (
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'comparison'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FaChartBar className="inline-block mr-2" />
                    课程对比
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaTable className="inline-block mr-2" />
                  详细数据
                </button>
              </nav>
            </div>

            {/* 分析内容 */}
            <div className="p-6">
              {/* 总体分析选项卡 */}
              {activeTab === 'overview' && (
                <div>
                  {/* 分析标题 */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedCourse && statsData.course
                        ? `${statsData.course.name} 成绩分析`
                        : selectedStudent && statsData.student
                        ? `${statsData.student.name} 的成绩分析`
                        : '成绩总体分析'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      共 {statsData.total} 条成绩记录
                    </p>
                  </div>

                  {/* 关键指标 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* 平均分 */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-sm font-medium text-blue-800">平均分</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {statsData.statistics.average}
                      </p>
                    </div>
                    
                    {/* 最高分 */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <p className="text-sm font-medium text-green-800">最高分</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {statsData.statistics.highest}
                      </p>
                    </div>
                    
                    {/* 及格率 */}
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                      <p className="text-sm font-medium text-yellow-800">及格率</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-2">
                        {statsData.statistics.passRate}%
                      </p>
                    </div>
                    
                    {/* 优秀率 */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <p className="text-sm font-medium text-purple-800">优秀率</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {statsData.statistics.excellentRate}%
                      </p>
                    </div>
                  </div>

                  {/* 分数分布图表 */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">分数分布</h3>
                    <div className="h-64">
                      <canvas ref={distributionChartRef}></canvas>
                    </div>
                  </div>

                  {/* 分析摘要 */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">分析摘要</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>
                        总体表现: 
                        {statsData.statistics.average >= 90 ? '优秀' :
                         statsData.statistics.average >= 80 ? '良好' :
                         statsData.statistics.average >= 70 ? '中等' :
                         statsData.statistics.average >= 60 ? '及格' : '不及格'}
                        （平均分 {statsData.statistics.average}）
                      </li>
                      <li>
                        分数中位数: {statsData.statistics.median}，
                        分数区间: {statsData.statistics.lowest} - {statsData.statistics.highest}
                      </li>
                      <li>
                        及格率: {statsData.statistics.passRate}%，
                        优秀率: {statsData.statistics.excellentRate}%
                      </li>
                      <li>
                        分数分布: 大多数学生成绩集中在
                        {statsData.statistics.distribution
                          .sort((a, b) => b.count - a.count)[0].range} 分数段
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 成绩排名选项卡 */}
              {activeTab === 'rankings' && rankingsData && rankingsData.rankings && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {statsData.course?.name || '课程'} 成绩排名
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            排名
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            学生
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            学号
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            成绩
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            等级
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rankingsData.rankings.map((rank, index) => (
                          <tr key={index} className={rank.studentId === selectedStudent ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`
                                inline-flex items-center justify-center w-6 h-6 rounded-full font-medium text-sm
                                ${rank.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
                                  rank.rank === 2 ? 'bg-gray-200 text-gray-800' : 
                                  rank.rank === 3 ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'}
                              `}>
                                {rank.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {rank.studentName || `学生 ${rank.studentId.substring(0, 6)}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {rank.studentNumber || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {rank.score}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${rank.score >= 90 ? 'bg-green-100 text-green-800' : 
                                  rank.score >= 80 ? 'bg-blue-100 text-blue-800' :
                                  rank.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                  rank.score >= 60 ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'}
                              `}>
                                {rank.score >= 90 ? '优秀' : 
                                 rank.score >= 80 ? '良好' :
                                 rank.score >= 70 ? '中等' :
                                 rank.score >= 60 ? '及格' : '不及格'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 课程对比选项卡 */}
              {activeTab === 'comparison' && comparisonData && comparisonData.courseComparison && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {statsData.student?.name || '学生'} 的各科成绩对比
                  </h2>
                  
                  {/* 课程成绩对比图表 */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="h-64">
                      <canvas ref={comparisonChartRef}></canvas>
                    </div>
                  </div>
                  
                  {/* 课程成绩列表 */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            课程
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            课程代码
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            成绩
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            与平均分比较
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {comparisonData.courseComparison
                          .sort((a, b) => b.average - a.average)
                          .map((course, index) => (
                          <tr key={index} className={course.courseId === selectedCourse ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {course.courseName || `课程 ${course.courseId.substring(0, 6)}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {course.courseCode || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium 
                                ${course.average >= 90 ? 'text-green-600' : 
                                  course.average >= 80 ? 'text-blue-600' :
                                  course.average >= 70 ? 'text-yellow-600' :
                                  course.average >= 60 ? 'text-orange-600' :
                                  'text-red-600'}`
                              }>
                                {course.average}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {statsData.statistics.average ? (
                                <div className="flex items-center text-sm">
                                  <span className={
                                    course.average > statsData.statistics.average ? 'text-green-600' : 
                                    course.average < statsData.statistics.average ? 'text-red-600' : 'text-gray-500'
                                  }>
                                    {course.average > statsData.statistics.average ? '高于' : 
                                     course.average < statsData.statistics.average ? '低于' : '等于'}
                                    平均分
                                    {' '}
                                    {Math.abs(course.average - statsData.statistics.average).toFixed(2)} 分
                                  </span>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">-</div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 详细数据选项卡 */}
              {activeTab === 'details' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">统计详情</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 基本统计 */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">基本统计</h3>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">总记录数</td>
                            <td className="py-2 text-sm text-gray-900">{statsData.total}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">平均分</td>
                            <td className="py-2 text-sm text-gray-900">{statsData.statistics.average}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">中位数</td>
                            <td className="py-2 text-sm text-gray-900">{statsData.statistics.median}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">最高分</td>
                            <td className="py-2 text-sm text-gray-900">{statsData.statistics.highest}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">最低分</td>
                            <td className="py-2 text-sm text-gray-900">{statsData.statistics.lowest}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {/* 及格情况 */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">及格情况</h3>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">及格人数</td>
                            <td className="py-2 text-sm text-gray-900">
                              {Math.round(statsData.total * statsData.statistics.passRate / 100)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">不及格人数</td>
                            <td className="py-2 text-sm text-gray-900">
                              {statsData.total - Math.round(statsData.total * statsData.statistics.passRate / 100)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">及格率</td>
                            <td className="py-2 text-sm text-gray-900">{statsData.statistics.passRate}%</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">优秀人数</td>
                            <td className="py-2 text-sm text-gray-900">
                              {Math.round(statsData.total * statsData.statistics.excellentRate / 100)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">优秀率</td>
                            <td className="py-2 text-sm text-gray-900">{statsData.statistics.excellentRate}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {/* 分数分布详情 */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">分数分布详情</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                分数区间
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                人数
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                占比
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                等级
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {statsData.statistics.distribution.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.range}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {statsData.total > 0 ? ((item.count / statsData.total) * 100).toFixed(2) : 0}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`
                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${
                                      item.range === '90-100' ? 'bg-green-100 text-green-800' : 
                                      item.range === '80-89' ? 'bg-blue-100 text-blue-800' :
                                      item.range === '70-79' ? 'bg-yellow-100 text-yellow-800' :
                                      item.range === '60-69' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    }
                                  `}>
                                    {
                                      item.range === '90-100' ? '优秀' : 
                                      item.range === '80-89' ? '良好' :
                                      item.range === '70-79' ? '中等' :
                                      item.range === '60-69' ? '及格' : '不及格'
                                    }
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
