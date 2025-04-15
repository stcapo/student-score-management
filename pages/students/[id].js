import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaUserGraduate, 
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaUniversity,
  FaIdCard
} from 'react-icons/fa';

export default function StudentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState(null);
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
    // 获取学生信息
    if (id) {
      fetchStudentData(id);
    }
  }, [id]);

  // 获取学生详情
  const fetchStudentData = async (studentId) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/students/${studentId}`);
      const data = await response.json();

      if (response.ok) {
        setStudent(data.student);
      } else {
        setError(data.message || '获取学生信息失败');
      }
    } catch (error) {
      console.error('获取学生信息错误:', error);
      setError('获取学生信息时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除学生
  const handleDelete = async () => {
    if (!student) return;
    
    if (!confirm(`确定要删除学生 "${student.name}" 吗？`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('学生已成功删除');
        router.push('/students');
      } else {
        const data = await response.json();
        alert(data.message || '删除学生失败');
      }
    } catch (error) {
      console.error('删除学生错误:', error);
      alert('删除学生时发生错误');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">加载中...</span>
          </div>
          <p className="mt-2">正在加载学生信息...</p>
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
            href="/students"
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FaArrowLeft className="mr-2" />
            返回学生列表
          </Link>
        </div>
      </div>
    );
  }

  if (!student) {
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
              <p className="text-sm text-yellow-700">未找到学生信息</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            href="/students"
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FaArrowLeft className="mr-2" />
            返回学生列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{student.name} - 学生详情 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">学生详情</h1>
          
          <div className="flex space-x-2">
            <Link
              href="/students"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FaArrowLeft className="mr-2" />
              返回列表
            </Link>
            
            {(user?.role === 'admin' || user?.role === 'teacher') && student.status !== 'inactive' && (
              <>
                <Link
                  href={`/students/edit/${student.id}`}
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
          {/* 学生头部信息 */}
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 text-blue-600 text-3xl mb-4 md:mb-0 md:mr-6">
                <FaUserGraduate />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {student.name}
                  {student.status === 'inactive' && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      已删除
                    </span>
                  )}
                </h2>
                <div className="mt-1 flex flex-wrap items-center text-sm text-gray-600">
                  <div className="flex items-center mr-4">
                    <FaIdCard className="mr-1" />
                    <span>学号：{student.studentId}</span>
                  </div>
                  {student.class && (
                    <div className="flex items-center mr-4">
                      <FaUniversity className="mr-1" />
                      <span>班级：{student.class}</span>
                    </div>
                  )}
                  {student.department && (
                    <div className="flex items-center">
                      <FaUniversity className="mr-1" />
                      <span>院系：{student.department}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 学生详细信息 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">个人信息</h3>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                    <FaUserGraduate />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="text-gray-500">性别：</span>
                    <span className="text-gray-900">{student.gender || '未设置'}</span>
                  </div>
                </div>

                {student.birthdate && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FaBirthdayCake />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-500">出生日期：</span>
                      <span className="text-gray-900">{new Date(student.birthdate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">联系方式</h3>
                
                {student.email && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FaEnvelope />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-500">邮箱：</span>
                      <a href={`mailto:${student.email}`} className="text-blue-600 hover:text-blue-800">
                        {student.email}
                      </a>
                    </div>
                  </div>
                )}

                {student.phone && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FaPhone />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-500">电话：</span>
                      <a href={`tel:${student.phone}`} className="text-blue-600 hover:text-blue-800">
                        {student.phone}
                      </a>
                    </div>
                  </div>
                )}

                {student.address && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-500">地址：</span>
                      <span className="text-gray-900">{student.address}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 系统信息 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">系统信息</h3>
              <div className="mt-2 text-xs text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span>创建时间：</span>
                  <span>{new Date(student.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span>最后更新：</span>
                  <span>{new Date(student.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
