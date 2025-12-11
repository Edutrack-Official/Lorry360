

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  User,
  Calendar,
  Search,
  Loader,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from "../api/client";

// Invoice Generator Component with Actual Backend Integration
const InvoiceGenerator = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

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

  const generateInvoice = async (customerId = null) => {
    const customer = customerId || selectedCustomer;
    if (!customer || !fromDate || !toDate) {
      toast.error('Please select customer and date range');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/trips/invoice-data?customer_id=${customer}&from_date=${fromDate}&to_date=${toDate}`);    
      if (res.data.success) {
        setInvoiceData(res.data.data);
        toast.success('Invoice data loaded successfully!');
      } else {
        toast.error(res.data.error || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      if(error.response && error.response.data && error.response.data.error){
        toast.error(error.response.data.error); 
      }
    }
    setLoading(false);
  };

  const downloadPDF = async (invoiceData, customerName = null) => {
    if (!invoiceData) {
      toast.error('No invoice data available');
      return;
    }

    try {
      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default;

      const invoiceContent = `
        <div style="font-family: Arial, sans-serif; color: #000; width: 100%; box-sizing: border-box;">
          <!-- Header Section with Logo on Left -->
          <div style="margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-start;">
            <!-- Left: Logo and Company Name -->
            <div style="display:flex; align-items:center; gap:18px; margin-bottom:8px;">
              ${invoiceData.supplier.logo ? `
                <img 
                  src="${invoiceData.supplier.logo}" 
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
                  ${invoiceData.supplier.name}
                </h1>
                <p style="margin:6px 0 2px 0; font-size:14px; color:#333;">
                  ${invoiceData.supplier.full_address}
                </p>
                <p style="margin:0 0 2px 0; font-size:14px; color:#333;">
                  CONTACT: ${invoiceData.supplier.phone}
                </p>
                ${invoiceData.supplier.gst_number ? `
                  <p style="margin:4px 0 0 0; font-size:14px; color:#333; font-weight:700;">
                    GSTIN: ${invoiceData.supplier.gst_number}
                  </p>
                ` : ''}
              </div>
            </div>
            
            <!-- Right: Invoice Title -->
            <div style="text-align: right;">
              <h2 style="font-size: 32px; font-weight: bold; margin: 0; color: #333;">INVOICE</h2>
            </div>
          </div>

          <!-- Customer and Invoice Details -->
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #000; page-break-inside: avoid;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                  <strong style="font-size: 15px;">To:</strong><br>
                  <span style="font-size: 14px;">${invoiceData.customer.name}</span><br>
                  <span style="font-size: 14px;">${invoiceData.customer.address}</span><br>
                  <strong style="font-size: 14px;">Phone:</strong> <span style="font-size: 14px;">${invoiceData.customer.phone}</span>
                </td>
                <td style="width: 50%; vertical-align: top; text-align: right;">
                  <strong style="font-size: 14px;">Invoice No:</strong> <span style="font-size: 14px;">${invoiceData.invoice_details.invoice_number}</span><br>
                  <strong style="font-size: 14px;">Period:</strong> <span style="font-size: 14px;">${invoiceData.invoice_details.period}</span><br>
                  <strong style="font-size: 14px;">Date:</strong> <span style="font-size: 14px;">${new Date().toLocaleDateString('en-GB')}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Table Section -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <thead style="display: table-header-group;">
              <tr style="background-color: #f8f9fa;">
                ${invoiceData.table_data.headers.map(header => 
                  `<th style="border: 1px solid #000; padding: 10px 8px; text-align: left; font-weight: bold; font-size: 13px;">${header}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${invoiceData.table_data.rows.map((row, index) => `
                <tr style="${row.is_balance_row ? 'background-color: #f0f0f0; font-weight: bold;' : ''} page-break-inside: avoid;">
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.s_no || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.date ? new Date(row.date).toLocaleDateString('en-GB') : ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.particular}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.quantity || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.location || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.price || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.no_of_loads || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.total_amount || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.amount_received || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-weight: bold; font-size: 13px;">${row.balance}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Summary Section -->
          <div style="margin-top: 30px; page-break-inside: avoid; min-height: 150px;">
            <div style="float: right; width: 300px; border: 1px solid #000; padding: 15px; background-color: #f8f9fa;">
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Opening Balance:</strong> ${invoiceData.table_data.summary.opening_balance}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Total Sales:</strong> ${invoiceData.table_data.summary.total_sales_amount}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Total Received:</strong> ${invoiceData.table_data.summary.total_received}</p>
              <p style="margin: 0; font-size: 15px;"><strong>Closing Balance:</strong> <strong>${invoiceData.table_data.summary.closing_balance}</strong></p>
            </div>
            <div style="clear: both;"></div>
          
            <!-- Footer -->
            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 15px; padding-bottom: 15px;">
              <p style="margin: 0; font-size: 13px; color: #666;">Generated on ${new Date().toLocaleDateString('en-GB')} | Thank you for your business!</p>
            </div>
          </div>
        </div>
      `;

      // Create a temporary div to hold the content
      const element = document.createElement('div');
      element.innerHTML = invoiceContent;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Invoice_${customerName || invoiceData.customer.name}_${fromDate}_to_${toDate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape'
        },
        pagebreak: { 
          mode: ['css', 'legacy'],
          avoid: 'tr'
        }
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  };

const generateAllInvoices = async () => {
  if (!fromDate || !toDate) {
    toast.error('Please select date range');
    return;
  }

  if (customers.length === 0) {
    toast.error('No customers found');
    return;
  }

  setLoadingAll(true);
  
  // Calculate filtered customers locally
  const localFilteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );
  
  const customersToProcess = localFilteredCustomers.length > 0 ? localFilteredCustomers : customers;
  
  setCurrentProgress({ current: 0, total: customersToProcess.length });
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < customersToProcess.length; i++) {
    const customer = customersToProcess[i];
    setCurrentProgress({ current: i + 1, total: customersToProcess.length });

    try {
      // Get invoice data for customer
      const res = await api.get(`/trips/invoice-data?customer_id=${customer._id}&from_date=${fromDate}&to_date=${toDate}`);
      
      if (res.data.success && res.data.data) {
        // Generate PDF with customer-specific name
        const pdfSuccess = await downloadPDF(res.data.data, customer.name);
        
        if (pdfSuccess) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }

      // Small delay between customers to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error generating invoice for ${customer.name}:`, error);
      failCount++;
    }
  }

  setLoadingAll(false);
  setCurrentProgress({ current: 0, total: 0 });

  if (successCount > 0) {
    toast.success(`Successfully generated ${successCount} invoice(s)`);
  }
  if (failCount > 0) {
    toast.error(`Failed to generate ${failCount} invoice(s)`);
  }
};

  const resetInvoice = () => {
    setInvoiceData(null);
    setSelectedCustomer('');
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Generator</h1>
          <p className="text-gray-600">Generate invoices from trip data</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetInvoice}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          {invoiceData && (
            <button
              onClick={() => downloadPDF(invoiceData)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Customer Selection & Date Range */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Select Customer
          </h2>
          
          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredCustomers.map(customer => (
              <div
                key={customer._id}
                onClick={() => setSelectedCustomer(customer._id)}
                className={`p-4 border rounded-lg mb-2 cursor-pointer transition-all ${
                  selectedCustomer === customer._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-600">{customer.phone}</p>
                <p className="text-sm text-gray-500 truncate">{customer.address}</p>
                {customer.site_addresses && customer.site_addresses.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Sites: {customer.site_addresses.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date Range & Generate Buttons */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Select Date Range
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Single Customer Invoice Button */}
            <button
              onClick={() => generateInvoice()}
              disabled={loading || !selectedCustomer}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Generating Invoice...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Selected Invoice
                </>
              )}
            </button>

            {/* All Customers Invoice Button */}
            <button
              onClick={generateAllInvoices}
              disabled={loadingAll || !fromDate || !toDate}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loadingAll ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {currentProgress.total > 0 && (
                    <span className="ml-2">
                      Processing {currentProgress.current} of {currentProgress.total}...
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Generate All Invoices
                </>
              )}
            </button>

            {/* Progress Bar for All Invoices */}
            {loadingAll && currentProgress.total > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{currentProgress.current} / {currentProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visible invoice preview */}
      {invoiceData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Invoice Header with Logo on Left */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              {/* Left: Logo + Company Info */}
              <div className="flex items-start gap-4">
                {invoiceData.supplier.logo && (
                  <img
                    src={invoiceData.supplier.logo}
                    alt="Company Logo"
                    className="w-24 h-20 object-contain mt-1"
                  />
                )}
                <div className="leading-tight">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {invoiceData.supplier.name}
                  </h1>
                  <p className="text-gray-600">{invoiceData.supplier.full_address}</p>
                  <p className="text-gray-600">CONTACT: {invoiceData.supplier.phone}</p>
                  {invoiceData.supplier.gst_number && (
                    <p className="text-gray-700 font-semibold mt-1">
                      GSTIN: <span className="font-bold">{invoiceData.supplier.gst_number}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Invoice Title */}
              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-800 tracking-wide">
                  INVOICE
                </h2>
              </div>
            </div>
          </div>

          {/* Customer & Invoice Info */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-600">
                  <p className="font-medium">{invoiceData.customer.name}</p>
                  <p>{invoiceData.customer.address}</p>
                  <p>{invoiceData.customer.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
                <div className="text-gray-600">
                  <p><strong>Invoice No:</strong> {invoiceData.invoice_details.invoice_number}</p>
                  <p><strong>Period:</strong> {invoiceData.invoice_details.period}</p>
                  <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {invoiceData.table_data.headers.map((header, index) => (
                      <th key={index} className="p-3 text-left text-sm font-semibold text-gray-900 border">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.table_data.rows.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`border-b hover:bg-gray-50 ${
                        row.is_balance_row ? 'bg-gray-100 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 border">{row.s_no || ''}</td>
                      <td className="p-3 border">{row.date?new Date(row.date).toLocaleDateString('en-GB')|| '':''}</td>
                      <td className="p-3 border">{row.particular}</td>
                      <td className="p-3 border">{row.quantity || ''}</td>
                      <td className="p-3 border">{row.location || ''}</td>
                      <td className="p-3 border">{row.price || ''}</td>
                      <td className="p-3 border">{row.no_of_loads || ''}</td>
                      <td className="p-3 border font-medium">{row.total_amount || ''}</td>
                      <td className="p-3 border">{row.amount_received || ''}</td>
                      <td className="p-3 border font-semibold">{row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Opening Balance</p>
                <p className="text-xl font-bold text-blue-600">{invoiceData.table_data.summary.opening_balance}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-xl font-bold text-green-600">{invoiceData.table_data.summary.total_sales_amount}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Received</p>
                <p className="text-xl font-bold text-yellow-600">{invoiceData.table_data.summary.total_received}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Closing Balance</p>
                <p className="text-xl font-bold text-purple-600">{invoiceData.table_data.summary.closing_balance}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InvoiceGenerator;