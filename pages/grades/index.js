import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBook, 
  FaUserGraduate, 
  FaSortAlphaDown, 
  FaSortAlphaUp,
  FaChartBar,
  FaDownload,
  FaFilter
} from 'react-icons/fa';

export default function GradesList() {
  const router = useRouter();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    courseId: '',
    studentId: ''
  });

  // 硬编码的成绩数据
  const hardcodedGrades = [
    {
      id: "grade-001",
      studentId: "student-001",
      studentName: "张三",
      studentNumber: "20230001",
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
      studentId: "student-002",
      studentName: "李四",
      studentNumber: "20230002",
      courseId: "course-001",
      courseName: "数据结构与算法",
      courseCode: "CS201",
      score: "92",
      comment: "出色的作业和考试表现",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-003",
      studentId: "student-003",
      studentName: "王五",
      studentNumber: "20230003",
      courseId: "course-001",
      courseName: "数据结构与算法",
      courseCode: "CS201",
      score: "78",
      comment: "基本掌握了课程内容，但复杂算法理解有待加强",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-004",
      studentId: "student-001",
      studentName: "张三",
      studentNumber: "20230001",
      courseId: "course-002",
      courseName: "高等数学",
      courseCode: "MA101",
      score: "85",
      comment: "数学基础扎实，解题思路清晰",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-005",
      studentId: "student-002",
      studentName: "李四",
      studentNumber: "20230002",
      courseId: "course-002",
      courseName: "高等数学",
      courseCode: "MA101",
      score: "80",
      comment: "基本掌握数学概念，但在复杂应用上有一定困难",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-006",
      studentId: "student-001",
      studentName: "张三",
      studentNumber: "20230001",
      courseId: "course-003",
      courseName: "计算机网络",
      courseCode: "CS301",
      score: "91",
      comment: "对网络协议理解深入，实验表现优秀",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-007",
      studentId: "student-003",
      studentName: "王五",
      studentNumber: "20230003",
      courseId: "course-003",
      courseName: "计算机网络",
      courseCode: "CS301",
      score: "76",
      comment: "基本掌握网络概念，但在网络安全方面有所欠缺",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-008",
      studentId: "student-002",
      studentName: "李四",
      studentNumber: "20230002",
      courseId: "course-004",
      courseName: "软件工程",
      courseCode: "CS401",
      score: "88",
      comment: "团队合作能力强，项目管理有条理",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-009",
      studentId: "student-003",
      studentName: "王五",
      studentNumber: "20230003",
      courseId: "course-004",
      courseName: "软件工程",
      courseCode: "CS401",
      score: "85",
      comment: "项目完成度高，文档编写清晰",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-010",
      studentId: "student-001",
      studentName: "张三",
      studentNumber: "20230001",
      courseId: "course-005",
      courseName: "数据库原理",
      courseCode: "CS302",
      score: "87",
      comment: "数据库设计合理，SQL掌握良好",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-011",
      studentId: "student-004",
      studentName: "赵六",
      studentNumber: "20230004",
      courseId: "course-001",
      courseName: "数据结构与算法",
      courseCode: "CS201",
      score: "65",
      comment: "对基本数据结构有一定理解，但算法分析能力较弱",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-012",
      studentId: "student-005",
      studentName: "钱七",
      studentNumber: "20230005",
      courseId: "course-001",
      courseName: "数据结构与算法",
      courseCode: "CS201",
      score: "95",
      comment: "对算法有深刻理解，作业完成度高且效率优秀",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-013",
      studentId: "student-003",
      studentName: "王五",
      studentNumber: "20230003",
      courseId: "course-002",
      courseName: "高等数学",
      courseCode: "MA101",
      score: "72",
      comment: "理解数学基本概念，但推导能力有待提高",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-014",
      studentId: "student-004",
      studentName: "赵六",
      studentNumber: "20230004",
      courseId: "course-002",
      courseName: "高等数学",
      courseCode: "MA101",
      score: "58",
      comment: "数学基础较弱，建议加强练习",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-015",
      studentId: "student-002",
      studentName: "李四",
      studentNumber: "20230002",
      courseId: "course-003",
      courseName: "计算机网络",
      courseCode: "CS301",
      score: "89",
      comment: "网络协议理解透彻，实验报告编写详细",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-016",
      studentId: "student-004",
      studentName: "赵六",
      studentNumber: "20230004",
      courseId: "course-003",
      courseName: "计算机网络",
      courseCode: "CS301",
      score: "81",
      comment: "掌握基本网络概念，实验操作熟练",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-017",
      studentId: "student-001",
      studentName: "张三",
      studentNumber: "20230001",
      courseId: "course-006",
      courseName: "操作系统",
      courseCode: "CS303",
      score: "90",
      comment: "进程管理和内存管理理解深入，实验报告详尽",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-018",
      studentId: "student-002",
      studentName: "李四",
      studentNumber: "20230002",
      courseId: "course-006",
      courseName: "操作系统",
      courseCode: "CS303",
      score: "83",
      comment: "系统调用和文件系统理解良好，实验能力强",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-019",
      studentId: "student-005",
      studentName: "钱七",
      studentNumber: "20230005",
      courseId: "course-008",
      courseName: "人工智能导论",
      courseCode: "CS402",
      score: "92",
      comment: "对机器学习算法理解深入，项目实现创新",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "grade-020",
      studentId: "student-003",
      studentName: "王五",
      studentNumber: "20230003",
      courseId: "course-009",
      courseName: "编译原理",
      courseCode: "CS403",
      score: "79",
      comment: "词法分析和语法分析掌握良好，但代码生成有待提高",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z"
    }
  ];

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 获取课程列表
    fetchCourses();
    
    // 如果不是学生，获取学生列表
    if (JSON.parse(userData)?.role !== 'student') {
      fetchStudents();
    }
    
    // 检查URL查询参数
    if (router.query.courseId) {
      setFilters(prev => ({
        ...prev,
        courseId: router.query.courseId
      }));
    }
    
    if (router.query.studentId) {
      setFilters(prev => ({
        ...prev,
        studentId: router.query.studentId
      }));
    }
    
    // 使用硬编码的成绩数据
    setGrades(hardcodedGrades);
    setLoading(false);
  }, [router.query]);

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

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
    }
  };

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    
    // 在内存中对成绩数据进行搜索
    if (!searchTerm.trim()) {
      // 如果搜索词为空，恢复所有成绩
      setGrades(hardcodedGrades);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filteredGrades = hardcodedGrades.filter(grade => 
      (grade.studentName && grade.studentName.toLowerCase().includes(term)) ||
      (grade.studentNumber && grade.studentNumber.toLowerCase().includes(term)) ||
      (grade.courseName && grade.courseName.toLowerCase().includes(term)) ||
      (grade.courseCode && grade.courseCode.toLowerCase().includes(term))
    );
    
    setGrades(filteredGrades);
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

  // 处理筛选变更
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 应用筛选器到硬编码数据
    let filteredGrades = [...hardcodedGrades];
    
    // 如果有课程筛选
    if (name === 'courseId' && value) {
      filteredGrades = filteredGrades.filter(grade => grade.courseId === value);
    } else if (filters.courseId) {
      filteredGrades = filteredGrades.filter(grade => grade.courseId === filters.courseId);
    }
    
    // 如果有学生筛选
    if (name === 'studentId' && value) {
      filteredGrades = filteredGrades.filter(grade => grade.studentId === value);
    } else if (filters.studentId && name !== 'studentId') {
      filteredGrades = filteredGrades.filter(grade => grade.studentId === filters.studentId);
    }
    
    setGrades(filteredGrades);
  };

  // 排序成绩列表
  const sortedGrades = [...grades].sort((a, b) => {
    let valueA, valueB;
    
    if (sortField === 'score') {
      valueA = parseFloat(a[sortField]) || 0;
      valueB = parseFloat(b[sortField]) || 0;
    } else {
      valueA = a[sortField] || '';
      valueB = b[sortField] || '';
      
      // 字符串比较
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
      }
      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase();
      }
    }
    
    // 排序方向
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // 处理成绩选择
  const handleSelectGrade = (id) => {
    if (selectedGrades.includes(id)) {
      setSelectedGrades(selectedGrades.filter(gradeId => gradeId !== id));
    } else {
      setSelectedGrades([...selectedGrades, id]);
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedGrades.length === sortedGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades(sortedGrades.map(grade => grade.id));
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedGrades.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedGrades.length} 条成绩记录吗？`)) {
      return;
    }
    
    // 模拟删除操作
    const updatedGrades = grades.filter(grade => !selectedGrades.includes(grade.id));
    setGrades(updatedGrades);
    setSelectedGrades([]);
    alert('选中的成绩记录已成功删除');
  };

  // 处理单个删除
  const handleDelete = async (id, studentName, courseName) => {
    if (!confirm(`确定要删除 "${studentName}" 的 "${courseName}" 课程成绩吗？`)) {
      return;
    }
    
    // 模拟删除操作
    const updatedGrades = grades.filter(grade => grade.id !== id);
    setGrades(updatedGrades);
    alert('成绩已成功删除');
  };

  // 导出成绩为CSV
  const exportToCSV = () => {
    if (grades.length === 0) {
      alert('没有成绩数据可导出');
      return;
    }
    
    // 创建CSV内容
    const headers = ['学号', '学生姓名', '课程代码', '课程名称', '成绩', '评语', '更新时间'];
    
    const csvRows = [
      headers.join(','),
      ...sortedGrades.map(grade => [
        grade.studentNumber,
        grade.studentName,
        grade.courseCode,
        grade.courseName,
        grade.score,
        grade.comment ? `"${grade.comment.replace(/"/g, '""')}"` : '',
        new Date(grade.updatedAt).toLocaleString()
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // 创建Blob并导出
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 设置文件名
    const fileName = filters.courseId
      ? `${courses.find(c => c.id === filters.courseId)?.name || 'course'}_grades.csv`
      : filters.studentId
        ? `${students.find(s => s.id === filters.studentId)?.name || 'student'}_grades.csv`
        : 'grades_export.csv';
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Head>
        <title>成绩管理 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">成绩管理</h1>
          
          <div className="flex space-x-2">
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <Link 
                href="/grades/add" 
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <FaPlus className="mr-2" />
                录入成绩
              </Link>
            )}
            
            <Link 
              href="/grades/analysis" 
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <FaChartBar className="mr-2" />
              成绩分析
            </Link>
          </div>
        </div>

        {/* 搜索和筛选工具栏 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col space-y-4">
            {/* 筛选工具栏 */}
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex items-center">
                <FaFilter className="text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">筛选：</span>
              </div>
              
              {/* 课程筛选 */}
              <div className="flex-grow md:flex-grow-0 md:w-1/3">
                <select
                  name="courseId"
                  value={filters.courseId}
                  onChange={handleFilterChange}
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
                  <select
                    name="studentId"
                    value={filters.studentId}
                    onChange={handleFilterChange}
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
              
              {/* 导出按钮 */}
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                <FaDownload className="mr-2" />
                导出成绩
              </button>
              
              {/* 批量操作按钮 */}
              {selectedGrades.length > 0 && user?.role !== 'student' && (
                <button
                  onClick={handleBatchDelete}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <FaTrash className="mr-2" />
                  删除所选({selectedGrades.length})
                </button>
              )}
            </div>
            
            {/* 搜索表单 */}
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="搜索学生姓名、学号或课程名称"
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
          </div>
        </div>

        {/* 成绩列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">加载中...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : grades.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              未找到成绩记录
              {filters.courseId && courses.find(c => c.id === filters.courseId) ? 
                ` (课程: "${courses.find(c => c.id === filters.courseId).name}")` : ''}
              {filters.studentId && students.find(s => s.id === filters.studentId) ? 
                ` (学生: "${students.find(s => s.id === filters.studentId).name}")` : ''}
              {searchTerm ? ` (搜索: "${searchTerm}")` : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {user?.role !== 'student' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedGrades.length === sortedGrades.length && sortedGrades.length > 0}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                    )}
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('studentName')}
                    >
                      <div className="flex items-center">
                        学生
                        {sortField === 'studentName' && (
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
                        课程
                        {sortField === 'courseName' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center">
                        成绩
                        {sortField === 'score' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      评语
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('updatedAt')}
                    >
                      <div className="flex items-center">
                        更新时间
                        {sortField === 'updatedAt' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    {user?.role !== 'student' && (
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedGrades.map((grade) => (
                    <tr key={grade.id}>
                      {user?.role !== 'student' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedGrades.includes(grade.id)}
                            onChange={() => handleSelectGrade(grade.id)}
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
                            <FaUserGraduate />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {grade.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {grade.studentNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-500">
                            <FaBook />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {grade.courseName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {grade.courseCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${parseFloat(grade.score) >= 90 ? 'bg-green-100 text-green-800' : 
                            parseFloat(grade.score) >= 80 ? 'bg-blue-100 text-blue-800' :
                              parseFloat(grade.score) >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                parseFloat(grade.score) >= 60 ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                          }`}
                        >
                          {grade.score}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {grade.comment || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(grade.updatedAt).toLocaleString()}
                      </td>
                      {user?.role !== 'student' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/grades/edit/${grade.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="编辑成绩"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDelete(grade.id, grade.studentName, grade.courseName)}
                              className="text-red-600 hover:text-red-900"
                              title="删除成绩"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
