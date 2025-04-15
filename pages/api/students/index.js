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
      return getStudents(req, res);
    case 'POST':
      return addStudent(req, res);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取学生列表
function getStudents(req, res) {
  try {
    // 读取学生数据
    const data = readJSONFile('data/students.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取学生数据' });
    }
    
    // 处理查询参数
    const { query } = req.query;
    
    let students = data.students;
    
    // 如果有查询参数，进行筛选
    if (query) {
      const searchTerm = query.toLowerCase();
      students = students.filter(
        student => 
          student.name.toLowerCase().includes(searchTerm) ||
          student.studentId.toLowerCase().includes(searchTerm) ||
          (student.class && student.class.toLowerCase().includes(searchTerm))
      );
    }
    
    // 返回结果
    return res.status(200).json({ 
      students,
      total: students.length 
    });
  } catch (error) {
    console.error('获取学生列表错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 添加学生
function addStudent(req, res) {
  try {
    // 获取请求数据
    const { 
      name, 
      studentId, 
      gender, 
      birthdate, 
      class: className, 
      department, 
      email, 
      phone, 
      address 
    } = req.body;
    
    // 验证必填字段
    if (!name || !studentId) {
      return res.status(400).json({ message: '姓名和学号为必填项' });
    }
    
    // 读取学生数据
    const data = readJSONFile('data/students.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取学生数据' });
    }
    
    // 检查学号是否已存在
    if (data.students.some(student => student.studentId === studentId)) {
      return res.status(400).json({ message: '该学号已存在' });
    }
    
    // 创建新学生对象
    const newStudent = {
      id: uuidv4(),
      name,
      studentId,
      gender: gender || '',
      birthdate: birthdate || '',
      class: className || '',
      department: department || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 添加到学生列表
    data.students.push(newStudent);
    
    // 写入文件
    if (!writeJSONFile('data/students.json', data)) {
      return res.status(500).json({ message: '保存学生数据失败' });
    }
    
    // 返回成功结果
    return res.status(201).json({ 
      message: '学生添加成功',
      student: newStudent 
    });
  } catch (error) {
    console.error('添加学生错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
