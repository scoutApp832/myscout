// src/components/chat/ScoutChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 🟣 Scout Color System
const COLORS = {
  purple: '#6A1B9A',
  purpleLight: '#8E24AA',
  purpleDark: '#4A148C',
  purpleBg: '#F3E5F5',
  purpleBorder: '#CE93D8',
  purpleHover: '#E8D5F5',
  gold: '#FFD100',
  green: '#2E7D32',
  white: '#FFFFFF',
  dark: '#263238',
  lightBg: '#F5F7FA',
  gray: '#6B7280',
  border: '#E5E7EB',
  success: '#2E7D32',
  warning: '#FF9800',
  danger: '#D32F2F',
  info: '#2196F3',
};

const ScoutChat = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);

  const emojis = ['😀', '😂', '😍', '😊', '👍', '👏', '❤️', '🎉', '🙏', '👋', '⭐', '🏕️'];

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleDisplay = (role) => {
    const roles = {
      'national_commissioner': 'National Commissioner',
      'district_commissioner': 'District Commissioner',
      'unit_leader': 'Unit Leader',
      'scout': 'Scout',
      'donor': 'Donor',
      'admin': 'Admin',
      'super_admin': 'Super Admin'
    };
    return roles[role] || role || 'Member';
  };

  const getFileIcon = (file) => {
    const type = file.type || '';
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const membersData = response.data.members.map(m => ({
          id: m.id,
          name: m.full_name || m.name || 'Unknown',
          initials: getInitials(m.full_name || m.name || ''),
          role: m.role || 'scout',
          roleDisplay: getRoleDisplay(m.role),
          online: m.online || false,
          lastSeen: m.last_seen,
          avatar: m.avatar || null,
          unread: m.unread || 0
        }));
        setMembers(membersData);
      }
    } catch (err) {
      console.error('❌ Error fetching members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (memberId) => {
    if (!memberId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat/messages/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.sender?.full_name || msg.sender_name || 'Unknown',
          senderInitials: getInitials(msg.sender?.full_name || msg.sender_name || ''),
          message: msg.message,
          attachments: msg.attachments || [],
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: msg.sender_id === user?.id,
          isDeleted: msg.is_deleted || false,
          created_at: msg.created_at
        }));
        setMessages(formattedMessages);
        markMessagesAsRead(memberId);
      }
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const markMessagesAsRead = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/chat/messages/read/${memberId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('❌ Error marking messages as read:', err);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    setAttachments([...attachments, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(messages.map(msg =>
        msg.id === messageId
          ? { ...msg, isDeleted: true, message: 'This message was deleted' }
          : msg
      ));

      setError('');
    } catch (err) {
      console.error('❌ Error deleting message:', err);
      setError(err.response?.data?.message || 'Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };

  const sendMessage = async () => {
    const message = inputMessage.trim();
    if (!message && attachments.length === 0) return;
    if (!selectedMember) return;

    setSending(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (message) {
        formData.append('message', message);
      }
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await axios.post(
        `${API_URL}/chat/messages/${selectedMember.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.data.success) {
        const newMessage = {
          id: response.data.messageData.id,
          senderId: user.id,
          senderName: user.full_name || 'You',
          senderInitials: getInitials(user.full_name || 'You'),
          message: response.data.messageData.message || '',
          attachments: response.data.messageData.attachments || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          isDeleted: false,
          created_at: new Date().toISOString()
        };

        setMessages([...messages, newMessage]);
        setInputMessage('');
        setAttachments([]);
        setUploadProgress(0);

        const displayMessage = message || (attachments.length > 0 ? '📎 Attachment' : '');
        setMembers(members.map(m =>
          m.id === selectedMember.id
            ? { ...m, lastMessage: displayMessage, lastMessageTime: new Date() }
            : m
        ));

        showTyping();
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const showTyping = () => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
    }, 1500);
  };

  const pollMessages = () => {
    if (selectedMember) {
      fetchMessages(selectedMember.id);
    }
  };

  const selectMember = (member) => {
    setSelectedMember(member);
    setMessages([]);
    setAttachments([]);
    fetchMessages(member.id);
  };

  const getFilteredMembers = () => {
    return members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredMembers = getFilteredMembers();

  useEffect(() => {
    fetchMembers();
    intervalRef.current = setInterval(pollMessages, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleEmoji = () => {
    setShowEmoji(!showEmoji);
  };

  const addEmoji = (emoji) => {
    setInputMessage(inputMessage + emoji);
    setShowEmoji(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getMemberInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderAttachmentPreview = (attachment) => {
    if (attachment.type && attachment.type.startsWith('image/')) {
      return (
        <img 
          src={attachment.url || attachment.preview} 
          alt="Attachment"
          style={{
            maxWidth: '200px',
            maxHeight: '150px',
            borderRadius: '8px',
            marginTop: '8px',
            cursor: 'pointer',
            border: `2px solid ${COLORS.purpleBorder}`
          }}
          onClick={() => window.open(attachment.url || attachment.preview, '_blank')}
        />
      );
    }
    return (
      <a 
        href={attachment.url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: COLORS.purpleBg,
          padding: '6px 12px',
          borderRadius: '6px',
          marginTop: '8px',
          textDecoration: 'none',
          color: COLORS.purpleDark,
          fontSize: '13px',
          border: `1px solid ${COLORS.purpleBorder}`
        }}
      >
        <span>{getFileIcon(attachment)}</span>
        <span>{attachment.name || 'File'}</span>
        <span style={{ fontSize: '11px', color: COLORS.gray }}>
          ({formatFileSize(attachment.size || 0)})
        </span>
      </a>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>💬 Scout Community</h2>
          <p style={styles.sidebarSubtitle}>Connect with all MSR members</p>
        </div>

        <div style={styles.searchBox}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="🔍 Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.memberTitle}>
          <span>All Members</span>
          <span style={styles.memberCount}>{filteredMembers.length}</span>
        </div>

        <div style={styles.membersList}>
          {filteredMembers.length === 0 ? (
            <div style={styles.emptyMembers}>No members found</div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  ...styles.member,
                  ...(selectedMember?.id === member.id ? styles.memberActive : {})
                }}
                onClick={() => selectMember(member)}
              >
                <div style={styles.avatar}>
                  {getMemberInitials(member.name)}
                  <span style={member.online ? styles.onlineDot : styles.offlineDot}></span>
                </div>
                <div style={styles.memberInfo}>
                  <div style={styles.memberName}>{member.name}</div>
                  <div style={styles.memberRole}>{member.roleDisplay}</div>
                </div>
                {member.unread > 0 && (
                  <span style={styles.unreadBadge}>{member.unread}</span>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* CHAT */}
      <main style={styles.chat}>
        {/* Chat Header */}
        <header style={styles.chatHeader}>
          <div style={styles.chatTitle}>
            {!selectedMember ? (
              <>
                <div style={styles.communityIcon}>👥</div>
                <div>
                  <h3 style={styles.chatName}>Scout Community</h3>
                  <p style={styles.chatSubtitle}>{members.length} members • {members.filter(m => m.online).length} online</p>
                </div>
              </>
            ) : (
              <>
                <div style={styles.chatAvatar}>
                  {getMemberInitials(selectedMember.name)}
                </div>
                <div>
                  <h3 style={styles.chatName}>{selectedMember.name}</h3>
                  <p style={styles.chatSubtitle}>
                    {selectedMember.online ? '🟢 Online' : '⚪ Offline'} • {selectedMember.roleDisplay}
                  </p>
                </div>
              </>
            )}
          </div>
          <div style={styles.headerActions}>
            <button style={styles.headerBtn}>🔍</button>
            <button style={styles.headerBtn}>👥</button>
            <button style={styles.headerBtn}>⋮</button>
          </div>
        </header>

        {/* Messages */}
        <section style={styles.messages} ref={messagesEndRef}>
          {!selectedMember ? (
            <div style={styles.noChatSelected}>
              <div style={styles.noChatIcon}>💬</div>
              <h3 style={styles.noChatTitle}>Select a member</h3>
              <p style={styles.noChatText}>Choose a member from the list to start chatting</p>
            </div>
          ) : (
            <>
              <div style={styles.dateDivider}>
                <span style={styles.dateDividerText}>Today</span>
              </div>

              {messages.length === 0 ? (
                <div style={styles.noMessages}>
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  if (msg.isDeleted) {
                    return (
                      <div
                        key={msg.id}
                        style={{
                          ...styles.message,
                          ...(msg.isMe ? styles.messageMe : {}),
                          opacity: 0.6
                        }}
                      >
                        <div style={styles.messageContent}>
                          <div style={styles.senderDeleted}>{msg.senderName} (deleted)</div>
                          <div style={styles.bubbleDeleted}>
                            <em>This message was deleted</em>
                          </div>
                          <div style={styles.time}>{msg.time}</div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.message,
                        ...(msg.isMe ? styles.messageMe : {})
                      }}
                    >
                      {!msg.isMe && (
                        <div style={styles.messageAvatar}>{msg.senderInitials}</div>
                      )}
                      <div style={styles.messageContent}>
                        <div style={styles.sender}>
                          {msg.senderName}
                          {msg.isMe && (
                            <button
                              style={styles.deleteBtn}
                              onClick={() => deleteMessage(msg.id)}
                              disabled={deleting}
                              title="Delete message"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {msg.message && (
                          <div style={msg.isMe ? styles.bubbleMe : styles.bubble}>
                            {msg.message}
                          </div>
                        )}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{ marginTop: msg.message ? '4px' : '0' }}>
                            {msg.attachments.map((attachment, idx) => (
                              <div key={idx}>
                                {renderAttachmentPreview(attachment)}
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={styles.time}>{msg.time}</div>
                      </div>
                      {msg.isMe && (
                        <div style={styles.messageAvatar}>{msg.senderInitials}</div>
                      )}
                    </div>
                  );
                })
              )}

              {uploading && (
                <div style={styles.uploadProgress}>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${uploadProgress}%` }}></div>
                  </div>
                  <span style={styles.progressText}>Uploading... {uploadProgress}%</span>
                </div>
              )}

              {typing && (
                <div style={styles.typingIndicator}>Someone is typing...</div>
              )}

              {error && (
                <div style={styles.errorMessage}>{error}</div>
              )}
            </>
          )}
        </section>

        {/* Message Input */}
        {selectedMember && (
          <>
            {attachments.length > 0 && (
              <div style={styles.attachmentPreviewContainer}>
                {attachments.map((file, index) => (
                  <div key={index} style={styles.attachmentPreview}>
                    <span>{getFileIcon(file)}</span>
                    <span style={styles.attachmentName}>{file.name}</span>
                    <span style={styles.attachmentSize}>({formatFileSize(file.size)})</span>
                    <button 
                      style={styles.removeAttachment}
                      onClick={() => removeAttachment(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.chatInputArea}>
              <div style={styles.inputContainer}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                  onChange={handleFileSelect}
                />
                
                <button 
                  style={styles.inputBtn} 
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                >
                  📎
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  style={styles.inputField}
                  id="messageInput"
                  placeholder="Write a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                  autoComplete="off"
                />

                <button style={styles.inputBtn} onClick={toggleEmoji} title="Emoji">😊</button>

                <button
                  style={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={sending || (!inputMessage.trim() && attachments.length === 0)}
                  title="Send"
                >
                  {sending ? '⏳' : '➤'}
                </button>
              </div>

              {showEmoji && (
                <div style={styles.emojiPanel} id="emojiPanel">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      style={styles.emojiBtn}
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// ============================================
// STYLES - 🟣 Purple Theme
// ============================================

const styles = {
  app: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    overflow: 'hidden',
    fontFamily: 'Arial, Helvetica, sans-serif',
    background: COLORS.lightBg,
    color: COLORS.dark,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  },

  sidebar: {
    width: '310px',
    background: COLORS.white,
    borderRight: `1px solid ${COLORS.purpleBorder}`,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '20px',
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
  },
  sidebarTitle: {
    fontSize: '20px',
    marginBottom: '5px',
  },
  sidebarSubtitle: {
    fontSize: '13px',
    opacity: 0.9,
  },
  searchBox: {
    padding: '15px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  searchInput: {
    width: '100%',
    padding: '11px 14px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    outline: 'none',
    fontSize: '14px',
    transition: 'border-color 0.3s',
  },
  memberTitle: {
    padding: '15px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: COLORS.gray,
    display: 'flex',
    justifyContent: 'space-between',
  },
  memberCount: {
    background: COLORS.purple,
    color: COLORS.white,
    padding: '3px 8px',
    borderRadius: '20px',
    fontSize: '11px',
  },
  membersList: {
    overflowY: 'auto',
    flex: 1,
  },
  member: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 15px',
    cursor: 'pointer',
    transition: '0.2s',
    position: 'relative',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  memberActive: {
    background: COLORS.purpleBg,
    borderLeft: `3px solid ${COLORS.purple}`,
  },
  avatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    position: 'relative',
    flexShrink: 0,
    fontSize: '14px',
  },
  onlineDot: {
    width: '11px',
    height: '11px',
    background: COLORS.green,
    border: `2px solid ${COLORS.white}`,
    borderRadius: '50%',
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  offlineDot: {
    width: '11px',
    height: '11px',
    background: COLORS.gray,
    border: `2px solid ${COLORS.white}`,
    borderRadius: '50%',
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  memberInfo: {
    minWidth: 0,
    flex: 1,
  },
  memberName: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '4px',
    color: COLORS.dark,
  },
  memberRole: {
    fontSize: '12px',
    color: COLORS.gray,
  },
  unreadBadge: {
    background: COLORS.purple,
    color: COLORS.white,
    borderRadius: '50%',
    padding: '2px 8px',
    fontSize: '11px',
    minWidth: '20px',
    textAlign: 'center',
  },
  emptyMembers: {
    padding: '40px 20px',
    textAlign: 'center',
    color: COLORS.gray,
  },

  chat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    background: COLORS.white,
  },
  chatHeader: {
    height: '75px',
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.purpleBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 25px',
    flexShrink: 0,
  },
  chatTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  communityIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
  },
  chatAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  chatName: {
    fontSize: '17px',
    margin: 0,
    color: COLORS.dark,
  },
  chatSubtitle: {
    color: COLORS.gray,
    fontSize: '12px',
    marginTop: '3px',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  headerBtn: {
    width: '38px',
    height: '38px',
    border: 'none',
    background: COLORS.lightBg,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '17px',
    color: COLORS.gray,
    transition: 'all 0.2s',
  },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '25px',
    background: COLORS.lightBg,
    backgroundImage: `radial-gradient(${COLORS.border} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
  },
  dateDivider: {
    textAlign: 'center',
    margin: '10px 0 20px',
  },
  dateDividerText: {
    background: COLORS.white,
    padding: '7px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    color: COLORS.gray,
    boxShadow: `0 1px 3px rgba(0,0,0,0.08)`,
    border: `1px solid ${COLORS.purpleBorder}`,
  },
  noMessages: {
    textAlign: 'center',
    padding: '60px 20px',
    color: COLORS.gray,
    fontSize: '14px',
  },
  message: {
    display: 'flex',
    marginBottom: '18px',
    gap: '10px',
    maxWidth: '75%',
  },
  messageMe: {
    marginLeft: 'auto',
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  sender: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: COLORS.purple,
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  senderDeleted: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: '5px',
    fontStyle: 'italic',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: COLORS.danger,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
    opacity: 0.5,
    transition: 'opacity 0.2s',
    ':hover': {
      opacity: 1,
    },
  },
  bubble: {
    background: COLORS.white,
    padding: '11px 14px',
    borderRadius: '4px 15px 15px 15px',
    boxShadow: `0 1px 3px rgba(0,0,0,0.08)`,
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    border: `1px solid ${COLORS.purpleBorder}`,
  },
  bubbleMe: {
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
    padding: '11px 14px',
    borderRadius: '15px 4px 15px 15px',
    boxShadow: `0 1px 3px rgba(0,0,0,0.08)`,
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  bubbleDeleted: {
    background: COLORS.lightBg,
    padding: '11px 14px',
    borderRadius: '4px 15px 15px 15px',
    boxShadow: `0 1px 3px rgba(0,0,0,0.08)`,
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    border: `1px dashed ${COLORS.border}`,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  time: {
    fontSize: '10px',
    color: COLORS.gray,
    marginTop: '4px',
  },
  typingIndicator: {
    fontSize: '12px',
    color: COLORS.gray,
    padding: '8px 0',
    fontStyle: 'italic',
  },
  errorMessage: {
    background: '#fee',
    color: COLORS.danger,
    padding: '10px',
    borderRadius: '8px',
    marginTop: '10px',
    textAlign: 'center',
    fontSize: '13px',
    border: `1px solid ${COLORS.danger}`,
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.gray,
  },
  noChatIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  noChatTitle: {
    fontSize: '20px',
    color: COLORS.dark,
    marginBottom: '8px',
  },
  noChatText: {
    fontSize: '14px',
    color: COLORS.gray,
  },

  attachmentPreviewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px 20px',
    background: COLORS.white,
    borderTop: `1px solid ${COLORS.purpleBorder}`,
  },
  attachmentPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: COLORS.purpleBg,
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    border: `1px solid ${COLORS.purpleBorder}`,
  },
  attachmentName: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: COLORS.dark,
  },
  attachmentSize: {
    fontSize: '11px',
    color: COLORS.gray,
  },
  removeAttachment: {
    background: 'none',
    border: 'none',
    color: COLORS.danger,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
  },
  uploadProgress: {
    padding: '10px 20px',
    background: COLORS.white,
    borderTop: `1px solid ${COLORS.purpleBorder}`,
  },
  progressBar: {
    height: '6px',
    background: COLORS.border,
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    color: COLORS.gray,
    marginTop: '4px',
    display: 'block',
  },

  chatInputArea: {
    background: COLORS.white,
    borderTop: `1px solid ${COLORS.purpleBorder}`,
    padding: '12px 20px',
    position: 'relative',
    flexShrink: 0,
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: COLORS.lightBg,
    borderRadius: '12px',
    padding: '4px 6px',
    border: `1px solid ${COLORS.border}`,
  },
  inputBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    color: COLORS.gray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  inputField: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    padding: '10px',
    minHeight: '44px',
    color: COLORS.dark,
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '10px',
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  emojiPanel: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    background: COLORS.white,
    padding: '12px',
    borderRadius: '12px',
    boxShadow: `0 5px 25px rgba(0,0,0,0.15)`,
    width: '230px',
    zIndex: 10,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    border: `1px solid ${COLORS.purpleBorder}`,
  },
  emojiBtn: {
    border: 'none',
    background: 'none',
    fontSize: '22px',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: COLORS.purple,
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid ${COLORS.border}`,
    borderTop: `4px solid ${COLORS.purple}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .input-container:focus-within {
    border-color: ${COLORS.purple};
    box-shadow: 0 0 0 3px ${COLORS.purple}20;
  }
  
  .member:hover {
    background: ${COLORS.purpleBg};
  }
  
  .header-btn:hover {
    background: ${COLORS.purpleBg};
    color: ${COLORS.purple};
  }
  
  .input-btn:hover {
    background: ${COLORS.purpleBg};
    color: ${COLORS.purple};
  }
  
  .send-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 10px ${COLORS.purple}40;
  }
  
  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .emoji-btn:hover {
    background: ${COLORS.purpleBg};
    transform: scale(1.2);
  }
  
  .remove-attachment:hover {
    color: ${COLORS.danger};
    transform: scale(1.2);
  }
  
  .delete-btn:hover {
    opacity: 1;
  }
  
  .search-input:focus {
    border-color: ${COLORS.purple};
    box-shadow: 0 0 0 3px ${COLORS.purple}20;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      width: 75px !important;
    }
    .sidebar-header h2,
    .sidebar-header p,
    .search-box,
    .member-title,
    .member-info {
      display: none !important;
    }
    .sidebar-header {
      padding: 15px !important;
      text-align: center !important;
    }
    .member {
      justify-content: center !important;
      padding: 12px 5px !important;
    }
    .chat-header {
      padding: 0 12px !important;
    }
    .chat-name {
      font-size: 14px !important;
    }
    .messages {
      padding: 15px !important;
    }
    .message {
      max-width: 90% !important;
    }
    .header-actions {
      display: none !important;
    }
    .community-icon {
      display: none !important;
    }
    .chat-avatar {
      width: 35px !important;
      height: 35px !important;
      font-size: 12px !important;
    }
    .avatar {
      width: 35px !important;
      height: 35px !important;
      font-size: 11px !important;
    }
    .online-dot, .offline-dot {
      width: 8px !important;
      height: 8px !important;
    }
    .unread-badge {
      font-size: 9px !important;
      min-width: 16px !important;
      padding: 1px 5px !important;
    }
    .attachment-preview {
      font-size: 11px !important;
      padding: 2px 8px !important;
    }
    .attachment-name {
      max-width: 80px !important;
    }
  }
  
  @media (max-width: 480px) {
    .chat-header {
      padding: 0 8px !important;
      height: 60px !important;
    }
    .messages {
      padding: 10px !important;
    }
    .message {
      max-width: 95% !important;
    }
    .bubble, .bubble-me {
      font-size: 13px !important;
      padding: 8px 10px !important;
    }
    .chat-input-area {
      padding: 8px 10px !important;
    }
    .input-container {
      gap: 4px !important;
      padding: 4px 6px !important;
    }
    .input-btn {
      width: 32px !important;
      height: 32px !important;
      font-size: 16px !important;
    }
    .send-btn {
      width: 36px !important;
      height: 36px !important;
      font-size: 16px !important;
    }
    .input-field {
      font-size: 13px !important;
      padding: 8px !important;
    }
    .emoji-panel {
      width: 180px !important;
      padding: 8px !important;
      bottom: 65px !important;
      right: 10px !important;
    }
    .emoji-btn {
      font-size: 18px !important;
      padding: 3px !important;
    }
    .message-avatar {
      width: 30px !important;
      height: 30px !important;
      font-size: 10px !important;
    }
    .sender {
      font-size: 10px !important;
    }
    .time {
      font-size: 9px !important;
    }
    .date-divider-text {
      font-size: 10px !important;
      padding: 4px 10px !important;
    }
    .no-chat-icon {
      font-size: 36px !important;
    }
    .no-chat-title {
      font-size: 16px !important;
    }
    .no-chat-text {
      font-size: 12px !important;
    }
    .attachment-preview-container {
      padding: 4px 10px !important;
    }
    .attachment-preview {
      font-size: 10px !important;
      padding: 2px 6px !important;
    }
    .attachment-name {
      max-width: 60px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ScoutChat;