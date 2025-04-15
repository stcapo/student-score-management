import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

export default function EditGrade() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [grade, setGrade] = useState(null);
  const [scoreInput, setScoreInput] = useState('');
  const [commentInput, setCommentInput] = useState('');

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
  }, [router]);

  useEffect(() => {
    // 获取成绩信息
    if (id) {
      fetchGradeData(id);
    }
  }, [id]);

  // 获取成绩详情
  const fetchGradeData = async (gradeId) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/grades/${gradeId}`);
      const data = await response.json();

      if (response.ok) {
        setGrade(data.grade);
        setScoreInput(data.grade.score);
        setCommentInput(data.grade.comment || '');
      } else {
        setError(data.message || '获取成绩信息失败');
      }
    } catch (error) {
      console.error('获取成绩信息错误:', error);
      setError('获取成绩信息时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证成绩
    if (!scoreInput || isNaN(parseFloat(scoreInput)) || parseFloat(scoreInput) < 0 || parseFloat(scoreInput) > 100) {
      setError('成绩必须是0-100之间的数字');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/grades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: scoreInput,
          comment: commentInput
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('成绩更新成功！');
        router.push('/grades');
      } else {
        setError(data.message || '更新成绩失败');
      }
    } catch (error) {
      console.error('更新成绩错误:', error);
      setError('更新成绩时发生错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">加载中...</span>
          </div>
          <p className="mt-2">正在加载成绩信息...</p>
        </div>
      </div>
    );
  }

  if (!grade) {
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
              <p className="text-sm text-red-700">{error || '未找到成绩信息'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            href="/grades"
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FaArrowLeft className="mr-2" />
            返回成绩列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>编辑成绩 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">编辑成绩</h1>
          
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

          {/* 基本信息显示 */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-2">成绩信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">学生姓名</p>
                <p className="text-base font-medium">{grade.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">学号</p>
                <p className="text-base">{grade.studentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">课程名称</p>
                <p className="text-base font-medium">{grade.courseName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">课程代码</p>
                <p className="text-base">{grade.courseCode}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* 成绩 */}
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                  成绩 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="score"
                  min="0"
                  max="100"
                  step="0.1"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className="form-input"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  请输入0-100之间的数字
                </p>
              </div>

              {/* 评语 */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  评语
                </label>
                <textarea
                  id="comment"
                  rows="3"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="form-input"
                  placeholder="可选"
                ></textarea>
              </div>
            </div>

            {/* 系统信息 */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                最后更新时间: {new Date(grade.updatedAt).toLocaleString()}
              </p>
            </div>

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
                disabled={submitting}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSave className="mr-2" />
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
