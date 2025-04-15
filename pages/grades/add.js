import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function AddGrades() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [gradeEntries, setGradeEntries] = useState([
    { studentId: '', score: '', comment: '' }
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    
    // 获取课程和学生列表
    fetchCourses();
    fetchStudents();
    
    // 检查URL参数
    if (router.query.courseId) {
      setSelectedCourse(router.query.courseId);
    }
  }, [router]);

  // 当课程变更时，更新可用学生列表
  useEffect(() => {
    if (selectedCourse) {
      fetchGradesByCourse(selectedCourse);
    } else {
      setAvailableStudents(students);
    }
  }, [selectedCourse, students]);

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
        
        setCourses(coursesList.filter(course => course.status === 'active'));
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

  // 获取课程已有成绩的学生，以排除已有成绩的学生
  const fetchGradesByCourse = async (courseId) => {
    try {
      const response = await fetch(`/api/grades?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        
        // 获取已有成绩的学生ID
        const gradedStudentIds = data.grades.map(grade => grade.studentId);
        
        // 过滤掉已有成绩的学生
        const availableStudentsList = students.filter(
          student => !gradedStudentIds.includes(student.id)
        );
        
        setAvailableStudents(availableStudentsList);
        
        // 清除已选择的学生
        setGradeEntries([{ studentId: '', score: '', comment: '' }]);
      }
    } catch (error) {
      console.error('获取课程成绩失败:', error);
    }
  };

  // 添加新的成绩输入行
  const addGradeEntry = () => {
    setGradeEntries([...gradeEntries, { studentId: '', score: '', comment: '' }]);
  };

  // 删除成绩输入行
  const removeGradeEntry = (index) => {
    const newEntries = [...gradeEntries];
    newEntries.splice(index, 1);
    setGradeEntries(newEntries);
  };

  // 处理成绩输入变更
  const handleGradeChange = (index, field, value) => {
    const newEntries = [...gradeEntries];
    newEntries[index][field] = value;
    setGradeEntries(newEntries);
  };

  // 验证表单
  const validateForm = () => {
    // 验证是否选择了课程
    if (!selectedCourse) {
      setError('请选择课程');
      return false;
    }
    
    // 验证每个成绩条目
    for (let i = 0; i < gradeEntries.length; i++) {
      const entry = gradeEntries[i];
      
      // 验证是否选择了学生
      if (!entry.studentId) {
        setError(`第 ${i + 1} 行: 请选择学生`);
        return false;
      }
      
      // 验证成绩是否为有效数字
      if (!entry.score || isNaN(parseFloat(entry.score)) || parseFloat(entry.score) < 0 || parseFloat(entry.score) > 100) {
        setError(`第 ${i + 1} 行: 成绩必须是0-100之间的数字`);
        return false;
      }
      
      // 验证是否有重复的学生
      const studentIds = gradeEntries.map(e => e.studentId);
      if (studentIds.filter(id => id === entry.studentId).length > 1) {
        setError(`存在重复的学生，每个学生只能录入一次成绩`);
        return false;
      }
    }
    
    return true;
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
      
      // 准备成绩数据
      const gradesData = gradeEntries.map(entry => ({
        courseId: selectedCourse,
        studentId: entry.studentId,
        score: entry.score,
        comment: entry.comment || ''
      }));
      
      // 发送请求
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grades: gradesData }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('成绩录入成功！');
        router.push('/grades');
      } else {
        setError(data.message || '成绩录入失败');
      }
    } catch (error) {
      console.error('成绩录入错误:', error);
      setError('成绩录入过程中发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>录入成绩 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">录入成绩</h1>
          
          <Link
            href="/grades"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            返回成绩列表
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 选择课程 */}
            <div className="mb-6">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                选择课程 <span className="text-red-500">*</span>
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="form-input"
                required
              >
                <option value="">--请选择课程--</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                请先选择要录入成绩的课程
              </p>
            </div>

            {/* 高级选项切换 */}
            <button
              type="button"
              className="flex items-center text-sm text-blue-600 mb-4"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
              {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
            </button>

            {/* 高级选项 */}
            {showAdvanced && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">批量操作</h3>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    onClick={() => {
                      // 将所有可用学生添加到成绩列表中
                      if (availableStudents.length > 0) {
                        const newEntries = availableStudents.map(student => ({
                          studentId: student.id,
                          score: '',
                          comment: ''
                        }));
                        setGradeEntries(newEntries);
                      }
                    }}
                  >
                    添加所有可用学生
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    onClick={() => {
                      // 设置所有成绩为相同值
                      const scoreValue = prompt('请输入要设置的成绩值:');
                      if (scoreValue !== null) {
                        const score = parseFloat(scoreValue);
                        if (!isNaN(score) && score >= 0 && score <= 100) {
                          const newEntries = [...gradeEntries].map(entry => ({
                            ...entry,
                            score: score.toString()
                          }));
                          setGradeEntries(newEntries);
                        } else {
                          alert('请输入0-100之间的有效数字');
                        }
                      }
                    }}
                  >
                    批量设置成绩
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    onClick={() => setGradeEntries([{ studentId: '', score: '', comment: '' }])}
                  >
                    清空列表
                  </button>
                </div>
              </div>
            )}

            {/* 成绩录入表格 */}
            {selectedCourse && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-700">成绩信息</h3>
                  <button
                    type="button"
                    onClick={addGradeEntry}
                    className="flex items-center text-sm text-blue-600"
                  >
                    <FaPlus className="mr-1" />
                    添加一行
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          学生 <span className="text-red-500">*</span>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          成绩 <span className="text-red-500">*</span>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          评语
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gradeEntries.map((entry, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={entry.studentId}
                              onChange={(e) => handleGradeChange(index, 'studentId', e.target.value)}
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              required
                            >
                              <option value="">--选择学生--</option>
                              {availableStudents.map(student => (
                                <option 
                                  key={student.id} 
                                  value={student.id}
                                  disabled={gradeEntries.some((e, i) => i !== index && e.studentId === student.id)}
                                >
                                  {student.name} ({student.studentId})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={entry.score}
                              onChange={(e) => handleGradeChange(index, 'score', e.target.value)}
                              className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              required
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={entry.comment}
                              onChange={(e) => handleGradeChange(index, 'comment', e.target.value)}
                              className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              placeholder="可选"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {gradeEntries.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeGradeEntry(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 按钮组 */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href="/grades"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <FaTimes className="mr-2" />
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !selectedCourse}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
