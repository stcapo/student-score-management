import { verifyPassword, generateToken, getUserByUsername } from '../../../utils/auth';

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { username, password } = req.body;

    // 验证请求数据
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码为必填项' });
    }

    // 获取用户信息
    const user = getUserByUsername(username);

    // 检查用户是否存在
    if (!user) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    // 生成JWT令牌
    const token = generateToken(user);

    // 返回用户信息（不含密码）和令牌
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: '登录成功',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
