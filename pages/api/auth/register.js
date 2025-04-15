import { createUser, getUserByUsername } from '../../../utils/auth';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { username, password, name, email, role } = req.body;

    // 验证请求数据
    if (!username || !password || !name || !email || !role) {
      return res.status(400).json({ message: '所有字段为必填项' });
    }

    // 检查用户名是否已存在
    const existingUser = getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 验证角色
    const validRoles = ['admin', 'teacher', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: '无效的角色' });
    }

    // 创建新用户
    const newUser = {
      id: uuidv4(),
      username,
      password,
      name,
      email,
      role
    };

    const result = await createUser(newUser);

    if (result.success) {
      return res.status(201).json({
        message: '用户注册成功',
        user: result.user
      });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
