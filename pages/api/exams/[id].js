import { readJSONFile, writeJSONFile } from '../../../utils/fileOperations';
import { verifyToken } from '../../../utils/auth';

export default function handler(req, res) {
  // 获取认证令牌
  const token = req.headers.authorization?.split(' ')[1];
  
  // 解析用户信息
  let user = null;
  if (token) {
    user = verifyToken(token);
  }
  
  // 获取考试ID
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: '缺少考试ID' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getExam(req, res, id, user);
    case 'PUT':
      return updateExam(req, res, id, user);
    case 'DELETE':
      return deleteExam(req, res, id, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取单个考试
function getExam(req, res, id, user) {
  try {
    // 读取考试数据
    const examsData = readJSONFile('data/exams.json');
    
    if (!examsData) {
      return res.status(404).json({ message: '未找到考试数据' });
    }
    
    // 查找考试
    const exam = examsData.exams.find(e => e.id === id);
    
    if (!exam) {
      return res.status(404).json({ message: '未找到该考试' });
    }
    
    // 获取课程信息
    let examWithCourse = { ...exam };
    
    if (exam.courseId) {
      const coursesData = readJSONFile('data/courses.json');
      if (coursesData) {
        const course = coursesData.courses.find(course => course.id === exam.courseId);
        if (course) {
          examWithCourse.courseName = course.name;
          examWithCourse.courseCode = course.code;
        }
      }
    }
    
    // 返回结果
    return res.status(200).json({ exam: examWithCourse });
  } catch (error) {
    console.error('获取考试详情错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 更新考试信息
function updateExam(req, res, id, user) {
  try {
    // 检查权限
    if (!user) {
      return res.status(401).json({ message: '未授权访问' });
    }
    
    // 获取请求数据
    const { 
      title, 
      description, 
      courseId,
      date,
      duration,
      location,
      examType,
      totalScore,
      passingScore
    } = req.body;
    
    // 验证必填字段
    if (!title || !courseId || !date || !location) {
      return res.status(400).json({ message: '考试标题、关联课程、考试时间和地点为必填项' });
    }
    
    // 读取考试数据
    const examsData = readJSONFile('data/exams.json');
    
    if (!examsData) {
      return res.status(404).json({ message: '未找到考试数据' });
    }
    
    // 查找考试索引
    const examIndex = examsData.exams.findIndex(e => e.id === id);
    
    if (examIndex === -1) {
      return res.status(404).json({ message: '未找到该考试' });
    }
    
    // 如果用户是教师且不是该考试的创建者，检查权限
    if (user.role !== 'admin' && examsData.exams[examIndex].creatorId !== user.id) {
      return res.status(403).json({ message: '您没有权限修改此考试' });
    }
    
    // 读取课程数据，检查课程是否存在
    const coursesData = readJSONFile('data/courses.json');
    
    if (!coursesData || !coursesData.courses.some(course => course.id === courseId)) {
      return res.status(400).json({ message: '指定的课程不存在' });
    }
    
    // 更新考试信息
    const updatedExam = {
      ...examsData.exams[examIndex],
      title,
      description: description || examsData.exams[examIndex].description,
      courseId,
      date,
      duration: duration || examsData.exams[examIndex].duration,
      location,
      examType: examType || examsData.exams[examIndex].examType,
      totalScore: totalScore || examsData.exams[examIndex].totalScore,
      passingScore: passingScore || examsData.exams[examIndex].passingScore,
      updatedAt: new Date().toISOString()
    };
    
    // 更新考试列表
    examsData.exams[examIndex] = updatedExam;
    
    // 写入文件
    if (!writeJSONFile('data/exams.json', examsData)) {
      return res.status(500).json({ message: '保存考试数据失败' });
    }
    
    // 添加课程信息到返回结果
    let examWithCourse = { ...updatedExam };
    
    if (updatedExam.courseId) {
      const course = coursesData.courses.find(course => course.id === updatedExam.courseId);
      if (course) {
        examWithCourse.courseName = course.name;
        examWithCourse.courseCode = course.code;
      }
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '考试信息更新成功',
      exam: examWithCourse
    });
  } catch (error) {
    console.error('更新考试信息错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 删除考试
function deleteExam(req, res, id, user) {
  try {
    // 检查权限
    if (!user) {
      return res.status(401).json({ message: '未授权访问' });
    }
    
    // 读取考试数据
    const examsData = readJSONFile('data/exams.json');
    
    if (!examsData) {
      return res.status(404).json({ message: '未找到考试数据' });
    }
    
    // 查找考试索引
    const examIndex = examsData.exams.findIndex(e => e.id === id);
    
    if (examIndex === -1) {
      return res.status(404).json({ message: '未找到该考试' });
    }
    
    // 如果用户是教师且不是该考试的创建者，检查权限
    if (user.role !== 'admin' && examsData.exams[examIndex].creatorId !== user.id) {
      return res.status(403).json({ message: '您没有权限删除此考试' });
    }
    
    // 删除考试
    examsData.exams.splice(examIndex, 1);
    
    // 写入文件
    if (!writeJSONFile('data/exams.json', examsData)) {
      return res.status(500).json({ message: '保存考试数据失败' });
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '考试已删除'
    });
  } catch (error) {
    console.error('删除考试错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
