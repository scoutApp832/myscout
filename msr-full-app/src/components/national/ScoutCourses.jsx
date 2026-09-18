// src/components/national/NationalScoutCourses.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NationalScoutCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showEnrolledModal, setShowEnrolledModal] = useState(false);
  const [enrolledMembers, setEnrolledMembers] = useState([]);
  
  // Maximize state for full-screen editor
  const [isMaximized, setIsMaximized] = useState(false);
  const [maximizedMode, setMaximizedMode] = useState(null);
  
  // Course form state
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
    category: 'general',
    status: 'draft',
    prerequisites: '',
    cover_image: ''
  });

  // Topic form state
  const [topicFormData, setTopicFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'lesson',
    order: 0,
    parent_id: null
  });

  // Material form state
  const [materialFormData, setMaterialFormData] = useState({
    title: '',
    type: 'text',
    content: '',
    url: '',
    order: 0
  });

  // Assessment form state
  const [assessmentFormData, setAssessmentFormData] = useState({
    title: '',
    description: '',
    type: 'quiz',
    questions: [],
    passing_score: 70,
    time_limit: null,
    allow_retake: false,
    max_attempts: 1,
    show_score_immediately: true,
    order: 0,
    topic_id: null  // ✅ Added topic_id to form state
  });

  // Question templates
  const questionTemplates = {
    multipleChoice: {
      id: Date.now(),
      question: "What is your question?",
      type: "multiple-choice",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A"
    },
    trueFalse: {
      id: Date.now() + 1,
      question: "Statement is true or false?",
      type: "true-false",
      correctAnswer: "true"
    },
    shortAnswer: {
      id: Date.now() + 2,
      question: "What is your question?",
      type: "short-answer",
      correctAnswers: ["answer1", "answer2"]
    }
  };

  // Sample questions
  const sampleQuestions = [
    {
      id: 1,
      question: "What is the Scout Motto?",
      type: "multiple-choice",
      options: ["Be Prepared", "Always Ready", "Scout's Honor", "Do Your Best"],
      correctAnswer: "Be Prepared"
    },
    {
      id: 2,
      question: "A good leader should always make decisions alone.",
      type: "true-false",
      correctAnswer: "false"
    },
    {
      id: 3,
      question: "Name three qualities of a good leader.",
      type: "short-answer",
      correctAnswers: ["integrity", "communication", "empathy", "vision", "courage"]
    },
    {
      id: 4,
      question: "What is the first step in problem-solving?",
      type: "multiple-choice",
      options: ["Identify the problem", "Brainstorm solutions", "Implement the solution", "Evaluate results"],
      correctAnswer: "Identify the problem"
    },
    {
      id: 5,
      question: "The Scout Law has 12 points.",
      type: "true-false",
      correctAnswer: "true"
    }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  // ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMaximized) {
        exitFullscreen();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isMaximized]);

  // Fullscreen functions
  const enterFullscreen = (mode) => {
    setIsMaximized(true);
    setMaximizedMode(mode);
    document.body.style.overflow = 'hidden';
  };

  const exitFullscreen = () => {
    setIsMaximized(false);
    setMaximizedMode(null);
    document.body.style.overflow = 'auto';
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/courses/${courseId}/topics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(response.data.topics || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load topics');
      setTopics([]);
    }
  };

  const fetchEnrolledMembers = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/scout/courses/${courseId}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolledMembers(response.data.enrollments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load enrolled members');
      setEnrolledMembers([]);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/courses`, courseFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Course created successfully!');
      setShowCreateModal(false);
      setCourseFormData({
        title: '',
        description: '',
        duration: '',
        level: 'beginner',
        category: 'general',
        status: 'draft',
        prerequisites: '',
        cover_image: ''
      });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/courses/${selectedCourse.id}`, courseFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Course updated successfully!');
      setShowEditCourseModal(false);
      setSelectedCourse(null);
      if (isMaximized) exitFullscreen();
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Course deleted successfully!');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  // Topic Management
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/courses/${selectedCourse.id}/topics`, topicFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Topic created successfully!');
      setShowTopicModal(false);
      setTopicFormData({
        title: '',
        description: '',
        content: '',
        type: 'lesson',
        order: 0,
        parent_id: null
      });
      if (isMaximized) exitFullscreen();
      fetchTopics(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create topic');
    }
  };

  const handleUpdateTopic = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/topics/${selectedTopic.id}`, topicFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Topic updated successfully!');
      setSelectedTopic(null);
      setShowTopicModal(false);
      if (isMaximized) exitFullscreen();
      fetchTopics(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update topic');
    }
  };

  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Topic deleted successfully!');
      fetchTopics(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete topic');
    }
  };

  // Material Management
  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/topics/${selectedTopic.id}/materials`, materialFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Material added successfully!');
      setShowMaterialModal(false);
      setMaterialFormData({
        title: '',
        type: 'text',
        content: '',
        url: '',
        order: 0
      });
      fetchTopics(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add material');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Material deleted successfully!');
      fetchTopics(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete material');
    }
  };

  // ============================================
  // ✅ FIXED: Assessment Management
  // ============================================

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!assessmentFormData.questions || assessmentFormData.questions.length === 0) {
        setError('Please add at least one question');
        return;
      }

      // ✅ CRITICAL FIX: Ensure topicId is included
      if (!selectedTopic || !selectedTopic.id) {
        setError('❌ Please select a topic for this assessment');
        return;
      }

      // ✅ Create assessment data with topicId
      const assessmentData = {
        topicId: selectedTopic.id,  // ✅ THIS WAS MISSING!
        title: assessmentFormData.title,
        description: assessmentFormData.description || '',
        type: assessmentFormData.type || 'quiz',
        questions: assessmentFormData.questions || [],
        passing_score: parseInt(assessmentFormData.passing_score) || 70,
        time_limit: assessmentFormData.time_limit || null,
        allow_retake: assessmentFormData.allow_retake || false,
        max_attempts: parseInt(assessmentFormData.max_attempts) || 1,
        show_score_immediately: assessmentFormData.show_score_immediately !== undefined ? assessmentFormData.show_score_immediately : true,
        order: parseInt(assessmentFormData.order) || 0
      };

      console.log('📤 Creating assessment with data:', assessmentData);

      const response = await axios.post(
        `${API_URL}/courses/${selectedCourse.id}/assessments`,
        assessmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('✅ Assessment created successfully!');
      setShowAssessmentModal(false);
      setAssessmentFormData({
        title: '',
        description: '',
        type: 'quiz',
        questions: [],
        passing_score: 70,
        time_limit: null,
        allow_retake: false,
        max_attempts: 1,
        show_score_immediately: true,
        order: 0,
        topic_id: null
      });
      fetchTopics(selectedCourse.id);
    } catch (err) {
      console.error('❌ Create assessment error:', err);
      setError(err.response?.data?.message || 'Failed to create assessment');
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/assessments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Assessment deleted successfully!');
      fetchTopics(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete assessment');
    }
  };

  // Question management functions
  const loadSampleQuestions = () => {
    setAssessmentFormData({
      ...assessmentFormData,
      questions: [...sampleQuestions]
    });
  };

  const addQuestionTemplate = (type) => {
    const newQuestions = [...assessmentFormData.questions];
    newQuestions.push({ ...questionTemplates[type], id: Date.now() + Math.random() });
    setAssessmentFormData({
      ...assessmentFormData,
      questions: newQuestions
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = assessmentFormData.questions.filter((_, i) => i !== index);
    setAssessmentFormData({
      ...assessmentFormData,
      questions: newQuestions
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...assessmentFormData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setAssessmentFormData({
      ...assessmentFormData,
      questions: newQuestions
    });
  };

  const openTopicModal = (course, topic = null) => {
    setSelectedCourse(course);
    if (topic) {
      setSelectedTopic(topic);
      setTopicFormData({
        title: topic.title,
        description: topic.description || '',
        content: topic.content || '',
        type: topic.type || 'lesson',
        order: topic.order || 0,
        parent_id: topic.parent_id || null
      });
    } else {
      setTopicFormData({
        title: '',
        description: '',
        content: '',
        type: 'lesson',
        order: 0,
        parent_id: null
      });
    }
    setShowTopicModal(true);
  };

  const openMaterialModal = (topic) => {
    setSelectedTopic(topic);
    setMaterialFormData({
      title: '',
      type: 'text',
      content: '',
      url: '',
      order: 0
    });
    setShowMaterialModal(true);
  };

  // ✅ FIXED: Open Assessment Modal with topic
  const openAssessmentModal = (course, topic = null) => {
    setSelectedCourse(course);
    setSelectedTopic(topic);
    
    if (topic) {
      setAssessmentFormData({
        title: `Assessment for: ${topic.title}`,
        description: '',
        type: 'quiz',
        questions: [],
        passing_score: 70,
        time_limit: null,
        allow_retake: false,
        max_attempts: 1,
        show_score_immediately: true,
        order: 0,
        topic_id: topic.id
      });
    } else {
      setAssessmentFormData({
        title: 'Course Assessment',
        description: '',
        type: 'quiz',
        questions: [],
        passing_score: 70,
        time_limit: null,
        allow_retake: false,
        max_attempts: 1,
        show_score_immediately: true,
        order: 0,
        topic_id: null
      });
    }
    setShowAssessmentModal(true);
  };

  const viewTopics = (course) => {
    setSelectedCourse(course);
    fetchTopics(course.id);
    setShowTopicsModal(true);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setCourseFormData({
      title: course.title,
      description: course.description,
      duration: course.duration || '',
      level: course.level || 'beginner',
      category: course.category || 'general',
      status: course.status || 'draft',
      prerequisites: course.prerequisites || '',
      cover_image: course.cover_image || ''
    });
    setShowEditCourseModal(true);
  };

  const viewEnrolledMembers = async (course) => {
    setSelectedCourse(course);
    await fetchEnrolledMembers(course.id);
    setShowEnrolledModal(true);
  };

  const getCourseStatistics = () => {
    const totalEnrolled = enrolledMembers.length;
    const completed = enrolledMembers.filter(m => m.status === 'completed').length;
    const inProgress = enrolledMembers.filter(m => m.status === 'active' && m.progress < 100).length;
    const dropped = enrolledMembers.filter(m => m.status === 'dropped').length;
    const avgProgress = totalEnrolled > 0 
      ? Math.round(enrolledMembers.reduce((sum, m) => sum + (parseInt(m.progress) || 0), 0) / totalEnrolled) 
      : 0;

    return { totalEnrolled, completed, inProgress, dropped, avgProgress };
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  const stats = getCourseStatistics();

  // Fullscreen render
  if (isMaximized) {
    return (
      <div className="fullscreen-editor">
        <div className="fullscreen-header">
          <div className="fullscreen-title">
            <i className="fas fa-expand" style={{ color: '#FFD100' }}></i>
            <span>{maximizedMode === 'course' ? 'Edit Course' : 'Edit Topic'}</span>
          </div>
          <div className="fullscreen-actions">
            <button className="fullscreen-exit" onClick={exitFullscreen}>
              <i className="fas fa-compress"></i> Exit Fullscreen (ESC)
            </button>
          </div>
        </div>
        <div className="fullscreen-body">
          <div className="fullscreen-form">
            {maximizedMode === 'course' ? (
              <form onSubmit={handleUpdateCourse}>
                <div className="form-grid fullscreen-grid">
                  <div className="form-group full-width">
                    <label>Course Title <span className="required">*</span></label>
                    <input
                      type="text"
                      value={courseFormData.title}
                      onChange={e => setCourseFormData({...courseFormData, title: e.target.value})}
                      required
                      className="fullscreen-input"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description <span className="required">*</span></label>
                    <textarea
                      value={courseFormData.description}
                      onChange={e => setCourseFormData({...courseFormData, description: e.target.value})}
                      required
                      rows="6"
                      className="fullscreen-textarea"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Prerequisites</label>
                    <textarea
                      value={courseFormData.prerequisites}
                      onChange={e => setCourseFormData({...courseFormData, prerequisites: e.target.value})}
                      rows="3"
                      className="fullscreen-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={courseFormData.duration}
                      onChange={e => setCourseFormData({...courseFormData, duration: e.target.value})}
                      placeholder="e.g., 4 weeks"
                      className="fullscreen-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select
                      value={courseFormData.level}
                      onChange={e => setCourseFormData({...courseFormData, level: e.target.value})}
                      className="fullscreen-select"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={courseFormData.category}
                      onChange={e => setCourseFormData({...courseFormData, category: e.target.value})}
                      placeholder="e.g., leadership, outdoors, first aid"
                      className="fullscreen-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={courseFormData.status}
                      onChange={e => setCourseFormData({...courseFormData, status: e.target.value})}
                      className="fullscreen-select"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="fullscreen-footer">
                  <button type="button" className="btn-secondary" onClick={exitFullscreen}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i> Update Course
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={selectedTopic ? handleUpdateTopic : handleCreateTopic}>
                <div className="form-grid fullscreen-grid">
                  <div className="form-group full-width">
                    <label>Topic Title <span className="required">*</span></label>
                    <input
                      type="text"
                      value={topicFormData.title}
                      onChange={e => setTopicFormData({...topicFormData, title: e.target.value})}
                      required
                      placeholder="Enter topic title"
                      className="fullscreen-input"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={topicFormData.description}
                      onChange={e => setTopicFormData({...topicFormData, description: e.target.value})}
                      rows="3"
                      placeholder="Brief description of this topic"
                      className="fullscreen-textarea"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Content / Lesson Text <span className="required">*</span></label>
                    
                    <div className="content-editor-toolbar">
                      <button type="button" className="toolbar-btn" onClick={() => {
                        const textarea = document.querySelector('.content-editor');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          textarea.value = before + '**' + text.substring(start, end) + '**' + after;
                          textarea.focus();
                          textarea.selectionStart = start + 2;
                          textarea.selectionEnd = end + 2;
                          setTopicFormData({...topicFormData, content: textarea.value});
                        }
                      }}>
                        <i className="fas fa-bold"></i>
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => {
                        const textarea = document.querySelector('.content-editor');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          textarea.value = before + '*' + text.substring(start, end) + '*' + after;
                          textarea.focus();
                          textarea.selectionStart = start + 1;
                          textarea.selectionEnd = end + 1;
                          setTopicFormData({...topicFormData, content: textarea.value});
                        }
                      }}>
                        <i className="fas fa-italic"></i>
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => {
                        const textarea = document.querySelector('.content-editor');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          textarea.value = before + '```\n' + text.substring(start, end) + '\n```' + after;
                          textarea.focus();
                          textarea.selectionStart = start + 4;
                          textarea.selectionEnd = end + 4;
                          setTopicFormData({...topicFormData, content: textarea.value});
                        }
                      }}>
                        <i className="fas fa-code"></i>
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => {
                        const textarea = document.querySelector('.content-editor');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          textarea.value = before + '> ' + text.substring(start, end) + after;
                          textarea.focus();
                          textarea.selectionStart = start + 2;
                          textarea.selectionEnd = end + 2;
                          setTopicFormData({...topicFormData, content: textarea.value});
                        }
                      }}>
                        <i className="fas fa-quote-right"></i>
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => {
                        const textarea = document.querySelector('.content-editor');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          textarea.value = before + '• ' + text.substring(start, end) + after;
                          textarea.focus();
                          textarea.selectionStart = start + 2;
                          textarea.selectionEnd = end + 2;
                          setTopicFormData({...topicFormData, content: textarea.value});
                        }
                      }}>
                        <i className="fas fa-list"></i>
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => {
                        const textarea = document.querySelector('.content-editor');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          textarea.value = before + '## ' + text.substring(start, end) + after;
                          textarea.focus();
                          textarea.selectionStart = start + 3;
                          textarea.selectionEnd = end + 3;
                          setTopicFormData({...topicFormData, content: textarea.value});
                        }
                      }}>
                        <i className="fas fa-heading"></i>
                      </button>
                    </div>
                    
                    <textarea
                      className="fullscreen-textarea content-editor"
                      value={topicFormData.content}
                      onChange={e => setTopicFormData({...topicFormData, content: e.target.value})}
                      rows="12"
                      placeholder="Write your lesson content here..."
                      style={{ minHeight: '400px' }}
                    />
                    
                    <div className="content-word-count">
                      <span>Words: {topicFormData.content ? topicFormData.content.split(/\s+/).filter(w => w.length > 0).length : 0}</span>
                      <span>Characters: {topicFormData.content ? topicFormData.content.length : 0}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={topicFormData.type}
                      onChange={e => setTopicFormData({...topicFormData, type: e.target.value})}
                      className="fullscreen-select"
                    >
                      <option value="lesson">Lesson</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Order</label>
                    <input
                      type="number"
                      value={topicFormData.order}
                      onChange={e => setTopicFormData({...topicFormData, order: parseInt(e.target.value) || 0})}
                      min="0"
                      className="fullscreen-input"
                    />
                  </div>
                </div>
                <div className="fullscreen-footer">
                  <button type="button" className="btn-secondary" onClick={exitFullscreen}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i> {selectedTopic ? 'Update Topic' : 'Add Topic'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Normal dashboard view
  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h2><i className="fas fa-book" style={{ color: '#FFD100' }}></i> Course Management</h2>
          <p>Create, edit, and manage courses with topics, materials, and assessments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus"></i> Create Course
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button className="btn-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          <p>{success}</p>
          <button className="btn-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Courses Grid */}
      <div className="courses-grid">
        {courses.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-book"></i>
            <h3>No Courses</h3>
            <p>Create your first course</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-image" style={{ 
                background: course.status === 'published' ? '#16A34A' : 
                           course.status === 'archived' ? '#6B7280' : '#002B5C' 
              }}>
                <i className="fas fa-graduation-cap"></i>
                <span className={`course-status ${course.status}`}>{course.status}</span>
              </div>
              <div className="course-body">
                <h4>{course.title}</h4>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span><i className="fas fa-clock"></i> {course.duration || 'Self-paced'}</span>
                  <span><i className="fas fa-signal"></i> {course.level || 'Beginner'}</span>
                  <span><i className="fas fa-users"></i> {course.enrolledCount || 0} enrolled</span>
                </div>
                {course.prerequisites && (
                  <div className="course-prerequisites">
                    <i className="fas fa-check-circle"></i> {course.prerequisites}
                  </div>
                )}
                <div className="course-actions">
                  <button className="btn-sm btn-edit" onClick={() => openEditModal(course)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="btn-sm btn-topic" onClick={() => openTopicModal(course)}>
                    <i className="fas fa-layer-group"></i> Add Topic
                  </button>
                  <button className="btn-sm btn-view" onClick={() => viewTopics(course)}>
                    <i className="fas fa-list"></i> Topics
                  </button>
                  <button className="btn-sm btn-users" onClick={() => viewEnrolledMembers(course)}>
                    <i className="fas fa-users"></i> Enrolled
                  </button>
                  <button className="btn-sm btn-delete" onClick={() => handleDeleteCourse(course.id)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Topics View Modal */}
      {showTopicsModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => {
          setShowTopicsModal(false);
          setSelectedCourse(null);
          setTopics([]);
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>
                  <i className="fas fa-layer-group"></i>
                  Topics: {selectedCourse.title}
                </h3>
              </div>
              <div className="modal-header-right">
                <button className="btn-sm btn-topic" onClick={() => openTopicModal(selectedCourse)}>
                  <i className="fas fa-plus"></i> Add Topic
                </button>
                <button className="modal-close" onClick={() => {
                  setShowTopicsModal(false);
                  setSelectedCourse(null);
                  setTopics([]);
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="topics-toolbar">
                <span className="topics-count">{topics.length} topics</span>
              </div>
              <div className="topics-list">
                {topics.length === 0 ? (
                  <div className="empty-state small">
                    <i className="fas fa-folder-open"></i>
                    <p>No topics yet. Add your first topic!</p>
                  </div>
                ) : (
                  topics.map(topic => (
                    <div key={topic.id} className="topic-item">
                      <div className="topic-header">
                        <div className="topic-title">
                          <i className={`fas ${topic.type === 'lesson' ? 'fa-file-alt' : 'fa-folder'}`}></i>
                          <h4>{topic.title}</h4>
                          <span className={`topic-type ${topic.type}`}>{topic.type}</span>
                        </div>
                        <div className="topic-actions">
                          <button 
                            className="btn-sm btn-maximize" 
                            onClick={() => {
                              setSelectedTopic(topic);
                              setShowTopicsModal(false);
                              setTopicFormData({
                                title: topic.title,
                                description: topic.description || '',
                                content: topic.content || '',
                                type: topic.type || 'lesson',
                                order: topic.order || 0,
                                parent_id: topic.parent_id || null
                              });
                              enterFullscreen('topic');
                            }}
                            title="Maximize editor"
                          >
                            <i className="fas fa-expand"></i>
                          </button>
                          <button 
                            className="btn-sm btn-material" 
                            onClick={() => openMaterialModal(topic)}
                            title="Add Material"
                          >
                            <i className="fas fa-paperclip"></i>
                          </button>
                          <button 
                            className="btn-sm btn-assessment" 
                            onClick={() => openAssessmentModal(selectedCourse, topic)}
                            title="Add Assessment"
                          >
                            <i className="fas fa-question-circle"></i>
                          </button>
                          <button 
                            className="btn-sm btn-edit" 
                            onClick={() => openTopicModal(selectedCourse, topic)}
                            title="Edit Topic"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-sm btn-delete" 
                            onClick={() => handleDeleteTopic(topic.id)}
                            title="Delete Topic"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      {topic.description && <p className="topic-description">{topic.description}</p>}
                      {topic.content && (
                        <div className="topic-content">
                          <strong>Content:</strong>
                          <p>{topic.content}</p>
                        </div>
                      )}
                      {topic.materials && topic.materials.length > 0 && (
                        <div className="topic-materials">
                          <strong>Materials:</strong>
                          <div className="materials-list">
                            {topic.materials.map((material, idx) => (
                              <span key={idx} className="material-tag">
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
                      {topic.assessments && topic.assessments.length > 0 && (
                        <div className="topic-assessments">
                          <strong>Assessments:</strong>
                          <div className="assessments-list">
                            {topic.assessments.map((assessment, idx) => (
                              <span key={idx} className="assessment-tag">
                                <i className="fas fa-question-circle"></i> {assessment.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <div className="subtopics">
                          {topic.subtopics.map(sub => (
                            <div key={sub.id} className="subtopic-item">
                              <span><i className="fas fa-file"></i> {sub.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => {
                setShowTopicsModal(false);
                setSelectedCourse(null);
                setTopics([]);
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Members Modal */}
      {showEnrolledModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowEnrolledModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>
                  <i className="fas fa-users"></i>
                  Enrolled Members - {selectedCourse.title}
                  <span className="badge">{enrolledMembers.length} enrolled</span>
                </h3>
              </div>
              <div className="modal-header-right">
                <button className="modal-close" onClick={() => setShowEnrolledModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="stats-grid small">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>{stats.totalEnrolled}</h3>
                    <p>Total Enrolled</p>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #16A34A' }}>
                  <div className="stat-info">
                    <h3 style={{ color: '#16A34A' }}>{stats.completed}</h3>
                    <p>✅ Completed</p>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #3B82F6' }}>
                  <div className="stat-info">
                    <h3 style={{ color: '#3B82F6' }}>{stats.inProgress}</h3>
                    <p>🔄 In Progress</p>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #F97316' }}>
                  <div className="stat-info">
                    <h3 style={{ color: '#F97316' }}>{stats.avgProgress}%</h3>
                    <p>📊 Avg Progress</p>
                  </div>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>SIN</th>
                      <th>Email</th>
                      <th>District</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledMembers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">No members enrolled yet</td>
                      </tr>
                    ) : (
                      enrolledMembers.map((member, index) => (
                        <tr key={member.id || index}>
                          <td>{index + 1}</td>
                          <td><strong>{member.fullName || member.name || 'N/A'}</strong></td>
                          <td>{member.sin || 'N/A'}</td>
                          <td>{member.email || 'N/A'}</td>
                          <td>{member.district || 'N/A'}</td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar small">
                                <div className="progress-fill" style={{ width: `${member.progress || 0}%` }}></div>
                              </div>
                              <span>{member.progress || 0}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${member.status === 'completed' ? 'badge-approved' : 
                              member.status === 'active' ? 'badge-progress' : 
                              member.status === 'dropped' ? 'badge-rejected' : 'badge-pending'}`}>
                              {member.status || 'Active'}
                            </span>
                          </td>
                          <td>{member.enrolledAt ? new Date(member.enrolledAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowEnrolledModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && !showEditCourseModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3><i className="fas fa-book"></i> Create Course</h3>
              </div>
              <div className="modal-header-right">
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label>Course Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={e => setCourseFormData({...courseFormData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={courseFormData.description}
                  onChange={e => setCourseFormData({...courseFormData, description: e.target.value})}
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Prerequisites</label>
                <textarea
                  value={courseFormData.prerequisites}
                  onChange={e => setCourseFormData({...courseFormData, prerequisites: e.target.value})}
                  rows="2"
                  placeholder="e.g., Basic scouting knowledge, Leadership training"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={courseFormData.duration}
                    onChange={e => setCourseFormData({...courseFormData, duration: e.target.value})}
                    placeholder="e.g., 4 weeks"
                  />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={courseFormData.level}
                    onChange={e => setCourseFormData({...courseFormData, level: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={courseFormData.category}
                    onChange={e => setCourseFormData({...courseFormData, category: e.target.value})}
                    placeholder="e.g., leadership, outdoors, first aid"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={courseFormData.status}
                    onChange={e => setCourseFormData({...courseFormData, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditCourseModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowEditCourseModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>
                  <i className="fas fa-edit"></i> Edit Course
                </h3>
              </div>
              <div className="modal-header-right">
                <button 
                  className="btn-sm btn-maximize" 
                  onClick={() => {
                    setShowEditCourseModal(false);
                    enterFullscreen('course');
                  }}
                >
                  <i className="fas fa-expand"></i> Maximize
                </button>
                <button className="modal-close" onClick={() => setShowEditCourseModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateCourse}>
              <div className="form-group">
                <label>Course Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={e => setCourseFormData({...courseFormData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={courseFormData.description}
                  onChange={e => setCourseFormData({...courseFormData, description: e.target.value})}
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Prerequisites</label>
                <textarea
                  value={courseFormData.prerequisites}
                  onChange={e => setCourseFormData({...courseFormData, prerequisites: e.target.value})}
                  rows="2"
                  placeholder="e.g., Basic scouting knowledge, Leadership training"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={courseFormData.duration}
                    onChange={e => setCourseFormData({...courseFormData, duration: e.target.value})}
                    placeholder="e.g., 4 weeks"
                  />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={courseFormData.level}
                    onChange={e => setCourseFormData({...courseFormData, level: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={courseFormData.category}
                    onChange={e => setCourseFormData({...courseFormData, category: e.target.value})}
                    placeholder="e.g., leadership, outdoors, first aid"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={courseFormData.status}
                    onChange={e => setCourseFormData({...courseFormData, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditCourseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Topic Modal */}
      {showTopicModal && selectedCourse && !showMaterialModal && !showAssessmentModal && (
        <div className="modal-overlay" onClick={() => {
          setShowTopicModal(false);
          setSelectedTopic(null);
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>
                  <i className="fas fa-layer-group"></i>
                  {selectedTopic ? 'Edit Topic' : 'Add Topic to ' + selectedCourse.title}
                </h3>
              </div>
              <div className="modal-header-right">
                {selectedTopic && (
                  <button 
                    className="btn-sm btn-maximize" 
                    onClick={() => {
                      setShowTopicModal(false);
                      enterFullscreen('topic');
                    }}
                  >
                    <i className="fas fa-expand"></i> Maximize
                  </button>
                )}
                <button className="modal-close" onClick={() => {
                  setShowTopicModal(false);
                  setSelectedTopic(null);
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form onSubmit={selectedTopic ? handleUpdateTopic : handleCreateTopic}>
              <div className="form-group">
                <label>Topic Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={topicFormData.title}
                  onChange={e => setTopicFormData({...topicFormData, title: e.target.value})}
                  required
                  placeholder="Enter topic title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={topicFormData.description}
                  onChange={e => setTopicFormData({...topicFormData, description: e.target.value})}
                  rows="2"
                  placeholder="Brief description of this topic"
                />
              </div>
              <div className="form-group">
                <label>Content / Lesson Text</label>
                <textarea
                  value={topicFormData.content}
                  onChange={e => setTopicFormData({...topicFormData, content: e.target.value})}
                  rows="5"
                  placeholder="Enter the lesson content here..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={topicFormData.type}
                    onChange={e => setTopicFormData({...topicFormData, type: e.target.value})}
                  >
                    <option value="lesson">Lesson</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    value={topicFormData.order}
                    onChange={e => setTopicFormData({...topicFormData, order: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowTopicModal(false);
                  setSelectedTopic(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> {selectedTopic ? 'Update Topic' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Material Modal */}
      {showMaterialModal && selectedTopic && (
        <div className="modal-overlay" onClick={() => setShowMaterialModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3><i className="fas fa-paperclip"></i> Add Material to: {selectedTopic.title}</h3>
              </div>
              <div className="modal-header-right">
                <button className="modal-close" onClick={() => setShowMaterialModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateMaterial}>
              <div className="form-group">
                <label>Material Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={materialFormData.title}
                  onChange={e => setMaterialFormData({...materialFormData, title: e.target.value})}
                  required
                  placeholder="Enter material title"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={materialFormData.type}
                  onChange={e => setMaterialFormData({...materialFormData, type: e.target.value})}
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="link">External Link</option>
                </select>
              </div>
              <div className="form-group">
                <label>Content / Description</label>
                <textarea
                  value={materialFormData.content}
                  onChange={e => setMaterialFormData({...materialFormData, content: e.target.value})}
                  rows="3"
                  placeholder="Enter content or description"
                />
              </div>
              <div className="form-group">
                <label>URL (for links, videos, or files)</label>
                <input
                  type="url"
                  value={materialFormData.url}
                  onChange={e => setMaterialFormData({...materialFormData, url: e.target.value})}
                  placeholder="https://example.com/material"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowMaterialModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ✅ FIXED: Create Assessment Modal */}
      {/* ========================================== */}
      {showAssessmentModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowAssessmentModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>
                  <i className="fas fa-question-circle"></i>
                  {selectedTopic ? `Add Assessment to: ${selectedTopic.title}` : 'Add Course Assessment'}
                </h3>
              </div>
              <div className="modal-header-right">
                <button className="modal-close" onClick={() => setShowAssessmentModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateAssessment}>
              {/* ✅ Show selected topic info */}
              {selectedTopic && (
                <div className="form-group" style={{ 
                  background: '#F0FDF4', 
                  padding: '8px 12px', 
                  borderRadius: '6px',
                  borderLeft: '4px solid #16A34A',
                  marginBottom: '16px'
                }}>
                  <span style={{ color: '#065F46' }}>
                    <i className="fas fa-folder-open"></i> 
                    Topic: <strong>{selectedTopic.title}</strong> (ID: {selectedTopic.id})
                  </span>
                </div>
              )}
              
              <div className="form-group">
                <label>Assessment Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={assessmentFormData.title}
                  onChange={e => setAssessmentFormData({...assessmentFormData, title: e.target.value})}
                  required
                  placeholder="Enter assessment title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={assessmentFormData.description}
                  onChange={e => setAssessmentFormData({...assessmentFormData, description: e.target.value})}
                  rows="2"
                  placeholder="Brief description of this assessment"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={assessmentFormData.type}
                    onChange={e => setAssessmentFormData({...assessmentFormData, type: e.target.value})}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="practice">Practice</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Passing Score (%)</label>
                  <input
                    type="number"
                    value={assessmentFormData.passing_score}
                    onChange={e => setAssessmentFormData({...assessmentFormData, passing_score: parseInt(e.target.value) || 70})}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={assessmentFormData.time_limit || ''}
                    onChange={e => setAssessmentFormData({...assessmentFormData, time_limit: e.target.value ? parseInt(e.target.value) : null})}
                    min="1"
                    placeholder="No limit"
                  />
                </div>
                <div className="form-group">
                  <label>Max Attempts</label>
                  <input
                    type="number"
                    value={assessmentFormData.max_attempts}
                    onChange={e => setAssessmentFormData({...assessmentFormData, max_attempts: parseInt(e.target.value) || 1})}
                    min="1"
                  />
                </div>
              </div>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={assessmentFormData.allow_retake}
                    onChange={e => setAssessmentFormData({...assessmentFormData, allow_retake: e.target.checked})}
                  />
                  Allow retake
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={assessmentFormData.show_score_immediately}
                    onChange={e => setAssessmentFormData({...assessmentFormData, show_score_immediately: e.target.checked})}
                  />
                  Show score immediately
                </label>
              </div>

              {/* Questions Editor */}
              <div className="form-group">
                <div className="questions-toolbar">
                  <label>Questions <span className="required">*</span></label>
                  <div className="questions-actions">
                    <button type="button" className="btn-sm btn-secondary" onClick={loadSampleQuestions}>
                      <i className="fas fa-file-alt"></i> Load Sample
                    </button>
                    <button type="button" className="btn-sm btn-secondary" onClick={() => addQuestionTemplate('multipleChoice')}>
                      <i className="fas fa-plus"></i> MCQ
                    </button>
                    <button type="button" className="btn-sm btn-secondary" onClick={() => addQuestionTemplate('trueFalse')}>
                      <i className="fas fa-plus"></i> T/F
                    </button>
                    <button type="button" className="btn-sm btn-secondary" onClick={() => addQuestionTemplate('shortAnswer')}>
                      <i className="fas fa-plus"></i> Short
                    </button>
                  </div>
                </div>

                {assessmentFormData.questions.length === 0 ? (
                  <div className="empty-questions">
                    <i className="fas fa-question-circle"></i>
                    <p>No questions added yet. Use the buttons above to add questions.</p>
                  </div>
                ) : (
                  <div className="questions-list">
                    {assessmentFormData.questions.map((q, index) => (
                      <div key={q.id || index} className="question-item">
                        <div className="question-header">
                          <span className="question-number">Q{index + 1}</span>
                          <span className={`question-type ${q.type}`}>{q.type}</span>
                          <button type="button" className="btn-sm btn-delete" onClick={() => removeQuestion(index)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            value={q.question || ''}
                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                            placeholder="Enter question text"
                            className="question-input"
                          />
                        </div>
                        {q.type === 'multiple-choice' && (
                          <div className="form-group">
                            <label>Options</label>
                            {q.options && q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="option-input">
                                <input
                                  type="text"
                                  value={opt || ''}
                                  onChange={(e) => {
                                    const newOptions = [...q.options];
                                    newOptions[optIdx] = e.target.value;
                                    updateQuestion(index, 'options', newOptions);
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                />
                              </div>
                            ))}
                            <button 
                              type="button" 
                              className="btn-sm btn-secondary" 
                              onClick={() => {
                                const newOptions = [...(q.options || []), `Option ${String.fromCharCode(65 + (q.options?.length || 0))}`];
                                updateQuestion(index, 'options', newOptions);
                              }}
                              style={{ marginTop: '4px' }}
                            >
                              <i className="fas fa-plus"></i> Add Option
                            </button>
                          </div>
                        )}
                        <div className="form-group">
                          <label>Correct Answer</label>
                          {q.type === 'multiple-choice' ? (
                            <select
                              value={q.correctAnswer || ''}
                              onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                              className="correct-answer-select"
                            >
                              <option value="">Select correct answer</option>
                              {q.options && q.options.map((opt, optIdx) => (
                                <option key={optIdx} value={opt}>{opt || `Option ${String.fromCharCode(65 + optIdx)}`}</option>
                              ))}
                            </select>
                          ) : q.type === 'true-false' ? (
                            <select
                              value={q.correctAnswer || ''}
                              onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                              className="correct-answer-select"
                            >
                              <option value="">Select correct answer</option>
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={q.correctAnswers ? q.correctAnswers.join(', ') : ''}
                              onChange={(e) => {
                                const answers = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                updateQuestion(index, 'correctAnswers', answers);
                              }}
                              placeholder="Comma separated correct answers (e.g., integrity, honesty)"
                              className="correct-answer-input"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <small className="form-hint">
                  <i className="fas fa-info-circle"></i>
                  Add questions using the buttons above. Each question must have text and a correct answer.
                </small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAssessmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalScoutCourses;