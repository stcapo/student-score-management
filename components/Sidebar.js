import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FaTachometerAlt, 
  FaUserGraduate, 
  FaBook, 
  FaChartBar, 
  FaClipboardList,
  FaBullhorn,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaTimes
} from 'react-icons/fa';

export default function Sidebar({ user, isOpen, toggleSidebar }) {
  const router = useRouter();

  if (!user) return null;

  const isActive = (path) => {
    return router.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-700 hover:text-white';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // 根据用户角色定义不同的菜单项
  const menuItems = [];
  
  // 所有用户都有的菜单项
  menuItems.push(
    { 
      path: '/', 
      name: '控制面板', 
      icon: <FaTachometerAlt className="w-5 h-5" /> 
    }
  );
  
  // 管理员和教师菜单项
  if (user.role === 'admin' || user.role === 'teacher') {
    menuItems.push(
      { 
        path: '/students', 
        name: '学生管理', 
        icon: <FaUserGraduate className="w-5 h-5" /> 
      },
      { 
        path: '/courses', 
        name: '课程管理', 
        icon: <FaBook className="w-5 h-5" /> 
      },
      { 
        path: '/grades', 
        name: '成绩管理', 
        icon: <FaChartBar className="w-5 h-5" /> 
      },
      { 
        path: '/exams', 
        name: '考试管理', 
        icon: <FaClipboardList className="w-5 h-5" /> 
      }
    );
    
    // 仅管理员可见
    if (user.role === 'admin') {
      menuItems.push(
        { 
          path: '/notifications/manage', 
          name: '通知管理', 
          icon: <FaBullhorn className="w-5 h-5" /> 
        }
      );
    }
  }
  
  // 学生菜单项
  if (user.role === 'student') {
    menuItems.push(
      { 
        path: '/my-courses', 
        name: '我的课程', 
        icon: <FaBook className="w-5 h-5" /> 
      },
      { 
        path: '/my-grades', 
        name: '我的成绩', 
        icon: <FaChartBar className="w-5 h-5" /> 
      },
      { 
        path: '/exams', 
        name: '考试安排', 
        icon: <FaClipboardList className="w-5 h-5" /> 
      }
    );
  }
  
  // 所有用户共有
  menuItems.push(
    { 
      path: '/notifications', 
      name: '我的通知', 
      icon: <FaBullhorn className="w-5 h-5" /> 
    },
    { 
      path: '/profile', 
      name: '个人信息', 
      icon: <FaCog className="w-5 h-5" /> 
    }
  );

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* 侧边栏 */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 text-white">
          <div className="text-xl font-semibold">学生成绩管理系统</div>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-2 text-white">
          <div className="text-sm opacity-75">欢迎，</div>
          <div className="font-semibold">{user.name || user.username}</div>
          <div className="text-xs mt-1 opacity-75">
            {user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'}
          </div>
        </div>

        <div className="mt-6">
          <nav className="space-y-1 px-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive(item.path)}`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-blue-700 hover:text-white"
            >
              <FaSignOutAlt className="mr-3 w-5 h-5" />
              退出登录
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
