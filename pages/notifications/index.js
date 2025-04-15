import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaBell, FaSearch, FaClock, FaCalendarAlt, FaExclamationCircle, FaUser, FaTag } from 'react-icons/fa';

export default function MyNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }

    // 获取通知数据
    fetchNotifications();
  }, [router]);

  // 获取通知列表
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications);
        setFilteredNotifications(data.notifications);
      } else {
        setError(data.message || '获取通知列表失败');
      }
    } catch (error) {
      console.error('获取通知列表错误:', error);
      setError('获取通知列表时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 过滤通知
  useEffect(() => {
    let filtered = notifications;
    
    // 根据搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        notification => 
          notification.title.toLowerCase().includes(term) || 
          notification.content.toLowerCase().includes(term)
      );
    }
    
    // 根据优先级过滤
    if (filterPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === filterPriority);
    }
    
    setFilteredNotifications(filtered);
  }, [searchTerm, filterPriority, notifications]);

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    // 搜索逻辑在useEffect中实现
  };

  // 格式化日期时间
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // 计算时间差
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}秒前`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}小时前`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}天前`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}月前`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}年前`;
  };

  // 获取通知类型文本和图标
  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case 'public':
        return { text: '公告', icon: <FaBell className="text-blue-500" /> };
      case 'role':
        return { text: '角色通知', icon: <FaTag className="text-green-500" /> };
      case 'personal':
        return { text: '个人通知', icon: <FaUser className="text-purple-500" /> };
      default:
        return { text: type, icon: <FaBell className="text-gray-500" /> };
    }
  };

  // 获取优先级样式
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'normal':
        return 'border-blue-500 bg-blue-50';
      case 'low':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <>
      <Head>
        <title>我的通知 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">我的通知</h1>

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
                  placeholder="搜索通知"
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
              <label className="text-sm font-medium text-gray-700">优先级筛选：</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">全部</option>
                <option value="high">高</option>
                <option value="normal">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-6 text-center">加载中...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-lg shadow-md">
              <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">暂无通知</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? `没有找到包含"${searchTerm}"的通知` : '您目前没有任何通知'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const typeInfo = getNotificationTypeInfo(notification.type);
              const priorityStyle = getPriorityStyle(notification.priority);
              return (
                <div 
                  key={notification.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${priorityStyle}`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {typeInfo.icon}
                        <span className="text-sm text-gray-500 ml-2">{typeInfo.text}</span>
                        {notification.priority === 'high' && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            重要
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaClock className="mr-1" />
                        {getTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                    
                    <h3 className="mt-2 text-lg font-medium text-gray-900">{notification.title}</h3>
                    <div className="mt-3 text-sm text-gray-600 whitespace-pre-line">{notification.content}</div>
                    
                    <div className="mt-4 flex items-center text-xs text-gray-500">
                      <div className="flex items-center mr-4">
                        <FaCalendarAlt className="mr-1" />
                        发布于: {formatDateTime(notification.createdAt)}
                      </div>
                      {notification.expireAt && (
                        <div className="flex items-center">
                          <FaClock className="mr-1" />
                          过期于: {formatDateTime(notification.expireAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
