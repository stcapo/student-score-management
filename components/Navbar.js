import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBars, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar({ user, toggleSidebar }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    // 模拟获取通知
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('获取通知失败:', error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const unreadNotifications = notifications.filter(notification => !notification.read);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            学生成绩管理系统
          </span>
        </div>

        {user && (
          <div className="flex items-center">
            {/* 通知图标 */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FaBell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* 通知菜单 */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <div className="py-2 px-4 bg-gray-100 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">通知</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <Link
                          href={notification.link || '#'}
                          key={index}
                          className={`block px-4 py-3 border-b border-gray-200 hover:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        暂无通知
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <Link
                      href="/notifications"
                      className="block py-2 text-sm font-medium text-center text-gray-700 bg-gray-50 hover:bg-gray-100"
                    >
                      查看所有通知
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* 用户菜单 */}
            <div className="relative ml-3" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span className="mr-2">{user.name || user.username}</span>
                <FaUser className="w-5 h-5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      个人信息
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-2 w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
