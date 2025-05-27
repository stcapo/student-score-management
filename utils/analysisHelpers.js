// 成绩分析工具函数

/**
 * 计算平均分
 * @param {Array} grades - 成绩数组
 * @returns {number} 平均分
 */
export const calculateAverage = (grades) => {
  if (!grades || grades.length === 0) return 0;
  const sum = grades.reduce((acc, grade) => acc + parseFloat(grade.score), 0);
  return Math.round((sum / grades.length) * 100) / 100;
};

/**
 * 找出最高分
 * @param {Array} grades - 成绩数组
 * @returns {Object} 最高分信息
 */
export const findHighestScore = (grades) => {
  if (!grades || grades.length === 0) return null;
  return grades.reduce((highest, current) => {
    return parseFloat(current.score) > parseFloat(highest.score) ? current : highest;
  });
};

/**
 * 找出最低分
 * @param {Array} grades - 成绩数组
 * @returns {Object} 最低分信息
 */
export const findLowestScore = (grades) => {
  if (!grades || grades.length === 0) return null;
  return grades.reduce((lowest, current) => {
    return parseFloat(current.score) < parseFloat(lowest.score) ? current : lowest;
  });
};

/**
 * 统计不及格人数
 * @param {Array} grades - 成绩数组
 * @param {number} passingScore - 及格分数线，默认60分
 * @returns {number} 不及格人数
 */
export const countFailingGrades = (grades, passingScore = 60) => {
  if (!grades || grades.length === 0) return 0;
  return grades.filter(grade => parseFloat(grade.score) < passingScore).length;
};

/**
 * 按科目分组成绩
 * @param {Array} grades - 成绩数组
 * @param {Array} courses - 课程数组
 * @returns {Object} 按科目分组的成绩
 */
export const groupGradesByCourse = (grades, courses) => {
  const grouped = {};
  
  courses.forEach(course => {
    const courseGrades = grades.filter(grade => grade.courseId === course.id);
    grouped[course.id] = {
      courseName: course.name,
      courseCode: course.code,
      grades: courseGrades,
      average: calculateAverage(courseGrades),
      highest: findHighestScore(courseGrades),
      lowest: findLowestScore(courseGrades),
      failingCount: countFailingGrades(courseGrades)
    };
  });
  
  return grouped;
};

/**
 * 按学生分组成绩
 * @param {Array} grades - 成绩数组
 * @param {Array} students - 学生数组
 * @returns {Object} 按学生分组的成绩
 */
export const groupGradesByStudent = (grades, students) => {
  const grouped = {};
  
  students.forEach(student => {
    const studentGrades = grades.filter(grade => grade.studentId === student.id);
    grouped[student.id] = {
      studentName: student.name,
      studentId: student.studentId,
      grades: studentGrades,
      average: calculateAverage(studentGrades),
      highest: findHighestScore(studentGrades),
      lowest: findLowestScore(studentGrades),
      failingCount: countFailingGrades(studentGrades)
    };
  });
  
  return grouped;
};

/**
 * 生成成绩分布数据（用于饼图）
 * @param {Array} grades - 成绩数组
 * @returns {Object} 成绩分布数据
 */
export const generateGradeDistribution = (grades) => {
  if (!grades || grades.length === 0) {
    return {
      excellent: 0,    // 90-100分
      good: 0,         // 80-89分
      average: 0,      // 70-79分
      passing: 0,      // 60-69分
      failing: 0       // 0-59分
    };
  }

  const distribution = {
    excellent: 0,
    good: 0,
    average: 0,
    passing: 0,
    failing: 0
  };

  grades.forEach(grade => {
    const score = parseFloat(grade.score);
    if (score >= 90) {
      distribution.excellent++;
    } else if (score >= 80) {
      distribution.good++;
    } else if (score >= 70) {
      distribution.average++;
    } else if (score >= 60) {
      distribution.passing++;
    } else {
      distribution.failing++;
    }
  });

  return distribution;
};

/**
 * 检测学生成绩趋势（连续下滑预警）
 * @param {Array} grades - 学生的所有成绩，按时间排序
 * @param {number} consecutiveCount - 连续下滑次数阈值，默认3次
 * @returns {Object} 趋势分析结果
 */
export const detectGradeTrend = (grades, consecutiveCount = 3) => {
  if (!grades || grades.length < consecutiveCount) {
    return { hasWarning: false, trend: 'insufficient_data' };
  }

  // 按时间排序成绩（最新的在前）
  const sortedGrades = [...grades].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // 检查最近的连续成绩是否呈下降趋势
  let consecutiveDeclines = 0;
  
  for (let i = 0; i < sortedGrades.length - 1; i++) {
    const currentScore = parseFloat(sortedGrades[i].score);
    const nextScore = parseFloat(sortedGrades[i + 1].score);
    
    if (currentScore < nextScore) {
      consecutiveDeclines++;
      if (consecutiveDeclines >= consecutiveCount - 1) {
        return {
          hasWarning: true,
          trend: 'declining',
          consecutiveDeclines: consecutiveDeclines + 1,
          recentGrades: sortedGrades.slice(0, consecutiveDeclines + 1)
        };
      }
    } else {
      break; // 如果不是下降，则重置计数
    }
  }

  // 检查是否有上升趋势
  let consecutiveIncreases = 0;
  for (let i = 0; i < sortedGrades.length - 1; i++) {
    const currentScore = parseFloat(sortedGrades[i].score);
    const nextScore = parseFloat(sortedGrades[i + 1].score);
    
    if (currentScore > nextScore) {
      consecutiveIncreases++;
    } else {
      break;
    }
  }

  if (consecutiveIncreases >= consecutiveCount - 1) {
    return {
      hasWarning: false,
      trend: 'improving',
      consecutiveIncreases: consecutiveIncreases + 1
    };
  }

  return {
    hasWarning: false,
    trend: 'stable'
  };
};

/**
 * 分析所有学生的成绩趋势
 * @param {Array} allGrades - 所有成绩数据
 * @param {Array} students - 学生数据
 * @param {Array} courses - 课程数据
 * @returns {Array} 有预警的学生列表
 */
export const analyzeAllStudentTrends = (allGrades, students, courses) => {
  const warningStudents = [];

  students.forEach(student => {
    // 获取该学生的所有成绩
    const studentGrades = allGrades.filter(grade => grade.studentId === student.id);
    
    // 按课程分组分析趋势
    courses.forEach(course => {
      const courseGrades = studentGrades.filter(grade => grade.courseId === course.id);
      
      if (courseGrades.length >= 3) {
        const trendAnalysis = detectGradeTrend(courseGrades);
        
        if (trendAnalysis.hasWarning) {
          warningStudents.push({
            studentId: student.id,
            studentName: student.name,
            studentNumber: student.studentId,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            trendAnalysis,
            latestScore: courseGrades[0] ? parseFloat(courseGrades[0].score) : 0
          });
        }
      }
    });
  });

  return warningStudents;
};

/**
 * 生成课程平均分对比数据（用于柱状图）
 * @param {Object} courseStats - 按课程分组的统计数据
 * @returns {Object} 图表数据
 */
export const generateCourseComparisonData = (courseStats) => {
  const labels = [];
  const averages = [];
  const colors = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)'
  ];

  Object.values(courseStats).forEach((course, index) => {
    labels.push(course.courseName);
    averages.push(course.average);
  });

  return {
    labels,
    datasets: [{
      label: '平均分',
      data: averages,
      backgroundColor: colors.slice(0, labels.length),
      borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
      borderWidth: 1
    }]
  };
};
