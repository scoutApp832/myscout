import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// ============================================
// COMPLETE CSS - Scout Theme Colors
// ============================================

const styles = `
  /* ============================================
     SCOUT THEME CSS - Rwanda Scout Association
     Primary: #622599 (Purple)
     Secondary: #00843D (Green)
     Accent: #F4B400 (Gold)
     Danger: #C8102E (Red)
     ============================================ */

  :root {
    --scout-purple: #622599;
    --scout-green: #00843D;
    --scout-gold: #F4B400;
    --scout-red: #C8102E;
    --scout-white: #FFFFFF;
    --scout-light: #F8F9FA;
    --scout-dark: #1F2937;
    --scout-gray: #6B7280;
  }

  /* ----- BASE & CONTAINER ----- */
  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--scout-light);
    min-height: 100vh;
    color: var(--scout-dark);
  }

  /* ----- HEADER ----- */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e5e7eb;
    flex-wrap: wrap;
    gap: 16px;
  }

  .page-header h2 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--scout-purple);
  }

  .page-header h2 i {
    color: var(--scout-gold);
    font-size: 26px;
  }

  .page-header p {
    color: var(--scout-gray);
    margin: 4px 0 0 0;
    font-size: 15px;
  }

  .page-header p strong {
    color: var(--scout-green);
    font-weight: 600;
  }

  .district-badge {
    display: inline-flex !important;
    align-items: center;
    gap: 6px;
    background: var(--scout-purple) !important;
    color: var(--scout-white) !important;
    padding: 5px 16px !important;
    border-radius: 50px !important;
    font-size: 0.8rem !important;
    margin-top: 4px !important;
    font-weight: 500;
  }

  /* ----- BUTTONS ----- */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--scout-purple);
    color: var(--scout-white);
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    box-shadow: 0 2px 4px rgba(98, 37, 153, 0.2);
  }

  .btn-primary:hover {
    background: #4e1d7a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(98, 37, 153, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--scout-gray);
    color: var(--scout-white);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: #4b5563;
  }

  .btn-success {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--scout-green);
    color: var(--scout-white);
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-success:hover {
    background: #006b31;
  }

  .btn-danger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--scout-red);
    color: var(--scout-white);
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-danger:hover {
    background: #a00d25;
  }

  .btn-sm {
    padding: 6px 14px;
    font-size: 12px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-sm:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .btn-view { background: var(--scout-purple); color: var(--scout-white); }
  .btn-view:hover { background: #4e1d7a; }

  .btn-approve { background: var(--scout-green); color: var(--scout-white); }
  .btn-approve:hover { background: #006b31; }

  .btn-edit { background: var(--scout-gold); color: var(--scout-dark); }
  .btn-edit:hover { background: #dba300; }

  .btn-forward { background: #0d9488; color: var(--scout-white); }
  .btn-forward:hover { background: #0f766e; }

  .btn-archive { background: var(--scout-gray); color: var(--scout-white); }
  .btn-archive:hover { background: #4b5563; }

  .btn-refresh {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--scout-purple);
    color: var(--scout-white);
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-refresh:hover {
    background: #4e1d7a;
  }

  .btn-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--scout-red);
    color: var(--scout-white);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .btn-remove:hover {
    background: #a00d25;
    transform: scale(1.1);
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--scout-gray);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: #f1f3f5;
    color: var(--scout-dark);
  }

  /* ----- ALERTS ----- */
  .alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-radius: 8px;
    border-left: 4px solid;
    margin-bottom: 16px;
    background: var(--scout-white);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    position: relative;
  }

  .alert-error {
    border-color: var(--scout-red);
    background: #fef2f2;
  }

  .alert-success {
    border-color: var(--scout-green);
    background: #f0fdf4;
  }

  .alert i {
    font-size: 18px;
  }

  .alert-close {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--scout-gray);
    cursor: pointer;
    margin-left: auto;
    padding: 0 4px;
    transition: color 0.2s ease;
  }

  .alert-close:hover {
    color: var(--scout-dark);
  }

  /* ----- FILTER BAR ----- */
  .filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    padding: 12px 16px;
    background: var(--scout-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    align-items: center;
  }

  .filter-btn {
    padding: 6px 16px;
    border: 2px solid transparent;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #f1f3f5;
    color: var(--scout-gray);
  }

  .filter-btn:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
  }

  .filter-btn.active {
    background: var(--scout-purple);
    color: var(--scout-white);
    border-color: var(--scout-purple);
  }

  .filter-btn.active:hover {
    background: #4e1d7a;
  }

  /* ----- LOADING ----- */
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    font-size: 18px;
    color: var(--scout-purple);
  }

  .loading-spinner i {
    font-size: 28px;
  }

  /* ----- EMPTY STATE ----- */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: var(--scout-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .empty-state i {
    font-size: 48px;
    color: var(--scout-gold);
    margin-bottom: 16px;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    color: var(--scout-dark);
    font-size: 20px;
  }

  .empty-state p {
    color: var(--scout-gray);
    font-size: 15px;
    margin: 0;
  }

  /* ----- REPORTS LIST ----- */
  .reports-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .report-card {
    background: var(--scout-white);
    border-radius: 12px;
    padding: 20px 24px;
    border-left: 4px solid var(--scout-gray);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: all 0.2s ease;
  }

  .report-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  .report-card.status-pending { border-left-color: var(--scout-gold); }
  .report-card.status-approved { border-left-color: var(--scout-green); }
  .report-card.status-revision { border-left-color: var(--scout-purple); }
  .report-card.status-rejected { border-left-color: var(--scout-red); }
  .report-card.status-archived { border-left-color: var(--scout-gray); }

  /* ----- REPORT HEADER ----- */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
  }

  .report-title-section {
    flex: 1;
    min-width: 200px;
  }

  .report-title-section h4 {
    margin: 0 0 6px 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--scout-dark);
  }

  .report-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    font-size: 13px;
    color: var(--scout-gray);
  }

  .report-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .report-meta i {
    color: var(--scout-purple);
    font-size: 12px;
  }

  .report-status-section {
    flex-shrink: 0;
  }

  /* ----- STATUS BADGES ----- */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .badge-pending {
    background: #fef3c7;
    color: #92400e;
  }

  .badge-approved {
    background: #d1fae5;
    color: #065f46;
  }

  .badge-review {
    background: #ede9fe;
    color: #5b21b6;
  }

  .badge-rejected {
    background: #fee2e2;
    color: #991b1b;
  }

  .badge-default {
    background: #f1f3f5;
    color: var(--scout-gray);
  }

  /* ----- REPORT BODY ----- */
  .report-body {
    margin: 12px 0;
  }

  .report-description {
    color: var(--scout-dark);
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 12px 0;
  }

  .report-detail {
    margin: 8px 0;
    padding: 8px 12px;
    background: var(--scout-light);
    border-radius: 6px;
  }

  .report-detail strong {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
    color: var(--scout-green);
  }

  .report-detail p {
    margin: 0;
    font-size: 14px;
    color: var(--scout-dark);
    line-height: 1.5;
  }

  .report-feedback {
    margin: 10px 0;
    padding: 12px 16px;
    background: #fef3c7;
    border-left: 4px solid var(--scout-gold);
    border-radius: 6px;
  }

  .report-feedback strong {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
    color: var(--scout-purple);
  }

  .report-feedback p {
    margin: 0;
    font-size: 14px;
    color: var(--scout-dark);
    line-height: 1.5;
  }

  /* ----- ATTACHMENTS ----- */
  .attachments {
    margin: 12px 0 0 0;
  }

  .attachments > strong {
    display: block;
    font-size: 13px;
    color: var(--scout-purple);
    margin-bottom: 6px;
  }

  .attachment-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f0f4f8;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    margin: 3px;
  }

  .attachment-item i {
    color: var(--scout-purple);
  }

  .attachment-item span {
    font-size: 0.85rem;
    color: var(--scout-dark);
  }

  /* ----- REPORT ACTIONS ----- */
  .report-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #e5e7eb;
  }

  /* ----- MODALS ----- */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-content {
    background: var(--scout-white);
    border-radius: 16px;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }

  .modal-large {
    max-width: 900px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 2px solid var(--scout-gold);
    position: sticky;
    top: 0;
    background: var(--scout-white);
    z-index: 1;
    border-radius: 16px 16px 0 0;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--scout-purple);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .modal-body {
    padding: 24px;
  }

  /* ----- FORM ELEMENTS ----- */
  .form-group {
    margin-bottom: 18px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    font-size: 14px;
    color: var(--scout-dark);
  }

  .form-group .required {
    color: var(--scout-red);
  }

  .form-control {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    color: var(--scout-dark);
    transition: all 0.2s ease;
    background: var(--scout-white);
    box-sizing: border-box;
  }

  .form-control:focus {
    outline: none;
    border-color: var(--scout-purple);
    box-shadow: 0 0 0 3px rgba(98, 37, 153, 0.15);
  }

  .form-control:disabled {
    background: #f1f3f5;
    cursor: not-allowed;
  }

  textarea.form-control {
    resize: vertical;
    min-height: 80px;
  }

  select.form-control {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }

  .help-text {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: var(--scout-gray);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    background: var(--scout-light);
    border-radius: 0 0 16px 16px;
    position: sticky;
    bottom: 0;
  }

  /* ----- DETAIL VIEW ----- */
  .detail-row {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid #f1f3f5;
    gap: 12px;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-row strong {
    min-width: 140px;
    font-size: 14px;
    color: var(--scout-purple);
    flex-shrink: 0;
  }

  .detail-row > span,
  .detail-row > p {
    font-size: 14px;
    color: var(--scout-dark);
    margin: 0;
  }

  .detail-row p {
    line-height: 1.5;
  }

  .detail-row.feedback {
    background: #fef3c7;
    padding: 12px 16px;
    border-radius: 8px;
    border-left: 4px solid var(--scout-gold);
  }

  /* ----- REVIEW SECTION ----- */
  .review-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid var(--scout-gold);
  }

  .review-section h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: var(--scout-purple);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .review-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  /* ----- ATTACHMENT LIST IN MODAL ----- */
  .attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }

  /* ----- RESPONSIVE ----- */
  @media (max-width: 768px) {
    .dashboard-container {
      padding: 16px;
    }

    .page-header {
      flex-direction: column;
      align-items: stretch;
    }

    .page-header h2 {
      font-size: 22px;
    }

    .filter-bar {
      padding: 10px 12px;
    }

    .filter-btn {
      padding: 4px 12px;
      font-size: 12px;
    }

    .report-card {
      padding: 16px;
    }

    .report-header {
      flex-direction: column;
    }

    .report-meta {
      font-size: 12px;
      gap: 8px 16px;
    }

    .modal-content {
      margin: 10px;
      max-height: 95vh;
    }

    .modal-header {
      padding: 16px;
    }

    .modal-header h3 {
      font-size: 17px;
    }

    .modal-body {
      padding: 16px;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .detail-row {
      flex-direction: column;
      gap: 4px;
      padding: 10px 0;
    }

    .detail-row strong {
      min-width: auto;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-actions button {
      width: 100%;
      justify-content: center;
    }

    .review-actions {
      flex-direction: column;
    }

    .review-actions button {
      width: 100%;
      justify-content: center;
    }

    .report-actions {
      flex-direction: column;
    }

    .report-actions .btn-sm {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .dashboard-container {
      padding: 12px;
    }

    .page-header h2 {
      font-size: 19px;
    }

    .filter-bar {
      gap: 4px;
    }

    .filter-btn {
      font-size: 11px;
      padding: 3px 10px;
    }

    .report-card {
      padding: 12px;
    }

    .report-title-section h4 {
      font-size: 15px;
    }
  }

  /* ----- SCROLLBAR ----- */
  .modal-content::-webkit-scrollbar {
    width: 6px;
  }

  .modal-content::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 3px;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: #c4c9d0;
    border-radius: 3px;
  }

  .modal-content::-webkit-scrollbar-thumb:hover {
    background: #a8adb4;
  }
`;

