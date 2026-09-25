// src/components/chat/ScoutChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

  const emojis = [
    '😀',
    '😂',
    '😍',
    '😊',
    '👍',
    '👏',
    '❤️',
    '🎉',
    '🙏',
    '👋',
    '⭐',
    '🏕️',
  ];

  const getInitials = (name) => {
    if (!name) return '??';

    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ============================================================
  // DATE HELPERS
  // ============================================================

  const getDateKey = (dateValue) => {
    if (!dateValue) return '';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return '';

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatMessageDate = (dateValue) => {
    if (!dateValue) return '';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(
      startOfYesterday.getDate() - 1
    );

    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (
      messageDate.getTime() ===
      startOfToday.getTime()
    ) {
      return 'Today';
    }

    if (
      messageDate.getTime() ===
      startOfYesterday.getTime()
    ) {
      return 'Yesterday';
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
    }

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleDisplay = (role) => {
    const roles = {
      national_commissioner: 'National Commissioner',
      district_commissioner: 'District Commissioner',
      unit_leader: 'Unit Leader',
      scout: 'Scout',
      donor: 'Donor',
      admin: 'Admin',
      super_admin: 'Super Admin',
    };

    return roles[role] || role || 'Member';
  };

  const getFileIcon = (file) => {
    const type = file?.type || '';

    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';

    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;

    // Already an absolute URL
    if (
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('data:')
    ) {
      return avatar;
    }

    // Backend-relative URL
    if (avatar.startsWith('/')) {
      const backendBase = API_URL.replace(/\/api\/?$/, '');
      return `${backendBase}${avatar}`;
    }

    const backendBase = API_URL.replace(/\/api\/?$/, '');

    return `${backendBase}/${avatar}`;
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/chat/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const membersData = response.data.members.map((m) => ({
          id: m.id,
          name: m.full_name || m.name || 'Unknown',
          initials: getInitials(m.full_name || m.name || ''),
          role: m.role || 'scout',
          roleDisplay: getRoleDisplay(m.role),
          online: m.online || false,
          lastSeen: m.last_seen,

          // Support the possible profile-image field names
          avatar:
            m.avatar ||
            m.profile_image ||
            m.profile_photo ||
            m.profile_picture ||
            m.photo ||
            null,

          unread: m.unread || 0,
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

  const markMessagesAsRead = async (memberId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/chat/messages/read/${memberId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error('❌ Error marking messages as read:', err);
    }
  };

  const fetchMessages = async (memberId) => {
    if (!memberId) return;

    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/chat/messages/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const formattedMessages = response.data.messages.map((msg) => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderName:
            msg.sender?.full_name || msg.sender_name || 'Unknown',
          senderInitials: getInitials(
            msg.sender?.full_name || msg.sender_name || ''
          ),
          message: msg.message,
          attachments: msg.attachments || [],
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isMe: msg.sender_id === user?.id,
          isDeleted: msg.is_deleted || false,
          created_at: msg.created_at,
        }));

        setMessages(formattedMessages);

        markMessagesAsRead(memberId);

        setMembers((prev) =>
          prev.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  unread: 0,
                }
              : member
          )
        );
      }
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        return false;
      }

      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const deleteMessage = async (messageId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this message?'
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `${API_URL}/chat/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                isDeleted: true,
                message: 'This message was deleted',
              }
            : msg
        )
      );

      setError('');
    } catch (err) {
      console.error('❌ Error deleting message:', err);

      setError(
        err.response?.data?.message ||
          'Failed to delete message'
      );
    } finally {
      setDeleting(false);
    }
  };

  const sendMessage = async () => {
    const message = inputMessage.trim();

    if (!message && attachments.length === 0) return;
    if (!selectedMember) return;

    setSending(true);
    setUploading(attachments.length > 0);
    setUploadProgress(0);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const formData = new FormData();

      if (message) {
        formData.append('message', message);
      }

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await axios.post(
        `${API_URL}/chat/messages/${selectedMember.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },

          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) /
                  progressEvent.total
              );

              setUploadProgress(percentCompleted);
            }
          },
        }
      );

      if (response.data.success) {
        const newMessage = {
          id: response.data.messageData.id,
          senderId: user?.id,
          senderName: user?.full_name || 'You',
          senderInitials: getInitials(
            user?.full_name || 'You'
          ),
          message:
            response.data.messageData.message || '',
          attachments:
            response.data.messageData.attachments || [],
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isMe: true,
          isDeleted: false,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);

        const displayMessage =
          message ||
          (attachments.length > 0
            ? '📎 Attachment'
            : '');

        setMembers((prev) =>
          prev.map((m) =>
            m.id === selectedMember.id
              ? {
                  ...m,
                  lastMessage: displayMessage,
                  lastMessageTime: new Date(),
                }
              : m
          )
        );

        setInputMessage('');
        setAttachments([]);
        setUploadProgress(0);
        setShowEmoji(false);

        showTyping();
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);

      setError(
        err.response?.data?.message ||
          'Failed to send message'
      );
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const showTyping = () => {
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
    }, 1500);
  };

  const selectMember = (member) => {
    setSelectedMember(member);
    setMessages([]);
    setAttachments([]);
    setError('');
    setShowEmoji(false);

    fetchMessages(member.id);
  };

  const getFilteredMembers = () => {
    return members.filter((member) =>
      member.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  const filteredMembers = getFilteredMembers();

  // Load members once
  useEffect(() => {
    fetchMembers();
  }, []);

  // Poll the currently selected conversation
  useEffect(() => {
    if (!selectedMember?.id) {
      return undefined;
    }

    intervalRef.current = setInterval(() => {
      fetchMessages(selectedMember.id);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectedMember?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop =
        messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleEmoji = () => {
    setShowEmoji((prev) => !prev);
  };

  const addEmoji = (emoji) => {
    setInputMessage((prev) => prev + emoji);
    setShowEmoji(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getMemberInitials = (name) => {
    if (!name) return '??';

    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderAttachmentPreview = (attachment) => {
    if (
      attachment.type &&
      attachment.type.startsWith('image/')
    ) {
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
            border: `2px solid ${COLORS.purpleBorder}`,
            objectFit: 'cover',
          }}
          onClick={() =>
            window.open(
              attachment.url || attachment.preview,
              '_blank'
            )
          }
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
          border: `1px solid ${COLORS.purpleBorder}`,
          maxWidth: '100%',
        }}
      >
        <span>{getFileIcon(attachment)}</span>

        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '180px',
          }}
        >
          {attachment.name || 'File'}
        </span>

        <span
          style={{
            fontSize: '11px',
            color: COLORS.gray,
            flexShrink: 0,
          }}
        >
          ({formatFileSize(attachment.size || 0)})
        </span>
      </a>
    );
  };

  if (loading) {
    return (
      <div
        className="scout-chat-loading"
        style={styles.loadingContainer}
      >
        <div style={styles.spinner}></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="scout-chat-app" style={styles.app}>
      {/* SIDEBAR */}
      <aside
        className="scout-chat-sidebar"
        style={styles.sidebar}
      >
        <div
          className="scout-chat-sidebar-header"
          style={styles.sidebarHeader}
        >
          <h2
            className="scout-chat-sidebar-title"
            style={styles.sidebarTitle}
          >
            💬 Scout Community
          </h2>

          <p
            className="scout-chat-sidebar-subtitle"
            style={styles.sidebarSubtitle}
          >
            Connect with all MSR members
          </p>
        </div>

        <div
          className="scout-chat-search-box"
          style={styles.searchBox}
        >
          <input
            className="scout-chat-search-input"
            type="text"
            style={styles.searchInput}
            placeholder="🔍 Search members..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <div
          className="scout-chat-member-title"
          style={styles.memberTitle}
        >
          <span>All Members</span>

          <span
            className="scout-chat-member-count"
            style={styles.memberCount}
          >
            {filteredMembers.length}
          </span>
        </div>

        <div
          className="scout-chat-members-list"
          style={styles.membersList}
        >
          {filteredMembers.length === 0 ? (
            <div
              className="scout-chat-empty-members"
              style={styles.emptyMembers}
            >
              No members found
            </div>
          ) : (
            filteredMembers.map((member) => {
              const avatarUrl = getAvatarUrl(member.avatar);

              return (
                <div
                  key={member.id}
                  className={`scout-chat-member ${
                    selectedMember?.id === member.id
                      ? 'scout-chat-member-active'
                      : ''
                  }`}
                  style={{
                    ...styles.member,
                    ...(selectedMember?.id === member.id
                      ? styles.memberActive
                      : {}),
                  }}
                  onClick={() =>
                    selectMember(member)
                  }
                >
                  {/* PROFILE IMAGE */}
                  <div
                    className="scout-chat-avatar"
                    style={styles.avatar}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={member.name}
                        className="scout-chat-profile-image"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            'none';

                          if (
                            e.currentTarget
                              .nextElementSibling
                          ) {
                            e.currentTarget.nextElementSibling.style.display =
                              'flex';
                          }
                        }}
                      />
                    ) : null}

                    <span
                      className="scout-chat-avatar-fallback"
                      style={{
                        ...styles.avatarFallback,
                        display: avatarUrl
                          ? 'none'
                          : 'flex',
                      }}
                    >
                      {getMemberInitials(member.name)}
                    </span>

                    <span
                      className={
                        member.online
                          ? 'scout-chat-online-dot'
                          : 'scout-chat-offline-dot'
                      }
                      style={
                        member.online
                          ? styles.onlineDot
                          : styles.offlineDot
                      }
                    ></span>
                  </div>

                  {/* MEMBER NAME + ROLE */}
                  <div
                    className="scout-chat-member-info"
                    style={styles.memberInfo}
                  >
                    <div
                      className="scout-chat-member-name"
                      style={styles.memberName}
                      title={member.name}
                    >
                      {member.name}
                    </div>

                    <div
                      className="scout-chat-member-role"
                      style={styles.memberRole}
                      title={member.roleDisplay}
                    >
                      {member.roleDisplay}
                    </div>
                  </div>

                  {member.unread > 0 && (
                    <span
                      className="scout-chat-unread-badge"
                      style={styles.unreadBadge}
                    >
                      {member.unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* CHAT */}
      <main
        className="scout-chat-main"
        style={styles.chat}
      >
        {/* CHAT HEADER */}
        <header
          className="scout-chat-header"
          style={styles.chatHeader}
        >
          <div
            className="scout-chat-title"
            style={styles.chatTitle}
          >
            {!selectedMember ? (
              <>
                <div
                  className="scout-chat-community-icon"
                  style={styles.communityIcon}
                >
                  👥
                </div>

                <div className="scout-chat-title-text">
                  <h3
                    className="scout-chat-name"
                    style={styles.chatName}
                  >
                    Scout Community
                  </h3>

                  <p
                    className="scout-chat-subtitle"
                    style={styles.chatSubtitle}
                  >
                    {members.length} members •{' '}
                    {
                      members.filter(
                        (m) => m.online
                      ).length
                    }{' '}
                    online
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="scout-chat-selected-avatar"
                  style={styles.chatAvatar}
                >
                  {getAvatarUrl(
                    selectedMember.avatar
                  ) ? (
                    <img
                      src={getAvatarUrl(
                        selectedMember.avatar
                      )}
                      alt={selectedMember.name}
                      className="scout-chat-selected-profile-image"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          'none';

                        if (
                          e.currentTarget
                            .nextElementSibling
                        ) {
                          e.currentTarget.nextElementSibling.style.display =
                            'flex';
                        }
                      }}
                    />
                  ) : null}

                  <span
                    className="scout-chat-selected-avatar-fallback"
                    style={{
                      ...styles.selectedAvatarFallback,
                      display: getAvatarUrl(
                        selectedMember.avatar
                      )
                        ? 'none'
                        : 'flex',
                    }}
                  >
                    {getMemberInitials(
                      selectedMember.name
                    )}
                  </span>
                </div>

                <div className="scout-chat-title-text">
                  <h3
                    className="scout-chat-name"
                    style={styles.chatName}
                  >
                    {selectedMember.name}
                  </h3>

                  <p
                    className="scout-chat-subtitle"
                    style={styles.chatSubtitle}
                  >
                    {selectedMember.online
                      ? '🟢 Online'
                      : '⚪ Offline'}{' '}
                    • {selectedMember.roleDisplay}
                  </p>
                </div>
              </>
            )}
          </div>

          <div
            className="scout-chat-header-actions"
            style={styles.headerActions}
          >
            <button
              className="scout-chat-header-btn"
              style={styles.headerBtn}
              type="button"
              title="Search"
            >
              🔍
            </button>

            <button
              className="scout-chat-header-btn"
              style={styles.headerBtn}
              type="button"
              title="Members"
            >
              👥
            </button>

            <button
              className="scout-chat-header-btn"
              style={styles.headerBtn}
              type="button"
              title="More"
            >
              ⋮
            </button>
          </div>
        </header>

        {/* MESSAGES */}
        <section
          className="scout-chat-messages"
          style={styles.messages}
          ref={messagesEndRef}
        >
          {!selectedMember ? (
            <div
              className="scout-chat-no-selection"
              style={styles.noChatSelected}
            >
              <div
                className="scout-chat-no-selection-icon"
                style={styles.noChatIcon}
              >
                💬
              </div>

              <h3
                className="scout-chat-no-selection-title"
                style={styles.noChatTitle}
              >
                Select a member
              </h3>

              <p
                className="scout-chat-no-selection-text"
                style={styles.noChatText}
              >
                Choose a member from the list to
                start chatting
              </p>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div
                  className="scout-chat-no-messages"
                  style={styles.noMessages}
                >
                  <p>
                    No messages yet. Start a
                    conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const currentDateKey = getDateKey(
                    msg.created_at
                  );

                  const previousDateKey =
                    index > 0
                      ? getDateKey(
                          messages[index - 1]
                            .created_at
                        )
                      : null;

                  const showDateDivider =
                    currentDateKey !==
                    previousDateKey;

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateDivider && (
                        <div
                          className="scout-chat-date-divider"
                          style={styles.dateDivider}
                        >
                          <span
                            className="scout-chat-date-divider-text"
                            style={
                              styles.dateDividerText
                            }
                          >
                            {formatMessageDate(
                              msg.created_at
                            )}
                          </span>
                        </div>
                      )}

                      {msg.isDeleted ? (
                        <div
                          className={`scout-chat-message ${
                            msg.isMe
                              ? 'scout-chat-message-me'
                              : ''
                          }`}
                          style={{
                            ...styles.message,
                            ...(msg.isMe
                              ? styles.messageMe
                              : {}),
                            opacity: 0.6,
                          }}
                        >
                          <div
                            className="scout-chat-message-content"
                            style={
                              styles.messageContent
                            }
                          >
                            <div
                              className="scout-chat-sender-deleted"
                              style={
                                styles.senderDeleted
                              }
                            >
                              {msg.senderName} (deleted)
                            </div>

                            <div
                              className="scout-chat-bubble-deleted"
                              style={
                                styles.bubbleDeleted
                              }
                            >
                              <em>
                                This message was
                                deleted
                              </em>
                            </div>

                            <div
                              className="scout-chat-time"
                              style={styles.time}
                            >
                              {msg.time}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`scout-chat-message ${
                            msg.isMe
                              ? 'scout-chat-message-me'
                              : ''
                          }`}
                          style={{
                            ...styles.message,
                            ...(msg.isMe
                              ? styles.messageMe
                              : {}),
                          }}
                        >
                          {!msg.isMe && (
                            <div
                              className="scout-chat-message-avatar"
                              style={
                                styles.messageAvatar
                              }
                            >
                              {msg.senderInitials}
                            </div>
                          )}

                          <div
                            className="scout-chat-message-content"
                            style={
                              styles.messageContent
                            }
                          >
                            <div
                              className="scout-chat-sender"
                              style={styles.sender}
                            >
                              <span>
                                {msg.senderName}
                              </span>

                              {msg.isMe && (
                                <button
                                  className="scout-chat-delete-btn"
                                  style={
                                    styles.deleteBtn
                                  }
                                  onClick={() =>
                                    deleteMessage(
                                      msg.id
                                    )
                                  }
                                  disabled={deleting}
                                  title="Delete message"
                                  type="button"
                                >
                                  ×
                                </button>
                              )}
                            </div>

                            {msg.message && (
                              <div
                                className={
                                  msg.isMe
                                    ? 'scout-chat-bubble-me'
                                    : 'scout-chat-bubble'
                                }
                                style={
                                  msg.isMe
                                    ? styles.bubbleMe
                                    : styles.bubble
                                }
                              >
                                {msg.message}
                              </div>
                            )}

                            {msg.attachments &&
                              msg.attachments.length >
                                0 && (
                                <div
                                  style={{
                                    marginTop:
                                      msg.message
                                        ? '4px'
                                        : '0',
                                  }}
                                >
                                  {msg.attachments.map(
                                    (
                                      attachment,
                                      idx
                                    ) => (
                                      <div
                                        key={idx}
                                      >
                                        {renderAttachmentPreview(
                                          attachment
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                            <div
                              className="scout-chat-time"
                              style={styles.time}
                            >
                              {msg.time}
                            </div>
                          </div>

                          {msg.isMe && (
                            <div
                              className="scout-chat-message-avatar"
                              style={
                                styles.messageAvatar
                              }
                            >
                              {msg.senderInitials}
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}

              {uploading && (
                <div
                  className="scout-chat-upload-progress"
                  style={styles.uploadProgress}
                >
                  <div
                    className="scout-chat-progress-bar"
                    style={styles.progressBar}
                  >
                    <div
                      className="scout-chat-progress-fill"
                      style={{
                        ...styles.progressFill,
                        width: `${uploadProgress}%`,
                      }}
                    ></div>
                  </div>

                  <span
                    className="scout-chat-progress-text"
                    style={styles.progressText}
                  >
                    Uploading... {uploadProgress}%
                  </span>
                </div>
              )}

              {typing && (
                <div
                  className="scout-chat-typing"
                  style={styles.typingIndicator}
                >
                  Someone is typing...
                </div>
              )}

              {error && (
                <div
                  className="scout-chat-error"
                  style={styles.errorMessage}
                >
                  {error}
                </div>
              )}
            </>
          )}
        </section>

        {/* MESSAGE INPUT */}
        {selectedMember && (
          <>
            {attachments.length > 0 && (
              <div
                className="scout-chat-attachment-container"
                style={
                  styles.attachmentPreviewContainer
                }
              >
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="scout-chat-attachment-preview"
                    style={styles.attachmentPreview}
                  >
                    <span>
                      {getFileIcon(file)}
                    </span>

                    <span
                      className="scout-chat-attachment-name"
                      style={styles.attachmentName}
                    >
                      {file.name}
                    </span>

                    <span
                      className="scout-chat-attachment-size"
                      style={styles.attachmentSize}
                    >
                      ({formatFileSize(file.size)})
                    </span>

                    <button
                      className="scout-chat-remove-attachment"
                      style={
                        styles.removeAttachment
                      }
                      onClick={() =>
                        removeAttachment(index)
                      }
                      type="button"
                      title="Remove attachment"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className="scout-chat-input-area"
              style={styles.chatInputArea}
            >
              <div
                className="scout-chat-input-container"
                style={styles.inputContainer}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                  onChange={handleFileSelect}
                />

                <button
                  className="scout-chat-input-btn"
                  style={styles.inputBtn}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  title="Attach file"
                  type="button"
                >
                  📎
                </button>

                <input
                  ref={inputRef}
                  className="scout-chat-input-field"
                  type="text"
                  style={styles.inputField}
                  id="messageInput"
                  placeholder="Write a message..."
                  value={inputMessage}
                  onChange={(e) =>
                    setInputMessage(e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                  autoComplete="off"
                />

                <button
                  className="scout-chat-input-btn"
                  style={styles.inputBtn}
                  onClick={toggleEmoji}
                  title="Emoji"
                  type="button"
                >
                  😊
                </button>

                <button
                  className="scout-chat-send-btn"
                  style={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={
                    sending ||
                    (!inputMessage.trim() &&
                      attachments.length === 0)
                  }
                  title="Send"
                  type="button"
                >
                  {sending ? '⏳' : '➤'}
                </button>
              </div>

              {showEmoji && (
                <div
                  className="scout-chat-emoji-panel"
                  style={styles.emojiPanel}
                  id="emojiPanel"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      className="scout-chat-emoji-btn"
                      style={styles.emojiBtn}
                      onClick={() =>
                        addEmoji(emoji)
                      }
                      type="button"
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
    minWidth: 0,
  },

  sidebarHeader: {
    padding: '20px',
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
  },

  sidebarTitle: {
    fontSize: '20px',
    margin: 0,
    marginBottom: '5px',
  },

  sidebarSubtitle: {
    fontSize: '13px',
    opacity: 0.9,
    margin: 0,
  },

  searchBox: {
    padding: '15px',
    borderBottom: `1px solid ${COLORS.border}`,
  },

  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
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
    alignItems: 'center',
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
    overflowX: 'hidden',
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
    minWidth: 0,
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
    overflow: 'visible',
  },

  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
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
    overflow: 'hidden',
  },

  memberName: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '4px',
    color: COLORS.dark,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },

  memberRole: {
    fontSize: '12px',
    color: COLORS.gray,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },

  unreadBadge: {
    background: COLORS.purple,
    color: COLORS.white,
    borderRadius: '50%',
    padding: '2px 8px',
    fontSize: '11px',
    minWidth: '20px',
    textAlign: 'center',
    flexShrink: 0,
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
    minHeight: 0,
    background: COLORS.white,
    width: '100%',
  },

  chatHeader: {
    height: '75px',
    minHeight: '75px',
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.purpleBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 25px',
    flexShrink: 0,
    gap: '10px',
  },

  chatTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
    overflow: 'hidden',
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
    flexShrink: 0,
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
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  },

  selectedAvatarFallback: {
    width: '100%',
    height: '100%',
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  chatSubtitle: {
    color: COLORS.gray,
    fontSize: '12px',
    margin: '3px 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  headerActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
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
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '25px',
    background: COLORS.lightBg,
    backgroundImage: `radial-gradient(${COLORS.border} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    WebkitOverflowScrolling: 'touch',
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
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
    minWidth: 0,
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
    minWidth: 0,
    maxWidth: '100%',
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
  },

  bubble: {
    background: COLORS.white,
    padding: '11px 14px',
    borderRadius: '4px 15px 15px 15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    border: `1px solid ${COLORS.purpleBorder}`,
    maxWidth: '100%',
  },

  bubbleMe: {
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
    color: COLORS.white,
    padding: '11px 14px',
    borderRadius: '15px 4px 15px 15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    maxWidth: '100%',
  },

  bubbleDeleted: {
    background: COLORS.lightBg,
    padding: '11px 14px',
    borderRadius: '4px 15px 15px 15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.gray,
    textAlign: 'center',
  },

  noChatIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },

  noChatTitle: {
    fontSize: '20px',
    color: COLORS.dark,
    margin: '0 0 8px',
  },

  noChatText: {
    fontSize: '14px',
    color: COLORS.gray,
    margin: 0,
  },

  attachmentPreviewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px 20px',
    background: COLORS.white,
    borderTop: `1px solid ${COLORS.purpleBorder}`,
    maxWidth: '100%',
    overflowX: 'auto',
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
    flexShrink: 0,
    maxWidth: '100%',
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
    flexShrink: 0,
  },

  removeAttachment: {
    background: 'none',
    border: 'none',
    color: COLORS.danger,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
    flexShrink: 0,
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
    minWidth: 0,
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
    flexShrink: 0,
  },

  inputField: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },

  emojiPanel: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    background: COLORS.white,
    padding: '12px',
    borderRadius: '12px',
    boxShadow: '0 5px 25px rgba(0,0,0,0.15)',
    width: '230px',
    maxWidth: 'calc(100vw - 30px)',
    zIndex: 100,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    border: `1px solid ${COLORS.purpleBorder}`,
    boxSizing: 'border-box',
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
    animation: 'scoutChatSpin 0.8s linear infinite',
  },
};

// ============================================
// RESPONSIVE / INTERACTION CSS
// ============================================

const styleSheet = document.createElement('style');

styleSheet.setAttribute(
  'data-scout-chat-styles',
  'true'
);

styleSheet.textContent = `
  @keyframes scoutChatSpin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .scout-chat-app,
  .scout-chat-app * {
    box-sizing: border-box;
  }

  .scout-chat-input-container:focus-within {
    border-color: ${COLORS.purple} !important;
    box-shadow: 0 0 0 3px ${COLORS.purple}20;
  }

  .scout-chat-member:hover {
    background: ${COLORS.purpleBg} !important;
  }

  .scout-chat-member-active:hover {
    background: ${COLORS.purpleBg} !important;
  }

  .scout-chat-header-btn:hover {
    background: ${COLORS.purpleBg} !important;
    color: ${COLORS.purple} !important;
  }

  .scout-chat-input-btn:hover {
    background: ${COLORS.purpleBg} !important;
    color: ${COLORS.purple} !important;
  }

  .scout-chat-send-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 2px 10px ${COLORS.purple}40;
  }

  .scout-chat-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .scout-chat-emoji-btn:hover {
    background: ${COLORS.purpleBg};
    transform: scale(1.2);
  }

  .scout-chat-remove-attachment:hover {
    color: ${COLORS.danger};
    transform: scale(1.2);
  }

  .scout-chat-delete-btn:hover {
    opacity: 1 !important;
  }

  .scout-chat-search-input:focus {
    border-color: ${COLORS.purple};
    box-shadow: 0 0 0 3px ${COLORS.purple}20;
  }

  .scout-chat-app {
    max-width: 100vw;
    max-height: 100vh;
  }

  .scout-chat-sidebar {
    min-width: 0;
  }

  .scout-chat-main {
    min-width: 0;
    width: 100%;
  }

  .scout-chat-title {
    min-width: 0;
    overflow: hidden;
  }

  .scout-chat-title-text {
    min-width: 0;
    overflow: hidden;
  }

  .scout-chat-name,
  .scout-chat-subtitle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .scout-chat-members-list {
    min-width: 0;
  }

  .scout-chat-member {
    min-width: 0;
  }

  .scout-chat-member-info {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    display: block;
  }

  .scout-chat-member-name {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .scout-chat-member-role {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .scout-chat-profile-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }

  .scout-chat-avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .scout-chat-selected-profile-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }

  .scout-chat-selected-avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .scout-chat-messages {
    min-width: 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .scout-chat-message {
    min-width: 0;
  }

  .scout-chat-message-content {
    min-width: 0;
    max-width: 100%;
  }

  .scout-chat-bubble,
  .scout-chat-bubble-me,
  .scout-chat-bubble-deleted {
    max-width: 100%;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .scout-chat-input-container {
    min-width: 0;
  }

  .scout-chat-input-field {
    min-width: 0;
  }

  .scout-chat-attachment-container {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .scout-chat-attachment-preview {
    flex-shrink: 0;
    max-width: 100%;
  }

  .scout-chat-emoji-panel {
    max-width: calc(100vw - 20px);
  }

  /* ========================================
     TABLET
     ======================================== */

  @media (max-width: 1024px) {
    .scout-chat-sidebar {
      width: 270px !important;
    }

    .scout-chat-header {
      padding: 0 18px !important;
    }

    .scout-chat-messages {
      padding: 18px !important;
    }

    .scout-chat-message {
      max-width: 82% !important;
    }

    .scout-chat-input-area {
      padding: 10px 15px !important;
    }
  }

  /* ========================================
     MOBILE
     Member names REMAIN VISIBLE
     ======================================== */

  @media (max-width: 768px) {
    .scout-chat-sidebar {
      width: 220px !important;
      min-width: 220px !important;
    }

    .scout-chat-sidebar-header {
      padding: 14px 12px !important;
    }

    .scout-chat-sidebar-title {
      font-size: 16px !important;
      line-height: 1.2 !important;
    }

    .scout-chat-sidebar-subtitle {
      font-size: 10px !important;
      line-height: 1.3 !important;
    }

    .scout-chat-search-box {
      padding: 10px !important;
    }

    .scout-chat-search-input {
      font-size: 12px !important;
      padding: 9px 10px !important;
    }

    .scout-chat-member-title {
      padding: 10px !important;
      font-size: 12px !important;
    }

    .scout-chat-member {
      justify-content: flex-start !important;
      padding: 10px 8px !important;
      gap: 8px !important;
    }

    .scout-chat-member-info {
      display: block !important;
      min-width: 0 !important;
      flex: 1 !important;
      overflow: hidden !important;
    }

    .scout-chat-member-name {
      display: block !important;
      font-size: 13px !important;
      line-height: 1.25 !important;
      margin-bottom: 3px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    .scout-chat-member-role {
      display: block !important;
      font-size: 10px !important;
      line-height: 1.2 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    .scout-chat-header {
      padding: 0 12px !important;
      height: 70px !important;
      min-height: 70px !important;
    }

    .scout-chat-name {
      font-size: 14px !important;
    }

    .scout-chat-subtitle {
      font-size: 10px !important;
    }

    .scout-chat-messages {
      padding: 15px !important;
    }

    .scout-chat-message {
      max-width: 90% !important;
    }

    .scout-chat-header-actions {
      display: none !important;
    }

    .scout-chat-community-icon {
      display: none !important;
    }

    .scout-chat-selected-avatar {
      width: 35px !important;
      height: 35px !important;
      font-size: 12px !important;
    }

    .scout-chat-avatar {
      width: 36px !important;
      height: 36px !important;
      font-size: 11px !important;
    }

    .scout-chat-online-dot,
    .scout-chat-offline-dot {
      width: 8px !important;
      height: 8px !important;
    }

    .scout-chat-unread-badge {
      font-size: 9px !important;
      min-width: 16px !important;
      padding: 1px 5px !important;
    }

    .scout-chat-attachment-preview {
      font-size: 11px !important;
      padding: 2px 8px !important;
    }

    .scout-chat-attachment-name {
      max-width: 80px !important;
    }

    .scout-chat-date-divider {
      margin: 8px 0 16px !important;
    }

    .scout-chat-date-divider-text {
      display: inline-block;
      max-width: calc(100% - 20px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .scout-chat-input-area {
      padding: 8px 12px !important;
    }

    .scout-chat-input-container {
      width: 100% !important;
    }

    .scout-chat-input-field {
      min-width: 0 !important;
    }

    .scout-chat-emoji-panel {
      right: 10px !important;
      bottom: 70px !important;
    }
  }

  /* ========================================
     SMALL MOBILE
     ======================================== */

  @media (max-width: 480px) {
    .scout-chat-sidebar {
      width: 190px !important;
      min-width: 190px !important;
    }

    .scout-chat-sidebar-header {
      padding: 12px 8px !important;
    }

    .scout-chat-sidebar-title {
      font-size: 14px !important;
    }

    .scout-chat-sidebar-subtitle {
      font-size: 9px !important;
    }

    .scout-chat-search-box {
      padding: 8px !important;
    }

    .scout-chat-search-input {
      font-size: 11px !important;
      padding: 8px !important;
    }

    .scout-chat-member-title {
      padding: 8px !important;
      font-size: 11px !important;
    }

    .scout-chat-member {
      padding: 9px 7px !important;
      gap: 7px !important;
    }

    .scout-chat-member-info {
      display: block !important;
      min-width: 0 !important;
      flex: 1 !important;
    }

    .scout-chat-member-name {
      display: block !important;
      font-size: 12px !important;
      line-height: 1.2 !important;
    }

    .scout-chat-member-role {
      display: block !important;
      font-size: 9px !important;
      line-height: 1.2 !important;
    }

    .scout-chat-avatar {
      width: 34px !important;
      height: 34px !important;
      font-size: 10px !important;
    }

    .scout-chat-header {
      padding: 0 8px !important;
      height: 60px !important;
      min-height: 60px !important;
    }

    .scout-chat-messages {
      padding: 10px !important;
    }

    .scout-chat-message {
      max-width: 95% !important;
    }

    .scout-chat-bubble,
    .scout-chat-bubble-me,
    .scout-chat-bubble-deleted {
      font-size: 13px !important;
      padding: 8px 10px !important;
    }

    .scout-chat-input-area {
      padding: 8px 10px !important;
    }

    .scout-chat-input-container {
      gap: 4px !important;
      padding: 4px 6px !important;
    }

    .scout-chat-input-btn {
      width: 32px !important;
      height: 32px !important;
      font-size: 16px !important;
    }

    .scout-chat-send-btn {
      width: 36px !important;
      height: 36px !important;
      font-size: 16px !important;
    }

    .scout-chat-input-field {
      font-size: 13px !important;
      padding: 8px !important;
    }

    .scout-chat-emoji-panel {
      width: 180px !important;
      max-width: calc(100vw - 20px) !important;
      padding: 8px !important;
      bottom: 65px !important;
      right: 10px !important;
    }

    .scout-chat-emoji-btn {
      font-size: 18px !important;
      padding: 3px !important;
    }

    .scout-chat-message-avatar {
      width: 30px !important;
      height: 30px !important;
      font-size: 10px !important;
    }

    .scout-chat-sender {
      font-size: 10px !important;
    }

    .scout-chat-time {
      font-size: 9px !important;
    }

    .scout-chat-date-divider-text {
      font-size: 10px !important;
      padding: 4px 10px !important;
    }

    .scout-chat-no-selection-icon {
      font-size: 36px !important;
    }

    .scout-chat-no-selection-title {
      font-size: 16px !important;
    }

    .scout-chat-no-selection-text {
      font-size: 12px !important;
      padding: 0 15px;
    }

    .scout-chat-attachment-container {
      padding: 4px 10px !important;
    }

    .scout-chat-attachment-preview {
      font-size: 10px !important;
      padding: 2px 6px !important;
    }

    .scout-chat-attachment-name {
      max-width: 60px !important;
    }
  }

  /* ========================================
     VERY SMALL MOBILE
     ======================================== */

  @media (max-width: 360px) {
    .scout-chat-sidebar {
      width: 170px !important;
      min-width: 170px !important;
    }

    .scout-chat-sidebar-title {
      font-size: 13px !important;
    }

    .scout-chat-sidebar-subtitle {
      font-size: 8px !important;
    }

    .scout-chat-member {
      padding: 8px 6px !important;
      gap: 6px !important;
    }

    .scout-chat-member-info {
      display: block !important;
      min-width: 0 !important;
      flex: 1 !important;
    }

    .scout-chat-member-name {
      display: block !important;
      font-size: 11px !important;
    }

    .scout-chat-member-role {
      display: block !important;
      font-size: 8px !important;
    }

    .scout-chat-avatar {
      width: 32px !important;
      height: 32px !important;
      font-size: 9px !important;
    }

    .scout-chat-header {
      height: 56px !important;
      min-height: 56px !important;
      padding: 0 6px !important;
    }

    .scout-chat-selected-avatar {
      width: 32px !important;
      height: 32px !important;
      font-size: 11px !important;
    }

    .scout-chat-name {
      font-size: 12px !important;
    }

    .scout-chat-subtitle {
      font-size: 9px !important;
    }

    .scout-chat-messages {
      padding: 8px !important;
    }

    .scout-chat-message {
      max-width: 97% !important;
      gap: 6px !important;
    }

    .scout-chat-bubble,
    .scout-chat-bubble-me,
    .scout-chat-bubble-deleted {
      font-size: 12px !important;
      padding: 7px 9px !important;
    }

    .scout-chat-input-area {
      padding: 6px 7px !important;
    }

    .scout-chat-input-btn {
      width: 29px !important;
      height: 29px !important;
      font-size: 14px !important;
    }

    .scout-chat-send-btn {
      width: 33px !important;
      height: 33px !important;
      font-size: 14px !important;
    }

    .scout-chat-input-field {
      font-size: 12px !important;
      padding: 6px !important;
    }

    .scout-chat-message-avatar {
      width: 27px !important;
      height: 27px !important;
      font-size: 9px !important;
    }

    .scout-chat-sender {
      font-size: 9px !important;
    }

    .scout-chat-time {
      font-size: 8px !important;
    }

    .scout-chat-date-divider-text {
      font-size: 9px !important;
      padding: 3px 8px !important;
    }
  }
`;

document.head.appendChild(styleSheet);

export default ScoutChat;