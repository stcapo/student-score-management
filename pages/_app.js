import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 检查是否需要验证登录状态
    const publicPages = ['/login', '/register'];
    const authRequired = !publicPages.includes(router.pathname);
    const token = localStorage.getItem('token');
    
    if (authRequired && !token) {
      setLoading(false);
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }
  
  // 对于登录和注册页面，不使用Layout
  if (router.pathname === '/login' || router.pathname === '/register') {
    return <Component {...pageProps} />;
  }
  
  // 其他页面使用Layout
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
