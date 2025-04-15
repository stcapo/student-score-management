import { readJSONFile } from '../../../utils/fileOperations';
import { verifyToken } from '../../../utils/auth';

export default function handler(req, res) {
  // 获取认证令牌
  const token = req.headers.authorization?.split(' ')[1];
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getTeachers(req, res);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取教师列表
function getTeachers(req, res) {
  try {
    // 读取用户数据
    const usersData = readJSONFile('data/users.json');
    
    if (!usersData) {
      return res.status(500).json({ message: '无法读取用户数据' });
    }
    
    // 筛选具有教师角色的用户
    const teachers = usersData.users
      .filter(user => user.role === 'teacher' || user.role === 'admin')
      .map(({ id, username, name, email, role }) => ({
        id,
        username,
        name: name || username,
        email,
        role
      }));
    
    // 返回结果
    return res.status(200).json({ 
      teachers,
      total: teachers.length 
    });
  } catch (error) {
    console.error('获取教师列表错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
