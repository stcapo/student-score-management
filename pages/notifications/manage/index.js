import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaBell, FaSortAlphaDown, FaSortAlphaUp, FaUser } from 'react-icons/fa';

export default function NotificationManagement() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // 检查管理员权限
      if (parsedUser.role !== 'admin') {
        alert('您没有权限访问此页面');
        router.push('/');
      }
    } else {
      router.push('/login');
    }

    // 获取通知数据
    fetchNotifications();
  }, [filterType, router]);

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

      let url = '/api/notifications?admin=true';
      if (searchTerm) {
        url += `&query=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        let filteredNotifications = data.notifications;
        
        // 根据类型筛选
        if (filterType !== 'all') {
          filteredNotifications = data.notifications.filter(notification => notification.type === filterType);
        }
        
        setNotifications(filteredNotifications);
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

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotifications();
  };

  // 处理排序
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 排序通知列表
  const sortedNotifications = [...notifications].sort((a, b) => {
    let valueA = a[sortField] || '';
    let valueB = b[sortField] || '';
    
    // 日期特殊处理
    if (sortField === 'createdAt' || sortField === 'updatedAt' || sortField === 'expireAt') {
      valueA = new Date(valueA || '2099-12-31');
      valueB = new Date(valueB || '2099-12-31');
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

  // 处理通知选择
  const handleSelectNotification = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(notificationId => notificationId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedNotifications.length === sortedNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(sortedNotifications.map(notification => notification.id));
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedNotifications.length} 条通知吗？`)) {
      return;
    }
    
    try {
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // 逐个删除选中的通知
      for (const id of selectedNotifications) {
        await fetch(`/api/notifications?id=${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // 刷新列表
      fetchNotifications();
      setSelectedNotifications([]);
      alert('选中的通知已成功删除');
    } catch (error) {
      console.error('批量删除通知错误:', error);
      alert('批量删除通知时发生错误');
    }
  };

  // 处理单个删除
  const handleDelete = async (id, title) => {
    if (!confirm(`确定要删除通知 "${title}" 吗？`)) {
      return;
    }
    
    try {
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // 刷新列表
        fetchNotifications();
        alert('通知已成功删除');
      } else {
        const data = await response.json();
        alert(data.message || '删除通知失败');
      }
    } catch (error) {
      console.error('删除通知错误:', error);
      alert('删除通知时发生错误');
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateString) => {
    if (!dateString) return '无';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // 获取通知类型文本
  const getNotificationType = (type) => {
    switch (type) {
      case 'public':
        return '公共通知';
      case 'role':
        return '角色通知';
      case 'personal':
        return '个人通知';
      default:
        return type;
    }
  };

  // 获取通知优先级文本和样式
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { text: '高', className: 'bg-red-100 text-red-800' };
      case 'normal':
        return { text: '中', className: 'bg-blue-100 text-blue-800' };
      case 'low':
        return { text: '低', className: 'bg-gray-100 text-gray-800' };
      default:
        return { text: priority, className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <>
      <Head>
        <title>通知管理 - 学生成绩管理系统</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">通知管理</h1>
          
          <Link 
            href="/notifications/manage/add" 
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FaPlus className="mr-2" />
            发布通知
          </Link>
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
                  placeholder="搜索通知（标题或内容）"
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
              <label className="text-sm font-medium text-gray-700">类型筛选：</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">全部</option>
                <option value="public">公共通知</option>
                <option value="role">角色通知</option>
                <option value="personal">个人通知</option>
              </select>

              {/* 批量操作按钮 */}
              {selectedNotifications.length > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <FaTrash className="mr-2" />
                  删除所选({selectedNotifications.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">加载中...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              未找到通知记录{searchTerm ? `（搜索: "${searchTerm}"）` : ''}
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
                          checked={selectedNotifications.length === sortedNotifications.length && sortedNotifications.length > 0}
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
                        标题
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center">
                        类型
                        {sortField === 'type' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('priority')}
                    >
                      <div className="flex items-center">
                        优先级
                        {sortField === 'priority' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        发布时间
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('expireAt')}
                    >
                      <div className="flex items-center">
                        过期时间
                        {sortField === 'expireAt' && (
                          sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      接收对象
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedNotifications.map((notification) => {
                    const priorityInfo = getPriorityInfo(notification.priority);
                    return (
                      <tr key={notification.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
                              <FaBell />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getNotificationType(notification.type)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityInfo.className}`}>
                            {priorityInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(notification.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(notification.expireAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {notification.type === 'public' ? '所有用户' : 
                             notification.targetRole ? `${notification.targetRole === 'student' ? '学生' : '教师'}` : 
                             notification.targetUserId ? '特定用户' : '未指定'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/notifications/manage/edit/${notification.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="编辑通知"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDelete(notification.id, notification.title)}
                              className="text-red-600 hover:text-red-900"
                              title="删除通知"
                            >
                              <FaTrash />
                            </button>
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