// ============================================
// HELPER FUNCTIONS
// ============================================

const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const iconMap = {
    'jpg': 'file-image',
    'jpeg': 'file-image',
    'png': 'file-image',
    'gif': 'file-image',
    'pdf': 'file-pdf',
    'doc': 'file-word',
    'docx': 'file-word',
    'xls': 'file-excel',
    'xlsx': 'file-excel'
  };
  return iconMap[extension] || 'file';
};

const getFileUrl = (filePath) => {
  if (!filePath) return '#';
  if (filePath.startsWith('http')) return filePath;
  if (filePath.startsWith('/uploads/')) {
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${filePath}`;
  }
  return filePath;
};

// ============================================
// MAIN COMPONENT
// ============================================

const DistrictReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [remarks, setRemarks] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [districtInfo, setDistrictInfo] = useState(null);
  
  // Create/Edit states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    activity_type: '',
    activity_date: '',
    location: '',
    participants_count: '',
    achievements: '',
    challenges: '',
    recommendations: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const activityTypes = [
    'Community Service', 'Training', 'Camp', 'Meeting',
    'Ceremony', 'Fundraising', 'Environmental', 'Other'
  ];

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    getUserDistrict();
    fetchReports();
  }, [filterStatus]);

  // ============================================
  // DISTRICT INFO
  // ============================================

  const getUserDistrict = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user/district`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.district) {
        setDistrictInfo(response.data);
        console.log('📍 District Commissioner for:', response.data.district);
      }
    } catch (err) {
      console.error('❌ Error fetching user district:', err);
      if (user?.district) {
        setDistrictInfo({ district: user.district });
      }
    }
  };

  // ============================================
  // FETCH REPORTS
  // ============================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/reports?status=${filterStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let reportsData = [];
      if (Array.isArray(response.data)) {
        reportsData = response.data;
      } else if (response.data.reports && Array.isArray(response.data.reports)) {
        reportsData = response.data.reports;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        reportsData = response.data.data;
      } else {
        reportsData = [];
      }
      
      if (districtInfo?.district && reportsData.length > 0) {
        reportsData = reportsData.filter(report => 
          report.district === districtInfo.district
        );
      }
      
      setReports(reportsData);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FILE HANDLERS
  // ============================================

  const handleFileView = (filePath) => {
    if (!filePath) return;
    const fileUrl = getFileUrl(filePath);
    window.open(fileUrl, '_blank');
  };

  const handleFileDownload = async (filePath) => {
    if (!filePath) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to download files');
        return;
      }

      const fileUrl = getFileUrl(filePath);
      const filename = filePath.split('/').pop() || 'download';
      
      const response = await fetch(fileUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      window.open(getFileUrl(filePath), '_blank');
    }
  };

  // ============================================
  // FILE SELECTION
  // ============================================

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      return validTypes.includes(file.type);
    });
    
    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only images, PDFs, Word, and Excel files are allowed.');
      setTimeout(() => setError(''), 5000);
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const resetForm = () => {
    setNewReport({
      title: '',
      description: '',
      activity_type: '',
      activity_date: '',
      location: '',
      participants_count: '',
      achievements: '',
      challenges: '',
      recommendations: ''
    });
    setAttachments([]);
    setEditingReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateReport = async () => {
    try {
      if (!newReport.title || !newReport.title.trim()) {
        setError('Please enter a report title');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (!newReport.activity_date) {
        setError('Please select an activity date');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setUploadingFiles(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      Object.keys(newReport).forEach(key => {
        if (newReport[key]) {
          formData.append(key, newReport[key]);
        }
      });
      
      if (districtInfo?.district) {
        formData.append('district', districtInfo.district);
      }

      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(`${API_URL}/reports`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('✅ Report created and sent to National Commissioner successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowCreateModal(false);
      resetForm();
      fetchReports();
    } catch (err) {
      console.error('❌ Error creating report:', err);
      setError(err.response?.data?.message || 'Failed to create report');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingFiles(false);
    }
  };

  const openEditModal = (report) => {
    setEditingReport({
      id: report.id,
      title: report.title || '',
      description: report.description || '',
      activity_type: report.activity_type || '',
      activity_date: report.activity_date || '',
      location: report.location || '',
      participants_count: report.participants_count || '',
      achievements: report.achievements || '',
      challenges: report.challenges || '',
      recommendations: report.recommendations || '',
      district: report.district || '',
      status: report.status
    });
    setAttachments([]);
    setShowEditModal(true);
  };

  const handleUpdateReport = async () => {
    try {
      if (!editingReport) return;
      
      setUploadingFiles(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('title', editingReport.title);
      formData.append('description', editingReport.description);
      formData.append('activity_type', editingReport.activity_type || '');
      formData.append('activity_date', editingReport.activity_date || '');
      formData.append('location', editingReport.location || '');
      formData.append('participants_count', editingReport.participants_count || '');
      formData.append('achievements', editingReport.achievements || '');
      formData.append('challenges', editingReport.challenges || '');
      formData.append('recommendations', editingReport.recommendations || '');
      
      if (editingReport.district) {
        formData.append('district', editingReport.district);
      }
      
      const newAttachments = attachments.filter(file => file instanceof File);
      newAttachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.put(`${API_URL}/district/reports/${editingReport.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('✅ Report updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowEditModal(false);
      resetForm();
      fetchReports();
    } catch (err) {
      console.error('❌ Error updating report:', err);
      setError(err.response?.data?.message || 'Failed to update report');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleApproveOnly = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/reports/${id}/approve-only`, 
        { feedback: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('✅ Report approved successfully! (Not forwarded to National)');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedReport(null);
      setShowViewModal(false);
      setRemarks('');
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleApproveAndForward = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/reports/${id}/approve-forward`, 
        { feedback: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('✅ Report approved and forwarded to National Commissioner!');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedReport(null);
      setShowViewModal(false);
      setRemarks('');
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve and forward report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleForwardToNational = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/reports/${id}/forward`, 
        { feedback: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('✅ Report forwarded to National Commissioner!');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedReport(null);
      setShowViewModal(false);
      setRemarks('');
      fetchReports();
      
      if (selectedReport && selectedReport.id === id) {
        const updated = await axios.get(`${API_URL}/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (updated.data && updated.data.report) {
          setSelectedReport(updated.data.report);
        }
      }
      
    } catch (err) {
      console.error('❌ Error forwarding report:', err);
      setError(err.response?.data?.message || 'Failed to forward report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRequestRevision = async (id) => {
    try {
      if (!remarks || !remarks.trim()) {
        setError('Please provide feedback for the revision request');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/reports/${id}/reject`, 
        { feedback: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('✅ Revision requested! Report sent back to Unit Leader.');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedReport(null);
      setShowViewModal(false);
      setRemarks('');
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request revision');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleArchive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/reports/${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Report archived successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive report');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ============================================
  // STATUS HELPERS
  // ============================================

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'approved': 'badge-approved',
      'revision': 'badge-review',
      'rejected': 'badge-rejected',
      'archived': 'badge-default'
    };
    return badges[status] || 'badge-default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'fa-clock',
      'approved': 'fa-check-circle',
      'revision': 'fa-edit',
      'rejected': 'fa-times-circle',
      'archived': 'fa-archive'
    };
    return icons[status] || 'fa-file';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'revision': 'Needs Revision',
      'rejected': 'Rejected',
      'archived': 'Archived'
    };
    return labels[status] || status;
  };

  const isForwarded = (report) => {
    return report.forwarded_to_national === true || 
           report.forwardedToNational === true ||
           report.is_forwarded === true ||
           report.forwarded === true;
  };

  const reportsList = Array.isArray(reports) ? reports : [];

  // ============================================
  // RENDER
  // ============================================

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading reports...
    </div>
  );

  return (
    <>
      {/* Inject CSS */}
      <style>{styles}</style>
      
      <div className="dashboard-container">
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h2>
              <i className="fas fa-file-alt"></i> 
              District Reports
            </h2>
            <p>
              Review, approve, and manage reports from Unit Leaders in 
              <strong> {districtInfo?.district || 'your district'}</strong>
            </p>
            {districtInfo?.district && (
              <span className="district-badge">
                <i className="fas fa-map-marker-alt"></i> {districtInfo.district} District
              </span>
            )}
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i> Create Report
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
            <button className="alert-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            {success}
            <button className="alert-close" onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* FILTER BAR */}
        <div className="filter-bar">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({reportsList.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({reportsList.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            Approved ({reportsList.filter(r => r.status === 'approved').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'revision' ? 'active' : ''}`}
            onClick={() => setFilterStatus('revision')}
          >
            Revision ({reportsList.filter(r => r.status === 'revision').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected ({reportsList.filter(r => r.status === 'rejected').length})
          </button>
          <button 
            className="btn-refresh"
            onClick={fetchReports}
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        {/* REPORTS LIST */}
        <div className="reports-list">
          {reportsList.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-file-alt"></i>
              <h3>No Reports</h3>
              <p>No reports have been submitted in your district yet.</p>
            </div>
          ) : (
            reportsList.map(report => (
              <div key={report.id} className={`report-card status-${report.status}`}>
                {/* REPORT HEADER */}
                <div className="report-header">
                  <div className="report-title-section">
                    <h4>{report.title}</h4>
                    <div className="report-meta">
                      <span>
                        <i className="fas fa-user"></i> 
                        {report.submitter?.first_name && report.submitter?.last_name 
                          ? `${report.submitter.first_name} ${report.submitter.last_name}`
                          : report.creator?.full_name || report.submitted_by || 'Unknown'}
                      </span>
                      <span>
                        <i className="fas fa-calendar"></i> 
                        {report.activity_date ? new Date(report.activity_date).toLocaleDateString() : 
                         report.date || new Date(report.created_at).toLocaleDateString()}
                      </span>
                      {report.unit && (
                        <span>
                          <i className="fas fa-users"></i> {report.unit.name || 'Unit'}
                        </span>
                      )}
                      {isForwarded(report) ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#d1fae5',
                          color: '#065f46',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          <i className="fas fa-paper-plane"></i> Forwarded to National
                        </span>
                      ) : report.status === 'approved' && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          <i className="fas fa-clock"></i> Not Forwarded
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="report-status-section">
                    <span className={`status-badge ${getStatusBadge(report.status)}`}>
                      <i className={`fas ${getStatusIcon(report.status)}`}></i>
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                </div>

                {/* REPORT BODY */}
                <div className="report-body">
                  <p className="report-description">
                    {report.description || report.content || 'No description provided'}
                  </p>
                  
                  {report.achievements && (
                    <div className="report-detail">
                      <strong><i className="fas fa-trophy"></i> Achievements:</strong>
                      <p>{report.achievements}</p>
                    </div>
                  )}

                  {report.challenges && (
                    <div className="report-detail">
                      <strong><i className="fas fa-exclamation-triangle"></i> Challenges:</strong>
                      <p>{report.challenges}</p>
                    </div>
                  )}

                  {report.feedback && (
                    <div className="report-feedback">
                      <strong><i className="fas fa-comment"></i> Feedback:</strong>
                      <p>{report.feedback}</p>
                    </div>
                  )}

                  {/* ATTACHMENTS */}
                  {report.file_urls && report.file_urls.length > 0 && (
                    <div className="attachments">
                      <strong><i className="fas fa-paperclip"></i> Attachments:</strong>
                      <div>
                        {report.file_urls.map((file, index) => {
                          const fileName = file.split('/').pop() || `Attachment ${index + 1}`;
                          const fileIcon = getFileIcon(file);
                          
                          return (
                            <div key={index} className="attachment-item">
                              <i className={`fas fa-${fileIcon}`}></i>
                              <span>{fileName}</span>
                              <button
                                className="btn-sm btn-view"
                                onClick={() => handleFileView(file)}
                                style={{ padding: '2px 8px', fontSize: '11px' }}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn-sm btn-approve"
                                onClick={() => handleFileDownload(file)}
                                style={{ padding: '2px 8px', fontSize: '11px' }}
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* REPORT ACTIONS */}
                <div className="report-actions">
                  <button 
                    className="btn-sm btn-view"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowViewModal(true);
                      setRemarks('');
                    }}
                  >
                    <i className="fas fa-eye"></i> View Details
                  </button>

                  {report.status === 'pending' && (
                    <>
                      <button 
                        className="btn-sm btn-approve"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowViewModal(true);
                        }}
                      >
                        <i className="fas fa-check"></i> Review
                      </button>
                      <button 
                        className="btn-sm btn-edit"
                        onClick={() => openEditModal(report)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    </>
                  )}

                  {report.status === 'revision' && (
                    <button 
                      className="btn-sm btn-edit"
                      onClick={() => openEditModal(report)}
                    >
                      <i className="fas fa-edit"></i> Edit & Resend
                    </button>
                  )}

                  {report.status === 'approved' && !isForwarded(report) && (
                    <button 
                      className="btn-sm btn-forward"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowViewModal(true);
                        setRemarks('');
                      }}
                    >
                      <i className="fas fa-paper-plane"></i> Forward to National
                    </button>
                  )}

                  {report.status === 'approved' && (
                    <button 
                      className="btn-sm btn-archive"
                      onClick={() => handleArchive(report.id)}
                    >
                      <i className="fas fa-archive"></i> Archive
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ============================================ */}
        {/* VIEW/REVIEW MODAL */}
        {/* ============================================ */}
        {showViewModal && selectedReport && (
          <div className="modal-overlay" onClick={() => {
            setShowViewModal(false);
            setSelectedReport(null);
            setRemarks('');
          }}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <i className="fas fa-file-alt"></i> 
                  {selectedReport.status === 'pending' ? 'Review Report' : 'Report Details'}
                </h3>
                <button className="modal-close" onClick={() => {
                  setShowViewModal(false);
                  setSelectedReport(null);
                  setRemarks('');
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="report-detail-view">
                  <div className="detail-row">
                    <strong>Title:</strong>
                    <span>{selectedReport.title}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong>
                    <span className={`status-badge ${getStatusBadge(selectedReport.status)}`}>
                      <i className={`fas ${getStatusIcon(selectedReport.status)}`}></i>
                      {getStatusLabel(selectedReport.status)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Forwarded to National:</strong>
                    <span style={{ color: isForwarded(selectedReport) ? '#065f46' : '#92400e' }}>
                      {isForwarded(selectedReport) ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Submitted By:</strong>
                    <span>
                      {selectedReport.submitter?.first_name && selectedReport.submitter?.last_name 
                        ? `${selectedReport.submitter.first_name} ${selectedReport.submitter.last_name}`
                        : selectedReport.creator?.full_name || selectedReport.submitted_by || 'Unknown'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>District:</strong>
                    <span>{selectedReport.district || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Activity Date:</strong>
                    <span>{selectedReport.activity_date ? new Date(selectedReport.activity_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Activity Type:</strong>
                    <span>{selectedReport.activity_type || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Location:</strong>
                    <span>{selectedReport.location || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Participants:</strong>
                    <span>{selectedReport.participants_count || 0}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Description:</strong>
                    <p>{selectedReport.description || selectedReport.content || 'No description provided'}</p>
                  </div>
                  {selectedReport.achievements && (
                    <div className="detail-row">
                      <strong>Achievements:</strong>
                      <p>{selectedReport.achievements}</p>
                    </div>
                  )}
                  {selectedReport.challenges && (
                    <div className="detail-row">
                      <strong>Challenges:</strong>
                      <p>{selectedReport.challenges}</p>
                    </div>
                  )}
                  {selectedReport.recommendations && (
                    <div className="detail-row">
                      <strong>Recommendations:</strong>
                      <p>{selectedReport.recommendations}</p>
                    </div>
                  )}
                  
                  {/* MODAL ATTACHMENTS */}
                  {selectedReport.file_urls && selectedReport.file_urls.length > 0 && (
                    <div className="detail-row">
                      <strong>Attachments:</strong>
                      <div className="attachment-list">
                        {selectedReport.file_urls.map((file, index) => {
                          const fileName = file.split('/').pop() || `Attachment ${index + 1}`;
                          const fileIcon = getFileIcon(file);
                          
                          return (
                            <div key={index} className="attachment-item">
                              <i className={`fas fa-${fileIcon}`}></i>
                              <span>{fileName}</span>
                              <button
                                className="btn-sm btn-view"
                                onClick={() => handleFileView(file)}
                                style={{ padding: '2px 8px', fontSize: '11px' }}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn-sm btn-approve"
                                onClick={() => handleFileDownload(file)}
                                style={{ padding: '2px 8px', fontSize: '11px' }}
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {selectedReport.feedback && (
                    <div className="detail-row feedback">
                      <strong><i className="fas fa-comment"></i> Previous Feedback:</strong>
                      <p>{selectedReport.feedback}</p>
                    </div>
                  )}
                  <div className="detail-row">
                    <strong>Submitted:</strong>
                    <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
                  </div>
                  {selectedReport.updated_at && (
                    <div className="detail-row">
                      <strong>Last Updated:</strong>
                      <span>{new Date(selectedReport.updated_at).toLocaleString()}</span>
                    </div>
                  )}

                  {/* REVIEW ACTIONS - For pending reports */}
                  {selectedReport.status === 'pending' && (
                    <div className="review-section">
                      <h4><i className="fas fa-check-circle"></i> Review Actions</h4>
                      <div className="form-group">
                        <label>Feedback / Remarks</label>
                        <textarea
                          value={remarks}
                          onChange={e => setRemarks(e.target.value)}
                          rows="4"
                          placeholder="Provide your feedback or revision requests..."
                          className="form-control"
                        />
                      </div>
                      <div className="review-actions">
                        <button 
                          className="btn-danger"
                          onClick={() => handleRequestRevision(selectedReport.id)}
                        >
                          <i className="fas fa-times-circle"></i> Reject
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => handleApproveOnly(selectedReport.id)}
                        >
                          <i className="fas fa-check"></i> Approve Only
                        </button>
                        <button 
                          className="btn-success"
                          onClick={() => handleApproveAndForward(selectedReport.id)}
                        >
                          <i className="fas fa-paper-plane"></i> Approve & Forward
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORWARD ACTION - For approved but not forwarded */}
                  {selectedReport.status === 'approved' && !isForwarded(selectedReport) && (
                    <div className="review-section">
                      <h4><i className="fas fa-paper-plane"></i> Forward to National</h4>
                      <p style={{ color: 'var(--scout-gray)', marginBottom: '12px' }}>
                        This report is approved but not yet forwarded to the National Commissioner.
                      </p>
                      <div className="form-group">
                        <label>Additional Remarks</label>
                        <textarea
                          value={remarks}
                          onChange={e => setRemarks(e.target.value)}
                          rows="3"
                          placeholder="Add any additional notes for forwarding..."
                          className="form-control"
                        />
                      </div>
                      <button 
                        className="btn-primary"
                        onClick={() => handleForwardToNational(selectedReport.id)}
                      >
                        <i className="fas fa-paper-plane"></i> Forward to National Commissioner
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => {
                  setShowViewModal(false);
                  setSelectedReport(null);
                  setRemarks('');
                }}>
                  Close
                </button>
                {selectedReport.status === 'pending' && (
                  <button className="btn-primary" onClick={() => openEditModal(selectedReport)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* CREATE MODAL */}
        {/* ============================================ */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => {
            setShowCreateModal(false);
            resetForm();
          }}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-plus-circle"></i> Create New Report</h3>
                <button className="modal-close" onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Report Title <span className="required">*</span></label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={e => setNewReport({...newReport, title: e.target.value})}
                    placeholder="Enter report title"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Activity Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={newReport.activity_date}
                    onChange={e => setNewReport({...newReport, activity_date: e.target.value})}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newReport.description}
                    onChange={e => setNewReport({...newReport, description: e.target.value})}
                    rows="4"
                    placeholder="Enter report description"
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Activity Type</label>
                    <select
                      value={newReport.activity_type}
                      onChange={e => setNewReport({...newReport, activity_type: e.target.value})}
                      className="form-control"
                    >
                      <option value="">Select activity type</option>
                      {activityTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={newReport.location}
                      onChange={e => setNewReport({...newReport, location: e.target.value})}
                      placeholder="Enter location"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Number of Participants</label>
                  <input
                    type="number"
                    value={newReport.participants_count}
                    onChange={e => setNewReport({...newReport, participants_count: e.target.value})}
                    placeholder="Enter number of participants"
                    className="form-control"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Achievements</label>
                  <textarea
                    value={newReport.achievements}
                    onChange={e => setNewReport({...newReport, achievements: e.target.value})}
                    rows="3"
                    placeholder="List the key achievements"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Challenges</label>
                  <textarea
                    value={newReport.challenges}
                    onChange={e => setNewReport({...newReport, challenges: e.target.value})}
                    rows="3"
                    placeholder="Describe any challenges faced"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Recommendations</label>
                  <textarea
                    value={newReport.recommendations}
                    onChange={e => setNewReport({...newReport, recommendations: e.target.value})}
                    rows="3"
                    placeholder="Provide recommendations"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Attachments</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                    className="form-control"
                  />
                  <small className="help-text">
                    Supported formats: Images (JPG, PNG, GIF), PDF, Word (DOC, DOCX), Excel (XLS, XLSX)
                  </small>
                </div>

                {attachments.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ color: 'var(--scout-purple)' }}>Selected files:</strong>
                    {attachments.map((file, index) => (
                      <div key={index} className="attachment-item" style={{ marginTop: '4px' }}>
                        <i className={`fas fa-${getFileIcon(file.name)}`}></i>
                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button 
                          className="btn-remove"
                          onClick={() => removeAttachment(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleCreateReport}
                  disabled={uploadingFiles}
                >
                  {uploadingFiles ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Send to National Commissioner
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* EDIT MODAL */}
        {/* ============================================ */}
        {showEditModal && editingReport && (
          <div className="modal-overlay" onClick={() => {
            setShowEditModal(false);
            resetForm();
          }}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <i className="fas fa-edit"></i> 
                  {editingReport.status === 'revision' ? 'Edit & Resend Report' : 'Edit Report'}
                </h3>
                <button className="modal-close" onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Report Title <span className="required">*</span></label>
                  <input
                    type="text"
                    value={editingReport.title}
                    onChange={e => setEditingReport({...editingReport, title: e.target.value})}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Activity Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={editingReport.activity_date}
                    onChange={e => setEditingReport({...editingReport, activity_date: e.target.value})}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editingReport.description}
                    onChange={e => setEditingReport({...editingReport, description: e.target.value})}
                    rows="4"
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Activity Type</label>
                    <select
                      value={editingReport.activity_type}
                      onChange={e => setEditingReport({...editingReport, activity_type: e.target.value})}
                      className="form-control"
                    >
                      <option value="">Select activity type</option>
                      {activityTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={editingReport.location}
                      onChange={e => setEditingReport({...editingReport, location: e.target.value})}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Number of Participants</label>
                  <input
                    type="number"
                    value={editingReport.participants_count}
                    onChange={e => setEditingReport({...editingReport, participants_count: e.target.value})}
                    className="form-control"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Achievements</label>
                  <textarea
                    value={editingReport.achievements}
                    onChange={e => setEditingReport({...editingReport, achievements: e.target.value})}
                    rows="3"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Challenges</label>
                  <textarea
                    value={editingReport.challenges}
                    onChange={e => setEditingReport({...editingReport, challenges: e.target.value})}
                    rows="3"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Recommendations</label>
                  <textarea
                    value={editingReport.recommendations}
                    onChange={e => setEditingReport({...editingReport, recommendations: e.target.value})}
                    rows="3"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Add New Attachments</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                    className="form-control"
                  />
                  <small className="help-text">
                    Add additional files to support this report
                  </small>
                </div>

                {attachments.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ color: 'var(--scout-purple)' }}>New files to add:</strong>
                    {attachments.map((file, index) => (
                      <div key={index} className="attachment-item" style={{ marginTop: '4px' }}>
                        <i className={`fas fa-${getFileIcon(file.name)}`}></i>
                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button 
                          className="btn-remove"
                          onClick={() => removeAttachment(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleUpdateReport}
                  disabled={uploadingFiles}
                >
                  {uploadingFiles ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Update & Resend
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DistrictReports;