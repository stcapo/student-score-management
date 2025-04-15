import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { readJSONFile, writeJSONFile } from './fileOperations';

const JWT_SECRET = 'your-secret-key'; // 在实际生产环境中应该使用环境变量

// 生成JWT令牌
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// 验证密码
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// 哈希密码
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// 验证JWT令牌
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 获取用户信息
export const getUserByUsername = (username) => {
  const data = readJSONFile('data/users.json');
  if (!data) return null;
  
  return data.users.find(user => user.username === username) || null;
};

// 创建新用户
export const createUser = async (userData) => {
  const data = readJSONFile('data/users.json');
  if (!data) return null;
  
  // 检查用户名是否已存在
  if (data.users.some(user => user.username === userData.username)) {
    return { success: false, message: '用户名已存在' };
  }
  
  // 哈希密码
  const hashedPassword = await hashPassword(userData.password);
  
  // 创建新用户
  const newUser = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 添加到用户列表
  data.users.push(newUser);
  
  // 写入文件
  if (writeJSONFile('data/users.json', data)) {
    // 返回创建的用户（不含密码）
    const { password, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  } else {
    return { success: false, message: '创建用户失败' };
  }
};
