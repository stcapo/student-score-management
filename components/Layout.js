import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children, title = '学生成绩管理系统' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // 检查用户是否已登录
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      // 如果没有登录且不在登录页，则重定向到登录页
      if (router.pathname !== '/login' && router.pathname !== '/register') {
        router.push('/login');
      }
      setLoading(false);
    }
  }, [router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 登录页和注册页不需要布局
  if (router.pathname === '/login' || router.pathname === '/register') {
    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content="学生成绩管理系统" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="学生成绩管理系统" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen bg-gray-100">
        <Sidebar user={user} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar user={user} toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
