import { readJSONFile, writeJSONFile } from '../../../utils/fileOperations';
import { verifyToken } from '../../../utils/auth';

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
  
  // 获取学生ID
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: '缺少学生ID' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getStudent(req, res, id);
    case 'PUT':
      return updateStudent(req, res, id);
    case 'DELETE':
      return deleteStudent(req, res, id);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取单个学生
function getStudent(req, res, id) {
  try {
    // 读取学生数据
    const data = readJSONFile('data/students.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取学生数据' });
    }
    
    // 查找学生
    const student = data.students.find(s => s.id === id);
    
    if (!student) {
      return res.status(404).json({ message: '未找到该学生' });
    }
    
    // 返回结果
    return res.status(200).json({ student });
  } catch (error) {
    console.error('获取学生详情错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 更新学生信息
function updateStudent(req, res, id) {
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
      address,
      status
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
    
    // 查找学生索引
    const studentIndex = data.students.findIndex(s => s.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ message: '未找到该学生' });
    }
    
    // 检查学号是否已被其他学生使用
    const isDuplicateStudentId = data.students.some(
      (s, index) => s.studentId === studentId && index !== studentIndex
    );
    
    if (isDuplicateStudentId) {
      return res.status(400).json({ message: '该学号已被使用' });
    }
    
    // 更新学生信息
    const updatedStudent = {
      ...data.students[studentIndex],
      name,
      studentId,
      gender: gender || data.students[studentIndex].gender,
      birthdate: birthdate || data.students[studentIndex].birthdate,
      class: className || data.students[studentIndex].class,
      department: department || data.students[studentIndex].department,
      email: email || data.students[studentIndex].email,
      phone: phone || data.students[studentIndex].phone,
      address: address || data.students[studentIndex].address,
      status: status || data.students[studentIndex].status,
      updatedAt: new Date().toISOString()
    };
    
    // 更新学生列表
    data.students[studentIndex] = updatedStudent;
    
    // 写入文件
    if (!writeJSONFile('data/students.json', data)) {
      return res.status(500).json({ message: '保存学生数据失败' });
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '学生信息更新成功',
      student: updatedStudent 
    });
  } catch (error) {
    console.error('更新学生信息错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 删除学生（逻辑删除）
function deleteStudent(req, res, id) {
  try {
    // 读取学生数据
    const data = readJSONFile('data/students.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取学生数据' });
    }
    
    // 查找学生索引
    const studentIndex = data.students.findIndex(s => s.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ message: '未找到该学生' });
    }
    
    // 判断是物理删除还是逻辑删除
    const { permanent } = req.query;
    
    if (permanent === 'true') {
      // 物理删除
      data.students.splice(studentIndex, 1);
    } else {
      // 逻辑删除（标记为inactive）
      data.students[studentIndex] = {
        ...data.students[studentIndex],
        status: 'inactive',
        updatedAt: new Date().toISOString()
      };
    }
    
    // 写入文件
    if (!writeJSONFile('data/students.json', data)) {
      return res.status(500).json({ message: '保存学生数据失败' });
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: permanent === 'true' ? '学生已永久删除' : '学生已标记为删除状态',
    });
  } catch (error) {
    console.error('删除学生错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
