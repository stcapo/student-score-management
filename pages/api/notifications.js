import { readJSONFile, writeJSONFile } from '../../utils/fileOperations';
import { verifyToken } from '../../utils/auth';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  // 获取认证令牌
  const token = req.headers.authorization?.split(' ')[1];
  
  // 解析用户信息
  let user = null;
  if (token) {
    user = verifyToken(token);
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getNotifications(req, res, user);
    case 'POST':
      return createNotification(req, res, user);
    case 'PUT':
      return updateNotification(req, res, user);
    case 'DELETE':
      return deleteNotification(req, res, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取通知列表
function getNotifications(req, res, user) {
  try {
    // 如果用户未登录
    if (!user) {
      return res.status(401).json({ message: '未授权访问' });
    }
    
    // 读取通知数据
    let notificationsData = readJSONFile('data/notifications.json');
    
    // 如果文件不存在或为空，初始化它
    if (!notificationsData) {
      notificationsData = { notifications: [] };
      writeJSONFile('data/notifications.json', notificationsData);
    }
    
    let notifications = notificationsData.notifications;
    
    // 如果是获取单个通知的详情
    const { id } = req.query;
    if (id) {
      const notification = notifications.find(n => n.id === id);
      if (!notification) {
        return res.status(404).json({ message: '未找到该通知' });
      }
      return res.status(200).json({ notification });
    }
    
    // 如果是管理员且指定了admin=true，返回所有通知
    if (user.role === 'admin' && req.query.admin === 'true') {
      return res.status(200).json({ 
        notifications,
        total: notifications.length 
      });
    }
    
    // 对于普通用户，筛选适用于该用户的通知
    notifications = notifications.filter(notification => 
      notification.type === 'public' || 
      (notification.targetRole && notification.targetRole === user.role) ||
      (notification.targetUserId && notification.targetUserId === user.id)
    );
    
    // 按创建时间排序，最新的在前面
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.status(200).json({ 
      notifications,
      total: notifications.length 
    });
  } catch (error) {
    console.error('获取通知错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 创建新通知
function createNotification(req, res, user) {
  try {
    // 检查权限
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '只有管理员可以创建通知' });
    }
    
    // 获取请求数据
    const { 
      title, 
      content, 
      type = 'public',
      targetRole,
      targetUserId,
      priority = 'normal',
      expireAt
    } = req.body;
    
    // 验证必填字段
    if (!title || !content) {
      return res.status(400).json({ message: '通知标题和内容为必填项' });
    }
    
    // 读取通知数据
    let notificationsData = readJSONFile('data/notifications.json');
    
    // 如果文件不存在或为空，初始化它
    if (!notificationsData) {
      notificationsData = { notifications: [] };
    }
    
    // 创建新通知对象
    const newNotification = {
      id: uuidv4(),
      title,
      content,
      type,
      targetRole: targetRole || null,
      targetUserId: targetUserId || null,
      priority,
      expireAt: expireAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creatorId: user.id,
      creatorName: user.name || user.username
    };
    
    // 添加到通知列表
    notificationsData.notifications.push(newNotification);
    
    // 写入文件
    if (!writeJSONFile('data/notifications.json', notificationsData)) {
      return res.status(500).json({ message: '保存通知数据失败' });
    }
    
    // 返回成功结果
    return res.status(201).json({ 
      message: '通知创建成功',
      notification: newNotification
    });
  } catch (error) {
    console.error('创建通知错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 更新通知
function updateNotification(req, res, user) {
  try {
    // 检查权限
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '只有管理员可以更新通知' });
    }
    
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: '通知ID为必填项' });
    }
    
    // 获取请求数据
    const { 
      title, 
      content, 
      type,
      targetRole,
      targetUserId,
      priority,
      expireAt
    } = req.body;
    
    // 验证必填字段
    if (!title || !content) {
      return res.status(400).json({ message: '通知标题和内容为必填项' });
    }
    
    // 读取通知数据
    const notificationsData = readJSONFile('data/notifications.json');
    
    if (!notificationsData) {
      return res.status(404).json({ message: '通知数据不存在' });
    }
    
    // 查找通知索引
    const notificationIndex = notificationsData.notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ message: '未找到该通知' });
    }
    
    // 更新通知信息
    const updatedNotification = {
      ...notificationsData.notifications[notificationIndex],
      title,
      content,
      type: type || notificationsData.notifications[notificationIndex].type,
      targetRole: targetRole || null,
      targetUserId: targetUserId || null,
      priority: priority || notificationsData.notifications[notificationIndex].priority,
      expireAt: expireAt || notificationsData.notifications[notificationIndex].expireAt,
      updatedAt: new Date().toISOString()
    };
    
    // 更新通知列表
    notificationsData.notifications[notificationIndex] = updatedNotification;
    
    // 写入文件
    if (!writeJSONFile('data/notifications.json', notificationsData)) {
      return res.status(500).json({ message: '保存通知数据失败' });
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '通知更新成功',
      notification: updatedNotification
    });
  } catch (error) {
    console.error('更新通知错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 删除通知
function deleteNotification(req, res, user) {
  try {
    // 检查权限
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '只有管理员可以删除通知' });
    }
    
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: '通知ID为必填项' });
    }
    
    // 读取通知数据
    const notificationsData = readJSONFile('data/notifications.json');
    
    if (!notificationsData) {
      return res.status(404).json({ message: '通知数据不存在' });
    }
    
    // 查找通知索引
    const notificationIndex = notificationsData.notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ message: '未找到该通知' });
    }
    
    // 删除通知
    notificationsData.notifications.splice(notificationIndex, 1);
    
    // 写入文件
    if (!writeJSONFile('data/notifications.json', notificationsData)) {
      return res.status(500).json({ message: '保存通知数据失败' });
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '通知删除成功'
    });
  } catch (error) {
    console.error('删除通知错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
