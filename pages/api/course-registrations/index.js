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
  } else {
    return res.status(401).json({ message: '未授权访问' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getRegistrations(req, res, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取选课记录
function getRegistrations(req, res, user) {
  try {
    // 读取选课数据
    let registrationsData = readJSONFile('data/course_registrations.json');
    
    // 如果数据不存在，初始化为空数组
    if (!registrationsData) {
      registrationsData = { registrations: [] };
    }
    
    const { studentId, courseId } = req.query;
    
    let registrations = registrationsData.registrations;
    
    // 如果用户是学生，只能查看自己的选课
    if (user.role === 'student') {
      registrations = registrations.filter(reg => reg.studentId === user.id);
    }
    
    // 根据查询参数筛选
    if (studentId) {
      registrations = registrations.filter(reg => reg.studentId === studentId);
    }
    
    if (courseId) {
      registrations = registrations.filter(reg => reg.courseId === courseId);
    }
    
    // 获取课程和学生信息
    const coursesData = readJSONFile('data/courses.json');
    const studentsData = readJSONFile('data/students.json');
    const usersData = readJSONFile('data/users.json');
    
    // 添加课程和学生信息
    if (coursesData && studentsData) {
      registrations = registrations.map(reg => {
        const course = coursesData.courses.find(c => c.id === reg.courseId);
        const student = studentsData.students.find(s => s.id === reg.studentId);
        let studentUser = null;
        
        if (usersData && student) {
          studentUser = usersData.users.find(u => u.id === student.id);
        }
        
        return {
          ...reg,
          courseName: course ? course.name : '未知课程',
          courseCode: course ? course.code : '',
          studentName: student ? student.name : (studentUser ? studentUser.name : '未知学生'),
          studentNumber: student ? student.studentId : ''
        };
      });
    }
    
    return res.status(200).json({
      registrations,
      total: registrations.length
    });
  } catch (error) {
    console.error('获取选课记录错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
