import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  User,
  Calendar,
  Search,
  Loader
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
  const [searchTerm, setSearchTerm] = useState('');

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
      console.log("res", res);
      const customers = res.data.data.customers || [];
      console.log("customers", customers);
      setCustomers(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error fetching customers');
    }
  };

  const generateInvoice = async () => {
    if (!selectedCustomer || !fromDate || !toDate) {
      toast.error('Please select customer and date range');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/trips/invoice-data?customer_id=${selectedCustomer}&from_date=${fromDate}&to_date=${toDate}`);    
      console.log("invoice res", res.data);
      if (res.data.success) {
        console.log("invoice data", res.data.data);
        setInvoiceData(res.data.data);
        toast.success('Invoice data loaded successfully!');
      } else {
        toast.error(res.data.error || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Error generating invoice');
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    if (!invoiceData) {
      toast.error('No invoice data available');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download PDF');
      return;
    }

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoice_details.invoice_number}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #000;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #000;
          }
          .address { 
            margin-bottom: 5px; 
            color: #333;
          }
          .contact { 
            margin-bottom: 20px; 
            color: #333;
          }
          .info-section { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #000;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #f8f9fa; 
            font-weight: bold;
          }
          .summary { 
            float: right; 
            width: 300px; 
            border: 1px solid #000;
            padding: 20px;
            margin-top: 20px;
          }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            border-top: 1px solid #000;
            padding-top: 20px;
          }
          .balance-row { 
            background-color: #f0f0f0; 
            font-weight: bold; 
          }
          @media print {
            body { margin: 0; }
            .header { margin-bottom: 20px; }
            .info-section { margin-bottom: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${invoiceData.supplier.name}</div>
          <div class="address">${invoiceData.supplier.full_address}</div>
          <div class="contact">CONTACT: ${invoiceData.supplier.phone}</div>
        </div>

        <div class="info-section">
          <div>
            <strong>To:</strong><br>
            ${invoiceData.customer.name}<br>
            ${invoiceData.customer.address}<br>
            <strong>Phone:</strong> ${invoiceData.customer.phone}
          </div>
          <div style="text-align: right;">
            <strong>Invoice No:</strong> ${invoiceData.invoice_details.invoice_number}<br>
            <strong>Period:</strong> ${invoiceData.invoice_details.period}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString()}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${invoiceData.table_data.headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${invoiceData.table_data.rows.map(row => `
              <tr class="${row.is_balance_row ? 'balance-row' : ''}">
                <td>${row.s_no || ''}</td>
                <td>${row.date || ''}</td>
                <td>${row.particular}</td>
                <td>${row.quantity || ''}</td>
                <td>${row.location || ''}</td>
                <td>${row.price || ''}</td>
                <td>${row.no_of_loads || ''}</td>
                <td>${row.total_amount || ''}</td>
                <td>${row.amount_received || ''}</td>
                <td>${row.balance}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <p><strong>Opening Balance:</strong> ${invoiceData.table_data.summary.opening_balance}</p>
          <p><strong>Total Sales:</strong> ${invoiceData.table_data.summary.total_sales_amount}</p>
          <p><strong>Total Received:</strong> ${invoiceData.table_data.summary.total_received}</p>
          <p><strong>Closing Balance:</strong> ${invoiceData.table_data.summary.closing_balance}</p>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} | Thank you for your business!</p>
        </div>

        <script>
          // Auto-print and close after a short delay
          setTimeout(() => {
            window.print();
            setTimeout(() => {
              window.close();
            }, 500);
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    
    toast.success('PDF generated successfully!');
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
          <h1 className="text-2xl font-bold text-gray-900">Building Materials Invoice Generator</h1>
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
              onClick={downloadPDF}
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

        {/* Date Range & Generate Button */}
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

            <button
              onClick={generateInvoice}
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
                  Generate Invoice
                </>
              )}
            </button>
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
          {/* Invoice Header */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {invoiceData.supplier.name}
            </h1>
            <p className="text-gray-600 mb-1">{invoiceData.supplier.full_address}</p>
            <p className="text-gray-600">CONTACT: {invoiceData.supplier.phone}</p>
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
                      <td className="p-3 border">{row.date || ''}</td>
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