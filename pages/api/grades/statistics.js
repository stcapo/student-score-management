import { readJSONFile } from '../../../utils/fileOperations';
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
  
  // 仅处理GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }
  
  // 处理成绩统计请求
  return getGradeStatistics(req, res, user);
}

// 获取成绩统计数据
function getGradeStatistics(req, res, user) {
  try {
    // 获取查询参数
    const { courseId, studentId, type } = req.query;
    
    // 读取成绩数据
    const gradesData = readJSONFile('data/grades.json');
    
    if (!gradesData) {
      return res.status(500).json({ message: '无法读取成绩数据' });
    }
    
    let grades = gradesData.grades;
    
    // 按照用户权限和查询参数筛选成绩
    if (user) {
      if (user.role === 'student') {
        // 学生只能查看自己的成绩统计
        grades = grades.filter(grade => grade.studentId === user.id);
      } else if (user.role === 'teacher' && !courseId) {
        // 教师只能查看自己教授课程的成绩
        const coursesData = readJSONFile('data/courses.json');
        if (coursesData) {
          const teacherCourseIds = coursesData.courses
            .filter(course => course.teacherId === user.id)
            .map(course => course.id);
          
          grades = grades.filter(grade => teacherCourseIds.includes(grade.courseId));
        }
      }
    }
    
    // 根据查询参数筛选
    if (courseId) {
      grades = grades.filter(grade => grade.courseId === courseId);
    }
    
    if (studentId) {
      grades = grades.filter(grade => grade.studentId === studentId);
    }
    
    // 没有成绩数据时返回空统计
    if (grades.length === 0) {
      return res.status(200).json({
        total: 0,
        statistics: {
          average: 0,
          highest: 0,
          lowest: 0,
          median: 0,
          passRate: 0,
          excellentRate: 0,
          distribution: []
        }
      });
    }
    
    // 计算基本统计数据
    const scores = grades.map(grade => parseFloat(grade.score));
    const validScores = scores.filter(score => !isNaN(score));
    
    // 如果没有有效成绩，返回空统计
    if (validScores.length === 0) {
      return res.status(200).json({
        total: 0,
        statistics: {
          average: 0,
          highest: 0,
          lowest: 0,
          median: 0,
          passRate: 0,
          excellentRate: 0,
          distribution: []
        }
      });
    }
    
    // 排序成绩，用于计算中位数和分布
    validScores.sort((a, b) => a - b);
    
    // 计算平均分
    const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    
    // 计算中位数
    const middle = Math.floor(validScores.length / 2);
    const median = validScores.length % 2 === 0
      ? (validScores[middle - 1] + validScores[middle]) / 2
      : validScores[middle];
    
    // 计算最高分和最低分
    const highest = validScores[validScores.length - 1];
    const lowest = validScores[0];
    
    // 计算及格率和优秀率
    const passCount = validScores.filter(score => score >= 60).length;
    const excellentCount = validScores.filter(score => score >= 90).length;
    const passRate = (passCount / validScores.length) * 100;
    const excellentRate = (excellentCount / validScores.length) * 100;
    
    // 计算分数分布
    const distribution = [
      { range: '0-59', count: validScores.filter(score => score < 60).length },
      { range: '60-69', count: validScores.filter(score => score >= 60 && score < 70).length },
      { range: '70-79', count: validScores.filter(score => score >= 70 && score < 80).length },
      { range: '80-89', count: validScores.filter(score => score >= 80 && score < 90).length },
      { range: '90-100', count: validScores.filter(score => score >= 90).length }
    ];
    
    // 根据统计类型返回不同的统计数据
    let result = {
      total: validScores.length,
      statistics: {
        average: parseFloat(average.toFixed(2)),
        highest,
        lowest,
        median: parseFloat(median.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(2)),
        excellentRate: parseFloat(excellentRate.toFixed(2)),
        distribution
      }
    };
    
    // 获取更多详细信息（如课程名称、学生姓名等）
    if (courseId) {
      const coursesData = readJSONFile('data/courses.json');
      if (coursesData) {
        const course = coursesData.courses.find(c => c.id === courseId);
        if (course) {
          result.course = {
            id: course.id,
            name: course.name,
            code: course.code
          };
        }
      }
    }
    
    if (studentId) {
      const studentsData = readJSONFile('data/students.json');
      if (studentsData) {
        const student = studentsData.students.find(s => s.id === studentId);
        if (student) {
          result.student = {
            id: student.id,
            name: student.name,
            studentId: student.studentId
          };
        }
      }
    }
    
    // 根据统计类型返回其他详细数据
    if (type === 'course-comparison' && user) {
      // 获取该学生所有课程的成绩比较
      if (user.role === 'student' || studentId) {
        const targetStudentId = studentId || user.id;
        const studentGrades = gradesData.grades.filter(grade => grade.studentId === targetStudentId);
        
        // 按课程分组统计平均分
        const courseStats = {};
        studentGrades.forEach(grade => {
          if (!courseStats[grade.courseId]) {
            courseStats[grade.courseId] = {
              scores: [],
              courseId: grade.courseId
            };
          }
          courseStats[grade.courseId].scores.push(parseFloat(grade.score));
        });
        
        // 计算每个课程的平均分
        const courseAverages = Object.values(courseStats).map(stat => {
          const avg = stat.scores.reduce((sum, score) => sum + score, 0) / stat.scores.length;
          return {
            courseId: stat.courseId,
            average: parseFloat(avg.toFixed(2))
          };
        });
        
        // 获取课程名称
        const coursesData = readJSONFile('data/courses.json');
        if (coursesData) {
          courseAverages.forEach(item => {
            const course = coursesData.courses.find(c => c.id === item.courseId);
            if (course) {
              item.courseName = course.name;
              item.courseCode = course.code;
            }
          });
        }
        
        result.courseComparison = courseAverages;
      }
    } else if (type === 'student-ranking' && courseId) {
      // 获取该课程所有学生的排名
      const courseGrades = gradesData.grades.filter(grade => grade.courseId === courseId);
      
      // 按学生分组，获取最近的成绩
      const studentLatestGrades = {};
      courseGrades.forEach(grade => {
        if (!studentLatestGrades[grade.studentId] || 
            new Date(grade.updatedAt) > new Date(studentLatestGrades[grade.studentId].updatedAt)) {
          studentLatestGrades[grade.studentId] = grade;
        }
      });
      
      // 转换为数组并排序
      const rankings = Object.values(studentLatestGrades)
        .map(grade => ({
          studentId: grade.studentId,
          score: parseFloat(grade.score)
        }))
        .sort((a, b) => b.score - a.score);
      
      // 添加排名
      rankings.forEach((item, index) => {
        item.rank = index + 1;
      });
      
      // 获取学生姓名
      const studentsData = readJSONFile('data/students.json');
      if (studentsData) {
        rankings.forEach(item => {
          const student = studentsData.students.find(s => s.id === item.studentId);
          if (student) {
            item.studentName = student.name;
            item.studentNumber = student.studentId;
          }
        });
      }
      
      result.rankings = rankings;
    }
    
    // 返回结果
    return res.status(200).json(result);
  } catch (error) {
    console.error('获取成绩统计错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
