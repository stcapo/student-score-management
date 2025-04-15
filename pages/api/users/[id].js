import { readJSONFile, writeJSONFile } from '../../../utils/fileOperations';
import { verifyToken, hashPassword } from '../../../utils/auth';

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
  
  // 获取用户ID
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: '缺少用户ID' });
  }
  
  // 只允许管理员或用户本人访问/修改用户信息
  if (user.role !== 'admin' && user.id !== id) {
    return res.status(403).json({ message: '权限不足' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getUser(req, res, id);
    case 'PUT':
      return updateUser(req, res, id, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取单个用户信息
function getUser(req, res, id) {
  try {
    // 读取用户数据
    const usersData = readJSONFile('data/users.json');
    
    if (!usersData) {
      return res.status(500).json({ message: '无法读取用户数据' });
    }
    
    // 查找用户
    const user = usersData.users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ message: '未找到该用户' });
    }
    
    // 移除密码字段
    const { password, ...userWithoutPassword } = user;
    
    // 返回结果
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 更新用户信息
function updateUser(req, res, id, currentUser) {
  try {
    // 获取请求数据
    const { 
      name, 
      email, 
      phone,
      address,
      bio,
      avatar,
      oldPassword,
      newPassword
    } = req.body;
    
    // 读取用户数据
    const usersData = readJSONFile('data/users.json');
    
    if (!usersData) {
      return res.status(500).json({ message: '无法读取用户数据' });
    }
    
    // 查找用户索引
    const userIndex = usersData.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: '未找到该用户' });
    }
    
    // 如果要更改密码，需要验证旧密码
    if (newPassword) {
      // 只有用户本人才能更改密码
      if (currentUser.id !== id) {
        return res.status(403).json({ message: '只有用户本人才能更改密码' });
      }
      
      if (!oldPassword) {
        return res.status(400).json({ message: '更改密码需要提供旧密码' });
      }
      
      // 验证旧密码是否正确
      const hashedOldPassword = hashPassword(oldPassword);
      if (usersData.users[userIndex].password !== hashedOldPassword) {
        return res.status(400).json({ message: '旧密码不正确' });
      }
    }
    
    // 更新用户信息
    const updatedUser = {
      ...usersData.users[userIndex],
      name: name || usersData.users[userIndex].name,
      email: email || usersData.users[userIndex].email,
      phone: phone !== undefined ? phone : usersData.users[userIndex].phone,
      address: address !== undefined ? address : usersData.users[userIndex].address,
      bio: bio !== undefined ? bio : usersData.users[userIndex].bio,
      avatar: avatar || usersData.users[userIndex].avatar,
      updatedAt: new Date().toISOString()
    };
    
    // 如果提供了新密码，更新密码
    if (newPassword) {
      updatedUser.password = hashPassword(newPassword);
    }
    
    // 更新用户列表
    usersData.users[userIndex] = updatedUser;
    
    // 写入文件
    if (!writeJSONFile('data/users.json', usersData)) {
      return res.status(500).json({ message: '保存用户数据失败' });
    }
    
    // 移除密码字段
    const { password, ...userWithoutPassword } = updatedUser;
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '用户信息更新成功',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
