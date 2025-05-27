import { readJSONFile } from '../../utils/fileOperations';
import { verifyToken } from '../../utils/auth';
import {
  calculateAverage,
  findHighestScore,
  findLowestScore,
  countFailingGrades,
  groupGradesByCourse,
  groupGradesByStudent,
  generateGradeDistribution,
  generateCourseComparisonData
} from '../../utils/analysisHelpers';

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

    // 只有管理员和教师可以查看分析数据
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

    // 如果是教师，只显示其负责课程的数据
    let filteredCourses = courses;
    if (user.role === 'teacher') {
      filteredCourses = courses.filter(course => course.teacherId === user.id);
    }

    // 过滤相关成绩
    const relevantGrades = grades.filter(grade => 
      filteredCourses.some(course => course.id === grade.courseId)
    );

    // 基础统计
    const totalStudents = students.length;
    const totalGrades = relevantGrades.length;
    const overallAverage = calculateAverage(relevantGrades);
    const highestScore = findHighestScore(relevantGrades);
    const lowestScore = findLowestScore(relevantGrades);
    const failingCount = countFailingGrades(relevantGrades);
    const passingRate = totalGrades > 0 ? Math.round(((totalGrades - failingCount) / totalGrades) * 100) : 0;

    // 按科目分组统计
    const courseStats = groupGradesByCourse(relevantGrades, filteredCourses);

    // 按学生分组统计
    const studentStats = groupGradesByStudent(relevantGrades, students);

    // 成绩分布
    const gradeDistribution = generateGradeDistribution(relevantGrades);

    // 课程对比数据
    const courseComparisonData = generateCourseComparisonData(courseStats);

    // 成绩分布饼图数据
    const distributionChartData = {
      labels: ['优秀(90-100)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(0-59)'],
      datasets: [{
        data: [
          gradeDistribution.excellent,
          gradeDistribution.good,
          gradeDistribution.average,
          gradeDistribution.passing,
          gradeDistribution.failing
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // 绿色 - 优秀
          'rgba(59, 130, 246, 0.8)',  // 蓝色 - 良好
          'rgba(251, 191, 36, 0.8)',  // 黄色 - 中等
          'rgba(249, 115, 22, 0.8)',  // 橙色 - 及格
          'rgba(239, 68, 68, 0.8)'    // 红色 - 不及格
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    };

    // 学生排名（按平均分）
    const studentRankings = Object.values(studentStats)
      .filter(student => student.grades.length > 0)
      .sort((a, b) => b.average - a.average)
      .slice(0, 10) // 只返回前10名
      .map((student, index) => ({
        rank: index + 1,
        studentName: student.studentName,
        studentId: student.studentId,
        average: student.average,
        totalGrades: student.grades.length
      }));

    // 课程难度分析（按平均分和不及格率）
    const courseDifficulty = Object.values(courseStats)
      .map(course => ({
        courseName: course.courseName,
        courseCode: course.courseCode,
        average: course.average,
        failingRate: course.grades.length > 0 ? 
          Math.round((course.failingCount / course.grades.length) * 100) : 0,
        totalStudents: course.grades.length
      }))
      .sort((a, b) => a.average - b.average); // 按平均分升序排列

    // 返回分析结果
    return res.status(200).json({
      success: true,
      data: {
        // 基础统计
        overview: {
          totalStudents,
          totalGrades,
          overallAverage,
          highestScore: highestScore ? {
            score: parseFloat(highestScore.score),
            studentName: students.find(s => s.id === highestScore.studentId)?.name || '未知',
            courseName: filteredCourses.find(c => c.id === highestScore.courseId)?.name || '未知'
          } : null,
          lowestScore: lowestScore ? {
            score: parseFloat(lowestScore.score),
            studentName: students.find(s => s.id === lowestScore.studentId)?.name || '未知',
            courseName: filteredCourses.find(c => c.id === lowestScore.courseId)?.name || '未知'
          } : null,
          failingCount,
          passingRate
        },
        
        // 图表数据
        charts: {
          courseComparison: courseComparisonData,
          gradeDistribution: distributionChartData
        },
        
        // 详细统计
        courseStats: Object.values(courseStats),
        studentRankings,
        courseDifficulty,
        gradeDistribution
      }
    });

  } catch (error) {
    console.error('分析数据生成错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
}
