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
  }, [router.query]);

  useEffect(() => {
    // 获取成绩数据
    fetchGrades();
  }, [filters]);

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

  // 获取成绩列表
  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError('');

      let url = '/api/grades';
      
      // 添加筛选参数
      const queryParams = [];
      
      if (filters.courseId) {
        queryParams.push(`courseId=${encodeURIComponent(filters.courseId)}`);
      }
      
      if (filters.studentId) {
        queryParams.push(`studentId=${encodeURIComponent(filters.studentId)}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setGrades(data.grades);
      } else {
        setError(data.message || '获取成绩列表失败');
      }
    } catch (error) {
      console.error('获取成绩列表错误:', error);
      setError('获取成绩列表时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    
    // 在内存中对成绩数据进行搜索
    if (!searchTerm.trim()) {
      // 如果搜索词为空，重新获取所有成绩
      fetchGrades();
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filteredGrades = grades.filter(grade => 
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
    
    try {
      // 逐个删除选中的成绩
      for (const id of selectedGrades) {
        await fetch(`/api/grades/${id}`, {
          method: 'DELETE',
        });
      }
      
      // 刷新列表
      fetchGrades();
      setSelectedGrades([]);
      alert('选中的成绩记录已成功删除');
    } catch (error) {
      console.error('批量删除成绩错误:', error);
      alert('批量删除成绩时发生错误');
    }
  };

  // 处理单个删除
  const handleDelete = async (id, studentName, courseName) => {
    if (!confirm(`确定要删除 "${studentName}" 的 "${courseName}" 课程成绩吗？`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/grades/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 刷新列表
        fetchGrades();
        alert('成绩已成功删除');
      } else {
        const data = await response.json();
        alert(data.message || '删除成绩失败');
      }
    } catch (error) {
      console.error('删除成绩错误:', error);
      alert('删除成绩时发生错误');
    }
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
