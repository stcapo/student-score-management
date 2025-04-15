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
  
  // 获取课程ID
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: '缺少课程ID' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getCourse(req, res, id, user);
    case 'PUT':
      return updateCourse(req, res, id, user);
    case 'DELETE':
      return deleteCourse(req, res, id, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取单个课程
function getCourse(req, res, id, user) {
  try {
    // 读取课程数据
    const coursesData = readJSONFile('data/courses.json');
    
    if (!coursesData) {
      return res.status(500).json({ message: '无法读取课程数据' });
    }
    
    // 查找课程
    const course = coursesData.courses.find(c => c.id === id);
    
    if (!course) {
      return res.status(404).json({ message: '未找到该课程' });
    }
    
    // 如果用户是教师且不是该课程的教师，检查权限
    if (user && user.role === 'teacher' && course.teacherId !== user.id) {
      // 开发阶段，暂时注释
      // return res.status(403).json({ message: '您没有权限查看此课程' });
    }
    
    // 获取教师信息
    let courseWithTeacher = { ...course };
    
    if (course.teacherId) {
      const usersData = readJSONFile('data/users.json');
      if (usersData) {
        const teacher = usersData.users.find(user => user.id === course.teacherId);
        if (teacher) {
          courseWithTeacher.teacherName = teacher.name;
          courseWithTeacher.teacherEmail = teacher.email;
        }
      }
    }
    
    // 返回结果
    return res.status(200).json({ course: courseWithTeacher });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 更新课程信息
function updateCourse(req, res, id, user) {
  try {
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
      location,
      status
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
    
    // 查找课程索引
    const courseIndex = data.courses.findIndex(c => c.id === id);
    
    if (courseIndex === -1) {
      return res.status(404).json({ message: '未找到该课程' });
    }
    
    // 如果用户是教师且不是该课程的教师，检查权限
    if (user && user.role === 'teacher' && data.courses[courseIndex].teacherId !== user.id) {
      // 开发阶段，暂时注释
      // return res.status(403).json({ message: '您没有权限修改此课程' });
    }
    
    // 检查课程代码是否已被其他课程使用
    const isDuplicateCode = data.courses.some(
      (c, index) => c.code === code && index !== courseIndex
    );
    
    if (isDuplicateCode) {
      return res.status(400).json({ message: '该课程代码已被使用' });
    }
    
    // 如果指定了新的教师ID，检查该教师是否存在
    if (teacherId && teacherId !== data.courses[courseIndex].teacherId) {
      const usersData = readJSONFile('data/users.json');
      if (!usersData.users.some(user => user.id === teacherId && (user.role === 'teacher' || user.role === 'admin'))) {
        return res.status(400).json({ message: '指定的教师不存在或没有教师权限' });
      }
    }
    
    // 更新课程信息
    const updatedCourse = {
      ...data.courses[courseIndex],
      name,
      code,
      description: description || data.courses[courseIndex].description,
      credits: credits || data.courses[courseIndex].credits,
      department: department || data.courses[courseIndex].department,
      semester: semester || data.courses[courseIndex].semester,
      teacherId: teacherId || data.courses[courseIndex].teacherId,
      startDate: startDate || data.courses[courseIndex].startDate,
      endDate: endDate || data.courses[courseIndex].endDate,
      capacity: capacity || data.courses[courseIndex].capacity,
      location: location || data.courses[courseIndex].location,
      status: status || data.courses[courseIndex].status,
      updatedAt: new Date().toISOString()
    };
    
    // 更新课程列表
    data.courses[courseIndex] = updatedCourse;
    
    // 写入文件
    if (!writeJSONFile('data/courses.json', data)) {
      return res.status(500).json({ message: '保存课程数据失败' });
    }
    
    // 添加教师信息到返回结果
    let courseWithTeacher = { ...updatedCourse };
    
    if (updatedCourse.teacherId) {
      const usersData = readJSONFile('data/users.json');
      const teacher = usersData.users.find(user => user.id === updatedCourse.teacherId);
      if (teacher) {
        courseWithTeacher.teacherName = teacher.name;
      }
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '课程信息更新成功',
      course: courseWithTeacher
    });
  } catch (error) {
    console.error('更新课程信息错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 删除课程（逻辑删除）
function deleteCourse(req, res, id, user) {
  try {
    // 读取课程数据
    const data = readJSONFile('data/courses.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取课程数据' });
    }
    
    // 查找课程索引
    const courseIndex = data.courses.findIndex(c => c.id === id);
    
    if (courseIndex === -1) {
      return res.status(404).json({ message: '未找到该课程' });
    }
    
    // 如果用户是教师且不是该课程的教师，检查权限
    if (user && user.role === 'teacher' && data.courses[courseIndex].teacherId !== user.id) {
      // 开发阶段，暂时注释
      // return res.status(403).json({ message: '您没有权限删除此课程' });
    }
    
    // 判断是物理删除还是逻辑删除
    const { permanent } = req.query;
    
    if (permanent === 'true') {
      // 物理删除
      data.courses.splice(courseIndex, 1);
    } else {
      // 逻辑删除（标记为inactive）
      data.courses[courseIndex] = {
        ...data.courses[courseIndex],
        status: 'inactive',
        updatedAt: new Date().toISOString()
      };
    }
    
    // 写入文件
    if (!writeJSONFile('data/courses.json', data)) {
      return res.status(500).json({ message: '保存课程数据失败' });
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: permanent === 'true' ? '课程已永久删除' : '课程已标记为删除状态',
    });
  } catch (error) {
    console.error('删除课程错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
