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
    // if (!user) {
    //   return res.status(401).json({ message: '无效的认证令牌' });
    // }
  }
  
  // 获取成绩ID
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: '缺少成绩ID' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getGrade(req, res, id, user);
    case 'PUT':
      return updateGrade(req, res, id, user);
    case 'DELETE':
      return deleteGrade(req, res, id, user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取单个成绩
function getGrade(req, res, id, user) {
  try {
    // 读取成绩数据
    const gradesData = readJSONFile('data/grades.json');
    
    if (!gradesData) {
      return res.status(500).json({ message: '无法读取成绩数据' });
    }
    
    // 查找成绩
    const grade = gradesData.grades.find(g => g.id === id);
    
    if (!grade) {
      return res.status(404).json({ message: '未找到该成绩记录' });
    }
    
    // 根据用户角色检查权限
    if (user) {
      if (user.role === 'student' && grade.studentId !== user.id) {
        return res.status(403).json({ message: '您没有权限查看此成绩' });
      } else if (user.role === 'teacher') {
        // 检查是否是该课程的教师
        const coursesData = readJSONFile('data/courses.json');
        if (coursesData) {
          const course = coursesData.courses.find(c => c.id === grade.courseId);
          if (!course || course.teacherId !== user.id) {
            return res.status(403).json({ message: '您没有权限查看此成绩' });
          }
        }
      }
    }
    
    // 获取学生和课程信息
    const studentsData = readJSONFile('data/students.json');
    const coursesData = readJSONFile('data/courses.json');
    
    let gradeWithDetails = { ...grade };
    
    if (studentsData) {
      const student = studentsData.students.find(s => s.id === grade.studentId);
      if (student) {
        gradeWithDetails.studentName = student.name;
        gradeWithDetails.studentNumber = student.studentId;
      }
    }
    
    if (coursesData) {
      const course = coursesData.courses.find(c => c.id === grade.courseId);
      if (course) {
        gradeWithDetails.courseName = course.name;
        gradeWithDetails.courseCode = course.code;
      }
    }
    
    // 返回结果
    return res.status(200).json({ grade: gradeWithDetails });
  } catch (error) {
    console.error('获取成绩详情错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 更新成绩信息
function updateGrade(req, res, id, user) {
  try {
    // 检查权限
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({ message: '权限不足' });
    }
    
    // 获取请求数据
    const { score, comment } = req.body;
    
    // 验证成绩值
    if (score !== undefined && (isNaN(parseFloat(score)) || parseFloat(score) < 0)) {
      return res.status(400).json({ message: '成绩必须是大于等于0的数字' });
    }
    
    // 读取成绩数据
    const data = readJSONFile('data/grades.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取成绩数据' });
    }
    
    // 查找成绩索引
    const gradeIndex = data.grades.findIndex(g => g.id === id);
    
    if (gradeIndex === -1) {
      return res.status(404).json({ message: '未找到该成绩记录' });
    }
    
    // 如果是教师，检查是否有权限修改该成绩
    if (user && user.role === 'teacher') {
      const courseId = data.grades[gradeIndex].courseId;
      const coursesData = readJSONFile('data/courses.json');
      
      if (coursesData) {
        const course = coursesData.courses.find(c => c.id === courseId);
        if (!course || course.teacherId !== user.id) {
          return res.status(403).json({ message: '您没有权限修改此成绩' });
        }
      }
    }
    
    // 更新成绩信息
    const updatedGrade = {
      ...data.grades[gradeIndex],
      score: score !== undefined ? score : data.grades[gradeIndex].score,
      comment: comment !== undefined ? comment : data.grades[gradeIndex].comment,
      updatedAt: new Date().toISOString()
    };
    
    // 更新成绩列表
    data.grades[gradeIndex] = updatedGrade;
    
    // 写入文件
    if (!writeJSONFile('data/grades.json', data)) {
      return res.status(500).json({ message: '保存成绩数据失败' });
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '成绩信息更新成功',
      grade: updatedGrade 
    });
  } catch (error) {
    console.error('更新成绩信息错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}

// 删除成绩
function deleteGrade(req, res, id, user) {
  try {
    // 检查权限
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({ message: '权限不足' });
    }
    
    // 读取成绩数据
    const data = readJSONFile('data/grades.json');
    
    if (!data) {
      return res.status(500).json({ message: '无法读取成绩数据' });
    }
    
    // 查找成绩索引
    const gradeIndex = data.grades.findIndex(g => g.id === id);
    
    if (gradeIndex === -1) {
      return res.status(404).json({ message: '未找到该成绩记录' });
    }
    
    // 如果是教师，检查是否有权限删除该成绩
    if (user && user.role === 'teacher') {
      const courseId = data.grades[gradeIndex].courseId;
      const coursesData = readJSONFile('data/courses.json');
      
      if (coursesData) {
        const course = coursesData.courses.find(c => c.id === courseId);
        if (!course || course.teacherId !== user.id) {
          return res.status(403).json({ message: '您没有权限删除此成绩' });
        }
      }
    }
    
    // 删除成绩记录
    data.grades.splice(gradeIndex, 1);
    
    // 写入文件
    if (!writeJSONFile('data/grades.json', data)) {
      return res.status(500).json({ message: '保存成绩数据失败' });
    }
    
    // 返回成功结果
    return res.status(200).json({ 
      message: '成绩记录已删除'
    });
  } catch (error) {
    console.error('删除成绩错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
