import { readJSONFile, writeJSONFile } from '../../../utils/fileOperations';
import { verifyToken } from '../../../utils/auth';
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
      return getExams(req, res, user);
    case 'POST':
      return addExam(req, res, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取考试列表
function getExams(req, res, user) {
  try {
    // 读取考试数据
    let examsData = readJSONFile('data/exams.json');
    
    // 如果考试数据文件不存在，创建空数据
    if (!examsData) {
      examsData = { exams: [] };
      writeJSONFile('data/exams.json', examsData);
    }
    
    const { query, courseId } = req.query;
    
    let exams = examsData.exams;
    
    // 如果用户是教师且没有管理员权限，只返回自己创建的考试
    if (user && user.role === 'teacher') {
      exams = exams.filter(exam => exam.creatorId === user.id);
    }
    
    // 如果指定了课程ID，筛选该课程的考试
    if (courseId) {
      exams = exams.filter(exam => exam.courseId === courseId);
    }
    
    // 如果有查询参数，进行筛选
    if (query) {
      const searchTerm = query.toLowerCase();
      exams = exams.filter(
        exam => 
          (exam.title && exam.title.toLowerCase().includes(searchTerm)) ||
          (exam.location && exam.location.toLowerCase().includes(searchTerm))
      );
    }
    
    // 读取课程数据以获取课程信息
    const coursesData = readJSONFile('data/courses.json');
    
    if (coursesData) {
      // 为每个考试添加课程信息
      exams = exams.map(exam => {
        const course = coursesData.courses.find(course => course.id === exam.courseId);
        return {
          ...exam,
          courseName: course ? course.name : '未知课程',
          courseCode: course ? course.code : ''
        };
      });
    }
    
    // 返回结果
    return res.status(200).json({ 
      exams,
      total: exams.length 
    });
  } catch (error) {
    console.error('获取考试列表错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 添加考试
function addExam(req, res, user) {
  try {
    // 检查基本授权
    if (!user) {
      return res.status(401).json({ message: '请先登录再进行操作' });
    }
    
    // 检查角色权限
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({ message: '只有管理员和教师可以添加考试' });
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
    let examsData = readJSONFile('data/exams.json');
    
    // 如果考试数据文件不存在，创建空数据
    if (!examsData) {
      examsData = { exams: [] };
    }
    
    // 读取课程数据，检查课程是否存在
    const coursesData = readJSONFile('data/courses.json');
    
    if (!coursesData || !coursesData.courses.some(course => course.id === courseId)) {
      return res.status(400).json({ message: '指定的课程不存在' });
    }
    
    // 创建新考试对象
    const newExam = {
      id: uuidv4(),
      title,
      description: description || '',
      courseId,
      date,
      duration: duration || 120,
      location,
      examType: examType || 'final',
      totalScore: totalScore || 100,
      passingScore: passingScore || 60,
      creatorId: user.id,
      creatorName: user.name || user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 添加到考试列表
    examsData.exams.push(newExam);
    
    // 写入文件
    if (!writeJSONFile('data/exams.json', examsData)) {
      return res.status(500).json({ message: '保存考试数据失败' });
    }
    
    // 添加课程信息到返回结果
    let examWithCourse = { ...newExam };
    
    if (newExam.courseId) {
      const course = coursesData.courses.find(course => course.id === newExam.courseId);
      if (course) {
        examWithCourse.courseName = course.name;
        examWithCourse.courseCode = course.code;
      }
    }
    
    // 返回成功结果
    return res.status(201).json({ 
      message: '考试添加成功',
      exam: examWithCourse
    });
  } catch (error) {
    console.error('添加考试错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
