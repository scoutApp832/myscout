import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Scout Color Scheme
const SCOUT_COLORS = {
  purple: '#4B2E83',
  green: '#2E7D32',
  khaki: '#C2B280',
  gold: '#FFC107',
  white: '#FFFFFF',
  darkBlue: '#0D47A1',
  red: '#D32F2F'
};

// QR Code Library (using a simple QR code API)
const QR_API_URL = 'https://api.qrserver.com/v1/create-qr-code/';

const PaymentSystem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ============================================
  // STATE
  // ============================================
  const [selectedAction, setSelectedAction] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(''); // ✅ Store ID as number
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentFile, setPaymentFile] = useState(null);
  const [status, setStatus] = useState('Loading payment services...');
  const [receiptData, setReceiptData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  
  // ✅ DATA FROM DATABASE
  const [paymentServices, setPaymentServices] = useState([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [filteredPaymentMethods, setFilteredPaymentMethods] = useState([]);
  const [accountDetailsData, setAccountDetailsData] = useState({});

  // ============================================
  // FETCH DATA FROM DATABASE
  // ============================================
  useEffect(() => {
    if (user) {
      setUserRole(user.role || 'scout');
      setUserDistrict(user?.member?.district || user?.district || 'N/A');
      fetchPaymentServices();
      fetchPaymentMethods();
      fetchPaymentHistory();
      generateReferenceNumber();
      generateInvoiceNumber();
    }
  }, [user]);

  // ✅ When payment methods change, re-filter if a service is selected
  useEffect(() => {
    if (selectedAction && paymentMethodsData.length > 0) {
      filterPaymentMethods(selectedAction);
    }
  }, [paymentMethodsData]);

  // ✅ Generate Reference Number
  const generateReferenceNumber = () => {
    const prefix = userRole === 'donor' ? 'DON' : 'MSR';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const ref = `${prefix}-PAY-${timestamp}-${random}`;
    setReferenceNumber(ref);
    return ref;
  };

  // ✅ Generate Invoice Number
  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const inv = `INV-${timestamp}-${random}`;
    setInvoiceNumber(inv);
    return inv;
  };

  // ✅ Generate Verification URL
  const generateVerificationUrl = (reference) => {
    const baseUrl = process.env.REACT_APP_VERIFY_URL || 'https://msr.rw/verify';
    return `${baseUrl}/${reference}`;
  };

  // ✅ Generate QR Code URL
  const generateQRCodeUrl = (reference) => {
    const verificationUrl = generateVerificationUrl(reference);
    return `${QR_API_URL}?size=200x200&data=${encodeURIComponent(verificationUrl)}&format=png&bgcolor=ffffff&color=4B2E83`;
  };

  // ✅ Fetch Payment Services from Database
  const fetchPaymentServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Payment services response:', response.data);
      
      if (response.data?.success) {
        const processedServices = (response.data.services || []).map(service => {
          // If it's an event
          if (service.is_event === true) {
            return {
              ...service,
              amount: parseFloat(service.amount) || 0
            };
          }
          
          // Check if it's a custom amount service
          const isCustomAmount = service.is_custom_amount || 
                                service.price === 0 || 
                                service.amount === 0 ||
                                service.name?.toLowerCase().includes('custom') ||
                                service.name?.toLowerCase().includes('membership');
          
          const isDonation = service.category === 'donation' || 
                            service.name?.toLowerCase().includes('donation');
          
          return {
            ...service,
            is_event: false,
            is_fixed: true,
            is_custom_amount: isCustomAmount,
            is_donation: isDonation,
            service_level: service.service_level || service.level || 'National',
            amount: parseFloat(service.amount || service.price) || 0
          };
        });
        
        setPaymentServices(processedServices);
        setStatus(`✅ ${processedServices.length} services loaded`);
        console.log('✅ Total services loaded:', processedServices.length);
      } else {
        const defaultServices = [
          {
            id: 'membership-fee',
            name: 'Annual Scout Membership Fee',
            description: 'Annual membership subscription - Enter your contribution amount',
            amount: 0,
            category: 'membership',
            service_level: 'National',
            is_active: true,
            is_fixed: true,
            is_event: false,
            is_custom_amount: true,
            is_donation: false,
            icon: 'fa-id-card',
            color: SCOUT_COLORS.gold
          },
          {
            id: 'donation',
            name: 'Donation to RSA',
            description: 'Support Rwanda Scouts Association with a donation',
            amount: 0,
            category: 'donation',
            service_level: 'National',
            is_active: true,
            is_fixed: false,
            is_donation: true,
            is_custom_amount: true,
            is_event: false,
            icon: 'fa-hand-holding-heart',
            color: SCOUT_COLORS.purple
          }
        ];
        setPaymentServices(defaultServices);
        setStatus('Select a payment service below');
      }
    } catch (err) {
      console.error('❌ Error fetching payment services:', err);
      const defaultServices = [
        {
          id: 'membership-fee',
          name: 'Annual Scout Membership Fee',
          description: 'Annual membership subscription - Enter your contribution amount',
          amount: 0,
          category: 'membership',
          service_level: 'National',
          is_active: true,
          is_fixed: true,
          is_event: false,
          is_custom_amount: true,
          is_donation: false,
          icon: 'fa-id-card',
          color: SCOUT_COLORS.gold
        },
        {
          id: 'donation',
          name: 'Donation to RSA',
          description: 'Support Rwanda Scouts Association with a donation',
          amount: 0,
          category: 'donation',
          service_level: 'National',
          is_active: true,
          is_fixed: false,
          is_donation: true,
          is_custom_amount: true,
          is_event: false,
          icon: 'fa-hand-holding-heart',
          color: SCOUT_COLORS.purple
        }
      ];
      setPaymentServices(defaultServices);
      setStatus('Select a payment service below');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Payment Methods from Database
  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success && response.data.methods?.length > 0) {
        const methods = response.data.methods;
        setPaymentMethodsData(methods);
        setFilteredPaymentMethods(methods);
        
        // ✅ Use id as key
        const details = {};
        methods.forEach(method => {
          details[method.id] = {
            bank: method.bank_name,
            holder: method.account_holder,
            account: method.account_number,
            swift: method.swift_code,
            branch: method.branch,
            provider: method.provider,
            number: method.phone_number,
            code: method.ussd_code,
            displayName: method.display_name || method.name,
            name: method.name,
            district: method.district,
            is_active: method.is_active
          };
        });
        setAccountDetailsData(details);
        console.log('✅ Payment methods loaded:', methods.length);
      } else {
        setPaymentMethodsData([]);
        setFilteredPaymentMethods([]);
        setAccountDetailsData({});
        setError('No payment methods available. Please contact administrator.');
      }
    } catch (err) {
      console.error('❌ Error fetching payment methods:', err);
      setPaymentMethodsData([]);
      setFilteredPaymentMethods([]);
      setAccountDetailsData({});
      setError('Failed to load payment methods. Please contact administrator.');
    }
  };

  // ✅ Fetch Payment History from Database
  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setPaymentHistory(response.data.payments || []);
        if (response.data.payments?.length > 0) {
          setShowHistory(true);
        }
        console.log('✅ Payment history loaded:', response.data.payments?.length || 0);
      }
    } catch (err) {
      console.error('❌ Error fetching payment history:', err);
    }
  };

  // ============================================
  // FILTER PAYMENT METHODS BASED ON SELECTED ACTION
  // ============================================
  const filterPaymentMethods = (action) => {
    if (!action || !paymentMethodsData.length) {
      setFilteredPaymentMethods(paymentMethodsData);
      return;
    }

    const isDistrictEvent = action.is_event === true && action.service_level?.toLowerCase() === 'district';
    const isNationalService = action.is_event === false || action.service_level?.toLowerCase() === 'national';

    let filtered = [];
    
    if (isDistrictEvent) {
      // ✅ For District events: Only show district payment methods
      filtered = paymentMethodsData.filter(method => 
        method.district && 
        method.district !== 'all' && 
        method.district !== 'national' && 
        method.district !== '' &&
        method.is_active === true
      );
      console.log('📊 Filtered for District event:', filtered.length);
    } else if (isNationalService) {
      // ✅ For National services/events: Only show national payment methods
      filtered = paymentMethodsData.filter(method => 
        (method.district === 'all' || method.district === 'national' || method.district === '' || method.district === null) &&
        method.is_active === true
      );
      console.log('📊 Filtered for National service:', filtered.length);
    } else {
      // Fallback: show all active methods
      filtered = paymentMethodsData.filter(m => m.is_active === true);
    }

    setFilteredPaymentMethods(filtered);
    
    // Clear selected payment method if it's not in the filtered list
    if (paymentMethod && !filtered.some(m => m.id === parseInt(paymentMethod))) {
      setPaymentMethod('');
    }
  };

  // ============================================
  // GET MEMBER INFO
  // ============================================
  const getMemberInfo = () => {
    const sin = user?.member?.sin || user?.sin || 'N/A';
    const district = user?.member?.district || user?.district || 'N/A';
    const unit = user?.member?.troop_name || user?.member?.unit || 'N/A';
    const firstName = user?.member?.first_name || '';
    const lastName = user?.member?.last_name || '';
    const fullName = user?.full_name || `${firstName} ${lastName}`.trim() || 'N/A';
    
    return {
      name: fullName,
      sin: sin,
      district: district,
      unit: unit,
      email: user?.email || 'N/A',
      phone: user?.phone || 'N/A',
      role: userRole || 'scout',
      userId: user?.id,
      memberId: user?.member?.id,
      firstName: firstName,
      lastName: lastName
    };
  };

  // ============================================
  // ROLE-BASED FILTERING
  // ============================================
  const getAvailableActions = () => {
    if (!paymentServices.length) return [];
    
    return paymentServices.filter(action => {
      if (userRole === 'donor') {
        return action.category === 'donation' || 
               action.category === 'fundraising' ||
               action.category === 'community';
      }
      return true;
    });
  };

  const availableActions = getAvailableActions();
  const nationalActions = availableActions.filter(action => {
    const level = action.service_level?.toLowerCase() || '';
    return level === 'national' || 
           action.is_event === false ||
           action.is_fixed === true ||
           action.id === 'membership-fee' || 
           action.id === 'donation';
  });

  const districtActions = availableActions.filter(action => {
    const level = action.service_level?.toLowerCase() || '';
    return level === 'district' && action.is_event === true;
  });

  // ============================================
  // INVOICE GENERATION WITH QR CODE - A4 TWO COLUMN
  // ============================================

  // ✅ Generate Invoice HTML with QR Code - A4 Two Column Format
  const generateInvoiceHTML = (payment, member) => {
    const isApproved = payment.status?.toLowerCase() === 'approved' || 
                       payment.status?.toLowerCase() === 'completed';
    
    const verificationUrl = generateVerificationUrl(payment.reference);
    const qrCodeUrl = generateQRCodeUrl(payment.reference);
    const currentDate = new Date().toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${payment.invoice}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', 'Helvetica', sans-serif; background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
          .invoice-container { width: 210mm; min-height: 297mm; background: white; padding: 12mm 15mm; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 4px; position: relative; }
          .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4B2E83; padding-bottom: 12px; margin-bottom: 16px; }
          .header-left .logo { font-size: 22px; font-weight: bold; color: #4B2E83; }
          .header-left .logo span { color: #FFC107; }
          .header-left .subtitle { font-size: 11px; color: #666; }
          .header-right { text-align: right; }
          .status-badge { display: inline-block; padding: 4px 16px; border-radius: 16px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; ${isApproved ? 'background: #d1fae5; color: #065f46; border: 2px solid #065f46;' : 'background: #fef3c7; color: #92400e; border: 2px solid #92400e;'} }
          .header-right .invoice-label { font-size: 16px; font-weight: bold; color: #4B2E83; margin-top: 4px; }
          .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 12px 0; }
          .col { padding: 10px 14px; background: #faf8ff; border-radius: 6px; border-left: 3px solid #4B2E83; }
          .col h4 { color: #4B2E83; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 700; }
          .col .row { display: flex; padding: 2px 0; font-size: 12px; }
          .col .row .label { width: 80px; font-weight: 600; color: #555; flex-shrink: 0; font-size: 11px; }
          .col .row .value { flex: 1; color: #222; font-size: 12px; font-weight: 500; }
          .col .row .value.mono { font-family: 'Courier New', monospace; font-size: 11px; color: #4B2E83; }
          .payment-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .payment-table th { background: #4B2E83; color: white; padding: 6px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .payment-table td { padding: 6px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .payment-table tr:nth-child(even) { background: #faf8ff; }
          .payment-table .total-row td { padding: 8px 12px; border-top: 2px solid #4B2E83; background: #f8f4ff; font-weight: bold; font-size: 14px; }
          .payment-table .total-row .total-label { text-align: right; color: #4B2E83; }
          .payment-table .total-row .total-amount { color: #4B2E83; font-size: 16px; }
          .qr-section { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; padding: 12px 16px; background: #f8f4ff; border-radius: 6px; border: 2px dashed #4B2E83; gap: 20px; }
          .qr-code-container { text-align: center; flex-shrink: 0; }
          .qr-code-container img { width: 100px; height: 100px; border: 2px solid #4B2E83; border-radius: 6px; padding: 4px; background: white; }
          .qr-code-container .qr-label { font-size: 9px; color: #666; margin-top: 2px; }
          .qr-info { flex: 1; }
          .qr-info h4 { color: #4B2E83; font-size: 13px; font-weight: 700; margin: 0 0 4px 0; }
          .qr-info p { margin: 2px 0; font-size: 11px; color: #555; line-height: 1.4; }
          .qr-info .verification-link { font-size: 10px; color: #4B2E83; word-break: break-all; background: white; padding: 3px 8px; border-radius: 3px; border: 1px solid #e5e7eb; font-family: 'Courier New', monospace; display: inline-block; margin-top: 4px; }
          .verification-banner { margin: 10px 0; padding: 10px; border-radius: 6px; text-align: center; ${isApproved ? 'background: #d1fae5; border: 2px solid #065f46;' : 'background: #fef3c7; border: 2px solid #92400e;'} }
          .verification-banner .status-text { font-size: 16px; font-weight: 700; ${isApproved ? 'color: #065f46;' : 'color: #92400e;'} letter-spacing: 0.5px; }
          .verification-banner .status-sub { font-size: 11px; ${isApproved ? 'color: #065f46;' : 'color: #92400e;'} }
          .invoice-footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #999; }
          .invoice-footer p { margin: 2px 0; }
          .invoice-footer .footer-links { display: flex; justify-content: center; gap: 16px; margin-top: 4px; font-size: 10px; }
          .invoice-footer .footer-links a { color: #4B2E83; text-decoration: none; }
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(75, 46, 131, 0.03); font-weight: bold; pointer-events: none; z-index: 0; letter-spacing: 20px; }
          @media print { body { background: white; padding: 0; margin: 0; } .invoice-container { width: 100%; min-height: 100vh; box-shadow: none; border-radius: 0; padding: 12mm 15mm; } .no-print { display: none !important; } .watermark { display: none; } .qr-section { break-inside: avoid; } .verification-banner { break-inside: avoid; } }
          @media screen and (max-width: 800px) { .invoice-container { width: 100%; min-height: auto; padding: 15px; } .invoice-header { flex-direction: column; align-items: center; text-align: center; } .header-right { margin-top: 8px; text-align: center; } .two-column { grid-template-columns: 1fr; gap: 10px; } .qr-section { flex-direction: column; text-align: center; } .qr-code-container img { width: 120px; height: 120px; } }
        </style>
      </head>
      <body>
        <div class="watermark">MSR</div>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="header-left">
              <div class="logo">🇷🇼 MyScout <span>Rwanda</span></div>
              <div class="subtitle">Rwanda Scouts Association · Official Invoice</div>
            </div>
            <div class="header-right">
              <div class="status-badge">${isApproved ? '✅ APPROVED' : '⏳ PENDING'}</div>
              <div class="invoice-label">OFFICIAL INVOICE</div>
            </div>
          </div>
          <div class="two-column">
            <div class="col">
              <h4>📄 Invoice Information</h4>
              <div class="row"><span class="label">Invoice No:</span><span class="value mono">${payment.invoice}</span></div>
              <div class="row"><span class="label">Reference:</span><span class="value mono">${payment.reference}</span></div>
              <div class="row"><span class="label">Date:</span><span class="value">${currentDate}</span></div>
              <div class="row"><span class="label">Status:</span><span class="value" style="font-weight: 600; ${isApproved ? 'color: #065f46;' : 'color: #92400e;'}">${payment.status || 'Pending'}</span></div>
            </div>
            <div class="col">
              <h4>👤 Member Information</h4>
              <div class="row"><span class="label">Full Name:</span><span class="value">${member.name}</span></div>
              <div class="row"><span class="label">Scout ID:</span><span class="value mono">${member.sin}</span></div>
              <div class="row"><span class="label">District:</span><span class="value">${member.district}</span></div>
              <div class="row"><span class="label">Unit:</span><span class="value">${member.unit}</span></div>
            </div>
          </div>
          <div class="two-column">
            <div class="col">
              <h4>💳 Payment Details</h4>
              <div class="row"><span class="label">Service:</span><span class="value">${payment.service}</span></div>
              <div class="row"><span class="label">Level:</span><span class="value">${payment.level || 'N/A'}</span></div>
              <div class="row"><span class="label">Method:</span><span class="value">${payment.method || 'N/A'}</span></div>
            </div>
            <div class="col">
              <h4>💰 Amount</h4>
              <table class="payment-table">
                <tbody>
                  <tr><td style="border: none; padding: 4px 0; font-size: 12px;">${payment.service}</td><td style="border: none; padding: 4px 0; text-align: right; font-size: 12px;">${(parseFloat(payment.amount) || 0).toLocaleString()} RWF</td></tr>
                  ${payment.isDonation ? `<tr><td style="border: none; padding: 2px 0; font-size: 11px; color: #666;">Donation to RSA</td><td style="border: none; padding: 2px 0; text-align: right; font-size: 11px; color: #666;">${(parseFloat(payment.amount) || 0).toLocaleString()} RWF</td></tr>` : ''}
                  <tr style="border-top: 2px solid #4B2E83;"><td style="padding: 6px 0 0 0; font-weight: bold; font-size: 14px; color: #4B2E83;">TOTAL</td><td style="padding: 6px 0 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #4B2E83;">${(parseFloat(payment.amount) || 0).toLocaleString()} RWF</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="two-column" style="margin-top: 6px;">
            <div class="col" style="border-left-color: #FFC107;">
              <h4>🔐 Verification</h4>
              <div class="row"><span class="label">Status:</span><span class="value" style="font-weight: 700; ${isApproved ? 'color: #065f46;' : 'color: #92400e;'}">${isApproved ? 'VERIFIED ✅' : 'PENDING ⏳'}</span></div>
              <div class="row"><span class="label">Link:</span><span class="value mono" style="font-size: 10px; word-break: break-all;">${verificationUrl}</span></div>
              <div style="margin-top: 6px; font-size: 10px; color: #666;"><i class="fas fa-shield-alt"></i> Scan QR code to verify</div>
            </div>
            <div class="col" style="border-left-color: #FFC107; display: flex; align-items: center; justify-content: center; padding: 8px;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="text-align: center;">
                  <img src="${qrCodeUrl}" alt="QR Code" style="width: 90px; height: 90px; border: 2px solid #4B2E83; border-radius: 6px; padding: 4px; background: white;" />
                  <div style="font-size: 8px; color: #666; margin-top: 2px;">Scan to Verify</div>
                </div>
                <div style="font-size: 10px; color: #555; max-width: 140px;">
                  <strong style="color: #4B2E83;">Verify this invoice</strong>
                  <p style="margin: 2px 0; font-size: 9px;">Scan with any QR reader</p>
                  <p style="margin: 2px 0; font-size: 9px; color: #4B2E83;">msr.rw/verify</p>
                </div>
              </div>
            </div>
          </div>
          <div class="verification-banner">
            <span class="status-text">${isApproved ? '✅ VERIFIED · This invoice was officially issued by MyScout Rwanda' : '⏳ PENDING VERIFICATION · Awaiting approval by RSA Finance'}</span>
            ${isApproved ? `<div class="status-sub"><i class="fas fa-check-circle"></i> Approved by RSA Finance</div>` : ''}
          </div>
          <div class="invoice-footer">
            <p><strong>MyScout Rwanda · Rwanda Scouts Association</strong></p>
            <p>Digitally generated invoice · Verification available via QR code</p>
            <div class="footer-links"><a href="#">${verificationUrl}</a><span>|</span><a href="#">Verify Invoice</a><span>|</span><a href="#">MyScout Rwanda</a></div>
            <p style="margin-top: 4px; font-size: 9px;">© ${new Date().getFullYear()} MyScout Rwanda · All rights reserved</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 16px; padding: 8px;" class="no-print">
          <button onclick="window.print()" style="padding: 10px 32px; background: #4B2E83; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin: 0 6px;">🖨️ Print / PDF</button>
          <button onclick="window.close()" style="padding: 10px 32px; background: #e5e7eb; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin: 0 6px;">✕ Close</button>
        </div>
      </body>
      </html>
    `;
  };

  // ✅ Download Invoice
  const handleDownloadInvoice = async (payment) => {
    try {
      setDownloadingInvoice(true);
      const member = getMemberInfo();
      const html = generateInvoiceHTML(payment, member);
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${payment.invoice || 'payment'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess('✅ Invoice downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Download invoice error:', err);
      setError('Failed to download invoice. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // ✅ View Invoice in new window
  const handleViewInvoice = (payment) => {
    const member = getMemberInfo();
    const html = generateInvoiceHTML(payment, member);
    const newWindow = window.open('', '_blank', 'width=900,height=700');
    newWindow.document.write(html);
    newWindow.document.close();
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleSelectAction = (action) => {
    setSelectedAction(action);
    setError('');
    setSuccess('');
    
    // ✅ Filter payment methods based on selected action
    filterPaymentMethods(action);
    
    if (action.is_donation || action.is_custom_amount) {
      setStatus(`Selected: ${action.name} - Enter amount below`);
      setDonationAmount('');
    } else {
      setStatus(`Selected: ${action.name} - ${(action.amount || 0).toLocaleString()} RWF`);
    }
  };

  // ✅ FIXED: Store the method ID, not the name
  const handlePaymentMethodChange = (e) => {
    const methodId = parseInt(e.target.value);
    console.log('📝 Selected method ID:', methodId);
    if (methodId) {
      setPaymentMethod(methodId);
    } else {
      setPaymentMethod('');
    }
  };

  const handleDateChange = (e) => {
    setPaymentDate(e.target.value);
  };

  const handleDonationChange = (e) => {
    const value = e.target.value;
    if (value === '' || parseInt(value) >= 1000) {
      setDonationAmount(value);
      setError('');
    } else if (value !== '' && parseInt(value) < 1000) {
      setError('Minimum donation is 1,000 RWF');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be less than 5MB');
        return;
      }
      setPaymentFile(file);
      setSuccess('Payment evidence uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // ✅ FIXED: Use ID to find account details
  const getAccountDisplay = () => {
    if (!paymentMethod) {
      return 'Please select a payment method to view account details.';
    }
    
    const methodId = parseInt(paymentMethod);
    const details = accountDetailsData[methodId];
    
    if (!details) {
      return 'No account details available for this payment method.';
    }
    
    return (
      <div>
        <strong>Payment Details</strong>
        <br /><br />
        {Object.entries(details).map(([key, value]) => {
          if (!value) return null;
          if (key === 'name' || key === 'district' || key === 'is_active' || key === 'displayName') return null;
          const label = key.replace(/_/g, ' ').toUpperCase();
          return (
            <div key={key}>
              <strong>{label}:</strong> {value}
            </div>
          );
        })}
      </div>
    );
  };

  const getTotalAmount = () => {
    if (selectedAction?.is_donation || selectedAction?.is_custom_amount) {
      return parseInt(donationAmount) || 0;
    }
    return selectedAction?.amount || 0;
  };

  const calculateTotalAmount = (payments) => {
    return payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  };

  // ============================================
  // SUBMIT PAYMENT
  // ============================================
  const handleSubmitPayment = async () => {
    if (!selectedAction) {
      setError('Please select a service/action first');
      return;
    }

    if ((selectedAction.is_donation || selectedAction.is_custom_amount) && (!donationAmount || parseInt(donationAmount) < 1000)) {
      setError('Please enter a valid amount (minimum 1,000 RWF)');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!paymentDate) {
      setError('Please select a payment date');
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const member = getMemberInfo();
      
      // ✅ Get total amount (handle custom amounts)
      let amount = getTotalAmount();
      
      // ✅ If it's a custom amount, use donationAmount
      if (selectedAction.is_donation || selectedAction.is_custom_amount) {
        amount = parseInt(donationAmount) || 0;
      }
      
      // ✅ Find the selected payment method by id (FIXED)
      const methodId = parseInt(paymentMethod);
      const selectedMethod = paymentMethodsData.find(m => m.id === methodId);
      
      if (!selectedMethod) {
        setError('Please select a valid payment method');
        setIsProcessing(false);
        setLoading(false);
        return;
      }
      
      const methodName = selectedMethod.name;
      const methodDisplayName = selectedMethod.display_name || methodName;

      console.log('📊 Submitting payment:', {
        serviceId: selectedAction.id,
        serviceName: selectedAction.name,
        amount: amount,
        paymentMethod: methodName,
        methodId: methodId,
        sin: member.sin,
        reference: referenceNumber,
        invoice: invoiceNumber,
        isCustomAmount: selectedAction.is_custom_amount || false,
        isDonation: selectedAction.is_donation || false
      });

      // ✅ Create FormData for file upload
      const formData = new FormData();
      formData.append('serviceId', selectedAction.id);
      formData.append('serviceName', selectedAction.name);
      formData.append('serviceLevel', selectedAction.service_level);
      formData.append('serviceCategory', selectedAction.category || 'general');
      formData.append('amount', amount);
      formData.append('paymentMethod', methodName);
      formData.append('paymentDate', paymentDate);
      formData.append('fullName', member.name);
      formData.append('sin', member.sin);
      formData.append('district', member.district);
      formData.append('unit', member.unit);
      formData.append('email', member.email);
      formData.append('phone', member.phone);
      formData.append('userId', member.userId || '');
      formData.append('memberId', member.memberId || '');
      formData.append('reference', referenceNumber);
      formData.append('invoice', invoiceNumber);
      
      if (paymentFile) {
        formData.append('evidence', paymentFile);
      }

      // ✅ Submit payment to backend
      const response = await axios.post(`${API_URL}/payments/create`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        const paymentData = response.data.payment;
        
        // ✅ Create receipt data
        const receipt = {
          reference: referenceNumber,
          invoice: invoiceNumber,
          member: member,
          service: selectedAction,
          method: methodDisplayName,
          date: paymentDate,
          status: paymentData.payment_status || 'Pending Verification',
          amount: amount,
          paymentId: paymentData.id,
          isDonation: selectedAction.is_donation || false,
          isCustomAmount: selectedAction.is_custom_amount || false
        };

        setReceiptData(receipt);
        setShowReceipt(true);
        setShowHistory(true);
        setStatus(`✅ Payment Submitted Successfully! Reference: ${referenceNumber}`);

        // ✅ Add to history
        const newPayment = {
          id: paymentData.id,
          service: selectedAction.name,
          level: selectedAction.service_level,
          amount: amount,
          method: methodDisplayName,
          status: paymentData.payment_status || 'Pending Verification',
          date: paymentDate,
          reference: referenceNumber,
          invoice: invoiceNumber,
          isDonation: selectedAction.is_donation || false,
          isCustomAmount: selectedAction.is_custom_amount || false
        };

        setPaymentHistory(prev => [newPayment, ...prev]);
        setSuccess(`✅ Payment submitted successfully! Reference: ${referenceNumber}`);
        
        // ✅ Generate new numbers for next payment
        generateReferenceNumber();
        generateInvoiceNumber();
        
        setTimeout(() => setSuccess(''), 5000);

      } else {
        setError(response.data?.message || 'Failed to submit payment');
        setStatus('❌ Payment submission failed');
      }

    } catch (err) {
      console.error('❌ Payment submission error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit payment. Please try again.';
      setError(errorMsg);
      setStatus('❌ Payment submission failed');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  // ============================================
  // CLEAR PAYMENT
  // ============================================
  const handleClearPayment = () => {
    setSelectedAction(null);
    setPaymentMethod('');
    setPaymentDate('');
    setPaymentFile(null);
    setDonationAmount('');
    setStatus('Select a payment service below');
    setError('');
    setSuccess('');
    setShowReceipt(false);
    generateReferenceNumber();
    generateInvoiceNumber();
  };

  // ============================================
  // FORMAT HELPERS
  // ============================================
  const getStatusBadgeStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
      case 'pending verification':
        return { background: '#fff3cd', color: '#92400e' };
      case 'completed':
      case 'approved':
        return { background: '#d1fae5', color: '#065f46' };
      case 'failed':
      case 'rejected':
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getRoleIcon = () => {
    switch(userRole) {
      case 'scout': return '🎯';
      case 'unit_leader': return '📋';
      case 'donor': return '🤝';
      case 'district_commissioner': return '🏛️';
      case 'national_commissioner': return '👑';
      default: return '👤';
    }
  };

  const getRoleTitle = () => {
    switch(userRole) {
      case 'scout': return 'Scout Payment';
      case 'unit_leader': return 'Unit Leader Payment';
      case 'donor': return 'Donor Payment';
      case 'district_commissioner': return 'District Commissioner Payment';
      case 'national_commissioner': return 'National Commissioner Payment';
      default: return 'Payment System';
    }
  };

  const getEventIcon = (category) => {
    const icons = {
      'training': 'fa-graduation-cap',
      'community': 'fa-hand-holding-heart',
      'general': 'fa-calendar-check',
      'camp': 'fa-campground',
      'workshop': 'fa-chalkboard-teacher',
      'sports': 'fa-running',
      'certification': 'fa-medal',
      'social': 'fa-users',
      'fundraising': 'fa-hand-holding-usd',
      'environmental': 'fa-leaf',
      'education': 'fa-book',
      'health': 'fa-heartbeat',
      'cultural': 'fa-music',
      'leadership': 'fa-star',
      'adventure': 'fa-mountain',
      'membership': 'fa-id-card',
      'donation': 'fa-hand-holding-heart'
    };
    return icons[category?.toLowerCase()] || 'fa-calendar-check';
  };

  const getEventColor = (category) => {
    const colors = {
      'training': SCOUT_COLORS.purple,
      'community': SCOUT_COLORS.green,
      'general': SCOUT_COLORS.gold,
      'camp': SCOUT_COLORS.green,
      'workshop': SCOUT_COLORS.darkBlue,
      'sports': SCOUT_COLORS.red,
      'certification': SCOUT_COLORS.gold,
      'social': SCOUT_COLORS.purple,
      'fundraising': SCOUT_COLORS.gold,
      'environmental': SCOUT_COLORS.green,
      'education': SCOUT_COLORS.darkBlue,
      'health': SCOUT_COLORS.red,
      'cultural': SCOUT_COLORS.purple,
      'leadership': SCOUT_COLORS.gold,
      'adventure': SCOUT_COLORS.green,
      'membership': SCOUT_COLORS.gold,
      'donation': SCOUT_COLORS.purple
    };
    return colors[category?.toLowerCase()] || SCOUT_COLORS.purple;
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !paymentServices.length) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '1200px', margin: 'auto', padding: '50px', textAlign: 'center' }}>
        <div className="spinner-large"></div>
        <p style={{ marginTop: '20px', color: SCOUT_COLORS.purple }}>Loading payment services...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px', margin: 'auto', padding: '25px' }}>
      
      {/* HEADER */}
      <div className="page-header" style={{ 
        background: `linear-gradient(135deg, ${SCOUT_COLORS.purple}, ${SCOUT_COLORS.darkBlue})`,
        color: 'white', 
        padding: '25px', 
        textAlign: 'center',
        borderRadius: '12px',
        marginBottom: '24px',
        borderBottom: `4px solid ${SCOUT_COLORS.gold}`
      }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>
          {getRoleIcon()} MyScout Rwanda - {getRoleTitle()}
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
          Digital Payment Management System
        </p>
        {user && (
          <div style={{ marginTop: '8px', fontSize: '14px', opacity: 0.8 }}>
            👤 {user.full_name} • {userRole?.replace('_', ' ').toUpperCase()} • 📍 {userDistrict}
          </div>
        )}
      </div>

      {/* ALERTS */}
      {error && (
        <div className="alert alert-error" style={{ 
          background: '#fef2f2', 
          border: `1px solid ${SCOUT_COLORS.red}`, 
          color: SCOUT_COLORS.red,
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-exclamation-circle"></i> {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: SCOUT_COLORS.red, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ 
          background: '#f0fdf4', 
          border: `1px solid ${SCOUT_COLORS.green}`, 
          color: SCOUT_COLORS.green,
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-check-circle"></i> {success}
          <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: SCOUT_COLORS.green, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* PAYMENT SERVICES */}
      {paymentServices.length === 0 ? (
        <div className="card" style={{ 
          background: 'white', 
          padding: '50px', 
          borderRadius: '15px', 
          textAlign: 'center',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: SCOUT_COLORS.gold, display: 'block', marginBottom: '16px' }}></i>
          <h2 style={{ color: SCOUT_COLORS.darkBlue }}>No Payment Services Available</h2>
          <p style={{ color: SCOUT_COLORS.purple }}>
            There are currently no payment services configured in the system.
            <br />
            Please contact the system administrator.
          </p>
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: '20px', color: SCOUT_COLORS.purple }}>
            <i className="fas fa-hand-holding-usd" style={{ color: SCOUT_COLORS.gold }}></i> Select Payment Service
          </h2>

          {/* LEVEL CONTAINER */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '25px',
            marginBottom: '25px'
          }}>
            
            {/* NATIONAL LEVEL */}
            <div className="card" style={{ 
              background: 'white', 
              padding: '25px', 
              borderRadius: '15px', 
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
              borderTop: `4px solid ${SCOUT_COLORS.gold}`
            }}>
              <h2 style={{ textAlign: 'center', color: SCOUT_COLORS.purple, marginTop: 0 }}>
                🌍 National Level
              </h2>
              
              {nationalActions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>No national services available</p>
              ) : (
                nationalActions.map(action => {
                  const color = getEventColor(action.category);
                  const icon = getEventIcon(action.category);
                  const isSelected = selectedAction?.id === action.id;
                  const displayAmount = (action.is_donation || action.is_custom_amount) ? 'Custom Amount' : `${(action.amount || 0).toLocaleString()} RWF`;
                  
                  return (
                    <div
                      key={action.id}
                      className={`action ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectAction(action)}
                      style={{
                        padding: '15px',
                        border: isSelected ? `2px solid ${SCOUT_COLORS.gold}` : '1px solid #ddd',
                        borderRadius: '10px',
                        margin: '10px 0',
                        cursor: 'pointer',
                        background: isSelected ? SCOUT_COLORS.purple : 'white',
                        color: isSelected ? 'white' : '#1f2937',
                        transition: 'all 0.2s ease',
                        borderLeft: isSelected ? `4px solid ${SCOUT_COLORS.gold}` : `4px solid ${color}`
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f8f4ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={`fas ${icon}`} style={{ color: isSelected ? SCOUT_COLORS.gold : color }}></i>
                        {action.name}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <b>{displayAmount}</b>
                        {action.category && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '12px', 
                            background: isSelected ? 'rgba(255,255,255,0.2)' : '#e5e7eb', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            color: isSelected ? 'rgba(255,255,255,0.8)' : '#4b5563'
                          }}>
                            {action.category}
                          </span>
                        )}
                        {(action.is_donation || action.is_custom_amount) && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '12px', 
                            background: isSelected ? 'rgba(255,255,255,0.2)' : '#dbeafe', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            color: isSelected ? 'rgba(255,255,255,0.8)' : '#1e40af'
                          }}>
                            💝 Custom Amount
                          </span>
                        )}
                      </div>
                      {action.description && (
                        <div style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#6b7280', marginTop: '4px' }}>
                          {action.description}
                        </div>
                      )}
                      {action.start_date && (
                        <div style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: '4px' }}>
                          <i className="fas fa-calendar"></i> {new Date(action.start_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* DISTRICT LEVEL */}
            <div className="card" style={{ 
              background: 'white', 
              padding: '25px', 
              borderRadius: '15px', 
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
              borderTop: `4px solid ${SCOUT_COLORS.green}`
            }}>
              <h2 style={{ textAlign: 'center', color: SCOUT_COLORS.purple, marginTop: 0 }}>
                📌 District Level {userDistrict !== 'N/A' ? `- ${userDistrict}` : ''}
              </h2>
              
              {districtActions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>
                  No district events available for {userDistrict !== 'N/A' ? userDistrict : 'your district'}
                </p>
              ) : (
                districtActions.map(action => {
                  const color = getEventColor(action.category);
                  const icon = getEventIcon(action.category);
                  const isSelected = selectedAction?.id === action.id;
                  
                  return (
                    <div
                      key={action.id}
                      className={`action ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectAction(action)}
                      style={{
                        padding: '15px',
                        border: isSelected ? `2px solid ${SCOUT_COLORS.gold}` : '1px solid #ddd',
                        borderRadius: '10px',
                        margin: '10px 0',
                        cursor: 'pointer',
                        background: isSelected ? SCOUT_COLORS.purple : 'white',
                        color: isSelected ? 'white' : '#1f2937',
                        transition: 'all 0.2s ease',
                        borderLeft: isSelected ? `4px solid ${SCOUT_COLORS.gold}` : `4px solid ${color}`
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f8f4ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={`fas ${icon}`} style={{ color: isSelected ? SCOUT_COLORS.gold : color }}></i>
                        {action.name}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <b>{(action.amount || 0).toLocaleString()} RWF</b>
                        {action.category && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '12px', 
                            background: isSelected ? 'rgba(255,255,255,0.2)' : '#e5e7eb', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            color: isSelected ? 'rgba(255,255,255,0.8)' : '#4b5563'
                          }}>
                            {action.category}
                          </span>
                        )}
                      </div>
                      {action.description && (
                        <div style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#6b7280', marginTop: '4px' }}>
                          {action.description}
                        </div>
                      )}
                      {action.start_date && (
                        <div style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: '4px' }}>
                          <i className="fas fa-calendar"></i> {new Date(action.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {action.location && (
                        <div style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: '2px' }}>
                          <i className="fas fa-map-marker-alt"></i> {action.location}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* PAYMENT INFORMATION */}
      {paymentServices.length > 0 && (
        <div className="card" style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          marginBottom: '25px'
        }}>
          <h2 style={{ textAlign: 'center', color: SCOUT_COLORS.purple, marginTop: 0 }}>
            <i className="fas fa-credit-card" style={{ color: SCOUT_COLORS.gold }}></i> Payment Information
          </h2>

          {/* Payment Date */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: SCOUT_COLORS.darkBlue }}>Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={handleDateChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${SCOUT_COLORS.khaki}`,
                fontSize: '14px'
              }}
            />
          </div>

          {/* ✅ Custom Amount Input - For Donation AND Membership */}
          {(selectedAction?.is_donation || selectedAction?.is_custom_amount) && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: SCOUT_COLORS.darkBlue }}>
                <i className="fas fa-hand-holding-heart" style={{ color: SCOUT_COLORS.purple }}></i> 
                Enter Amount (RWF)
              </label>
              <input
                type="number"
                min={selectedAction?.is_donation ? 1000 : 5000}
                placeholder={selectedAction?.is_donation ? "Enter donation amount..." : "Enter membership fee amount..."}
                value={donationAmount}
                onChange={handleDonationChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${SCOUT_COLORS.khaki}`,
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                {selectedAction?.is_donation 
                  ? 'Minimum donation: 1,000 RWF' 
                  : 'Minimum membership fee: 5,000 RWF'}
              </small>
            </div>
          )}

          {/* Summary */}
          <div className="summary" style={{
            background: '#f8f4ff',
            padding: '20px',
            marginTop: '16px',
            borderRadius: '10px',
            border: `1px solid ${SCOUT_COLORS.khaki}`
          }}>
            {selectedAction ? (
              <div>
                <h3 style={{ marginTop: 0, color: SCOUT_COLORS.purple }}>
                  <i className="fas fa-receipt" style={{ color: SCOUT_COLORS.gold }}></i> Payment Summary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><strong>Service:</strong> {selectedAction.name}</div>
                  <div><strong>Level:</strong> {selectedAction.service_level}</div>
                  <div><strong>Category:</strong> {selectedAction.category || 'General'}</div>
                  <div>
                    <strong>Amount:</strong> 
                    <b style={{ color: SCOUT_COLORS.purple, fontSize: '18px' }}>
                      {(selectedAction.is_donation || selectedAction.is_custom_amount) 
                        ? (donationAmount ? `${parseInt(donationAmount).toLocaleString()} RWF` : 'Enter amount')
                        : `${(selectedAction.amount || 0).toLocaleString()} RWF`}
                    </b>
                  </div>
                  <div><strong>Reference:</strong> <span style={{ fontFamily: 'monospace' }}>{referenceNumber}</span></div>
                  <div><strong>Invoice:</strong> <span style={{ fontFamily: 'monospace' }}>{invoiceNumber}</span></div>
                  {selectedAction.location && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Location:</strong> {selectedAction.location}
                    </div>
                  )}
                  {selectedAction.start_date && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Event Date:</strong> {new Date(selectedAction.start_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {selectedAction.description && (
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280', borderTop: `1px solid ${SCOUT_COLORS.khaki}`, paddingTop: '8px' }}>
                    <i className="fas fa-info-circle"></i> {selectedAction.description}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <i className="fas fa-hand-pointer" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: SCOUT_COLORS.gold }}></i>
                Select a payment service above to continue
              </div>
            )}
          </div>

          {/* ✅ FIXED: Payment Method - Use id as value */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: SCOUT_COLORS.darkBlue }}>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              disabled={!selectedAction || filteredPaymentMethods.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${SCOUT_COLORS.khaki}`,
                fontSize: '14px',
                background: (!selectedAction || filteredPaymentMethods.length === 0) ? '#f3f4f6' : 'white',
                cursor: (!selectedAction || filteredPaymentMethods.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">Select Method</option>
              {filteredPaymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.display_name || method.name}
                  {method.district && method.district !== 'all' && method.district !== 'national' && method.district !== '' && (
                    <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '4px' }}>
                      ({method.district} District)
                    </span>
                  )}
                  {(!method.district || method.district === 'all' || method.district === 'national' || method.district === '') && (
                    <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '4px' }}>
                      (National)
                    </span>
                  )}
                  {!method.is_active && (
                    <span style={{ fontSize: '10px', color: '#D32F2F', marginLeft: '4px' }}>
                      (Inactive)
                    </span>
                  )}
                </option>
              ))}
            </select>
            {filteredPaymentMethods.length === 0 && selectedAction && (
              <small style={{ color: SCOUT_COLORS.red, display: 'block', marginTop: '4px' }}>
                No active payment methods available for this service level. Please contact administrator.
              </small>
            )}
          </div>

          {/* Account Details */}
          {paymentMethod && accountDetailsData[parseInt(paymentMethod)] && (
            <div className="summary" style={{
              background: '#f8fafc',
              padding: '20px',
              marginTop: '16px',
              borderRadius: '10px',
              border: `1px solid ${SCOUT_COLORS.khaki}`
            }}>
              {getAccountDisplay()}
            </div>
          )}

          {/* Payment Evidence */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: SCOUT_COLORS.darkBlue }}>
              Payment Evidence (Screenshot/Receipt)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              disabled={!selectedAction || !paymentMethod}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${SCOUT_COLORS.khaki}`,
                fontSize: '14px',
                background: (!selectedAction || !paymentMethod) ? '#f3f4f6' : 'white',
                cursor: (!selectedAction || !paymentMethod) ? 'not-allowed' : 'pointer'
              }}
            />
            {paymentFile && (
              <div style={{ marginTop: '8px', fontSize: '14px', color: SCOUT_COLORS.green, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-check-circle"></i> {paymentFile.name} uploaded
                <button 
                  onClick={() => setPaymentFile(null)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: SCOUT_COLORS.red, cursor: 'pointer' }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handleSubmitPayment}
              disabled={loading || !selectedAction || !paymentMethod || !paymentDate || filteredPaymentMethods.length === 0 || ((selectedAction?.is_donation || selectedAction?.is_custom_amount) && (!donationAmount || parseInt(donationAmount) < 1000))}
              style={{
                flex: 1,
                background: SCOUT_COLORS.purple,
                color: 'white',
                border: 'none',
                padding: '15px 25px',
                borderRadius: '10px',
                cursor: (loading || !selectedAction || !paymentMethod || !paymentDate || filteredPaymentMethods.length === 0 || ((selectedAction?.is_donation || selectedAction?.is_custom_amount) && (!donationAmount || parseInt(donationAmount) < 1000))) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                opacity: (loading || !selectedAction || !paymentMethod || !paymentDate || filteredPaymentMethods.length === 0 || ((selectedAction?.is_donation || selectedAction?.is_custom_amount) && (!donationAmount || parseInt(donationAmount) < 1000))) ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = SCOUT_COLORS.darkBlue;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = SCOUT_COLORS.purple;
                }
              }}
            >
              {loading ? (
                <><span className="spinner-small"></span> Processing...</>
              ) : isProcessing ? (
                <><span className="spinner-small"></span> Submitting...</>
              ) : (
                <><i className="fas fa-check-circle"></i> Confirm Payment</>
              )}
            </button>

            <button
              onClick={handleClearPayment}
              style={{
                padding: '15px 25px',
                background: SCOUT_COLORS.khaki,
                color: '#333',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#b8a87a'}
              onMouseLeave={(e) => e.currentTarget.style.background = SCOUT_COLORS.khaki}
            >
              <i className="fas fa-undo"></i> Clear
            </button>
          </div>

          {/* Status */}
          <div className="status" style={{
            background: status.includes('Successfully') ? '#d1fae5' : status.includes('failed') ? '#fee2e2' : '#fff3cd',
            padding: '15px',
            marginTop: '20px',
            borderRadius: '10px',
            border: `1px solid ${status.includes('Successfully') ? SCOUT_COLORS.green : status.includes('failed') ? SCOUT_COLORS.red : SCOUT_COLORS.gold}`,
            color: status.includes('Successfully') ? SCOUT_COLORS.green : status.includes('failed') ? SCOUT_COLORS.red : '#92400e'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {status.includes('Successfully') ? '✅' : status.includes('failed') ? '❌' : '⏳'}
              <span>{status}</span>
            </div>
          </div>

          {/* RECEIPT */}
          {showReceipt && receiptData && (
            <div className="invoice" style={{
              display: 'block',
              marginTop: '25px',
              padding: '25px',
              background: 'white',
              borderRadius: '15px',
              border: `2px solid ${SCOUT_COLORS.gold}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'center', borderBottom: `2px solid ${SCOUT_COLORS.khaki}`, paddingBottom: '16px', marginBottom: '16px' }}>
                <h2 style={{ color: SCOUT_COLORS.purple, margin: 0 }}>🇷🇼 RSA Digital Payment Receipt</h2>
                <p style={{ color: SCOUT_COLORS.darkBlue, margin: '4px 0 0' }}>Rwanda Scouts Association</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ color: SCOUT_COLORS.purple, borderBottom: `1px solid ${SCOUT_COLORS.khaki}`, paddingBottom: '4px' }}>👤 Member Information</h4>
                  <div><strong>Name:</strong> {receiptData.member.name}</div>
                  <div><strong>SIN:</strong> {receiptData.member.sin}</div>
                  <div><strong>District:</strong> {receiptData.member.district}</div>
                  <div><strong>Unit:</strong> {receiptData.member.unit}</div>
                  <div><strong>Email:</strong> {receiptData.member.email}</div>
                </div>
                <div>
                  <h4 style={{ color: SCOUT_COLORS.purple, borderBottom: `1px solid ${SCOUT_COLORS.khaki}`, paddingBottom: '4px' }}>💳 Payment Information</h4>
                  <div><strong>Invoice:</strong> <span style={{ fontFamily: 'monospace' }}>{receiptData.invoice}</span></div>
                  <div><strong>Reference:</strong> <span style={{ fontFamily: 'monospace' }}>{receiptData.reference}</span></div>
                  <div><strong>Service:</strong> {receiptData.service.name}</div>
                  <div><strong>Level:</strong> {receiptData.service.service_level}</div>
                  <div><strong>Amount:</strong> <b style={{ color: SCOUT_COLORS.purple, fontSize: '18px' }}>{receiptData.amount.toLocaleString()} RWF</b></div>
                  <div><strong>Method:</strong> {receiptData.method}</div>
                  <div><strong>Date:</strong> {receiptData.date}</div>
                  <div><strong>Status:</strong> 
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      padding: '2px 10px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {receiptData.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: `2px solid ${SCOUT_COLORS.khaki}` }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  This receipt is auto-generated by MyScout Rwanda System
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>
                  © {new Date().getFullYear()} Rwanda Scouts Association. All rights reserved.
                </p>
                <button
                  onClick={() => window.print()}
                  style={{
                    marginTop: '12px',
                    padding: '8px 20px',
                    background: SCOUT_COLORS.gold,
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e6b800'}
                  onMouseLeave={(e) => e.currentTarget.style.background = SCOUT_COLORS.gold}
                >
                  🖨️ Print Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAYMENT HISTORY WITH QR CODE INVOICE */}
      {showHistory && paymentHistory.length > 0 && (
        <div className="card" style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          marginBottom: '25px'
        }}>
          <h2 style={{ textAlign: 'center', color: SCOUT_COLORS.purple, marginTop: 0 }}>
            <i className="fas fa-history" style={{ color: SCOUT_COLORS.gold }}></i> Payment History
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '8px' }}>
              ({paymentHistory.length} payments)
            </span>
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '15px',
              fontSize: '13px'
            }}>
              <thead>
                <tr>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>#</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Service</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Level</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Amount</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Method</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Status</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Date</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Reference</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Invoice</th>
                  <th style={{ background: SCOUT_COLORS.purple, color: 'white', padding: '10px', border: `1px solid ${SCOUT_COLORS.purple}` }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => {
                  const isApproved = payment.status?.toLowerCase() === 'approved' || 
                                     payment.status?.toLowerCase() === 'completed';
                  return (
                    <tr key={payment.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>
                        <strong>{payment.service}</strong>
                        {payment.category && (
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            {payment.category}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <span style={{
                          background: payment.level === 'National' ? '#d1fae5' : '#fef3c7',
                          color: payment.level === 'National' ? '#065f46' : '#92400e',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {payment.level || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <b style={{ color: SCOUT_COLORS.purple }}>
                          {(parseFloat(payment.amount) || 0).toLocaleString()} RWF
                        </b>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        {payment.method || 'N/A'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <span style={{
                          background: getStatusBadgeStyle(payment.status).background,
                          color: getStatusBadgeStyle(payment.status).color,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {payment.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontSize: '12px' }}>
                        {payment.date || 'N/A'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontFamily: 'monospace', fontSize: '11px' }}>
                        {payment.reference || 'N/A'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontFamily: 'monospace', fontSize: '11px' }}>
                        {payment.invoice || 'N/A'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        {isApproved ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleViewInvoice(payment)}
                              style={{
                                background: SCOUT_COLORS.purple,
                                color: 'white',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="View Invoice with QR Code"
                            >
                              <i className="fas fa-qrcode"></i> View
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(payment)}
                              disabled={downloadingInvoice}
                              style={{
                                background: SCOUT_COLORS.gold,
                                color: '#333',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                cursor: downloadingInvoice ? 'not-allowed' : 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: downloadingInvoice ? 0.6 : 1
                              }}
                              title="Download Invoice with QR Code"
                            >
                              <i className="fas fa-download"></i> 
                              {downloadingInvoice ? '...' : 'Invoice'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#999' }}>
                            <i className="fas fa-lock"></i> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8f4ff' }}>
                  <td colSpan="3" style={{ padding: '10px', fontWeight: 'bold', textAlign: 'right', color: SCOUT_COLORS.purple }}>
                    Total:
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', textAlign: 'center', color: SCOUT_COLORS.purple, fontSize: '16px' }}>
                    {calculateTotalAmount(paymentHistory).toLocaleString()} RWF
                  </td>
                  <td colSpan="6"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .spinner-small { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid #ffffff; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px; }
        .spinner-large { border: 3px solid #e2e8f0; border-top: 3px solid ${SCOUT_COLORS.purple}; border-radius: 50%; width: 40px; height: 40px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { .level-container { grid-template-columns: 1fr; } table { font-size: 11px; } th, td { padding: 4px 6px !important; } }
        @media print { .header-actions, .alert, .action, .btn-secondary { display: none !important; } .invoice { border: 1px solid #000 !important; box-shadow: none !important; } }
      `}</style>~
    </div>
  );
};

export default PaymentSystem;