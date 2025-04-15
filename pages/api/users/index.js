import { readJSONFile, writeJSONFile } from '../../../utils/fileOperations';
import { verifyToken } from '../../../utils/auth';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  // 获取认证令牌
  const token = req.headers.authorization?.split(' ')[1];
  
  // 解析用户信息
  let user = null;
  if (token) {
    user = verifyToken(token);
  } else {
    return res.status(401).json({ message: '未授权访问' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getUsers(req, res, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取用户列表
function getUsers(req, res, user) {
  try {
    // 读取用户数据
    const usersData = readJSONFile('data/users.json');
    
    if (!usersData) {
      return res.status(500).json({ message: '无法读取用户数据' });
    }
    
    // 如果是管理员，返回所有用户
    // 如果是普通用户，只返回自己的信息
    let users = usersData.users;
    
    // 从用户数据中移除密码字段
    users = users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    
    if (user.role !== 'admin') {
      users = users.filter(u => u.id === user.id);
    }
    
    // 返回结果
    return res.status(200).json({ 
      users,
      total: users.length 
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
