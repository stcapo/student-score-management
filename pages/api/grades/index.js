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
    // if (!user) {
    //   return res.status(401).json({ message: '无效的认证令牌' });
    // }
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getGrades(req, res, user);
    case 'POST':
      return addGrades(req, res, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取成绩列表
function getGrades(req, res, user) {
  try {
    // 读取成绩数据
    const gradesData = readJSONFile('data/grades.json');
    
    if (!gradesData) {
      return res.status(500).json({ message: '无法读取成绩数据' });
    }
    
    const { courseId, studentId, examId } = req.query;
    
    let grades = gradesData.grades;
    
    // 根据用户角色进行筛选
    if (user) {
      if (user.role === 'student') {
        // 学生只能查看自己的成绩
        grades = grades.filter(grade => grade.studentId === user.id);
      } else if (user.role === 'teacher') {
        // 教师只能查看自己教授课程的成绩
        const coursesData = readJSONFile('data/courses.json');
        if (coursesData) {
          const teacherCourseIds = coursesData.courses
            .filter(course => course.teacherId === user.id)
            .map(course => course.id);
          
          grades = grades.filter(grade => teacherCourseIds.includes(grade.courseId));
        }
      }
      // 管理员可查看所有成绩
    }
    
    // 根据查询参数筛选
    if (courseId) {
      grades = grades.filter(grade => grade.courseId === courseId);
    }
    
    if (studentId) {
      grades = grades.filter(grade => grade.studentId === studentId);
    }
    
    if (examId) {
      grades = grades.filter(grade => grade.examId === examId);
    }
    
    // 获取相关的学生和课程信息
    const studentsData = readJSONFile('data/students.json');
    const coursesData = readJSONFile('data/courses.json');
    
    // 添加学生和课程信息到成绩数据
    if (studentsData && coursesData) {
      grades = grades.map(grade => {
        const student = studentsData.students.find(s => s.id === grade.studentId);
        const course = coursesData.courses.find(c => c.id === grade.courseId);
        
        return {
          ...grade,
          studentName: student ? student.name : '未知学生',
          studentNumber: student ? student.studentId : '',
          courseName: course ? course.name : '未知课程',
          courseCode: course ? course.code : ''
        };
      });
    }
    
    // 返回结果
    return res.status(200).json({ 
      grades,
      total: grades.length 
    });
  } catch (error) {
    console.error('获取成绩列表错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 添加成绩
function addGrades(req, res, user) {
  try {
    // 检查权限
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({ message: '权限不足' });
    }
    
    // 获取请求数据
    const { grades: newGrades } = req.body;
    
    // 验证必填字段
    if (!newGrades || !Array.isArray(newGrades) || newGrades.length === 0) {
      return res.status(400).json({ message: '成绩数据格式不正确' });
    }
    
    // 读取成绩数据
    const data = readJSONFile('data/grades.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取成绩数据' });
    }
    
    // 检查课程ID
    const courseId = newGrades[0].courseId;
    
    // 如果是教师，检查是否有权限管理该课程
    if (user && user.role === 'teacher') {
      const coursesData = readJSONFile('data/courses.json');
      if (coursesData) {
        const course = coursesData.courses.find(c => c.id === courseId);
        if (!course || course.teacherId !== user.id) {
          return res.status(403).json({ message: '您没有权限为此课程录入成绩' });
        }
      }
    }
    
    // 生成ID并添加时间戳
    const gradesWithIds = newGrades.map(grade => ({
      id: uuidv4(),
      ...grade,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    // 检查成绩合法性
    for (const grade of gradesWithIds) {
      if (isNaN(parseFloat(grade.score)) || parseFloat(grade.score) < 0) {
        return res.status(400).json({ message: '成绩必须是大于等于0的数字' });
      }
    }
    
    // 添加到成绩列表
    data.grades.push(...gradesWithIds);
    
    // 写入文件
    if (!writeJSONFile('data/grades.json', data)) {
      return res.status(500).json({ message: '保存成绩数据失败' });
    }
    
    // 返回成功结果
    return res.status(201).json({ 
      message: '成绩添加成功',
      grades: gradesWithIds 
    });
  } catch (error) {
    console.error('添加成绩错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
