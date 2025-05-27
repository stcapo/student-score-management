import { readJSONFile } from '../../utils/fileOperations';
import { verifyToken } from '../../utils/auth';
import { analyzeAllStudentTrends, detectGradeTrend } from '../../utils/analysisHelpers';

export default async function handler(req, res) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    // 验证用户身份
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ message: '未授权访问' });
    }

    // 只有管理员和教师可以查看趋势分析
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({ message: '权限不足' });
    }

    // 读取数据文件
    const gradesData = readJSONFile('data/grades.json');
    const studentsData = readJSONFile('data/students.json');
    const coursesData = readJSONFile('data/courses.json');

    if (!gradesData || !studentsData || !coursesData) {
      return res.status(500).json({ message: '数据读取失败' });
    }

    const grades = gradesData.grades || [];
    const students = studentsData.students || [];
    const courses = coursesData.courses || [];

    // 如果是教师，只分析其负责课程的数据
    let filteredCourses = courses;
    if (user.role === 'teacher') {
      filteredCourses = courses.filter(course => course.teacherId === user.id);
    }

    // 过滤相关成绩
    const relevantGrades = grades.filter(grade => 
      filteredCourses.some(course => course.id === grade.courseId)
    );

    // 分析所有学生的成绩趋势
    const warningStudents = analyzeAllStudentTrends(relevantGrades, students, filteredCourses);

    // 按学生分组预警信息
    const studentWarnings = {};
    warningStudents.forEach(warning => {
      if (!studentWarnings[warning.studentId]) {
        studentWarnings[warning.studentId] = {
          studentId: warning.studentId,
          studentName: warning.studentName,
          studentNumber: warning.studentNumber,
          warnings: []
        };
      }
      
      studentWarnings[warning.studentId].warnings.push({
        courseId: warning.courseId,
        courseName: warning.courseName,
        courseCode: warning.courseCode,
        trendAnalysis: warning.trendAnalysis,
        latestScore: warning.latestScore
      });
    });

    // 统计信息
    const totalWarnings = warningStudents.length;
    const studentsWithWarnings = Object.keys(studentWarnings).length;
    const coursesWithWarnings = [...new Set(warningStudents.map(w => w.courseId))].length;

    // 按课程统计预警
    const courseWarningStats = {};
    warningStudents.forEach(warning => {
      if (!courseWarningStats[warning.courseId]) {
        courseWarningStats[warning.courseId] = {
          courseId: warning.courseId,
          courseName: warning.courseName,
          courseCode: warning.courseCode,
          warningCount: 0,
          students: []
        };
      }
      
      courseWarningStats[warning.courseId].warningCount++;
      courseWarningStats[warning.courseId].students.push({
        studentId: warning.studentId,
        studentName: warning.studentName,
        studentNumber: warning.studentNumber,
        latestScore: warning.latestScore,
        consecutiveDeclines: warning.trendAnalysis.consecutiveDeclines
      });
    });

    // 严重程度分类
    const severityLevels = {
      high: [], // 连续下滑4次或以上
      medium: [], // 连续下滑3次
      low: [] // 其他情况
    };

    warningStudents.forEach(warning => {
      const declines = warning.trendAnalysis.consecutiveDeclines || 0;
      if (declines >= 4) {
        severityLevels.high.push(warning);
      } else if (declines === 3) {
        severityLevels.medium.push(warning);
      } else {
        severityLevels.low.push(warning);
      }
    });

    // 最近预警（按最新成绩时间排序）
    const recentWarnings = warningStudents
      .sort((a, b) => {
        const aLatestDate = a.trendAnalysis.recentGrades?.[0]?.createdAt || '1970-01-01';
        const bLatestDate = b.trendAnalysis.recentGrades?.[0]?.createdAt || '1970-01-01';
        return new Date(bLatestDate) - new Date(aLatestDate);
      })
      .slice(0, 10); // 只返回最近的10个预警

    return res.status(200).json({
      success: true,
      data: {
        // 统计概览
        summary: {
          totalWarnings,
          studentsWithWarnings,
          coursesWithWarnings,
          severityBreakdown: {
            high: severityLevels.high.length,
            medium: severityLevels.medium.length,
            low: severityLevels.low.length
          }
        },
        
        // 预警详情
        warnings: {
          byStudent: Object.values(studentWarnings),
          byCourse: Object.values(courseWarningStats),
          bySeverity: severityLevels,
          recent: recentWarnings
        },
        
        // 用于前端显示的简化数据
        studentWarningMap: Object.keys(studentWarnings).reduce((map, studentId) => {
          map[studentId] = {
            hasWarning: true,
            warningCount: studentWarnings[studentId].warnings.length,
            highestSeverity: Math.max(...studentWarnings[studentId].warnings.map(w => 
              w.trendAnalysis.consecutiveDeclines || 0
            ))
          };
          return map;
        }, {})
      }
    });

  } catch (error) {
    console.error('趋势分析错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
