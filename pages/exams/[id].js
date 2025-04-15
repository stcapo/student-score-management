import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaArrowLeft, FaEdit, FaFilePdf, FaListAlt } from 'react-icons/fa';

export default function ExamDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 获取考试数据
    if (id) {
      fetchExam();
    }
  }, [id]);

  // 获取考试详情
  const fetchExam = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/exams/${id}`);
      const data = await response.json();

      if (response.ok) {
        setExam(data.exam);
      } else {
        setError(data.message || '获取考试详情失败');
      }
    } catch (error) {
      console.error('获取考试详情错误:', error);
      setError('获取考试详情时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  // 计算考试结束时间
  const calculateEndTime = (startTime, durationMinutes) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // 判断考试状态
  const getExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    
    if (examDate > now) {
      return { label: '未开始', className: 'bg-blue-100 text-blue-800' };
    } else {
      const endTime = new Date(examDate.getTime() + exam.duration * 60000);
      if (now >= examDate && now <= endTime) {
        return { label: '进行中', className: 'bg-green-100 text-green-800' };
      } else {
        return { label: '已结束', className: 'bg-gray-100 text-gray-800' };
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-10">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-10 text-red-500">{error}</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-10 text-gray-500">未找到考试信息</div>
      </div>
    );
  }

  const status = getExamStatus(exam);

  return (
    <>
      <Head>
        <title>{exam.title} - 考试详情 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            考试详情
            <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
              {status.label}
            </span>
          </h1>
          
          <div className="flex items-center space-x-2">
            <Link
              href="/exams"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="mr-2" />
              返回考试列表
            </Link>
            
            {(user?.role === 'admin' || (user?.role === 'teacher' && user?.id === exam.creatorId)) && new Date(exam.date) > new Date() && (
              <Link
                href={`/exams/edit/${exam.id}`}
                className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
              >
                <FaEdit className="mr-2" />
                编辑考试
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 考试基本信息 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 mr-4">
                <FaFilePdf size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{exam.title}</h2>
                <p className="text-gray-500">{exam.examType === 'final' ? '期末考试' : 
                  exam.examType === 'midterm' ? '期中考试' : 
                  exam.examType === 'quiz' ? '测验' : 
                  exam.examType === 'makeup' ? '补考' : '其他'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">关联课程</h3>
                <p className="text-lg">{exam.courseName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">考试日期</h3>
                <p className="text-lg">{formatDateTime(exam.date)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">考试时间</h3>
                <p className="text-lg">
                  {new Date(exam.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                  {calculateEndTime(exam.date, exam.duration)}
                  （{exam.duration}分钟）
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">考试地点</h3>
                <p className="text-lg">{exam.location}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">总分/及格分</h3>
                <p className="text-lg">{exam.totalScore}分 / {exam.passingScore}分</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">创建者</h3>
                <p className="text-lg">{exam.creatorName || '未知'}</p>
              </div>
            </div>
            
            {exam.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">考试描述</h3>
                <p className="text-gray-700 whitespace-pre-line">{exam.description}</p>
              </div>
            )}
          </div>

          {/* 考试操作区域 */}
          <div className="bg-gray-50 p-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <Link
                  href={`/grades/exams/${exam.id}`}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                >
                  <FaListAlt className="mr-2" />
                  查看/录入成绩
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
