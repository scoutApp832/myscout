// src/components/common/SecureFileAttachment.js
import React, { useState } from 'react';
import axios from 'axios';
import { getFileName, getFileIcon, getFileType } from '../../utils/fileUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SecureFileAttachment = ({ reportId, attachmentId, filePath }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileName = getFileName(filePath);
  const fileIcon = getFileIcon(filePath);
  const fileType = getFileType(filePath);

  // Handle View - Opens in new tab using Blob URL (SECURE)
  const handleView = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view files');
        setIsLoading(false);
        return;
      }

      // Show loading indicator in new tab
      const win = window.open('', '_blank');
      if (!win) {
        setError('Popup blocked. Please allow popups for this site.');
        setIsLoading(false);
        return;
      }
      
      win.document.write(`
        <html>
          <head><title>Loading File...</title></head>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial,sans-serif;background:#f7fafc;">
            <div style="text-align:center;background:white;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
              <div style="font-size:64px;margin-bottom:20px;">📄</div>
              <h2 style="color:#2d3748;">Loading your file...</h2>
              <p style="color:#718096;">Please wait while the file loads.</p>
              <div style="margin-top:20px;width:40px;height:40px;border:4px solid #e2e8f0;border-top-color:#2b6cb0;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto;"></div>
              <style>
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </div>
          </body>
        </html>
      `);
      
      // Fetch the file with authentication
      const viewUrl = `${API_URL}/reports/${reportId}/attachments/${attachmentId}/view`;
      const response = await axios.get(viewUrl, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Get the file blob and content type
      const fileBlob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      
      // Create object URL
      const fileURL = window.URL.createObjectURL(fileBlob);
      
      // Update the new tab with the file
      win.location.href = fileURL;
      
      // Clean up the object URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(fileURL);
      }, 60000);
      
    } catch (error) {
      console.error('❌ Error viewing file:', error);
      setError(error.response?.data?.message || 'Failed to view file');
      
      // Fallback: try direct download
      handleDownload(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Download - Downloads the file (SECURE)
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to download files');
        setIsLoading(false);
        return;
      }

      const downloadUrl = `${API_URL}/reports/${reportId}/attachments/${attachmentId}/download`;
      
      // Fetch the file with authentication
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Get the file blob
      const fileBlob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      
      // Create object URL
      const url = window.URL.createObjectURL(fileBlob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      setError(error.response?.data?.message || 'Failed to download file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="file-attachment"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        margin: '4px 8px 4px 0',
        position: 'relative'
      }}
    >
      <i className={`fas ${fileIcon}`} style={{ color: '#2b6cb0', fontSize: '20px' }}></i>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#2d3748' }}>
          {fileName}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#718096' }}>
          {fileType}
        </span>
      </div>

      {error && (
        <span style={{ fontSize: '0.7rem', color: '#e53e3e', marginLeft: '4px' }}>
          {error}
        </span>
      )}

      <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
        <button
          onClick={handleView}
          disabled={isLoading}
          style={{
            padding: '4px 10px',
            backgroundColor: '#ebf8ff',
            border: 'none',
            borderRadius: '4px',
            color: '#2b6cb0',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.target.style.backgroundColor = '#bee3f8';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.target.style.backgroundColor = '#ebf8ff';
          }}
        >
          <i className="fas fa-eye"></i> {isLoading ? 'Loading...' : 'View'}
        </button>
        <button
          onClick={handleDownload}
          disabled={isLoading}
          style={{
            padding: '4px 10px',
            backgroundColor: '#e2e8f0',
            border: 'none',
            borderRadius: '4px',
            color: '#2d3748',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.target.style.backgroundColor = '#cbd5e0';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.target.style.backgroundColor = '#e2e8f0';
          }}
        >
          <i className="fas fa-download"></i> Download
        </button>
      </div>
    </div>
  );
};

export default SecureFileAttachment;