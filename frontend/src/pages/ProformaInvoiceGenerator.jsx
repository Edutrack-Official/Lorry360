import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  User,
  Plus,
  Trash2,
  Search,
  MapPin,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from "../api/client";
import { useAuth } from '../contexts/AuthContext';

const ProformaInvoiceGenerator = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchCustomers();
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setInvoiceNumber(`P-${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentTerms('Weekly payment terms. Payment due within 7 days of invoice date.');
    setNotes('This is a proforma invoice and not a demand for payment. Prices are subject to change without prior notice. Valid for 15 days from the date of issue.');
  }, []);

  const getCompanyDetails = () => {
    if (!user) return {};
    return {
      name: user.company_name,
      address: user.address,
      phone: user.phone,
      email: user.email,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      website: user.website || 'www.yourcompany.com'
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
      // Import html2pdf dynamically - handle both default and named exports
      const module = await import('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
      const html2pdf = module.default || window.html2pdf;

      const proformaContent = `
        <div style="font-family: 'Arial', sans-serif; color: #000; padding: 15px; box-sizing: border-box; background: #fff;">
          <!-- Header Section -->
          <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 12px;">
            <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">${companyDetails.name}</h1>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #000;">${companyDetails.address}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #000;">${companyDetails.city}${companyDetails.state ? ', ' + companyDetails.state : ''}${companyDetails.pincode ? ' - ' + companyDetails.pincode : ''}</p>
            <p style="margin: 0; font-size: 14px; color: #000;">CONTACT: ${companyDetails.phone} | EMAIL: ${companyDetails.email}</p>
          </div>

          <div style="text-align: center; margin-bottom: 15px; padding: 8px; border: 2px solid #000;">
            <h2 style="font-size: 20px; font-weight: bold; margin: 0; color: #000; letter-spacing: 1px;">PROFORMA INVOICE</h2>
          </div>

          <!-- Customer and Invoice Details -->
          <table style="width: 100%; margin-bottom: 15px; border: 1px solid #000;">
            <tr>
              <td style="width: 55%; vertical-align: top; padding: 12px; border-right: 1px solid #000;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #000;">BILL TO:</p>
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${customerDetails.name}</p>
                ${customerDetails.address ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #000;">${customerDetails.address}</p>` : ''}
                ${customerDetails.phone ? `<p style="margin: 0; font-size: 13px; color: #000;"><strong>Phone:</strong> ${customerDetails.phone}</p>` : ''}
                ${siteAddress ? `<p style="margin: 8px 0 0 0; font-size: 13px; font-weight: bold; color: #000;">SITE ADDRESS:</p><p style="margin: 2px 0 0 0; font-size: 13px; color: #000;">${siteAddress}</p>` : ''}
              </td>
              <td style="width: 45%; vertical-align: top; padding: 12px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; font-weight: bold; color: #000;">Invoice No:</td>
                    <td style="padding: 4px 0; font-size: 13px; text-align: right;">${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; font-weight: bold; color: #000;">Date:</td>
                    <td style="padding: 4px 0; font-size: 13px; text-align: right;">${new Date(invoiceDate).toLocaleDateString('en-GB')}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
            <thead style="display: table-header-group;">
              <tr>
                <th style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold; width: 8%; background: #fff;">S.No</th>
                <th style="border: 1px solid #000; padding: 10px 8px; text-align: left; font-size: 13px; font-weight: bold; width: 32%; background: #fff;">Description</th>
                <th style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold; width: 12%; background: #fff;">Quantity</th>
                <th style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold; width: 12%; background: #fff;">Unit</th>
                <th style="border: 1px solid #000; padding: 10px 8px; text-align: right; font-size: 13px; font-weight: bold; width: 18%; background: #fff;">Rate (₹)</th>
                <th style="border: 1px solid #000; padding: 10px 8px; text-align: right; font-size: 13px; font-weight: bold; width: 18%; background: #fff;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceItems.map((item, index) => `
                <tr style="page-break-inside: avoid; break-inside: avoid;">
                  <td style="border: 1px solid #000; padding: 9px 8px; text-align: center; font-size: 13px;">${index + 1}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${item.description}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; text-align: center; font-size: 13px;">${item.quantity}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; text-align: center; font-size: 13px;">${item.unit}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; text-align: right; font-size: 13px;">${formatIndianCurrency(item.rate)}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; text-align: right; font-size: 13px; font-weight: bold;">${formatIndianCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              <tr style="page-break-inside: avoid; break-inside: avoid;">
                <td colspan="5" style="border: 1px solid #000; padding: 10px 8px; text-align: right; font-size: 14px; font-weight: bold; background: #fff;">TOTAL:</td>
                <td style="border: 1px solid #000; padding: 10px 8px; text-align: right; font-size: 14px; font-weight: bold; background: #fff;">₹${formatIndianCurrency(calculateSubtotal())}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-bottom: 15px;"></div>

          <!-- Payment Terms -->
          ${paymentTerms ? `
            <div style="margin-top: 15px; page-break-inside: avoid; break-inside: avoid; padding: 12px; border: 1px solid #000;" class="keep-together">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #000;">PAYMENT TERMS:</p>
              <p style="margin: 0; font-size: 13px; color: #000; line-height: 1.6;">${paymentTerms.split('\n').filter(line => line.trim()).map(line => line.trim()).join('<br>')}</p>
            </div>
          ` : ''}

          <!-- Notes -->
          ${notes ? `
            <div style="margin-top: 12px; page-break-inside: avoid; break-inside: avoid; padding: 12px; border: 1px dashed #000;" class="keep-together">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #000;">NOTES:</p>
              <p style="margin: 0; font-size: 13px; color: #000; line-height: 1.6;">${notes.split('\n').filter(line => line.trim()).map(line => line.trim()).join('<br>')}</p>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="margin-top: 25px; text-align: center; border-top: 1px solid #000; padding-top: 12px;">
            <p style="margin: 0; font-size: 12px; color: #000;">For any queries, please contact: ${companyDetails.phone} | ${companyDetails.email}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #000;">Thank you for your business!</p>
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
      
      toast.success('Proforma Invoice PDF downloaded successfully!');
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
    setPaymentTerms('50% advance payment, 50% before delivery.');
    setNotes('This is a proforma invoice and not a demand for payment. Prices are subject to change without prior notice. Valid for 15 days from the date of issue.');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proforma Invoice Generator</h1>
          <p className="text-gray-600">Generate proforma invoices for customer estimates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={downloadProformaPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Proforma
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Customer Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!useCustomCustomer}
                  onChange={() => setUseCustomCustomer(false)}
                  className="text-blue-600"
                />
                Select Existing Customer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={useCustomCustomer}
                  onChange={() => setUseCustomCustomer(true)}
                  className="text-blue-600"
                />
                Enter Custom Customer
              </label>
            </div>

            {!useCustomCustomer ? (
              <>
                {/* Search Box */}
                <div className="relative">
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
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customCustomer.name}
                    onChange={(e) => setCustomCustomer({...customCustomer, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={customCustomer.address}
                    onChange={(e) => setCustomCustomer({...customCustomer, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter customer address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={customCustomer.phone}
                    onChange={(e) => setCustomCustomer({...customCustomer, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer phone"
                  />
                </div>
              </div>
            )}

            {/* Site Address Section - Common for both customer types */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Site Address (Optional)
              </h3>
              <textarea
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter site/project address where goods/services will be delivered"
              />
              <p className="text-sm text-gray-500 mt-2">
                This will appear separately from the customer's address on the invoice
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Invoice Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-blue-800 text-center">
                Subtotal: ₹{calculateSubtotal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Items Details</h2>
          <button
            onClick={addInvoiceItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {invoiceItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Item description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateInvoiceItem(item.id, 'unit', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate (₹)
                </label>
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="text"
                  value={item.amount.toFixed(2)}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div className="flex justify-center">
                {invoiceItems.length > 1 && (
                  <button
                    onClick={() => removeInvoiceItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes and Payment Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Terms */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms (Optional)</h2>
          <textarea
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter payment terms (e.g., 50% advance, 50% before delivery, Net 30 days, etc.)"
          />
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter additional notes, terms and conditions, validity period, etc."
          />
        </div>
      </div>
    </div>
  );
};

export default ProformaInvoiceGenerator;