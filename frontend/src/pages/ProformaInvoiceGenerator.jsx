
import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  User,
  Plus,
  Trash2,
  Search,
  MapPin,
  Loader,
  Building,
  Calendar,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from "../api/client";
import { useAuth } from '../contexts/AuthContext';

const ProformaInvoiceGenerator = () => {
  const { user, token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [useCustomCustomer, setUseCustomCustomer] = useState(false);
  const [customCustomer, setCustomCustomer] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [siteAddress, setSiteAddress] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: '', quantity: 1, unit: '', rate: 0, amount: 0 }
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyDetails, setCompanyDetails] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch complete user details with logo
  useEffect(() => {
    const fetchUserWithLogo = async () => {
      try {
        setLoadingUser(true);
        
        if (user?.userId && token) {
          const response = await api.get(`/users/${user.userId}`);
          
          if (response.data.success) {
            const userData = response.data.data;
            setCompanyLogo(userData.logo || '');
            setCompanyDetails({
              name: userData.company_name || userData.name,
              address: userData.address,
              phone: userData.phone,
              email: userData.email,
              city: userData.city,
              state: userData.state,
              pincode: userData.pincode,
              website: userData.website || '',
              logo: userData.logo || '',
              gst_number: userData.gst_number || ''
            });
            console.log('Fetched user details:', userData);
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to load company details');
        
        // Fallback to basic user info from context
        if (user) {
          setCompanyDetails({
            name: user.company_name || user.name,
            address: user.address || '',
            phone: user.phone || '',
            email: user.email || '',
            city: user.city || '',
            state: user.state || '',
            pincode: user.pincode || '',
            logo: user.logo || '',
            gst_number: user.gst_number || ''
          });
          setCompanyLogo(user.logo || '');
        }
      } finally {
        setLoadingUser(false);
      }
    };

    if (user?.userId && token) {
      fetchUserWithLogo();
    } else if (user) {
      // Use context user data if no token
      setCompanyDetails({
        name: user.company_name || user.name,
        address: user.address || '',
        phone: user.phone || '',
        email: user.email || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        logo: user.logo || '',
        gst_number: user.gst_number || ''
      });
      setCompanyLogo(user.logo || '');
      setLoadingUser(false);
    }
  }, [user, token]);

  // Initialize form and fetch customers
  useEffect(() => {
    fetchCustomers();
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setInvoiceNumber(`P-${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentTerms('50% advance payment, 50% before delivery.');
    setNotes('This is a proforma invoice and not a demand for payment. Prices are subject to change without prior notice. Valid for 15 days from the date of issue.');
  }, []);

  const getCompanyDetails = () => {
    if (Object.keys(companyDetails).length > 0) {
      return companyDetails;
    }
    
    if (!user) return {};
    return {
      name: user.company_name || user.name,
      address: user.address,
      phone: user.phone,
      email: user.email,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      website: user.website || '',
      logo: user.logo || '',
      gst_number: user.gst_number || ''
    };
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers`);
      const customers = res.data.data.customers || [];
      setCustomers(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error fetching customers');
    }
  };

  useEffect(() => {
    const updatedItems = invoiceItems.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));
    setInvoiceItems(updatedItems);
  }, [invoiceItems.map(item => `${item.quantity}-${item.rate}`).join(',')]);

  const addInvoiceItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unit: '',
      rate: 0,
      amount: 0
    };
    setInvoiceItems([newItem, ...invoiceItems]);
  };

  const removeInvoiceItem = (id) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateInvoiceItem = (id, field, value) => {
    const updatedItems = invoiceItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setInvoiceItems(updatedItems);
  };

  const getSelectedCustomerDetails = () => {
    if (useCustomCustomer) {
      return customCustomer;
    }
    return customers.find(customer => customer._id === selectedCustomer) || {};
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const downloadProformaPDF = async () => {
    const customerDetails = getSelectedCustomerDetails();
    const companyDetails = getCompanyDetails();

    if ((!selectedCustomer && !useCustomCustomer) || !customerDetails.name) {
      toast.error('Please select or enter customer details');
      return;
    }

    if (invoiceItems.some(item => !item.description || item.amount === 0)) {
      toast.error('Please fill all item details');
      return;
    }

    setDownloading(true);

    // Helper function to format numbers with commas (Indian numbering system)
    const formatIndianCurrency = (num) => {
      const n = num.toFixed(2);
      const [integer, decimal] = n.split('.');
      const lastThree = integer.substring(integer.length - 3);
      const otherNumbers = integer.substring(0, integer.length - 3);
      const formatted = otherNumbers !== '' ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
      return formatted + '.' + decimal;
    };

    try {
      // Import html2pdf dynamically
      const module = await import('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
      const html2pdf = module.default || window.html2pdf;
const proformaContent = `
<div style="
  font-family: Arial, sans-serif;
  color: #000;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 18px;
  background: #fff;
">  <!-- Header Section -->
  <div style="margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-start;">
    <!-- Left: Logo and Company Name -->
    <div style="display:flex; align-items:center; gap:18px; margin-bottom:8px;">
      ${companyDetails?.logo ? `
        <img 
          src="${companyDetails.logo}" 
          alt="Company Logo"
          crossorigin="anonymous"
          style="
            width:90px;
            height:70px;
            object-fit:contain;
            object-position: center top;
            display:block;
          "
        />
      ` : ''}

      <div style="line-height:1.25;">
        <h1 style="margin:0; font-size:26px; font-weight:700;">
          ${companyDetails.name}
        </h1>
        <p style="margin:6px 0 2px 0; font-size:14px; color:#333;">
          ${companyDetails.address}
        </p>
        ${companyDetails.city || companyDetails.state || companyDetails.pincode ? `
          <p style="margin:2px 0; font-size:14px; color:#333;">
            ${companyDetails.city || ''}${companyDetails.state ? ', ' + companyDetails.state : ''}${companyDetails.pincode ? ' - ' + companyDetails.pincode : ''}
          </p>
        ` : ''}
        <p style="margin:0 0 2px 0; font-size:14px; color:#333;">
          CONTACT: ${companyDetails.phone} ${companyDetails.email ? '| EMAIL: ' + companyDetails.email : ''}
        </p>
        ${companyDetails.gst_number ? `
          <p style="margin:4px 0 0 0; font-size:14px; color:#333; font-weight:700;">
            GSTIN: ${companyDetails.gst_number}
          </p>
        ` : ''}
      </div>
    </div>
  </div>

  <!-- Proforma Invoice Title - Centered below company info -->
  <div style="text-align: center; margin: 15px 0 20px 0; padding: 8px; border: 2px solid #000; page-break-inside: avoid;">
    <h2 style="font-size: 20px; font-weight: bold; margin: 0; color: #000; letter-spacing: 1px;">PROFORMA INVOICE</h2>
  </div>

  <!-- Customer and Invoice Details -->
  <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #000; page-break-inside: avoid;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="width: 60%; vertical-align: top; padding-right: 20px;">
          <strong style="font-size: 15px;">BILL TO:</strong><br>
          <span style="font-size: 14px; font-weight: bold;">${customerDetails.name}</span><br>
          ${customerDetails.address ? `<span style="font-size: 14px;">${customerDetails.address}</span><br>` : ''}
          ${customerDetails.phone ? `<strong style="font-size: 14px;">Phone:</strong> <span style="font-size: 14px;">${customerDetails.phone}</span><br>` : ''}
          ${siteAddress ? `
            <div style="margin-top: 10px;">
              <strong style="font-size: 14px;">SITE ADDRESS:</strong><br>
              <span style="font-size: 14px;">${siteAddress}</span>
            </div>
          ` : ''}
        </td>
        <td style="width: 40%; vertical-align: top; text-align: right;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; font-size: 14px; font-weight: bold; color: #000; text-align: right;">Invoice No: ${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0 4px 0; font-size: 14px; font-weight: bold; color: #000; text-align: right;">Date: ${new Date(invoiceDate).toLocaleDateString('en-GB')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead style="display: table-header-group;">
      <tr style="background-color: #f8f9fa;">
        <th style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-weight: bold; font-size: 13px; width: 8%;">S.No</th>
        <th style="border: 1px solid #000; padding: 10px 8px; text-align: left; font-weight: bold; font-size: 13px; width: 32%;">Description</th>
        <th style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-weight: bold; font-size: 13px; width: 12%;">Quantity</th>
        <th style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-weight: bold; font-size: 13px; width: 12%;">Unit</th>
        <th style="border: 1px solid #000; padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px; width: 18%;">Rate (₹)</th>
        <th style="border: 1px solid #000; padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px; width: 18%;">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${invoiceItems.map((item, index) => `
        <tr style="page-break-inside: avoid;">
          <td style="border: 1px solid #000; padding: 9px 8px; text-align: center; font-size: 13px;">${index + 1}</td>
          <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${item.description}</td>
          <td style="border: 1px solid #000; padding: 9px 8px; text-align: center; font-size: 13px;">${item.quantity}</td>
          <td style="border: 1px solid #000; padding: 9px 8px; text-align: center; font-size: 13px;">${item.unit}</td>
          <td style="border: 1px solid #000; padding: 9px 8px; text-align: right; font-size: 13px;">${formatIndianCurrency(item.rate)}</td>
          <td style="border: 1px solid #000; padding: 9px 8px; text-align: right; font-size: 13px; font-weight: bold;">${formatIndianCurrency(item.amount)}</td>
        </tr>
      `).join('')}
      <tr style="page-break-inside: avoid;">
        <td colspan="5" style="border: 1px solid #000; padding: 10px 8px; text-align: right; font-size: 14px; font-weight: bold; background: #f8f9fa;">TOTAL:</td>
        <td style="border: 1px solid #000; padding: 10px 8px; text-align: right; font-size: 14px; font-weight: bold; background: #f8f9fa;">₹${formatIndianCurrency(calculateSubtotal())}</td>
      </tr>
    </tbody>
  </table>

  <!-- Payment Terms -->
  ${paymentTerms ? `
    <div style="margin-top: 30px; page-break-inside: avoid; min-height: 150px;">
      <div style="padding: 12px; border: 1px solid #000;" class="keep-together">
        <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #000;">PAYMENT TERMS:</p>
        <p style="margin: 0; font-size: 13px; color: #000; line-height: 1.6;">${paymentTerms.split('\n').filter(line => line.trim()).map(line => line.trim()).join('<br>')}</p>
      </div>
  ` : ''}

  <!-- Notes -->
  ${notes ? `
    <div style="margin-top: 12px; page-break-inside: avoid; padding: 12px; border: 1px dashed #000;" class="keep-together">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #000;">NOTES:</p>
      <p style="margin: 0; font-size: 13px; color: #000; line-height: 1.6;">${notes.split('\n').filter(line => line.trim()).map(line => line.trim()).join('<br>')}</p>
    </div>
  ` : ''}

  <!-- Footer -->
  <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 15px; padding-bottom: 15px; page-break-inside: avoid;">
    <p style="margin: 0; font-size: 13px; color: #666;">For any queries, please contact: ${companyDetails.phone} ${companyDetails.email ? '| ' + companyDetails.email : ''}</p>
    <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Thank you for your business!</p>
  </div>
</div>
`;
      // Create a temporary div to hold the content
      const element = document.createElement('div');
      element.innerHTML = proformaContent;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Proforma_Invoice_${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: 'tr'
        }
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();

      toast.success('Proforma Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setUseCustomCustomer(false);
    setCustomCustomer({ name: '', address: '', phone: '' });
    setSiteAddress('');
    setInvoiceItems([{ id: 1, description: '', quantity: 1, unit: '', rate: 0, amount: 0 }]);
    setInvoiceNumber(`P-${Math.floor(1000 + Math.random() * 9000)}`);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setPaymentTerms('50% advance payment, 50% before delivery.');
    setNotes('This is a proforma invoice and not a demand for payment. Prices are subject to change without prior notice. Valid for 15 days from the date of issue.');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header with Enhanced Styling */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Proforma Invoice Generator
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600 ml-8 sm:ml-9 lg:ml-10">
                Generate professional proforma invoices with company branding
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={resetForm}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={downloadProformaPDF}
                disabled={downloading || loadingUser}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
              >
                {downloading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Generating PDF...</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download Proforma</span>
                    <span className="sm:hidden">Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>



        {/* Customer & Invoice Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Customer Selection Card */}
          <section className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                Customer Information
              </h2>

              <div className="space-y-4">
                {/* Radio Selection - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!useCustomCustomer}
                      onChange={() => setUseCustomCustomer(false)}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm sm:text-base">Select Existing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={useCustomCustomer}
                      onChange={() => setUseCustomCustomer(true)}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm sm:text-base">Enter Custom</span>
                  </label>
                </div>

                {!useCustomCustomer ? (
                  <div className="space-y-3">
                    {/* Search Box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      />
                    </div>

                    {/* Customer List - Scrollable */}
                    <div className="max-h-48 sm:max-h-60 overflow-y-auto space-y-2">
                      {filteredCustomers.map(customer => (
                        <button
                          key={customer._id}
                          onClick={() => setSelectedCustomer(customer._id)}
                          className={`w-full text-left p-3 sm:p-4 border rounded-lg transition-all ${selectedCustomer === customer._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                            {customer.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {customer.phone}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                            {customer.address}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={customCustomer.name}
                        onChange={(e) => setCustomCustomer({ ...customCustomer, name: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Address
                      </label>
                      <textarea
                        value={customCustomer.address}
                        onChange={(e) => setCustomCustomer({ ...customCustomer, address: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
                        rows="3"
                        placeholder="Enter customer address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={customCustomer.phone}
                        onChange={(e) => setCustomCustomer({ ...customCustomer, phone: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        placeholder="Enter customer phone"
                      />
                    </div>
                  </div>
                )}

                {/* Site Address Section */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    Site Address (Optional)
                  </h3>
                  <textarea
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
                    rows="3"
                    placeholder="Enter site/project address where goods/services will be delivered"
                  />
             
                </div>
              </div>
            </div>
          </section>

          {/* Invoice Details Card */}
          <section className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                Invoice Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="Enter invoice number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-base sm:text-lg font-semibold text-blue-800 text-center">
                    Subtotal: ₹{calculateSubtotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Invoice Items Section */}
        <section className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Items Details
              </h2>
              <button
                onClick={addInvoiceItem}
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {invoiceItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 border border-gray-200 rounded-lg space-y-3 hover:border-gray-300 transition-colors"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    {/* Description - Full width on mobile */}
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        placeholder="Item description"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        min="1"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateInvoiceItem(item.id, 'unit', e.target.value)}
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        placeholder="Unit"
                      />
                    </div>

                    {/* Rate */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                        Amount (₹)
                      </label>
                      <input
                        type="text"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="flex items-end">
                      {invoiceItems.length > 1 && (
                        <button
                          onClick={() => removeInvoiceItem(item.id)}
                          className="w-full sm:w-auto px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sm:hidden text-sm">Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Terms & Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Payment Terms */}
          <section className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                Payment Terms (Optional)
              </h2>
              <textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
                rows="4"
                placeholder="Enter payment terms (e.g., 50% advance, 50% before delivery, Net 30 days, etc.)"
              />
            </div>
          </section>

          {/* Notes */}
          <section className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                Notes (Optional)
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
                rows="4"
                placeholder="Enter additional notes, terms and conditions, validity period, etc."
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProformaInvoiceGenerator;