// 测试API脚本
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// 模拟管理员登录获取token
async function getAdminToken() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    if (data.token) {
      console.log('✓ 管理员登录成功');
      return data.token;
    } else {
      console.log('✗ 管理员登录失败:', data.message);
      return null;
    }
  } catch (error) {
    console.log('✗ 登录请求失败:', error.message);
    return null;
  }
}

// 测试分析API
async function testAnalysisAPI(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/analysis`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✓ 分析API测试成功');
      console.log('  - 总学生数:', data.data.overview.totalStudents);
      console.log('  - 总成绩数:', data.data.overview.totalGrades);
      console.log('  - 平均分:', data.data.overview.overallAverage.toFixed(1));
      console.log('  - 及格率:', data.data.overview.passingRate + '%');
      return true;
    } else {
      console.log('✗ 分析API测试失败:', data.message);
      return false;
    }
  } catch (error) {
    console.log('✗ 分析API请求失败:', error.message);
    return false;
  }
}

// 测试趋势预警API
async function testTrendsAPI(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/trends`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✓ 趋势预警API测试成功');
      console.log('  - 总预警数:', data.data.summary.totalWarnings);
      console.log('  - 有预警的学生数:', data.data.summary.studentsWithWarnings);
      console.log('  - 有预警的课程数:', data.data.summary.coursesWithWarnings);
      return true;
    } else {
      console.log('✗ 趋势预警API测试失败:', data.message);
      return false;
    }
  } catch (error) {
    console.log('✗ 趋势预警API请求失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('开始测试API...\n');
  
  // 获取管理员token
  const token = await getAdminToken();
  if (!token) {
    console.log('无法获取管理员token，测试终止');
    return;
  }
  
  console.log('');
  
  // 测试分析API
  await testAnalysisAPI(token);
  
  console.log('');
  
  // 测试趋势预警API
  await testTrendsAPI(token);
  
  console.log('\n测试完成！');
}

// 运行测试
runTests();
