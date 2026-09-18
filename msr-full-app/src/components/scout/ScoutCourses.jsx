// src/components/scout/ScoutCourses.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ScoutCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [courseTopics, setCourseTopics] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [assessmentInfo, setAssessmentInfo] = useState({
    totalQuestions: 0,
    attempts: 0,
    maxAttempts: 1,
    allowRetake: false,
    passingScore: 70,
    timeLimit: null,
    hasAttempted: false,
    remainingAttempts: 0,
    isMaxAttemptsReached: false,
    isCompleted: false
  });
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [isMaximized, setIsMaximized] = useState(false);
  const [maximizedTopic, setMaximizedTopic] = useState(null);

  // ============================================
  // LIFECYCLE & EFFECTS
  // ============================================

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMaximized) {
        exitFullscreen();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isMaximized]);

  // ============================================
  // FULLSCREEN FUNCTIONS
  // ============================================

  const enterFullscreen = (topic) => {
    setIsMaximized(true);
    setMaximizedTopic(topic);
    document.body.style.overflow = 'hidden';
  };

  const exitFullscreen = () => {
    setIsMaximized(false);
    setMaximizedTopic(null);
    document.body.style.overflow = 'auto';
  };

  // ============================================
  // API CALLS
  // ============================================

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view courses');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/scout/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let coursesData = [];
      if (response.data?.courses) {
        coursesData = response.data.courses;
      } else if (Array.isArray(response.data)) {
        coursesData = response.data;
      }
      
      setCourses(coursesData || []);
    } catch (err) {
      console.error('❌ Fetch courses error:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setEnrolledCourses([]);
        return;
      }

      const response = await axios.get(`${API_URL}/scout/courses/my-enrollments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let enrolledData = [];
      if (response.data?.enrollments) {
        enrolledData = response.data.enrollments.map(enrollment => ({
          id: enrollment.courseId,
          title: enrollment.courseTitle,
          progress: enrollment.progress || 0,
          status: enrollment.status,
          enrollmentStatus: enrollment.status === 'completed' ? 'completed' : 'active'
        }));
      } else if (Array.isArray(response.data)) {
        enrolledData = response.data;
      }
      
      setEnrolledCourses(enrolledData || []);
    } catch (err) {
      console.error('❌ Failed to fetch enrolled courses:', err);
      setEnrolledCourses([]);
    }
  };

  // ✅ FIXED: Fetch course topics with proper status checking
  const fetchCourseTopics = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/scout/courses/${courseId}/topics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const topics = response.data.topics || [];
      console.log('📊 Topics fetched:', topics.length);
      
      setCourseTopics(topics);
      
      // ✅ Check status for each assessment
      await checkAllAssessmentStatus(topics);
      
      const expandedState = {};
      topics.forEach(topic => {
        expandedState[topic.id] = false;
      });
      setExpandedTopics(expandedState);
    } catch (err) {
      console.error('❌ Failed to fetch course topics:', err);
      setCourseTopics([]);
    }
  };

  // ✅ FIXED: Check assessment status - ALWAYS fetch fresh data
  const checkAllAssessmentStatus = async (topics) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No token found, skipping status check');
      return;
    }
    
    const statusMap = {};
    
    for (const topic of topics) {
      if (topic.assessments && topic.assessments.length > 0) {
        for (const assessment of topic.assessments) {
          try {
            // ✅ ALWAYS fetch fresh data from API - NO CACHING
            const response = await axios.get(`${API_URL}/assessments/${assessment.id}/info`, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            const attempts = response.data.attempts || 0;
            
            // ✅ CRITICAL: Use maxAttempts from the assessment data
            const maxAttempts = assessment.max_attempts || 1;
            const allowRetake = assessment.allow_retake || false;
            const isMaxAttemptsReached = allowRetake ? attempts >= maxAttempts : attempts > 0;
            
            console.log(`📊 Assessment ${assessment.id} (${assessment.title}):`, {
              attempts,
              maxAttempts,
              allowRetake,
              isMaxAttemptsReached,
              hasAttempted: attempts > 0
            });
            
            statusMap[assessment.id] = {
              attempts,
              maxAttempts,
              allowRetake,
              isMaxAttemptsReached,
              isCompleted: topic.is_completed || false,
              hasAttempted: attempts > 0,
              remainingAttempts: allowRetake ? Math.max(0, maxAttempts - attempts) : (attempts > 0 ? 0 : 1),
              lastChecked: new Date().toISOString()
            };
          } catch (err) {
            console.warn(`⚠️ Could not fetch status for assessment ${assessment.id}, assuming 0 attempts:`, err.message);
            // ✅ Default to 0 attempts but use correct maxAttempts
            statusMap[assessment.id] = {
              attempts: 0,
              maxAttempts: assessment.max_attempts || 1,
              allowRetake: assessment.allow_retake || false,
              isMaxAttemptsReached: false,
              isCompleted: topic.is_completed || false,
              hasAttempted: false,
              remainingAttempts: assessment.max_attempts || 1,
              lastChecked: new Date().toISOString()
            };
          }
        }
      }
    }
    
    setAssessmentStatus(statusMap);
  };

  const fetchCourseProgress = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/scout/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseProgress(response.data.progress?.percentage || 0);
    } catch (err) {
      console.error('❌ Failed to fetch course progress:', err);
      setCourseProgress(0);
    }
  };

  // ============================================
  // ENROLLMENT
  // ============================================

  const enrollInCourse = async (courseId) => {
    try {
      setEnrolling(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to enroll');
        return;
      }

      await axios.post(`${API_URL}/scout/courses/${courseId}/enroll`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('✅ Successfully enrolled in course!');
      setTimeout(() => setSuccess(''), 3000);
      
      await fetchEnrolledCourses();
      await fetchCourses();
      
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Already enrolled in this course');
        await fetchEnrolledCourses();
      } else {
        setError(err.response?.data?.message || 'Failed to enroll in course');
      }
      setTimeout(() => setError(''), 5000);
    } finally {
      setEnrolling(false);
    }
  };

  // ============================================
  // COURSE VIEW
  // ============================================

  const openCourseView = async (course) => {
    setSelectedCourse(course);
    await Promise.all([
      fetchCourseTopics(course.id),
      fetchCourseProgress(course.id)
    ]);
    setShowCourseModal(true);
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const expandAllTopics = () => {
    const expandedState = {};
    courseTopics.forEach(topic => {
      expandedState[topic.id] = true;
    });
    setExpandedTopics(expandedState);
  };

  const collapseAllTopics = () => {
    const expandedState = {};
    courseTopics.forEach(topic => {
      expandedState[topic.id] = false;
    });
    setExpandedTopics(expandedState);
  };

  // ============================================
  // ✅ FIXED: OPEN ASSESSMENT
  // ============================================

  const openAssessment = async (topic, assessment) => {
    if (!assessment || !assessment.id) {
      setError('❌ Assessment not found');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedTopic(topic);
    setSelectedAssessment(assessment);

    console.log('📝 Opening assessment:', {
      id: assessment.id,
      title: assessment.title,
      allowRetake: assessment.allow_retake,
      maxAttempts: assessment.max_attempts
    });

    const token = localStorage.getItem('token');
    if (!token) {
      setError('❌ Please login to access assessments');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const infoResponse = await axios.get(`${API_URL}/assessments/${assessment.id}/info`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const attempts = infoResponse.data.attempts || 0;
      
      // ✅ CRITICAL: Use maxAttempts from assessment, NOT from response
      const maxAttempts = assessment.max_attempts || 1;
      const allowRetake = assessment.allow_retake || false;
      const remainingAttempts = allowRetake ? Math.max(0, maxAttempts - attempts) : (attempts > 0 ? 0 : 1);
      const isMaxAttemptsReached = allowRetake ? attempts >= maxAttempts : attempts > 0;
      const isCompleted = topic.is_completed || false;
      
      console.log('📊 Fresh assessment info from API:', {
        assessmentId: assessment.id,
        attempts: attempts,
        maxAttempts: maxAttempts,
        allowRetake: allowRetake,
        isMaxAttemptsReached: isMaxAttemptsReached,
        remainingAttempts: remainingAttempts
      });
      
      setAssessmentInfo({
        totalQuestions: assessment.questions?.length || 0,
        attempts: attempts,
        maxAttempts: maxAttempts,
        allowRetake: allowRetake,
        passingScore: assessment.passing_score || 70,
        timeLimit: assessment.time_limit || null,
        hasAttempted: attempts > 0,
        remainingAttempts: remainingAttempts,
        isMaxAttemptsReached: isMaxAttemptsReached,
        isCompleted: isCompleted
      });
      
      setAssessmentStatus(prev => ({
        ...prev,
        [assessment.id]: {
          attempts: attempts,
          maxAttempts: maxAttempts,
          allowRetake: allowRetake,
          isMaxAttemptsReached: isMaxAttemptsReached,
          isCompleted: isCompleted,
          hasAttempted: attempts > 0,
          remainingAttempts: remainingAttempts,
          lastChecked: new Date().toISOString()
        }
      }));
      
      if (isMaxAttemptsReached) {
        console.log(`📊 Max attempts reached (${attempts}/${maxAttempts}), showing results`);
        await showAssessmentResults(assessment);
        return;
      }
      
      if (isCompleted) {
        console.log('📊 Assessment completed, showing results');
        await showAssessmentResults(assessment);
        return;
      }
      
      console.log(`📊 Showing start screen, attempts: ${attempts}/${maxAttempts}`);
      const questions = assessment.questions || [];
      setAssessmentQuestions(questions);
      setCurrentQuestionIndex(0);
      setAnswers(new Array(questions.length).fill(''));
      setAssessmentResult(null);
      setShowStartScreen(true);
      setShowAssessmentModal(true);
      
    } catch (err) {
      console.error('❌ Error opening assessment:', err);
      const questions = assessment.questions || [];
      setAssessmentQuestions(questions);
      setCurrentQuestionIndex(0);
      setAnswers(new Array(questions.length).fill(''));
      setAssessmentResult(null);
      setShowStartScreen(true);
      setShowAssessmentModal(true);
    }
  };

  // ============================================
  // ✅ FIXED: SHOW ASSESSMENT RESULTS
  // ============================================

  const showAssessmentResults = async (assessment) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('❌ Please login to view results');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      console.log('📊 Fetching results for assessment:', assessment.id);
      
      const resultsResponse = await axios.get(`${API_URL}/assessments/${assessment.id}/results`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      const lastAttempt = resultsResponse.data.attempts?.[0];
      if (lastAttempt) {
        console.log('📊 Last attempt results:', lastAttempt);
        
        const questions = assessment.questions || [];
        const gradedAnswers = questions.map((question, index) => {
          const userAnswer = lastAttempt.answers?.[index] || null;
          let isCorrect = false;
          
          if (question.type === 'multiple-choice') {
            isCorrect = userAnswer === question.correctAnswer;
          } else if (question.type === 'true-false') {
            isCorrect = userAnswer === question.correctAnswer;
          } else if (question.type === 'short-answer') {
            const correctAnswersList = question.correctAnswers || [];
            isCorrect = correctAnswersList.some(a => 
              userAnswer && userAnswer.toLowerCase().includes(a.toLowerCase())
            );
          }
          
          return {
            question: question.question,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            correctAnswer: question.correctAnswer || question.correctAnswers?.join(', ') || null
          };
        });
        
        // ✅ Get fresh attempt count
        const infoResponse = await axios.get(`${API_URL}/assessments/${assessment.id}/info`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        
        const attempts = infoResponse.data.attempts || 0;
        const maxAttempts = assessment.max_attempts || 1;
        const allowRetake = assessment.allow_retake || false;
        
        // ✅ CORRECT: Only set isMaxAttemptsReached if attempts >= maxAttempts
        const isMaxAttemptsReached = allowRetake ? attempts >= maxAttempts : attempts > 0;
        
        console.log('📊 Results state:', {
          attempts,
          maxAttempts,
          allowRetake,
          isMaxAttemptsReached,
          attemptNumber: lastAttempt.attempt_number
        });
        
        setAssessmentResult({
          score: lastAttempt.score || 0,
          passed: lastAttempt.passed || false,
          correctAnswers: lastAttempt.correct_answers || gradedAnswers.filter(a => a.isCorrect).length,
          totalQuestions: questions.length,
          gradedAnswers: gradedAnswers,
          attemptNumber: lastAttempt.attempt_number || 1,
          maxAttempts: maxAttempts,
          isMaxAttemptsReached: isMaxAttemptsReached,
          isCompleted: true,
          attempts: attempts,
          allowRetake: allowRetake
        });
        
        setAssessmentInfo(prev => ({
          ...prev,
          attempts: attempts,
          maxAttempts: maxAttempts,
          allowRetake: allowRetake,
          hasAttempted: attempts > 0,
          isMaxAttemptsReached: isMaxAttemptsReached,
          remainingAttempts: allowRetake ? Math.max(0, maxAttempts - attempts) : 0,
          isCompleted: true
        }));
        
        setShowStartScreen(false);
        setShowAssessmentModal(true);
      } else {
        const questions = assessment.questions || [];
        setAssessmentQuestions(questions);
        setCurrentQuestionIndex(0);
        setAnswers(new Array(questions.length).fill(''));
        setAssessmentResult(null);
        setShowStartScreen(true);
        setShowAssessmentModal(true);
      }
    } catch (err) {
      console.error('❌ Error fetching results:', err);
      setError('❌ Could not load assessment results. Please try again.');
      setTimeout(() => setError(''), 3000);
      
      const questions = assessment.questions || [];
      setAssessmentQuestions(questions);
      setCurrentQuestionIndex(0);
      setAnswers(new Array(questions.length).fill(''));
      setAssessmentResult(null);
      setShowStartScreen(true);
      setShowAssessmentModal(true);
    }
  };

  const startAssessment = () => {
    if (assessmentInfo.isMaxAttemptsReached) {
      setError('⚠️ You have reached the maximum number of attempts.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (assessmentInfo.isCompleted) {
      setError('✅ This assessment has already been completed.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setShowStartScreen(false);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(assessmentQuestions.length).fill(''));
    setAssessmentResult(null);
  };

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // ============================================
  // ✅ FIXED: SUBMIT ASSESSMENT
  // ============================================

  const submitAssessment = async () => {
    const unanswered = answers.some(a => !a || a.trim() === '');
    if (unanswered) {
      setError('⚠️ Please answer all questions before submitting');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const assessment = selectedAssessment;
      
      if (!assessment) {
        setError('No assessment found');
        return;
      }

      const payload = {
        answers: answers
      };

      console.log('📤 Submitting assessment:', {
        assessmentId: assessment.id,
        answers: answers,
        answerCount: answers.length
      });

      const response = await axios.post(
        `${API_URL}/assessments/${assessment.id}/submit`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('✅ Success:', response.data);
      
      const updatedAttempts = (assessmentStatus[assessment.id]?.attempts || 0) + 1;
      const maxAttempts = assessment.max_attempts || 1;
      const allowRetake = assessment.allow_retake || false;
      const isMaxAttemptsReached = allowRetake ? updatedAttempts >= maxAttempts : true;
      
      setAssessmentStatus(prev => ({
        ...prev,
        [assessment.id]: {
          ...prev[assessment.id],
          hasAttempted: true,
          attempts: updatedAttempts,
          isMaxAttemptsReached: isMaxAttemptsReached,
          remainingAttempts: allowRetake ? Math.max(0, maxAttempts - updatedAttempts) : 0,
          lastChecked: new Date().toISOString()
        }
      }));
      
      const attemptData = response.data.attempt || response.data;
      setAssessmentResult({
        ...attemptData,
        isMaxAttemptsReached: isMaxAttemptsReached,
        isCompleted: true,
        attempts: updatedAttempts,
        allowRetake: allowRetake,
        maxAttempts: maxAttempts
      });
      
      setAssessmentInfo(prev => ({
        ...prev,
        attempts: updatedAttempts,
        hasAttempted: true,
        isMaxAttemptsReached: isMaxAttemptsReached,
        remainingAttempts: allowRetake ? Math.max(0, maxAttempts - updatedAttempts) : 0,
        isCompleted: true
      }));
      
      setSuccess('✅ Assessment submitted successfully!');
      
      if (selectedCourse) {
        await fetchCourseProgress(selectedCourse.id);
        await fetchCourseTopics(selectedCourse.id);
      }
      
    } catch (err) {
      console.error('❌ Submission Error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      });
      
      let errorMessage = 'Failed to submit assessment';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        if (errorMessage.includes('maximum number of attempts')) {
          const match = errorMessage.match(/\d+/);
          const maxAttempts = match ? match[0] : '';
          errorMessage = `📝 You have reached the maximum number of attempts (${maxAttempts || 'multiple'}). No more attempts allowed.`;
        } else if (errorMessage.includes('already submitted') || errorMessage.includes('Retakes are not allowed')) {
          errorMessage = '📝 You have already submitted this assessment. Retakes are not allowed.';
        }
      }
      
      setError(`❌ ${errorMessage}`);
      setTimeout(() => setError(''), 6000);
      
      if (err.response?.data?.message?.includes('maximum number of attempts')) {
        await showAssessmentResults(selectedAssessment);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ FIXED: GET ASSESSMENT BUTTON STATE
  // ============================================

  const getAssessmentButtonState = (assessment, topic) => {
    const status = assessmentStatus[assessment.id] || {};
    
    const attempts = status.attempts !== undefined ? status.attempts : 0;
    
    // ✅ CRITICAL: Use maxAttempts from assessment data, NOT from status
    const maxAttempts = assessment.max_attempts || 1;
    const allowRetake = assessment.allow_retake || false;
    const isCompleted = topic.is_completed || status.isCompleted || false;
    const isMaxAttemptsReached = allowRetake ? attempts >= maxAttempts : attempts > 0;
    const hasAttempted = attempts > 0;
    
    const isDisabled = isCompleted || isMaxAttemptsReached;
    
    let buttonText = 'Take Quiz';
    let buttonStyle = {
      background: '#FFD100',
      color: '#002B5C',
      padding: '4px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.75rem'
    };
    
    if (isCompleted) {
      buttonText = '✅ Completed';
      buttonStyle = {
        ...buttonStyle,
        background: '#D1FAE5',
        color: '#065F46',
        cursor: 'default'
      };
    } else if (isMaxAttemptsReached) {
      buttonText = '🔒 Max Attempts';
      buttonStyle = {
        ...buttonStyle,
        background: '#FEE2E2',
        color: '#991B1B',
        cursor: 'not-allowed'
      };
    }
    
    console.log(`🔘 Button state for assessment ${assessment.id}:`, {
      attempts,
      maxAttempts,
      isMaxAttemptsReached,
      isDisabled,
      buttonText
    });
    
    return { isDisabled, buttonText, buttonStyle, attempts, maxAttempts };
  };

  // ============================================
  // FORCE REFRESH
  // ============================================

  const refreshAssessmentStatus = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      if (selectedCourse && courseTopics.length > 0) {
        console.log('🔄 Force refreshing assessment status...');
        await checkAllAssessmentStatus(courseTopics);
        setSuccess('✅ Assessment status refreshed!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('❌ Refresh failed:', err);
      setError('❌ Failed to refresh status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(c => c.id === courseId);
  };

  const getEnrollmentDetails = (courseId) => {
    return enrolledCourses.find(c => c.id === courseId);
  };

  const getEnrollmentStatus = (courseId) => {
    const enrollment = getEnrollmentDetails(courseId);
    if (!enrollment) return null;
    
    if (enrollment.enrollmentStatus === 'completed' || enrollment.status === 'completed') {
      return { text: '✅ Completed', className: 'badge-completed' };
    }
    if ((enrollment.progress || 0) > 0) {
      return { text: `🔄 In Progress (${enrollment.progress || 0}%)`, className: 'badge-in-progress' };
    }
    return { text: '✅ Enrolled', className: 'badge-approved' };
  };

  // ============================================
  // RENDER: FULLSCREEN
  // ============================================

  if (isMaximized && maximizedTopic) {
    return (
      <div className="fullscreen-lesson">
        <div className="fullscreen-lesson-header" style={{ 
          background: 'linear-gradient(135deg, #002B5C, #004080)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="fullscreen-lesson-info">
            <span className="fullscreen-course-title" style={{ color: '#FFD100', fontWeight: 'bold' }}>
              {selectedCourse?.title}
            </span>
            <span className="fullscreen-topic-title" style={{ color: 'white', marginLeft: '12px' }}>
              {maximizedTopic.title}
            </span>
          </div>
          <div className="fullscreen-lesson-actions">
            <button className="fullscreen-exit-btn" onClick={exitFullscreen} style={{
              background: '#DC2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              <i className="fas fa-compress"></i> Exit Fullscreen
            </button>
          </div>
        </div>
        <div className="fullscreen-lesson-body" style={{ padding: '24px', maxHeight: 'calc(100vh - 80px)', overflow: 'auto' }}>
          <div className="fullscreen-lesson-content">
            <div className="fullscreen-progress" style={{ marginBottom: '24px' }}>
              <div className="fullscreen-progress-bar" style={{
                height: '8px',
                background: '#E5E7EB',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div className="fullscreen-progress-fill" style={{ 
                  width: `${courseProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #16A34A, #22C55E)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <span className="fullscreen-progress-text" style={{
                color: '#16A34A',
                marginTop: '8px',
                display: 'block',
                fontWeight: 'bold'
              }}>{courseProgress}% Complete</span>
            </div>

            <div className="fullscreen-content">
              <h2 style={{ color: '#002B5C' }}>{maximizedTopic.title}</h2>
              {maximizedTopic.description && (
                <div className="fullscreen-description" style={{ color: '#4B5563', marginBottom: '16px' }}>
                  <p>{maximizedTopic.description}</p>
                </div>
              )}
              {maximizedTopic.content && (
                <div className="fullscreen-lesson-text" style={{ color: '#374151', lineHeight: '1.8' }}>
                  {maximizedTopic.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              )}

              {maximizedTopic.materials && maximizedTopic.materials.length > 0 && (
                <div className="fullscreen-materials" style={{ marginTop: '24px' }}>
                  <h4 style={{ color: '#002B5C' }}>📎 Materials</h4>
                  <div className="fullscreen-materials-list" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {maximizedTopic.materials.map((material, idx) => (
                      <span key={idx} className="fullscreen-material-tag" style={{
                        background: '#F3F4F6',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '0.875rem',
                        color: '#002B5C'
                      }}>
                        <i className={`fas ${material.type === 'pdf' ? 'fa-file-pdf' : 
                          material.type === 'video' ? 'fa-video' : 
                          material.type === 'image' ? 'fa-image' : 
                          material.type === 'link' ? 'fa-link' : 'fa-file'}`}></i>
                        {material.title}
                        {material.url && (
                          <a href={material.url} target="_blank" rel="noopener noreferrer" className="material-link" style={{ color: '#2563EB', marginLeft: '4px' }}>
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="fullscreen-navigation" style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <div className="fullscreen-nav-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                <button className="btn-secondary" onClick={() => {
                  const currentIndex = courseTopics.findIndex(t => t.id === maximizedTopic.id);
                  if (currentIndex > 0) {
                    const prevTopic = courseTopics[currentIndex - 1];
                    setMaximizedTopic(prevTopic);
                  }
                }} style={{
                  background: '#6B7280',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <i className="fas fa-arrow-left"></i> Previous
                </button>
                <button className="btn-secondary" onClick={exitFullscreen} style={{
                  background: '#DC2626',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <i className="fas fa-times"></i> Close Lesson
                </button>
                <button className="btn-primary" onClick={() => {
                  const currentIndex = courseTopics.findIndex(t => t.id === maximizedTopic.id);
                  if (currentIndex < courseTopics.length - 1) {
                    const nextTopic = courseTopics[currentIndex + 1];
                    setMaximizedTopic(nextTopic);
                  }
                }} style={{
                  background: '#FFD100',
                  color: '#002B5C',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  Next <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: LOADING
  // ============================================

  if (loading) {
    return (
      <div className="dashboard-loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div className="spinner-large"></div>
        <p style={{ marginLeft: '12px', color: '#6B7280' }}>Loading courses...</p>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN
  // ============================================

  return (
    <div className="dashboard-container" style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* HEADER */}
      <div className="page-header" style={{ 
        borderBottom: '4px solid #FFD100',
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <h2 style={{ color: '#002B5C', margin: 0 }}>
            <i className="fas fa-book" style={{ color: '#FFD100' }}></i> Scout Courses
          </h2>
          <p style={{ color: '#4B5563', margin: '4px 0 0 0' }}>Explore and enroll in available courses</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge" style={{
            background: '#002B5C',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.875rem'
          }}>
            <i className="fas fa-graduation-cap"></i> {enrolledCourses.length} Enrolled
          </span>
          <button className="btn-secondary-sm" onClick={() => {
            fetchCourses();
            fetchEnrolledCourses();
          }} style={{
            background: '#FFD100',
            color: '#002B5C',
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="alert alert-error" style={{
          background: '#FEE2E2',
          borderLeft: '4px solid #DC2626',
          padding: '12px 16px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <i className="fas fa-exclamation-circle" style={{ color: '#DC2626' }}></i>
          <p style={{ color: '#991B1B', margin: 0, flex: 1 }}>{error}</p>
          <button className="btn-close" onClick={() => setError('')} style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#991B1B'
          }}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{
          background: '#D1FAE5',
          borderLeft: '4px solid #16A34A',
          padding: '12px 16px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <i className="fas fa-check-circle" style={{ color: '#16A34A' }}></i>
          <p style={{ color: '#065F46', margin: 0, flex: 1 }}>{success}</p>
          <button className="btn-close" onClick={() => setSuccess('')} style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#065F46'
          }}>×</button>
        </div>
      )}

      {/* COURSES GRID */}
      <div className="courses-grid" style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {courses.length === 0 ? (
          <div className="empty-state" style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '48px',
            background: '#F9FAFB',
            borderRadius: '12px'
          }}>
            <i className="fas fa-book" style={{ color: '#FFD100', fontSize: '3rem' }}></i>
            <h3 style={{ color: '#002B5C' }}>No Courses Available</h3>
            <p style={{ color: '#6B7280' }}>Check back later for new courses</p>
          </div>
        ) : (
          courses.map(course => {
            const enrolled = isEnrolled(course.id);
            const statusInfo = getEnrollmentStatus(course.id);
            
            return (
              <div key={course.id} className="course-card" style={{
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div className="course-image" style={{ 
                  background: enrolled ? 'linear-gradient(135deg, #16A34A, #22C55E)' : 'linear-gradient(135deg, #002B5C, #004080)',
                  padding: '20px',
                  textAlign: 'center',
                  color: 'white',
                  position: 'relative'
                }}>
                  <i className={`fas ${enrolled ? 'fa-check-circle' : 'fa-graduation-cap'}`} style={{ fontSize: '2rem' }}></i>
                  {enrolled && (
                    <span className="enrolled-badge" style={{
                      background: '#FFD100',
                      color: '#002B5C',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      marginLeft: '8px',
                      display: 'inline-block'
                    }}>✓ Enrolled</span>
                  )}
                </div>
                <div className="course-body" style={{ padding: '20px' }}>
                  <h4 style={{ color: '#002B5C', marginBottom: '8px', fontSize: '1.1rem' }}>{course.title}</h4>
                  <p style={{ color: '#4B5563', fontSize: '0.875rem', marginBottom: '12px', lineHeight: '1.5' }}>
                    {course.description}
                  </p>
                  <div className="course-meta" style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <span><i className="fas fa-clock"></i> {course.duration || 'Self-paced'}</span>
                    <span><i className="fas fa-signal"></i> {course.level || 'Beginner'}</span>
                    <span><i className="fas fa-users"></i> {course.enrolledCount || 0} enrolled</span>
                  </div>
                  <div className="course-actions" style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {enrolled ? (
                      <>
                        <button 
                          className="btn-sm btn-view" 
                          onClick={() => openCourseView(course)}
                          style={{
                            background: '#002B5C',
                            color: 'white',
                            padding: '6px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          <i className="fas fa-eye"></i> View Course
                        </button>
                        {statusInfo && (
                          <span className={`status-badge ${statusInfo.className}`} style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: statusInfo.className === 'badge-completed' ? '#D1FAE5' : 
                                      statusInfo.className === 'badge-in-progress' ? '#FEF3C7' : '#DBEAFE',
                            color: statusInfo.className === 'badge-completed' ? '#065F46' : 
                                   statusInfo.className === 'badge-in-progress' ? '#92400E' : '#1E40AF'
                          }}>
                            {statusInfo.text}
                          </span>
                        )}
                      </>
                    ) : (
                      <button 
                        className="btn-sm btn-enroll" 
                        onClick={() => enrollInCourse(course.id)}
                        disabled={enrolling}
                        style={{
                          background: '#FFD100',
                          color: '#002B5C',
                          padding: '6px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: enrolling ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          opacity: enrolling ? 0.6 : 1
                        }}
                      >
                        {enrolling ? (
                          <><span className="spinner-small"></span> Enrolling...</>
                        ) : (
                          <><i className="fas fa-plus"></i> Enroll</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================== */}
      {/* COURSE VIEW MODAL */}
      {/* ========================================== */}
      {showCourseModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowCourseModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '0'
          }}>
            <div className="modal-header" style={{
              padding: '20px 24px',
              borderBottom: '2px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F9FAFB',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div className="modal-header-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ color: '#002B5C', margin: 0 }}>
                  <i className="fas fa-book" style={{ color: '#FFD100' }}></i>
                  {selectedCourse.title}
                </h3>
                <span className="course-status-badge" style={{
                  background: '#16A34A',
                  color: 'white',
                  padding: '2px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem'
                }}>{selectedCourse.status}</span>
              </div>
              <div className="modal-header-right" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-sm btn-expand-all" onClick={expandAllTopics} style={{
                  background: '#002B5C',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}>
                  <i className="fas fa-expand"></i> Expand All
                </button>
                <button className="btn-sm btn-collapse-all" onClick={collapseAllTopics} style={{
                  background: '#6B7280',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}>
                  <i className="fas fa-compress"></i> Collapse All
                </button>
                <button 
                  className="btn-sm btn-refresh" 
                  onClick={refreshAssessmentStatus}
                  disabled={isRefreshing}
                  style={{
                    background: isRefreshing ? '#9CA3AF' : '#10B981',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: isRefreshing ? 'not-allowed' : 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync'}`}></i> 
                  {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
                </button>
                <button className="modal-close" onClick={() => setShowCourseModal(false)} style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {/* Course Description */}
              <div className="course-description-section" style={{ marginBottom: '24px' }}>
                <p style={{ color: '#4B5563' }}>{selectedCourse.description}</p>
                <div className="course-meta-tags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span className="tag" style={{
                    background: '#F3F4F6',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    color: '#4B5563'
                  }}><i className="fas fa-clock"></i> {selectedCourse.duration || 'Self-paced'}</span>
                  <span className="tag" style={{
                    background: '#F3F4F6',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    color: '#4B5563'
                  }}><i className="fas fa-signal"></i> {selectedCourse.level || 'Beginner'}</span>
                  <span className="tag" style={{
                    background: '#F3F4F6',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    color: '#4B5563'
                  }}><i className="fas fa-users"></i> {selectedCourse.enrolledCount || 0} enrolled</span>
                </div>
              </div>

              {/* Progress */}
              <div className="course-progress" style={{ marginBottom: '24px' }}>
                <div className="progress-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#002B5C' }}><i className="fas fa-chart-line"></i> Your Progress</span>
                  <span className="progress-percentage" style={{ color: '#16A34A', fontWeight: 'bold' }}>{courseProgress}%</span>
                </div>
                <div className="progress-bar" style={{
                  height: '8px',
                  background: '#E5E7EB',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div className="progress-fill" style={{
                    width: `${courseProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #16A34A, #22C55E)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              {/* Topics */}
              <div className="course-topics">
                <div className="topics-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <h4 style={{ color: '#002B5C', margin: 0 }}>
                    <i className="fas fa-list"></i> Topics ({courseTopics.length})
                  </h4>
                  <div className="topics-stats">
                    <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                      Completed: {courseTopics.filter(t => t.is_completed).length}
                    </span>
                  </div>
                </div>
                
                {courseTopics.length === 0 ? (
                  <div className="empty-state small" style={{ textAlign: 'center', padding: '24px' }}>
                    <i className="fas fa-folder-open" style={{ color: '#FFD100', fontSize: '2rem' }}></i>
                    <p style={{ color: '#6B7280' }}>No topics available for this course yet.</p>
                    <small style={{ color: '#9CA3AF' }}>Check back later for content.</small>
                  </div>
                ) : (
                  <div className="topics-list">
                    {courseTopics.map((topic, index) => {
                      const isExpanded = expandedTopics[topic.id] || false;
                      const hasAssessment = topic.assessments && topic.assessments.length > 0;
                      
                      return (
                        <div key={topic.id} className={`topic-panel ${isExpanded ? 'expanded' : 'collapsed'}`} style={{
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          overflow: 'hidden',
                          transition: 'all 0.2s'
                        }}>
                          <div 
                            className="topic-panel-header"
                            onClick={() => toggleTopic(topic.id)}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: isExpanded ? '#F9FAFB' : 'white',
                              transition: 'background 0.2s',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}
                          >
                            <div className="topic-panel-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <span className="topic-number" style={{
                                background: '#002B5C',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>{index + 1}</span>
                              <div className="topic-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <h5 style={{ margin: 0, color: '#002B5C' }}>{topic.title}</h5>
                                <span className={`topic-type-badge ${topic.type}`} style={{
                                  fontSize: '0.625rem',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  background: topic.type === 'video' ? '#8B5CF6' : 
                                            topic.type === 'reading' ? '#3B82F6' : '#6B7280',
                                  color: 'white'
                                }}>{topic.type}</span>
                              </div>
                            </div>
                            <div className="topic-panel-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {topic.is_completed && (
                                <span className="topic-completed-badge" style={{
                                  background: '#D1FAE5',
                                  color: '#065F46',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.625rem'
                                }}>✅ Completed</span>
                              )}
                              <button 
                                className="btn-sm btn-maximize-lesson"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  enterFullscreen(topic);
                                }}
                                title="Maximize lesson"
                                style={{
                                  background: '#FFD100',
                                  color: '#002B5C',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <i className="fas fa-expand"></i>
                              </button>
                              <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`} style={{
                                transition: 'transform 0.2s',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                display: 'inline-block'
                              }}>
                                <i className="fas fa-chevron-down" style={{ color: '#6B7280' }}></i>
                              </span>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="topic-panel-content" style={{ padding: '16px', borderTop: '1px solid #E5E7EB' }}>
                              {topic.description && (
                                <div className="topic-description" style={{ marginBottom: '12px' }}>
                                  <p style={{ color: '#4B5563', margin: 0 }}>{topic.description}</p>
                                </div>
                              )}
                              
                              {topic.content && (
                                <div className="topic-content" style={{ marginBottom: '12px' }}>
                                  <strong style={{ color: '#002B5C' }}>📖 Lesson Content:</strong>
                                  <p style={{ color: '#4B5563', marginTop: '4px' }}>{topic.content}</p>
                                </div>
                              )}
                              
                              {topic.materials && topic.materials.length > 0 && (
                                <div className="topic-materials" style={{ marginBottom: '12px' }}>
                                  <strong style={{ color: '#002B5C' }}>📎 Materials:</strong>
                                  <div className="materials-list" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                    {topic.materials.map((material, idx) => (
                                      <span key={idx} className="material-tag" style={{
                                        background: '#F3F4F6',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '0.75rem',
                                        color: '#4B5563'
                                      }}>
                                        <i className={`fas ${material.type === 'pdf' ? 'fa-file-pdf' : 
                                          material.type === 'video' ? 'fa-video' : 
                                          material.type === 'image' ? 'fa-image' : 
                                          material.type === 'link' ? 'fa-link' : 'fa-file'}`}></i>
                                        {material.title}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="topic-assessments">
                                <strong style={{ color: '#002B5C' }}>📝 Assessments:</strong>
                                {hasAssessment ? (
                                  <div className="assessments-list" style={{ marginTop: '4px' }}>
                                    {topic.assessments.map(assessment => {
                                      const { isDisabled, buttonText, buttonStyle, attempts, maxAttempts } = getAssessmentButtonState(assessment, topic);
                                      
                                      return (
                                        <div key={assessment.id} className="assessment-item" style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          padding: '8px 12px',
                                          background: '#F9FAFB',
                                          borderRadius: '6px',
                                          marginTop: '4px',
                                          flexWrap: 'wrap'
                                        }}>
                                          <span className="assessment-title" style={{ color: '#002B5C' }}>
                                            <i className="fas fa-question-circle" style={{ color: '#FFD100' }}></i> {assessment.title}
                                          </span>
                                          <span className="assessment-passing" style={{
                                            fontSize: '0.75rem',
                                            color: '#6B7280'
                                          }}>Pass: {assessment.passing_score}%</span>
                                          
                                          {/* ✅ Show attempts count - NOW SHOWS CORRECT VALUE */}
                                          <span style={{
                                            fontSize: '0.65rem',
                                            color: attempts > 0 ? '#6B7280' : '#10B981',
                                            background: attempts > 0 ? '#F3F4F6' : '#D1FAE5',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontWeight: '500'
                                          }}>
                                            {attempts}/{maxAttempts} attempts
                                          </span>
                                          
                                          <button 
                                            className="btn-sm btn-assessment"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!isDisabled) {
                                                openAssessment(topic, assessment);
                                              } else {
                                                showAssessmentResults(assessment);
                                              }
                                            }}
                                            disabled={isDisabled}
                                            style={buttonStyle}
                                            title={isDisabled ? 'Click to view results' : 'Take this assessment'}
                                          >
                                            {buttonText}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="no-assessment" style={{
                                    color: '#6B7280',
                                    fontSize: '0.875rem'
                                  }}>No assessment available</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions" style={{
              padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button className="btn-secondary" onClick={() => setShowCourseModal(false)} style={{
                background: '#6B7280',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ✅ ASSESSMENT MODAL - COMPLETE */}
      {/* ========================================== */}
      {showAssessmentModal && selectedTopic && (
        <div className="modal-overlay" onClick={() => {
          setShowAssessmentModal(false);
          setAssessmentResult(null);
          setShowStartScreen(true);
        }} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '0'
          }}>
            <div className="modal-header" style={{
              padding: '20px 24px',
              borderBottom: '2px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #002B5C, #004080)'
            }}>
              <h3 style={{ color: 'white', margin: 0 }}>
                <i className="fas fa-question-circle" style={{ color: '#FFD100' }}></i>
                {selectedAssessment?.title || `Quiz: ${selectedTopic.title}`}
              </h3>
              <button className="modal-close" onClick={() => {
                setShowAssessmentModal(false);
                setAssessmentResult(null);
                setShowStartScreen(true);
              }} style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'white'
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {assessmentResult ? (
                // ================================
                // ✅ RESULTS VIEW
                // ================================
                <div className="assessment-result">
                  <div className="result-summary" style={{
                    textAlign: 'center',
                    padding: '24px',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    marginBottom: '24px'
                  }}>
                    <h4 style={{ color: '#002B5C' }}>✅ Assessment Results</h4>
                    
                    {assessmentResult.isMaxAttemptsReached && (
                      <div style={{
                        background: '#FEF3C7',
                        border: '1px solid #F59E0B',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px'
                      }}>
                        <p style={{ color: '#92400E', margin: 0 }}>
                          ⚠️ You have reached the maximum number of attempts ({assessmentResult.maxAttempts || 4}).
                        </p>
                      </div>
                    )}
                    
                    {assessmentResult.isCompleted && !assessmentResult.isMaxAttemptsReached && (
                      <div style={{
                        background: '#D1FAE5',
                        border: '1px solid #16A34A',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px'
                      }}>
                        <p style={{ color: '#065F46', margin: 0 }}>
                          ✅ Assessment completed successfully!
                        </p>
                      </div>
                    )}
                    
                    <div className="result-score" style={{ margin: '16px 0' }}>
                      <span className="score" style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: assessmentResult.passed ? '#16A34A' : '#DC2626'
                      }}>{assessmentResult.score}%</span>
                      <span className={`status ${assessmentResult.passed ? 'passed' : 'failed'}`} style={{
                        display: 'block',
                        marginTop: '8px',
                        fontWeight: 'bold',
                        color: assessmentResult.passed ? '#16A34A' : '#DC2626'
                      }}>
                        {assessmentResult.passed ? '✅ Passed' : '❌ Failed'}
                      </span>
                    </div>
                    <p className="result-stats" style={{ color: '#4B5563' }}>
                      Correct: {assessmentResult.correctAnswers} / {assessmentResult.totalQuestions}
                      {assessmentResult.attemptNumber && (
                        <span style={{ display: 'block', fontSize: '0.875rem', marginTop: '4px' }}>
                          Attempt {assessmentResult.attemptNumber} of {assessmentResult.maxAttempts || 4}
                        </span>
                      )}
                      {assessmentResult.attempts !== undefined && (
                        <span style={{ display: 'block', fontSize: '0.875rem', marginTop: '2px', color: '#6B7280' }}>
                          Total attempts: {assessmentResult.attempts}
                        </span>
                      )}
                    </p>
                    
                    {assessmentResult.allowRetake && !assessmentResult.isMaxAttemptsReached && assessmentResult.attempts < assessmentResult.maxAttempts && (
                      <p style={{ color: '#3B82F6', marginTop: '8px' }}>
                        You have {assessmentResult.maxAttempts - assessmentResult.attempts} attempt(s) remaining.
                      </p>
                    )}
                  </div>
                  
                  <div className="result-questions">
                    <h5 style={{ color: '#002B5C', marginBottom: '16px' }}>📋 Review Your Answers</h5>
                    {assessmentResult.gradedAnswers?.map((item, idx) => (
                      <div key={idx} className={`result-question-item ${item.isCorrect ? 'correct' : 'incorrect'}`} style={{
                        padding: '12px 16px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        background: item.isCorrect ? '#D1FAE5' : '#FEE2E2'
                      }}>
                        <div className="question-header" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                          flexWrap: 'wrap',
                          gap: '4px'
                        }}>
                          <span className="question-number" style={{ fontWeight: 'bold', color: '#002B5C' }}>Question {idx + 1}</span>
                          <span className={`result-badge ${item.isCorrect ? 'correct-badge' : 'incorrect-badge'}`} style={{
                            fontWeight: 'bold',
                            color: item.isCorrect ? '#16A34A' : '#DC2626'
                          }}>
                            {item.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                          </span>
                        </div>
                        <div className="question-text" style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#002B5C' }}>{item.question}</strong>
                        </div>
                        <div className="answer-details">
                          <div className="your-answer" style={{ marginBottom: '4px' }}>
                            <span className="label" style={{ color: '#4B5563' }}>Your Answer:</span>
                            <span className={`answer-value ${item.isCorrect ? 'correct-answer' : 'wrong-answer'}`} style={{
                              fontWeight: '500',
                              color: item.isCorrect ? '#16A34A' : '#DC2626'
                            }}>
                              {item.userAnswer || 'Not answered'}
                            </span>
                          </div>
                          {!item.isCorrect && item.correctAnswer && (
                            <div className="correct-answer">
                              <span className="label" style={{ color: '#4B5563' }}>Correct Answer:</span>
                              <span className="answer-value correct-answer" style={{
                                fontWeight: '500',
                                color: '#16A34A'
                              }}>
                                {item.correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="form-actions" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {assessmentResult.allowRetake && !assessmentResult.isMaxAttemptsReached && assessmentResult.attempts < assessmentResult.maxAttempts && (
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          setAssessmentResult(null);
                          setShowStartScreen(true);
                          setAnswers(new Array(assessmentQuestions.length).fill(''));
                          setCurrentQuestionIndex(0);
                        }}
                        style={{
                          background: '#3B82F6',
                          color: 'white',
                          padding: '10px 24px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        <i className="fas fa-redo"></i> Retake Assessment ({assessmentResult.maxAttempts - assessmentResult.attempts} attempts left)
                      </button>
                    )}
                    
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        setShowAssessmentModal(false);
                        setAssessmentResult(null);
                        setAnswers([]);
                        setCurrentQuestionIndex(0);
                        setShowStartScreen(true);
                      }}
                      style={{
                        background: '#FFD100',
                        color: '#002B5C',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : showStartScreen ? (
                // ================================
                // ✅ START SCREEN
                // ================================
                <div className="assessment-start-screen">
                  <div className="start-screen-icon" style={{
                    textAlign: 'center',
                    fontSize: '3rem',
                    color: '#FFD100',
                    marginBottom: '16px'
                  }}>
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <h2 style={{ color: '#002B5C', textAlign: 'center' }}>
                    {selectedAssessment?.title || `Assessment: ${selectedTopic.title}`}
                  </h2>
                  <p className="start-description" style={{
                    textAlign: 'center',
                    color: '#4B5563',
                    marginBottom: '24px'
                  }}>
                    {selectedAssessment?.description || `Test your knowledge on ${selectedTopic.title}.`}
                  </p>
                  
                  <div className="assessment-info-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div className="info-item" style={{
                      background: '#F9FAFB',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <i className="fas fa-list" style={{ color: '#FFD100' }}></i>
                      <div>
                        <span className="info-label" style={{ display: 'block', color: '#6B7280', fontSize: '0.75rem' }}>Questions</span>
                        <span className="info-value" style={{ fontWeight: 'bold', color: '#002B5C' }}>{assessmentInfo.totalQuestions}</span>
                      </div>
                    </div>
                    <div className="info-item" style={{
                      background: '#F9FAFB',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <i className="fas fa-clock" style={{ color: '#FFD100' }}></i>
                      <div>
                        <span className="info-label" style={{ display: 'block', color: '#6B7280', fontSize: '0.75rem' }}>Time Limit</span>
                        <span className="info-value" style={{ fontWeight: 'bold', color: '#002B5C' }}>
                          {assessmentInfo.timeLimit ? `${assessmentInfo.timeLimit} min` : 'No limit'}
                        </span>
                      </div>
                    </div>
                    <div className="info-item" style={{
                      background: '#F9FAFB',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <i className="fas fa-check-circle" style={{ color: '#FFD100' }}></i>
                      <div>
                        <span className="info-label" style={{ display: 'block', color: '#6B7280', fontSize: '0.75rem' }}>Passing Score</span>
                        <span className="info-value" style={{ fontWeight: 'bold', color: '#002B5C' }}>{assessmentInfo.passingScore}%</span>
                      </div>
                    </div>
                    <div className="info-item" style={{
                      background: '#F9FAFB',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <i className="fas fa-redo" style={{ color: '#FFD100' }}></i>
                      <div>
                        <span className="info-label" style={{ display: 'block', color: '#6B7280', fontSize: '0.75rem' }}>Attempts</span>
                        <span className="info-value" style={{ 
                          fontWeight: 'bold', 
                          color: assessmentInfo.isMaxAttemptsReached ? '#DC2626' : '#16A34A'
                        }}>
                          {assessmentInfo.hasAttempted 
                            ? `${assessmentInfo.attempts} / ${assessmentInfo.maxAttempts}` 
                            : `✨ 0 / ${assessmentInfo.maxAttempts}`}
                          {assessmentInfo.allowRetake && assessmentInfo.hasAttempted && 
                            !assessmentInfo.isMaxAttemptsReached && 
                            ` (${assessmentInfo.remainingAttempts} remaining)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {assessmentInfo.hasAttempted && assessmentInfo.allowRetake && !assessmentInfo.isMaxAttemptsReached && (
                    <div className="attempt-info" style={{
                      background: '#DBEAFE',
                      borderLeft: '4px solid #3B82F6',
                      padding: '12px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <i className="fas fa-info-circle" style={{ color: '#3B82F6' }}></i>
                      <p style={{ color: '#1E40AF', margin: 0 }}>
                        You have {assessmentInfo.remainingAttempts} attempt(s) remaining.
                      </p>
                    </div>
                  )}

                  {assessmentInfo.isMaxAttemptsReached && (
                    <div className="attempt-warning" style={{
                      background: '#FEF3C7',
                      border: '1px solid #F59E0B',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: '#D97706' }}></i>
                      <div>
                        <p style={{ color: '#92400E', margin: 0, fontWeight: 'bold' }}>
                          ⚠️ You have reached the maximum number of attempts ({assessmentInfo.maxAttempts}).
                        </p>
                        <p style={{ color: '#78350F', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
                          Your previous results are shown below. No more attempts are allowed.
                        </p>
                      </div>
                    </div>
                  )}

                  {assessmentInfo.isCompleted && !assessmentInfo.isMaxAttemptsReached && (
                    <div className="attempt-warning" style={{
                      background: '#D1FAE5',
                      border: '1px solid #16A34A',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <i className="fas fa-check-circle" style={{ color: '#16A34A' }}></i>
                      <p style={{ color: '#065F46', margin: 0 }}>
                        ✅ This assessment has been completed. View your results below.
                      </p>
                    </div>
                  )}

                  <div className="form-actions" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px'
                  }}>
                    <button className="btn-secondary" onClick={() => {
                      setShowAssessmentModal(false);
                      setShowStartScreen(true);
                    }} style={{
                      background: '#6B7280',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      Cancel
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={startAssessment}
                      disabled={assessmentInfo.isMaxAttemptsReached || assessmentInfo.isCompleted || (assessmentInfo.hasAttempted && !assessmentInfo.allowRetake)}
                      style={{
                        background: (assessmentInfo.isMaxAttemptsReached || assessmentInfo.isCompleted || (assessmentInfo.hasAttempted && !assessmentInfo.allowRetake)) ? '#E5E7EB' : '#FFD100',
                        color: (assessmentInfo.isMaxAttemptsReached || assessmentInfo.isCompleted || (assessmentInfo.hasAttempted && !assessmentInfo.allowRetake)) ? '#9CA3AF' : '#002B5C',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: (assessmentInfo.isMaxAttemptsReached || assessmentInfo.isCompleted || (assessmentInfo.hasAttempted && !assessmentInfo.allowRetake)) ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {assessmentInfo.isMaxAttemptsReached ? '🔒 Max Attempts Reached' : 
                       assessmentInfo.isCompleted ? '✅ Completed' :
                       assessmentInfo.hasAttempted && !assessmentInfo.allowRetake ? '🔒 Retakes Not Allowed' : 
                       <><i className="fas fa-play"></i> Start Quiz</>}
                    </button>
                  </div>
                </div>
              ) : (
                // ================================
                // QUESTIONS VIEW
                // ================================
                <>
                  <div className="question-progress" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#002B5C' }}>
                      Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
                    </span>
                    <span className="progress-dots" style={{ display: 'flex', gap: '4px' }}>
                      {assessmentQuestions.map((_, idx) => (
                        <span key={idx} className={`dot ${idx === currentQuestionIndex ? 'active' : ''} ${answers[idx] && answers[idx].trim() !== '' ? 'answered' : ''}`} style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: idx === currentQuestionIndex ? '#FFD100' : 
                                    (answers[idx] && answers[idx].trim() !== '' ? '#16A34A' : '#E5E7EB')
                        }}></span>
                      ))}
                    </span>
                  </div>
                  
                  <div className="question-content">
                    <p className="question-text" style={{
                      fontSize: '1.1rem',
                      color: '#002B5C',
                      marginBottom: '16px'
                    }}>{assessmentQuestions[currentQuestionIndex]?.question}</p>
                    
                    {assessmentQuestions[currentQuestionIndex]?.type === 'multiple-choice' && (
                      <div className="options">
                        {assessmentQuestions[currentQuestionIndex]?.options?.map((option, idx) => (
                          <label key={idx} className="option-label" style={{
                            display: 'block',
                            padding: '10px 16px',
                            marginBottom: '8px',
                            background: answers[currentQuestionIndex] === option ? '#FFD100' : '#F9FAFB',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: answers[currentQuestionIndex] === option ? '2px solid #FFD100' : '1px solid #E5E7EB',
                            transition: 'all 0.2s'
                          }}>
                            <input
                              type="radio"
                              name="answer"
                              value={option}
                              checked={answers[currentQuestionIndex] === option}
                              onChange={() => handleAnswerSelect(option)}
                              style={{ marginRight: '8px' }}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {assessmentQuestions[currentQuestionIndex]?.type === 'true-false' && (
                      <div className="options">
                        <label className="option-label" style={{
                          display: 'block',
                          padding: '10px 16px',
                          marginBottom: '8px',
                          background: answers[currentQuestionIndex] === 'true' ? '#FFD100' : '#F9FAFB',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: answers[currentQuestionIndex] === 'true' ? '2px solid #FFD100' : '1px solid #E5E7EB'
                        }}>
                          <input
                            type="radio"
                            name="answer"
                            value="true"
                            checked={answers[currentQuestionIndex] === 'true'}
                            onChange={() => handleAnswerSelect('true')}
                            style={{ marginRight: '8px' }}
                          />
                          True
                        </label>
                        <label className="option-label" style={{
                          display: 'block',
                          padding: '10px 16px',
                          marginBottom: '8px',
                          background: answers[currentQuestionIndex] === 'false' ? '#FFD100' : '#F9FAFB',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: answers[currentQuestionIndex] === 'false' ? '2px solid #FFD100' : '1px solid #E5E7EB'
                        }}>
                          <input
                            type="radio"
                            name="answer"
                            value="false"
                            checked={answers[currentQuestionIndex] === 'false'}
                            onChange={() => handleAnswerSelect('false')}
                            style={{ marginRight: '8px' }}
                          />
                          False
                        </label>
                      </div>
                    )}
                    
                    {assessmentQuestions[currentQuestionIndex]?.type === 'short-answer' && (
                      <textarea
                        className="short-answer"
                        value={answers[currentQuestionIndex] || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                        placeholder="Type your answer here..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          minHeight: '100px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="question-nav" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E5E7EB'
                  }}>
                    <button 
                      className="btn-secondary"
                      onClick={goToPrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      style={{
                        background: currentQuestionIndex === 0 ? '#E5E7EB' : '#6B7280',
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Previous
                    </button>
                    {currentQuestionIndex === assessmentQuestions.length - 1 ? (
                      <button 
                        className="btn-primary"
                        onClick={submitAssessment}
                        disabled={answers.some(a => !a || a.trim() === '') || submitting}
                        style={{
                          background: (answers.some(a => !a || a.trim() === '') || submitting) ? '#E5E7EB' : '#FFD100',
                          color: (answers.some(a => !a || a.trim() === '') || submitting) ? '#9CA3AF' : '#002B5C',
                          padding: '8px 20px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: (answers.some(a => !a || a.trim() === '') || submitting) ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                      </button>
                    ) : (
                      <button 
                        className="btn-primary"
                        onClick={goToNextQuestion}
                        disabled={!answers[currentQuestionIndex] || answers[currentQuestionIndex].trim() === ''}
                        style={{
                          background: (!answers[currentQuestionIndex] || answers[currentQuestionIndex].trim() === '') ? '#E5E7EB' : '#FFD100',
                          color: (!answers[currentQuestionIndex] || answers[currentQuestionIndex].trim() === '') ? '#9CA3AF' : '#002B5C',
                          padding: '8px 20px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: (!answers[currentQuestionIndex] || answers[currentQuestionIndex].trim() === '') ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Next <i className="fas fa-arrow-right"></i>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoutCourses;