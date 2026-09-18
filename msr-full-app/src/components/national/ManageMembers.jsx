import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ManageMembers = () => {
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [showScoutIDModal, setShowScoutIDModal] = useState(false);
  const [scoutIDData, setScoutIDData] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(null);

  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    birthDate: '',
    gender: '',
    troopName: '',
    address: '',
  });

  const tableRef = useRef(null);
  const cardFrontRef = useRef(null);
  const cardBackRef = useRef(null);

  useEffect(() => {
    console.log('🔄 ManageMembers mounted, fetching data...');
    fetchMembers();
    fetchDistricts();
  }, []);

  // ============================================================
  // FETCH MEMBERS
  // ============================================================
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      console.log(
        '🔑 Token found:',
        token ? `Yes (length: ${token.length})` : 'No'
      );

      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log(
        `📊 Fetching members from: ${API_URL}/national/members`
      );

      const response = await axios.get(
        `${API_URL}/national/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log('📊 Response status:', response.status);
      console.log(
        '📊 Response data:',
        JSON.stringify(response.data, null, 2)
      );

      let membersData = [];

      if (response.data?.members) {
        membersData = response.data.members;
      } else if (response.data?.data) {
        membersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        membersData = response.data;
      } else {
        console.warn(
          '⚠️ Unexpected response format:',
          response.data
        );
      }

      const formattedMembers = membersData.map((member) => {
        console.log('👤 Member data:', {
          id: member.id,
          troopName: member.troopName,
          troop_name: member.troop_name,
          fullName: member.fullName,
          full_name: member.full_name,
        });

        return {
          id: member.id,
          sin: member.sin || null,

          fullName:
            member.fullName ||
            member.full_name ||
            member.name ||
            'N/A',

          firstName:
            member.first_name ||
            member.firstName ||
            '',

          lastName:
            member.last_name ||
            member.lastName ||
            '',

          troopName:
            member.troopName ||
            member.troop_name ||
            null,

          email:
            member.email ||
            member.user?.email ||
            'N/A',

          phone:
            member.phone ||
            member.user?.phone ||
            'N/A',

          province: member.province || 'N/A',
          district: member.district || 'N/A',
          sector: member.sector || 'N/A',
          cell: member.cell || 'N/A',
          village: member.village || 'N/A',

          birthDate:
            member.birthDate ||
            member.date_of_birth ||
            'N/A',

          gender: member.gender || 'N/A',

          status:
            member.status ||
            member.membership_status ||
            'pending',

          membershipStatus:
            member.membership_status ||
            member.status ||
            'pending',

          paymentStatus:
            member.paymentStatus ||
            member.payment_status ||
            member.fee_status ||
            'unpaid',

          fee_status:
            member.fee_status ||
            member.payment_status ||
            'unpaid',

          payment_approved:
            member.payment_approved || false,

          scout_id_generated:
            member.scout_id_generated || false,

          profile_image:
            member.profile_image ||
            member.profileImage ||
            null,

          profileImage:
            member.profile_image ||
            member.profileImage ||
            null,

          photo:
            member.photo ||
            member.profile_image ||
            null,

          address: member.address || '',

          middleName:
            member.middleName ||
            member.middle_name ||
            '',

          group:
            member.group ||
            member.group_name ||
            '',

          createdAt:
            member.created_at ||
            member.createdAt,
        };
      });

      console.log(
        `✅ Loaded ${formattedMembers.length} members`
      );

      console.log(
        '📊 First member:',
        formattedMembers[0]
      );

      setMembers(formattedMembers);
      setError('');
    } catch (err) {
      console.error(
        '❌ Fetch members error details:',
        err
      );

      let errorMessage = 'Failed to load members. ';

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage =
            'Session expired. Please login again.';
        } else {
          errorMessage +=
            err.response.data?.message ||
            `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        errorMessage =
          'Cannot connect to server. Please check if the backend is running.';
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH DISTRICTS
  // ============================================================
  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;

      const response = await axios.get(
        `${API_URL}/national/districts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let districtsData = [];

      if (response.data?.districts) {
        districtsData = response.data.districts;
      } else if (Array.isArray(response.data)) {
        districtsData = response.data;
      }

      setDistricts(
        Array.isArray(districtsData)
          ? districtsData
          : []
      );

      console.log(
        `✅ Loaded ${districtsData.length} districts`
      );
    } catch (err) {
      console.error(
        'Failed to load districts:',
        err
      );

      setDistricts([]);
    }
  };

  // ============================================================
  // SEARCH AND FILTERS
  // ============================================================
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterDistrict = (e) => {
    setFilterDistrict(e.target.value);
  };

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
  };

  // ============================================================
  // FORM RESET
  // ============================================================
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      birthDate: '',
      gender: '',
      troopName: '',
      address: '',
    });
  };

  // ============================================================
  // ADD MEMBER
  // ============================================================
  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `${API_URL}/national/members`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('✅ Member added successfully!');

      setTimeout(() => {
        setSuccess('');
      }, 3000);

      setShowAddModal(false);
      resetForm();

      fetchMembers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to add member'
      );

      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  // ============================================================
  // UPDATE MEMBER
  // ============================================================
  const handleUpdateMember = async (e) => {
    e.preventDefault();

    if (!selectedMember) return;

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/national/members/${selectedMember.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        '✅ Member updated successfully!'
      );

      setTimeout(() => {
        setSuccess('');
      }, 3000);

      setSelectedMember(null);

      fetchMembers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update member'
      );

      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  // ============================================================
  // DELETE MEMBER
  // ============================================================
  const handleDeleteMember = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this member?'
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `${API_URL}/national/members/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        '✅ Member deleted successfully!'
      );

      setTimeout(() => {
        setSuccess('');
      }, 3000);

      fetchMembers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete member'
      );

      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  // ============================================================
  // TOGGLE STATUS
  // ============================================================
  const handleToggleStatus = async (
    id,
    currentStatus
  ) => {
    const newStatus =
      currentStatus === 'active'
        ? 'inactive'
        : 'active';

    try {
      const token = localStorage.getItem('token');

      await axios.patch(
        `${API_URL}/national/members/${id}/toggle-status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        `✅ Member ${
          newStatus === 'active'
            ? 'activated'
            : 'deactivated'
        }!`
      );

      setTimeout(() => {
        setSuccess('');
      }, 3000);

      fetchMembers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update status'
      );

      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  // ============================================================
  // PAYMENT APPROVAL
  // ============================================================
  const handleApprovePayment = async (id) => {
    if (processingPayment === id) return;

    setProcessingPayment(id);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError(
          'Authentication required. Please login again.'
        );

        setProcessingPayment(null);
        return;
      }

      console.log(
        `💰 Approving payment for member ${id}`
      );

      const response = await axios.post(
        `${API_URL}/national/members/${id}/approve-payment`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log(
        '✅ Payment approval response:',
        response.data
      );

      if (response.data.success) {
        const emailSent =
          response.data.emailSent || false;

        setSuccess(
          emailSent
            ? "✅ Payment approved! Scout ID Card sent to member's email."
            : '✅ Payment approved successfully! Scout ID Card is now available.'
        );

        if (response.data.member) {
          const updatedMember =
            response.data.member;

          setMembers((prevMembers) =>
            prevMembers.map((m) => {
              if (m.id === id) {
                return {
                  ...m,
                  ...updatedMember,
                  fee_status: 'paid',
                  paymentStatus: 'paid',
                  payment_approved: true,
                  scout_id_generated: true,
                  sin:
                    updatedMember.sin || m.sin,
                };
              }

              return m;
            })
          );
        }

        setTimeout(() => {
          fetchMembers();
        }, 1000);

        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        throw new Error(
          response.data?.message ||
            'Payment approval failed'
        );
      }
    } catch (err) {
      console.error(
        '❌ Approve payment error:',
        err
      );

      let errorMessage =
        'Failed to approve payment. ';

      if (err.response) {
        errorMessage +=
          err.response.data?.message ||
          `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage +=
          'Network error - please check your connection';
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);

      setTimeout(() => {
        setError('');
      }, 8000);
    } finally {
      setProcessingPayment(null);
    }
  };

  // ============================================================
  // GENERATE SIN
  // ============================================================
  const handleGenerateSIN = async (id) => {
    if (processingPayment === id) return;

    setProcessingPayment(id);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError(
          'Authentication required. Please login again.'
        );

        setProcessingPayment(null);
        return;
      }

      console.log(
        `🆔 Generating SIN for member ${id}`
      );

      const response = await axios.post(
        `${API_URL}/national/members/${id}/generate-sin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(
        '✅ SIN generation response:',
        response.data
      );

      if (response.data.success) {
        setSuccess(
          '✅ Scout ID (SIN) generated successfully!'
        );

        await fetchMembers();

        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        throw new Error(
          response.data?.message ||
            'Failed to generate Scout ID'
        );
      }
    } catch (err) {
      console.error(
        '❌ Generate SIN error:',
        err
      );

      let errorMessage =
        'Failed to generate Scout ID. ';

      if (err.response) {
        errorMessage +=
          err.response.data?.message ||
          `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage +=
          'Network error - please check your connection';
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);

      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setProcessingPayment(null);
    }
  };

  // ============================================================
  // CSV EXPORT
  // ============================================================
  const exportToCSV = () => {
    const headers = [
      'SIN',
      'Full Name',
      'Troop Name',
      'Email',
      'Phone',
      'Province',
      'District',
      'Sector',
      'Cell',
      'Village',
      'Birth Date',
      'Gender',
      'Status',
      'Payment Status',
    ];

    const escapeCSV = (value) => {
      const text =
        value === null ||
        value === undefined
          ? ''
          : String(value);

      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = filteredMembers.map(
      (member) => [
        member.sin || 'N/A',
        member.fullName || 'N/A',
        member.troopName || 'N/A',
        member.email || 'N/A',
        member.phone || 'N/A',
        member.province || 'N/A',
        member.district || 'N/A',
        member.sector || 'N/A',
        member.cell || 'N/A',
        member.village || 'N/A',
        member.birthDate || 'N/A',
        member.gender || 'N/A',
        member.status || 'pending',
        member.paymentStatus || 'unpaid',
      ]
    );

    let csvContent =
      headers.map(escapeCSV).join(',') + '\n';

    rows.forEach((row) => {
      csvContent +=
        row.map(escapeCSV).join(',') + '\n';
    });

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.setAttribute(
      'download',
      `members_${
        new Date()
          .toISOString()
          .split('T')[0]
      }.csv`
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  };

  // ============================================================
  // PDF EXPORT
  // ============================================================
  const exportToPDF = () => {
    const printContent =
      document.getElementById(
        'members-table-print-content'
      );

    if (!printContent) {
      setError(
        'Unable to prepare members table for PDF export.'
      );

      setTimeout(() => {
        setError('');
      }, 4000);

      return;
    }

    const printWindow =
      window.open('', '_blank');

    if (!printWindow) {
      setError(
        'Please allow pop-ups to export the PDF.'
      );

      setTimeout(() => {
        setError('');
      }, 4000);

      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Members Export</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #111827;
            }

            h2 {
              margin-bottom: 15px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }

            th {
              background: #002B5C;
              color: white;
              padding: 7px;
              text-align: left;
              border: 1px solid #ddd;
            }

            td {
              padding: 6px 7px;
              border: 1px solid #ddd;
            }

            tr:nth-child(even) {
              background: #f9f9f9;
            }

            .badge-approved,
            .payment-paid {
              background: #dcfce7;
              color: #166534;
            }

            .badge-pending,
            .payment-pending {
              background: #fef3c7;
              color: #92400e;
            }

            .badge-rejected,
            .payment-unpaid {
              background: #fecaca;
              color: #991b1b;
            }

            .member-photo {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              object-fit: cover;
            }

            .action-buttons {
              display: none;
            }
          </style>
        </head>

        <body>
          <h2>MyScout Rwanda - Members</h2>
          ${printContent.innerHTML}

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // ============================================================
  // VIEW SCOUT ID
  // ============================================================
  const handleViewScoutID = (member) => {
    setScoutIDData(member);
    setIsFlipped(false);
    setShowScoutIDModal(true);
  };

  const toggleFlip = () => {
    setIsFlipped((previous) => !previous);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================
  const openEditModal = (member) => {
    setSelectedMember(member);

    setFormData({
      fullName:
        member.fullName ||
        member.name ||
        '',
      email: member.email || '',
      phone: member.phone || '',
      province: member.province || '',
      district: member.district || '',
      sector: member.sector || '',
      cell: member.cell || '',
      village: member.village || '',
      birthDate: member.birthDate || '',
      gender: member.gender || '',
      troopName:
        member.troopName || '',
      address: member.address || '',
    });
  };

  // ============================================================
  // BADGE HELPERS
  // ============================================================
  const getStatusBadge = (status) => {
    if (
      status === 'active' ||
      status === 'approved'
    ) {
      return 'badge-approved';
    }

    if (status === 'pending') {
      return 'badge-pending';
    }

    if (
      status === 'inactive' ||
      status === 'suspended'
    ) {
      return 'badge-rejected';
    }

    return 'badge-default';
  };

  const getPaymentBadge = (status) => {
    if (
      status === 'paid' ||
      status === 'approved'
    ) {
      return 'payment-paid';
    }

    if (status === 'pending') {
      return 'payment-pending';
    }

    if (status === 'unpaid') {
      return 'payment-unpaid';
    }

    return 'payment-default';
  };

  const getStatusText = (status) => {
    const map = {
      active: 'Active',
      approved: 'Approved',
      pending: 'Pending',
      inactive: 'Inactive',
      suspended: 'Suspended',
    };

    return (
      map[status] ||
      status ||
      'Pending'
    );
  };

  const getPaymentText = (status) => {
    const map = {
      paid: '✅ Paid',
      approved: '✅ Approved',
      pending: '⏳ Pending',
      unpaid: '❌ Unpaid',
    };

    return (
      map[status] ||
      status ||
      'Unpaid'
    );
  };

  // ============================================================
  // PHOTO URL
  // ============================================================
  const getPhotoUrl = (member) => {
    if (!member) return null;

    const imagePath =
      member.profile_image ||
      member.profileImage ||
      member.photo ||
      null;

    if (!imagePath) return null;

    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://')
    ) {
      return imagePath;
    }

    const cleanPath =
      imagePath.replace(/^\/+/, '');

    const baseUrl =
      API_URL.replace(/\/api\/?$/, '');

    if (
      cleanPath.startsWith('uploads/')
    ) {
      return `${baseUrl}/${cleanPath}`;
    }

    return `${baseUrl}/uploads/${cleanPath}`;
  };

  // ============================================================
  // QR DATA
  // ============================================================
  const generateQRData = (member) => {
    const baseUrl =
      process.env.REACT_APP_FRONTEND_URL ||
      'http://localhost:3000';

    return JSON.stringify({
      type: 'scout_id',
      sin: member.sin,
      name: member.fullName,
      district: member.district,
      troop: member.troopName,
      issued: new Date()
        .toISOString()
        .split('T')[0],
      verify: `${baseUrl}/verify-scout/${member.sin}`,
    });
  };

  // ============================================================
  // GENERATE SCOUT ID PDF
  // ============================================================
  const createScoutIDPdf = async () => {
    const frontElement =
      cardFrontRef.current;

    const backElement =
      cardBackRef.current;

    if (!frontElement || !backElement) {
      throw new Error(
        'Card elements not found'
      );
    }

    const frontCanvas =
      await html2canvas(frontElement, {
        scale: 3,
        backgroundColor: '#fbfaf6',
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

    const backCanvas =
      await html2canvas(backElement, {
        scale: 3,
        backgroundColor: '#fbfaf6',
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const imgWidth = 190;

    const imgHeight =
      (frontCanvas.height * imgWidth) /
      frontCanvas.width;

    const x =
      (pageWidth - imgWidth) / 2;

    const y =
      (pageHeight - imgHeight) / 2;

    pdf.addImage(
      frontCanvas.toDataURL(
        'image/png',
        1.0
      ),
      'PNG',
      x,
      y,
      imgWidth,
      imgHeight
    );

    pdf.addPage();

    pdf.addImage(
      backCanvas.toDataURL(
        'image/png',
        1.0
      ),
      'PNG',
      x,
      y,
      imgWidth,
      imgHeight
    );

    return pdf;
  };

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================
  const downloadPDF = async () => {
    if (!scoutIDData) {
      alert(
        'No member data to download'
      );
      return;
    }

    setDownloadingPDF(true);

    try {
      const pdf =
        await createScoutIDPdf();

      pdf.save(
        `Scout_ID_${
          scoutIDData.sin ||
          scoutIDData.id
        }.pdf`
      );

      setSuccess(
        '✅ PDF downloaded successfully!'
      );

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error(
        '❌ PDF download error:',
        error
      );

      setError(
        'Failed to download PDF: ' +
          error.message
      );

      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setDownloadingPDF(false);
    }
  };

  // ============================================================
  // SEND PDF TO EMAIL
  // ============================================================
  const sendPDFToEmail = async () => {
    if (!scoutIDData) {
      alert(
        'No member data to send'
      );
      return;
    }

    setSendingEmail(true);

    try {
      const token =
        localStorage.getItem('token');

      const pdf =
        await createScoutIDPdf();

      const pdfBase64 =
        pdf.output('datauristring');

      const response =
        await axios.post(
          `${API_URL}/national/members/${scoutIDData.id}/send-scout-id-pdf`,
          {
            pdfBase64,
            memberId:
              scoutIDData.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json',
            },
          }
        );

      if (response.data.success) {
        setSuccess(
          "✅ Scout ID Card sent to member's email successfully!"
        );

        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        throw new Error(
          response.data.message ||
            'Failed to send email'
        );
      }
    } catch (error) {
      console.error(
        '❌ Send email error:',
        error
      );

      setError(
        'Failed to send email: ' +
          error.message
      );

      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setSendingEmail(false);
    }
  };

  // ============================================================
  // FILTER MEMBERS
  // ============================================================
  const safeMembers = Array.isArray(members)
    ? members
    : [];

  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  const filteredMembers =
    safeMembers.filter((member) => {
      const fullName =
        String(
          member.fullName || ''
        ).toLowerCase();

      const sin =
        String(
          member.sin || ''
        ).toLowerCase();

      const email =
        String(
          member.email || ''
        ).toLowerCase();

      const troopName =
        String(
          member.troopName || ''
        ).toLowerCase();

      const matchesSearch =
        fullName.includes(
          normalizedSearch
        ) ||
        sin.includes(
          normalizedSearch
        ) ||
        email.includes(
          normalizedSearch
        ) ||
        troopName.includes(
          normalizedSearch
        );

      const matchesDistrict =
        filterDistrict === 'all' ||
        member.district ===
          filterDistrict;

      const matchesStatus =
        filterStatus === 'all' ||
        member.status ===
          filterStatus ||
        member.membershipStatus ===
          filterStatus;

      return (
        matchesSearch &&
        matchesDistrict &&
        matchesStatus
      );
    });

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>

        <p
          style={{
            marginTop: '20px',
            color: '#6B7280',
          }}
        >
          Loading members...
        </p>

        <p
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
          }}
        >
          Please wait while we fetch your data
        </p>
      </div>
    );
  }

  // ============================================================
  // ERROR PAGE
  // ============================================================
  if (
    error &&
    !loading &&
    members.length === 0
  ) {
    return (
      <div className="dashboard-container">
        <div className="page-header">
          <div>
            <h2>
              <i
                className="fas fa-users"
                style={{
                  color: '#FFD100',
                }}
              ></i>{' '}
              Member Management
            </h2>

            <p>
              Manage all registered scouts
              across the country
            </p>
          </div>
        </div>

        <div
          className="alert alert-error"
          style={{
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <i
            className="fas fa-exclamation-triangle"
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          ></i>

          <h3
            style={{
              marginBottom: '8px',
            }}
          >
            Failed to Load Members
          </h3>

          <p
            style={{
              color: '#6B7280',
            }}
          >
            {error}
          </p>

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            <button
              className="btn-primary"
              onClick={fetchMembers}
              style={{
                padding: '10px 24px',
              }}
            >
              <i className="fas fa-sync"></i>{' '}
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="dashboard-container">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="page-header">
        <div>
          <h2>
            <i
              className="fas fa-users"
              style={{
                color: '#FFD100',
              }}
            ></i>{' '}
            Member Management
          </h2>

          <p>
            Manage all registered scouts
            across the country
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={exportToCSV}
          >
            <i className="fas fa-file-csv"></i>{' '}
            Export CSV
          </button>

          <button
            className="btn-secondary"
            onClick={exportToPDF}
          >
            <i className="fas fa-file-pdf"></i>{' '}
            Export PDF
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <i className="fas fa-user-plus"></i>{' '}
            Add Member
          </button>
        </div>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>

          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>

          <div>
            <strong>Success</strong>
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* ======================================================
          SEARCH AND FILTER
      ====================================================== */}
      <div className="search-filter-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>

          <input
            type="text"
            placeholder="Search by SIN, Name, Troop, or Email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="filter-box">
          <select
            value={filterDistrict}
            onChange={
              handleFilterDistrict
            }
          >
            <option value="all">
              All Districts
            </option>

            {Array.isArray(districts) &&
            districts.length > 0 ? (
              districts.map(
                (district) => (
                  <option
                    key={
                      district.id ||
                      district.name
                    }
                    value={district.name}
                  >
                    {district.name}
                  </option>
                )
              )
            ) : (
              <option value="">
                No districts available
              </option>
            )}
          </select>
        </div>

        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={
              handleFilterStatus
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>

        <div className="stats-info">
          <span>
            Total:{' '}
            <strong>
              {filteredMembers.length}
            </strong>{' '}
            members
          </span>
        </div>
      </div>

      {/* ======================================================
          RESPONSIVE TABLE
      ====================================================== */}

      <div
        className="table-scroll-hint"
        aria-hidden="true"
      >
        <i className="fas fa-arrows-alt-h"></i>
        <span>
          Swipe or scroll horizontally to view
          all member information
        </span>
      </div>

      <div
        id="members-table-container"
        ref={tableRef}
        className="members-table-wrapper"
      >
        <div
          id="members-table-print-content"
          className="members-table-inner"
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>SIN</th>
                <th>Full Name</th>
                <th>Troop Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Province</th>
                <th>District</th>
                <th>Sector</th>
                <th>Birth Date</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Payment</th>
                <th>ID Card</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan="15"
                    className="text-center"
                  >
                    {searchTerm ||
                    filterDistrict !==
                      'all' ||
                    filterStatus !== 'all'
                      ? 'No members match your filters'
                      : 'No members found'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map(
                  (member) => {
                    const paymentStatus =
                      member.fee_status ||
                      member.paymentStatus ||
                      'unpaid';

                    const isPaymentApproved =
                      paymentStatus ===
                        'paid' ||
                      paymentStatus ===
                        'approved';

                    const hasSIN =
                      member.sin &&
                      member.sin !==
                        'N/A' &&
                      member.sin !== null;

                    const status =
                      member.status ||
                      member.membershipStatus ||
                      'pending';

                    const isProcessing =
                      processingPayment ===
                      member.id;

                    const photoUrl =
                      getPhotoUrl(
                        member
                      );

                    return (
                      <tr
                        key={
                          member.id
                        }
                      >
                        {/* PHOTO */}
                        <td className="photo-cell">
                          {photoUrl ? (
                            <img
                              src={
                                photoUrl
                              }
                              alt={
                                member.fullName
                              }
                              className="member-photo"
                              onError={(
                                e
                              ) => {
                                e.currentTarget.style.display =
                                  'none';

                                const parent =
                                  e
                                    .currentTarget
                                    .parentElement;

                                if (
                                  parent &&
                                  !parent.querySelector(
                                    '.photo-fallback'
                                  )
                                ) {
                                  const initial =
                                    document.createElement(
                                      'div'
                                    );

                                  initial.className =
                                    'photo-fallback';

                                  initial.textContent =
                                    member.fullName?.charAt(
                                      0
                                    ) ||
                                    'S';

                                  parent.appendChild(
                                    initial
                                  );
                                }
                              }}
                            />
                          ) : (
                            <div className="photo-fallback">
                              {member.fullName?.charAt(
                                0
                              ) || 'S'}
                            </div>
                          )}
                        </td>

                        {/* SIN */}
                        <td>
                          <strong>
                            {member.sin ||
                              '—'}
                          </strong>
                        </td>

                        {/* NAME */}
                        <td className="name-cell">
                          {member.fullName ||
                            'N/A'}
                        </td>

                        {/* TROOP */}
                        <td>
                          {member.troopName ||
                            '—'}
                        </td>

                        {/* EMAIL */}
                        <td className="email-cell">
                          {member.email ||
                            'N/A'}
                        </td>

                        {/* PHONE */}
                        <td>
                          {member.phone ||
                            'N/A'}
                        </td>

                        {/* PROVINCE */}
                        <td>
                          {member.province ||
                            'N/A'}
                        </td>

                        {/* DISTRICT */}
                        <td>
                          {member.district ||
                            'N/A'}
                        </td>

                        {/* SECTOR */}
                        <td>
                          {member.sector ||
                            'N/A'}
                        </td>

                        {/* BIRTH DATE */}
                        <td>
                          {member.birthDate ||
                            'N/A'}
                        </td>

                        {/* GENDER */}
                        <td>
                          {member.gender ||
                            'N/A'}
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`status-badge ${getStatusBadge(
                              status
                            )}`}
                          >
                            {getStatusText(
                              status
                            )}
                          </span>
                        </td>

                        {/* PAYMENT */}
                        <td>
                          <span
                            className={`payment-badge ${getPaymentBadge(
                              paymentStatus
                            )}`}
                          >
                            {getPaymentText(
                              paymentStatus
                            )}
                          </span>
                        </td>

                        {/* ID CARD */}
                        <td>
                          {isPaymentApproved &&
                          hasSIN ? (
                            <button
                              className="btn-sm btn-id-card"
                              onClick={() =>
                                handleViewScoutID(
                                  member
                                )
                              }
                              title="View Scout ID Card"
                            >
                              <i className="fas fa-id-card"></i>{' '}
                              View
                            </button>
                          ) : (
                            <span
                              className="text-muted"
                            >
                              {!hasSIN
                                ? 'No SIN'
                                : 'Payment Required'}
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-sm btn-edit"
                              onClick={() =>
                                openEditModal(
                                  member
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              title="Edit Member"
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            <button
                              className="btn-sm btn-toggle"
                              onClick={() =>
                                handleToggleStatus(
                                  member.id,
                                  status
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              title={
                                status ===
                                'active'
                                  ? 'Deactivate'
                                  : 'Activate'
                              }
                            >
                              <i
                                className={`fas ${
                                  status ===
                                  'active'
                                    ? 'fa-pause'
                                    : 'fa-play'
                                }`}
                              ></i>
                            </button>

                            {!hasSIN && (
                              <button
                                className="btn-sm btn-generate"
                                onClick={() =>
                                  handleGenerateSIN(
                                    member.id
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                title="Generate Scout ID / SIN"
                              >
                                <i
                                  className={`fas ${
                                    isProcessing
                                      ? 'fa-spinner fa-spin'
                                      : 'fa-id-card'
                                  }`}
                                ></i>
                              </button>
                            )}

                            {!isPaymentApproved && (
                              <button
                                className="btn-sm btn-approve-payment"
                                onClick={() =>
                                  handleApprovePayment(
                                    member.id
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                title="Approve Payment"
                              >
                                <i
                                  className={`fas ${
                                    isProcessing
                                      ? 'fa-spinner fa-spin'
                                      : 'fa-check'
                                  }`}
                                ></i>

                                <span className="approve-text">
                                  {isProcessing
                                    ? 'Processing...'
                                    : 'Approve'}
                                </span>
                              </button>
                            )}

                            <button
                              className="btn-sm btn-delete"
                              onClick={() =>
                                handleDeleteMember(
                                  member.id
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              title="Delete Member"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          ADD MEMBER MODAL
      ====================================================== */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowAddModal(false)
          }
        >
          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-plus"></i>{' '}
                Add New Member
              </h3>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form
              onSubmit={
                handleAddMember
              }
            >
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Full Name{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      formData.fullName
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Email{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={
                      formData.phone
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Troop Name
                  </label>

                  <input
                    type="text"
                    value={
                      formData.troopName
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        troopName:
                          e.target.value,
                      })
                    }
                    placeholder="e.g., COATI STOIQUE"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Province
                  </label>

                  <select
                    value={
                      formData.province
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        province:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select Province
                    </option>

                    <option value="Kigali City">
                      Kigali City
                    </option>

                    <option value="Northern Province">
                      Northern Province
                    </option>

                    <option value="Southern Province">
                      Southern Province
                    </option>

                    <option value="Eastern Province">
                      Eastern Province
                    </option>

                    <option value="Western Province">
                      Western Province
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    District
                  </label>

                  <select
                    value={
                      formData.district
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        district:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select District
                    </option>

                    {Array.isArray(
                      districts
                    ) &&
                    districts.length >
                      0 ? (
                      districts.map(
                        (district) => (
                          <option
                            key={
                              district.id ||
                              district.name
                            }
                            value={
                              district.name
                            }
                          >
                            {
                              district.name
                            }
                          </option>
                        )
                      )
                    ) : (
                      <option value="">
                        No districts
                        available
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Sector
                  </label>

                  <input
                    type="text"
                    value={
                      formData.sector
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sector:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Cell
                  </label>

                  <input
                    type="text"
                    value={
                      formData.cell
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cell:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Village
                  </label>

                  <input
                    type="text"
                    value={
                      formData.village
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        village:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Birth Date
                  </label>

                  <input
                    type="date"
                    value={
                      formData.birthDate
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        birthDate:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Gender
                  </label>

                  <select
                    value={
                      formData.gender
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    value={
                      formData.address
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setShowAddModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  <i className="fas fa-save"></i>{' '}
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          EDIT MEMBER MODAL
      ====================================================== */}
      {selectedMember && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedMember(null)
          }
        >
          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <h3>
                <i className="fas fa-edit"></i>{' '}
                Edit Member
              </h3>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedMember(
                    null
                  )
                }
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form
              onSubmit={
                handleUpdateMember
              }
            >
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Full Name{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      formData.fullName
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Email{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={
                      formData.phone
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Troop Name
                  </label>

                  <input
                    type="text"
                    value={
                      formData.troopName
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        troopName:
                          e.target.value,
                      })
                    }
                    placeholder="e.g., COATI STOIQUE"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Province
                  </label>

                  <select
                    value={
                      formData.province
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        province:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select Province
                    </option>

                    <option value="Kigali City">
                      Kigali City
                    </option>

                    <option value="Northern Province">
                      Northern Province
                    </option>

                    <option value="Southern Province">
                      Southern Province
                    </option>

                    <option value="Eastern Province">
                      Eastern Province
                    </option>

                    <option value="Western Province">
                      Western Province
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    District
                  </label>

                  <select
                    value={
                      formData.district
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        district:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select District
                    </option>

                    {Array.isArray(
                      districts
                    ) &&
                    districts.length >
                      0 ? (
                      districts.map(
                        (district) => (
                          <option
                            key={
                              district.id ||
                              district.name
                            }
                            value={
                              district.name
                            }
                          >
                            {
                              district.name
                            }
                          </option>
                        )
                      )
                    ) : (
                      <option value="">
                        No districts
                        available
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Sector
                  </label>

                  <input
                    type="text"
                    value={
                      formData.sector
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sector:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Cell
                  </label>

                  <input
                    type="text"
                    value={
                      formData.cell
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cell:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Village
                  </label>

                  <input
                    type="text"
                    value={
                      formData.village
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        village:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Birth Date
                  </label>

                  <input
                    type="date"
                    value={
                      formData.birthDate
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        birthDate:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Gender
                  </label>

                  <select
                    value={
                      formData.gender
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    value={
                      formData.address
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setSelectedMember(
                      null
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  <i className="fas fa-save"></i>{' '}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          SCOUT ID MODAL
      ====================================================== */}
      {showScoutIDModal &&
        scoutIDData && (
          <div
            className="modal-overlay scout-id-overlay"
            onClick={() =>
              setShowScoutIDModal(
                false
              )
            }
          >
            <div
              className="modal-content scout-id-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <h3>
                  <i
                    className="fas fa-id-card"
                    style={{
                      color: '#FFD100',
                    }}
                  ></i>{' '}
                  Scout ID Card
                </h3>

                <button
                  className="modal-close"
                  onClick={() =>
                    setShowScoutIDModal(
                      false
                    )
                  }
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div
                className={`scout-id-container ${
                  isFlipped
                    ? 'show-back'
                    : ''
                }`}
                style={{
                  padding: '20px',
                  background:
                    '#f5f0eb',
                  borderRadius:
                    '8px',
                }}
              >
                {/* ==================================================
                    FRONT CARD
                ================================================== */}
                <div
                  ref={
                    cardFrontRef
                  }
                  className="scout-id-front-card"
                  style={{
                    position:
                      'relative',
                    width: '100%',
                    aspectRatio:
                      '1.55 / 1',
                    borderRadius:
                      '6px',
                    overflow:
                      'hidden',
                    boxShadow:
                      '0 18px 40px rgba(0,0,0,.45)',
                    background:
                      '#fbfaf6',
                    padding: '11px',
                    marginBottom:
                      '20px',
                    border:
                      '11px solid #3d1e6d',
                    boxSizing:
                      'border-box',
                  }}
                >
                  {/* BORDER */}
                  <div
                    style={{
                      position:
                        'absolute',
                      inset: 0,
                      padding:
                        '11px',
                      borderRadius:
                        '6px',
                      background: `
                        repeating-linear-gradient(
                          45deg,
                          #3d1e6d 0 2px,
                          transparent 2px 8px
                        ),
                        repeating-linear-gradient(
                          -45deg,
                          #3d1e6d 0 2px,
                          transparent 2px 8px
                        )
                      `,
                      WebkitMask: `
                        linear-gradient(#fff 0 0) content-box,
                        linear-gradient(#fff 0 0)
                      `,
                      WebkitMaskComposite:
                        'xor',
                      maskComposite:
                        'exclude',
                      pointerEvents:
                        'none',
                      zIndex: 5,
                    }}
                  />

                  {/* INNER BORDER */}
                  <div
                    style={{
                      position:
                        'absolute',
                      top: '18px',
                      left: '18px',
                      right: '18px',
                      bottom: '18px',
                      border:
                        '2px dashed rgba(61, 30, 109, 0.4)',
                      borderRadius:
                        '4px',
                      pointerEvents:
                        'none',
                      zIndex: 4,
                    }}
                  />

                  {/* CORNERS */}
                  <div
                    style={{
                      position:
                        'absolute',
                      top: '22px',
                      left: '22px',
                      width: '24px',
                      height: '24px',
                      borderTop:
                        '3px solid #3d1e6d',
                      borderLeft:
                        '3px solid #3d1e6d',
                      opacity: 0.5,
                      pointerEvents:
                        'none',
                      zIndex: 4,
                    }}
                  />

                  <div
                    style={{
                      position:
                        'absolute',
                      top: '22px',
                      right: '22px',
                      width: '24px',
                      height: '24px',
                      borderTop:
                        '3px solid #3d1e6d',
                      borderRight:
                        '3px solid #3d1e6d',
                      opacity: 0.5,
                      pointerEvents:
                        'none',
                      zIndex: 4,
                    }}
                  />

                  <div
                    style={{
                      position:
                        'absolute',
                      bottom: '22px',
                      left: '22px',
                      width: '24px',
                      height: '24px',
                      borderBottom:
                        '3px solid #3d1e6d',
                      borderLeft:
                        '3px solid #3d1e6d',
                      opacity: 0.5,
                      pointerEvents:
                        'none',
                      zIndex: 4,
                    }}
                  />

                  <div
                    style={{
                      position:
                        'absolute',
                      bottom: '22px',
                      right: '22px',
                      width: '24px',
                      height: '24px',
                      borderBottom:
                        '3px solid #3d1e6d',
                      borderRight:
                        '3px solid #3d1e6d',
                      opacity: 0.5,
                      pointerEvents:
                        'none',
                      zIndex: 4,
                    }}
                  />

                  {/* FRONT LEFT */}
                  <div
                    style={{
                      position:
                        'relative',
                      padding:
                        '18px 16px 14px',
                      display:
                        'flex',
                      flexDirection:
                        'column',
                      borderRight:
                        '1px dashed #d8d3c5',
                      height:
                        '100%',
                      width:
                        '50%',
                      float: 'left',
                      boxSizing:
                        'border-box',
                    }}
                  >
                    <div
                      style={{
                        textAlign:
                          'center',
                        fontSize:
                          '10.5px',
                        lineHeight:
                          '1.35',
                        marginTop:
                          '4px',
                      }}
                    >
                      <div
                        style={{
                          fontWeight:
                            'bold',
                        }}
                      >
                        {user?.full_name ||
                          'National Commissioner'}
                      </div>

                      <div>
                        Komiseri Mukuru wa
                      </div>

                      <div>
                        RWANDA SCOUT ASSOCIATION
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop:
                          '6px',
                        alignSelf:
                          'center',
                        width: '70px',
                        height: '70px',
                        borderRadius:
                          '50%',
                        border:
                          '2px solid #2a4a8f',
                        color:
                          '#2a4a8f',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        fontSize: '6px',
                        textAlign:
                          'center',
                        transform:
                          'rotate(-8deg)',
                        opacity: 0.75,
                      }}
                    >
                      RWANDA SCOUTS
                      <br />
                      ASSOCIATION
                      <br />★
                    </div>

                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'flex-end',
                        gap: '2px',
                        marginTop:
                          'auto',
                        paddingTop:
                          '6px',
                      }}
                    >
                      {[1, 2, 3].map(
                        (item) => (
                          <div
                            key={item}
                            style={{
                              width:
                                '14px',
                              height:
                                '20px',
                              background:
                                'linear-gradient(#e8e0a0, #d8cf80)',
                              clipPath:
                                'polygon(50% 0%, 100% 100%, 0% 100%)',
                            }}
                          />
                        )
                      )}

                      <div
                        style={{
                          fontSize:
                            '11px',
                          fontWeight:
                            'bold',
                          color:
                            '#3d1e6d',
                          lineHeight:
                            1,
                          marginLeft:
                            '4px',
                        }}
                      >
                        Ubuskuti
                        <br />
                        Imbere Heza
                      </div>
                    </div>
                  </div>

                  {/* FRONT RIGHT */}
                  <div
                    style={{
                      position:
                        'relative',
                      padding:
                        '18px 16px 14px',
                      display:
                        'flex',
                      flexDirection:
                        'column',
                      height:
                        '100%',
                      width:
                        '50%',
                      float: 'left',
                      boxSizing:
                        'border-box',
                    }}
                  >
                    <div
                      style={{
                        textAlign:
                          'right',
                        fontSize: '9px',
                        lineHeight:
                          1.4,
                      }}
                    >
                      <div
                        style={{
                          fontWeight:
                            'bold',
                        }}
                      >
                        UMURYANGO W'ABASKUTI MU RWANDA
                      </div>

                      <div
                        style={{
                          fontWeight:
                            'bold',
                        }}
                      >
                        RWANDA SCOUT ASSOCIATION
                      </div>

                      <div>
                        (R.S.A)
                      </div>

                      <div>
                        P.O.Box : 775 Kigali -Rwanda
                      </div>

                      <div>
                        Tel: (+250) 784 669 246
                      </div>

                      <div>
                        Email: info@rwandascout.org
                      </div>
                    </div>

                    <div
                      style={{
                        background:
                          '#3d1e6d',
                        color:
                          '#fff',
                        textAlign:
                          'center',
                        fontWeight:
                          'bold',
                        fontSize:
                          '16px',
                        padding:
                          '6px 4px',
                        margin:
                          '8px 0',
                      }}
                    >
                      IKARITA Y'UMUSKUTI
                    </div>

                    <div
                      style={{
                        alignSelf:
                          'center',
                        width:
                          '64%',
                        aspectRatio:
                          '3/2',
                        border:
                          '2px solid #222',
                        display:
                          'flex',
                        flexDirection:
                          'column',
                        overflow:
                          'hidden',
                        marginTop:
                          '6px',
                        position:
                          'relative',
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          background:
                            '#2aa9e0',
                        }}
                      />

                      <div
                        style={{
                          flex: 1,
                          background:
                            '#f6d31e',
                        }}
                      />

                      <div
                        style={{
                          flex: 1,
                          background:
                            '#2f9e44',
                        }}
                      />

                      <div
                        style={{
                          position:
                            'absolute',
                          top: '50%',
                          left: '50%',
                          transform:
                            'translate(-50%, -50%)',
                          width:
                            '38%',
                          aspectRatio:
                            1,
                          background:
                            '#3d1e6d',
                          borderRadius:
                            '50%',
                          border:
                            '2px solid #fff',
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          color:
                            '#fff',
                          fontSize:
                            '6px',
                          textAlign:
                            'center',
                          fontWeight:
                            'bold',
                        }}
                      >
                        RWANDA
                        <br />
                        SCOUT
                      </div>
                    </div>

                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'flex-end',
                        gap: '2px',
                        marginTop:
                          '10px',
                      }}
                    >
                      {[1, 2, 3].map(
                        (item) => (
                          <div
                            key={item}
                            style={{
                              width:
                                '14px',
                              height:
                                '20px',
                              background:
                                'linear-gradient(#e8e0a0, #d8cf80)',
                              clipPath:
                                'polygon(50% 0%, 100% 100%, 0% 100%)',
                            }}
                          />
                        )
                      )}

                      <div
                        style={{
                          fontSize:
                            '11px',
                          fontWeight:
                            'bold',
                          color:
                            '#3d1e6d',
                          lineHeight:
                            1,
                          marginLeft:
                            '4px',
                        }}
                      >
                        Ubuskuti
                        <br />
                        Imbere Heza
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    BACK CARD
                ================================================== */}
                <div
                  ref={cardBackRef}
                  className="scout-id-back-card"
                  style={{
                    position:
                      'relative',
                    width: '100%',
                    aspectRatio:
                      '1.55 / 1',
                    borderRadius:
                      '6px',
                    overflow:
                      'hidden',
                    boxShadow:
                      '0 18px 40px rgba(0,0,0,.45)',
                    background:
                      '#fbfaf6',
                    padding: '11px',
                    border:
                      '11px solid #3d1e6d',
                    boxSizing:
                      'border-box',
                  }}
                >
                  <div
                    style={{
                      position:
                        'absolute',
                      inset: 0,
                      padding:
                        '11px',
                      borderRadius:
                        '6px',
                      background: `
                        repeating-linear-gradient(
                          45deg,
                          #3d1e6d 0 2px,
                          transparent 2px 8px
                        ),
                        repeating-linear-gradient(
                          -45deg,
                          #3d1e6d 0 2px,
                          transparent 2px 8px
                        )
                      `,
                      WebkitMask: `
                        linear-gradient(#fff 0 0) content-box,
                        linear-gradient(#fff 0 0)
                      `,
                      WebkitMaskComposite:
                        'xor',
                      maskComposite:
                        'exclude',
                      pointerEvents:
                        'none',
                      zIndex: 5,
                    }}
                  />

                  <div
                    style={{
                      position:
                        'absolute',
                      top: '18px',
                      left: '18px',
                      right: '18px',
                      bottom: '18px',
                      border:
                        '2px dashed rgba(61, 30, 109, 0.4)',
                      borderRadius:
                        '4px',
                      pointerEvents:
                        'none',
                      zIndex: 4,
                    }}
                  />

                  <div
                    style={{
                      position:
                        'relative',
                      padding:
                        '18px 16px 14px',
                      display:
                        'flex',
                      flexDirection:
                        'column',
                      borderRight:
                        '1px dashed #d8d3c5',
                      height:
                        '100%',
                      width:
                        '50%',
                      float: 'left',
                      boxSizing:
                        'border-box',
                    }}
                  >
                    {/* PHOTO */}
                    <div
                      style={{
                        alignSelf:
                          'center',
                        width: '90px',
                        height: '90px',
                        borderRadius:
                          '50%',
                        overflow:
                          'hidden',
                        border:
                          '3px solid #FFD100',
                        margin:
                          '0 auto 12px',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        background:
                          '#f0e8d0',
                        boxShadow:
                          '0 4px 12px rgba(0,43,92,0.2)',
                        flexShrink: 0,
                      }}
                    >
                      {scoutIDData.profile_image ||
                      scoutIDData.profileImage ||
                      scoutIDData.photo ? (
                        <img
                          src={getPhotoUrl(
                            scoutIDData
                          )}
                          alt={
                            scoutIDData.fullName
                          }
                          style={{
                            width:
                              '100%',
                            height:
                              '100%',
                            objectFit:
                              'cover',
                            borderRadius:
                              '50%',
                          }}
                          onError={(
                            e
                          ) => {
                            e.currentTarget.style.display =
                              'none';

                            const parent =
                              e
                                .currentTarget
                                .parentElement;

                            if (
                              parent
                            ) {
                              parent.innerHTML = '';

                              const fallback =
                                document.createElement(
                                  'div'
                                );

                              fallback.style.cssText =
                                `
                                  display:flex;
                                  align-items:center;
                                  justify-content:center;
                                  width:100%;
                                  height:100%;
                                  font-size:36px;
                                  font-weight:bold;
                                  color:#3d1e6d;
                                  background:linear-gradient(135deg,#f0e8d0,#d8cfb0);
                                  border-radius:50%;
                                `;

                              fallback.textContent =
                                scoutIDData.fullName?.charAt(
                                  0
                                ) ||
                                'S';

                              parent.appendChild(
                                fallback
                              );
                            }
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            width:
                              '100%',
                            height:
                              '100%',
                            fontSize:
                              '36px',
                            fontWeight:
                              'bold',
                            color:
                              '#3d1e6d',
                            background:
                              'linear-gradient(135deg, #f0e8d0, #d8cfb0)',
                            borderRadius:
                              '50%',
                          }}
                        >
                          {scoutIDData.fullName?.charAt(
                            0
                          ) ||
                            scoutIDData.name?.charAt(
                              0
                            ) ||
                            'S'}
                        </div>
                      )}
                    </div>

                    {[
                      [
                        'Izina',
                        scoutIDData.fullName ||
                          scoutIDData.name ||
                          'N/A',
                      ],
                      [
                        "Irindi z'ina",
                        scoutIDData.middleName ||
                          '',
                      ],
                      [
                        'Intara',
                        scoutIDData.province ||
                          'N/A',
                      ],
                      [
                        'Akarere',
                        scoutIDData.district ||
                          'N/A',
                      ],
                      [
                        'Umurenge',
                        scoutIDData.sector ||
                          'N/A',
                      ],
                      [
                        'Akagari',
                        scoutIDData.cell ||
                          'N/A',
                      ],
                    ].map(
                      ([label, value]) => (
                        <div
                          key={label}
                          style={{
                            display:
                              'flex',
                            gap: '4px',
                            fontSize:
                              '10.5px',
                            marginBottom:
                              '3px',
                            borderBottom:
                              '1px dotted #999',
                            paddingBottom:
                              '1px',
                          }}
                        >
                          <span
                            style={{
                              fontWeight:
                                'bold',
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {label}
                          </span>

                          <span>
                            {value}
                          </span>
                        </div>
                      )
                    )}

                    <div
                      style={{
                        fontSize:
                          '10px',
                        marginTop:
                          '2px',
                      }}
                    >
                      <strong>
                        Itariki y'amavuko:
                      </strong>{' '}
                      {scoutIDData.birthDate ||
                        'N/A'}
                    </div>

                    <div
                      style={{
                        fontSize:
                          '10.5px',
                        marginTop:
                          '10px',
                      }}
                    >
                      <span
                        style={{
                          fontWeight:
                            'bold',
                        }}
                      >
                        Izina ry' Umutwe:
                      </span>{' '}
                      <span
                        style={{
                          fontWeight:
                            'bold',
                          textDecoration:
                            'underline',
                        }}
                      >
                        {scoutIDData.troopName ||
                          scoutIDData.troop_name ||
                          '—'}
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          'flex',
                        gap: '4px',
                        fontSize:
                          '10.5px',
                        marginBottom:
                          '3px',
                        borderBottom:
                          '1px dotted #999',
                        paddingBottom:
                          '1px',
                        marginTop:
                          '6px',
                      }}
                    >
                      <span
                        style={{
                          fontWeight:
                            'bold',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        Inteko (Group):
                      </span>

                      <span>
                        {scoutIDData.group ||
                          ''}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      position:
                        'relative',
                      padding:
                        '18px 16px 14px',
                      display:
                        'flex',
                      flexDirection:
                        'column',
                      height:
                        '100%',
                      width:
                        '50%',
                      float: 'left',
                      boxSizing:
                        'border-box',
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          '10.5px',
                        marginBottom:
                          '10px',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontWeight:
                              'bold',
                          }}
                        >
                          Ikigero:
                        </span>{' '}
                        INGENZI
                      </div>

                      <div>
                        <span
                          style={{
                            fontWeight:
                              'bold',
                          }}
                        >
                          N°:
                        </span>{' '}
                        {scoutIDData.sin ||
                          'N/A'}
                      </div>
                    </div>

                    <table
                      style={{
                        width:
                          '100%',
                        borderCollapse:
                          'collapse',
                        fontSize:
                          '9.5px',
                        marginTop:
                          '2px',
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              border:
                                '1px solid #333',
                              padding:
                                '4px 2px',
                              textAlign:
                                'center',
                              background:
                                '#eee',
                              fontSize:
                                '8.5px',
                            }}
                          >
                            UMWAKA
                          </th>

                          <th
                            style={{
                              border:
                                '1px solid #333',
                              padding:
                                '4px 2px',
                              textAlign:
                                'center',
                              background:
                                '#eee',
                              fontSize:
                                '8.5px',
                            }}
                          >
                            YATANZE UMUSANZU
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td
                            style={{
                              border:
                                '1px solid #333',
                              padding:
                                '4px 2px',
                              textAlign:
                                'center',
                            }}
                          >
                            2025
                          </td>

                          <td
                            style={{
                              border:
                                '1px solid #333',
                              padding:
                                '4px 2px',
                              textAlign:
                                'center',
                              height:
                                '40px',
                            }}
                          >
                            <div className="small-stamp">
                              RWANDA SCOUTS
                              <br />
                              ASSOCIATION
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{
                              border:
                                '1px solid #333',
                              padding:
                                '4px 2px',
                              textAlign:
                                'center',
                            }}
                          >
                            2026
                          </td>

                          <td
                            style={{
                              border:
                                '1px solid #333',
                              padding:
                                '4px 2px',
                              textAlign:
                                'center',
                              height:
                                '40px',
                            }}
                          >
                            <div className="small-stamp">
                              RWANDA SCOUTS
                              <br />
                              ASSOCIATION ·{' '}
                              {(
                                scoutIDData.district ||
                                'KAYONZA'
                              ).toUpperCase()}
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{
                              border:
                                '1px solid #333',
                              padding:
                                '4px 2px',
                              textAlign:
                                'center',
                            }}
                          >
                            20……
                          </td>

                          <td
                            style={{
                              border:
                                '1px solid #333',
                              padding:
                                '4px 2px',
                              textAlign:
                                'center',
                              height:
                                '40px',
                            }}
                          ></td>
                        </tr>
                      </tbody>
                    </table>

                    {/* QR */}
                    <div
                      style={{
                        marginTop:
                          '8px',
                        display:
                          'flex',
                        flexDirection:
                          'column',
                        alignItems:
                          'center',
                      }}
                    >
                      <div
                        style={{
                          background:
                            'white',
                          padding:
                            '4px',
                          borderRadius:
                            '4px',
                          display:
                            'inline-block',
                          boxShadow:
                            '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        <QRCodeCanvas
                          value={generateQRData(
                            scoutIDData
                          )}
                          size={80}
                          level="H"
                          includeMargin={
                            true
                          }
                          bgColor="#ffffff"
                          fgColor="#002B5C"
                        />
                      </div>

                      <div
                        style={{
                          fontSize:
                            '6px',
                          color:
                            '#666',
                          marginTop:
                            '2px',
                          letterSpacing:
                            '1px',
                          textTransform:
                            'uppercase',
                          fontWeight:
                            'bold',
                        }}
                      >
                        Scan to Verify
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="flip-hint"
                  onClick={
                    toggleFlip
                  }
                >
                  {isFlipped
                    ? '👆 Kanda kugira ngo usubire ku ipaji ya mbere'
                    : '👆 Kanda ku ikarita kugira ngo uyihindure'}
                </div>
              </div>

              {/* SCOUT ID ACTIONS */}
              <div className="form-actions scout-id-actions">
                <button
                  className="btn-primary"
                  onClick={
                    downloadPDF
                  }
                  disabled={
                    downloadingPDF
                  }
                >
                  <i
                    className={`fas ${
                      downloadingPDF
                        ? 'fa-spinner fa-spin'
                        : 'fa-download'
                    }`}
                  ></i>{' '}
                  {downloadingPDF
                    ? 'Generating...'
                    : 'Download PDF'}
                </button>

                <button
                  className="btn-success"
                  onClick={
                    sendPDFToEmail
                  }
                  disabled={
                    sendingEmail
                  }
                >
                  <i
                    className={`fas ${
                      sendingEmail
                        ? 'fa-spinner fa-spin'
                        : 'fa-envelope'
                    }`}
                  ></i>{' '}
                  {sendingEmail
                    ? 'Sending...'
                    : 'Send to Email'}
                </button>

                <button
                  className="btn-secondary"
                  onClick={() =>
                    setShowScoutIDModal(
                      false
                    )
                  }
                >
                  <i className="fas fa-times"></i>{' '}
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ======================================================
          STYLES
      ====================================================== */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          overflow-x: hidden;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .page-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1a1a1a;
          line-height: 1.3;
        }

        .page-header p {
          margin: 4px 0 0;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-primary,
        .btn-secondary,
        .btn-success {
          min-height: 38px;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          white-space: nowrap;
        }

        .btn-primary {
          background: #ffd100;
          color: #1a1a1a;
        }

        .btn-primary:hover {
          background: #f5c800;
          transform: translateY(-1px);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled,
        .btn-success:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-success {
          background: #16a34a;
          color: white;
        }

        .btn-success:hover {
          background: #15803d;
          transform: translateY(-1px);
        }

        /* ======================================================
           SEARCH
        ====================================================== */

        .search-filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          flex: 1 1 280px;
          min-width: 200px;
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0 12px;
          min-height: 40px;
        }

        .search-box i {
          color: #6b7280;
          flex-shrink: 0;
        }

        .search-box input {
          border: none;
          padding: 8px 10px;
          width: 100%;
          min-width: 0;
          outline: none;
          font-size: 14px;
          background: transparent;
        }

        .filter-box {
          flex: 0 1 auto;
        }

        .filter-box select {
          min-height: 40px;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          min-width: 150px;
          max-width: 100%;
        }

        .stats-info {
          color: #6b7280;
          font-size: 14px;
          margin-left: auto;
          white-space: nowrap;
        }

        /* ======================================================
           TABLE RESPONSIVENESS
        ====================================================== */

        .table-scroll-hint {
          display: none;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 6px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          color: #64748b;
          font-size: 12px;
        }

        .members-table-wrapper {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          border-radius: 8px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #f1f5f9;
        }

        .members-table-wrapper::-webkit-scrollbar {
          height: 10px;
        }

        .members-table-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .members-table-wrapper::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }

        .members-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        .members-table-inner {
          width: max-content;
          min-width: 100%;
        }

        .data-table {
          width: max-content;
          min-width: 1500px;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 13px;
          background: white;
        }

        .data-table thead {
          background: #002b5c;
          color: white;
        }

        .data-table th {
          padding: 11px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          white-space: nowrap;
          border-bottom: 1px solid #001d40;
        }

        .data-table td {
          padding: 9px 12px;
          border-bottom: 1px solid #f3f4f6;
          white-space: nowrap;
          vertical-align: middle;
          background: white;
        }

        .data-table tbody tr:hover td {
          background: #f9fafb;
        }

        .data-table tbody tr:last-child td {
          border-bottom: none;
        }

        .photo-cell {
          width: 64px;
          min-width: 64px;
        }

        .member-photo,
        .photo-fallback {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ffd100;
        }

        .photo-fallback {
          background: #002b5c;
          color: #ffd100;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }

        .name-cell {
          min-width: 150px;
          font-weight: 500;
        }

        .email-cell {
          min-width: 210px;
        }

        .status-badge,
        .payment-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .badge-approved {
          background: #dcfce7;
          color: #166534;
        }

        .badge-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-rejected {
          background: #fecaca;
          color: #991b1b;
        }

        .badge-default {
          background: #f3f4f6;
          color: #374151;
        }

        .payment-paid {
          background: #dcfce7;
          color: #166534;
        }

        .payment-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .payment-unpaid {
          background: #fecaca;
          color: #991b1b;
        }

        .payment-default {
          background: #f3f4f6;
          color: #374151;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: nowrap;
          min-width: max-content;
        }

        .btn-sm {
          min-width: 32px;
          min-height: 30px;
          padding: 5px 8px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          white-space: nowrap;
        }

        .btn-sm:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-sm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-edit {
          background: #dbeafe;
          color: #1e40af;
        }

        .btn-edit:hover:not(:disabled) {
          background: #bfdbfe;
        }

        .btn-toggle {
          background: #fef3c7;
          color: #92400e;
        }

        .btn-toggle:hover:not(:disabled) {
          background: #fde68a;
        }

        .btn-generate {
          background: #d1fae5;
          color: #065f46;
        }

        .btn-generate:hover:not(:disabled) {
          background: #a7f3d0;
        }

        .btn-approve-payment {
          background: #ede9fe;
          color: #5b21b6;
        }

        .btn-approve-payment:hover:not(:disabled) {
          background: #ddd6fe;
        }

        .btn-delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-delete:hover:not(:disabled) {
          background: #fecaca;
        }

        .btn-id-card {
          background: #fef3c7;
          color: #92400e;
        }

        .btn-id-card:hover {
          background: #fde68a;
        }

        .text-center {
          text-align: center;
        }

        .text-muted {
          color: #999;
          font-size: 11px;
        }

        /* ======================================================
           MODALS
        ====================================================== */

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          overflow-y: auto;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .scout-id-modal {
          max-width: 720px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          flex-shrink: 0;
        }

        .modal-close:hover {
          color: #374151;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 0 24px;
        }

        .form-group {
          margin-bottom: 16px;
          min-width: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          font-size: 13px;
          color: #374151;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          min-width: 0;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #ffd100;
          box-shadow: 0 0 0 3px rgba(255, 209, 0, 0.2);
        }

        .required {
          color: #ef4444;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }

        .scout-id-actions {
          justify-content: center;
        }

        /* ======================================================
           ALERTS
        ====================================================== */

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .alert i {
          font-size: 20px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .alert p {
          margin: 4px 0 0;
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #065f46;
        }

        /* ======================================================
           LOADING
        ====================================================== */

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 20px;
          text-align: center;
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #ffd100;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        /* ======================================================
           SCOUT ID
        ====================================================== */

        .scout-id-container {
          overflow: hidden;
        }

        .scout-id-back-card {
          margin-top: 20px;
        }

        .small-stamp {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1.6px solid #2a4a8f;
          color: #2a4a8f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4.3px;
          margin: 0 auto;
          text-align: center;
          line-height: 1.05;
          transform: rotate(-6deg);
          opacity: 0.7;
        }

        .flip-hint {
          text-align: center;
          color: #999;
          font-size: 12px;
          margin-top: 10px;
          cursor: pointer;
          user-select: none;
        }

        .flip-hint:hover {
          color: #3d1e6d;
        }

        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 900px) {
          .dashboard-container {
            padding: 16px;
          }

          .table-scroll-hint {
            display: flex;
          }

          .stats-info {
            margin-left: 0;
          }
        }

        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 12px;
          }

          .page-header {
            margin-bottom: 18px;
          }

          .page-header h2 {
            font-size: 20px;
          }

          .page-header p {
            font-size: 13px;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1 1 auto;
          }

          .search-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box,
          .filter-box,
          .filter-box select {
            width: 100%;
            min-width: 0;
          }

          .stats-info {
            margin-left: 0;
          }

          .table-scroll-hint {
            font-size: 11px;
          }

          .members-table-wrapper {
            border-radius: 6px;
          }

          .data-table {
            min-width: 1500px;
            font-size: 12px;
          }

          .data-table th,
          .data-table td {
            padding: 8px 10px;
          }

          .modal-overlay {
            padding: 10px;
            align-items: flex-start;
          }

          .modal-content {
            max-height: calc(100vh - 20px);
            margin: auto 0;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 0 16px;
          }

          .form-actions {
            padding: 14px 16px;
          }

          .scout-id-modal {
            max-width: 100%;
          }

          .scout-id-container {
            padding: 10px !important;
          }

          .scout-id-front-card,
          .scout-id-back-card {
            min-width: 0 !important;
          }
        }

        /* ======================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 8px;
          }

          .page-header h2 {
            font-size: 18px;
          }

          .header-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .header-actions button:last-child {
            grid-column: 1 / -1;
          }

          .btn-primary,
          .btn-secondary,
          .btn-success {
            font-size: 12px;
            padding: 8px 10px;
          }

          .data-table {
            min-width: 1500px;
            font-size: 11px;
          }

          .data-table th,
          .data-table td {
            padding: 7px 9px;
          }

          .btn-sm {
            min-width: 30px;
            min-height: 30px;
            padding: 5px 7px;
            font-size: 11px;
          }

          .approve-text {
            display: none;
          }

          .scout-id-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .scout-id-actions button {
            width: 100%;
          }
        }

        /* ======================================================
           VERY SMALL DEVICES
        ====================================================== */

        @media (max-width: 360px) {
          .dashboard-container {
            padding: 6px;
          }

          .header-actions {
            grid-template-columns: 1fr;
          }

          .header-actions button:last-child {
            grid-column: auto;
          }

          .table-scroll-hint {
            font-size: 10px;
          }
        }

        /* ======================================================
           PRINT
        ====================================================== */

        @media print {
          .flip-hint,
          .table-scroll-hint,
          .header-actions,
          .search-filter-bar,
          .alert,
          .action-buttons {
            display: none !important;
          }

          .members-table-wrapper {
            overflow: visible !important;
            box-shadow: none !important;
          }

          .data-table {
            min-width: 0 !important;
            width: 100% !important;
            font-size: 9px;
          }

          .data-table th,
          .data-table td {
            padding: 5px;
          }

          .modal-overlay {
            position: static;
            background: transparent;
            padding: 0;
          }

          .scout-id-booklet {
            cursor: default !important;
          }

          .scout-id-booklet.flipped {
            transform: rotateY(0deg) !important;
          }

          .scout-id-face.back {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageMembers;