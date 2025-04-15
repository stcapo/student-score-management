import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaUserGraduate, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';

export default function StudentList() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('active');

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 获取学生数据
    fetchStudents();
  }, [filterStatus]);

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      let url = '/api/students';
      if (searchTerm) {
        url += `?query=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // 根据状态筛选
        let filteredStudents = data.students;
        if (filterStatus !== 'all') {
          filteredStudents = data.students.filter(student => student.status === filterStatus);
        }
        
        setStudents(filteredStudents);
      } else {
        setError(data.message || '获取学生列表失败');
      }
    } catch (error) {
      console.error('获取学生列表错误:', error);
      setError('获取学生列表时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
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

  // 排序学生列表
  const sortedStudents = [...students].sort((a, b) => {
    let valueA = a[sortField] || '';
    let valueB = b[sortField] || '';
    
    // 字符串比较
    if (typeof valueA === 'string') {
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

  // 处理学生选择
  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(studentId => studentId !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedStudents.length === sortedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(sortedStudents.map(student => student.id));
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedStudents.length} 名学生吗？`)) {
      return;
    }
    
    try {
      // 逐个删除选中的学生
      for (const id of selectedStudents) {
        await fetch(`/api/students/${id}`, {
          method: 'DELETE',
        });
      }
      
      // 刷新列表
      fetchStudents();
      setSelectedStudents([]);
      alert('选中的学生已成功删除');
    } catch (error) {
      console.error('批量删除学生错误:', error);
      alert('批量删除学生时发生错误');
    }
  };

  // 处理单个删除
  const handleDelete = async (id, name) => {
    if (!confirm(`确定要删除学生 "${name}" 吗？`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 刷新列表
        fetchStudents();
        alert('学生已成功删除');
      } else {
        const data = await response.json();
        alert(data.message || '删除学生失败');
      }
    } catch (error) {
      console.error('删除学生错误:', error);
      alert('删除学生时发生错误');
    }
  };

  return (
    <>
      <Head>
        <title>学生管理 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">学生管理</h1>
          
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <Link 
              href="/students/add" 
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FaPlus className="mr-2" />
              添加学生
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
                  placeholder="搜索学生（姓名、学号或班级）"
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
                <option value="active">在读</option>
                <option value="inactive">已删除</option>
                <option value="all">全部</option>
              </select>

              {/* 批量操作按钮 */}
              {selectedStudents.length > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <FaTrash className="mr-2" />
                  删除所选({selectedStudents.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 学生列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">加载中...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : students.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              未找到学生记录{searchTerm ? `（搜索: "${searchTerm}"）` : ''}
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
                          checked={selectedStudents.length === sortedStudents.length && sortedStudents.length > 0}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('studentId')}
                    >
                      <div className="flex items-center">
                        学号
                        {sortField === 'studentId' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        姓名
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('gender')}
                    >
                      <div className="flex items-center">
                        性别
                        {sortField === 'gender' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('class')}
                    >
                      <div className="flex items-center">
                        班级
                        {sortField === 'class' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('department')}
                    >
                      <div className="flex items-center">
                        院系
                        {sortField === 'department' && (
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
                  {sortedStudents.map((student) => (
                    <tr key={student.id} className={student.status === 'inactive' ? 'bg-gray-100' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
                            <FaUserGraduate />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                          {student.status === 'inactive' && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              已删除
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.class}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/students/${student.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="查看学生详情"
                          >
                            <FaEye />
                          </Link>
                          {(user?.role === 'admin' || user?.role === 'teacher') && student.status !== 'inactive' && (
                            <>
                              <Link
                                href={`/students/edit/${student.id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="编辑学生信息"
                              >
                                <FaEdit />
                              </Link>
                              <button
                                onClick={() => handleDelete(student.id, student.name)}
                                className="text-red-600 hover:text-red-900"
                                title="删除学生"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
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
