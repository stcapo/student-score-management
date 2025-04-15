import { readJSONFile, writeJSONFile } from '../../../utils/fileOperations';
import { verifyToken } from '../../../utils/auth';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  // 获取认证令牌
  const token = req.headers.authorization?.split(' ')[1];
  
  // 验证认证（开发阶段可暂时注释掉）
  // if (!token) {
  //   return res.status(401).json({ message: '未授权访问' });
  // }
  
  // 解析用户信息
  let user = null;
  if (token) {
    user = verifyToken(token);
    // if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    //   return res.status(403).json({ message: '权限不足' });
    // }
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getCourses(req, res, user);
    case 'POST':
      return addCourse(req, res, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取课程列表
function getCourses(req, res, user) {
  try {
    // 读取课程数据
    const coursesData = readJSONFile('data/courses.json');
    
    if (!coursesData) {
      return res.status(500).json({ message: '无法读取课程数据' });
    }
    
    const { query, teacherId } = req.query;
    
    let courses = coursesData.courses;
    
    // 如果用户是教师且没有管理员权限，只返回自己的课程
    if (user && user.role === 'teacher' && !teacherId) {
      courses = courses.filter(course => course.teacherId === user.id);
    }
    
    // 如果指定了教师ID，筛选该教师的课程
    if (teacherId) {
      courses = courses.filter(course => course.teacherId === teacherId);
    }
    
    // 如果有查询参数，进行筛选
    if (query) {
      const searchTerm = query.toLowerCase();
      courses = courses.filter(
        course => 
          course.name.toLowerCase().includes(searchTerm) ||
          course.code.toLowerCase().includes(searchTerm) ||
          (course.department && course.department.toLowerCase().includes(searchTerm))
      );
    }
    
    // 读取用户数据以获取教师信息
    const usersData = readJSONFile('data/users.json');
    
    if (usersData) {
      // 为每个课程添加教师信息
      courses = courses.map(course => {
        const teacher = usersData.users.find(user => user.id === course.teacherId);
        return {
          ...course,
          teacherName: teacher ? teacher.name : '未分配'
        };
      });
    }
    
    // 返回结果
    return res.status(200).json({ 
      courses,
      total: courses.length 
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 添加课程
function addCourse(req, res, user) {
  try {
    // 检查权限
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({ message: '权限不足' });
    }
    
    // 获取请求数据
    const { 
      name, 
      code, 
      description, 
      credits, 
      department, 
      semester,
      teacherId,
      startDate,
      endDate,
      capacity,
      location
    } = req.body;
    
    // 验证必填字段
    if (!name || !code) {
      return res.status(400).json({ message: '课程名称和课程代码为必填项' });
    }
    
    // 读取课程数据
    const data = readJSONFile('data/courses.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取课程数据' });
    }
    
    // 检查课程代码是否已存在
    if (data.courses.some(course => course.code === code)) {
      return res.status(400).json({ message: '该课程代码已存在' });
    }
    
    // 如果指定了教师ID，检查该教师是否存在
    if (teacherId) {
      const usersData = readJSONFile('data/users.json');
      if (!usersData.users.some(user => user.id === teacherId && (user.role === 'teacher' || user.role === 'admin'))) {
        return res.status(400).json({ message: '指定的教师不存在或没有教师权限' });
      }
    }
    
    // 创建新课程对象
    const newCourse = {
      id: uuidv4(),
      name,
      code,
      description: description || '',
      credits: credits || 0,
      department: department || '',
      semester: semester || '',
      teacherId: teacherId || (user ? user.id : ''),
      startDate: startDate || '',
      endDate: endDate || '',
      capacity: capacity || 0,
      location: location || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 添加到课程列表
    data.courses.push(newCourse);
    
    // 写入文件
    if (!writeJSONFile('data/courses.json', data)) {
      return res.status(500).json({ message: '保存课程数据失败' });
    }
    
    // 添加教师信息到返回结果
    let courseWithTeacher = { ...newCourse };
    
    if (newCourse.teacherId) {
      const usersData = readJSONFile('data/users.json');
      const teacher = usersData.users.find(user => user.id === newCourse.teacherId);
      if (teacher) {
        courseWithTeacher.teacherName = teacher.name;
      }
    }
    
    // 返回成功结果
    return res.status(201).json({ 
      message: '课程添加成功',
      course: courseWithTeacher
    });
  } catch (error) {
    console.error('添加课程错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
