import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Chart from 'chart.js/auto';
import { 
  FaArrowLeft, 
  FaChartBar, 
  FaChartPie, 
  FaTable,
  FaDownload,
  FaTrophy,
  FaFileExport
} from 'react-icons/fa';

export default function GradesAnalysis() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [statsData, setStatsData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [rankingsData, setRankingsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Chart refs
  const distributionChartRef = useRef(null);
  const distributionChart = useRef(null);
  const comparisonChartRef = useRef(null);
  const comparisonChart = useRef(null);

  useEffect(() => {
    // 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // 如果是学生用户，自动设置selectedStudent
      if (parsedUser.role === 'student') {
        setSelectedStudent(parsedUser.id);
      }
    } else {
      router.push('/login');
    }
    
    // 获取课程和学生列表
    fetchCourses();
    
    // 如果不是学生，获取学生列表
    if (JSON.parse(userData)?.role !== 'student') {
      fetchStudents();
    }
    
    // 检查URL查询参数
    if (router.query.courseId) {
      setSelectedCourse(router.query.courseId);
    }
    
    if (router.query.studentId) {
      setSelectedStudent(router.query.studentId);
    }
  }, [router.query]);

  // 当选择变化时，获取统计数据
  useEffect(() => {
    if (selectedCourse || selectedStudent) {
      fetchGradesStatistics();
    }
  }, [selectedCourse, selectedStudent]);

  // 当统计数据变化时，更新图表
  useEffect(() => {
    if (statsData) {
      renderDistributionChart();
    }
  }, [statsData]);

  // 当比较数据变化时，更新比较图表
  useEffect(() => {
    if (comparisonData) {
      renderComparisonChart();
    }
  }, [comparisonData]);

  // 获取课程列表
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        let coursesList = data.courses || [];
        
        // 如果是教师，只显示他们教授的课程
        if (user && user.role === 'teacher') {
          coursesList = coursesList.filter(course => course.teacherId === user.id);
        }
        
        setCourses(coursesList);
      }
    } catch (error) {
      console.error('获取课程列表失败:', error);
    }
  };

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students.filter(student => student.status === 'active'));
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
    }
  };

  // 获取成绩统计数据
  const fetchGradesStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/api/grades/statistics?';
      const params = [];
      
      if (selectedCourse) {
        params.push(`courseId=${selectedCourse}`);
      }
      
      if (selectedStudent) {
        params.push(`studentId=${selectedStudent}`);
      }
      
      // 获取基本统计数据
      const response = await fetch(url + params.join('&'));
      
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      } else {
        const data = await response.json();
        setError(data.message || '获取统计数据失败');
      }
      
      // 如果选择了学生，获取课程比较数据
      if (selectedStudent) {
        const compareUrl = `/api/grades/statistics?studentId=${selectedStudent}&type=course-comparison`;
        const compareResponse = await fetch(compareUrl);
        
        if (compareResponse.ok) {
          const compareData = await compareResponse.json();
          setComparisonData(compareData);
        }
      }
      
      // 如果选择了课程，获取排名数据
      if (selectedCourse) {
        const rankUrl = `/api/grades/statistics?courseId=${selectedCourse}&type=student-ranking`;
        const rankResponse = await fetch(rankUrl);
        
        if (rankResponse.ok) {
          const rankData = await rankResponse.json();
          setRankingsData(rankData);
        }
      }
    } catch (error) {
      console.error('获取统计数据错误:', error);
      setError('获取统计数据时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 渲染分数分布图表
  const renderDistributionChart = () => {
    if (!statsData || !statsData.statistics || !distributionChartRef.current) return;
    
    const { distribution } = statsData.statistics;
    
    // 如果图表已存在，销毁它
    if (distributionChart.current) {
      distributionChart.current.destroy();
    }
    
    const ctx = distributionChartRef.current.getContext('2d');
    
    distributionChart.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: distribution.map(item => item.range),
        datasets: [{
          label: '学生人数',
          data: distribution.map(item => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',  // 红色 (0-59)
            'rgba(255, 159, 64, 0.5)',  // 橙色 (60-69)
            'rgba(255, 205, 86, 0.5)',  // 黄色 (70-79)
            'rgba(75, 192, 192, 0.5)',  // 青色 (80-89)
            'rgba(54, 162, 235, 0.5)'   // 蓝色 (90-100)
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '成绩分布'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '学生人数'
            },
            ticks: {
              stepSize: 1
            }
          },
          x: {
            title: {
              display: true,
              text: '分数区间'
            }
          }
        }
      }
    });
  };

  // 渲染课程比较图表
  const renderComparisonChart = () => {
    if (!comparisonData || !comparisonData.courseComparison || !comparisonChartRef.current) return;
    
    const courseComparison = comparisonData.courseComparison;
    
    // 如果图表已存在，销毁它
    if (comparisonChart.current) {
      comparisonChart.current.destroy();
    }
    
    const ctx = comparisonChartRef.current.getContext('2d');
    
    comparisonChart.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: courseComparison.map(item => item.courseName || `课程 ${item.courseId.substring(0, 6)}`),
        datasets: [{
          label: '平均分',
          data: courseComparison.map(item => item.average),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '各课程成绩对比'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: '分数'
            }
          },
          x: {
            title: {
              display: true,
              text: '课程'
            }
          }
        }
      }
    });
  };

  // 导出分析数据为PDF (简单实现，实际项目可能需要使用PDF生成库)
  const exportAnalysisData = () => {
    alert('此功能将在将来的版本中实现。目前，您可以截图或使用浏览器的打印功能保存分析结果。');
  };

}
