import { readJSONFile } from '../../utils/fileOperations';
import { verifyToken } from '../../utils/auth';

export default function handler(req, res) {
  // 检查认证
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    // 为了方便开发测试，暂时不强制要求认证
    // return res.status(401).json({ message: '未授权访问' });
  }
  
  try {
    // 获取用户信息
    let userData = null;
    if (token) {
      userData = verifyToken(token);
      if (!userData) {
        return res.status(401).json({ message: '无效的认证令牌' });
      }
    }
    
    // 读取通知数据
    const data = readJSONFile('data/notifications.json');
    if (!data) {
      return res.status(500).json({ message: '无法读取通知数据' });
    }
    
    // 如果有用户信息，则筛选该用户的通知
    let notifications = data.notifications;
    if (userData) {
      // 筛选适用于该用户的通知（公共通知 + 针对该用户角色的通知 + 针对该用户ID的通知）
      notifications = notifications.filter(notification => 
        notification.type === 'public' || 
        (notification.targetRole && notification.targetRole === userData.role) ||
        (notification.targetUserId && notification.targetUserId === userData.id)
      );
    }
    
    // 返回通知列表
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('获取通知错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
